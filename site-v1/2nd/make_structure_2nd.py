"""Crée l'arborescence de dossiers du site de fiches de révision.

Usage :
    python creer_arborescence.py

Le script crée tous les dossiers directement dans le dossier courant.
"""

import os

STRUCTURE = {
    "Francais": {
        "pas-specialite": [],
    },
    "Histoire": {
        "pas-specialite": [],
    },
    "EMC": {
        "pas-specialite": [],
    },
    "Anglais": {
        "pas-specialite": [],
    },
    "Espagnol": {
        "euro": [],
        "LV2": [],
        "LV3": [],
    },
    "Allemand": {
        "euro": [],
        "LV2": [],
    },
    "Italien": {
        "LV2": [],
        "LV3": [],
    },
    "EPS": {
        "pas-specialite": [],
    },
    "Mathematiques": {
        "pas-specialite": [],
    },
    "Physique-Chimie": {
        "pas-specialite": [],
    },
    "SVT": {
        "pas-specialite": [],
    },
    "SNT": {
        "pas-specialite": [],
    },
    "SES": {
        "pas-specialite": [],
    },
    "Arts": {
        "option": [],
    },
    "Grec": {
        "option": [],
    },
    "Latin": {
        "option": [],
    },
    "Musique": {
        "option": [],
    },
    "DNL Histoire": {
        "option": [],
    }
}


def make_structure(structure):
    """Crée l'arborescence à partir du dictionnaire STRUCTURE."""

    for matiere, specialites in structure.items():
        for specialite, dossiers in specialites.items():
            chemin = os.path.join("matiere", matiere, specialite)

            # Crée le dossier et tous ses parents
            os.makedirs(chemin, exist_ok=True)

            # Crée les éventuels sous-dossiers
            for dossier in dossiers:
                os.makedirs(
                    os.path.join(chemin, dossier),
                    exist_ok=True
                )

def main():
    make_structure(STRUCTURE)

if __name__ == "__main__":
    main()
