"""Parcours réel : pages, connexion, publication, droits et chemins interdits.

Lancement :
    ./venv/bin/python tests/test_flows.py
"""

import io
import os
import sys
import tempfile
import uuid
from pathlib import Path

# Le script doit voir app.py et écrire dans matiere/, même lancé depuis un autre dossier.
_RACINE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_RACINE))
os.chdir(_RACINE)

# Réglages posés avant l'import de l'application, qui lit l'environnement au démarrage.
_BASE = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_ETAT = tempfile.NamedTemporaryFile(suffix=".json", delete=False)
os.environ["DATABASE_URI"] = "sqlite:///" + _BASE.name
os.environ["JWT_SECRET_KEY"] = "cle-de-test-uniquement"
os.environ["LOGIN_MAX_ATTEMPTS"] = "30"
os.environ["SITE_STATUS_PATH"] = _ETAT.name

from werkzeug.security import generate_password_hash

from app import app
from auth.routes import _ATTEMPTS
from database.model import User, db


RESIDUS = []


def verifier(condition, message):
    if not condition:
        raise AssertionError(message)


def suivre(chemin):
    RESIDUS.append(Path(chemin))


def nettoyer():
    for chemin in RESIDUS:
        if chemin.is_file():
            chemin.unlink()
    if os.path.exists(_BASE.name):
        os.remove(_BASE.name)
    for chemin in (Path(_ETAT.name), Path(_ETAT.name).with_suffix(".tmp")):
        if chemin.is_file():
            chemin.unlink()


def csrf(client):
    cookie = client.get_cookie("csrf_access_token")
    verifier(cookie is not None, "le cookie CSRF est absent après la connexion")
    return {"X-CSRF-TOKEN": cookie.value, "Accept": "application/json"}


def connecter(client, username, password):
    reponse = client.post("/auth/login", json={"username": username, "password": password})
    verifier(reponse.status_code == 200, f"connexion {username} : {reponse.get_json()}")
    return csrf(client)


def creer_compte(username, role):
    compte = User(
        name="Test",
        surname=role,
        username=username,
        password=generate_password_hash("MotDePasse-Test-9"),
        role=role,
        is_ban=False,
        download_ids=[],
        download_metadatas={},
        uploaded_files=[],
        uploaded_metadatas={},
        must_change_password=False,
    )
    db.session.add(compte)
    db.session.commit()
    return compte


