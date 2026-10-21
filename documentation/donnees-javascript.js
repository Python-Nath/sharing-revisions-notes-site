/* Fonctions JavaScript. Le navigateur ne contacte pas Flask depuis cette documentation. */

ajouter("javascript", "static/common.js", "fonction", "lireCookie", "lireCookie(nom)",
  "Lit un cookie que le JavaScript a le droit de voir.",
  "Le cookie de session est HttpOnly : ce script ne peut pas le lire. Il lit seulement csrf_access_token, exigé pour publier, supprimer, étoiler ou commenter.");

ajouter("javascript", "static/common.js", "fonction", "api", "api(chemin, options)",
  "Envoie une requête au site et ramène du JSON.",
  "Ajoute le jeton CSRF pour toute méthode autre que GET. Accepte un corps JSON ou un formulaire. En cas de réponse illisible ou de coupure, renvoie un objet d'erreur plutôt que de planter la page.");

ajouter("javascript", "static/common.js", "fonction", "afficherStatut", "afficherStatut(id, message, type)",
  "Écrit un message dans une zone de la page.",
  "type vaut ok ou erreur. Le texte passe par textContent, jamais par du HTML injecté.");

ajouter("javascript", "static/common.js", "fonction", "destinationSure", "destinationSure(rôle, chemin)",
  "Choisit où envoyer la personne après la connexion.",
  "Si le chemin demandé est l'espace d'un autre rôle, elle va vers son propre espace. Un élève n'est jamais envoyé vers /moderator, /admin ou /owner. Le serveur refait le même contrôle.");

ajouter("javascript", "static/common.js", "fonction", "lienEspace", "lienEspace(rôle)",
  "Adresse de l'espace personnel.",
  "Propriétaire vers l'audit du site, admin et modérateur vers leur tableau, élève vers le sien.");

ajouter("javascript", "static/common.js", "fonction", "libelleRole", "libelleRole(rôle)",
  "Nom français du rôle.",
  "Propriétaire, Administrateur, Modérateur, ou Élève.");

ajouter("javascript", "static/common.js", "fonction", "lireJson", "lireJson(id)",
  "Lit un bloc JSON déposé dans la page par le serveur.",
  "Retourne null si la balise manque ou si le JSON est cassé. Sert aux tableaux de bord et aux audits.");

ajouter("javascript", "static/common.js", "fonction", "libelleAudience", "libelleAudience(visibilité)",
  "Traduit le code de visibilité d'un commentaire.",
  "auteur : pour tous les utilisateurs. equipe : pour l'équipe. les_deux : pour les utilisateurs et l'équipe.");

ajouter("javascript", "static/common.js", "fonction", "libelleStatutCommentaire", "libelleStatutCommentaire(commentaire)",
  "Décrit l'état d'un commentaire.",
  "En attente, pris en charge par quelqu'un, ou validé. Le nom affiché est l'identifiant du responsable, pas un numéro interne.");

ajouter("javascript", "static/common.js", "fonction", "messageLocal", "messageLocal(zone, texte, type)",
  "Message d'erreur ou de succès dans un panneau de commentaires.",
  "Chaque fiche a le sien, pour ne pas mélanger les messages de deux cartes.");

ajouter("javascript", "static/common.js", "fonction", "allerConnexion", "allerConnexion()",
  "Envoie vers la page de connexion.",
  "Le retour prévu est la page actuelle. Le serveur revérifie que ce retour reste sur le site.");

ajouter("javascript", "static/common.js", "fonction", "boutonEtoile", "boutonEtoile(fiche)",
  "Bouton qui pose ou retire une étoile.",
  "Le libellé montre le total. Une étoile pleine veut dire que ce compte l'a posée. Sans session, le clic mène à la connexion.");

ajouter("javascript", "static/common.js", "fonction", "libelle", "libelle(nombre, actif)  — dans boutonEtoile",
  "Met à jour le texte et l'état du bouton étoile.",
  "aria-pressed dit aux lecteurs d'écran si l'étoile est posée.");

ajouter("javascript", "static/common.js", "fonction", "dessinerCommentaires", "dessinerCommentaires(fiche, panneau)",
  "Affiche les commentaires visibles et le formulaire.",
  "Le formulaire propose trois publics : tous les utilisateurs, seulement l'équipe, ou les deux. Les boutons Suivre, Valider et Retirer n'apparaissent que si le serveur a dit que ce compte en a le droit.");

