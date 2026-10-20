"""Étoiles sur les fiches.

Seul un compte connecté peut en poser une, et une seule par fiche.
Le nombre affiché est public : il ne dit pas qui a voté, sauf pour
le compte qui regarde sa propre étoile.
"""

from datetime import datetime, timezone

from sqlalchemy.exc import IntegrityError

from database.model import Star, db
from utils.catalogue import toutes_les_fiches, trouver_fiche, vue_publique
from utils.security import is_uuid


def _maintenant():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def compter(file_ids):
    """Nombre d'étoiles par fiche. Les identifiants inconnus valent zéro."""
    identifiants = [file_id for file_id in file_ids if is_uuid(file_id)]
    if not identifiants:
        return {}
    rows = (
        db.session.query(Star.file_id, db.func.count(Star.id))
        .filter(Star.file_id.in_(identifiants))
        .group_by(Star.file_id)
        .all()
    )
    return {file_id: nombre for file_id, nombre in rows}


def deja_etoilees(user_id, file_ids):
    """Identifiants que ce compte a déjà étoilés, parmi la liste demandée."""
    identifiants = [file_id for file_id in file_ids if is_uuid(file_id)]
    if not user_id or not identifiants:
        return set()
    rows = (
        Star.query.filter(Star.user_id == user_id, Star.file_id.in_(identifiants))
        .with_entities(Star.file_id)
        .all()
    )
    return {file_id for (file_id,) in rows}


def annoter(fiches, user):
    """Ajoute etoiles et etoile_moi sur des dictionnaires déjà publics."""
    identifiants = [fiche.get("id") for fiche in fiches if is_uuid(fiche.get("id"))]
    comptes = compter(identifiants)
    miennes = deja_etoilees(user.id, identifiants) if user is not None else set()
    for fiche in fiches:
        identifiant = fiche.get("id")
        fiche["etoiles"] = int(comptes.get(identifiant, 0))
        fiche["etoile_moi"] = identifiant in miennes
    return fiches


def nombre_pour(file_id):
    return int(compter([file_id]).get(file_id, 0))


def basculer(user, file_id):
    """Pose ou retire l'étoile du compte. (données, None) ou (None, (message, code))."""
    if trouver_fiche(file_id) is None:
        return None, ("Fiche introuvable", 404)

    existante = Star.query.filter_by(user_id=user.id, file_id=file_id).first()
    if existante is not None:
        db.session.delete(existante)
        db.session.commit()
        return {"etoile": False, "etoiles": nombre_pour(file_id)}, None

    db.session.add(Star(user_id=user.id, file_id=file_id, created_at=_maintenant()))
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return {"etoile": True, "etoiles": nombre_pour(file_id)}, None
    return {"etoile": True, "etoiles": nombre_pour(file_id)}, None


def _courte(meta, etoiles):
    vue = vue_publique(meta)
    return {
        "id": vue["id"],
        "titre": vue["title"] or "Sans titre",
        "auteur": vue["author"],
        "matiere": vue["matiere"],
        "classe": vue["classe"],
        "specialite": vue["specialite"],
        "etoiles": etoiles,
    }


def classement():
    """La fiche la plus étoilée, et les mieux étoilées de chaque matière.

    Une matière n'apparaît que si au moins une de ses fiches a une étoile.
    En cas d'égalité, on garde toutes les fiches à ce maximum.
    Le classement global n'en retient qu'une : le titre, puis l'identifiant.
    """
    fiches = toutes_les_fiches()
    comptes = compter([fiche["id"] for fiche in fiches])
    total = sum(comptes.values())
    par_matiere = {}
    for meta in fiches:
        etoiles = int(comptes.get(meta["id"], 0))
        if etoiles <= 0:
            continue
        par_matiere.setdefault(meta.get("matiere") or "", []).append((meta, etoiles))

    groupes = []
    gagnantes = []
    for matiere in sorted(par_matiere):
        lignes = par_matiere[matiere]
        meilleur = max(etoiles for _meta, etoiles in lignes)
        tete = [
            _courte(meta, etoiles)
            for meta, etoiles in lignes
            if etoiles == meilleur
        ]
        tete.sort(key=lambda fiche: ((fiche["titre"] or "").casefold(), fiche["id"]))
        groupes.append({"matiere": matiere, "fiches": tete})
        gagnantes.extend(tete)

    gagnantes.sort(key=lambda fiche: (-fiche["etoiles"], (fiche["titre"] or "").casefold(), fiche["id"]))
    return {
        "total": total,
        "plus_etoilee": gagnantes[0] if gagnantes else None,
        "par_matiere": groupes,
    }
