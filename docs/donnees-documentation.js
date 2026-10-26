/* Ce dossier seulement. La pastille est cuivre, « Dossier documentation ».
   Elle n'est pas la pastille violette « CSS du site », qui décrit static/style.css.
   Le genre de chaque fiche dit si c'est du HTML, du JavaScript ou le CSS de ce dossier. */

ajouter("documentation", "documentation/index.html", "page html", "Page de cette documentation", "documentation/index.html",
  "Le fichier ouvert dans le navigateur. Il ne passe pas par Flask.",
  "En-tête, recherche, pastilles, sommaire et zone de lecture. Les scripts sont des fichiers du même dossier : donnees-*.js, precisions.js, precisions-suite.js, precisions-documentation.js, sources.js, coloration.js, menu.js. Aucun n'appelle l'application. Le style est documentation/style.css, pas static/style.css.");

ajouter("documentation", "documentation/donnees-guide.js", "javascript", "ajouter", "ajouter(langue, fichier, genre, nom, signature, résumé, détail)",
  "Ajoute une fiche au menu.",
  "Pousse un objet dans window.DOCS. La langue décide de la pastille et de la couleur. Le genre est le second badge. Cette fonction est définie ici, puis réutilisée par les autres fichiers donnees-*.js, qui ne font qu'appeler ajouter.");

ajouter("documentation", "documentation/precisions.js", "javascript", "preciser", "preciser(fichier, nom, variables, actions)",
  "Pose le tableau Variables et la liste Actions d'une fiche.",
  "La clé est le fichier, un saut de ligne, puis le nom. Un second appel pour la même clé remplace le premier. precisions.js couvre les fonctions du site. precisions-suite.js et precisions-documentation.js complètent ou remplacent.");

ajouter("documentation", "documentation/precisions-suite.js", "javascript", "completer", "completer(fichier, nom, variables)",
  "Ajoute des variables devant celles déjà écrites.",
  "Ne remplace pas les actions. Sert quand une fonction n'avait pas de variable locale à décrire, ou pour une précision ajoutée après coup.");

ajouter("documentation", "documentation/sources.js", "javascript", "source", "source(fichier, nom, langage, code)",
  "Range l'extrait affiché à droite de la fiche.",
  "La clé est la même que preciser : fichier, saut de ligne, nom. Le langage sert à la coloration : python, javascript, html ou css. Il est indépendant de la pastille. Une fiche du dossier documentation peut donc être colorée en CSS sans rejoindre la pastille CSS du site. Le reste de ce fichier est la table des extraits, pas une fonction de plus.");

ajouter("documentation", "documentation/menu.js", "javascript", "normaliser", "normaliser(valeur)  — dans menu.js",
  "Prépare un texte pour la recherche.",
  "Minuscules, accents retirés. Ainsi « Étoile » retrouve « etoile ».");

ajouter("documentation", "documentation/menu.js", "javascript", "couleur", "couleur(langue)  — dans menu.js",
  "Donne le nom et la couleur d'une pastille.",
  "Présentation, Python, JavaScript, HTML, CSS du site, Dossier documentation. Une langue inconnue retombe sur la présentation.");

ajouter("documentation", "documentation/menu.js", "javascript", "correspond", "correspond(entrée, aiguille)  — dans menu.js",
  "Dit si une fiche reste visible.",
  "La pastille enfoncée doit être Tout ou la langue de la fiche. L'aiguille est cherchée dans le nom, le fichier, le résumé, le détail, les variables et les actions.");

ajouter("documentation", "documentation/menu.js", "javascript", "sourceDe", "sourceDe(entrée)  — dans menu.js",
  "Retrouve l'extrait de code.",
  "Lit window.SOURCES avec la clé fichier et nom. Null si cette fiche n'a pas d'extrait.");

ajouter("documentation", "documentation/menu.js", "javascript", "precisionDe", "precisionDe(entrée)  — dans menu.js",
  "Retrouve variables et actions.",
  "Lit window.PRECISIONS. Si rien n'est rangé, renvoie deux listes vides pour que la fiche affiche quand même le résumé.");