ajouter("javascript", "static/common.js", "fonction", "zoneCommentaires", "zoneCommentaires(fiche)",
  "Bouton Commentaires et son panneau, rendus séparément.",
  "Le bouton entre dans le menu Actions de la carte. Le panneau reste sous la carte, caché. La liste est demandée seulement à l'ouverture, puis à chaque réouverture.");

ajouter("javascript", "static/common.js", "fonction", "carteFiche", "carteFiche(fiche, actions)",
  "Construit la carte d'une fiche.",
  "Titre, auteur, cours, description, nom du fichier. L'étoile reste visible. Le menu Actions contient Télécharger, puis Modifier ou Supprimer s'ils sont fournis, puis Commentaires. Tout le texte visible est posé avec textContent.");

ajouter("javascript", "static/common.js", "fonction", "supprimerFiche", "supprimerFiche(adresse)",
  "Demande confirmation puis supprime la fiche.",
  "Si le serveur accepte, la page entière se recharge. Ainsi le lien de téléchargement, y compris dans l'historique, disparaît avec le fichier.");

ajouter("javascript", "static/common.js", "fonction", "monterRechercheFiches", "monterRechercheFiches(formulaire, zone, actions)",
  "Branche la recherche de fiches, qui se met à jour pendant la saisie.",
  "Chaque frappe attend un court instant, puis envoie le texte, l'auteur et le minimum d'étoiles. Un zéro ou un champ vide ne part pas. Sans aucun critère, la zone de résultats se vide. Au-delà de 80 fiches, une note demande d'affiner. Une réponse lente ne remplace pas une recherche plus récente.");

ajouter("javascript", "static/common.js", "fonction", "monterSelecteur", "monterSelecteur(racine, options)",
  "Construit les trois listes matière, classe, spécialité.",
  "Elles parlent à /info/matiere, /info/classe et /info/specialite. Le dernier choix complet est gardé dans sessionStorage pour le retrouver au prochain affichage.");

ajouter("javascript", "static/common.js", "fonction", "creerSelect", "creerSelect(étiquette)  — dans monterSelecteur",
  "Ajoute une liste déroulante avec son étiquette.",
  "L'étiquette et la liste sont liées, pour le clavier et les lecteurs d'écran.");

ajouter("javascript", "static/common.js", "fonction", "vider", "vider(liste, libellé)  — dans monterSelecteur",
  "Remet une liste à son invite.",
  "La première option vide signifie « pas encore choisi ».");

ajouter("javascript", "static/common.js", "fonction", "remplir", "remplir(liste, noms, libellé)  — dans monterSelecteur",
  "Remplit une liste avec les noms renvoyés par le serveur.",
  "Chaque nom devient une option. Rien n'est interprété comme du HTML.");

ajouter("javascript", "static/common.js", "fonction", "valeurUnique", "valeurUnique(liste)  — dans monterSelecteur",
  "Choisit tout seul l'unique vrai choix.",
  "S'il n'y a qu'une matière, une classe ou une spécialité, l'élève n'a pas à cliquer pour rien.");

ajouter("javascript", "static/common.js", "fonction", "choixComplet", "choixComplet()  — dans monterSelecteur",
  "Retourne le cours si les trois listes sont remplies.",
  "Sinon null. Les fiches ne se chargent pas sur un cours incomplet.");

ajouter("javascript", "static/common.js", "fonction", "notifier", "notifier()  — dans monterSelecteur",
  "Prévient la page que le cours a changé.",
  "Mémorise le trio complet et appelle onChange.");

ajouter("javascript", "static/common.js", "fonction", "chargerSpecialites", "chargerSpecialites()  — dans monterSelecteur",
  "Charge les spécialités de la classe choisie.",
  "Désactive la liste tant que la réponse n'est pas arrivée.");

ajouter("javascript", "static/common.js", "fonction", "chargerClasses", "chargerClasses()  — dans monterSelecteur",
  "Charge les classes de la matière choisie.",
  "Changer de matière remet la spécialité à zéro.");

ajouter("javascript", "static/common.js", "fonction", "demarrer", "demarrer()  — dans monterSelecteur",
  "Charge les matières au premier affichage.",
  "Reprend le cours mémorisé s'il existe encore.");

ajouter("javascript", "static/common.js", "fonction", "remplirNavigation", "remplirNavigation()",
  "Construit le menu du compte en haut de page.",
  "Sans compte : lien Connexion. Si le mot de passe doit encore être choisi et que la page n'est pas celle du mot de passe, le navigateur y part. Sinon un menu au nom de la personne contient Mon espace, Mot de passe et Déconnexion. Annonce ensuite l'événement compte-connu.");

