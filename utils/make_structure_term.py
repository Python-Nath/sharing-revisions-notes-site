"""Crée l'arborescence de dossiers du site de fiches de révision.

Usage :
    python creer_arborescence.py

Le script crée tous les dossiers directement dans le dossier courant.
"""

import os


# Ajoutez ici une matière ou un chapitre pour l'inclure automatiquement.
STRUCTURE = {
    "Francais": {
        "specialite": [],
        "pas-specialite": [],
    },
    "Philosophie": {
        "pas-specialite": [],
    },
    "Histoire": {
        "specialite": [],
        "pas-specialite": [],
    },
    "EMC": {
        "pas-specialite": [],
    },
    "Anglais": {
        "specialite": [],
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
        "specialite": [],
        "pas-specialite": [],
    },
    "Physique-Chimie": {
        "specialite": [],
        "pas-specialite": [],
    },
    "SVT": {
        "specialite": [],
        "pas-specialite": [],
    },
    "NSI": {
        "specialite": [],
    },
    "SES": {
        "specialite": [],
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
        "specialite": [],
        "option": [],
    },
    "DNL Histoire": {
        "option": [],
    },
    "DNL Mathematiques": {
        "option": [],
    },
    "DNL SVT": {
        "option": [],
    },
    "DNL SES": {
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
