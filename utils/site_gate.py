"""Interrupteur du site, réservé au propriétaire.

L'état tient dans instance/site_status.json (ou SITE_STATUS_PATH pour les tests).
Tant que le site est suspendu, seul le propriétaire passe. La connexion reste
ouverte pour qu'il puisse revenir réactiver.
"""

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock

from flask import jsonify, render_template, request

from utils.http import wants_html


_VERROU = Lock()
_ENDPOINTS_OUVERTS = {
    "auth.login",
    "auth.login_page",
    "auth.logout",
    "auth.logout_page",
    "auth.me",
    "static",
    "auth.static",
}


def _chemin():
    force = os.environ.get("SITE_STATUS_PATH")
    if force:
        return Path(force)
    dossier = Path("instance")
    dossier.mkdir(exist_ok=True)
    return dossier / "site_status.json"


def _ouvert():
    return {"suspended": False, "since": None, "by": None}


def lire_etat():
    """État courant. Un fichier absent veut dire : le site est ouvert."""
    chemin = _chemin()
    if not chemin.is_file():
        return _ouvert()
    try:
        data = json.loads(chemin.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError, UnicodeError):
        return _ouvert()
    if not isinstance(data, dict):
        return _ouvert()
    return {
        "suspended": bool(data.get("suspended")),
        "since": data.get("since") if isinstance(data.get("since"), str) else None,
        "by": data.get("by") if isinstance(data.get("by"), str) else None,
    }


def definir_suspension(suspendu, username):
    """Pose ou retire la suspension. Une seconde suspension ne change pas la date."""
    with _VERROU:
        actuel = lire_etat()
        if suspendu and actuel["suspended"]:
            return actuel
        if suspendu:
            etat = {
                "suspended": True,
                "since": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
                "by": username or "",
            }
        else:
            etat = _ouvert()
        chemin = _chemin()
        chemin.parent.mkdir(exist_ok=True)
        temporaire = chemin.with_suffix(".tmp")
        temporaire.write_text(json.dumps(etat), encoding="utf-8")
        try:
            os.chmod(temporaire, 0o600)
        except OSError:
            pass
        temporaire.replace(chemin)
        return etat


def _date_lisible(iso):
    if not isinstance(iso, str) or len(iso) < 16:
        return None
    # 2026-10-19T17:36:00Z -> 19/10/2026 17:36 UTC
    try:
        jour, heure = iso[:10], iso[11:16]
        annee, mois, numero = jour.split("-")
        return f"{numero}/{mois}/{annee} {heure} UTC"
    except ValueError:
        return None


def _est_proprietaire():
    """Vrai si le cookie courant est un propriétaire non suspendu.

    Une erreur de jeton ne bloque pas la requête : l'appelant décide ensuite.
    """
    from flask_jwt_extended import get_jwt, verify_jwt_in_request

    from database.model import User, db

    try:
        verify_jwt_in_request(optional=True)
        claims = get_jwt()
    except Exception:
        return False
    user_id = claims.get("sub") if claims else None
    if not user_id:
        return False
    user = db.session.get(User, user_id)
    return user is not None and user.role == "owner" and not user.is_ban


def bloquer_si_suspendu():
    """Réponse 503 si le site est en pause, sinon None pour laisser passer."""
    etat = lire_etat()
    if not etat["suspended"]:
        return None
    if request.endpoint in _ENDPOINTS_OUVERTS or request.path.startswith("/static/"):
        return None
    if _est_proprietaire():
        return None
    if wants_html():
        return render_template("suspendu.html", depuis=_date_lisible(etat.get("since"))), 503
    return jsonify({"error": "Le site est suspendu."}), 503
