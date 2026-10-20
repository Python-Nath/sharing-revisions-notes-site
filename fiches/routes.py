"""Étoile et commentaires d'une fiche.

Ces adresses exigent un compte. Le cookie CSRF est contrôlé par le jeton
pour toute requête qui modifie quelque chose.
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from utils.access import require_user
from utils.commentaires import lister, prendre, publier, retirer, valider
from utils.etoiles import basculer
from utils.security import is_uuid


fiches_bp = Blueprint("fiches", __name__, url_prefix="/fiches")


def _connecte():
    return require_user()


def _id_invalide(file_id):
    if is_uuid(file_id):
        return None
    return jsonify({"error": "Identifiant de fiche invalide"}), 400


def _reponse(resultat, erreur, code=200):
    if erreur:
        return jsonify({"error": erreur[0]}), erreur[1]
    return jsonify(resultat), code


@fiches_bp.route("/<file_id>/etoile", methods=["POST"])
@jwt_required()
def etoile(file_id):
    """Pose l'étoile de ce compte, ou la retire si elle était déjà posée."""
    user, error = _connecte()
    if error:
        return error
    invalide = _id_invalide(file_id)
    if invalide:
        return invalide
    return _reponse(*basculer(user, file_id))


@fiches_bp.route("/<file_id>/commentaires", methods=["GET"])
@jwt_required()
def commentaires(file_id):
    """Commentaires de cette fiche que le compte a le droit de lire."""
    user, error = _connecte()
    if error:
        return error
    invalide = _id_invalide(file_id)
    if invalide:
        return invalide
    return _reponse(*lister(user, file_id))


@fiches_bp.route("/<file_id>/commentaires", methods=["POST"])
@jwt_required()
def ajouter_commentaire(file_id):
    """Publie un commentaire. Le corps est {"texte", "audience"}."""
    user, error = _connecte()
    if error:
        return error
    invalide = _id_invalide(file_id)
    if invalide:
        return invalide
    if request.content_length is not None and request.content_length > 16_000:
        return jsonify({"error": "Commentaire trop volumineux"}), 413
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Un objet JSON est requis"}), 400
    resultat, erreur = publier(user, file_id, data.get("texte"), data.get("audience"))
    return _reponse(resultat, erreur, 201)


@fiches_bp.route("/<file_id>/commentaires/<comment_id>/prendre", methods=["POST"])
@jwt_required()
def prendre_commentaire(file_id, comment_id):
    """Le premier membre de l'équipe qui appelle cette adresse s'en charge."""
    user, error = _connecte()
    if error:
        return error
    invalide = _id_invalide(file_id)
    if invalide:
        return invalide
    return _reponse(*prendre(user, file_id, comment_id))


@fiches_bp.route("/<file_id>/commentaires/<comment_id>/valider", methods=["POST"])
@jwt_required()
def valider_commentaire(file_id, comment_id):
    """Marque le commentaire comme traité. Réservé à celui qui s'en charge."""
    user, error = _connecte()
    if error:
        return error
    invalide = _id_invalide(file_id)
    if invalide:
        return invalide
    return _reponse(*valider(user, file_id, comment_id))


@fiches_bp.route("/<file_id>/commentaires/<comment_id>", methods=["DELETE"])
@jwt_required()
def retirer_commentaire(file_id, comment_id):
    """Retire un commentaire suivi, après une modification de la fiche par le même compte."""
    user, error = _connecte()
    if error:
        return error
    invalide = _id_invalide(file_id)
    if invalide:
        return invalide
    return _reponse(*retirer(user, file_id, comment_id))
