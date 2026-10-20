"""Espace élève : ses envois, ses téléchargements, la modification et la suppression.

Un élève ne peut agir que sur les fiches présentes dans son propre compte,
et dont il est aussi l'auteur dans le JSON.
"""

from flask import Blueprint, jsonify, render_template, request
from flask_jwt_extended import jwt_required

from utils.access import require_user
from utils.audit_perso import collecter_audit_perso
from utils.dir import find_metadata_path
from utils.etoiles import annoter
from utils.files import files_from_cache, owner_of, read_metadata, remove_file, update_file
from utils.files import public_metadata
from utils.http import error_response
from utils.security import is_uuid
from utils.users import public_profile


# Les pages sont dans templates/ et le script dans static/.
users_bp = Blueprint("users", __name__, url_prefix="/users")


@users_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    """Tableau de bord : fiches envoyées et fiches téléchargées."""
    user, error = require_user()
    if error:
        return error

    uploaded = annoter(files_from_cache(user.uploaded_files, user.uploaded_metadatas), user)
    downloaded = annoter(files_from_cache(user.download_ids, user.download_metadatas), user)
    return render_template(
        "user_dashboard.html",
        profil=public_profile(user, include_status=True),
        envoyes=uploaded,
        telecharges=downloaded,
    )


@users_bp.route("/audit", methods=["GET"])
@jwt_required()
def audit_page():
    """Relevé des fiches de ce compte, et de rien d'autre."""
    user, error = require_user()
    if error:
        return error
    return render_template(
        "audit_perso.html",
        profil=public_profile(user),
        audit=collecter_audit_perso(user),
        titre="Audit de mes fiches",
    )


@users_bp.route("/audit.json", methods=["GET"])
@jwt_required()
def audit_json():
    """Même relevé, pour actualiser la page sans mélanger les comptes."""
    user, error = require_user()
    if error:
        return error
    return jsonify(collecter_audit_perso(user)), 200


@users_bp.route("/dashboard/modify/<file_id>", methods=["GET"])
@jwt_required()
def modify_file(file_id):
    """Formulaire de modification d'une fiche qui appartient à l'élève."""
    user, error = require_user()
    if error:
        return error
    if not is_uuid(file_id) or file_id not in (user.uploaded_files or []):
        return error_response("Fiche introuvable", 404)

    owner, owner_error = owner_of(file_id)
    if owner_error:
        return owner_error
    if owner.id != user.id:
        return error_response("Accès refusé", 403)

    metadata = read_metadata(find_metadata_path(file_id))
    if metadata is None:
        return error_response("Fiche introuvable", 404)

    return render_template(
        "modifier.html",
        metadata=public_metadata(metadata),
        save_url=f"/users/dashboard/modify/save/{file_id}",
        retour_url="/users/dashboard",
        titre="Modifier ma fiche",
    )


@users_bp.route("/dashboard/modify/save/<file_id>", methods=["POST"])
@jwt_required()
def save_modified_file(file_id):
    """Enregistre le formulaire de modification."""
    user, error = require_user()
    if error:
        return error
    return update_file(user, file_id, request.form, request.files.get("file"), acteur=user)


@users_bp.route("/dashboard/delete/<file_id>", methods=["DELETE"])
@jwt_required()
def delete_file(file_id):
    """Supprime une fiche de l'élève."""
    user, error = require_user()
    if error:
        return error
    return remove_file(user, file_id)
