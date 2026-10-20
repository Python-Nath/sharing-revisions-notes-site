/* Complète les fiches qui ne sont pas des fonctions nommées : pages, styles, guide. */

preciser("Présentation", "Ouvrir cette documentation", [
  ["#recherche", "Champ de recherche. Chaque frappe filtre le menu sur le titre, le fichier, le résumé, les variables et les actions."],
  ["#filtres", "Pastilles Tout, Présentation, Python, JavaScript, HTML, CSS. Une seule est enfoncée."],
  ["#menu", "Sommaire. Un langage s'ouvre, puis un fichier, puis le nom de la fonction."],
  ["#lecture", "Zone de droite. Elle montre le résumé, puis Variables, puis Actions dans l'ordre."]
], [
  "Ouvrir documentation/index.html dans le navigateur. Le serveur Flask n'est pas nécessaire.",
  "Cliquer une pastille ne garde que ce langage.",
  "Taper dans Rechercher cache les fiches qui ne contiennent pas le mot.",
  "Cliquer un nom affiche ses variables et ses actions. L'adresse de la page mémorise ce choix après le #."
]);

preciser("Présentation", "Le site en une minute", [
  ["matiere/", "Dossiers matière/classe/spécialité et JSON de chaque fiche."],
  ["uploads/", "Fichiers envoyés, nommés uuid_nom-sûr."],
  ["instance/users.db", "Base SQLite des comptes, sessions, étoiles et commentaires."],
  ["rôle", "user, moderator, admin ou owner. Relu en base à chaque requête, absent du jeton."]
], [
  "L'élève choisit un cours, publie ou télécharge.",
  "Le serveur vérifie le chemin, le type de fichier et le compte.",
  "Le navigateur n'écrit jamais le HTML des fiches à la main : il crée des éléments et y pose du texte."
]);

preciser("Présentation", "Les quatre rôles", [
  ["user", "Élève. Publie, modifie et supprime ses fiches, étoile, commente, voit son audit."],
  ["moderator", "Corrige toute fiche, suspend un élève, cherche les comptes. Ne change pas les rôles."],
  ["admin", "Comme le modérateur, plus le changement de rôle et la suspension d'un modérateur."],
  ["owner", "Un seul. Audit du site, suspension du site, et les droits d'administration."]
], [
  "Le jeton ne contient que l'identifiant du compte.",
  "Chaque page relit le rôle. Un changement ou un ban s'applique tout de suite.",
  "Personne ne peut s'attribuer owner depuis une page."
]);

preciser("Présentation", "Où vivent les fiches", [
  ["id", "UUID version 4, commun au JSON, au fichier et aux listes du compte."],
  ["filename", "Nom interne dans uploads/. Il ne sort pas dans la recherche."],
  ["original_filename", "Nom montré sur la carte, après secure_filename."],
  ["uploaded_files", "Liste d'UUID sur le compte. Ce n'est pas le fichier lui-même."],
  ["uploaded_metadatas", "Rappel id, filename, matiere, classe, specialite pour retrouver le JSON."]
], [
  "Publier écrit d'abord le fichier, puis le JSON, puis le compte. Si la base échoue, le disque est nettoyé.",
  "Supprimer retire les étoiles, les commentaires, le rappel du compte, puis le JSON et le fichier.",
  "Une fiche dont le JSON ne correspond pas à son dossier est ignorée."
]);

preciser("Présentation", "Une fiche, de l'envoi au retrait", [
  ["choix", "Objet { matiere, classe, specialite } produit par le menu."],
  ["etoiles", "Nombre public. etoile_moi dit seulement si le compte qui regarde a voté."],
  ["audience", "auteur, equipe ou les_deux."],
  ["handler_id", "Seul compte qui suit le commentaire."],
  ["corrected", "Vrai seulement après que ce compte a enregistré une modification de la fiche."]
], [
  "Le menu charge /info/matiere, puis /info/classe, puis /info/specialite.",
  "L'envoi POST /upload/... ignore tout auteur envoyé par le formulaire.",
  "L'étoile POST /fiches/id/etoile bascule : posée ou retirée.",
  "Le commentaire est refusé au-delà de 20 par fiche pour ce compte, ou 30 par jour.",
  "Suivre est refusé si quelqu'un s'en occupe déjà.",
  "Retirer est refusé tant que corrected est faux.",
  "Supprimer recharge la page entière."
]);

