"""Connexion et déconnexion.

Le jeton est déposé dans un cookie HttpOnly. Le JavaScript ne peut pas le lire.
Un second cookie, lisible celui-là, sert de jeton CSRF pour les requêtes qui modifient
des données (envoi, suppression, ban).
"""

import time
from threading import Lock

from flask import Blueprint, jsonify, render_template, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
    set_access_cookies,
    unset_jwt_cookies,
)
from werkzeug.security import check_password_hash, generate_password_hash

from database.model import User
from utils.access import home_for_role, require_user
from utils.http import safe_next_url
from utils.users import public_profile


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/auth",
    template_folder=".",
    static_folder="static",
)

# Hash fictif : si l'identifiant n'existe pas, on vérifie quand même un hash.
# Le temps de réponse reste proche, et on ne révèle pas si le compte existe.
_DUMMY_HASH = generate_password_hash("mot-de-passe-inutilisable")
_ATTEMPTS = {}
_ATTEMPTS_LOCK = Lock()
_WINDOW_SECONDS = 600


def _max_attempts():
    """Nombre d'échecs acceptés par identifiant sur 10 minutes. Réglable pour les tests."""
    import os

    try:
        return max(1, int(os.environ.get("LOGIN_MAX_ATTEMPTS", "8")))
    except ValueError:
        return 8


def _attempt_key(username):
    return (username or "").strip().lower()[:80]


def login_blocked(username):
    """Vrai si cet identifiant a déjà trop échoué récemment.

    On limite par identifiant, pas par adresse IP : derrière Nginx, toute
    l'école peut partager la même IP, et un plafond global bloquerait tout le monde.
    """
    now = time.time()
    key = _attempt_key(username)
    with _ATTEMPTS_LOCK:
        recent = [moment for moment in _ATTEMPTS.get(key, []) if now - moment < _WINDOW_SECONDS]
        _ATTEMPTS[key] = recent
        return len(recent) >= _max_attempts()


def login_failed(username):
    """Mémorise un échec de mot de passe."""
    key = _attempt_key(username)
    with _ATTEMPTS_LOCK:
        _ATTEMPTS.setdefault(key, []).append(time.time())


def login_succeeded(username):
    """Oublie les échecs après une connexion valide."""
    with _ATTEMPTS_LOCK:
        _ATTEMPTS.pop(_attempt_key(username), None)


@auth_bp.route("/login", methods=["POST"])
def login():
    """Vérifie l'identifiant et pose le cookie de session."""
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        return jsonify({"error": "Un objet JSON est requis"}), 400

    username = data.get("username")
    password = data.get("password")
    if not isinstance(username, str) or not isinstance(password, str):
        return jsonify({"error": "Identifiant ou mot de passe incorrect"}), 401

    username = username.strip()
    # Un mot de passe énorme sert surtout à ralentir le serveur. On le refuse tôt.
    if not username or len(username) > 80 or not password or len(password) > 200:
        return jsonify({"error": "Identifiant ou mot de passe incorrect"}), 401

    if login_blocked(username):
        return jsonify({"error": "Trop de tentatives. Réessaie dans quelques minutes."}), 429

    user = User.query.filter_by(username=username).first()
    password_ok = check_password_hash(user.password if user else _DUMMY_HASH, password)
    if user is None or not password_ok:
        login_failed(username)
        return jsonify({"error": "Identifiant ou mot de passe incorrect"}), 401

    if user.is_ban:
        return jsonify({"error": "Compte suspendu"}), 403

    login_succeeded(username)
    token = create_access_token(identity=user.id)
    response = jsonify({
        "message": "Connexion réussie",
        "role": user.role,
        "username": user.username,
        "home": home_for_role(user.role),
    })
    set_access_cookies(response, token)
    return response, 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """Identité du compte connecté, pour construire le menu."""
    user, error = require_user()
    if error:
        return error
    return jsonify(public_profile(user)), 200


@auth_bp.route("/login-page", methods=["GET"])
def login_page():
    """Formulaire de connexion. Le paramètre next est nettoyé avant d'être renvoyé au script."""
    next_url = safe_next_url(request.args.get("next"), "/accueil")
    return render_template("login/login.html", next_url=next_url)


@auth_bp.route("/logout-page", methods=["GET"])
@jwt_required()
def logout_page():
    """Page de confirmation avant de quitter la session."""
    user, error = require_user()
    if error:
        return error
    return render_template(
        "logout/logout.html",
        user=public_profile(user),
        retour=home_for_role(user.role),
    )


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """Efface les cookies du jeton et du CSRF."""
    # get_jwt_identity est lu pour s'assurer que le jeton a bien été vérifié.
    get_jwt_identity()
    response = jsonify({"message": "Déconnexion réussie"})
    unset_jwt_cookies(response)
    return response, 200
