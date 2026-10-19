"""Découverte des cours.

Ces routes sont publiques : elles ne renvoient que les noms de dossiers
et le descriptif des fiches, jamais le fichier lui-même.
"""

from flask import Blueprint

from utils.dir import child_dir, list_names
from utils.files import public_metadata, read_metadata
from utils.json_utils import load_json_object
from utils.security import is_uuid, project_dir


info_bp = Blueprint("info", __name__, url_prefix="/info")

# Ordre scolaire, pas l'ordre alphabétique (sinon « 1ere » passerait avant « 2nd »).
CLASS_ORDER = {"2nd": 0, "1ere": 1, "term": 2}


@info_bp.route("/matiere", methods=["GET"])
def get_matiere():
    """Liste des matières présentes sur le disque."""
    return {"matiere": list_names(project_dir("matiere"), "dir")}, 200


@info_bp.route("/classe/<matiere>", methods=["GET"])
def get_classe(matiere):
    """Classes disponibles pour une matière."""
    subject_dir = child_dir(project_dir("matiere"), matiere)
    if subject_dir is None:
        return {"error": "Matière introuvable"}, 404

    classes = list_names(subject_dir, "dir")
    classes.sort(key=lambda name: (CLASS_ORDER.get(name, 99), name))
    return {"classe": classes}, 200


@info_bp.route("/specialite/<matiere>/<classe>", methods=["GET"])
def get_specialite(matiere, classe):
    """Spécialités disponibles pour une matière et une classe."""
    subject_dir = child_dir(project_dir("matiere"), matiere)
    if subject_dir is None:
        return {"error": "Matière introuvable"}, 404

    class_dir = child_dir(subject_dir, classe)
    if class_dir is None:
        return {"error": "Classe introuvable"}, 404

    return {"specialite": list_names(class_dir, "dir")}, 200


@info_bp.route("/files/<matiere>/<classe>/<specialite>", methods=["GET"])
def get_files(matiere, classe, specialite):
    """Descriptifs des fiches d'un cours. Le téléchargement passe par /download."""
    subject_dir = child_dir(project_dir("matiere"), matiere)
    if subject_dir is None:
        return {"error": "Matière introuvable"}, 404

    class_dir = child_dir(subject_dir, classe)
    if class_dir is None:
        return {"error": "Classe introuvable"}, 404

    speciality_dir = child_dir(class_dir, specialite)
    if speciality_dir is None:
        return {"error": "Spécialité introuvable"}, 404

    file_ids = []
    metadata_list = []
    for filename in list_names(speciality_dir, "file"):
        if not filename.endswith(".json"):
            continue
        file_id = filename[: -len(".json")]
        if not is_uuid(file_id):
            continue
        metadata = read_metadata(speciality_dir / filename)
        if metadata is None or metadata.get("id") != file_id:
            continue
        # On ignore un JSON dont la catégorie ne correspond pas au dossier où il se trouve.
        if (
            metadata.get("matiere") != matiere
            or metadata.get("classe") != classe
            or metadata.get("specialite") != specialite
        ):
            continue
        file_ids.append(file_id)
        # Même forme qu'avant : l'objet complet, pour les pages qui lisent title, author, desc, id.
        raw = load_json_object(speciality_dir / filename)
        metadata_list.append(raw if raw is not None else public_metadata(metadata))

    return {"files": file_ids, "metadata": metadata_list}, 200
