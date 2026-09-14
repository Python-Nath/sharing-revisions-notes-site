# Site de partage de fiches de revision - Plan v2

## 1. Presentation

Le projet consiste a creer un site de partage de fiches de revision. Les utilisateurs pourront consulter, ajouter, telecharger et noter des fiches classees par matiere, niveau et chapitre.

Cette version integre l'organisation des dossiers generee par les trois scripts Python :

- `make_structure_2nd.py` pour la classe de seconde ;
- `make_structure_1ere.py` pour la classe de premiere ;
- `make_structure_term.py` pour la classe de terminale.

Le fichier `PLANv1.md` est conserve comme historique du projet.

## 2. Objectifs de la version 2

- Organiser les fiches par niveau scolaire.
- Regrouper les documents dans un dossier `matiere`.
- Creer automatiquement les dossiers des matieres et des options.
- Ajouter ensuite les chapitres et les fiches dans chaque matiere.
- Faciliter l'ajout de nouvelles matieres sans modifier le fonctionnement du script.
- Preparer l'organisation necessaire aux pages du futur site web.

## 3. Arborescence generale

Les scripts creent les dossiers dans le dossier courant. La structure generale est la suivante :

```text
projet/
├── make_structure_2nd.py
├── make_structure_1ere.py
├── make_structure_term.py
├── PLANv1.md
├── PLANv2.md
└── matiere/
    ├── Francais/
    │   ├── specialite/
    │   │   └── chapitre/
    │   │       └── fiches/
    │   └── pas-specialite/
    │       └── chapitre/
    │           └── fiches/
    ├── Mathematiques/
    │   ├── specialite/
    │   └── pas-specialite/
    ├── Physique-Chimie/
    ├── SVT/
    ├── NSI/
    ├── Histoire/
    ├── EMC/
    ├── Langues/
    ├── Arts/
    └── Options/
```

Un chapitre contenant des fiches aura cette forme :

```text
matiere/
└── Mathematiques/
    └── specialite/
        └── Probabilites/
            └── fiches/
                ├── fiche-01.pdf
                ├── fiche-02.pdf
                └── fiche-03.jpg
```

Les scripts creent automatiquement les dossiers de matiere et de niveau. Les dossiers de chapitres sont crees lorsqu'ils sont ajoutes dans la liste `STRUCTURE` du script concerne.

## 4. Organisation par niveau

### 4.1 Seconde - `make_structure_2nd.py`

Le script de seconde gere les matieres communes et les options :

```text
matiere/
├── Francais/pas-specialite/
├── Histoire/pas-specialite/
├── EMC/pas-specialite/
├── Anglais/pas-specialite/
├── Espagnol/euro/
├── Espagnol/LV2/
├── Espagnol/LV3/
├── Allemand/euro/
├── Allemand/LV2/
├── Italien/LV2/
├── Italien/LV3/
├── EPS/pas-specialite/
├── Mathematiques/pas-specialite/
├── Physique-Chimie/pas-specialite/
├── SVT/pas-specialite/
├── SNT/pas-specialite/
├── SES/pas-specialite/
├── Arts/option/
├── Grec/option/
├── Latin/option/
├── Musique/option/
└── DNL Histoire/option/
```

### 4.2 Premiere - `make_structure_1ere.py`

Le script de premiere gere les matieres communes, les specialites et les options :

```text
matiere/
├── Francais/specialite/
├── Francais/pas-specialite/
├── Histoire/specialite/
├── Histoire/pas-specialite/
├── EMC/pas-specialite/
├── Anglais/specialite/
├── Anglais/pas-specialite/
├── Espagnol/euro/
├── Espagnol/LV2/
├── Espagnol/LV3/
├── Allemand/euro/
├── Allemand/LV2/
├── Italien/LV2/
├── Italien/LV3/
├── EPS/pas-specialite/
├── Mathematiques/specialite/
├── Mathematiques/pas-specialite/
├── Physique-Chimie/specialite/
├── Physique-Chimie/pas-specialite/
├── SVT/specialite/
├── SVT/pas-specialite/
├── NSI/specialite/
├── SES/specialite/
├── SES/pas-specialite/
├── Arts/option/
├── Grec/option/
├── Latin/option/
├── Musique/specialite/
├── Musique/option/
├── DNL Histoire/option/
├── DNL Mathematiques/option/
├── DNL SVT/option/
└── DNL SES/option/
```

### 4.3 Terminale - `make_structure_term.py`

Le script de terminale gere les matieres communes, les specialites et les options :

