import re
from flask import Flask, request, send_from_directory
import os
import uuid
import json

from werkzeug.utils import secure_filename 

app = Flask(__name__)
SAVE_FILES_FOLDER = "uploads"

os.makedirs(SAVE_FILES_FOLDER, exist_ok=True)

def load_json_file(file_path):
	with open(file_path, "r") as f:
		return json.load(f)

def save_json_file(file_path, data):
	with open(file_path, "w") as f:
		json.dump(data, f, indent=4, ensure_ascii=False)

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

@app.route("/info/matiere", methods=["GET"])
def get_matiere():
	matiere_list = os.listdir("matiere")
	return {"matiere": matiere_list}, 200

@app.route("/info/classe/<matiere>", methods=["GET"])
def get_classe(matiere):
	if matiere not in os.listdir("matiere"):
		return {"error": "Invalid matiere", "all": os.listdir("matiere")}, 404

	classe_list = os.listdir(os.path.join("matiere", matiere))
	return {"classe": classe_list}, 200

@app.route("/info/specialite/<matiere>/<classe>", methods=["GET"])
def get_specialite(matiere, classe):
	if matiere not in os.listdir("matiere"):
		return {"error": "Invalid matiere", "all": os.listdir("matiere")}, 404

	if classe not in os.listdir(os.path.join("matiere", matiere)):
		return {"error": "Invalid classe", "all": os.listdir(os.path.join("matiere", matiere))}, 404

	specialite_list = os.listdir(os.path.join("matiere", matiere, classe))
	return {"specialite": specialite_list}, 200

@app.route("/info/files/<matiere>/<classe>/<specialite>", methods=["GET"])
def get_files(matiere, classe, specialite):
    if matiere not in os.listdir("matiere"):
        return {"error": "Invalid matiere", "all": os.listdir("matiere")}, 404

    if classe not in os.listdir(os.path.join("matiere", matiere)):
        return {"error": "Invalid classe", "all": os.listdir(os.path.join("matiere", matiere))}, 404

    if specialite not in os.listdir(os.path.join("matiere", matiere, classe)):
        return {"error": "Invalid specialite", "all": os.listdir(os.path.join("matiere", matiere, classe))}, 404

    directory = os.path.join("matiere", matiere, classe, specialite)
    files_list = [
        filename
        for filename in os.listdir(directory)
        if filename.endswith(".json") and os.path.isfile(os.path.join(directory, filename))
    ]
    return {"files": files_list}, 200

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=8000, debug=False)

