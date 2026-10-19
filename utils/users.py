"""Présentation publique d'un compte.

Le mot de passe et les chemins internes ne sortent jamais d'ici.
"""


def public_profile(user, include_status=False):
    """Champs sûrs à montrer dans une page ou une réponse JSON."""
    profile = {
        "id": user.id,
        "name": user.name,
        "surname": user.surname,
        "username": user.username,
        "role": user.role,
    }
    if include_status:
        profile["is_ban"] = bool(user.is_ban)
        profile["created_at"] = user.created_at.isoformat() if user.created_at else None
    return profile


def list_profiles():
    """Tous les comptes, triés par identifiant, pour les pages de gestion."""
    from database.model import User

    users = User.query.order_by(User.username).all()
    return [public_profile(user, include_status=True) for user in users]
