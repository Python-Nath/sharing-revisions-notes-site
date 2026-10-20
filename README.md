# Sharing Revisions Notes Site

Site de fiches de révision entre élèves. On choisit une matière, une classe et une spécialité, on lit les fiches, on les télécharge, et un compte permet d'en publier.

## Fonctions

- Cours rangés en `matiere / classe / spécialité`.
- Publication avec titre, description et fichier. L'auteur enregistré est le compte connecté.
- Téléchargement ouvert sans compte. Le nom envoyé au navigateur est nettoyé.
- Comptes : élève, modérateur, administrateur, et un seul propriétaire.
- Étoiles, une par compte et par fiche. Le classement est sur l'audit du propriétaire.
- Commentaires sur n'importe quelle fiche. Visibilité : tous les élèves, seulement l'équipe, ou les deux. Une seule personne suit un commentaire. Elle peut le retirer après avoir modifié la fiche.
- Recherche de fiches (texte, auteur, étoiles minimum). Recherche de comptes pour le modérateur, l'admin et le propriétaire.
- Audit du site pour le propriétaire, audit personnel limité aux fiches du compte.
- Mot de passe à choisir à la première connexion, et modifiable ensuite depuis le menu.
- Le propriétaire peut suspendre le site. Lui seul continue de passer.

## Technique

- Python, Flask, cookies JWT, CSRF.
- SQLite pour les comptes, les sessions, les étoiles et les commentaires.
- Fichiers : JSON dans `matiere/`, document dans `uploads/`.
- Pages HTML, CSS et JavaScript. Le script construit les cartes sans injecter de HTML.

## Installation

Python 3 et Git.

```bash
cd /opt
git clone https://github.com/Python-Nath/sharing-revisions-notes-site.git
cd sharing-revisions-notes-site

sudo apt install python3-venv
python3 -m venv ./venv
source ./venv/bin/activate
pip install -r requirements.txt

python make_structure.py
python init_users.py
sh init-server.sh
```

`make_structure.py` crée les dossiers de cours. `init_users.py` crée les comptes de démonstration. Leur mot de passe devra être changé à la première connexion. `init-server.sh` propose le service systemd et Nginx, ou le lancement local. Sur le choix 1, il écrit les variables d'environnement commentées dans `/etc/sharing-revisions-notes-site.env`.

Le choix 2 utilise `./venv/bin/python` s'il existe. La commande `python` seule n'est pas fournie par toutes les machines.

## Développement

```bash
source ./venv/bin/activate
python app.py
```

L'application écoute le port 8000. Le débogueur Flask reste éteint.

```bash
./venv/bin/python tests/test_flows.py
sh clean.sh
```

`clean.sh` vide `matiere/` et `uploads/` en dehors des `.gitkeep`.

## Documentation

Le dossier `documentation/` se lit dans le navigateur, sans lancer le site et sans l'appeler.

Ouvrir `documentation/index.html`. Le menu sépare la présentation, Python, JavaScript, HTML et CSS. Chaque fiche liste les variables et les actions dans l'ordre. La recherche parcourt ces textes.

## Structure

- `app.py` : application, cookies, en-têtes, envoi et téléchargement.
- `auth/` : connexion, déconnexion, mot de passe.
- `users/` : espace élève et audit de ses fiches.
- `moderator/`, `admin/`, `owner/` : modération, comptes, audit du site.
- `fiches/` : étoiles et commentaires.
- `info/` : matières, classes, spécialités, liste et recherche.
- `database/model.py` : comptes, sessions, étoiles, commentaires.
- `utils/` : chemins, fichiers, droits, recherche, audits.
- `templates/`, `static/` : pages, style, scripts.
- `matiere/`, `uploads/` : fiches.
- `init_users.py`, `make_structure.py`, `init-server.sh`, `clean.sh`.
