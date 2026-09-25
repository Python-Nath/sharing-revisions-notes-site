import re
from flask import Flask, request, send_from_directory
import os
import uuid
import json

from werkzeug.utils import secure_filename 

app = Flask(__name__)
SAVE_FILES_FOLDER = "saves"

os.makedirs(SAVE_FILES_FOLDER, exist_ok=True)

def load_json_file(file_path):
	with open(file_path, "r") as f:
		return json.load(f)

def save_json_file(file_path, data):
	with open(file_path, "w") as f:
		json.dump(data, f, indent=4, ensure_ascii=False)



app.route("/upload/<matiere>/<classe>/<specialite>", methods=["POST"])
def upload_file(matiere, classe, specialite):
	if "file" not in request.files:
		return {"error": "No file part"}, 400

	if os.path.join(matiere) not in os.listdir("matiere"):
		return {"error": "Invalid matiere", "all": os.listdir("matiere")}, 400

	if os.path.join(matiere, classe) not in os.listdir(os.path.join("matiere", matiere)):
		return {"error": "Invalid classe", "all": os.listdir(os.path.join("matiere", matiere))}, 400

	if os.path.join(matiere, classe, specialite) not in os.listdir(os.path.join("matiere", matiere, classe)):
		return {"error": "Invalid specialite", "all": os.listdir(os.path.join("matiere", matiere, classe))}, 400
	
	file = request.files["file"]
	title = request.form.get("title")
	author = request.form.get("author")
	desc = request.form.get("desc")

	if not title or not author or not desc:
		return {"error": "Missing title, author, or description"}, 400

	if file.filename == "":
		return {"error": "No selected file"}, 400

	if file:
		filename = secure_filename(file.filename)
		unique_filename = f"{uuid.uuid4()}_{filename}"
		file_path = os.path.join(SAVE_FILES_FOLDER, unique_filename)
		file.save(file_path)

		metadata = {
			"title": title,
			"author": author,
			"desc": desc,
			"filename": unique_filename
		}

		metadata_path = os.path.join(matiere, classe, specialite, f"{unique_filename}.json")
		save_json_file(metadata_path, metadata)

		return {"message": "File uploaded successfully", "metadata": metadata}, 200

@app.route("/download/<matiere>/<classe>/<specialite>/<filename>", methods=["GET"])
def download_file(matiere, classe, specialite, filename):
	json_path = os.path.join(matiere, classe, specialite, filename)
	if not os.path.exists(json_path):
		return {"error": "File not found"}, 404

	with open(json_path, "r") as f:
		metadata = json.load(f)

	filename = re.sub(
    r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}_',
    '',
    metadata["filename"]
	)
	filename = filename[:-5]  # Remove the last 5 characters (".json")
	file_path = os.path.join(SAVE_FILES_FOLDER, metadata["filename"])
	return send_from_directory(os.path.dirname(file_path), os.path.basename(file_path), as_attachment=True, download_name=filename)

@app.route("/info/matiere", methods=["GET"])
def get_matiere():
	matiere_list = os.listdir("matiere")
	return {"matiere": matiere_list}, 200

@app.route("/info/classe/<matiere>", methods=["GET"])
def get_classe(matiere):
	if os.path.join(matiere) not in os.listdir("matiere"):
		return {"error": "Invalid matiere", "all": os.listdir("matiere")}, 400

	classe_list = os.listdir(os.path.join("matiere", matiere))
	return {"classe": classe_list}, 200

@app.route("/info/specialite/<matiere>/<classe>", methods=["GET"])
def get_specialite(matiere, classe):
	if os.path.join(matiere) not in os.listdir("matiere"):
		return {"error": "Invalid matiere", "all": os.listdir("matiere")}, 400

	if os.path.join(matiere, classe) not in os.listdir(os.path.join("matiere", matiere)):
		return {"error": "Invalid classe", "all": os.listdir(os.path.join("matiere", matiere))}, 400

	specialite_list = os.listdir(os.path.join("matiere", matiere, classe))
	return {"specialite": specialite_list}, 200

@app.route("/info/files/<matiere>/<classe>/<specialite>", methods=["GET"])
def get_files(matiere, classe, specialite):
	if os.path.join(matiere) not in os.listdir("matiere"):
		return {"error": "Invalid matiere", "all": os.listdir("matiere")}, 400

	if os.path.join(matiere, classe) not in os.listdir(os.path.join("matiere", matiere)):
		return {"error": "Invalid classe", "all": os.listdir(os.path.join("matiere", matiere))}, 400

	if os.path.join(matiere, classe, specialite) not in os.listdir(os.path.join("matiere", matiere, classe)):
		return {"error": "Invalid specialite", "all": os.listdir(os.path.join("matiere", matiere, classe))}, 400

	files_list = os.listdir(os.path.join("matiere", matiere, classe, specialite))
	return {"files": files_list}, 200

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=8080, debug=False)

