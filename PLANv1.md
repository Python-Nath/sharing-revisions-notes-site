# 📚 Site de partage de fiches de révision

## Présentation

Ce projet consiste à créer un site permettant aux utilisateurs de **consulter, partager, télécharger et noter des fiches de révision** classées par matière et par chapitre.

L'objectif est de faciliter l'accès aux ressources scolaires et de permettre aux élèves de partager leurs propres fiches avec la communauté.

> **Statut :** Ébauche du projet — certaines fonctionnalités restent à développer.

---

## Fonctionnalités prévues

* 📂 Navigation par matière et par chapitre
* 📄 Consultation des fiches disponibles
* ⬆️ Importation de fiches par les utilisateurs
* ⬇️ Téléchargement des fiches
* ⭐ Attribution d'une note aux fiches
* 💬 Ajout de commentaires
* 🛠️ Création de thématiques par les administrateurs et les utilisateurs

---

## Organisation du site

Le site sera organisé selon une structure hiérarchique :

```text
Accueil
└── Matières
    ├── Mathématiques
    │   ├── Spécialité
    │   │   ├── Chapitres
    │   │   │   ├── Probabilités
    │   │   │   │   ├── Fiche 1
    │   │   │   │   ├── Fiche 2
    │   │   │   │   └── ...
    │   │   │   └── Second degré
    │   │   └── ...
    │   └── Pas spécialité
    ├── Français
    ├── NSI
    └── ...
```

---

## Fonctionnement prévu

### 1. Accueil

La route `/` redirige vers la page principale du site.

```http
GET /
REDIRECT /index.html
```

La page d'accueil contient des liens vers les différentes matières :

* Mathématiques
* Français
* NSI
* Etc.

### 2. Choix d'une matière

Exemple pour les mathématiques :

```http
GET /matiere/math.html
```

La page propose notamment :

* Spécialité
* Pas spécialité

### 3. Choix d'un chapitre

Exemple :

```http
GET /matiere/math/spe/chapitre.html
```

La page contient des liens vers différents chapitres, par exemple :

* Second degré
* Probabilités
* Etc.

### 4. Consultation des fiches

Exemple :

```http
GET /matiere/math/spe/proba/fiches.html
```

Cette page affiche les fiches disponibles dans le chapitre **Probabilités** :

* Lesson 1
* Lesson 2
* Etc.

---

## Actions principales

### Création de thématiques

Les administrateurs et les utilisateurs pourront créer de nouvelles thématiques afin d'organiser les fiches.

### Importation d'une fiche

L'utilisateur pourra envoyer une fiche avec les informations suivantes :

```http
POST /upload
```

| Champ    | Exemple                                         |
| -------- | ----------------------------------------------- |
| `titre`  | arbre de proba                                  |
| `auteur` | Jean Dupont                                     |
| `desc`   | Fiche récapitulative création arbre de proba    |
| `chemin` | `/matiere/math/spe/proba/arbre.docs` ou `.jpeg` |

### Téléchargement d'une fiche

```http
POST /download
```

Le téléchargement s'effectue à partir du chemin de la fiche :

```text
/matiere/math/spe/proba/arbre.docs
```

### Notation et commentaires

Les utilisateurs pourront attribuer une note et laisser un commentaire sur une fiche.

```http
POST /note
```

| Champ         | Exemple                              |
| ------------- | ------------------------------------ |
| `chemin`      | `/matiere/math/spe/proba/arbre.docs` |
| `note`        | 1 à 5 étoiles ou autre système       |
| `commentaire` | C’est parfait                        |

---

## Exemple de fiche

**Titre :** Arbre de proba
**Auteur :** Jean Dupont
**Description :** Fiche récapitulative création arbre de proba
**Fichier :** `arbre.docs` ou `arbre.jpeg`

Les utilisateurs pourront consulter la fiche, la télécharger et donner leur avis.

---

## Technologies envisagées

Les technologies utilisées pour le projet restent à définir.

Le site devra notamment gérer :

* Une interface web organisée par matières et chapitres
* Un système d'importation et de téléchargement de fichiers
* Une base de données
* Un système d'authentification

---

## Améliorations prévues pour la version finale

Les éléments suivants devront être ajoutés :

* [ ] Gestion de la base de données
* [ ] Authentification des utilisateurs (`Admin`, `Guest`)
* [ ] Mise en ligne du projet dans le monde entier avec **ngrok**
* [ ] Finalisation du système de notation et de commentaires
* [ ] Amélioration de l'organisation des matières et des chapitres

---

## Objectif final

Créer une plateforme simple et accessible permettant aux élèves de **trouver rapidement des fiches de révision, partager leurs ressources et s'entraider**.

---

## Auteur

Projet réalisé dans le cadre d'un projet scolaire.

**Version :** Ébauche
