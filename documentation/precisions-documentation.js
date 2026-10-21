/* Variables et actions du dossier documentation. Chargé après precisions-suite.js. */

preciser("documentation/index.html", "Page de cette documentation", [
  ["#recherche", "Champ de recherche. Il filtre le sommaire, il n'appelle pas le site."],
  ["#filtres", "Pastilles. La violette est CSS du site. La cuivre est ce dossier."],
  ["#menu", "Sommaire : langue, fichier, nom."],
  ["#lecture", "Résumé, variables et actions à gauche. Code à droite, moitié moitié."],
  ["documentation/style.css", "Feuille de ce lecteur. Ce n'est pas static/style.css."],
  ["donnees-documentation.js", "Les fiches de ce dossier."],
  ["precisions-documentation.js", "Leurs variables et leurs actions."],
  ["sources.js", "Extraits de code. Le langage de coloration n'est pas la pastille."],
  ["coloration.js", "Découpe le code et pose les classes tok-."],
  ["menu.js", "Pastilles, recherche et mise en page de la fiche."]
], [
  "Ouvrir le fichier dans le navigateur. Aucun serveur n'est contacté.",
  "menu.js construit les pastilles, dont Dossier documentation, à partir de window.DOCS.",
  "Un clic pose le texte à gauche et le code coloré à droite.",
  "Le code s'affiche en entier, sans barre interne.",
  "Le contenu de #lecture monte. prefers-reduced-motion annule ce mouvement."
]);

preciser("documentation/donnees-guide.js", "ajouter", [
  ["langue", "guide, python, javascript, html, css ou documentation."],
  ["fichier", "Chemin affiché et utilisé dans la clé, avec le nom."],
  ["genre", "Second badge : fonction, page, règle, javascript, css du dossier, page html."],
  ["nom", "Titre de la fiche et seconde moitié de la clé."],
  ["signature", "Ligne sombre sous le titre."],
  ["resume", "Première phrase de la colonne de gauche."],
  ["detail", "Paragraphe qui suit. Les sauts de ligne sont gardés."]
], [
  "Crée l'objet et le pousse dans window.DOCS.",
  "menu.js lui donne ensuite un id langue-index."
]);

preciser("documentation/precisions.js", "preciser", [
  ["fichier", "Même chemin que dans ajouter."],
  ["nom", "Même nom que dans ajouter."],
  ["variables", "Liste de paires [nom, rôle]."],
  ["actions", "Liste de phrases, dans l'ordre."],
  ["clé", "fichier + saut de ligne + nom."]
], [
  "Range l'objet dans window.PRECISIONS.",
  "Un appel plus tard pour la même clé remplace le précédent."
]);

preciser("documentation/precisions-suite.js", "completer", [
  ["existant", "Fiche déjà rangée, ou deux listes vides."],
  ["variables", "Nouvelles paires, placées devant les anciennes."]
], [
  "Lit la clé.",
  "Concatène les variables.",
  "Réécrit la fiche sans toucher aux actions déjà là."
]);

preciser("documentation/sources.js", "source", [
  ["langage", "python, javascript, html ou css. Sert à colorier, pas à choisir la pastille."],
  ["code", "Texte de l'extrait, gardé tel quel."],
  ["clé", "fichier + saut de ligne + nom, la même que preciser."]
], [
  "Range { langage, code, fichier } dans window.SOURCES."
]);

preciser("documentation/menu.js", "normaliser", [
  ["valeur", "Texte quelconque, souvent la recherche."]
], [
  "Passe en minuscules.",
  "Retire les accents.",
  "Renvoie la chaîne comparée ensuite."
]);

preciser("documentation/menu.js", "couleur", [
  ["langue", "Clé de COULEURS."],
  ["retour", "Objet texte, fond, nom. La présentation si la clé manque."]
], [
  "Lit COULEURS.",
  "CSS du site et Dossier documentation sont deux clés distinctes."
]);

preciser("documentation/menu.js", "correspond", [
  ["entree", "Une fiche de window.DOCS."],
  ["aiguille", "Recherche déjà normalisée. Vide : tout passe, sous réserve de la pastille."],
  ["precision", "Variables et actions, pour que la recherche les voie aussi."]
], [
  "Refuse la fiche si la pastille n'est ni Tout ni sa langue.",
  "Cherche l'aiguille dans le sac de textes.",
  "Renvoie vrai ou faux."
]);

preciser("documentation/menu.js", "sourceDe", [
  ["clé", "fichier et nom de la fiche."]
], [
  "Lit window.SOURCES.",
  "Renvoie l'extrait ou null."
]);

preciser("documentation/menu.js", "precisionDe", [
  ["clé", "fichier et nom de la fiche."]
], [
  "Lit window.PRECISIONS.",
  "Sinon renvoie variables et actions vides."
]);

