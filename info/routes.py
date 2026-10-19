from flask import Blueprint
import os
from utils.json_utils import load_json_file
from utils.dir import list_directory, validate_and_list

info_bp = Blueprint("info", __name__, url_prefix="/info")

@info_bp.route("/matiere", methods=["GET"])
def get_matiere():
    matiere_list = list_directory("matiere")
    return {"matiere": matiere_list}, 200


@info_bp.route("/classe/<matiere>", methods=["GET"])
def get_classe(matiere):
    is_valid, items = validate_and_list("matiere", matiere)
    if not is_valid:
        return {"error": "Invalid matiere", "all": items}, 404

    classe_list = list_directory(os.path.join("matiere", matiere))
    return {"classe": classe_list}, 200


@info_bp.route("/specialite/<matiere>/<classe>", methods=["GET"])
def get_specialite(matiere, classe):
    is_valid_m, items_m = validate_and_list("matiere", matiere)
    if not is_valid_m:
        return {"error": "Invalid matiere", "all": items_m}, 404

    is_valid_c, items_c = validate_and_list(os.path.join("matiere", matiere), classe)
    if not is_valid_c:
        return {"error": "Invalid classe", "all": items_c}, 404

    specialite_list = list_directory(os.path.join("matiere", matiere, classe))
    return {"specialite": specialite_list}, 200


@info_bp.route("/files/<matiere>/<classe>/<specialite>", methods=["GET"])
def get_files(matiere, classe, specialite):
    is_valid_m, items_m = validate_and_list("matiere", matiere)
    if not is_valid_m:
        return {"error": "Invalid matiere", "all": items_m}, 404

    is_valid_c, items_c = validate_and_list(os.path.join("matiere", matiere), classe)
    if not is_valid_c:
        return {"error": "Invalid classe", "all": items_c}, 404

    is_valid_s, items_s = validate_and_list(os.path.join("matiere", matiere, classe), specialite)
    if not is_valid_s:
        return {"error": "Invalid specialite", "all": items_s}, 404

    directory = os.path.join("matiere", matiere, classe, specialite)
    files_list = [
        filename
        for filename in list_directory(directory)
        if filename.endswith(".json")
    ]
    metadata_list = []
    for filename in files_list:
        file_path = os.path.join(directory, filename)
        metadata = load_json_file(file_path)
        metadata_list.append(metadata)
    return {"files": [f.replace(".json", "") for f in files_list], "metadata": metadata_list}, 200