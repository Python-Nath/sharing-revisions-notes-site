"""Accès au modèle User et à l'objet SQLAlchemy partagé."""

from database.model import User, db

__all__ = ["User", "db"]
