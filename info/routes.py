from flask import Blueprint
import os
from utils.json_utils import load_json_file

info_bp = Blueprint("info", __name__, url_prefix="/info")

@info_bp.route("/matiere", methods=["GET"])
def get_matiere():
    matiere_list = os.listdir("matiere")
    return {"matiere": matiere_list}, 200


@info_bp.route("/classe/<matiere>", methods=["GET"])
def get_classe(matiere):
    if matiere not in os.listdir("matiere"):
        return {"error": "Invalid matiere", "all": os.listdir("matiere")}, 404

    classe_list = os.listdir(os.path.join("matiere", matiere))
    return {"classe": classe_list}, 200


@info_bp.route("/specialite/<matiere>/<classe>", methods=["GET"])
def get_specialite(matiere, classe):
    if matiere not in os.listdir("matiere"):
        return {"error": "Invalid matiere", "all": os.listdir("matiere")}, 404

    if classe not in os.listdir(os.path.join("matiere", matiere)):
        return {"error": "Invalid classe", "all": os.listdir(os.path.join("matiere", matiere))}, 404

    specialite_list = os.listdir(os.path.join("matiere", matiere, classe))
    return {"specialite": specialite_list}, 200


@info_bp.route("/files/<matiere>/<classe>/<specialite>", methods=["GET"])
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
    metadata_list = []
    for filename in files_list:
        file_path = os.path.join(directory, filename)
        metadata = load_json_file(file_path)
        metadata_list.append(metadata)
    return {"files": files_list, "metadata": metadata_list}, 200