ajouter("javascript", "static/common.js", "fonction", "preparerCookies", "preparerCookies()",
  "Montre le bandeau des cookies tant qu'il n'a pas été accepté.",
  "Lit la clé fiches-cookies dans le stockage local. Si elle vaut compris, le bandeau reste caché. Le bouton J'ai compris écrit cette valeur et cache le bandeau. Ce n'est pas un cookie envoyé au serveur.");

ajouter("javascript", "static/accueil.js", "fonction", "afficherZones", "afficherZones()",
  "Montre le formulaire d'envoi ou l'invite à se connecter.",
  "Le formulaire n'apparaît que si un cours est choisi et qu'un compte est connecté.");

ajouter("javascript", "static/accueil.js", "fonction", "cheminCours", "cheminCours()",
  "Adresse des fiches du cours choisi.",
  "Les trois noms sont encodés pour rester des morceaux d'adresse sûrs.");

ajouter("javascript", "static/accueil.js", "fonction", "chargerFiches", "chargerFiches()",
  "Affiche les fiches du cours dès qu'il est choisi.",
  "Pas de bouton intermédiaire. Chaque fiche devient une carte avec étoile et commentaires.");

ajouter("javascript", "static/espace.js", "fonction", "remplir", "remplir(zone, fiches, avec actions)",
  "Affiche les envois ou les téléchargements de l'élève.",
  "Modifier et Supprimer ne sont mis que sur les envois, déjà filtrés par le serveur pour ne garder que les fiches de ce compte. Les téléchargements n'ont pas ces actions. Supprimer recharge la page seulement si le serveur accepte.");

ajouter("javascript", "static/staff.js", "fonction", "demarrer", "demarrer()",
  "Ouvre le tableau de bord de l'équipe.",
  "Appelée seulement après compte-connu, et seulement si le rôle est modérateur, admin ou propriétaire. Un élève est envoyé vers /users/dashboard. Le préfixe lu dans la page doit être /admin ou /moderator, sinon même renvoi.");

ajouter("javascript", "static/staff.js", "fonction", "charger", "charger()  — dans demarrer",
  "Affiche les fiches du cours choisi dans l'espace équipe.",
  "Chaque carte a Modifier et Supprimer, vers le préfixe de la page. Le serveur revérifie le rôle au moment du clic.");

ajouter("javascript", "static/comptes.js", "fonction", "dessiner", "dessiner(liste)",
  "Remplace le tableau des comptes.",
  "Utilisé au chargement, pendant la saisie, au changement de rôle ou d'état, et pour le bouton Tout afficher.");

ajouter("javascript", "static/comptes.js", "fonction", "criteres", "criteres()  — dans le chargement",
  "Lit le nom, le rôle et l'état du formulaire.",
  "Les champs vides ne partent pas. Sans aucun critère, la recherche n'appelle pas le serveur.");

ajouter("javascript", "static/comptes.js", "fonction", "lancer", "lancer()  — dans le chargement",
  "Filtre les comptes tout de suite.",
  "Si tout est vide, le tableau reprend la liste déjà dans la page. Sinon il interroge prefixe/comptes/recherche. Une réponse plus ancienne est ignorée.");

ajouter("javascript", "static/comptes.js", "fonction", "bientot", "bientot()  — dans le chargement",
  "Retarde la recherche de 250 ms pendant la frappe.",
  "Le délai repart à chaque lettre. Choisir un rôle ou un état ne passe pas par ce délai : lancer est appelé tout de suite.");

ajouter("javascript", "static/comptes.js", "fonction", "cellule", "cellule(texte)",
  "Crée une case de tableau.",
  "Le texte n'est pas interprété comme du HTML.");

ajouter("javascript", "static/comptes.js", "fonction", "ajouterLigne", "ajouterLigne(compte)",
  "Une ligne : nom, identifiant, rôle, état, actions.",
  "Les boutons affichés suivent le rôle. Le serveur revérifie quand même. On ne propose pas de suspendre le propriétaire, ni de changer son propre rôle.");

ajouter("javascript", "static/audit.js", "fonction", "nombre", "nombre(valeur)",
  "Affiche un entier avec les espaces français.",
  "Zéro si la valeur manque.");

