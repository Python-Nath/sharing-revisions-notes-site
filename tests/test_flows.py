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
    )
    db.session.add(compte)
    db.session.commit()
    return compte


def scenario():
    client = app.test_client()

    accueil = client.get("/accueil")
    verifier(accueil.status_code == 200, "l'accueil ne répond pas")
    verifier("Fiches de révision" in accueil.get_data(as_text=True), "titre d'accueil absent")

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
