"""Relevé chiffré du site, pour la page d'audit du propriétaire.

Les comptes viennent de SQLite. Les fiches viennent du disque : c'est la
source de vérité. Les deux sont comparés pour signaler les écarts.
"""

import shutil
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

from flask import current_app
from sqlalchemy.engine.url import make_url

from database.model import User
from utils.dir import child_dir, list_names
from utils.etoiles import classement
from utils.files import read_metadata
from utils.json_utils import load_json_object
from utils.presence import resume_sessions, _iso, _maintenant
from utils.security import EXTENSIONS_AUTORISEES, is_uuid, project_dir, upload_path


ORDRE_CLASSE = {"2nd": 0, "1ere": 1, "term": 2}


def _taille_dossier(racine):
    total = 0
    fichiers = 0
    racine = Path(racine)
    if not racine.is_dir():
        return 0, 0
    for chemin in racine.rglob("*"):
        if chemin.is_symlink() or not chemin.is_file():
            continue
        try:
            total += chemin.stat().st_size
            fichiers += 1
        except OSError:
            continue
    return total, fichiers


def _taille_base():
    uri = current_app.config.get("SQLALCHEMY_DATABASE_URI") or ""
    try:
        url = make_url(uri)
    except Exception:
        return 0
    if url.drivername != "sqlite" or not url.database:
        return 0
    chemin = Path(url.database)
    if not chemin.is_file():
        chemin = Path(current_app.instance_path) / url.database
    if not chemin.is_file():
        return 0
    try:
        return chemin.stat().st_size
    except OSError:
        return 0


def _naive(moment):
    if moment is None:
        return None
    if moment.tzinfo is not None:
        return moment.astimezone(timezone.utc).replace(tzinfo=None)
    return moment


def _compte(user):
    moment = _naive(user.created_at) if user is not None else None
    if moment is None:
        return None
    return {"username": user.username, "le": _iso(moment)}


def _parcourir():
    """Fiches, cours vides et compteurs d'arborescence."""
    base = project_dir("matiere")
    fiches = []
    invalides = 0
    doublons = defaultdict(int)
    vides = []
    classes = 0
    specialites = 0
    matieres = list_names(base, "dir")

    for matiere in matieres:
        dossier_matiere = child_dir(base, matiere)
        if dossier_matiere is None:
            continue
        for classe in list_names(dossier_matiere, "dir"):
            dossier_classe = child_dir(dossier_matiere, classe)
            if dossier_classe is None:
                continue
            classes += 1
            for specialite in list_names(dossier_classe, "dir"):
                dossier = child_dir(dossier_classe, specialite)
                if dossier is None:
                    continue
                specialites += 1
                jsons = [nom for nom in list_names(dossier, "file") if nom.endswith(".json")]
                if not jsons:
                    vides.append({
                        "matiere": matiere,
                        "classe": classe,
                        "specialite": specialite,
                    })
                for nom in jsons:
                    file_id = nom[: -len(".json")]
                    if not is_uuid(file_id):
                        invalides += 1
                        continue
                    chemin_json = dossier / nom
                    meta = read_metadata(chemin_json)
                    if meta is None or meta.get("id") != file_id:
                        invalides += 1
                        continue
                    doublons[file_id] += 1
                    stocke = meta.get("filename") if isinstance(meta.get("filename"), str) else ""
                    chemin_fichier = upload_path(stocke) if stocke else None
                    present = (
                        chemin_fichier is not None
                        and chemin_fichier.is_file()
                        and not chemin_fichier.is_symlink()
                    )
                    try:
                        octets = chemin_fichier.stat().st_size if present else 0
                        horodatage = chemin_fichier.stat().st_mtime if present else chemin_json.stat().st_mtime
                    except OSError:
                        octets = 0
                        horodatage = 0
                    brut = load_json_object(chemin_json) or {}
                    fiches.append({
                        "id": file_id,
                        "titre": brut.get("title") if isinstance(brut.get("title"), str) else "",
                        "auteur": brut.get("author") if isinstance(brut.get("author"), str) else "",
                        "matiere": matiere,
                        "classe": classe,
                        "specialite": specialite,
                        "stocke": stocke if present else "",
                        "present": present,
                        "octets": octets,
                        "extension": Path(str(brut.get("original_filename") or stocke)).suffix.lower() or "(aucune)",
                        "le": _iso(datetime.fromtimestamp(horodatage, timezone.utc).replace(tzinfo=None)) if horodatage else None,
                    })

    ids_doublons = sum(1 for nombre in doublons.values() if nombre > 1)
    return {
        "matieres": len(matieres),
        "classes": classes,
        "specialites": specialites,
        "fiches": fiches,
        "invalides": invalides,
        "doublons": ids_doublons,
        "vides": vides,
    }