def verifier_social(client_owner):
    """Étoiles, commentaires, recherches et audit personnel.

    client_owner est déjà le propriétaire. Les autres comptes passent
    par leurs propres clients pour ne pas fermer sa session.
    """
    from sqlalchemy.exc import IntegrityError

    from database.model import Comment, Star

    eleve = app.test_client()
    eleve2 = app.test_client()
    modo = app.test_client()
    admin = app.test_client()
    anonyme = app.test_client()
    entete_eleve = connecter(eleve, "eleve", "MotDePasse-Test-9")
    entete_eleve2 = connecter(eleve2, "eleve2", "MotDePasse-Test-9")
    entete_modo = connecter(modo, "moderateur", "MotDePasse-Test-9")
    entete_admin = connecter(admin, "admin", "MotDePasse-Test-9")

    envoi = eleve.post(
        "/upload/Mathematiques/1ere/specialite",
        data={
            "title": "Synthese etoilee",
            "desc": "Description assez longue pour la recherche",
            "file": (io.BytesIO(b"contenu etoile"), "synthese.txt"),
        },
        headers=entete_eleve,
    )
    verifier(envoi.status_code == 201, f"fiche sociale refusée : {envoi.get_json()}")
    meta = envoi.get_json()["metadata"]
    file_id = meta["id"]
    suivre(Path("matiere/Mathematiques/1ere/specialite") / f"{file_id}.json")
    suivre(Path("uploads") / meta["filename"])

    anonyme_etoile = anonyme.post(f"/fiches/{file_id}/etoile")
    verifier(anonyme_etoile.status_code == 401, "une étoile anonyme a été acceptée")

    pose = eleve.post(f"/fiches/{file_id}/etoile", headers=entete_eleve)
    verifier(pose.status_code == 200 and pose.get_json()["etoile"] is True, pose.get_json())
    verifier(pose.get_json()["etoiles"] == 1, "le compteur d'étoiles est faux")
    retire = eleve.post(f"/fiches/{file_id}/etoile", headers=entete_eleve)
    verifier(retire.get_json()["etoile"] is False and retire.get_json()["etoiles"] == 0, retire.get_json())
    eleve.post(f"/fiches/{file_id}/etoile", headers=entete_eleve)
    deuxieme = eleve2.post(f"/fiches/{file_id}/etoile", headers=entete_eleve2)
    verifier(deuxieme.status_code == 200 and deuxieme.get_json()["etoiles"] == 2, deuxieme.get_json())

    liste = eleve.get("/info/files/Mathematiques/1ere/specialite")
    fiche_liste = next(item for item in liste.get_json()["metadata"] if item["id"] == file_id)
    verifier(fiche_liste["etoiles"] == 2 and fiche_liste["etoile_moi"] is True, fiche_liste)
    publique = anonyme.get("/info/files/Mathematiques/1ere/specialite")
    fiche_publique = next(item for item in publique.get_json()["metadata"] if item["id"] == file_id)
    verifier(fiche_publique["etoile_moi"] is False, "l'étoile d'un autre compte est révélée")

    vide = anonyme.get("/info/recherche")
    verifier(vide.status_code == 400, "une recherche sans critère a répondu")
    piege = anonyme.get("/info/recherche", query_string={"matiere": ".."})
    verifier(piege.status_code == 400, "une matière .. a été acceptée")
    joker = anonyme.get("/info/recherche", query_string={"q": "%"})
    verifier(joker.status_code == 200 and joker.get_json()["fiches"] == [], "le % a servi de joker")
    trouve = anonyme.get("/info/recherche", query_string={"q": "Synthese", "etoiles_min": "2", "auteur": "eleve"})
    verifier(trouve.status_code == 200, trouve.get_json())
    verifier(any(item["id"] == file_id for item in trouve.get_json()["fiches"]), "la fiche étoilée est introuvable")
    verifier("filename" not in trouve.get_json()["fiches"][0], "le nom interne est dans la recherche")
    trop = anonyme.get("/info/recherche", query_string={"q": "Synthese", "etoiles_min": "9"})
    verifier(trop.get_json()["fiches"] == [], "le minimum d'étoiles est ignoré")

    comptes_eleve = eleve.get("/moderator/comptes/recherche", query_string={"q": "eleve"})
    verifier(comptes_eleve.status_code == 403, "un élève recherche les comptes")
    comptes = modo.get("/moderator/comptes/recherche", query_string={"q": "eleve"})
    verifier(comptes.status_code == 200, comptes.get_json())
    noms = [compte["username"] for compte in comptes.get_json()["comptes"]]
    verifier("eleve" in noms and "eleve2" in noms, noms)
    verifier(all("password" not in compte for compte in comptes.get_json()["comptes"]), "mot de passe exposé")
    pourcent = modo.get("/admin/comptes/recherche", query_string={"q": "%"})
    verifier(pourcent.status_code == 403, "un modérateur utilise la recherche admin")
    pourcent_modo = modo.get("/moderator/comptes/recherche", query_string={"q": "%"})
    verifier(pourcent_modo.get_json()["comptes"] == [], "le % sélectionne tous les comptes")
    proprietaires = admin.get("/admin/comptes/recherche", query_string={"role": "owner"})
    verifier(
        [compte["username"] for compte in proprietaires.get_json()["comptes"]] == ["proprietaire"],
        proprietaires.get_json(),
    )
    role_inconnu = admin.get("/admin/comptes/recherche", query_string={"role": "owner' OR 1=1"})
    verifier(role_inconnu.status_code == 400, "un rôle injecté a été accepté")

    script = "<script>alert(1)</script>"
    prive = eleve2.post(
        f"/fiches/{file_id}/commentaires",
        json={"texte": script, "audience": "auteur"},
        headers=entete_eleve2,
    )
    verifier(prive.status_code == 201, prive.get_json())
    id_prive = prive.get_json()["commentaire"]["id"]
    vu_auteur = eleve.get(f"/fiches/{file_id}/commentaires", headers=entete_eleve)
    verifier(any(item["id"] == id_prive for item in vu_auteur.get_json()["commentaires"]), "l'auteur ne voit pas le retour")
    vu_modo = modo.get(f"/fiches/{file_id}/commentaires", headers=entete_modo)
    verifier(all(item["id"] != id_prive for item in vu_modo.get_json()["commentaires"]), "l'équipe voit un commentaire privé")
    prise_cachee = modo.post(
        f"/fiches/{file_id}/commentaires/{id_prive}/prendre",
        headers=entete_modo,
    )
    verifier(prise_cachee.status_code == 404, "un commentaire privé se laisse réserver")

    with app.app_context():
        creer_compte("eleve3", "user")
    tiers = app.test_client()
    entete_tiers = connecter(tiers, "eleve3", "MotDePasse-Test-9")
    sans_compte = anonyme.post(
        f"/fiches/{file_id}/commentaires",
        json={"texte": "sans session", "audience": "auteur"},
    )
    verifier(sans_compte.status_code == 401, "un visiteur anonyme a commenté")
    ajout_tiers = tiers.post(
        f"/fiches/{file_id}/commentaires",
        json={"texte": "Retour d un autre eleve", "audience": "auteur"},
        headers=entete_tiers,
    )
    verifier(ajout_tiers.status_code == 201, ajout_tiers.get_json())
    id_tiers = ajout_tiers.get_json()["commentaire"]["id"]
    vu_tiers = tiers.get(f"/fiches/{file_id}/commentaires", headers=entete_tiers)
    verifier(any(item["id"] == id_prive for item in vu_tiers.get_json()["commentaires"]), "un autre élève ne voit pas le commentaire")
    verifier(any(item["id"] == id_tiers for item in eleve.get(f"/fiches/{file_id}/commentaires", headers=entete_eleve).get_json()["commentaires"]), "l'auteur de la fiche ne voit pas le commentaire d'un autre élève")
    verifier(all(item["id"] != id_tiers for item in modo.get(f"/fiches/{file_id}/commentaires", headers=entete_modo).get_json()["commentaires"]), "l'équipe voit un commentaire réservé aux utilisateurs")

    equipe = eleve2.post(
        f"/fiches/{file_id}/commentaires",
        json={"texte": "Erreur a corriger par l equipe", "audience": "equipe"},
        headers=entete_eleve2,
    )
    verifier(equipe.status_code == 201, equipe.get_json())
    id_equipe = equipe.get_json()["commentaire"]["id"]
    vu_eleve = eleve.get(f"/fiches/{file_id}/commentaires", headers=entete_eleve)
    verifier(all(item["id"] != id_equipe for item in vu_eleve.get_json()["commentaires"]), "l'auteur voit un commentaire d'équipe")
    verifier(
        any(item["id"] == id_equipe for item in modo.get(f"/fiches/{file_id}/commentaires", headers=entete_modo).get_json()["commentaires"]),
        "le modérateur ne voit pas le commentaire d'équipe",
    )

    partage = eleve2.post(
        f"/fiches/{file_id}/commentaires",
        json={"texte": "Visible des deux cotes", "audience": "les_deux"},
        headers=entete_eleve2,
    )
    verifier(partage.status_code == 201, partage.get_json())
    id_partage = partage.get_json()["commentaire"]["id"]
    vu_partage = tiers.get(f"/fiches/{file_id}/commentaires", headers=entete_tiers)
    verifier(any(item["id"] == id_partage for item in vu_partage.get_json()["commentaires"]), "un élève ne voit pas le commentaire partagé")
    verifier(all(item["id"] != id_equipe for item in vu_partage.get_json()["commentaires"]), "un élève voit un commentaire d'équipe")
    eleve_prend = eleve2.post(
        f"/fiches/{file_id}/commentaires/{id_partage}/prendre",
        headers=entete_eleve2,
    )
    verifier(eleve_prend.status_code == 403, "l'auteur du commentaire s'est réservé le suivi")
    pris = modo.post(
        f"/fiches/{file_id}/commentaires/{id_partage}/prendre",
        headers=entete_modo,
    )
    verifier(pris.status_code == 200 and pris.get_json()["commentaire"]["statut"] == "pris", pris.get_json())
    verifier(pris.get_json()["commentaire"]["responsable"] == "moderateur", pris.get_json())
    conflit = admin.post(
        f"/fiches/{file_id}/commentaires/{id_partage}/prendre",
        headers=entete_admin,
    )
    verifier(conflit.status_code == 409, f"un second responsable a été accepté : {conflit.get_json()}")
    vol_validation = admin.post(
        f"/fiches/{file_id}/commentaires/{id_partage}/valider",
        headers=entete_admin,
    )
    verifier(vol_validation.status_code == 403, "un autre membre a validé le commentaire")
    valide = modo.post(
        f"/fiches/{file_id}/commentaires/{id_partage}/valider",
        headers=entete_modo,
    )
    verifier(valide.status_code == 200 and valide.get_json()["commentaire"]["statut"] == "valide", valide.get_json())

    def enregistrer(client, entete, prefixe, titre):
        return client.post(
            f"{prefixe}/dashboard/modify/save/{file_id}",
            data={
                "title": titre,
                "desc": "Description corrigee apres suivi",
                "matiere": "Mathematiques",
                "classe": "1ere",
                "specialite": "specialite",
            },
            headers=entete,
        )

    a_retirer = eleve2.post(
        f"/fiches/{file_id}/commentaires",
        json={"texte": "A retirer par l auteur", "audience": "auteur"},
        headers=entete_eleve2,
    )
    verifier(a_retirer.status_code == 201, a_retirer.get_json())
    id_retrait = a_retirer.get_json()["commentaire"]["id"]
    suivi_eleve = eleve.post(
        f"/fiches/{file_id}/commentaires/{id_retrait}/prendre",
        headers=entete_eleve,
    )
    verifier(suivi_eleve.status_code == 200, suivi_eleve.get_json())
    trop_tot = eleve.delete(f"/fiches/{file_id}/commentaires/{id_retrait}", headers=entete_eleve)
    verifier(trop_tot.status_code == 403, "le commentaire part avant la modification")
    correction = enregistrer(eleve, entete_eleve, "/users", "Synthese etoilee")
    verifier(correction.status_code == 200, correction.get_json())
    autre_eleve = eleve2.delete(f"/fiches/{file_id}/commentaires/{id_retrait}", headers=entete_eleve2)
    verifier(autre_eleve.status_code == 403, "un autre élève retire le commentaire")
    retire = eleve.delete(f"/fiches/{file_id}/commentaires/{id_retrait}", headers=entete_eleve)
    verifier(retire.status_code == 200, retire.get_json())
    encore = eleve.get(f"/fiches/{file_id}/commentaires", headers=entete_eleve)
    verifier(all(item["id"] != id_retrait for item in encore.get_json()["commentaires"]), "le commentaire retiré est encore listé")

    pour_modo = eleve2.post(
        f"/fiches/{file_id}/commentaires",
        json={"texte": "A retirer par la moderation", "audience": "equipe"},
        headers=entete_eleve2,
    )
    verifier(pour_modo.status_code == 201, pour_modo.get_json())
    id_modo = pour_modo.get_json()["commentaire"]["id"]
    verifier(modo.post(f"/fiches/{file_id}/commentaires/{id_modo}/prendre", headers=entete_modo).status_code == 200, "le modérateur ne suit pas")
    verifier(
        modo.delete(f"/fiches/{file_id}/commentaires/{id_modo}", headers=entete_modo).status_code == 403,
        "le modérateur retire avant d'avoir modifié",
    )
    verifier(enregistrer(eleve, entete_eleve, "/users", "Synthese etoilee").status_code == 200, "correction élève")
    verifier(
        modo.delete(f"/fiches/{file_id}/commentaires/{id_modo}", headers=entete_modo).status_code == 403,
        "la modification d'un autre compte débloque le retrait",
    )
    verifier(
        admin.delete(f"/fiches/{file_id}/commentaires/{id_modo}", headers=entete_admin).status_code == 403,
        "un admin retire le commentaire suivi par le modérateur",
    )
    correction_modo = enregistrer(modo, entete_modo, "/moderator", "Synthese etoilee")
    verifier(correction_modo.status_code == 200, correction_modo.get_json())
    verifier(modo.delete(f"/fiches/{file_id}/commentaires/{id_modo}", headers=entete_modo).status_code == 200, "retrait modérateur")

    pour_owner = eleve2.post(
        f"/fiches/{file_id}/commentaires",
        json={"texte": "A retirer par le proprietaire", "audience": "les_deux"},
        headers=entete_eleve2,
    )
    verifier(pour_owner.status_code == 201, pour_owner.get_json())
    id_owner = pour_owner.get_json()["commentaire"]["id"]
    entete_owner = csrf(client_owner)
    verifier(
        client_owner.post(f"/fiches/{file_id}/commentaires/{id_owner}/prendre", headers=entete_owner).status_code == 200,
        "le propriétaire ne suit pas",
    )
    verifier(
        client_owner.delete(f"/fiches/{file_id}/commentaires/{id_owner}", headers=entete_owner).status_code == 403,
        "le propriétaire retire avant d'avoir modifié",
    )
    correction_owner = enregistrer(client_owner, entete_owner, "/admin", "Synthese etoilee")
    verifier(correction_owner.status_code == 200, correction_owner.get_json())
    verifier(
        client_owner.delete(f"/fiches/{file_id}/commentaires/{id_owner}", headers=entete_owner).status_code == 200,
        "retrait propriétaire",
    )

    audit_eleve = eleve.get("/users/audit", headers={"Accept": "text/html"})
    page_eleve = audit_eleve.get_data(as_text=True)
    verifier(audit_eleve.status_code == 200 and "Synthese etoilee" in page_eleve, "audit personnel absent")
    verifier("<script>alert(1)</script>" not in page_eleve, "le commentaire n'est pas échappé")
    audit_autre = eleve2.get("/users/audit.json")
    verifier("Synthese etoilee" not in audit_autre.get_data(as_text=True), "l'audit d'un autre élève contient la fiche")
    audit_modo = modo.get("/users/audit.json")
    verifier("Synthese etoilee" not in audit_modo.get_data(as_text=True), "l'audit du modérateur mélange les fiches")

    classement = client_owner.get("/owner/audit.json").get_json()["etoiles"]
    verifier(classement["plus_etoilee"]["id"] == file_id, classement)
    verifier(classement["plus_etoilee"]["etoiles"] == 2, classement)
    verifier(
        any(groupe["matiere"] == "Mathematiques" and groupe["fiches"][0]["id"] == file_id for groupe in classement["par_matiere"]),
        classement,
    )

    with app.app_context():
        try:
            creer_compte("autre-proprio", "owner")
            raise AssertionError("un second propriétaire a été enregistré")
        except IntegrityError:
            db.session.rollback()

    suppression = eleve.delete(f"/users/dashboard/delete/{file_id}", headers=entete_eleve)
    verifier(suppression.status_code == 200, suppression.get_json())
    verifier(anonyme.get(f"/download/Mathematiques/1ere/specialite/{file_id}").status_code == 404, "la fiche supprimée se télécharge")
    with app.app_context():
        verifier(Star.query.filter_by(file_id=file_id).count() == 0, "une étoile survit à la fiche")
        verifier(Comment.query.filter_by(file_id=file_id).count() == 0, "un commentaire survit à la fiche")

    source = Path("static/common.js").read_text(encoding="utf-8")
    verifier("window.location.reload()" in source, "la suppression ne recharge pas la page")
    script_install = Path("init-server.sh").read_text(encoding="utf-8")
    for variable in ("JWT_SECRET_KEY", "JWT_COOKIE_SECURE", "DATABASE_URI", "LOGIN_MAX_ATTEMPTS", "SITE_STATUS_PATH"):
        verifier(variable in script_install, f"{variable} absent du script d'installation")


