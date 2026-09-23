# I import the flask module for manage the API
from flask import Flask, request, send_from_directory
import os
import uuid
import json

# I import the werkzeug module to verify the integrity of the filename of the file
from werkzeug.utils import secure_filename 

# Initialisation of the API
app = Flask(__name__)

# Here the definition for save the uploaded file
# @Aloijsjimmyargilenilsfranckgeorge you need to verify in the html code page that all the elements (title, author, desc, file) are completed by the user and to send title, author, desc in json format and that the file is in type file
@app.route("/upload", methods=['POST'])
def upload():
	
	title = request.form.get("titre")
	desc = request.form.get("desc")
	author = request.form.get("author")
	path = request.form.get("path")
	
	file = request.files.get("file")

	if file is None or file.filename == "":
                return "No file provided", 400

	
	uuid_str = str(uuid.uuid4())
	filename = secure_filename(file.filename)
	path_json = os.path.join(path, "revisons_notes_files", os.path.splitext(filename)[0] + ".json")

	filename = f"{uuid_str}_{filename}"
	data_json = {
			"title": title,
			"desc": desc,
			"author": author,
			"path": path,
			"name": filename,
			"stars": 0
		}
	file.save(os.path.join("uploads", filename))

	with open(path_json, "w") as f:
                json.dump(data_json, f, indent=4, ensure_ascii=False)
	
	return "OK", 200

# @Aloijsjimmyargilenilsfranckgeorge you need to verify in the html code page that the element filename are completed by the user and to send it in json format
@app.route("/download", methods=['POST'])
def download():
	filename = request.form.get("filename")
	filename = secure_filename(filename)
	
	check_file = os.path.join("uploads", filename)
	if not os.path.exists(check_file):
		return "File not found", 404
	
	return send_from_directory("uploads", filename, as_attachment=True, download_name=filename.split("_", 1)[1])

if __name__ == "__main__":
	os.makedirs("uploads", exist_ok=True)
	app.run(host="0.0.0.0", port=8080, debug=False)

