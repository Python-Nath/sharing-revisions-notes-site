"""Mentions, confidentialité, cookies et licences.

Ces pages sont publiques. Elles ne lisent ni la base ni les fiches.
"""

from flask import Blueprint, render_template


legal_bp = Blueprint("legal", __name__, url_prefix="/legal")


@legal_bp.route("/mentions", methods=["GET"])
def mentions():
    """Qui édite le site et à quoi il sert."""
    return render_template("legal/mentions.html")


@legal_bp.route("/confidentialite", methods=["GET"])
def confidentialite():
    """Quelles données sont gardées, pourquoi, et pendant combien de temps."""
    return render_template("legal/confidentialite.html")


@legal_bp.route("/cookies", methods=["GET"])
def cookies():
    """Liste des cookies et moyen de retirer l'accusé de lecture."""
    return render_template("legal/cookies.html")


@legal_bp.route("/licences", methods=["GET"])
def licences():
    """Licences des bibliothèques utilisées par le serveur."""
    return render_template("legal/licences.html")
