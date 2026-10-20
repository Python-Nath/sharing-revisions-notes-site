"""Recherche de fiches et de comptes.

Les filtres sont combinés : chaque critère renseigné réduit la liste.
Le texte est comparé tel quel, les caractères % et _ ne sont pas des jokers.
"""

from database.model import User
from utils.catalogue import toutes_les_fiches, vue_publique
from utils.etoiles import annoter
from utils.security import clean_text, segment_ok
from utils.users import public_profile


LIMITE_FICHES = 80
LIMITE_COMPTES = 100
ROLES = ("user", "moderator", "admin", "owner")


def _contient(valeur, aiguille):
    return aiguille.casefold() in (valeur or "").casefold()


def _entier(valeur, plafond):
    if valeur is None or valeur == "":
        return None, None
    if isinstance(valeur, str):
        valeur = valeur.strip()
    if not isinstance(valeur, str) or not valeur.isdigit():
        return None, "Le nombre d'étoiles minimum est invalide."
    nombre = int(valeur)
    if nombre > plafond:
        return None, "Le nombre d'étoiles minimum est trop grand."
    return nombre, None


def chercher_fiches(args, user):
    """Retourne (données, None) ou (None, (message, code))."""
    q = (args.get("q") or "").strip()
    matiere = (args.get("matiere") or "").strip()
    classe = (args.get("classe") or "").strip()
    specialite = (args.get("specialite") or "").strip()
    auteur = (args.get("auteur") or "").strip()
    if q and clean_text(q, 120) is None:
        return None, ("La recherche est vide ou trop longue.", 400)
    for nom, valeur in (("matière", matiere), ("classe", classe), ("spécialité", specialite)):
        if valeur and not segment_ok(valeur):
            return None, (f"Cette {nom} est invalide.", 400)
    if auteur and clean_text(auteur, 80) is None:
        return None, ("Le nom d'auteur est invalide.", 400)
    minimum, erreur = _entier(args.get("etoiles_min"), 1_000_000)
    if erreur:
        return None, (erreur, 400)
    if not any((q, matiere, classe, specialite, auteur, minimum not in (None, 0))):
        return None, ("Indique au moins un critère.", 400)

    vues = []
    for meta in toutes_les_fiches():
        vue = vue_publique(meta)
        if matiere and vue["matiere"] != matiere:
            continue
        if classe and vue["classe"] != classe:
            continue
        if specialite and vue["specialite"] != specialite:
            continue
        if auteur and not _contient(vue["author"], auteur):
            continue
        if q and not any(
            _contient(vue[champ], q)
            for champ in ("title", "desc", "author", "original_filename", "matiere", "classe", "specialite")
        ):
            continue
        vues.append(vue)

    annoter(vues, user)
    if minimum:
        vues = [vue for vue in vues if vue["etoiles"] >= minimum]
    vues.sort(key=lambda vue: (-vue["etoiles"], (vue["title"] or "").casefold(), vue["id"]))
    tronque = len(vues) > LIMITE_FICHES
    return {"fiches": vues[:LIMITE_FICHES], "tronque": tronque}, None


def chercher_comptes(args):
    """Retourne (données, None) ou (None, (message, code))."""
    q = (args.get("q") or "").strip()
    role = (args.get("role") or "").strip()
    etat = (args.get("etat") or "").strip()
    if q and clean_text(q, 80) is None:
        return None, ("La recherche est vide ou trop longue.", 400)
    if role and role not in ROLES:
        return None, ("Rôle inconnu.", 400)
    if etat and etat not in ("actif", "suspendu"):
        return None, ("État inconnu.", 400)
    if not any((q, role, etat)):
        return None, ("Indique au moins un critère.", 400)

    trouvés = []
    for compte in User.query.order_by(User.username.asc()).all():
        if role and compte.role != role:
            continue
        if etat == "actif" and compte.is_ban:
            continue
        if etat == "suspendu" and not compte.is_ban:
            continue
        if q and not any(_contient(getattr(compte, champ), q) for champ in ("username", "name", "surname")):
            continue
        trouvés.append(compte)

    tronque = len(trouvés) > LIMITE_COMPTES
    profils = [public_profile(compte, include_status=True) for compte in trouvés[:LIMITE_COMPTES]]
    return {"comptes": profils, "tronque": tronque}, None