preciser("Présentation", "Le mot de passe", [
  ["must_change_password", "Vrai tant que le compte n'a pas choisi son mot de passe. Les comptes déjà en base avant cette colonne restent à faux."],
  ["actuel", "Mot de passe courant, vérifié contre le hash."],
  ["nouveau", "Au moins 10 caractères, au plus 200, sans caractère nul, différent de l'actuel et de l'identifiant."],
  ["confirmation", "Doit être égale à nouveau, caractère pour caractère."]
], [
  "La connexion répond home = /auth/mot-de-passe si le drapeau est vrai.",
  "Toute autre page HTML est redirigée. Un appel JSON reçoit 403.",
  "La déconnexion, la page de mot de passe et /auth/me restent ouvertes.",
  "Après succès, le hash est remplacé et le drapeau passe à faux.",
  "Le lien Mot de passe du menu permet de recommencer plus tard, avec les mêmes contrôles."
]);

preciser("Présentation", "Légende des couleurs", [
  ["Présentation", "Gris encre #1c2430."],
  ["Python", "Bleu #1d4e89."],
  ["JavaScript", "Ambre #8a4b08."],
  ["HTML", "Vert #1d6b4f."],
  ["CSS", "Violet #6b3fa0."]
], [
  "La pastille enfoncée prend la couleur du langage et un texte blanc.",
  "Chaque nom du menu a une barre gauche de la même couleur.",
  "Ces couleurs sont celles de la documentation, pas celles du site des élèves."
]);

preciser("static/common.js", "demarrer", [
  ["selectMatiere", "Liste déjà créée par monterSelecteur. Elle est vidée puis remplie."],
  ["valeurs", "Cours mémorisé dans sessionStorage sous la clé fiche-cours, ou null."],
  ["reponse", "Réponse de /info/matiere : { matiere: [noms] }."]
], [
  "Vide les trois listes et pose les invites.",
  "Demande /info/matiere.",
  "Si un cours mémorisé a encore sa matière, la sélectionne et charge les classes.",
  "S'il n'y a qu'une matière, la sélectionne tout seul."
]);

preciser("static/modifier.js", "Formulaire de modification", [
  ["fiche", "Objet lu dans #fiche-data : title, desc, matiere, classe, specialite, id."],
  ["formulaire", "Élément #form-modifier."],
  ["data", "FormData envoyé tel quel, y compris le fichier s'il a été choisi."],
  ["saveUrl", "Attribut data-save-url, adresse POST décidée par le serveur selon le rôle."]
], [
  "Au chargement, lit fiche-data et préremplit titre et description.",
  "Lance le sélecteur avec les valeurs du cours actuel.",
  "À l'envoi, poste FormData vers saveUrl.",
  "Si le serveur accepte, va vers data-retour-url."
]);

preciser("auth/static/login.js", "Formulaire de connexion", [
  ["config.next", "Chemin interne déjà nettoyé. Défaut /accueil."],
  ["formulaire.username", "Identifiant, espaces de bords retirés avant l'envoi."],
  ["formulaire.password", "Mot de passe, envoyé tel quel dans le JSON, jamais dans l'URL."],
  ["reponse.data.home", "Page d'arrivée du rôle, ou /auth/mot-de-passe."],
  ["reponse.data.must_change_password", "Si vrai, next est ignoré."]
], [
  "Si /auth/me dit qu'un compte est déjà là et doit changer de mot de passe, la page part vers /auth/mot-de-passe.",
  "Sinon un compte déjà là part vers next ou vers son espace.",
  "Le submit poste { username, password } vers /auth/login.",
  "Le bouton est désactivé pendant l'attente.",
  "Une erreur affiche reponse.data.error dans #statut."
]);

preciser("auth/static/logout.js", "Formulaire de déconnexion", [
  ["#form-sortie", "Seul formulaire de la page. Son submit est intercepté."]
], [
  "Empêche l'envoi HTML classique.",
  "Poste /auth/logout avec le jeton CSRF ajouté par api().",
  "Puis va vers /accueil, où le menu redevient Connexion."
]);

preciser("auth/static/mot-de-passe.js", "Formulaire du mot de passe", [
  ["config.obligatoire", "Vrai à la première connexion. Le script ne s'en sert que comme repli."],
  ["config.retour", "Espace du rôle si le serveur n'envoie pas home."],
  ["actuel", "Valeur du champ, non trimmée : les espaces font partie du mot de passe."],
  ["nouveau", "Nouvelle valeur."],
  ["confirmation", "Seconde saisie."]
], [
  "Intercepte submit.",
  "Désactive le bouton.",
  "Poste { actuel, nouveau, confirmation } vers /auth/mot-de-passe.",
  "En cas d'erreur, réactive le bouton et affiche le message.",
  "En cas de succès, va vers reponse.data.home."
]);

preciser("static/style.css", ".passer", [
  ["position", "absolute, pour le sortir du flux."],
  ["top", "-3rem hors écran, 0.5rem quand il est focalisé."]
], ["Le lien d'évitement apparaît seulement au clavier."]);

preciser("static/style.css", ".barre", [
  ["position", "sticky, top 0, pour rester visible au défilement."],
  ["z-index", "2, au-dessus des cartes."]
], ["Répartit la marque et le menu. Sur un écran de moins de 700 px, passe en colonne."]);

