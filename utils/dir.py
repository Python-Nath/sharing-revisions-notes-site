"""Parcours du dossier matiere/.

On ne suit pas les liens symboliques et on ignore les fichiers cachés
comme .gitkeep, pour que l'interface ne propose que de vrais cours.
"""

from pathlib import Path

from utils.security import is_uuid, project_dir, segment_ok


def list_names(directory, kind):
    """Liste les noms d'enfants directs : « dir » pour les dossiers, « file » pour les fichiers."""
    directory = Path(directory).resolve()
    base = project_dir("matiere")
    if directory != base and not directory.is_relative_to(base):
        return []
    if not directory.is_dir():
        return []

    names = []
    try:
        for entry in directory.iterdir():
            if entry.name.startswith("."):
                continue
            if entry.is_symlink():
                continue
            if kind == "dir" and entry.is_dir():
                names.append(entry.name)
            elif kind == "file" and entry.is_file():
                names.append(entry.name)
    except OSError:
        return []
    return sorted(names, key=str.lower)


def child_dir(parent, name):
    """Sous-dossier direct de parent, ou None si le nom est invalide ou absent."""
    if not segment_ok(name):
        return None
    parent = Path(parent).resolve()
    base = project_dir("matiere")
    if parent != base and not parent.is_relative_to(base):
        return None

    candidate = parent / name
    if candidate.is_symlink() or not candidate.is_dir():
        return None
    resolved = candidate.resolve()
    if resolved.parent != parent or not resolved.is_relative_to(base):
        return None
    return resolved


def find_metadata_path(file_id):
    """Retrouve le JSON d'une fiche par son UUID.

    S'il existe deux fichiers pour le même id, on ne choisit pas au hasard :
    on retourne None pour ne pas modifier la mauvaise fiche.
    """
    if not is_uuid(file_id):
        return None

    base = project_dir("matiere")
    found = []
    for path in base.rglob(file_id + ".json"):
        if path.is_symlink():
            continue
        resolved = path.resolve()
        # Profondeur attendue : matiere / matière / classe / spécialité / fichier.json
        if resolved.parent.parent.parent.parent != base:
            continue
        if resolved.is_file() and resolved.is_relative_to(base):
            found.append(resolved)

    if len(found) != 1:
        return None
    return found[0]
