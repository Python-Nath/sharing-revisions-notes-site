"""Crée ou remet à jour les comptes de test, dont le propriétaire.

Relance le script autant de fois que tu veux : ces identifiants
retrouvent le mot de passe affiché ci-dessous. Les autres comptes,
s'il y en a, ne sont pas touchés.

Il n'y a pas d'inscription publique. Les comptes se créent ici, exprès.

Usage :
    python init_users.py
"""

import os
from pathlib import Path

from werkzeug.security import generate_password_hash

# La base et les dossiers sont relatifs au projet, pas au dossier d'où on lance le script.
os.chdir(Path(__file__).resolve().parent)

from app import app
from database.model import User, db


# Mots de passe de démonstration locale. À changer si le site est exposé.
COMPTES = [
    {
        "username": "eleve",
        "password": "Eleve-2026!",
        "name": "Élève",
        "surname": "Test",
        "role": "user",
    },
    {
        "username": "moderateur",
        "password": "Moderateur-2026!",
        "name": "Modération",
        "surname": "Test",
        "role": "moderator",
    },
    {
        "username": "admin",
        "password": "Admin-2026!",
        "name": "Administration",
        "surname": "Test",
        "role": "admin",
    },
    {
        "username": "proprietaire",
        "password": "Proprietaire-2026!",
        "name": "Propriétaire",
        "surname": "Site",
        "role": "owner",
    },
]


def assurer_compte(compte):
    """Crée le compte ou réinitialise son rôle, son mot de passe et son état."""
    # Un seul propriétaire : les autres comptes owner redeviennent administrateurs
    # avant d'enregistrer celui-ci, sinon l'index unique refuse l'écriture.
    if compte["role"] == "owner":
        autres = User.query.filter(
            User.role == "owner",
            User.username != compte["username"],
        ).all()
        for autre in autres:
            autre.role = "admin"

    utilisateur = User.query.filter_by(username=compte["username"]).first()
    cree = utilisateur is None
    if cree:
        utilisateur = User(
            name=compte["name"],
            surname=compte["surname"],
            username=compte["username"],
            password=generate_password_hash(compte["password"]),
            role=compte["role"],
            is_ban=False,
            download_ids=[],
            download_metadatas={},
            uploaded_files=[],
            uploaded_metadatas={},
        )
        db.session.add(utilisateur)
    else:
        utilisateur.name = compte["name"]
        utilisateur.surname = compte["surname"]
        utilisateur.password = generate_password_hash(compte["password"])
        utilisateur.role = compte["role"]
        utilisateur.is_ban = False
    return "créé" if cree else "mis à jour"


def main():
    with app.app_context():
        db.create_all()
        lignes = [(assurer_compte(compte), compte) for compte in COMPTES]
        db.session.commit()

    print("Comptes de test prêts.")
    print("Identifiant          Mot de passe       Rôle")
    for etat, compte in lignes:
        print(
            f"{compte['username']:<20} {compte['password']:<18} {compte['role']:<12} ({etat})"
        )


if __name__ == "__main__":
    main()
