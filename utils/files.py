"""Création, modification, suppression et téléchargement des fiches.

Le fichier et son JSON dans matiere/ sont la source de vérité.
La base ne garde qu'un rappel (id + catégorie) pour les tableaux de bord.
Les deux sont mis à jour ensemble, puis annulés si une étape échoue.
"""

import uuid

from flask import current_app, jsonify

from utils.http import error_response
from sqlalchemy.orm.attributes import flag_modified
from werkzeug.utils import secure_filename

from database.model import Comment, Star, User, db
from utils.dir import find_metadata_path
from utils.json_utils import load_json_object, save_json_file
from utils.security import (
    is_uuid,
    metadata_path,
    stored_name,
    upload_path,
    valid_category,
    valid_stored_name,
    clean_text,
)


def location_cache(file_id, filename, subject, school_class, speciality):
    """Rappel minimal stocké dans le compte. Il ne contient pas le contenu du fichier."""
    return {
        "id": file_id,
        "filename": filename,
        "matiere": subject,
        "classe": school_class,
        "specialite": speciality,
    }


def public_metadata(metadata):
    """Champs montrés à l'écran. Le nom interne du disque n'est pas nécessaire à la page."""
    return {
        "id": metadata.get("id"),
        "title": metadata.get("title") or "",
        "author": metadata.get("author") or "",
        "desc": metadata.get("desc") or "",
        "original_filename": metadata.get("original_filename") or "",
        "matiere": metadata.get("matiere") or "",
        "classe": metadata.get("classe") or "",
        "specialite": metadata.get("specialite") or "",
    }


def read_metadata(path):
    """Charge un JSON de fiche et vérifie qu'il a un id valide."""
    data = load_json_object(path)
    if not isinstance(data, dict) or not is_uuid(data.get("id")):
        return None
    return data


def _remove_file(path):
    """Supprime un fichier s'il existe. Une erreur disque est journalisée, pas montrée brute."""
    try:
        if path is not None and path.is_file():
            path.unlink()
    except OSError:
        current_app.logger.exception("Suppression impossible : %s", path)


def _propagate_downloads(file_id, cache):
    """Met à jour le rappel de ceux qui ont déjà téléchargé cette fiche."""
    for person in User.query.all():
        downloads = dict(person.download_metadatas or {})
        if file_id not in downloads:
            continue
        downloads[file_id] = cache
        person.download_metadatas = downloads
        flag_modified(person, "download_metadatas")


def files_from_cache(file_ids, cache):
    """Reconstruit les fiches visibles à partir des id mémorisés sur le compte."""
    visible = []
    for file_id in file_ids or []:
        if not is_uuid(file_id):
            continue
        hint = (cache or {}).get(file_id) or {}
        category = valid_category(hint.get("matiere"), hint.get("classe"), hint.get("specialite"))
        path = metadata_path(category, file_id) if category is not None else None
        if path is None or not path.is_file():
            path = find_metadata_path(file_id)
        if path is None or not path.is_file():
            continue
        metadata = read_metadata(path)
        if metadata is None or metadata.get("id") != file_id:
            continue
        visible.append(public_metadata(metadata))
    return visible


def owner_of(file_id):
    """Retrouve le compte auteur d'une fiche. (compte, None) ou (None, erreur)."""
    if not is_uuid(file_id):
        return None, error_response("Identifiant de fiche invalide", 400)

    path = find_metadata_path(file_id)
    if path is None:
        return None, error_response("Fiche introuvable", 404)

    metadata = read_metadata(path)
    author = metadata.get("author") if metadata else None
    if not isinstance(author, str) or not author:
        return None, error_response("Auteur introuvable", 404)

    owner = User.query.filter_by(username=author).first()
    if owner is None or file_id not in (owner.uploaded_files or []):
        return None, error_response("Propriétaire introuvable", 404)
    return owner, None


