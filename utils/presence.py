"""Sessions ouvertes, pour savoir qui est connecté.

Le jeton reste dans le cookie. Ici on ne garde que son identifiant (jti),
l'heure de dernière activité, et si la personne s'est déconnectée.
"""

from datetime import datetime, timedelta, timezone

from flask_jwt_extended import decode_token

from database.model import Presence, User, db


FENETRE_EN_LIGNE = timedelta(minutes=15)


def _maintenant():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _depuis_claim(valeur):
    """Convertit l'expiration du jeton en datetime UTC naïf, comme le reste de la base."""
    if isinstance(valeur, datetime):
        if valeur.tzinfo is not None:
            return valeur.astimezone(timezone.utc).replace(tzinfo=None)
        return valeur
    if isinstance(valeur, (int, float)):
        return datetime.fromtimestamp(valeur, timezone.utc).replace(tzinfo=None)
    return _maintenant() + timedelta(hours=8)


def _iso(moment):
    if moment is None:
        return None
    if moment.tzinfo is not None:
        moment = moment.astimezone(timezone.utc).replace(tzinfo=None)
    return moment.isoformat(timespec="seconds") + "Z"


def _agent(valeur):
    if not isinstance(valeur, str):
        return ""
    propre = valeur.replace("\r", " ").replace("\n", " ").strip()
    return propre[:240]


def ouvrir_presence(user_id, token, user_agent):
    """Enregistre le jeton qui vient d'être émis."""
    claims = decode_token(token)
    jti = claims.get("jti")
    if not isinstance(jti, str) or not jti:
        return
    maintenant = _maintenant()
    db.session.add(Presence(
        jti=jti,
        user_id=user_id,
        created_at=maintenant,
        last_seen=maintenant,
        expires_at=_depuis_claim(claims.get("exp")),
        user_agent=_agent(user_agent),
        revoked=False,
    ))
    db.session.commit()


def fermer_presence(jti):
    """Marque la session comme fermée. Un jeton déjà inconnu est ignoré."""
    if not jti:
        return
    ligne = db.session.get(Presence, jti)
    if ligne is None or ligne.revoked:
        return
    ligne.revoked = True
    ligne.last_seen = _maintenant()
    db.session.commit()


def est_revoquee(jti):
    """Vrai seulement si cette session a été fermée explicitement.

    Les jetons émis avant ce suivi n'ont pas de ligne : ils restent valables
    jusqu'à leur expiration, le ban étant vérifié à part.
    """
    if not jti:
        return False
    ligne = db.session.get(Presence, jti)
    return ligne is not None and bool(ligne.revoked)


def toucher_presence(jti):
    """Met à jour la dernière activité, au plus une fois toutes les 30 secondes."""
    if not jti:
        return
    if db.session.new or db.session.dirty or db.session.deleted:
        return
    ligne = db.session.get(Presence, jti)
    if ligne is None or ligne.revoked:
        return
    maintenant = _maintenant()
    if ligne.last_seen and (maintenant - ligne.last_seen).total_seconds() < 30:
        return
    ligne.last_seen = maintenant
    db.session.commit()


def resume_sessions():
    """Sessions encore valides, et celles fermées mais pas encore expirées."""
    maintenant = _maintenant()
    Presence.query.filter(Presence.expires_at < maintenant).delete(synchronize_session=False)
    db.session.commit()

    lignes = (
        db.session.query(Presence, User)
        .outerjoin(User, User.id == Presence.user_id)
        .filter(Presence.expires_at >= maintenant)
        .order_by(Presence.last_seen.desc())
        .all()
    )

    seuil = maintenant - FENETRE_EN_LIGNE
    liste = []
    personnes = set()
    en_ligne = 0
    deconnectees = 0
    for presence, user in lignes:
        if presence.revoked:
            deconnectees += 1
            continue
        suspendu = user is None or bool(user.is_ban)
        recent = presence.last_seen is not None and presence.last_seen >= seuil
        if user is not None and not suspendu:
            personnes.add(user.id)
            if recent:
                en_ligne += 1
        liste.append({
            "username": user.username if user is not None else "compte supprimé",
            "nom": f"{user.name} {user.surname}".strip() if user is not None else "Compte supprimé",
            "role": user.role if user is not None else "",
            "suspendu": suspendu,
            "depuis": _iso(presence.created_at),
            "vu": _iso(presence.last_seen),
            "expire": _iso(presence.expires_at),
            "agent": presence.user_agent or "",
            "en_ligne": bool(recent and not suspendu),
        })

    return {
        "ouvertes": len(liste),
        "personnes": len(personnes),
        "en_ligne": en_ligne,
        "deconnectees": deconnectees,
        "liste": liste,
    }
