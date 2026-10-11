from flask import render_template, Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity, set_access_cookies, unset_jwt_cookies
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename

from pathlib import Path
from sqlalchemy.orm.attributes import flag_modified

from utils.json_utils import save_json_file
from database.model import User, db

users_bp = Blueprint("users", __name__, url_prefix="/users")

@users_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=user.id)
    set_access_cookies(jsonify({"login": True}), access_token)

    return jsonify({"message": "Login successful"}), 200

@users_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    response = jsonify({"message": "Logout successful"})
    unset_jwt_cookies(response)
    return response, 200

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
        return jsonify({"Unauthorized": "File not found in user's uploads"}), 403
    metadata = user.uploaded_metadatas.get(file_id)
    if not metadata:
        return jsonify({"error": "Metadata not found for the specified file"}), 404

    return render_template("users/modify/modify.html", metadata=metadata), 200

@users_bp.route("/dashboard/modify/save/<file_id>", methods=["POST"])
@jwt_required()
def save_modified_file(file_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if file_id not in user.uploaded_files:
        return jsonify({"Unauthorized": "File not found in user's uploads"}), 403

    data = request.get_json()
    metadata = data.get("metadata")

    if not metadata:
        return jsonify({"error": "No metadata provided"}), 400

    user.uploaded_metadatas[file_id] = metadata
    flag_modified(user, "uploaded_metadatas")
    db.session.commit()

    matiere = secure_filename(metadata["matiere"])
    classe = secure_filename(metadata["classe"])
    specialite = secure_filename(metadata["specialite"])

    if not matiere or not classe or not specialite:
        return jsonify({"error": "Invalid matiere, classe, or specialite"}), 400

    metadata_path = Path("matiere") / matiere / classe / specialite / f"{file_id}.json"
    save_json_file(metadata_path, metadata)

    file = request.files.get("file")
    
    if file:
        filename = secure_filename(file.filename)

        if not filename:
            return {"error": "Invalid filename"}, 400

        stored_filename = f"{file_id}_{filename}"
        file_path = Path("uploads") / stored_filename
        file.save(file_path)

    return jsonify({"message": "Metadata and file updated successfully"}), 200

@users_bp.route("/dashboard/delete/<file_id>", methods=["POST"])
@jwt_required()
def delete_file(file_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if file_id not in user.uploaded_files:
        return jsonify({"Unauthorized": "File not found in user's uploads"}), 403

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
    flag_modified(user, "uploaded_metadatas")
    db.session.commit()

    return jsonify({"message": "File and its metadata deleted successfully"}), 200

    

