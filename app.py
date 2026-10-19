from flask import Flask, jsonify, request, send_from_directory, render_template
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from sqlalchemy.orm.attributes import flag_modified

from info.routes import info_bp
from users.routes import users_bp
from auth.routes import auth_bp
from moderator.routes import moderator_bp
from admin.routes import admin_bp

import os
import uuid
from pathlib import Path
from datetime import timedelta
import secrets

from utils.json_utils import load_json_file, save_json_file
from database.model import User, db


app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024
app.config["JWT_SECRET_KEY"] = secrets.token_urlsafe(64)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_COOKIE_SECURE"] = False  # Set to True in production with HTTPS
app.config["JWT_COOKIE_CSRF_PROTECT"] = True
app.config["JWT_COOKIE_HTTPS_ONLY"] = False  # Set to True in production with HTTPS

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

jwt = JWTManager(app)
db.init_app(app)

with app.app_context():
    db.create_all()


@jwt.token_in_blocklist_loader
def is_token_revoked(jwt_header, jwt_payload):
    user = User.query.get(jwt_payload["sub"])
    return user is None or user.is_ban


@jwt.revoked_token_loader
def handle_revoked_token(jwt_header, jwt_payload):
    return jsonify({"error": "User is unavailable or banned"}), 401


SAVE_FILES_FOLDER = "uploads"
os.makedirs(SAVE_FILES_FOLDER, exist_ok=True)

@app.route("/accueil")
def accueil():
    return render_template("index.html")

@app.route("/upload/<matiere>/<classe>/<specialite>", methods=["POST"])
@jwt_required()
def upload_file(matiere, classe, specialite):

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return {"error": "User not found"}, 404

    # Vérification du dossier
    base_dir = Path("matiere").resolve()
    directory = (base_dir / matiere / classe / specialite).resolve()

    if not directory.is_relative_to(base_dir) or not directory.is_dir():
        return {"error": "Invalid path"}, 404

    # Vérification du fichier
    if "file" not in request.files:
        return {"error": "No file part"}, 400

    file = request.files["file"]

    if not file.filename:
        return {"error": "No selected file"}, 400

    filename = secure_filename(file.filename)

    if not filename:
        return {"error": "Invalid filename"}, 400

    # Métadonnées
    title = request.form.get("title")
    author = request.form.get("author")
    desc = request.form.get("desc")

    if not all([title, author, desc]):
        return {
            "error": "Missing title, author, or description"
        }, 400

    # Nom interne unique
    file_id = str(uuid.uuid4())
    stored_filename = f"{file_id}_{filename}"

    file_path = os.path.join(
        SAVE_FILES_FOLDER,
        stored_filename
    )

    # Sauvegarde
    file.save(file_path)

    metadata = {
        "id": file_id,
        "title": title,
        "author": user.username,
        "desc": desc,
        "filename": stored_filename,
        "original_filename": filename,
        "matiere": matiere,
        "classe": classe,
        "specialite": specialite
    }

    metadata_path = os.path.join(
        directory,
        f"{file_id}.json"
    )

    save_json_file(metadata_path, metadata)

    # Mise à jour de l'utilisateur
    if user.uploaded_files is None:
        user.uploaded_files = []
    if user.uploaded_metadatas is None:
        user.uploaded_metadatas = {}

    user.uploaded_files.append(file_id)
    flag_modified(user, "uploaded_files")

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

    return {
        "message": "File uploaded successfully",
        "metadata": metadata
    }, 201

@app.route(
    "/download/<matiere>/<classe>/<specialite>/<file_id>",
    methods=["GET"]
)
@jwt_required(optional=True)
def download_file(matiere, classe, specialite, file_id):

    base_dir = Path("matiere").resolve()
    directory = (base_dir / matiere / classe / specialite).resolve()

    if not directory.is_relative_to(base_dir):
        return {"error": "Invalid path"}, 400

    metadata_path = os.path.join(
        directory,
        f"{file_id}.json"
    )

    if not os.path.isfile(metadata_path):
        return {"error": "File not found"}, 404

    metadata = load_json_file(metadata_path)
    if not isinstance(metadata, dict):
        return {"error": "Invalid file metadata"}, 404

    stored_filename = metadata.get("filename")
    original_filename = metadata.get("original_filename")
    if (
        not isinstance(stored_filename, str)
        or not stored_filename
        or secure_filename(stored_filename) != stored_filename
        or not isinstance(original_filename, str)
        or not original_filename
    ):
        return {"error": "Invalid file metadata"}, 404

    uploads_dir = Path(SAVE_FILES_FOLDER).resolve()
    file_path = (uploads_dir / stored_filename).resolve()
    if not file_path.is_relative_to(uploads_dir) or not file_path.is_file():
        return {"error": "File not found"}, 404

    user_id = get_jwt_identity()
    if user_id:
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found"}, 404
        user.download_ids = user.download_ids or []
        if file_id not in user.download_ids:
            user.download_ids.append(file_id)
            flag_modified(user, "download_ids")
        user.download_metadatas = user.download_metadatas or {}
        metadata_user = {
            "id": file_id,
            "filename": stored_filename,
            "matiere": matiere,
            "classe": classe,
            "specialite": specialite
        }
        user.download_metadatas[file_id] = metadata_user
        flag_modified(user, "download_metadatas")
        db.session.commit()
        

    return send_from_directory(
        SAVE_FILES_FOLDER,
        stored_filename,
        as_attachment=True,
        download_name=original_filename
    )

app.register_blueprint(info_bp)
app.register_blueprint(users_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(moderator_bp)
app.register_blueprint(admin_bp)

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=8000, debug=False)