preciser("static/style.css", ".marque", [
  ["font-size", "1.4rem."],
  ["text-decoration", "none."]
], ["Le mot Fiches reste en encre, police des titres."]);

preciser("static/style.css", ".menu", [
  ["display", "flex, avec retour à la ligne."],
  ["gap", "0.8rem vertical, 1.2rem horizontal."]
], ["Les liens du bandeau ne sont pas soulignés, sauf au survol."]);

preciser("static/style.css", "main", [
  ["width", "min(980px, 100% - 2rem)."],
  ["margin", "0 auto."]
], ["Colonne centrée. Le padding vertical est 2rem puis 3rem."]);

preciser("static/style.css", ".salut", [
  ["color", "--foret-fonce."],
  ["font-weight", "650."]
], ["Met en avant le bonjour sans en faire un titre."]);

preciser("static/style.css", ".panneau", [
  ["background", "--carte."],
  ["border", "1px solid --ligne."],
  ["border-radius", "16px."],
  ["box-shadow", "--ombre."]
], ["Bloc de contenu : cours, fiches, formulaire, section d'audit."]);

preciser("static/style.css", ".etroit", [
  ["width", "min(100%, 34rem)."],
  ["margin", "auto à gauche et à droite."]
], ["Centre la connexion, la déconnexion et le mot de passe."]);

preciser("static/style.css", ".selecteur et .champ", [
  ["display", "grid."],
  ["gap", "0.35rem entre l'étiquette et le champ. 0.9rem entre les trois listes."]
], ["L'étiquette est au-dessus du contrôle, pas à côté."]);

preciser("static/style.css", "champs de saisie", [
  ["width", "100%."],
  ["padding", "0.65rem 0.75rem."],
  ["border", "1px solid #cbbfaa."],
  ["border-radius", "10px."],
  ["outline", "3px solid --focus quand le champ, le bouton ou le lien a le focus."]
], ["input, select et textarea partagent cette forme. textarea peut grandir vers le bas."]);

preciser("static/style.css", ".bouton-secondaire", [
  ["background", "transparent."],
  ["color", "--foret-fonce."],
  ["border", "1px solid --foret."]
], ["Action possible mais pas principale : Modifier, Actualiser, Mot de passe."]);

preciser("static/style.css", ".bouton-danger", [
  ["background", "transparent."],
  ["color", "--danger."],
  ["border", "1px solid --danger."]
], ["Supprimer, suspendre, retirer un commentaire."]);

preciser("static/style.css", ".actions", [
  ["display", "flex."],
  ["flex-wrap", "wrap."],
  ["gap", "0.6rem."]
], ["S'applique aussi à .ligne-actions dans le tableau des comptes."]);

preciser("static/style.css", ".fiche", [
  ["background", "#fff."],
  ["border-radius", "12px."],
  ["padding", "1rem."]
], ["La carte contient titre, meta, description, fichier, étoile, actions, commentaires."]);

preciser("static/style.css", ".recherche", [
  ["grid-template-columns", "repeat(auto-fit, minmax(12rem, 1fr))."],
  ["align-items", "end, pour aligner le bouton avec les champs."]
], ["Les .champ de cette grille n'ont plus la marge verticale des longs formulaires."]);

preciser("static/style.css", ".commentaires", [
  ["margin-top", "0.8rem."],
  [".commentaire", "Bord haut --ligne, pour séparer les messages."]
], ["Le formulaire interne est une grille : texte, public, note, bouton."]);

preciser("static/style.css", ".meta, .note, .fichier, .pied", [
  ["color", "--encre-douce."]
], ["Textes secondaires. .pied est en plus centré, avec un padding de 1rem."]);

preciser("static/style.css", ".statut", [
  ["min-height", "1.4rem, pour ne pas faire sauter la page quand le message arrive."],
  [".ok", "Couleur --foret-fonce."],
  [".erreur", "Couleur --danger."]
], ["role=status est dans le HTML, pas dans le CSS."]);

preciser("static/style.css", ".grille-stats", [
  ["grid-template-columns", "repeat(auto-fit, minmax(11.5rem, 1fr))."],
  ["gap", "0.75rem."]
], ["Les cases .stat se replient quand l'écran rétrécit."]);

preciser("static/style.css", ".stat", [
  ["strong", "Le chiffre, 1.35rem, chiffres tabulaires."],
  ["span et small", "Libellé et détail, couleur douce, chacun sur sa ligne."]
], ["Une case de l'audit."]);

preciser("static/style.css", ".banniere", [
  ["border", "1px solid --danger."],
  ["background", "#f8ecec."]
], ["Avertissement de pause ou message fort."]);

