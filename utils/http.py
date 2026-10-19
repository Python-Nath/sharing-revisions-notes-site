"""Réponses HTTP communes aux pages et à l'API.

Les navigateurs reçoivent une page HTML. Les appels JavaScript, qui annoncent
Accept: application/json, reçoivent du JSON. Ainsi une même erreur reste lisible
des deux côtés.
"""

from urllib.parse import quote

from flask import jsonify, redirect, render_template, request


def wants_html():
    """Vrai quand c'est une navigation de page, pas un appel de l'API."""
    if request.method != "GET":
        return False
    # Ces préfixes sont toujours des données, même si on les ouvre dans la barre d'adresse.
    if request.path.startswith(("/info", "/upload", "/download")):
        return False
    accept = request.headers.get("Accept", "")
    return "text/html" in accept


def error_response(message, status):
    """Erreur affichable : page simple, ou JSON pour le script de la page."""
    if wants_html():
        return render_template("erreur.html", message=message), status
    return jsonify({"error": message}), status


def safe_next_url(value, default="/accueil"):
    """N'accepte qu'un chemin interne. Bloque les redirections vers un autre site."""
    if not isinstance(value, str):
        return default
    if not value.startswith("/") or value.startswith("//"):
        return default
    if any(char in value for char in ("\\", "\x00", "\r", "\n", " ")):
        return default
    return value


def redirect_to_login():
    """Envoie vers la page de connexion en mémorisant la page demandée."""
    target = safe_next_url(request.path, "/accueil")
    return redirect("/auth/login-page?next=" + quote(target, safe="/"))
