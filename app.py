from flask import Flask, request, send_from_directory, render_template
from werkzeug.utils import secure_filename 

import os
import uuid

from utils.json_utils import load_json_file, save_json_file
from info.routes import info_bp


app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024

SAVE_FILES_FOLDER = "uploads"
os.makedirs(SAVE_FILES_FOLDER, exist_ok=True)

@app.route("/accueil", methods=["GET"])
def index():
	return render_template("index.html")

@app.route("/help", methods=["GET"])
def get_help():
	return {
		"message": "Welcome to the API!",
		"endpoints": {
			"/upload/<matiere>/<classe>/<specialite>": "Upload a file",
			"/download/<matiere>/<classe>/<specialite>/<file_id>": "Download a file",
			"/info/matiere": "Get list of subjects",
			"/info/classe/<matiere>": "Get list of classes for a subject",
			"/info/specialite/<matiere>/<classe>": "Get list of specializations for a subject and class",
			"/info/files/<matiere>/<classe>/<specialite>": "Get list of files for a subject, class, and specialization"
		}
	}, 200

@app.route("/upload/<matiere>/<classe>/<specialite>", methods=["POST"])
def upload_file(matiere, classe, specialite):

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
        "author": author,
        "desc": desc,
        "filename": stored_filename,
        "original_filename": filename
    }

    metadata_path = os.path.join(
        directory,
        f"{file_id}.json"
    )

    save_json_file(metadata_path, metadata)

    return {
        "message": "File uploaded successfully",
        "metadata": metadata
    }, 201

@app.route(
    "/download/<matiere>/<classe>/<specialite>/<file_id>",
    methods=["GET"]
)
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

    return send_from_directory(
        SAVE_FILES_FOLDER,
        stored_filename,
        as_attachment=True,
        download_name=original_filename
    )

app.register_blueprint(info_bp)

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=8000, debug=False)