def store_upload(user, subject, school_class, speciality, storage, title, description):
    """Enregistre une nouvelle fiche au nom du compte connecté.

    L'auteur est toujours l'identifiant du compte. La valeur envoyée par le
    formulaire est ignorée, pour qu'on ne puisse pas signer une fiche à la place
    de quelqu'un d'autre.
    """
    category = valid_category(subject, school_class, speciality)
    if category is None:
        return jsonify({"error": "Catégorie introuvable"}), 404

    clean_title = clean_text(title, 120)
    clean_description = clean_text(description, 2000)
    if not clean_title or not clean_description:
        return jsonify({
            "error": "Le titre et la description sont obligatoires (120 et 2000 caractères maximum)."
        }), 400

    if storage is None or not storage.filename:
        return jsonify({"error": "Aucun fichier sélectionné"}), 400

    file_id = str(uuid.uuid4())
    filename = stored_name(file_id, storage.filename)
    if not filename:
        return jsonify({
            "error": "Type de fichier non autorisé. Utilise un PDF, une image, un document ou un zip."
        }), 400

    destination = upload_path(filename)
    meta_path = metadata_path(category, file_id)
    if destination is None or meta_path is None:
        return jsonify({"error": "Chemin de stockage invalide"}), 400

    try:
        storage.save(destination)
    except OSError:
        current_app.logger.exception("Échec d'écriture du fichier")
        return jsonify({"error": "Enregistrement impossible"}), 500

    if not destination.is_file() or destination.stat().st_size <= 0:
        _remove_file(destination)
        return jsonify({"error": "Le fichier est vide"}), 400

    metadata = {
        "id": file_id,
        "title": clean_title,
        "author": user.username,
        "desc": clean_description,
        "filename": filename,
        "original_filename": secure_filename(storage.filename),
        "matiere": subject,
        "classe": school_class,
        "specialite": speciality,
    }

    try:
        save_json_file(meta_path, metadata)
        uploaded = list(user.uploaded_files or [])
        uploaded.append(file_id)
        user.uploaded_files = uploaded
        flag_modified(user, "uploaded_files")
        uploaded_meta = dict(user.uploaded_metadatas or {})
        uploaded_meta[file_id] = location_cache(file_id, filename, subject, school_class, speciality)
        user.uploaded_metadatas = uploaded_meta
        flag_modified(user, "uploaded_metadatas")
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Échec d'enregistrement de la fiche")
        _remove_file(destination)
        _remove_file(meta_path)
        return jsonify({"error": "Enregistrement impossible"}), 500

    return jsonify({"message": "Fiche publiée", "metadata": metadata}), 201


def update_file(owner, file_id, form, storage):
    """Modifie le texte, la catégorie, et éventuellement le fichier d'une fiche."""
    if not is_uuid(file_id):
        return jsonify({"error": "Identifiant de fiche invalide"}), 400
    if file_id not in (owner.uploaded_files or []):
        return jsonify({"error": "Cette fiche ne figure pas dans les envois de ce compte"}), 403

    subject = form.get("matiere")
    school_class = form.get("classe")
    speciality = form.get("specialite")
    category = valid_category(subject, school_class, speciality)
    if category is None:
        return jsonify({"error": "Catégorie introuvable"}), 404

    clean_title = clean_text(form.get("title"), 120)
    clean_description = clean_text(form.get("desc"), 2000)
    if not clean_title or not clean_description:
        return jsonify({"error": "Le titre et la description sont obligatoires."}), 400

    old_meta_path = find_metadata_path(file_id)
    if old_meta_path is None:
        return jsonify({"error": "Métadonnées introuvables"}), 404

    old_metadata = read_metadata(old_meta_path)
    if old_metadata is None or old_metadata.get("id") != file_id:
        return jsonify({"error": "Métadonnées invalides"}), 404
    if old_metadata.get("author") != owner.username:
        return jsonify({"error": "Le propriétaire de la fiche ne correspond pas"}), 403

    old_stored = old_metadata.get("filename")
    old_original = old_metadata.get("original_filename")
    if not valid_stored_name(file_id, old_stored) or not isinstance(old_original, str) or not old_original:
        return jsonify({"error": "Fichier stocké invalide"}), 400

    old_file = upload_path(old_stored)
    if old_file is None:
        return jsonify({"error": "Fichier stocké invalide"}), 400

    new_file = None
    new_stored = old_stored
    new_original = secure_filename(old_original) or "fiche"
    if storage is not None and storage.filename:
        candidate = stored_name(file_id, storage.filename)
        # Même nom qu'avant : on en calcule un autre pour pouvoir revenir en arrière.
        if candidate and candidate == old_stored:
            candidate = stored_name(file_id, uuid.uuid4().hex + "_" + storage.filename)
        if not candidate:
            return jsonify({"error": "Type de fichier non autorisé."}), 400
        new_file = upload_path(candidate)
        if new_file is None:
            return jsonify({"error": "Chemin de stockage invalide"}), 400
        new_stored = candidate
        new_original = secure_filename(storage.filename)

    new_meta_path = metadata_path(category, file_id)
    if new_meta_path is None:
        return jsonify({"error": "Chemin de métadonnées invalide"}), 400

    metadata = {
        "id": file_id,
        "title": clean_title,
        "author": owner.username,
        "desc": clean_description,
        "filename": new_stored,
        "original_filename": new_original,
        "matiere": subject,
        "classe": school_class,
        "specialite": speciality,
    }
    cache = location_cache(file_id, new_stored, subject, school_class, speciality)

    try:
        if new_file is not None:
            storage.save(new_file)
            if not new_file.is_file() or new_file.stat().st_size <= 0:
                _remove_file(new_file)
                return jsonify({"error": "Le fichier est vide"}), 400
        save_json_file(new_meta_path, metadata)
        uploaded_meta = dict(owner.uploaded_metadatas or {})
        uploaded_meta[file_id] = cache
        owner.uploaded_metadatas = uploaded_meta
        flag_modified(owner, "uploaded_metadatas")
        _propagate_downloads(file_id, cache)
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Échec de mise à jour de la fiche")
        if new_meta_path != old_meta_path and new_meta_path.exists():
            _remove_file(new_meta_path)
        elif old_meta_path.exists():
            save_json_file(old_meta_path, old_metadata)
        if new_file is not None and new_file != old_file:
            _remove_file(new_file)
        return jsonify({"error": "Mise à jour impossible"}), 500

    if old_meta_path != new_meta_path:
        _remove_file(old_meta_path)
    if new_file is not None and old_file != new_file:
        _remove_file(old_file)

    return jsonify({"message": "Fiche mise à jour"}), 200


