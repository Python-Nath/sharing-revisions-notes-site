# I import the flask module for manage the API
from flask import Flask,request

# I import the werkzeug module to verify the integrity of the filename of the file
from werkzeug.utils import secure_filename 

# Initialisation of the API
app = Flask(__main__)

# Here the definition for save the uploaded file
# @Aloijsjimmyargilenilsfranckgeorge you need to verify in the html code page that all the elements (title, author, desc, file) are completed by the user and to send title, author, desc in json format and that the file is in type file
@app.route("/upload", methods=['POST'])
def upload():
	data = request.get_json()
	
	title = data.get("titre")
	desc = data.get("desc")
	author = data.get("author")
	
	file = request.files.get("file")
	filename = secure_filename(file.filename)
	
	# Here the logic to save the file
	
	return "OK", 200

# @Aloijsjimmyargilenilsfranckgeorge you need to verify in the html code page that the element filename are completed by the user and to send it in json format
@app.route("/download", methods=['POST'])
def upload():
	data = request.get_json()
	filename = data.get("filename")
	
	# Here the logic to retrive and download the file
	
	return "OK", 200

