"""Relevé d'un élève, limité à ses propres fiches.

Aucune session, aucun autre compte, aucun fichier qui ne lui appartient pas.
Les commentaires réservés à l'équipe n'apparaissent pas s'il ne peut pas les lire.
"""

from database.model import Comment, User, db
from utils.catalogue import taille_octets, trouver_fiche, vue_publique
from utils.commentaires import peut_voir
from utils.etoiles import annoter
from utils.presence import _iso, _maintenant
from utils.security import is_uuid


def _commentaires_visibles(user, file_ids):
    if not file_ids:
        return []
    lignes = (
        Comment.query.filter(Comment.file_id.in_(file_ids))
        .order_by(Comment.created_at.desc())
        .all()
    )
    visibles = []
    for comment in lignes:
        meta = trouver_fiche(comment.file_id)
        if meta is None:
            continue
        auteur = meta.get("author") if isinstance(meta.get("author"), str) else ""
        if peut_voir(user, comment, auteur):
            visibles.append((comment, meta))
    return visibles


def collecter_audit_perso(user):
    """Dict JSON du relevé personnel."""
    identifiants = [file_id for file_id in (user.uploaded_files or []) if is_uuid(file_id)]
    fiches = []
    for file_id in identifiants:
        meta = trouver_fiche(file_id)
        if meta is None or meta.get("author") != user.username:
            continue
        vue = vue_publique(meta)
        vue["octets"] = taille_octets(meta)
        fiches.append(vue)
    annoter(fiches, user)

    file_ids = {fiche["id"] for fiche in fiches}
    telechargements = 0
    if file_ids:
        for compte in User.query.all():
            for file_id in compte.download_ids or []:
                if file_id in file_ids:
                    telechargements += 1

    visibles = _commentaires_visibles(user, list(file_ids))
    par_fiche = {fiche["id"]: {"ouverts": 0, "pris": 0, "valides": 0} for fiche in fiches}
    totaux = {"ouverts": 0, "pris": 0, "valides": 0}
    for comment, _meta in visibles:
        cle = {"ouvert": "ouverts", "pris": "pris", "valide": "valides"}.get(comment.status)
        if cle is None:
            continue
        totaux[cle] += 1
        if comment.file_id in par_fiche:
            par_fiche[comment.file_id][cle] += 1

    for fiche in fiches:
        fiche["commentaires"] = par_fiche.get(fiche["id"], {"ouverts": 0, "pris": 0, "valides": 0})

    avec_etoiles = [fiche for fiche in fiches if fiche["etoiles"] > 0]
    avec_etoiles.sort(key=lambda fiche: (-fiche["etoiles"], (fiche["title"] or "").casefold(), fiche["id"]))
    plus = avec_etoiles[0] if avec_etoiles else None

    recents = []
    for comment, meta in visibles[:12]:
        responsable = None
        if comment.handler_id:
            handler = db.session.get(User, comment.handler_id)
            if handler is not None:
                responsable = handler.username
        recents.append({
            "texte": comment.body,
            "audience": comment.audience,
            "statut": comment.status,
            "responsable": responsable,
            "fiche": meta.get("title") or "Sans titre",
            "matiere": meta.get("matiere") or "",
            "le": _iso(comment.created_at),
        })

    fiches.sort(key=lambda fiche: (-fiche["etoiles"], (fiche["title"] or "").casefold()))
    return {
        "genere_le": _iso(_maintenant()),
        "resume": {
            "fiches": len(fiches),
            "octets": sum(fiche["octets"] for fiche in fiches),
            "etoiles": sum(fiche["etoiles"] for fiche in fiches),
            "telechargements": telechargements,
            "commentaires": totaux,
        },
        "plus_etoilee": None if plus is None else {
            "titre": plus["title"] or "Sans titre",
            "matiere": plus["matiere"],
            "classe": plus["classe"],
            "specialite": plus["specialite"],
            "etoiles": plus["etoiles"],
        },
        "liste": [
            {
                "id": fiche["id"],
                "titre": fiche["title"] or "Sans titre",
                "matiere": fiche["matiere"],
                "classe": fiche["classe"],
                "specialite": fiche["specialite"],
                "etoiles": fiche["etoiles"],
                "octets": fiche["octets"],
                "commentaires": fiche["commentaires"],
            }
            for fiche in fiches
        ],
        "commentaires_recents": recents,
    }
