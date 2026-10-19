"""Point d'entrée du site de fiches.

Les adresses restent celles du projet :
    /accueil, /upload/..., /download/...
    /info/..., /auth/..., /users/..., /moderator/..., /admin/...

Le Python répond aux routes. Le JavaScript des pages appelle ces mêmes routes.
"""

import os
import secrets
from datetime import timedelta
from pathlib import Path

from flask import Flask, jsonify, redirect, render_template, request, send_from_directory
from flask_jwt_extended import JWTManager, get_jwt_identity, jwt_required
from flask_jwt_extended.exceptions import JWTExtendedException
from werkzeug.exceptions import HTTPException

from admin.routes import admin_bp
from auth.routes import auth_bp
from database.model import User, db
from info.routes import info_bp
from moderator.routes import moderator_bp
from users.routes import users_bp
from utils.files import remember_download, resolve_download, store_upload
from utils.http import error_response, redirect_to_login, wants_html


def _load_secret():
    """Clé de signature des jetons.

    Elle vient de l'environnement en production. En local, elle est créée une
    fois dans instance/jwt_secret (dossier ignoré par git) pour que les
    sessions survivent à un redémarrage.
    """
    from_env = os.environ.get("JWT_SECRET_KEY")
    if from_env:
        return from_env

    folder = Path("instance")
    folder.mkdir(exist_ok=True)
    secret_file = folder / "jwt_secret"
    if secret_file.is_file():
        saved = secret_file.read_text(encoding="utf-8").strip()
        if saved:
            return saved

    generated = secrets.token_urlsafe(64)
    secret_file.write_text(generated, encoding="utf-8")
    try:
        os.chmod(secret_file, 0o600)
    except OSError:
        pass
    return generated


def create_app():
    """Construit l'application Flask, la base et les protections HTTP."""
    app = Flask(__name__, static_folder="static", template_folder="templates")
    secret = _load_secret()

    # 100 Mo, aligné sur la limite Nginx (client_max_body_size).
    app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024
    app.secret_key = secret
    app.config["JWT_SECRET_KEY"] = secret
    app.config["JWT_ALGORITHM"] = "HS256"
    # Une séance de révision tient dans la journée, sans cookie éternel.
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=8)
    app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
    # False en HTTP local. Mettre JWT_COOKIE_SECURE=1 derrière HTTPS.
    app.config["JWT_COOKIE_SECURE"] = os.environ.get("JWT_COOKIE_SECURE", "0") == "1"
    app.config["JWT_COOKIE_SAMESITE"] = "Lax"
    app.config["JWT_COOKIE_CSRF_PROTECT"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URI", "sqlite:///users.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.json.ensure_ascii = False

    jwt = JWTManager(app)
    db.init_app(app)
    Path("uploads").mkdir(exist_ok=True)

    with app.app_context():
        db.create_all()

    @jwt.token_in_blocklist_loader
    def token_revoked(_header, payload):
        """Un ban, ou un compte supprimé, invalide le cookie déjà émis."""
        user = db.session.get(User, payload.get("sub"))
        return user is None or user.is_ban

    @jwt.unauthorized_loader
    def missing_token(reason):
        if wants_html():
            return redirect_to_login()
        if "csrf" in str(reason).lower():
            return jsonify({"error": "Jeton de sécurité manquant. Recharge la page."}), 401
        return jsonify({"error": "Connexion requise"}), 401

    @jwt.invalid_token_loader
    def invalid_token(_reason):
        if wants_html():
            return redirect_to_login()
        return jsonify({"error": "Session invalide"}), 401

    @jwt.expired_token_loader
    def expired_token(_header, _payload):
        if wants_html():
            return redirect_to_login()
        return jsonify({"error": "Session expirée"}), 401

    @jwt.revoked_token_loader
    def revoked_token(_header, _payload):
        if wants_html():
            return redirect_to_login()
        return jsonify({"error": "Compte suspendu ou indisponible"}), 401

    @app.after_request
    def security_headers(response):
        """En-têtes qui limitent le sniffing, l'intégration dans une iframe et les fuites."""
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "same-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; img-src 'self' data:; style-src 'self'; "
            "script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        )
        if request.path.startswith(("/users", "/admin", "/moderator", "/auth")):
            response.headers["Cache-Control"] = "no-store"
        return response

    @app.errorhandler(404)
    def not_found(_error):
        return error_response("Page introuvable", 404)

    @app.errorhandler(413)
    def too_large(_error):
        return error_response("Fichier trop volumineux (100 Mo maximum).", 413)

    @app.errorhandler(Exception)
    def unexpected(error):
        # Les erreurs HTTP (404, 413...) ont déjà leur traitement.
        # Celles du jeton aussi : Flask choisit le gestionnaire le plus précis.
        if isinstance(error, JWTExtendedException):
            # Filet de sécurité si le gestionnaire précis du jeton n'a pas répondu.
            if wants_html():
                return redirect_to_login()
            if "csrf" in str(error).lower():
                return jsonify({"error": "Jeton de sécurité manquant. Recharge la page."}), 401
            return jsonify({"error": "Session invalide"}), 401
        if isinstance(error, HTTPException):
            return error_response(error.description or "Erreur", error.code or 500)
        app.logger.exception("Erreur interne")
        return error_response("Erreur interne", 500)

    @app.route("/")
    def root():
        """L'adresse nue ouvre l'accueil."""
        return redirect("/accueil")

    @app.route("/accueil")
    def accueil():
        """Page principale : choisir un cours, lire ou publier."""
        return render_template("index.html")

    @app.route("/upload/<matiere>/<classe>/<specialite>", methods=["POST"])
    @jwt_required()
    def upload_file(matiere, classe, specialite):
        """Publie une fiche. L'auteur enregistré est le compte connecté."""
        user = db.session.get(User, get_jwt_identity())
        if user is None:
            return jsonify({"error": "Compte introuvable"}), 404
        if user.is_ban:
            return jsonify({"error": "Compte suspendu"}), 403
        return store_upload(
            user,
            matiere,
            classe,
            specialite,
            request.files.get("file"),
            request.form.get("title"),
            request.form.get("desc"),
        )

    @app.route("/download/<matiere>/<classe>/<specialite>/<file_id>", methods=["GET"])
    @jwt_required(optional=True)
    def download_file(matiere, classe, specialite, file_id):
        """Envoie le fichier en téléchargement. La consultation reste ouverte sans compte.

        Le nom d'origine est nettoyé, et le type annoncé est neutre, pour que le
        navigateur n'exécute pas un document comme une page.
        """
        found, error = resolve_download(matiere, classe, specialite, file_id)
        if error:
            return error

        stored_filename, original_filename, cache = found
        identity = get_jwt_identity()
        if identity:
            user = db.session.get(User, identity)
            if user is not None and not user.is_ban:
                remember_download(user, file_id, cache)

        response = send_from_directory(
            "uploads",
            stored_filename,
            as_attachment=True,
            download_name=original_filename,
            mimetype="application/octet-stream",
        )
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response

    app.register_blueprint(info_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(moderator_bp)
    app.register_blueprint(admin_bp)
    return app


app = create_app()


if __name__ == "__main__":
    # debug reste désactivé : le débogueur Flask exposé sur le réseau est une porte d'entrée.
    app.run(host="0.0.0.0", port=8000, debug=False, use_reloader=False)
