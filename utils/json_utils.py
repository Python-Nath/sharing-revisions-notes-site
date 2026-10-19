"""Lecture et écriture des JSON de fiches.

L'écriture passe par un fichier temporaire puis un remplacement.
Si le programme s'arrête au milieu, l'ancien JSON reste intact.
"""

import json
import os
from pathlib import Path


def load_json_object(file_path):
    """Retourne un objet JSON, ou None si le fichier est illisible ou n'est pas un objet."""
    try:
        with open(file_path, "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, UnicodeError, json.JSONDecodeError):
        return None
    if not isinstance(data, dict):
        return None
    return data


def load_json_file(file_path):
    """Ancienne forme : un dictionnaire vide quand la lecture échoue."""
    data = load_json_object(file_path)
    return data if data is not None else {}


def save_json_file(file_path, data):
    """Écrit le JSON en UTF-8 et remplace l'ancien fichier seulement à la fin."""
    path = Path(file_path)
    temporary = path.with_suffix(path.suffix + ".tmp")
    with open(temporary, "w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=4, ensure_ascii=False)
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temporary, path)
