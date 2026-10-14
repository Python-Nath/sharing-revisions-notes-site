from flask import Flask, request, send_from_directory, render_template
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename 

from info.routes import info_bp
from users.routes import users_bp
from auth.routes import auth_bp

import os
import uuid
import secrets
from datetime import timedelta

from utils.json_utils import load_json_file, save_json_file
from database.model import User, db


app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024
app.config["JWT_SECRET_KEY"] = secrets.token_urlsafe(32)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_COOKIE_SECURE"] = False  # Set to True in production with HTTPS
app.config["JWT_COOKIE_CSRF_PROTECT"] = True
app.config["JWT_COOKIE_HTTPS_ONLY"] = False  # Set to True in production with HTTPS

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

jwt = JWTManager(app)
db.init_app(app)


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

    # Vérification du dossier
    directory = os.path.join("matiere", matiere, classe, specialite)

    if not os.path.isdir(directory):
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
    user.uploaded_metadatas[file_id] = metadata
    flag_modified(user, "uploaded_metadatas")

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

    directory = os.path.join(
        "matiere",
        matiere,
        classe,
        specialite
    )

    metadata_path = os.path.join(
        directory,
        f"{file_id}.json"
    )

    if not os.path.isfile(metadata_path):
        return {"error": "File not found"}, 404

    metadata = load_json_file(metadata_path)

    stored_filename = metadata["filename"]
    original_filename = metadata["original_filename"]

    user_id = get_jwt_identity()
    if user_id:
        user = User.query.get(user_id)
        user.download_ids = user.download_ids or []
        user.download_ids.append(file_id)
        user.download_metadatas = user.download_metadatas or {}
        user.download_metadatas[file_id] = metadata
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

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=8000, debug=False)

