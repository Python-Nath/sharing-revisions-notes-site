"""Audit du propriétaire : chiffres du site, sessions, et interruption du service.

Les administrateurs ne voient pas cette page. Eux aussi sont coupés quand le
site est suspendu.
"""

from flask import Blueprint, jsonify, render_template, request
from flask_jwt_extended import jwt_required

from utils.access import require_roles, require_user
from utils.audit import collecter_audit
from utils.site_gate import definir_suspension
from utils.users import public_profile


owner_bp = Blueprint("owner", __name__, url_prefix="/owner")


def _owner_only():
    user, error = require_user()
    if error:
        return None, error
    refused = require_roles(user, ("owner",))
    if refused:
        return None, refused
    return user, None


@owner_bp.route("/audit", methods=["GET"])
@jwt_required()
def audit_page():
    """Page d'audit. Les chiffres sont aussi dans la réponse, pour le premier affichage."""
    user, error = _owner_only()
    if error:
        return error
    return render_template(
        "audit.html",
        profil=public_profile(user),
        audit=collecter_audit(),
        titre="Audit du site",
    )


@owner_bp.route("/audit.json", methods=["GET"])
@jwt_required()
def audit_json():
    """Même relevé, pour actualiser la page sans la recharger."""
    _user, error = _owner_only()
    if error:
        return error
    return jsonify(collecter_audit()), 200


@owner_bp.route("/site", methods=["POST"])
@jwt_required()
def basculer_site():
    """Suspend ou réactive le site. Le corps est {"suspendu": true|false}."""
    user, error = _owner_only()
    if error:
        return error
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not isinstance(data.get("suspendu"), bool):
        return jsonify({"error": "Indique suspendu avec true ou false."}), 400
    definir_suspension(data["suspendu"], user.username)
    return jsonify(collecter_audit()), 200