preciser("static/style.css", ".badge", [
  ["background", "#e5f4ec."],
  ["color", "--foret-fonce."],
  ["border-radius", "999px."]
], ["Pastille En ligne dans l'audit du propriétaire."]);

preciser("static/style.css", ".vide", [
  ["color", "--encre-douce."]
], ["Phrase affichée quand une liste n'a aucune fiche ou aucun commentaire."]);

preciser("static/style.css", ".table-scroll et .comptes", [
  ["overflow-x", "auto sur l'enveloppe, pour un petit écran."],
  ["th, td", "Alignés à gauche, padding 0.7rem, bord bas --ligne, vertical-align top."],
  ["select", "min-width 10rem dans le tableau des rôles."]
], ["Le tableau ne casse pas la page : il défile horizontalement."]);

preciser("static/style.css", ".pied", [
  ["text-align", "center."],
  ["padding", "1rem."]
], ["Dernière ligne de base.html."]);

preciser("static/style.css", "[hidden]", [
  ["display", "none !important."]
], ["Gagne sur les autres display. Sert au formulaire d'envoi et au panneau de commentaires fermé."]);

function completer(fichier, nom, variables) {
  var cle = fichier + "\n" + nom;
  var existant = window.PRECISIONS[cle] || { variables: [], actions: [] };
  existant.variables = variables.concat(existant.variables);
  window.PRECISIONS[cle] = existant;
}

completer("app.py", "site_en_pause", [
  ["retour", "None si le site est ouvert ou si le visiteur est le propriétaire. Sinon une réponse 503, page ou JSON."]
]);
completer("app.py", "root", [
  ["retour", "Redirection 302 vers /accueil. Aucune variable locale."]
]);
completer("app.py", "accueil", [
  ["retour", "La page templates/index.html. Le cours et les fiches ne sont pas encore chargés."]
]);
completer("app.py", "mot_de_passe_a_choisir", [
  ["retour", "None si le compte a déjà choisi son mot de passe. Sinon redirection vers /auth/mot-de-passe, ou JSON 403."]
]);
completer("database/model.py", "generate_uuid", [
  ["retour", "Chaîne uuid.uuid4(), par exemple 3619482d-aa02-4060-ba3d-d0a7bc39eec8. Nouvelle à chaque appel."]
]);
completer("database/model.py", "__repr__", [
  ["self.username", "Identifiant de connexion du compte. C'est le seul champ inclus dans le texte <User ...>."]
]);
completer("utils/etoiles.py", "_maintenant", [
  ["retour", "datetime UTC sans fuseau, pour la colonne stars.created_at."]
]);
completer("utils/commentaires.py", "_maintenant", [
  ["retour", "datetime UTC sans fuseau, pour comments.created_at et updated_at."]
]);
completer("utils/presence.py", "_maintenant", [
  ["retour", "datetime UTC sans fuseau, pour created_at, last_seen et la comparaison des 15 minutes."]
]);
completer("utils/site_gate.py", "_ouvert", [
  ["retour", "Dictionnaire suspended False, since None, by None. C'est l'état quand le fichier d'état manque."]
]);
completer("info/routes.py", "get_matiere", [
  ["retour", "JSON { matiere: [noms triés] } et le code 200. Seulement des noms de dossiers, pas de fichiers."]
]);
completer("fiches/routes.py", "_connecte", [
  ["retour", "Le couple de require_user : (compte, None) ou (None, réponse 404 ou 403)."]
]);
completer("auth/routes.py", "_max_attempts", [
  ["os.environ LOGIN_MAX_ATTEMPTS", "Texte de la variable d'environnement. Défaut 8. Si ce n'est pas un entier, la fonction renvoie 8. Le résultat est au moins 1."]
]);
completer("make_structure.py", "main", [
  ["STRUCTURE", "Dictionnaire du fichier : classe, puis matière, puis liste de spécialités. main le passe à make_structure."]
]);
completer("static/common.js", "choixComplet", [
  ["etat", "Objet { matiere, classe, specialite } tenu par monterSelecteur. Une chaîne vide signifie pas encore choisi."],
  ["retour", "Null si l'un des trois est vide. Sinon l'objet état, recopié par l'usage qui suit."]
]);
completer("static/accueil.js", "cheminCours", [
  ["choix.matiere", "Nom choisi, passé dans l'adresse avec encodeURIComponent."],
  ["choix.classe", "Deuxième segment."],
  ["choix.specialite", "Troisième segment."],
  ["retour", "Chaîne /info/files/matière/classe/spécialité."]
]);

preciser("static/style.css", "petit écran", [
  ["max-width", "700px."],
  [".barre", "flex-direction column, align-items flex-start."],
  ["main", "Largeur min(100% - 1.2rem, 980px)."]
], ["Le bandeau n'écrase plus le menu sur un téléphone."]);