def _mesurer_uploads(references):
    base = project_dir("uploads")
    total = 0
    nombre = 0
    orphelins = []
    if not base.is_dir():
        return 0, 0, 0, []
    for entree in base.iterdir():
        if entree.name.startswith(".") or entree.is_symlink() or not entree.is_file():
            continue
        try:
            taille = entree.stat().st_size
        except OSError:
            continue
        nombre += 1
        total += taille
        if entree.name not in references:
            orphelins.append({"nom": entree.name, "octets": taille})
    orphelins.sort(key=lambda item: item["octets"], reverse=True)
    octets_orphelins = sum(item["octets"] for item in orphelins)
    return total, nombre, octets_orphelins, orphelins


def collecter_audit():
    """Dict JSON de tout ce qui se mesure sans inventer de donnée."""
    from utils.site_gate import lire_etat

    maintenant = _maintenant()
    utilisateurs = User.query.all()
    parcours = _parcourir()
    fiches = parcours["fiches"]
    ids_disque = {fiche["id"] for fiche in fiches}
    auteurs = {user.username for user in utilisateurs}

    par_role = {"user": 0, "moderator": 0, "admin": 0, "owner": 0}
    actifs = 0
    avec_envois = 0
    avec_telechargements = 0
    sans_activite = 0
    envois = 0
    telechargements = 0
    envois_perdus = 0
    fiches_lues = set()
    top_auteurs = []
    top_lecteurs = []
    suspendus = []

    for user in utilisateurs:
        par_role[user.role] = par_role.get(user.role, 0) + 1
        if user.is_ban:
            suspendus.append({"username": user.username, "role": user.role})
        else:
            actifs += 1
        nombre_envois = len(user.uploaded_files or [])
        nombre_lectures = len(user.download_ids or [])
        envois += nombre_envois
        telechargements += nombre_lectures
        for file_id in user.uploaded_files or []:
            if file_id not in ids_disque:
                envois_perdus += 1
        for file_id in user.download_ids or []:
            fiches_lues.add(file_id)
        if nombre_envois:
            avec_envois += 1
            top_auteurs.append({"username": user.username, "nombre": nombre_envois})
        if nombre_lectures:
            avec_telechargements += 1
            top_lecteurs.append({"username": user.username, "nombre": nombre_lectures})
        if not nombre_envois and not nombre_lectures:
            sans_activite += 1

    top_auteurs.sort(key=lambda item: (-item["nombre"], item["username"]))
    top_lecteurs.sort(key=lambda item: (-item["nombre"], item["username"]))

    dates = []
    for user in utilisateurs:
        moment = _naive(user.created_at)
        if moment is not None:
            dates.append((moment, user))
    dates.sort(key=lambda item: item[0])
    plus_ancien = _compte(dates[0][1]) if dates else None
    plus_recent = _compte(dates[-1][1]) if dates else None

    def _crees_depuis(delta):
        seuil = maintenant - delta
        return sum(1 for moment, _user in dates if moment >= seuil)

    par_matiere = {}
    par_classe = defaultdict(lambda: {"fiches": 0, "octets": 0})
    par_extension = defaultdict(lambda: {"fiches": 0, "octets": 0})
    presentes = []
    manquants = 0
    auteurs_inconnus = 0
    references = set()

    for fiche in fiches:
        bloc = par_matiere.setdefault(fiche["matiere"], {"fiches": 0, "octets": 0, "cours": set()})
        bloc["fiches"] += 1
        bloc["octets"] += fiche["octets"]
        bloc["cours"].add((fiche["classe"], fiche["specialite"]))
        par_classe[fiche["classe"]]["fiches"] += 1
        par_classe[fiche["classe"]]["octets"] += fiche["octets"]
        par_extension[fiche["extension"]]["fiches"] += 1
        par_extension[fiche["extension"]]["octets"] += fiche["octets"]
        if fiche["present"]:
            presentes.append(fiche)
            references.add(fiche["stocke"])
        else:
            manquants += 1
        if fiche["auteur"] not in auteurs:
            auteurs_inconnus += 1

    uploads_octets, uploads_fichiers, orphelins_octets, orphelins = _mesurer_uploads(references)
    matiere_octets, matiere_fichiers = _taille_dossier(project_dir("matiere"))
    instance = Path(current_app.instance_path)
    instance_octets, _instance_fichiers = _taille_dossier(instance)
    try:
        disque = shutil.disk_usage(Path(".").resolve())
        disque_total, disque_utilise, disque_libre = disque.total, disque.used, disque.free
    except OSError:
        disque_total = disque_utilise = disque_libre = 0

    plus_gros = sorted(presentes, key=lambda fiche: fiche["octets"], reverse=True)[:8]
    dernieres = sorted(fiches, key=lambda fiche: fiche["le"] or "", reverse=True)[:8]
    moyenne = int(sum(fiche["octets"] for fiche in presentes) / len(presentes)) if presentes else 0

    etat = lire_etat()
    expiration = current_app.config.get("JWT_ACCESS_TOKEN_EXPIRES")
    heures = expiration.total_seconds() / 3600 if hasattr(expiration, "total_seconds") else 0

    try:
        from auth.routes import etat_tentatives
        tentatives = etat_tentatives()
    except Exception:
        tentatives = {"bloques": [], "suivis": 0}

    return {
        "genere_le": _iso(maintenant),
        "site": {
            "suspendu": bool(etat["suspended"]),
            "depuis": etat["since"],
            "par": etat["by"],
            "demarre_le": _iso(_demarrage()),
            "duree_secondes": int((maintenant - _demarrage()).total_seconds()),
            "envoi_max_octets": int(current_app.config.get("MAX_CONTENT_LENGTH") or 0),
            "session_heures": heures,
            "cookie_securise": bool(current_app.config.get("JWT_COOKIE_SECURE")),
        },
        "stockage": {
            "uploads_octets": uploads_octets,
            "uploads_fichiers": uploads_fichiers,
            "orphelins_octets": orphelins_octets,
            "orphelins": len(orphelins),
            "matiere_octets": matiere_octets,
            "matiere_fichiers": matiere_fichiers,
            "base_octets": _taille_base(),
            "instance_octets": instance_octets,
            "disque_total_octets": disque_total,
            "disque_utilise_octets": disque_utilise,
            "disque_libre_octets": disque_libre,
        },
        "sessions": resume_sessions(),
        "comptes": {
            "total": len(utilisateurs),
            "actifs": actifs,
            "suspendus": len(suspendus),
            "par_role": {
                "user": par_role.get("user", 0),
                "moderator": par_role.get("moderator", 0),
                "admin": par_role.get("admin", 0),
                "owner": par_role.get("owner", 0),
            },
            "crees_24h": _crees_depuis(timedelta(days=1)),
            "crees_7j": _crees_depuis(timedelta(days=7)),
            "crees_30j": _crees_depuis(timedelta(days=30)),
            "avec_envois": avec_envois,
            "avec_telechargements": avec_telechargements,
            "sans_activite": sans_activite,
            "plus_ancien": plus_ancien,
            "plus_recent": plus_recent,
        },
        "activite": {
            "envois": envois,
            "telechargements": telechargements,
            "fiches_telechargees": len(fiches_lues),
            "envois_perdus": envois_perdus,
            "top_auteurs": top_auteurs[:5],
            "top_lecteurs": top_lecteurs[:5],
        },
        "contenu": {
            "matieres": parcours["matieres"],
            "classes": parcours["classes"],
            "specialites": parcours["specialites"],
            "cours_vides": len(parcours["vides"]),
            "fiches": len(fiches),
            "json_invalides": parcours["invalides"],
            "doublons": parcours["doublons"],
            "fichiers_manquants": manquants,
            "auteurs_inconnus": auteurs_inconnus,
            "taille_moyenne_octets": moyenne,
            "types_autorises": sorted(EXTENSIONS_AUTORISEES),
            "par_matiere": [
                {
                    "nom": nom,
                    "fiches": bloc["fiches"],
                    "octets": bloc["octets"],
                    "cours": len(bloc["cours"]),
                }
                for nom, bloc in sorted(par_matiere.items(), key=lambda item: (-item[1]["fiches"], item[0]))
            ],
            "par_classe": [
                {"nom": nom, "fiches": bloc["fiches"], "octets": bloc["octets"]}
                for nom, bloc in sorted(par_classe.items(), key=lambda item: (ORDRE_CLASSE.get(item[0], 99), item[0]))
            ],
            "par_extension": [
                {"nom": nom, "fiches": bloc["fiches"], "octets": bloc["octets"]}
                for nom, bloc in sorted(par_extension.items(), key=lambda item: (-item[1]["octets"], item[0]))
            ],
            "plus_gros": [_fiche_courte(fiche) for fiche in plus_gros],
            "dernieres": [_fiche_courte(fiche) for fiche in dernieres],
            "cours_vides_liste": parcours["vides"][:15],
            "orphelins_liste": orphelins[:12],
        },
        "securite": {
            "identifiants_bloques": tentatives["bloques"],
            "tentatives_suivies": tentatives["suivis"],
            "comptes_suspendus": sorted(suspendus, key=lambda item: item["username"]),
        },
        "etoiles": classement(),
    }


def _fiche_courte(fiche):
    return {
        "titre": fiche["titre"] or "Sans titre",
        "auteur": fiche["auteur"],
        "matiere": fiche["matiere"],
        "classe": fiche["classe"],
        "specialite": fiche["specialite"],
        "octets": fiche["octets"],
        "le": fiche["le"],
    }


_DEMARRAGE = None


def _demarrage():
    global _DEMARRAGE
    if _DEMARRAGE is None:
        _DEMARRAGE = _maintenant()
    return _DEMARRAGE