ajouter("javascript", "static/audit.js", "fonction", "octets", "octets(valeur)",
  "Taille lisible : o, Ko, Mo, Go, To.",
  "Le détail en octets exacts est souvent ajouté à côté.");

ajouter("javascript", "static/audit.js", "fonction", "detailOctets", "detailOctets(valeur)",
  "Le même nombre, écrit en toutes lettres « octets ».",
  "Pour ne pas laisser seulement l'arrondi.");

ajouter("javascript", "static/audit.js", "fonction", "dateCourte", "dateCourte(iso)",
  "Date et heure locales.",
  "Un tiret si la date manque ou n'est pas lisible.");

ajouter("javascript", "static/audit.js", "fonction", "duree", "duree(secondes)",
  "Durée en heures et minutes.",
  "Sert au temps depuis le démarrage du processus.");

ajouter("javascript", "static/audit.js", "fonction", "pourcent", "pourcent(part, total)",
  "Pourcentage à une décimale.",
  "Zéro pour cent si le total est nul, pour éviter une division par zéro.");

ajouter("javascript", "static/audit.js", "fonction", "vider", "vider(id)",
  "Vide une zone avant de la redessiner.",
  "Retourner la zone permet d'y ajouter tout de suite les nouveaux blocs.");

ajouter("javascript", "static/audit.js", "fonction", "carte", "carte(libellé, valeur, détail)",
  "Un chiffre en gros, avec son libellé.",
  "Le détail facultatif est en petit dessous.");

ajouter("javascript", "static/audit.js", "fonction", "tableau", "tableau(colonnes, lignes, message vide)",
  "Tableau HTML construit sans innerHTML.",
  "Si une cellule est un nœud déjà prêt, elle est ajoutée telle quelle. Sinon son texte est écrit.");

ajouter("javascript", "static/audit.js", "fonction", "listeSimple", "listeSimple(textes, message vide)",
  "Liste à puces.",
  "Message gris s'il n'y a rien.");

ajouter("javascript", "static/audit.js", "fonction", "cours", "cours(fiche)",
  "Matière, classe et spécialité sur une ligne.",
  "Les morceaux vides sont retirés.");

ajouter("javascript", "static/audit.js", "fonction", "peindre", "peindre()",
  "Dessine tout l'audit du propriétaire.",
  "Les chiffres détaillés restent dans les onglets Sessions, Contenu, Étoiles et Sécurité. À la fin, dessinerGraphiques remplit la vue d'ensemble.");

ajouter("javascript", "static/audit.js", "fonction", "etoilesDe", "etoilesDe(relevé)  — dans le chargement",
  "Retourne le bloc étoiles du relevé, ou un objet vide.",
  "Évite de dessiner un graphique quand le relevé n'a pas encore cette partie.");

ajouter("javascript", "static/audit.js", "fonction", "dessinerGraphiques", "dessinerGraphiques(...)  — dans le chargement",
  "Anneau des rôles et barres de la vue d'ensemble.",
  "Comptes par rôle, disque utilisé et libre, huit matières les plus fournies, six têtes d'étoiles. Si le site est suspendu, une note est placée au-dessus.");

ajouter("javascript", "static/audit.js", "fonction", "appliquer", "appliquer(données, message)",
  "Remplace le relevé affiché.",
  "Le message facultatif confirme une actualisation ou une suspension.");

ajouter("javascript", "static/audit.js", "fonction", "actualiser", "actualiser(message)",
  "Redemande le relevé au serveur.",
  "Un 401 renvoie à la connexion. La page se rafraîchit aussi toute seule toutes les 20 secondes, sauf si l'onglet est caché.");

ajouter("javascript", "static/audit_perso.js", "fonction", "nombre", "nombre(valeur)",
  "Entier formaté pour l'audit personnel.",
  "Même idée que sur l'audit du propriétaire, dans un script séparé pour ne pas mélanger les deux pages.");

ajouter("javascript", "static/audit_perso.js", "fonction", "octets", "octets(valeur)",
  "Taille lisible des fiches de l'élève.",
  "Unités o, Ko, Mo, Go.");

ajouter("javascript", "static/audit_perso.js", "fonction", "dateCourte", "dateCourte(iso)",
  "Date locale d'un commentaire.",
  "Tiret si la date est absente.");

ajouter("javascript", "static/audit_perso.js", "fonction", "vider", "vider(id)",
  "Vide une zone de l'audit personnel.",
  "Avant de redessiner les chiffres ou les tableaux.");