ajouter("documentation", "documentation/menu.js", "javascript", "titreSection", "titreSection(texte)  — dans menu.js",
  "Titre Variables ou Actions.",
  "Un h3, texte posé avec textContent.");

ajouter("documentation", "documentation/menu.js", "javascript", "tableauVariables", "tableauVariables(paires)  — dans menu.js",
  "Tableau nom et rôle.",
  "Chaque paire est une ligne. Le nom est un th, le rôle un td. Pas de HTML interprété.");

ajouter("documentation", "documentation/menu.js", "javascript", "listeActions", "listeActions(actions)  — dans menu.js",
  "Liste numérotée des actions.",
  "Si le texte se termine par « . expression » et que cette expression répète la fin de la phrase, la seconde copie est mise en rouge gras. Sinon la ligne reste du texte simple.");

ajouter("documentation", "documentation/menu.js", "javascript", "ouvrir", "ouvrir(entrée)  — dans menu.js",
  "Affiche une fiche, moitié texte et moitié code.",
  "Badges de langue et de genre, titre, chemin, signature, résumé, détail, variables, actions, puis le code coloré. L'adresse après # mémorise la fiche. Le code n'est pas limité en hauteur.");

ajouter("documentation", "documentation/menu.js", "javascript", "peindreFiltres", "peindreFiltres()  — dans menu.js",
  "Dessine les pastilles.",
  "Tout, puis une pastille par langue. La pastille enfoncée a un fond de sa couleur et un texte blanc. Un clic change la langue et redessine le menu.");

ajouter("documentation", "documentation/menu.js", "javascript", "peindreMenu", "peindreMenu()  — dans menu.js",
  "Dessine le sommaire.",
  "Compte les résultats. Groupe par langue, puis par fichier, puis par nom. La barre gauche du nom a la couleur de la langue. Seule la Présentation est ouverte au départ, ou le fichier qui correspond à la recherche.");

ajouter("documentation", "documentation/coloration.js", "javascript", "jeton", "jeton(type, texte)",
  "Un morceau de code et son type.",
  "Le type devient la classe tok- du span. Un type vide reste du texte sans couleur.");

ajouter("documentation", "documentation/coloration.js", "javascript", "affiner", "affiner(jetons)",
  "Précise les noms après le premier découpage.",
  "Les mots de contrôle passent en tok-ctrl. True, False, None, self et this passent en tok-lang. Le nom après class est une classe, après def ou function une fonction. Un nom suivi d'une parenthèse est un appel. Les autres noms sont des variables.");

ajouter("documentation", "documentation/coloration.js", "javascript", "tokeniserProgramme", "tokeniserProgramme(source, mots)",
  "Découpe Python ou JavaScript.",
  "Commentaires, chaînes, nombres et mots du langage. Le paramètre mots est MOTS_PYTHON ou MOTS_JS. Le dièse ne commente que le Python. Les commentaires // et /* ne commentent que le JavaScript.");

ajouter("documentation", "documentation/coloration.js", "javascript", "tokeniserHtml", "tokeniserHtml(source)",
  "Découpe du HTML, y compris les balises Jinja.",
  "Commentaires HTML, nom de balise, puis les attributs. Le texte entre les balises n'est pas coloré comme du code.");

ajouter("documentation", "documentation/coloration.js", "javascript", "colorierAttributs", "colorierAttributs(texte, sortie)",
  "Colorie les attributs d'une balise déjà isolée.",
  "Un nom d'attribut est tok-attr. Une valeur entre quotes est tok-str.");

ajouter("documentation", "documentation/coloration.js", "javascript", "tokeniserCss", "tokeniserCss(source)",
  "Découpe du CSS.",
  "Hors des accolades, le texte est un sélecteur. Dedans, un nom suivi de deux-points est une propriété. Les commentaires /* */ et les chaînes sont reconnus.");

ajouter("documentation", "documentation/coloration.js", "javascript", "tokeniser", "tokeniser(source, langage)",
  "Choisit le découpage selon le langage de l'extrait.",
  "html, css, javascript, sinon Python. Ce langage vient de source(), pas de la pastille du menu.");