```text
matiere/
├── Francais/specialite/
├── Francais/pas-specialite/
├── Philosophie/pas-specialite/
├── Histoire/specialite/
├── Histoire/pas-specialite/
├── EMC/pas-specialite/
├── Anglais/specialite/
├── Anglais/pas-specialite/
├── Espagnol/euro/
├── Espagnol/LV2/
├── Espagnol/LV3/
├── Allemand/euro/
├── Allemand/LV2/
├── Italien/LV2/
├── Italien/LV3/
├── EPS/pas-specialite/
├── Mathematiques/specialite/
├── Mathematiques/pas-specialite/
├── Physique-Chimie/specialite/
├── Physique-Chimie/pas-specialite/
├── SVT/specialite/
├── SVT/pas-specialite/
├── NSI/specialite/
├── SES/specialite/
├── SES/pas-specialite/
├── Arts/option/
├── Grec/option/
├── Latin/option/
├── Musique/specialite/
├── Musique/option/
├── DNL Histoire/option/
├── DNL Mathematiques/option/
├── DNL SVT/option/
└── DNL SES/option/
```

## 5. Fonctionnement des scripts

Chaque script contient une constante `STRUCTURE` qui associe une matiere a ses niveaux. La fonction `construire_chemins()` prepare les chemins, puis `creer_arborescence()` utilise `mkdir()` pour creer les dossiers sans supprimer les dossiers existants.

Commande normale :

```bash
python make_structure_2nd.py
python make_structure_1ere.py
python make_structure_term.py
```

Mode simulation, sans creation de dossier :

```bash
python make_structure_2nd.py --sec
python make_structure_1ere.py --sec
python make_structure_term.py --sec
```

Le nom `--sec` signifie ici simulation et ne correspond pas au niveau seconde.

## 6. Fonctionnalites du site

- Navigation par niveau et par matiere.
- Navigation par specialite, option ou langue.
- Navigation par chapitre.
- Consultation des fiches.
- Importation de fichiers PDF ou image.
- Telechargement des fiches.
- Notation des fiches.
- Ajout de commentaires.
- Creation de nouveaux chapitres par les administrateurs.

## 7. Exemple de donnees d'une fiche

| Champ | Exemple |
| --- | --- |
| `titre` | Arbre de probabilites |
| `auteur` | Jean Dupont |
| `description` | Resume du chapitre sur les probabilites |
| `niveau` | Terminale |
| `matiere` | Mathematiques |
| `categorie` | specialite |
| `chapitre` | Probabilites |
| `fichier` | `fiche-probabilites.pdf` |

Chemin attendu :

```text
matiere/Mathematiques/specialite/Probabilites/fiches/fiche-probabilites.pdf
```

## 8. Routes prevues

```http
GET /
GET /matiere
GET /matiere/{niveau}
GET /matiere/{niveau}/{matiere}
GET /matiere/{niveau}/{matiere}/{categorie}
GET /matiere/{niveau}/{matiere}/{categorie}/{chapitre}
POST /upload
POST /download
POST /note
POST /commentaire
```

## 9. Securite et regles de gestion

- Verifier le type et la taille des fichiers importes.
- Nettoyer les noms de fichiers avant leur enregistrement.
- Refuser les chemins contenant `..` afin d'eviter une sortie du dossier `matiere`.
- Controler les droits d'ecriture et de suppression.
- Authentifier les utilisateurs avant l'importation, la notation ou la moderation.
- Conserver les informations des fiches dans une base de donnees.

## 10. Technologies a definir

- Backend web Python.
- Base de donnees pour les utilisateurs, fiches, notes et commentaires.
- Interface web pour la navigation dans les matieres.
- Systeme d'authentification avec les roles `Admin`, `Utilisateur` et `Invite`.
- Hebergement et mise en ligne, avec `ngrok` pour les tests locaux si necessaire.

## 11. Prochaines etapes

- [x] Creer les trois scripts d'arborescence.
- [x] Organiser les matieres par niveau.
- [x] Prevoir les categories specialite, option et langue.
- [ ] Ajouter les chapitres de chaque matiere.
- [ ] Ajouter une page d'accueil.
- [ ] Ajouter les pages de navigation par niveau et matiere.
- [ ] Ajouter l'importation et le telechargement des fiches.
- [ ] Ajouter la base de donnees.
- [ ] Ajouter l'authentification.
- [ ] Ajouter les notes et les commentaires.
- [ ] Tester l'ensemble sur les trois niveaux.

## 12. Objectif final

Creer une plateforme claire et accessible permettant aux eleves de trouver rapidement des fiches de revision, de partager leurs ressources et de s'entraider, quelle que soit leur classe ou leur matiere.

**Version :** 2.0
**Document precedent :** `PLANv1.md`
