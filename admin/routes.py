"""Espace administrateur.

Mêmes adresses qu'avant pour le tableau de bord, la modification, la suppression
et le ban. La page des comptes et le changement de rôle complètent cette page,
qui était prévue mais pas encore branchée.
"""

from flask import Blueprint, jsonify, render_template, request
from flask_jwt_extended import jwt_required

from utils.access import require_roles, require_user, set_ban, set_role
from utils.dir import find_metadata_path
from utils.files import owner_of, public_metadata, read_metadata, remove_file, update_file
from utils.http import error_response
from utils.users import list_profiles, public_profile


# Les pages sont dans templates/ et le script dans static/.
admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


def _admin_only():
    """Compte connecté, puis contrôle du rôle admin."""
    user, error = require_user()
    if error:
        return None, error
    refused = require_roles(user, ("admin",))
    if refused:
        return None, refused
    return user, None


@admin_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    """Page pour parcourir les cours et modérer les fiches."""
    user, error = _admin_only()
    if error:
        return error
    return render_template(
        "staff_dashboard.html",
        profil=public_profile(user),
        prefix="/admin",
        comptes_url="/admin/comptes-page",
        titre="Espace administration",
    )


@admin_bp.route("/comptes-page", methods=["GET"])
@jwt_required()
def comptes_page():
    """Liste des comptes, avec changement de rôle et suspension."""
    user, error = _admin_only()
    if error:
        return error
    return render_template(
        "comptes.html",
        profil=public_profile(user),
        comptes=list_profiles(),
        prefix="/admin",
        peut_roles=True,
        titre="Comptes",
    )


@admin_bp.route("/dashboard/modify/<file_id>", methods=["GET"])
@jwt_required()
def modify_file(file_id):
    """Formulaire de modification d'une fiche, quel qu'en soit l'auteur."""
    user, error = _admin_only()
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
        save_url=f"/admin/dashboard/modify/save/{file_id}",
        retour_url="/admin/dashboard",
        titre="Modérer une fiche",
    )


@admin_bp.route("/dashboard/modify/save/<file_id>", methods=["POST"])
@jwt_required()
def save_modified_file(file_id):
    """Enregistre la modération. L'auteur d'origine est conservé."""
    _user, error = _admin_only()
    if error:
        return error
    owner, owner_error = owner_of(file_id)
    if owner_error:
        return owner_error
    return update_file(owner, file_id, request.form, request.files.get("file"))


@admin_bp.route("/dashboard/delete/<file_id>", methods=["DELETE"])
@jwt_required()
def delete_file(file_id):
    """Supprime une fiche et la retire du compte de son auteur."""
    _user, error = _admin_only()
    if error:
        return error
    owner, owner_error = owner_of(file_id)
    if owner_error:
        return owner_error
    return remove_file(owner, file_id)


@admin_bp.route("/dashboard/ban/<user_id>", methods=["POST"])
@jwt_required()
def ban_user(user_id):
    """Suspend un élève ou un modérateur. Le jeton déjà émis devient inutilisable."""
    user, error = _admin_only()
    if error:
        return error
    return set_ban(user, user_id, True)


@admin_bp.route("/dashboard/unban/<user_id>", methods=["POST"])
@jwt_required()
def unban_user(user_id):
    """Réactive un compte suspendu."""
    user, error = _admin_only()
    if error:
        return error
    return set_ban(user, user_id, False)


@admin_bp.route("/dashboard/role/<user_id>", methods=["POST"])
@jwt_required()
def change_role(user_id):
    """Donne le rôle élève, modérateur ou administrateur."""
    user, error = _admin_only()
    if error:
        return error
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Un objet JSON est requis"}), 400
    return set_role(user, user_id, data.get("role"))
