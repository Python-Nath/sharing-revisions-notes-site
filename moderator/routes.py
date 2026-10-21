"""Espace modérateur.

Un modérateur peut corriger ou retirer une fiche, et suspendre un élève.
Il ne peut ni créer un administrateur, ni suspendre un membre de l'équipe.
"""

from flask import Blueprint, jsonify, render_template, request
from flask_jwt_extended import jwt_required

from utils.access import require_roles, require_user, set_ban
from utils.recherche import chercher_comptes
from utils.dir import find_metadata_path
from utils.files import owner_of, public_metadata, read_metadata, remove_file, update_file
from utils.http import error_response
from utils.users import list_profiles, public_profile


# Les pages sont dans templates/ et le script dans static/.
moderator_bp = Blueprint("moderator", __name__, url_prefix="/moderator")


def _staff_only():
    """Compte connecté : modérateur, administrateur ou propriétaire."""
    user, error = require_user()
    if error:
        return None, error
    refused = require_roles(user, ("admin", "moderator", "owner"))
    if refused:
        return None, refused
    return user, None


@moderator_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    """Page pour parcourir les cours et modérer les fiches."""
    user, error = _staff_only()
    if error:
        return error
    return render_template(
        "staff_dashboard.html",
        profil=public_profile(user),
        prefix="/moderator",
        comptes_url="/moderator/comptes-page",
        titre="Espace modération",
    )


@moderator_bp.route("/comptes-page", methods=["GET"])
@jwt_required()
def comptes_page():
    """Liste des comptes. La suspension d'un élève est la seule action proposée."""
    user, error = _staff_only()
    if error:
        return error
    return render_template(
        "comptes.html",
        profil=public_profile(user),
        comptes=list_profiles(),
        prefix="/moderator",
        peut_roles=False,
        titre="Comptes",
    )


@moderator_bp.route("/comptes/recherche", methods=["GET"])
@jwt_required()
def recherche_comptes():
    """Comptes selon le nom, le rôle ou l'état. Un élève reçoit un refus."""
    _user, error = _staff_only()
    if error:
        return error
    resultat, erreur = chercher_comptes(request.args)
    if erreur:
        return jsonify({"error": erreur[0]}), erreur[1]
    return jsonify(resultat), 200


@moderator_bp.route("/dashboard/modify/<file_id>", methods=["GET"])
@jwt_required()
def modify_file(file_id):
    """Formulaire de modification d'une fiche."""
    _user, error = _staff_only()
    if error:
        return error
    owner, owner_error = owner_of(file_id)
    if owner_error:
        return owner_error
    metadata = read_metadata(find_metadata_path(file_id))
    if metadata is None:
        return error_response("Fiche introuvable", 404)
    return render_template(
        "modifier.html",
        metadata=public_metadata(metadata),
        save_url=f"/moderator/dashboard/modify/save/{file_id}",
        retour_url="/moderator/dashboard",
        titre="Modérer une fiche",
    )


@moderator_bp.route("/dashboard/modify/save/<file_id>", methods=["POST"])
@jwt_required()
def save_modified_file(file_id):
    """Enregistre la modération sans changer l'auteur."""
    _user, error = _staff_only()
    if error:
        return error
    owner, owner_error = owner_of(file_id)
    if owner_error:
        return owner_error
    return update_file(owner, file_id, request.form, request.files.get("file"), acteur=_user)


@moderator_bp.route("/dashboard/delete/<file_id>", methods=["DELETE"])
@jwt_required()
def delete_file(file_id):
    """Supprime une fiche."""
    _user, error = _staff_only()
    if error:
        return error
    return remove_file(_user, file_id)


@moderator_bp.route("/dashboard/ban/<user_id>", methods=["POST"])
@jwt_required()
def ban_user(user_id):
    """Suspend un élève. Un modérateur ou un administrateur est protégé."""
    user, error = _staff_only()
    if error:
        return error
    return set_ban(user, user_id, True)


@moderator_bp.route("/dashboard/unban/<user_id>", methods=["POST"])
@jwt_required()
def unban_user(user_id):
    """Réactive un élève."""
    user, error = _staff_only()
    if error:
        return error
    return set_ban(user, user_id, False)
