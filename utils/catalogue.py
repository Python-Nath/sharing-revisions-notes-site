"""Lecture des fiches publiées.

Le JSON dans matiere/ reste la source de vérité. Ce module ne renvoie
aux pages que les champs déjà montrés sur une carte, jamais le nom interne
du fichier dans uploads/.
"""

from utils.dir import child_dir, find_metadata_path, list_names
from utils.files import public_metadata, read_metadata
from utils.security import is_uuid, project_dir, upload_path, valid_stored_name


def _conforme(meta, matiere, classe, specialite, file_id):
    return (
        meta is not None
        and meta.get("id") == file_id
        and meta.get("matiere") == matiere
        and meta.get("classe") == classe
        and meta.get("specialite") == specialite
    )


def toutes_les_fiches():
    """Métadonnées complètes des fiches dont le JSON correspond à son dossier."""
    base = project_dir("matiere")
    fiches = []
    for matiere in list_names(base, "dir"):
        dossier_matiere = child_dir(base, matiere)
        if dossier_matiere is None:
            continue
        for classe in list_names(dossier_matiere, "dir"):
            dossier_classe = child_dir(dossier_matiere, classe)
            if dossier_classe is None:
                continue
            for specialite in list_names(dossier_classe, "dir"):
                dossier = child_dir(dossier_classe, specialite)
                if dossier is None:
                    continue
                for nom in list_names(dossier, "file"):
                    if not nom.endswith(".json"):
                        continue
                    file_id = nom[: -len(".json")]
                    if not is_uuid(file_id):
                        continue
                    meta = read_metadata(dossier / nom)
                    if not _conforme(meta, matiere, classe, specialite, file_id):
                        continue
                    fiches.append(meta)
    return fiches


def trouver_fiche(file_id):
    """Métadonnées d'une fiche, ou None si l'identifiant est inconnu ou ambigu."""
    if not is_uuid(file_id):
        return None
    path = find_metadata_path(file_id)
    if path is None:
        return None
    meta = read_metadata(path)
    specialite = path.parent.name
    classe = path.parent.parent.name
    matiere = path.parent.parent.parent.name
    if not _conforme(meta, matiere, classe, specialite, file_id):
        return None
    return meta


def vue_publique(meta):
    """Champs d'une carte. Le nom stocké sur le disque n'en fait pas partie."""
    return public_metadata(meta)


def taille_octets(meta):
    """Taille du fichier envoyé, ou 0 s'il est absent ou si son nom est douteux."""
    file_id = meta.get("id")
    stored = meta.get("filename")
    if not valid_stored_name(file_id, stored):
        return 0
    path = upload_path(stored)
    if path is None or path.is_symlink() or not path.is_file():
        return 0
    try:
        return path.stat().st_size
    except OSError:
        return 0