def remove_file(owner, file_id):
    """Retire la fiche du compte, puis du disque."""
    if not is_uuid(file_id):
        return jsonify({"error": "Identifiant de fiche invalide"}), 400
    if file_id not in (owner.uploaded_files or []):
        return jsonify({"error": "Cette fiche ne figure pas dans les envois de ce compte"}), 403

    meta_path = find_metadata_path(file_id)
    if meta_path is None:
        return jsonify({"error": "Métadonnées introuvables"}), 404

    metadata = read_metadata(meta_path)
    if metadata is None or metadata.get("author") != owner.username:
        return jsonify({"error": "Le propriétaire de la fiche ne correspond pas"}), 403

    stored = metadata.get("filename")
    if not valid_stored_name(file_id, stored):
        return jsonify({"error": "Fichier stocké invalide"}), 400
    file_path = upload_path(stored)
    if file_path is None:
        return jsonify({"error": "Fichier stocké invalide"}), 400

    # Même transaction que le compte : une étoile ou un commentaire ne survit pas à la fiche.
    Star.query.filter(Star.file_id == file_id).delete(synchronize_session=False)
    Comment.query.filter(Comment.file_id == file_id).delete(synchronize_session=False)

    owner.uploaded_files = [item for item in (owner.uploaded_files or []) if item != file_id]
    flag_modified(owner, "uploaded_files")
    uploaded_meta = dict(owner.uploaded_metadatas or {})
    uploaded_meta.pop(file_id, None)
    owner.uploaded_metadatas = uploaded_meta
    flag_modified(owner, "uploaded_metadatas")

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Échec de suppression en base")
        return jsonify({"error": "Suppression impossible"}), 500

    _remove_file(file_path)
    _remove_file(meta_path)
    return jsonify({"message": "Fiche supprimée"}), 200


def resolve_download(subject, school_class, speciality, file_id):
    """Vérifie la fiche demandée et retourne (nom interne, nom d'origine, rappel)."""
    if not is_uuid(file_id):
        return None, (jsonify({"error": "Identifiant de fiche invalide"}), 400)

    category = valid_category(subject, school_class, speciality)
    if category is None:
        return None, (jsonify({"error": "Catégorie introuvable"}), 404)

    path = metadata_path(category, file_id)
    if path is None or not path.is_file():
        return None, (jsonify({"error": "Fiche introuvable"}), 404)

    metadata = read_metadata(path)
    if metadata is None or metadata.get("id") != file_id:
        return None, (jsonify({"error": "Métadonnées invalides"}), 404)
    if (
        metadata.get("matiere") != subject
        or metadata.get("classe") != school_class
        or metadata.get("specialite") != speciality
    ):
        return None, (jsonify({"error": "La fiche ne correspond pas à cette catégorie"}), 404)

    stored = metadata.get("filename")
    if not valid_stored_name(file_id, stored):
        return None, (jsonify({"error": "Fichier stocké invalide"}), 404)
    if upload_path(stored) is None or not upload_path(stored).is_file():
        return None, (jsonify({"error": "Fichier introuvable"}), 404)

    original = secure_filename(metadata.get("original_filename") or "") or "fiche"
    cache = location_cache(file_id, stored, subject, school_class, speciality)
    return (stored, original, cache), None


def remember_download(user, file_id, cache):
    """Ajoute la fiche à l'historique si un compte est connecté."""
    if user is None or user.is_ban:
        return
    downloads = list(user.download_ids or [])
    if file_id not in downloads:
        downloads.append(file_id)
        user.download_ids = downloads
        flag_modified(user, "download_ids")
    metas = dict(user.download_metadatas or {})
    metas[file_id] = cache
    user.download_metadatas = metas
    flag_modified(user, "download_metadatas")
    db.session.commit()