def verifier_mot_de_passe():
    """Première connexion bloquée tant que le mot de passe n'est pas choisi, puis changement libre."""
    with app.app_context():
        compte = creer_compte("nouveau", "user")
        compte.must_change_password = True
        db.session.commit()

    client = app.test_client()
    entree = client.post("/auth/login", json={"username": "nouveau", "password": "MotDePasse-Test-9"})
    verifier(entree.status_code == 200, entree.get_json())
    verifier(entree.get_json()["must_change_password"] is True, entree.get_json())
    verifier(entree.get_json()["home"] == "/auth/mot-de-passe", entree.get_json())
    entete = csrf(client)

    ferme = client.get("/users/dashboard", headers={"Accept": "text/html"})
    verifier(ferme.status_code == 302 and ferme.location.endswith("/auth/mot-de-passe"), ferme.location)
    verifier(client.get("/info/matiere").status_code == 403, "les fiches restent ouvertes avant le nouveau mot de passe")

    page = client.get("/auth/mot-de-passe")
    verifier(page.status_code == 200 and "première connexion" in page.get_data(as_text=True), "formulaire de premier mot de passe absent")

    sans_csrf = client.post(
        "/auth/mot-de-passe",
        json={"actuel": "MotDePasse-Test-9", "nouveau": "Nouveau-Mot-2026", "confirmation": "Nouveau-Mot-2026"},
        headers={"Accept": "application/json"},
    )
    verifier(sans_csrf.status_code == 401, "le changement sans CSRF a été accepté")

    court = client.post(
        "/auth/mot-de-passe",
        json={"actuel": "MotDePasse-Test-9", "nouveau": "court", "confirmation": "court"},
        headers=entete,
    )
    verifier(court.status_code == 400, court.get_json())
    different = client.post(
        "/auth/mot-de-passe",
        json={"actuel": "MotDePasse-Test-9", "nouveau": "Nouveau-Mot-2026", "confirmation": "Autre-Chose-9"},
        headers=entete,
    )
    verifier(different.status_code == 400, different.get_json())
    mauvais = client.post(
        "/auth/mot-de-passe",
        json={"actuel": "pas-le-bon", "nouveau": "Nouveau-Mot-2026", "confirmation": "Nouveau-Mot-2026"},
        headers=entete,
    )
    verifier(mauvais.status_code == 401, mauvais.get_json())
    ok = client.post(
        "/auth/mot-de-passe",
        json={"actuel": "MotDePasse-Test-9", "nouveau": "Nouveau-Mot-2026", "confirmation": "Nouveau-Mot-2026"},
        headers=entete,
    )
    verifier(ok.status_code == 200 and ok.get_json()["must_change_password"] is False, ok.get_json())
    verifier(client.get("/info/matiere").status_code == 200, "le site reste fermé après le changement")

    volontaire = client.get("/auth/mot-de-passe")
    verifier("quand tu veux" in volontaire.get_data(as_text=True), "le changement volontaire manque")
    encore = client.post(
        "/auth/mot-de-passe",
        json={"actuel": "Nouveau-Mot-2026", "nouveau": "Autre-Mot-2026!", "confirmation": "Autre-Mot-2026!"},
        headers=entete,
    )
    verifier(encore.status_code == 200, encore.get_json())
    client.post("/auth/logout", headers=entete)
    retour = client.post("/auth/login", json={"username": "nouveau", "password": "Autre-Mot-2026!"})
    verifier(retour.status_code == 200 and retour.get_json()["must_change_password"] is False, retour.get_json())
    verifier(retour.get_json()["home"] == "/users/dashboard", retour.get_json())