preciser("documentation/menu.js", "titreSection", [
  ["texte", "Variables, ou Actions, dans l'ordre."]
], [
  "Crée un h3.",
  "Pose le texte avec textContent."
]);

preciser("documentation/menu.js", "tableauVariables", [
  ["paires", "Liste [nom, rôle]."],
  ["th", "Le nom, en police à chasse fixe grâce au CSS de ce dossier."],
  ["td", "Le rôle, en texte échappé par textContent."]
], [
  "Crée la table.variables.",
  "Une ligne par paire."
]);

preciser("documentation/menu.js", "listeActions", [
  ["coupure", "Dernier « . » suivi d'un espace."],
  ["expr", "Texte après cette coupure."],
  ["avant", "Texte avant cette coupure."],
  [".rappel-code", "Classe rouge posée seulement si avant se termine par expr."]
], [
  "Pour chaque phrase, cherche une répétition finale.",
  "Sans répétition, la ligne est du texte.",
  "Avec répétition, la seconde expression est un strong.rappel-code."
]);

preciser("documentation/menu.js", "ouvrir", [
  ["teinte", "Couleur de la langue, pour le badge."],
  ["gauche", "Résumé, détail, variables, actions."],
  ["droite", "Code coloré, ou la phrase d'absence."],
  ["src.langage", "Langage passé à colorier. Pas la pastille."]
], [
  "Vide #lecture.",
  "Pose badges, titre, chemin et signature.",
  "Construit les deux colonnes.",
  "Met l'id après # et marque le lien actif."
]);

preciser("documentation/menu.js", "peindreFiltres", [
  ["langueActive", "tout, ou une clé de COULEURS."],
  ["puce", "Bouton. aria-pressed vrai pour la langue active."]
], [
  "Vide #filtres.",
  "Ajoute Tout puis chaque langue, CSS du site et Dossier documentation compris.",
  "Un clic change langueActive et redessine filtres et menu."
]);

preciser("documentation/menu.js", "peindreMenu", [
  ["aiguille", "Recherche normalisée."],
  ["parLangue", "Langue, puis fichier, puis fiches."],
  ["compte", "Nombre de résultats."]
], [
  "Filtre les fiches avec correspond.",
  "Ouvre chaque langue.",
  "Ouvre un fichier s'il y a une recherche, ou si c'est Présentation.",
  "Chaque nom appelle ouvrir."
]);

preciser("documentation/coloration.js", "jeton", [
  ["type", "mot, ctrl, str, com, num, fn, cls, var, balise, attr, prop, sel, ponc, ou vide."],
  ["text", "Morceau exact, espaces compris."]
], [
  "Renvoie l'objet { type, text }."
]);

preciser("documentation/coloration.js", "affiner", [
  ["precedent", "Dernier morceau non vide, pour savoir si on est après class ou def."],
  ["CONTROLE", "Mots peints en mauve."],
  ["LANGAGE", "True, False, None, self, this, et leurs équivalents."]
], [
  "Parcourt les jetons une fois.",
  "Change le type selon le voisin.",
  "Renvoie le même tableau."
]);

preciser("documentation/coloration.js", "tokeniserProgramme", [
  ["mots", "MOTS_PYTHON ou MOTS_JS."],
  ["sortie", "Liste de jetons, ensuite passée à affiner."]
], [
  "Avance caractère par caractère.",
  "Reconnaît commentaire, chaîne, nombre, mot.",
  "Appelle affiner avant de renvoyer."
]);

preciser("documentation/coloration.js", "tokeniserHtml", [
  ["balise", "Texte d'un < jusqu'au > correspondant, quotes comprises."],
  ["nom", "Premier mot de la balise."]
], [
  "Isole les commentaires <!--.",
  "Découpe chaque balise : ponctuation, nom, attributs.",
  "Le texte hors balise reste sans type."
]);

preciser("documentation/coloration.js", "colorierAttributs", [
  ["texte", "Intérieur de la balise, après le nom."],
  ["sortie", "Liste déjà commencée par tokeniserHtml."]
], [
  "Une quote ouvre une chaîne jusqu'à la même quote.",
  "Un nom devient tok-attr."
]);

preciser("documentation/coloration.js", "tokeniserCss", [
  ["dansBloc", "Nombre d'accolades ouvertes. Au-dessus de zéro, on est dans une règle."]
], [
  "Commentaire /* et chaînes d'abord.",
  "Hors bloc, un morceau jusqu'à l'accolade est un sélecteur.",
  "Dans le bloc, un mot suivi de : est une propriété."
]);

preciser("documentation/coloration.js", "tokeniser", [
  ["langage", "html, css, javascript, ou autre pour Python."]
], [
  "Choisit tokeniserHtml, tokeniserCss ou tokeniserProgramme.",
  "Ne regarde pas la pastille du menu."
]);

