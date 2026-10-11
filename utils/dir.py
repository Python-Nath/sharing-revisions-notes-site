import os

def list_directory(directory):
    files_list = []
    try:
        with os.scandir(directory) as entries:
            for entry in entries:
                # On ignore le fichier .gitkeep pour ne pas polluer l'interface
                if entry.name == ".gitkeep":
                    continue
                files_list.append(entry.name)
    except FileNotFoundError:
        return []
    return files_list

def validate_and_list(path, name):
    """
    Vérifie si un élément existe dans le dossier spécifié.
    Retourne (est_valide, liste_complete)
    """
    items = list_directory(path)
    if not items or name not in items:
        return False, items
    return True, items