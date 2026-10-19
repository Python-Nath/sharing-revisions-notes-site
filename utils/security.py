"""Contrôles de chemins, de textes et de types de fichiers.

Toute donnée qui sert à construire un chemin passe par ici.
Le but est d'empêcher une fiche de sortir de matiere/ ou de uploads/.
"""

import re
import uuid
from pathlib import Path

from werkzeug.utils import secure_filename


# Seuls ces suffixes peuvent être publiés.
# Le HTML, le SVG et le JavaScript sont exclus : ouverts dans un navigateur,
# ils pourraient exécuter du code (faille XSS).
EXTENSIONS_AUTORISEES = {
    ".pdf",
    ".txt",
    ".md",
    ".csv",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".xls",
    ".xlsx",
    ".odt",
    ".odp",
    ".ods",
    ".zip",
}

# Les dossiers du site n'utilisent que des lettres, des chiffres, « - » et « _ ».
# On refuse donc « .. », les barres obliques et les caractères de contrôle.
_SEGMENT = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$")


def segment_ok(name):
    """Vrai si le nom peut être un dossier de matière, de classe ou de spécialité."""
    return isinstance(name, str) and _SEGMENT.fullmatch(name) is not None


def is_uuid(value):
    """Vrai uniquement pour un UUID version 4 écrit en minuscules, comme ceux que l'on crée."""
    if not isinstance(value, str):
        return False
    try:
        parsed = uuid.UUID(value)
    except (ValueError, AttributeError, TypeError):
        return False
    return parsed.version == 4 and str(parsed) == value


def clean_text(value, max_length):
    """Nettoie un titre ou une description. Retourne None si le texte est inutilisable."""
    if not isinstance(value, str):
        return None
    value = value.replace("\r\n", "\n").replace("\r", "\n").strip()
    if not value or len(value) > max_length or "\x00" in value:
        return None
    return value


def extension_allowed(filename):
    """Vrai si le suffixe du fichier est dans la liste autorisée."""
    if not isinstance(filename, str):
        return False
    return Path(filename).suffix.lower() in EXTENSIONS_AUTORISEES


def valid_stored_name(file_id, stored_name):
    """Le nom interne doit rester un simple fichier du dossier uploads, préfixé par l'id."""
    if not is_uuid(file_id) or not isinstance(stored_name, str):
        return False
    if stored_name != Path(stored_name).name:
        return False
    if "/" in stored_name or "\\" in stored_name or "\x00" in stored_name:
        return False
    # secure_filename retire les suites du type « ../ ». S'il modifie le nom, on le refuse.
    if secure_filename(stored_name) != stored_name:
        return False
    if not stored_name.startswith(file_id + "_"):
        return False
    return extension_allowed(stored_name)


def stored_name(file_id, original_filename):
    """Construit le nom unique « <uuid>_<nom sûr> », ou None si le type est interdit."""
    cleaned = secure_filename(original_filename or "")
    if not cleaned or not extension_allowed(cleaned):
        return None
    suffix = Path(cleaned).suffix.lower()
    if len(cleaned) > 100:
        cleaned = cleaned[: 100 - len(suffix)] + suffix
    name = f"{file_id}_{cleaned}"
    if not valid_stored_name(file_id, name):
        return None
    return name


def project_dir(folder_name):
    """Dossier racine du projet, résolu, pour comparer les chemins réels."""
    return Path(folder_name).resolve()


def valid_category(subject, school_class, speciality):
    """Retourne le dossier matiere/<matière>/<classe>/<spécialité> s'il existe vraiment.

    Un lien symbolique est refusé : après résolution, il pourrait pointer
    en dehors de l'arborescence prévue.
    """
    if not all(segment_ok(part) for part in (subject, school_class, speciality)):
        return None

    base = project_dir("matiere")
    current = base
    for part in (subject, school_class, speciality):
        current = current / part
        if current.is_symlink() or not current.is_dir():
            return None

    resolved = current.resolve()
    # Trois niveaux exactement : matière, classe, spécialité.
    if resolved.parent.parent.parent != base:
        return None
    if not resolved.is_relative_to(base):
        return None
    return resolved


def metadata_path(category_dir, file_id):
    """Chemin du JSON de fiche, sans pouvoir remonter d'un dossier."""
    if category_dir is None or not is_uuid(file_id):
        return None
    path = (category_dir / f"{file_id}.json").resolve()
    if path.parent != category_dir.resolve():
        return None
    return path


def upload_path(stored):
    """Chemin du fichier dans uploads/, ou None si le nom tente de s'en échapper."""
    if not isinstance(stored, str) or stored != Path(stored).name:
        return None
    base = project_dir("uploads")
    base.mkdir(exist_ok=True)
    path = (base / stored).resolve()
    if path.parent != base or not path.is_relative_to(base):
        return None
    return path