ajouter("javascript", "static/audit_perso.js", "fonction", "carte", "carte(libellé, valeur, détail)",
  "Un chiffre de l'audit personnel.",
  "Fiches, volume, étoiles, téléchargements, commentaires.");

ajouter("javascript", "static/audit_perso.js", "fonction", "tableau", "tableau(colonnes, lignes, message vide)",
  "Tableau des fiches ou des commentaires de l'élève.",
  "Texte seulement, pas de HTML venant des commentaires.");

ajouter("javascript", "static/audit_perso.js", "fonction", "cours", "cours(fiche)",
  "Cours d'une fiche de l'élève.",
  "Matière, classe, spécialité.");

ajouter("javascript", "static/audit_perso.js", "fonction", "audience", "audience(valeur)",
  "Libellé de visibilité dans l'audit personnel.",
  "Tous les utilisateurs, Équipe, ou Utilisateurs et équipe.");

ajouter("javascript", "static/audit_perso.js", "fonction", "statut", "statut(valeur, responsable)",
  "État du commentaire dans l'audit.",
  "En attente, pris en charge, ou validé, avec le nom du responsable s'il y en a un.");

ajouter("javascript", "static/audit_perso.js", "fonction", "peindre", "peindre()",
  "Dessine l'audit de mes fiches.",
  "Jusqu'à huit barres d'étoiles dans graphique-perso, puis les tableaux. La grille de chiffres zone-resume est remplie mais reste cachée. Actualiser, dans le menu Actions, redemande /users/audit.json. Cette adresse ne contient pas l'identifiant d'un autre compte.");

ajouter("javascript", "static/graphiques.js", "fonction", "barreAnimee", "barreAnimee(étiquette, valeur, maximum, détail)",
  "Une barre qui se remplit.",
  "La largeur est la part de la valeur dans le maximum, au moins 6 % si la valeur est positive, écrite dans la variable CSS --largeur. Le texte est étiquette et détail, posé avec textContent.");

ajouter("javascript", "static/graphiques.js", "fonction", "anneau", "anneau(parts)",
  "Anneau des parts, avec sa légende.",
  "Chaque part a un libellé, une valeur et une couleur. Un cercle SVG reçoit --part. Les parts nulles sont sautées. La légende reprend le libellé et la valeur. Aucune bibliothèque externe : le script vient du site, comme l'exige la politique de sécurité.");

ajouter("javascript", "static/cookies.js", "script", "Revoir le bandeau", "static/cookies.js",
  "Efface l'accusé du bandeau cookies.",
  "Pas de fonction nommée. Le bouton cookies-oublier retire fiches-cookies du stockage local. Les cookies de session et de sécurité ne sont pas touchés. Le bandeau reviendra au prochain affichage d'une page.");

ajouter("javascript", "static/modifier.js", "script", "Formulaire de modification", "static/modifier.js",
  "Envoie le formulaire de correction d'une fiche.",
  "Le script n'a pas de fonction nommée : au chargement, il relit la fiche déjà dans la page, préremplit le titre et la description, branche le sélecteur de cours, puis poste le formulaire vers l'adresse data-save-url. Le serveur décide si ce compte a le droit d'enregistrer.");

ajouter("javascript", "auth/static/login.js", "script", "Formulaire de connexion", "auth/static/login.js",
  "Envoie l'identifiant et le mot de passe.",
  "Pas de fonction nommée. Si le compte est déjà connecté, la page part vers son espace, ou vers le choix du mot de passe si c'est encore obligatoire. À la réussite, le nouveau mot de passe obligatoire gagne sur l'adresse next. Sinon le navigateur suit next, ou l'accueil du rôle.");

ajouter("javascript", "auth/static/logout.js", "script", "Formulaire de déconnexion", "auth/static/logout.js",
  "Confirme la sortie.",
  "Pas de fonction nommée. Le formulaire poste /auth/logout. Le cookie de session est ensuite effacé côté serveur, puis la page revient à l'accueil.");

ajouter("javascript", "auth/static/mot-de-passe.js", "script", "Formulaire du mot de passe", "auth/static/mot-de-passe.js",
  "Envoie l'ancien mot de passe, le nouveau et sa confirmation.",
  "Pas de fonction nommée. Le formulaire poste /auth/mot-de-passe en JSON. Si le serveur accepte, la page va vers l'accueil du rôle. Le mot de passe n'apparaît pas dans l'adresse.");