ajouter("documentation", "documentation/coloration.js", "javascript", "colorier", "colorier(source, langage)",
  "Construit le bloc de code coloré.",
  "Un pre.code contient un code, et chaque morceau est un span. Le texte est posé avec textContent. Les couleurs sont celles de documentation/style.css, classes tok-*, thème sombre. Aucun script extérieur.");

ajouter("documentation", "documentation/style.css", "css du dossier", ":root de la documentation", ":root",
  "Couleurs de ce lecteur, pas celles du site.",
  "Encre, papier et carte ressemblent au site, mais les variables --python, --javascript, --html et --css servent à la légende de ce dossier. --documentation, cuivre #8c3d2f, est la pastille de ces fiches. Le site des élèves n'a pas ces variables : les siennes sont dans static/style.css, pastille violette.");

ajouter("documentation", "documentation/style.css", "css du dossier", "Page du dossier", "body",
  "Fond papier de la documentation.",
  "Halo bleu en haut à gauche, police Segoe, titres Georgia. Ce n'est pas le halo vert du site.");

ajouter("documentation", "documentation/style.css", "css du dossier", "En-tête et recherche", ".entete",
  "Bandeau collé et champ Rechercher.",
  "Le bandeau reste en haut. Le champ est limité à 28 rem. Le focus dessine un contour ambre.");

ajouter("documentation", "documentation/style.css", "css du dossier", "Pastilles", ".puce",
  "Boutons de langue.",
  "Forme de pilule. La pastille enfoncée a un texte blanc. La couleur de fond est posée par menu.js, pas par cette règle.");

ajouter("documentation", "documentation/style.css", "css du dossier", "Cadre", ".cadre",
  "Sommaire à gauche, lecture à droite.",
  "Largeur maximale 1680 pixels. Le sommaire défile seul et reste collé. La lecture a une hauteur minimale de 70 vh.");

ajouter("documentation", "documentation/style.css", "css du dossier", "Sommaire", ".langue, .fichier",
  "Deux niveaux repliables.",
  "La langue, puis le fichier. Le triangle passe de fermé à ouvert. Les noms de fiches ont une barre gauche colorée par le script.");

ajouter("documentation", "documentation/style.css", "css du dossier", "Deux colonnes", ".visavis",
  "Explication et code, chacun sur la moitié.",
  "La colonne de code n'a pas de hauteur maximale. pre.code a le fond #1e1e1e, la police Consolas, 15 pixels, et les longues lignes passent à la ligne. Ce n'est pas une zone du site.");

ajouter("documentation", "documentation/style.css", "css du dossier", "Rappel en rouge", ".rappel-code",
  "Seconde copie d'une expression, dans les actions.",
  "Rouge #c62828, gras. listeActions pose cette classe seulement quand l'expression est répétée.");

ajouter("documentation", "documentation/style.css", "css du dossier", "Couleurs du code", ".tok-mot",
  "Thème sombre, proche de VS Code Dark+.",
  "Mots bleus, contrôle mauve, chaînes orange, commentaires verts, nombres vert d'eau, fonctions jaunes, classes turquoise, variables bleu clair, sélecteurs dorés, ponctuation grise. Ces classes n'existent pas dans static/style.css.");

ajouter("documentation", "documentation/style.css", "css du dossier", "Arrivée d'une fiche", "@keyframes doc-monter",
  "Le texte d'une fiche monte en apparaissant.",
  "Les quatre premiers blocs de #lecture sont un peu décalés. Ce mouvement est celui de la documentation, pas celui des cartes du site, qui s'appelle monter dans static/style.css.");

ajouter("documentation", "documentation/style.css", "css du dossier", "Écran étroit de la documentation", "@media (max-width: 1100px)",
  "Le sommaire passe au-dessus du texte.",
  "Une seule colonne. Le code reste entier, sans hauteur maximale. Le seuil du site est 700 pixels, pas 1100.");

ajouter("documentation", "documentation/style.css", "css du dossier", "Moins de mouvement ici", "@media (prefers-reduced-motion: reduce)",
  "Coupe l'animation de ce dossier.",
  "Même idée que sur le site, mais cette règle est dans documentation/style.css. Elle ne change pas les cartes des élèves.");
