import os
import uuid
from flask import render_template, Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from pathlib import Path
from sqlalchemy.orm.attributes import flag_modified

from utils.json_utils import save_json_file, load_json_file
from database.model import User, db

users_bp = Blueprint("users", __name__, url_prefix="/users", template_folder=".", static_folder="static")

@users_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data_user = {
        "id": user.id,
        "name": user.name,
        "surname": user.surname,
        "username": user.username,
        "role": user.role,
        "created_at": user.created_at,
    }

    downloaded_files = user.download_ids if user.download_ids else []
    downloaded_metadatas = {}

    uploaded_files = user.uploaded_files if user.uploaded_files else []
    uploaded_metadatas = {}

    # Load metadata from filesystem (Source of Truth)
    for file_id in uploaded_files:
        cached_meta = user.uploaded_metadatas.get(file_id) if user.uploaded_metadatas else None
        if cached_meta:
            path = os.path.join("matiere", cached_meta["matiere"], cached_meta["classe"], cached_meta["specialite"], f"{file_id}.json")
            if os.path.exists(path):
                uploaded_metadatas[file_id] = load_json_file(path)

    for file_id in downloaded_files:
        cached_meta = user.download_metadatas.get(file_id)
        if cached_meta:
            path = os.path.join("matiere", cached_meta["matiere"], cached_meta["classe"], cached_meta["specialite"], f"{file_id}.json")
            if os.path.exists(path):
                downloaded_metadatas[file_id] = load_json_file(path)

    return render_template(
        "dashboard/dashboard.html",
        user=data_user,
        files_downloaded=downloaded_files,
        files_metadata_downloaded=downloaded_metadatas,
        files_uploaded=uploaded_files,
        files_metadata_uploaded=uploaded_metadatas
    ), 200

@users_bp.route("/dashboard/modify/<file_id>", methods=["GET"])
@jwt_required()
def modify_file(file_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if file_id not in (user.uploaded_files or []):
        return jsonify({"error": "File not found in user's uploads"}), 403

    # Load metadata from filesystem (Source of Truth)
    cached_meta = user.uploaded_metadatas.get(file_id) if user.uploaded_metadatas else None
    if not cached_meta:
        return jsonify({"error": "Metadata not found in database"}), 404

    path = os.path.join("matiere", cached_meta["matiere"], cached_meta["classe"], cached_meta["specialite"], f"{file_id}.json")
    if not os.path.exists(path):
        return jsonify({"error": "Metadata file not found on disk"}), 404

    metadata = load_json_file(path)
    return render_template("modify/modify.html", metadata=metadata), 200


@users_bp.route("/dashboard/modify/save/<file_id>", methods=["POST"])
@jwt_required()
def save_modified_file(file_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if file_id not in (user.uploaded_files or []):
        return jsonify({
            "error": "File not found in user's uploads"
        }), 403

    # Transition to multipart/form-data
    matiere = request.form.get("matiere")
    classe = request.form.get("classe")
    specialite = request.form.get("specialite")
    title = request.form.get("title")
    desc = request.form.get("desc")
    stored_filename = request.form.get("stored_filename")
    author = user.username
    original_filename = request.form.get("original_filename")

    if not all([matiere, classe, specialite]):
        return jsonify({"error": "Missing required metadata fields"}), 400

    matiere = secure_filename(matiere)
    classe = secure_filename(classe)
    specialite = secure_filename(specialite)

    if not matiere or not classe or not specialite:
        return jsonify({
            "error": "Invalid matiere, classe, or specialite"
        }), 400

    old_metadata = user.uploaded_metadatas.get(file_id) or {}
    metadata = {
        "id": file_id, 
        "title": title,
        "desc": desc,
        "matiere": matiere,
        "classe": classe,
        "specialite": specialite,
        "author": author,
        "filename": stored_filename,
        "original_filename": original_filename
    }
    # Validate an optional uploaded file
    uploaded_file = request.files.get("file")
    new_file_path = None
    old_file_path = None

    if uploaded_file and uploaded_file.filename:
        filename = secure_filename(uploaded_file.filename)
        if not filename:
            return jsonify({"error": "Invalid filename"}), 400

        stored_filename = f"{file_id}_{filename}"
        new_file_path = (Path("uploads") / stored_filename).resolve()
        if not new_file_path.is_relative_to(Path("uploads").resolve()):
            return jsonify({"error": "Invalid file path"}), 400
        metadata["filename"] = stored_filename
        metadata["original_filename"] = filename

    # Prepare the metadata path
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

    old_metadata_path = None
    if old_metadata.get("matiere") and old_metadata.get("classe") and old_metadata.get("specialite"):
        old_metadata_path = (
            base_dir
            / secure_filename(old_metadata["matiere"])
            / secure_filename(old_metadata["classe"])
            / secure_filename(old_metadata["specialite"])
            / f"{file_id}.json"
        ).resolve()
        if not old_metadata_path.is_relative_to(base_dir):
            return jsonify({"error": "Invalid existing metadata path"}), 400

    try:
        if uploaded_file and uploaded_file.filename and new_file_path:
            uploaded_file.save(new_file_path)
        save_json_file(metadata_path, metadata)

        if user.uploaded_metadatas is None:
            user.uploaded_metadatas = {}

        metadata_user = {
            "id": file_id,
            "filename": stored_filename,
            "matiere": matiere,
            "classe": classe,
            "specialite": specialite
        }
        user.uploaded_metadatas[file_id] = metadata_user
        flag_modified(user, "uploaded_metadatas")
        db.session.commit()

    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to save modified file metadata or upload")
        return jsonify({
            "error": "Failed to save metadata or file"
        }), 500

    if old_metadata_path and old_metadata_path != metadata_path and old_metadata_path.exists():
        old_metadata_path.unlink()
    if old_file_path and old_file_path != new_file_path and old_file_path.exists():
        old_file_path.unlink()

    return jsonify({
        "message": "Metadata and file updated successfully"
    }), 200

@users_bp.route("/dashboard/delete/<file_id>", methods=["DELETE"])
@jwt_required()
def delete_file(file_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if file_id not in (user.uploaded_files or []):
        return jsonify({"error": "File not found in user's uploads"}), 403

    metadata = user.uploaded_metadatas.get(file_id)
    if not metadata:
        return jsonify({"error": "Metadata not found for the specified file"}), 404

    stored_filename = metadata["filename"]
    matiere = secure_filename(metadata["matiere"])
    classe = secure_filename(metadata["classe"])
    specialite = secure_filename(metadata["specialite"])

    if not matiere or not classe or not specialite:
        return jsonify({"error": "Invalid matiere, classe, or specialite"}), 400

    directory = Path("matiere") / matiere / classe / specialite
    file_path = Path("uploads") / stored_filename
    metadata_path = directory / f"{file_id}.json"

    if file_path.exists():
        file_path.unlink()

    if metadata_path.exists():
        metadata_path.unlink()

    user.uploaded_files.remove(file_id)
    if user.uploaded_metadatas:
        user.uploaded_metadatas.pop(file_id, None)

    flag_modified(user, "uploaded_files")
    flag_modified(user, "uploaded_metadatas")
    db.session.commit()

    return jsonify({"message": "File and its metadata deleted successfully"}), 200