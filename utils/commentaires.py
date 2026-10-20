"""Commentaires sur une fiche.

Trois visibilités :
- auteur : l'auteur du commentaire et l'auteur de la fiche
- equipe : l'auteur du commentaire, les modérateurs, les admins, le propriétaire
- les_deux : les deux cercles

La prise en charge est unique. L'auteur de la fiche, un modérateur,
un administrateur ou le propriétaire peut suivre le commentaire.
Après avoir enregistré une modification de la fiche, cette personne
peut le retirer. Tant que le responsable est actif, lui seul valide.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import update

from database.model import Comment, User, db
from utils.catalogue import trouver_fiche
from utils.presence import _iso
from utils.security import clean_text, is_uuid


AUDIENCES = ("auteur", "equipe", "les_deux")
EQUIPE = ("moderator", "admin", "owner")
PAR_FICHE = 20
PAR_JOUR = 30
TAILLE_MAX = 2000


def _maintenant():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _equipe(user):
    return user is not None and user.role in EQUIPE and not user.is_ban


def _auteur_fiche(meta):
    auteur = meta.get("author") if meta else None
    return auteur if isinstance(auteur, str) else ""


def peut_voir(user, comment, auteur_fiche):
    """Vrai si ce compte a le droit de lire ce commentaire."""
    if user is None:
        return False
    if user.id == comment.author_id:
        return True
    if comment.audience in ("auteur", "les_deux") and user.username == auteur_fiche:
        return True
    if comment.audience in ("equipe", "les_deux") and _equipe(user):
        return True
    return False


def _peut_suivre(user, auteur_fiche):
    """L'auteur de la fiche, ou un membre de l'équipe, peut suivre un commentaire."""
    if user is None or user.is_ban:
        return False
    if user.username == auteur_fiche:
        return True
    return user.role in EQUIPE


def _responsable_actif(handler_id):
    if not handler_id:
        return None
    handler = db.session.get(User, handler_id)
    if handler is None or handler.is_ban:
        return None
    if handler.role in EQUIPE or handler.role == "user":
        return handler
    return None


def peut_prendre(user, comment, auteur_fiche):
    return (
        _peut_suivre(user, auteur_fiche)
        and peut_voir(user, comment, auteur_fiche)
        and comment.status == "ouvert"
        and not comment.handler_id
    )


def peut_retirer(user, comment, auteur_fiche):
    """Vrai si cette personne suit le commentaire et a modifié la fiche ensuite."""
    return (
        _peut_suivre(user, auteur_fiche)
        and peut_voir(user, comment, auteur_fiche)
        and comment.handler_id == user.id
        and comment.status in ("pris", "valide")
        and bool(comment.corrected)
    )


def peut_valider(user, comment, auteur_fiche):
    """Seul le responsable valide. Le propriétaire reprend si ce responsable n'existe plus."""
    if comment.status != "pris" or not comment.handler_id or not _equipe(user):
        return False
    if not peut_voir(user, comment, auteur_fiche):
        return False
    if comment.handler_id == user.id:
        return True
    return user.role == "owner" and _responsable_actif(comment.handler_id) is None


def _presenter(comment, user, auteur_fiche):
    auteur = db.session.get(User, comment.author_id)
    responsable = None
    if comment.handler_id:
        handler = db.session.get(User, comment.handler_id)
        if handler is not None:
            responsable = handler.username
    return {
        "id": comment.id,
        "auteur": auteur.username if auteur is not None else "",
        "texte": comment.body,
        "audience": comment.audience,
        "statut": comment.status,
        "responsable": responsable,
        "le": _iso(comment.created_at),
        "peut_prendre": peut_prendre(user, comment, auteur_fiche),
        "peut_valider": peut_valider(user, comment, auteur_fiche),
        "peut_retirer": peut_retirer(user, comment, auteur_fiche),
        "suivi": comment.handler_id == user.id and comment.status in ("pris", "valide"),
    }


