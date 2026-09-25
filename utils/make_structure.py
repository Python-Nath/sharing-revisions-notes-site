"""Crée l'arborescence des matières pour toutes les classes.

Le script crée les dossiers dans le dossier courant, sous la forme :
    matiere/<Matiere>/<classe>/<specialite>
"""

import os


STRUCTURE = {
    "1ere": {
        "Francais": ["specialite", "pas-specialite"],
        "Histoire": ["specialite", "pas-specialite"],
        "EMC": ["pas-specialite"],
        "Anglais": ["specialite", "pas-specialite"],
        "Espagnol": ["euro", "LV2", "LV3"],
        "Allemand": ["euro", "LV2"],
        "Italien": ["LV2", "LV3"],
        "EPS": ["pas-specialite"],
        "Mathematiques": ["specialite", "pas-specialite"],
        "Physique-Chimie": ["specialite", "pas-specialite"],
        "SVT": ["specialite", "pas-specialite"],
        "NSI": ["specialite"],
        "SES": ["specialite", "pas-specialite"],
        "Arts": ["option"],
        "Grec": ["option"],
        "Latin": ["option"],
        "Musique": ["specialite", "option"],
        "DNL-Histoire": ["option"],
        "DNL-Mathematiques": ["option"],
        "DNL-SVT": ["option"],
        "DNL-SES": ["option"],
    },
    "2nd": {
        "Francais": ["pas-specialite"],
        "Histoire": ["pas-specialite"],
        "EMC": ["pas-specialite"],
        "Anglais": ["pas-specialite"],
        "Espagnol": ["euro", "LV2", "LV3"],
        "Allemand": ["euro", "LV2"],
        "Italien": ["LV2", "LV3"],
        "EPS": ["pas-specialite"],
        "Mathematiques": ["pas-specialite"],
        "Physique-Chimie": ["pas-specialite"],
        "SVT": ["pas-specialite"],
        "SNT": ["pas-specialite"],
        "SES": ["pas-specialite"],
        "Arts": ["option"],
        "Grec": ["option"],
        "Latin": ["option"],
        "Musique": ["option"],
        "DNL-Histoire": ["option"],
    },
    "term": {
        "Francais": ["specialite", "pas-specialite"],
        "Philosophie": ["pas-specialite"],
        "Histoire": ["specialite", "pas-specialite"],
        "EMC": ["pas-specialite"],
        "Anglais": ["specialite", "pas-specialite"],
        "Espagnol": ["euro", "LV2", "LV3"],
        "Allemand": ["euro", "LV2"],
        "Italien": ["LV2", "LV3"],
        "EPS": ["pas-specialite"],
        "Mathematiques": ["specialite", "pas-specialite"],
        "Physique-Chimie": ["specialite", "pas-specialite"],
        "SVT": ["specialite", "pas-specialite"],
        "NSI": ["specialite"],
        "SES": ["specialite", "pas-specialite"],
        "Arts": ["option"],
        "Grec": ["option"],
        "Latin": ["option"],
        "Musique": ["specialite", "option"],
        "DNL-Histoire": ["option"],
        "DNL-Mathematiques": ["option"],
        "DNL-SVT": ["option"],
        "DNL-SES": ["option"],
    },
}


def make_structure(structure):
    """Crée l'arborescence à partir de la structure par classe."""

    for classe, matieres in structure.items():
        for matiere, specialites in matieres.items():
            for specialite in specialites:
                chemin = os.path.join("matiere", matiere, classe, specialite)
                os.makedirs(chemin, exist_ok=True)


def main():
    make_structure(STRUCTURE)


if __name__ == "__main__":
    main()