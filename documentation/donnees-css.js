/* Règles CSS du site des élèves, fichier static/style.css.
   Le CSS de ce dossier est dans documentation/style.css et porte la pastille
   « Dossier documentation », pas « CSS du site ». */

ajouter("css", "static/style.css", "variables", ":root", ":root",
  "Les couleurs du thème papier et encre.",
  "Encre #1c2430 pour le texte. Encre douce #4d5968 pour les notes. Papier #f4efe4 pour le fond. Carte #fffdf8 pour les panneaux. Ligne #e4d9c6 pour les bords. Forêt #1d6b4f et forêt foncée #14543d pour les liens et les boutons. Danger #8d2f2f. Focus #b86b12 pour le contour du clavier. Ombre légère sous les cartes.");

ajouter("css", "static/style.css", "règle", "body", "body",
  "Page minimale, fond papier, halo vert en haut à gauche.",
  "La police de texte est Segoe UI ou Helvetica. Les titres utilisent Georgia. La hauteur de ligne est 1,5 pour rester lisible.");

ajouter("css", "static/style.css", "règle", ".passer", ".passer",
  "Lien d'évitement, caché tant qu'on ne le focalise pas.",
  "Au clavier, il apparaît en haut et permet de sauter le menu. Fond encre, texte blanc.");

ajouter("css", "static/style.css", "règle", ".barre", ".barre",
  "Bandeau collé en haut de page.",
  "Fond carte presque opaque, bord bas couleur ligne, contenu réparti entre la marque et le menu.");

ajouter("css", "static/style.css", "règle", ".marque", ".marque",
  "Le mot Fiches, à gauche.",
  "Grande taille, police des titres, sans soulignement.");

ajouter("css", "static/style.css", "règle", ".menu", ".menu",
  "Liens Accueil, espace et connexion.",
  "Ils se mettent à la ligne si l'écran est étroit. Le survol souligne.");

ajouter("css", "static/style.css", "règle", "main", "main",
  "Colonne centrale, au plus 980 pixels.",
  "Marges automatiques, padding vertical. Le texte ne s'étire pas sur un très grand écran.");

ajouter("css", "static/style.css", "règle", ".salut", ".salut",
  "La ligne Bonjour prénom nom.",
  "Couleur forêt foncée, un peu plus grasse que le texte courant.");

ajouter("css", "static/style.css", "règle", ".panneau", ".panneau",
  "Bloc blanc cassé : cours, fiches, formulaire, audit.",
  "Bord ligne, coins arrondis 16 pixels, ombre douce.");

ajouter("css", "static/style.css", "règle", ".etroit", ".etroit",
  "Colonne plus mince, pour la connexion.",
  "Au plus 34 rem, centrée.");

ajouter("css", "static/style.css", "règle", ".selecteur et .champ", ".selecteur, .champ",
  "Étiquette au-dessus du champ.",
  "Grille d'un seul colonne, petit espace entre le nom du champ et la saisie.");

ajouter("css", "static/style.css", "règle", "champs de saisie", "input, select, textarea",
  "Tous les champs ont la même forme.",
  "Largeur 100 %, fond blanc, bord beige, coins 10 pixels. Le focus dessine un contour ambre de 3 pixels, aussi sur les boutons et les liens. Le bord passe au vert et une ombre légère apparaît, en transition.");

ajouter("css", "static/style.css", "règle", ".bouton", ".bouton",
  "Bouton principal, vert forêt, texte blanc, forme de pilule.",
  "Le survol passe au vert foncé et soulève le bouton d'un pixel. L'appui le rapproche. Un bouton désactivé est pâle, ne bouge pas, et le curseur montre l'attente.");

ajouter("css", "static/style.css", "règle", ".bouton-secondaire", ".bouton-secondaire",
  "Bouton discret : fond transparent, texte et bord verts.",
  "Pour Actualiser, Modifier, ou une action qui n'est pas la principale.");

ajouter("css", "static/style.css", "règle", ".bouton-danger", ".bouton-danger",
  "Action irréversible : texte et bord rouge danger #8d2f2f.",
  "Supprimer une fiche, suspendre un compte, retirer un commentaire, suspendre le site.");

ajouter("css", "static/style.css", "règle", ".actions", ".actions, .ligne-actions",
  "Rangée de boutons qui peut passer à la ligne.",
  "Espace de 0,6 rem entre eux.");

ajouter("css", "static/style.css", "règle", ".fiche", ".fiche",
  "Carte d'une fiche.",
  "Fond blanc, bord ligne, coins 12 pixels. Le titre est serré contre le haut. La carte monte en apparaissant, et se soulève encore un peu au survol.");

ajouter("css", "static/style.css", "règle", ".etoile", ".etoile[aria-pressed=true]",
  "Étoile déjà posée par le compte.",
  "Fond doré #f4e4b3, texte brun #6a4b00, bord #c4a15a. Au moment où elle est posée, elle grossit puis revient. L'étoile non posée garde le style secondaire et grandit un peu au survol.");

ajouter("css", "static/style.css", "règle", ".recherche", ".recherche",
  "Grille du formulaire de recherche.",
  "Colonnes qui s'adaptent, au moins 12 rem. Les champs n'ont plus la grande marge verticale des formulaires longs. Le bouton reste à gauche.");

ajouter("css", "static/style.css", "règle", ".commentaires", ".commentaires, .commentaire",
  "Zone sous la carte, puis chaque message.",
  "Un filet couleur ligne sépare les messages. Le formulaire est une grille : zone de texte, choix du public, note, bouton.");

