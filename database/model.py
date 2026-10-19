"""Modèle des comptes.

Les fichiers eux-mêmes restent dans uploads/ et matiere/.
Ici on ne garde que l'identité, le rôle, et la liste des fiches liées au compte.
"""

import uuid

from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


def generate_uuid():
    """Identifiant de compte, distinct de l'identifiant d'une fiche."""
    return str(uuid.uuid4())


class User(db.Model):
    """Un élève, un modérateur, un administrateur ou le propriétaire."""

    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    surname = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    # Hash Werkzeug, jamais le mot de passe en clair.
    password = db.Column(db.String(200), nullable=False)
    # user, moderator, admin ou owner. La valeur est relue à chaque requête.
    role = db.Column(db.String(20), nullable=False, default="user")
    is_ban = db.Column(db.Boolean, nullable=False, default=False)
    # Listes JSON : SQLAlchemy appelle list() et dict() pour chaque nouvelle ligne.
    download_ids = db.Column(db.JSON, nullable=True, default=list)
    download_metadatas = db.Column(db.JSON, nullable=True, default=dict)
    uploaded_files = db.Column(db.JSON, nullable=True, default=list)
    uploaded_metadatas = db.Column(db.JSON, nullable=True, default=dict)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    def __repr__(self):
        return f"<User {self.username}>"


class Presence(db.Model):
    """Session ouverte : un jeton émis à la connexion, jusqu'à expiration ou déconnexion.

    Sert à l'audit du propriétaire. Le jti est celui du JWT, pas un second secret.
    """

    __tablename__ = "presences"

    jti = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), nullable=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False)
    last_seen = db.Column(db.DateTime, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False, index=True)
    user_agent = db.Column(db.String(240), nullable=False, default="")
    revoked = db.Column(db.Boolean, nullable=False, default=False)
