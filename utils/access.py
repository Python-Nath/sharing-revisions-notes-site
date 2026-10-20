"""Droits des comptes : qui peut entrer, bannir, ou changer un rôle.

Le rôle est toujours relu dans la base. Il n'est pas copié dans le jeton,
donc un changement de rôle ou un ban s'applique tout de suite.
"""

from flask import jsonify, redirect
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from database.model import User, db
from utils.http import error_response, wants_html
from utils.security import is_uuid


def home_for_role(role):
    """Page d'accueil personnelle selon le rôle."""
    if role == "owner":
        return "/owner/audit"
    if role == "admin":
        return "/admin/dashboard"
    if role == "moderator":
        return "/moderator/dashboard"
    return "/users/dashboard"


def load_current_user():
    """Compte lié au jeton, ou None s'il n'existe plus."""
    identity = get_jwt_identity()
    if not identity:
        return None
    return db.session.get(User, identity)


def optional_user():
    """Compte du jeton s'il est encore valide, sinon None.

    Un cookie absent, expiré ou révoqué ne bloque pas la page publique :
    la personne est simplement traitée comme non connectée.
    """
    try:
        verify_jwt_in_request(optional=True)
    except Exception:
        return None
    identity = get_jwt_identity()
    if not identity or not is_uuid(identity):
        return None
    user = db.session.get(User, identity)
    if user is None or user.is_ban:
        return None
    return user


def require_user():
    """Retourne (compte, None) ou (None, réponse d'erreur)."""
    user = load_current_user()
    if user is None:
        return None, error_response("Compte introuvable", 404)
    if user.is_ban:
        return None, error_response("Compte suspendu", 403)
    return user, None


def require_roles(user, roles):
    """Laisse passer les rôles listés. Une page HTML est renvoyée vers son propre espace."""
    if user.role in roles:
        return None
    if wants_html():
        return redirect(home_for_role(user.role))
    return jsonify({"error": "Accès refusé"}), 403


def can_moderate(actor, target):
    """Règle de suspension d'un compte.

    Le propriétaire peut suspendre tout le monde sauf un autre propriétaire.
    Un administrateur peut suspendre un élève ou un modérateur.
    Un modérateur ne peut suspendre qu'un élève.
    Personne ne peut se suspendre soi-même, ni toucher au propriétaire.
    """
    if actor.id == target.id or target.role == "owner":
        return False
    if actor.role == "owner":
        return True
    if actor.role == "admin":
        return target.role != "admin"
    if actor.role == "moderator":
        return target.role == "user"
    return False


def set_ban(actor, target_id, banned):
    """Suspend ou réactive un compte, si l'acteur en a le droit."""
    if not is_uuid(target_id):
        return jsonify({"error": "Compte introuvable"}), 404
    if actor.role not in ("admin", "moderator", "owner"):
        return jsonify({"error": "Accès refusé"}), 403

    target = db.session.get(User, target_id)
    if target is None:
        return jsonify({"error": "Compte introuvable"}), 404
    if not can_moderate(actor, target):
        return jsonify({"error": "Action non autorisée sur ce compte"}), 403

    target.is_ban = bool(banned)
    db.session.commit()
    message = "Compte suspendu" if banned else "Compte réactivé"
    return jsonify({"message": message}), 200


def set_role(actor, target_id, new_role):
    """Change le rôle. Réservé à un administrateur ou au propriétaire, jamais sur son propre compte.

    Le rôle propriétaire ne s'attribue pas ici : il vient de init_users.py.
    """
    if actor.role not in ("admin", "owner"):
        return jsonify({"error": "Accès refusé"}), 403
    if new_role not in ("user", "moderator", "admin"):
        return jsonify({"error": "Rôle inconnu"}), 400
    if not is_uuid(target_id):
        return jsonify({"error": "Compte introuvable"}), 404

    target = db.session.get(User, target_id)
    if target is None:
        return jsonify({"error": "Compte introuvable"}), 404
    if target.role == "owner":
        return jsonify({"error": "Le propriétaire ne peut pas être modifié"}), 403
    if actor.id == target.id:
        return jsonify({"error": "Tu ne peux pas modifier ton propre rôle"}), 403

    # On garde toujours au moins un administrateur, sinon plus personne ne gère le site.
    if target.role == "admin" and new_role != "admin":
        other_admins = User.query.filter(User.role == "admin", User.id != target.id).count()
        if other_admins < 1:
            return jsonify({"error": "Il doit rester au moins un administrateur"}), 409

    target.role = new_role
    db.session.commit()
    return jsonify({"message": "Rôle mis à jour", "role": new_role}), 200
