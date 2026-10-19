from flask import render_template, Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from pathlib import Path
import uuid
from sqlalchemy.orm.attributes import flag_modified

from utils.json_utils import save_json_file, load_json_file
from utils.dir import find_metadata_path
from database.model import User, db

moderator_bp = Blueprint("moderator", __name__, url_prefix="/moderator", template_folder=".", static_folder="moderator/static")

@moderator_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role not in ["admin", "moderator"]:
        return jsonify({"error": "Unauthorized"}), 403

    data_user = {
        "id": user.id,
        "name": user.name,
        "surname": user.surname,
        "username": user.username,
        "role": user.role,
        "created_at": user.created_at,
    }
    return render_template(
        "dashboard/dashboard.html",
        user=data_user,
    ), 200

@moderator_bp.route("/dashboard/modify/<file_id>", methods=["GET"])
@jwt_required()
def modify_file(file_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role not in ["admin", "moderator"]:
        return jsonify({"error": "Unauthorized"}), 403

    metadata_path = find_metadata_path(file_id)
    if metadata_path is None:
        return jsonify({"error": "Metadata not found for the specified file"}), 404

    metadata = load_json_file(metadata_path)
    if not metadata:
        return jsonify({"error": "Invalid file metadata"}), 404

    return render_template("modify/modify.html", metadata=metadata), 200
@moderator_bp.route("/dashboard/modify/save/<file_id>", methods=["POST"])
@jwt_required()
def save_modified_file(file_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role not in ["admin", "moderator"]:
        return jsonify({"error": "Unauthorized"}), 403

    old_metadata_path = find_metadata_path(file_id)
    if old_metadata_path is None:
        return jsonify({"error": "Metadata not found for the specified file"}), 404
    old_metadata_path = old_metadata_path.resolve()

    old_metadata = load_json_file(old_metadata_path)
    if (
        not isinstance(old_metadata, dict)
    ):
        return jsonify({"error": "Invalid file metadata"}), 404

    old_stored_filename = old_metadata.get("filename")
    old_original_filename = old_metadata.get("original_filename")
    if (
        not old_metadata.get("author")
        or not isinstance(old_stored_filename, str)
        or not old_stored_filename
        or secure_filename(old_stored_filename) != old_stored_filename
        or not isinstance(old_original_filename, str)
        or not old_original_filename
    ):
        return jsonify({"error": "Invalid file metadata"}), 404

    owner = User.query.filter_by(username=old_metadata["author"]).first()
    if not owner:
        return jsonify({"error": "File owner not found"}), 404
    if file_id not in (owner.uploaded_files or []):
        return jsonify({"error": "File not found in owner's uploads"}), 404

    matiere = request.form.get("matiere")
    classe = request.form.get("classe")
    specialite = request.form.get("specialite")
    title = request.form.get("title", old_metadata.get("title"))
    desc = request.form.get("desc", old_metadata.get("desc"))

    if not all([matiere, classe, specialite]):
        return jsonify({"error": "Missing required metadata fields"}), 400

    matiere = secure_filename(matiere)
    classe = secure_filename(classe)
    specialite = secure_filename(specialite)

    if not matiere or not classe or not specialite:
        return jsonify({
            "error": "Invalid matiere, classe, or specialite"
        }), 400

    metadata = {
        "id": file_id,
        "title": title,
        "desc": desc,
        "matiere": matiere,
        "classe": classe,
        "specialite": specialite,
        "author": old_metadata["author"],
        "filename": old_stored_filename,
        "original_filename": old_original_filename
    }

    uploaded_file = request.files.get("file")
    uploads_dir = Path("uploads").resolve()
    old_file_path = (uploads_dir / old_stored_filename).resolve()
    if not old_file_path.is_relative_to(uploads_dir):
        return jsonify({"error": "Invalid existing file path"}), 400

    new_file_path = None
    if uploaded_file and uploaded_file.filename:
        filename = secure_filename(uploaded_file.filename or "")
        if not filename:
            return jsonify({"error": "Invalid filename"}), 400

        metadata["filename"] = f"{file_id}_{filename}"
        metadata["original_filename"] = filename
        new_file_path = (uploads_dir / metadata["filename"]).resolve()
        if not new_file_path.is_relative_to(uploads_dir):
            return jsonify({"error": "Invalid file path"}), 400
        if new_file_path == old_file_path:
            metadata["filename"] = f"{file_id}_{uuid.uuid4().hex}_{filename}"
            new_file_path = (uploads_dir / metadata["filename"]).resolve()

    base_dir = Path("matiere").resolve()
    metadata_path = (
        base_dir
        / matiere
        / classe
        / specialite
        / f"{file_id}.json"
    ).resolve()

    if not metadata_path.is_relative_to(base_dir):
        return jsonify({"error": "Invalid path"}), 400
    if not metadata_path.parent.is_dir():
        return jsonify({"error": "Destination category does not exist"}), 404

    original_metadata = dict(old_metadata)
    try:
        if new_file_path:
            uploaded_file.save(new_file_path)
        save_json_file(metadata_path, metadata)

        if owner.uploaded_metadatas is None:
            owner.uploaded_metadatas = {}

        owner.uploaded_metadatas[file_id] = {
            "id": file_id,
            "filename": metadata["filename"],
            "matiere": matiere,
            "classe": classe,
            "specialite": specialite
        }
        flag_modified(owner, "uploaded_metadatas")

        for download_owner in User.query.all():
            download_metadatas = download_owner.download_metadatas or {}
            if file_id in download_metadatas:
                download_metadatas[file_id] = {
                    "id": file_id,
                    "filename": metadata["filename"],
                    "matiere": matiere,
                    "classe": classe,
                    "specialite": specialite
                }
                download_owner.download_metadatas = download_metadatas
                flag_modified(download_owner, "download_metadatas")

        db.session.commit()

    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to save moderator file changes")
        if metadata_path != old_metadata_path and metadata_path.exists():
            metadata_path.unlink()
        elif old_metadata_path.exists():
            save_json_file(old_metadata_path, original_metadata)
        if new_file_path and new_file_path != old_file_path and new_file_path.exists():
            new_file_path.unlink()
        return jsonify({
            "error": "Failed to save metadata or file"
        }), 500

    if old_metadata_path != metadata_path and old_metadata_path.exists():
        old_metadata_path.unlink()
    if new_file_path and new_file_path != old_file_path and old_file_path.exists():
        old_file_path.unlink()

    return jsonify({
        "message": "Metadata and file updated successfully"
    }), 200

@moderator_bp.route("/dashboard/delete/<file_id>", methods=["DELETE"])
@jwt_required()
def delete_file(file_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role not in ["admin", "moderator"]:
        return jsonify({"error": "Unauthorized"}), 403

    metadata_path = find_metadata_path(file_id)
    if metadata_path is None:
        return jsonify({"error": "Metadata not found for the specified file"}), 404

    metadata = load_json_file(metadata_path)
    if not isinstance(metadata, dict):
        return jsonify({"error": "Invalid file metadata"}), 404

    user_author = User.query.filter_by(username=metadata.get("author")).first()
    if not user_author:
        return jsonify({"error": "File owner not found"}), 404
    if file_id not in (user_author.uploaded_files or []):
        return jsonify({"error": "File not found in owner's uploads"}), 404

    stored_filename = metadata.get("filename")
    if (
        not isinstance(stored_filename, str)
        or not stored_filename
        or secure_filename(stored_filename) != stored_filename
    ):
        return jsonify({"error": "Invalid stored filename"}), 400

    base_dir = Path("matiere").resolve()
    metadata_path = metadata_path.resolve()
    if not metadata_path.is_relative_to(base_dir):
        return jsonify({"error": "Invalid metadata path"}), 400

    uploads_dir = Path("uploads").resolve()
    file_path = (uploads_dir / stored_filename).resolve()
    if not file_path.is_relative_to(uploads_dir):
        return jsonify({"error": "Invalid stored file path"}), 400

    user_author.uploaded_files.remove(file_id)
    user_author.uploaded_metadatas = user_author.uploaded_metadatas or {}
    user_author.uploaded_metadatas.pop(file_id, None)
    flag_modified(user_author, "uploaded_files")
    flag_modified(user_author, "uploaded_metadatas")
    db.session.commit()

    if file_path.exists():
        file_path.unlink()
    metadata_path.unlink()

    return jsonify({"message": "File and its metadata deleted successfully"}), 200

@moderator_bp.route("/dashboard/ban/<user_id>", methods=["POST"])
@jwt_required()
def ban_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    if current_user.role not in ["admin", "moderator"]:
        return jsonify({"error": "Unauthorized"}), 403

    user_to_ban = User.query.get(user_id)

    if not user_to_ban:
        return jsonify({"error": "User not found"}), 404

    user_to_ban.is_ban = True
    db.session.commit()

    return jsonify({"message": f"User {user_to_ban.username} has been banned."}), 200

@moderator_bp.route("/dashboard/unban/<user_id>", methods=["POST"])
@jwt_required()
def unban_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    if current_user.role not in ["admin", "moderator"]:
        return jsonify({"error": "Unauthorized"}), 403

    user_to_unban = User.query.get(user_id)

    if not user_to_unban:
        return jsonify({"error": "User not found"}), 404

    user_to_unban.is_ban = False
    db.session.commit()

    return jsonify({"message": f"User {user_to_unban.username} has been unbanned."}), 200

    
