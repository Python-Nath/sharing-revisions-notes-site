from flask import render_template, Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity, set_access_cookies, unset_jwt_cookies
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename

from pathlib import Path
from sqlalchemy.orm.attributes import flag_modified

from utils.json_utils import save_json_file
from database.model import User, db

users_bp = Blueprint("users", __name__, url_prefix="/users", template_folder=".", static_folder="users/static")

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

    data_files_downloaded = user.download_ids if user.download_ids else []
    files_metadata_downloaded = user.download_metadatas if user.download_metadatas else []

    uploaded_files = user.uploaded_files if user.uploaded_files else []
    uploaded_metadatas = user.uploaded_metadatas if user.uploaded_metadatas else []



    return render_template(
        "users/dashboard/dashboard.html", 
        user=data_user, 
        files_downloaded=data_files_downloaded, 
        files_metadata_downloaded=files_metadata_downloaded,
        files_uploaded=uploaded_files,
        files_metadata_uploaded=uploaded_metadatas
    ), 200

@users_bp.route("/dashboard/modify", methods=["POST"])
@jwt_required()
def modify_file():
    data = request.get_json()
    file_id = data.get("file_id")
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if file_id not in user.uploaded_files:
        return jsonify({"error": "File not found in user's uploads"}), 403
    metadata = user.uploaded_metadatas.get(file_id)
    if not metadata:
        return jsonify({"error": "Metadata not found for the specified file"}), 404

    return render_template("users/modify/modify.html", metadata=metadata), 200


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

    if not all([matiere, classe, specialite]):
        return jsonify({"error": "Missing required metadata fields"}), 400

    matiere = secure_filename(matiere)
    classe = secure_filename(classe)
    specialite = secure_filename(specialite)

    if not matiere or not classe or not specialite:
        return jsonify({
            "error": "Invalid matiere, classe, or specialite"
        }), 400

    # Reconstruct metadata object
    old_metadata = user.uploaded_metadatas.get(file_id) or {}
    metadata = {
        **old_metadata,
        "matiere": matiere,
        "classe": classe,
        "specialite": specialite,
        "title": title if title else old_metadata.get("title", "Sans titre")
    }

    # Validate an optional uploaded file
    uploaded_file = request.files.get("file")
    file_path = None
    stored_filename = None

    if uploaded_file:
        # Supprimer l'ancien fichier physique s'il existe
        old_metadata = user.uploaded_metadatas.get(file_id)
        if old_metadata and "filename" in old_metadata:
            old_file_path = Path("uploads") / old_metadata["filename"]
            if old_file_path.exists():
                old_file_path.unlink()

        filename = secure_filename(uploaded_file.filename or "")
        if not filename:
            return jsonify({"error": "Invalid filename"}), 400

        stored_filename = f"{file_id}_{filename}"
        file_path = Path("uploads") / stored_filename

        # Sécurité : vérifier que le fichier est bien dans uploads/
        if not file_path.resolve().is_relative_to(Path("uploads").resolve()):
            return jsonify({"error": "Invalid file path"}), 400

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

    try:
        # Save the optional file
        if uploaded_file and file_path:
            file_path.parent.mkdir(parents=True, exist_ok=True)
            uploaded_file.save(file_path)


        # Save the JSON metadata
        save_json_file(metadata_path, metadata)

        # Update the database
        if user.uploaded_metadatas is None:
            user.uploaded_metadatas = {}

        user.uploaded_metadatas[file_id] = metadata
        flag_modified(user, "uploaded_metadatas")

        db.session.commit()

    except Exception:
        db.session.rollback()

        # In production, log the exception here.
        return jsonify({
            "error": "Failed to save metadata or file"
        }), 500

    return jsonify({
        "message": "Metadata and file updated successfully"
    }), 200

@users_bp.route("/dashboard/delete/<file_id>", methods=["POST"])
@jwt_required()
def delete_file(file_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if file_id not in user.uploaded_files:
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
    del user.uploaded_metadatas[file_id]
    flag_modified(user, "uploaded_files")
    flag_modified(user, "uploaded_metadatas")
    db.session.commit()

    return jsonify({"message": "File and its metadata deleted successfully"}), 200

    

