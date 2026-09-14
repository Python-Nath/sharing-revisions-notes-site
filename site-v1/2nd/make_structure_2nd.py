"""Crée l'arborescence de dossiers du site de fiches de révision.

Usage :
    python creer_arborescence.py
    python creer_arborescence.py --sec

Le script crée tous les dossiers directement dans le dossier courant.
"""

from __future__ import annotations

import argparse
from pathlib import Path


# Ajoutez ici une matière ou un chapitre pour l'inclure automatiquement.
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


def construire_chemins(destination: Path) -> list[Path]:
    """Retourne tous les dossiers à créer, sans modifier le disque."""
    dossiers = [
        destination / "matiere",
    ]

    for matiere, niveaux in STRUCTURE.items():
        for niveau, chapitres in niveaux.items():
            dossier_niveau = destination / "matiere" / matiere / niveau
            dossiers.append(dossier_niveau)

            for chapitre in chapitres:
                dossiers.append(dossier_niveau / chapitre / "fiches")

    return dossiers


def creer_arborescence(destination: Path, afficher_seulement: bool = False) -> None:
    """Crée les dossiers ou affiche la structure sans la créer."""
    dossiers = construire_chemins(destination)

    for dossier in dossiers:
        if afficher_seulement:
            print(f"[simulation] {dossier}")
        else:
            dossier.mkdir(parents=True, exist_ok=True)
            print(f"[créé ou déjà présent] {dossier}")


def lire_arguments() -> argparse.Namespace:
    """Lit les options de la ligne de commande."""
    parseur = argparse.ArgumentParser(
        description=(
            "Crée la hiérarchie du projet de fiches de révision "
            "dans le dossier courant."
        )
    )
    parseur.add_argument(
        "--sec",
        action="store_true",
        help="Affiche les dossiers sans les créer.",
    )
    return parseur.parse_args()


def main() -> None:
    """Point d'entrée du script."""
    arguments = lire_arguments()

    # Le dossier courant est utilisé comme racine.
    destination = Path.cwd()

    creer_arborescence(destination, arguments.sec)


if __name__ == "__main__":
    main()
    print("Don't forget to add the .gitkeep in all the empty folders")
    print("With the cmd Linux : find . -type d -empty -not -path './.git/*' -exec touch {}/.gitkeep \;")