ajouter("css", "static/style.css", "règle", ".meta, .note, .fichier, .pied", ".meta, .note, .fichier, .pied",
  "Textes secondaires, couleur encre douce.",
  "Auteur et cours, conseils, nom du fichier, pied de page.");

ajouter("css", "static/style.css", "règle", ".statut", ".statut",
  "Message de résultat, toujours assez haut pour ne pas faire sauter la page.",
  ".statut.ok est vert forêt. .statut.erreur est rouge danger.");

ajouter("css", "static/style.css", "règle", ".grille-stats", ".grille-stats",
  "Grille des chiffres d'audit.",
  "Cases d'au moins 11,5 rem, qui se replient sur un petit écran.");

ajouter("css", "static/style.css", "règle", ".stat", ".stat",
  "Une case de chiffre.",
  "Le nombre est en gros. Le libellé et le détail sont en encre douce.");

ajouter("css", "static/style.css", "règle", ".banniere", ".banniere",
  "Avertissement, par exemple site suspendu.",
  "Bord et fond tirés du rouge danger, texte encre.");

ajouter("css", "static/style.css", "règle", ".badge", ".badge",
  "Pastille verte « En ligne ».",
  "Fond #e5f4ec, texte forêt foncée, forme de pilule.");

ajouter("css", "static/style.css", "règle", ".vide", ".vide",
  "Phrase quand une liste est vide.",
  "Couleur encre douce, pour ne pas crier.");

ajouter("css", "static/style.css", "règle", ".table-scroll et .comptes", "table.comptes",
  "Tableau des comptes ou de l'audit, défilable en largeur.",
  "Bordures horizontales couleur ligne. Le texte des cellules reste en haut. La liste des rôles a une largeur minimale pour ne pas s'écraser.");

ajouter("css", "static/style.css", "règle", ".pied", ".pied",
  "Pied de page, avec de la place pour le bandeau cookies.",
  "Texte centré. Le padding du bas laisse le bandeau recouvrir sans cacher la dernière ligne.");

ajouter("css", "static/style.css", "règle", ".menu-legal", ".menu-legal",
  "Liens mentions, confidentialité, cookies et licences.",
  "Rangée centrée, qui passe à la ligne si l'écran est étroit.");

ajouter("css", "static/style.css", "règle", ".menu-liste", ".menu-liste",
  "Menu déroulant cliquable.",
  "Le résumé est une pilule. Le panneau s'ouvre en descendant légèrement. Un clic sur un lien ou un bouton le referme : il faut recliquer le résumé. Les entrées sont empilées, fond transparent, surlignées au survol.");

ajouter("css", "static/style.css", "règle", ".barre-fiche", ".barre-fiche",
  "Étoile et menu Actions sur une carte.",
  "Les deux restent côte à côte et passent à la ligne si besoin.");

ajouter("css", "static/style.css", "règle", ".onglets", ".onglets",
  "Onglets de l'audit du propriétaire.",
  "Le bouton choisi a un trait forêt en dessous. La couleur et le trait changent en transition. Le panneau affiché monte de quelques pixels.");

ajouter("css", "static/style.css", "règle", ".piste", ".piste",
  "Barre de graphique.",
  "Le fond est un rail. Le remplissage part de largeur nulle et va jusqu'à --largeur en 0,8 s.");

ajouter("css", "static/style.css", "règle", ".anneau", ".anneau",
  "Anneau des rôles.",
  "Neuf rem de côté. Chaque segment part de zéro et trace sa part --part. La légende aligne une pastille colorée et le libellé.");

ajouter("css", "static/style.css", "règle", ".banniere-cookies", ".banniere-cookies",
  "Bandeau fixé en bas de l'écran.",
  "Carte, bord et ombre du thème. Quand il apparaît, il glisse vers le haut. Le texte prend la place restante, le lien et le bouton restent à côté, ou en dessous si l'écran est étroit.");

ajouter("css", "static/style.css", "règle", "[hidden]", "[hidden]",
  "Un élément hidden ne s'affiche pas, même si une autre règle voudrait le montrer.",
  "Sert aux formulaires d'envoi et aux panneaux de commentaires fermés.");

ajouter("css", "static/style.css", "règle", "mouvements", "@keyframes monter",
  "Entrées des panneaux, cartes, commentaires, statistiques et lignes de graphique.",
  "monter soulève de 12 pixels en faisant apparaître. surgir fait de même, plus court, pour un onglet. deployer ouvre un menu depuis le haut. glisser fait monter le bandeau cookies. fondu ne déplace rien. eclat grossit l'étoile à 1,12 puis la ramène. Les huit premières cartes et les six premières lignes de tableau sont légèrement décalées, pour ne pas arriver toutes en même temps. La durée de base est --duree, 0,28 s, avec la courbe --courbe.");

ajouter("css", "static/style.css", "règle", "mouvement réduit", "@media (prefers-reduced-motion: reduce)",
  "Coupe les animations si le système le demande.",
  "Durées d'animation et de transition ramenées à 0,01 ms. Le défilement doux est aussi retiré. Les graphiques restent lisibles, ils n'ont plus le temps de s'animer.");

ajouter("css", "static/style.css", "règle", "petit écran", "@media (max-width: 700px)",
  "Le bandeau passe en colonne.",
  "La marque au-dessus du menu. La colonne de contenu se rapproche des bords.");
