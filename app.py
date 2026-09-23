# I import the flask module for manage the API
from flask import Flask, request, send_file
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
	data = request.get_json()
	
	title = data.get("titre")
	desc = data.get("desc")
	author = data.get("author")
	path = data.get("path")
	
	file = request.files.get("file")

	data_json = {
		"title": title,
		"desc": desc,
		"author": author,
		"path": path
	}
	
	uuid_str = str(uuid.uuid4())
	filename = secure_filename(file.filename)

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
	
	
	return "OK", 200

# @Aloijsjimmyargilenilsfranckgeorge you need to verify in the html code page that the element filename are completed by the user and to send it in json format
@app.route("/download", methods=['POST'])
def download():
	data = request.get_json()
	filename = data.get("filename")
	
	check_file = os.path.join("uploads", filename)
	if not os.path.exists(check_file):
		return "File not found", 404
	
	return send_from_directory("uploads", filename, as_attachment=True, download_name=filename.split("_", 1)[1])

if __name__ == "__main__":
	os.mkdir("uploads") if not os.path.exists("uploads") else None
	app.run(host="0.0.0.0", port=8080, debug=False)

