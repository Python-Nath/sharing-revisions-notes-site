from database.model import User
from flask import jsonify, request, Blueprint, render_template
from flask_jwt_extended import jwt_required, create_access_token, set_access_cookies, unset_jwt_cookies, get_jwt_identity

from werkzeug.security import check_password_hash

auth_bp = Blueprint("auth", __name__, url_prefix="/auth", template_folder=".", static_folder="auth/static")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if user.is_ban:
        return jsonify({"error": "User is banned"}), 403

    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=user.id)
    set_access_cookies(jsonify({"login": True}), access_token)

    return jsonify({"message": "Login successful"}), 200

@auth_bp.route("/login-page")
def login_page():
    return render_template("auth/login/login.html")

@auth_bp.route("/logout-page")
@jwt_required()
def logout_page():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    data = {
        "name": user.name,
        "surname": user.surname
    }

    return render_template("auth/logout/logout.html", user=data)

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    response = jsonify({"message": "Logout successful"})
    unset_jwt_cookies(response)
    return response, 200