def scenario():
    client = app.test_client()

    accueil = client.get("/accueil")
    verifier(accueil.status_code == 200, "l'accueil ne répond pas")
    verifier("Fiches de révision" in accueil.get_data(as_text=True), "titre d'accueil absent")
    verifier("Rechercher une fiche" in accueil.get_data(as_text=True), "la recherche de fiches manque à l'accueil")
    verifier("Mentions légales" in accueil.get_data(as_text=True), "le pied de page légal manque")
    for adresse, titre in (
        ("/legal/mentions", "Mentions légales"),
        ("/legal/confidentialite", "Politique de confidentialité"),
        ("/legal/cookies", "Gestion des cookies"),
        ("/legal/licences", "Licences"),
    ):
        page_legale = client.get(adresse)
        verifier(page_legale.status_code == 200 and titre in page_legale.get_data(as_text=True), adresse)

    racine = client.get("/", follow_redirects=False)
    verifier(racine.status_code == 302 and racine.location.endswith("/accueil"), "la racine ne redirige pas")

    login_piege = client.get("/auth/login-page?next=https://evil.example")
    verifier(login_piege.status_code == 200, "page de connexion indisponible")
    verifier("evil.example" not in login_piege.get_data(as_text=True), "redirection ouverte")
    verifier("Connexion" in login_piege.get_data(as_text=True), "formulaire de connexion absent")

    matieres = client.get("/info/matiere")
    verifier(matieres.status_code == 200, "liste des matières en échec")
    verifier("Mathematiques" in matieres.get_json()["matiere"], "Mathématiques absentes du disque")

    traversal = client.get("/info/classe/..")
    verifier(traversal.status_code == 404, "le segment .. aurait dû être refusé")

    mauvais = client.post("/auth/login", json={"username": "eleve", "password": "non"})
    verifier(mauvais.status_code == 401, "un mauvais mot de passe doit être refusé")

    with app.app_context():
        eleve = creer_compte("eleve", "user")
        eleve2 = creer_compte("eleve2", "user")
        moderateur = creer_compte("moderateur", "moderator")
        admin = creer_compte("admin", "admin")
        eleve_id = eleve.id
        admin_id = admin.id

    entete = connecter(client, "eleve", "MotDePasse-Test-9")
    moi = client.get("/auth/me")
    verifier(moi.status_code == 200 and moi.get_json()["role"] == "user", "/auth/me ne décrit pas l'élève")

    sans_csrf = client.post(
        "/upload/Mathematiques/1ere/specialite",
        data={"title": "Sans jeton", "desc": "ne doit pas passer", "file": (io.BytesIO(b"abc"), "note.txt")},
        headers={"Accept": "application/json"},
    )
    verifier(sans_csrf.status_code == 401, f"l'envoi sans CSRF a répondu {sans_csrf.status_code}")

    html = client.post(
        "/upload/Mathematiques/1ere/specialite",
        data={
            "title": "Page",
            "desc": "interdite",
            "author": "admin",
            "file": (io.BytesIO(b"<html></html>"), "piege.html"),
        },
        headers=entete,
    )
    verifier(html.status_code == 400, "un fichier HTML aurait dû être refusé")

    titre = "<img src=x onerror=alert(1)>"
    envoi = client.post(
        "/upload/Mathematiques/1ere/specialite",
        data={
            "title": titre,
            "desc": "Fiche de test automatique",
            "author": "admin",
            "file": (io.BytesIO(b"contenu de la fiche"), "notes.txt"),
        },
        headers=entete,
    )
    verifier(envoi.status_code == 201, f"publication refusée : {envoi.get_json()}")
    meta = envoi.get_json()["metadata"]
    file_id = meta["id"]
    suivre(Path("matiere/Mathematiques/1ere/specialite") / f"{file_id}.json")
    suivre(Path("uploads") / meta["filename"])
    verifier(meta["author"] == "eleve", "l'auteur du formulaire a été accepté")

    liste = client.get("/info/files/Mathematiques/1ere/specialite")
    verifier(file_id in liste.get_json()["files"], "la fiche publiée n'apparaît pas")

    telechargement = client.get(f"/download/Mathematiques/1ere/specialite/{file_id}")
    verifier(telechargement.status_code == 200, "téléchargement impossible")
    verifier(telechargement.data == b"contenu de la fiche", "le contenu téléchargé ne correspond pas")

    page = client.get("/users/dashboard")
    verifier(page.status_code == 200, "tableau de bord élève indisponible")
    verifier("Audit de mes fiches" in page.get_data(as_text=True), "le lien d'audit personnel manque")
    verifier(b"<img src=x onerror=alert(1)>" not in page.data, "le titre n'est pas échappé dans la page")

    entete2 = connecter(client, "eleve2", "MotDePasse-Test-9")
    vol = client.delete(f"/users/dashboard/delete/{file_id}", headers=entete2)
    verifier(vol.status_code == 403, "un autre élève a pu supprimer la fiche")

    entete = connecter(client, "eleve", "MotDePasse-Test-9")
    modification = client.post(
        f"/users/dashboard/modify/save/{file_id}",
        data={"title": "Titre corrige", "desc": "Description corrigee", "matiere": "Mathematiques", "classe": "1ere", "specialite": "specialite"},
        headers=entete,
    )
    verifier(modification.status_code == 200, f"modification refusée : {modification.get_json()}")

    suppression = client.delete(f"/users/dashboard/delete/{file_id}", headers=entete)
    verifier(suppression.status_code == 200, f"suppression refusée : {suppression.get_json()}")
    verifier(not (Path("uploads") / meta["filename"]).exists(), "le fichier est resté sur le disque")

    piege_id = str(uuid.uuid4())
    piege = Path("matiere/Mathematiques/1ere/specialite") / f"{piege_id}.json"
    suivre(piege)
    piege.write_text(
        '{"id":"%s","title":"piege","author":"eleve","desc":"x",'
        '"filename":"../secret.txt","original_filename":"secret.txt",'
        '"matiere":"Mathematiques","classe":"1ere","specialite":"specialite"}' % piege_id,
        encoding="utf-8",
    )
    fuite = client.get(f"/download/Mathematiques/1ere/specialite/{piege_id}")
    verifier(fuite.status_code == 404, "un nom de fichier relatif a été accepté")

    entete_modo = connecter(client, "moderateur", "MotDePasse-Test-9")
    ban_admin = client.post(f"/moderator/dashboard/ban/{admin_id}", headers=entete_modo)
    verifier(ban_admin.status_code == 403, "un modérateur a suspendu un administrateur")
    role_modo = client.post(
        f"/moderator/dashboard/role/{eleve_id}",
        json={"role": "admin"},
        headers=entete_modo,
    )
    verifier(role_modo.status_code == 404, "le changement de rôle existe chez le modérateur")
    page_admin = client.get("/admin/dashboard", headers={"Accept": "text/html"})
    verifier(page_admin.status_code == 302, "un modérateur n'est pas renvoyé vers son espace")
    verifier("/moderator/dashboard" in page_admin.location, page_admin.location)

    entete_admin = connecter(client, "admin", "MotDePasse-Test-9")
    comptes = client.get("/admin/comptes-page", headers={"Accept": "text/html"})
    verifier(comptes.status_code == 200 and "eleve" in comptes.get_data(as_text=True), "page des comptes admin")
    verifier("Rechercher un compte" in comptes.get_data(as_text=True), "la recherche de comptes manque")
    ban = client.post(f"/admin/dashboard/ban/{eleve_id}", headers=entete_admin)
    verifier(ban.status_code == 200, f"suspension impossible : {ban.get_json()}")
    refuse = client.post("/auth/login", json={"username": "eleve", "password": "MotDePasse-Test-9"})
    verifier(refuse.status_code == 403, "un compte suspendu peut encore entrer")
    retour = client.post(f"/admin/dashboard/unban/{eleve_id}", headers=entete_admin)
    verifier(retour.status_code == 200, "réactivation impossible")
    soi = client.post(f"/admin/dashboard/role/{admin_id}", json={"role": "user"}, headers=entete_admin)
    verifier(soi.status_code == 403, "un admin a changé son propre rôle")
    promotion = client.post(
        f"/admin/dashboard/role/{eleve_id}",
        json={"role": "moderator"},
        headers=entete_admin,
    )
    verifier(promotion.status_code == 200, f"promotion impossible : {promotion.get_json()}")
    client.post(f"/admin/dashboard/role/{eleve_id}", json={"role": "user"}, headers=entete_admin)

    sortie = client.post("/auth/logout", headers=entete_admin)
    verifier(sortie.status_code == 200, "déconnexion impossible")
    apres = client.get("/auth/me")
    verifier(apres.status_code == 401, "la session est encore valable après la déconnexion")

    with app.app_context():
        proprietaire = creer_compte("proprietaire", "owner")
        proprietaire_id = proprietaire.id

    sans_session = client.get("/owner/audit.json")
    verifier(sans_session.status_code == 401, "l'audit est public")

    entete_admin = connecter(client, "admin", "MotDePasse-Test-9")
    ban_owner = client.post(f"/admin/dashboard/ban/{proprietaire_id}", headers=entete_admin)
    verifier(ban_owner.status_code == 403, f"un admin a suspendu le propriétaire : {ban_owner.get_json()}")
    vol_role = client.post(
        f"/admin/dashboard/role/{proprietaire_id}",
        json={"role": "user"},
        headers=entete_admin,
    )
    verifier(vol_role.status_code == 403, f"un admin a modifié le propriétaire : {vol_role.get_json()}")
    faux_owner = client.post(
        f"/admin/dashboard/role/{eleve_id}",
        json={"role": "owner"},
        headers=entete_admin,
    )
    verifier(faux_owner.status_code == 400, "le rôle propriétaire s'attribue depuis l'admin")

    visiteur = app.test_client()
    connecter(visiteur, "eleve", "MotDePasse-Test-9")
    admin_pause = app.test_client()
    connecter(admin_pause, "admin", "MotDePasse-Test-9")
    entree = client.post(
        "/auth/login",
        json={"username": "proprietaire", "password": "MotDePasse-Test-9"},
    )
    verifier(entree.status_code == 200, f"connexion propriétaire : {entree.get_json()}")
    verifier(entree.get_json()["home"] == "/owner/audit", "mauvais accueil propriétaire")
    entete_owner = csrf(client)

    page = client.get("/owner/audit", headers={"Accept": "text/html"})
    verifier(page.status_code == 200, "page d'audit indisponible")
    texte = page.get_data(as_text=True)
    verifier("Audit du site" in texte and "Suspendre le site" in texte, "le bouton de suspension manque")
    verifier("En tête par matière" in texte, "le classement d'étoiles manque")
    donnees = client.get("/owner/audit.json")
    verifier(donnees.status_code == 200, f"json d'audit : {donnees.get_json()}")
    audit = donnees.get_json()
    verifier(audit["stockage"]["disque_total_octets"] > 0, "le disque n'est pas mesuré")
    verifier(audit["contenu"]["matieres"] > 0, "les matières ne sont pas comptées")
    verifier("sessions" in audit and "comptes" in audit and "securite" in audit, "relevé incomplet")
    verifier(
        any(session["username"] == "proprietaire" for session in audit["sessions"]["liste"]),
        "le propriétaire connecté n'apparaît pas",
    )
    refus_eleve = visiteur.get("/owner/audit.json")
    verifier(refus_eleve.status_code == 403, "un élève lit l'audit")
    admin_owner = client.get("/admin/dashboard", headers={"Accept": "text/html"})
    verifier(admin_owner.status_code == 200, "le propriétaire n'ouvre pas l'administration")

    verifier_social(client)

    suspension = client.post("/owner/site", json={"suspendu": True}, headers=entete_owner)
    verifier(
        suspension.status_code == 200 and suspension.get_json()["site"]["suspendu"] is True,
        f"suspension du site : {suspension.get_json()}",
    )
    page_eleve = visiteur.get("/accueil", headers={"Accept": "text/html"})
    verifier(page_eleve.status_code == 503, "l'élève consulte le site suspendu")
    verifier("Site suspendu" in page_eleve.get_data(as_text=True), "page de pause absente")
    verifier(visiteur.get("/info/matiere").status_code == 503, "l'API reste ouverte pendant la pause")
    exterieur = app.test_client()
    bloque = exterieur.post("/auth/login", json={"username": "eleve", "password": "MotDePasse-Test-9"})
    verifier(bloque.status_code == 503, f"un élève se connecte pendant la pause : {bloque.get_json()}")
    banniere = exterieur.get("/auth/login-page")
    verifier("Le site est suspendu." in banniere.get_data(as_text=True), "la page de connexion ne prévient pas")
    verifier(client.get("/owner/audit.json").status_code == 200, "le propriétaire est bloqué avec le site")
    verifier(client.get("/admin/dashboard", headers={"Accept": "text/html"}).status_code == 200, "admin coupé pour le propriétaire")
    verifier(
        admin_pause.get("/admin/dashboard", headers={"Accept": "text/html"}).status_code == 503,
        "un administrateur passe pendant la pause",
    )

    reprise = client.post("/owner/site", json={"suspendu": False}, headers=entete_owner)
    verifier(
        reprise.status_code == 200 and reprise.get_json()["site"]["suspendu"] is False,
        f"réactivation : {reprise.get_json()}",
    )
    verifier(visiteur.get("/info/matiere").status_code == 200, "le site ne se rouvre pas")

    sortie_owner = client.post("/auth/logout", headers=entete_owner)
    verifier(sortie_owner.status_code == 200, "déconnexion propriétaire impossible")
    verifier(client.get("/owner/audit.json").status_code == 401, "la session propriétaire reste ouverte")
    entete_owner = connecter(client, "proprietaire", "MotDePasse-Test-9")
    encore = client.get("/owner/audit.json").get_json()["sessions"]["liste"]
    verifier(
        sum(1 for session in encore if session["username"] == "proprietaire") == 1,
        "une session fermée est encore listée",
    )
    client.post("/auth/logout", headers=entete_owner)

    verifier_mot_de_passe()

    _ATTEMPTS.clear()
    os.environ["LOGIN_MAX_ATTEMPTS"] = "2"
    client.post("/auth/login", json={"username": "personne", "password": "a"})
    client.post("/auth/login", json={"username": "personne", "password": "b"})
    bloque = client.post("/auth/login", json={"username": "personne", "password": "c"})
    verifier(bloque.status_code == 429, "le plafond de tentatives ne s'applique pas")
    _ATTEMPTS.clear()


if __name__ == "__main__":
    try:
        scenario()
    finally:
        nettoyer()
    print("Tous les parcours sont passés.")