def lister(user, file_id):
    meta = trouver_fiche(file_id)
    if meta is None:
        return None, ("Fiche introuvable", 404)
    auteur_fiche = _auteur_fiche(meta)
    commentaires = (
        Comment.query.filter_by(file_id=file_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    visibles = [
        _presenter(comment, user, auteur_fiche)
        for comment in commentaires
        if peut_voir(user, comment, auteur_fiche)
    ]
    return {"commentaires": visibles}, None


def publier(user, file_id, body, audience):
    meta = trouver_fiche(file_id)
    if meta is None:
        return None, ("Fiche introuvable", 404)
    if audience not in AUDIENCES:
        return None, ("Indique pour qui est le commentaire.", 400)
    texte = clean_text(body, TAILLE_MAX)
    if texte is None:
        return None, ("Le commentaire est vide ou trop long (2000 caractères maximum).", 400)

    deja = Comment.query.filter_by(file_id=file_id, author_id=user.id).count()
    if deja >= PAR_FICHE:
        return None, ("Tu as déjà beaucoup commenté cette fiche.", 429)
    seuil = _maintenant() - timedelta(days=1)
    du_jour = Comment.query.filter(
        Comment.author_id == user.id,
        Comment.created_at >= seuil,
    ).count()
    if du_jour >= PAR_JOUR:
        return None, ("Trop de commentaires aujourd'hui. Réessaie demain.", 429)

    maintenant = _maintenant()
    comment = Comment(
        file_id=file_id,
        author_id=user.id,
        audience=audience,
        body=texte,
        status="ouvert",
        handler_id=None,
        corrected=False,
        created_at=maintenant,
        updated_at=maintenant,
    )
    db.session.add(comment)
    db.session.commit()
    return {"commentaire": _presenter(comment, user, _auteur_fiche(meta))}, None


def prendre(user, file_id, comment_id):
    """Réserve le commentaire. Une seule réservation peut réussir."""
    if not is_uuid(comment_id):
        return None, ("Commentaire introuvable", 404)
    meta = trouver_fiche(file_id)
    if meta is None:
        return None, ("Fiche introuvable", 404)
    comment = db.session.get(Comment, comment_id)
    auteur_fiche = _auteur_fiche(meta)
    if comment is None or comment.file_id != file_id or not peut_voir(user, comment, auteur_fiche):
        return None, ("Commentaire introuvable", 404)
    if not _peut_suivre(user, auteur_fiche):
        return None, ("Seul l'auteur de la fiche, un modérateur, un administrateur ou le propriétaire peut suivre ce commentaire.", 403)
    if comment.status == "pris" and comment.handler_id == user.id:
        return {"commentaire": _presenter(comment, user, auteur_fiche)}, None
    if comment.status != "ouvert" or comment.handler_id:
        return None, ("Quelqu'un s'occupe déjà de ce commentaire.", 409)

    db.session.execute(
        update(Comment)
        .where(
            Comment.id == comment_id,
            Comment.file_id == file_id,
            Comment.status == "ouvert",
            Comment.handler_id.is_(None),
        )
        .values(status="pris", handler_id=user.id, corrected=False, updated_at=_maintenant())
    )
    db.session.commit()
    db.session.expire_all()
    comment = db.session.get(Comment, comment_id)
    if comment is not None and comment.handler_id == user.id and comment.status == "pris":
        return {"commentaire": _presenter(comment, user, auteur_fiche)}, None
    return None, ("Quelqu'un s'occupe déjà de ce commentaire.", 409)


def valider(user, file_id, comment_id):
    if not is_uuid(comment_id):
        return None, ("Commentaire introuvable", 404)
    meta = trouver_fiche(file_id)
    if meta is None:
        return None, ("Fiche introuvable", 404)
    comment = db.session.get(Comment, comment_id)
    auteur_fiche = _auteur_fiche(meta)
    if comment is None or comment.file_id != file_id or not peut_voir(user, comment, auteur_fiche):
        return None, ("Commentaire introuvable", 404)
    if not peut_valider(user, comment, auteur_fiche):
        if comment.status == "valide":
            return None, ("Ce commentaire est déjà validé.", 409)
        return None, ("Seul le responsable de ce commentaire peut le valider.", 403)

    # On revérifie en base : le responsable ne doit pas avoir changé entre-temps.
    valeurs = {"status": "valide", "updated_at": _maintenant()}
    filtre = (
        update(Comment)
        .where(
            Comment.id == comment_id,
            Comment.file_id == file_id,
            Comment.status == "pris",
        )
    )
    if comment.handler_id == user.id:
        filtre = filtre.where(Comment.handler_id == user.id)
    elif user.role == "owner" and _responsable_actif(comment.handler_id) is None:
        filtre = filtre.where(Comment.handler_id == comment.handler_id)
    else:
        return None, ("Seul le responsable de ce commentaire peut le valider.", 403)

    db.session.execute(filtre.values(**valeurs))
    db.session.commit()
    db.session.expire_all()
    comment = db.session.get(Comment, comment_id)
    if comment is not None and comment.status == "valide" and (
        comment.handler_id == user.id or user.role == "owner"
    ):
        return {"commentaire": _presenter(comment, user, auteur_fiche)}, None
    return None, ("Seul le responsable de ce commentaire peut le valider.", 403)


def retirer(user, file_id, comment_id):
    """Retire le commentaire suivi, une fois la fiche modifiée par le même compte."""
    if not is_uuid(comment_id):
        return None, ("Commentaire introuvable", 404)
    meta = trouver_fiche(file_id)
    if meta is None:
        return None, ("Fiche introuvable", 404)
    comment = db.session.get(Comment, comment_id)
    auteur_fiche = _auteur_fiche(meta)
    if comment is None or comment.file_id != file_id or not peut_voir(user, comment, auteur_fiche):
        return None, ("Commentaire introuvable", 404)
    if comment.handler_id != user.id or not _peut_suivre(user, auteur_fiche):
        return None, ("Seul le compte qui suit ce commentaire peut le retirer.", 403)
    if not comment.corrected:
        return None, ("Modifie la fiche pendant que tu suis ce commentaire, ensuite tu pourras le retirer.", 403)

    resultat = Comment.query.filter(
        Comment.id == comment_id,
        Comment.file_id == file_id,
        Comment.handler_id == user.id,
        Comment.corrected.is_(True),
        Comment.status.in_(("pris", "valide")),
    ).delete(synchronize_session=False)
    db.session.commit()
    if resultat != 1:
        return None, ("Commentaire introuvable", 404)
    return {"message": "Commentaire retiré"}, None