preciser("documentation/coloration.js", "colorier", [
  ["pre", "Élément pre.code."],
  ["span", "Un par jeton. Classe tok- et type, si le type n'est pas vide."],
  ["textContent", "Le seul moyen d'écrire le code. Pas d'innerHTML."]
], [
  "Découpe avec tokeniser.",
  "Assemble les spans dans un code.",
  "Renvoie le pre, prêt à être ajouté à la colonne de droite."
]);

preciser("documentation/style.css", ":root de la documentation", [
  ["--encre", "#1c2430. Texte de ce lecteur."],
  ["--papier", "#f3efe6. Fond. Le site utilise #f4efe4, dans une autre feuille."],
  ["--css", "#6b3fa0. Violet réservé à l'idée « CSS du site »."],
  ["--documentation", "#8c3d2f. Cuivre de la pastille Dossier documentation."]
], [
  "Ces variables ne sont pas lues par le site des élèves.",
  "Les pastilles prennent leur couleur dans menu.js, les mêmes codes."
]);

preciser("documentation/style.css", "Page du dossier", [
  ["body", "Fond papier, halo bleu, Segoe."],
  ["h1, h2, h3", "Georgia."]
], ["Le halo du site est vert et défini dans static/style.css."]);

preciser("documentation/style.css", "En-tête et recherche", [
  [".entete", "Collé en haut, z-index 3."],
  ["#recherche", "Largeur 100 % de son formulaire, lui-même plafonné à 28 rem."]
], ["Le focus des champs et des boutons est un contour ambre de 3 pixels."]);

preciser("documentation/style.css", "Pastilles", [
  [".filtres", "Rangée qui peut passer à la ligne."],
  [".puce[aria-pressed=true]", "Texte blanc. Le fond est ajouté en ligne par peindreFiltres."]
], ["La forme est une pilule, fond blanc tant que le script ne colore pas."]);

preciser("documentation/style.css", "Cadre", [
  [".cadre", "Grille : 18 rem pour le sommaire, le reste pour la lecture. Plafond 1680 pixels."],
  [".menu", "Hauteur maximale de l'écran moins 9 rem, défilement propre, collé."],
  [".lecture", "Carte, coins 16 pixels, au moins 70 vh."]
], ["Sur un écran étroit, la grille devient une seule colonne."]);

preciser("documentation/style.css", "Sommaire", [
  [".langue", "Premier niveau. Ouvert par le script."],
  [".fichier", "Second niveau, décalé de 0,4 rem."],
  ["::before", "Triangle fermé ou ouvert."]
], ["Le marqueur natif du summary est caché."]);

preciser("documentation/style.css", "Deux colonnes", [
  [".visavis", "Deux colonnes égales, 1 fr et 1 fr."],
  ["pre.code", "Fond #1e1e1e, pas de max-height, overflow visible, pre-wrap."],
  [".colonne-code", "Pas de position collée : le code prend toute sa hauteur."]
], [
  "Le texte et le code se partagent la fiche.",
  "Une longue ligne passe à la ligne au lieu d'ouvrir une barre horizontale."
]);

preciser("documentation/style.css", "Rappel en rouge", [
  ["color", "#c62828."],
  ["font-weight", "700."]
], ["Uniquement la seconde copie d'une expression répétée dans une action."]);

preciser("documentation/style.css", "Couleurs du code", [
  [".tok-mot", "Bleu #569cd6."],
  [".tok-ctrl", "Mauve #c586c0."],
  [".tok-str", "Orange #ce9178."],
  [".tok-com", "Vert #6a9955."],
  [".tok-fn", "Jaune #dcdcaa."],
  [".tok-cls", "Turquoise #4ec9b0."],
  [".tok-var", "Bleu clair #9cdcfe."],
  [".tok-sel", "Doré #d7ba7d."]
], ["Le fond du bloc est #1e1e1e, le texte par défaut #d4d4d4. Rien de ceci n'est dans static/style.css."]);

preciser("documentation/style.css", "Arrivée d'une fiche", [
  ["doc-monter", "De 8 pixels plus bas et transparent, vers la place normale."],
  ["délai", "0,04 s puis 0,08 s puis 0,12 s pour les blocs 2, 3 et 4."]
], ["Le nom du keyframes est doc-monter pour ne pas le confondre avec monter, dans le CSS du site."]);

preciser("documentation/style.css", "Écran étroit de la documentation", [
  ["max-width", "1100 pixels. Le site utilise 700."],
  [".visavis", "Une seule colonne."],
  ["pre.code", "Toujours sans hauteur maximale."]
], ["L'en-tête n'est plus collé. Le sommaire non plus."]);

preciser("documentation/style.css", "Moins de mouvement ici", [
  ["prefers-reduced-motion", "Réglage du système."],
  ["animation-duration", "0,01 ms."],
  ["transition-duration", "0,01 ms."]
], ["Cette media query ne modifie pas static/style.css. Le site a la sienne."]);
