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
  "Le navigateur n'écrit jamais le HTML des fiches à la main : il crée des éléments et y pose du texte.",
  "Les panneaux, cartes, menus et onglets s'animent. prefers-reduced-motion coupe ces mouvements.",
  "La recherche de fiches et de comptes filtre pendant la saisie.",
  "L'audit du propriétaire ouvre des graphiques. Les détails sont dans des onglets.",
  "Le pied de page ouvre les mentions, la confidentialité, les cookies et les licences."
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
  ["CSS du site", "Violet #6b3fa0. Uniquement static/style.css."],
  ["Dossier documentation", "Cuivre #8c3d2f. HTML, JavaScript et CSS de ce dossier, dont documentation/style.css."]
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
], ["La carte monte en apparaissant, puis se soulève au survol. Elle contient titre, meta, description, fichier, étoile, actions, commentaires."]);

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
  ["padding", "1.2rem 1rem 5rem, pour laisser passer le bandeau cookies."]
], ["Contient la phrase de partage et le menu des quatre pages légales."]);

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

preciser("templates/base.html", "Squelette commun", [
  ["lang", "fr sur la balise html. Toute la page est en français."],
  ["block titre", "Titre de l'onglet. Défaut « Fiches de révision ». Chaque page le remplace."],
  ["a.passer", "Lien d'évitement vers #contenu. Caché tant que le clavier ne le focalise pas."],
  ["#nav-compte", "Vide dans le HTML. common.js y pose Connexion, ou le menu du compte."],
  [".menu-legal", "Quatre liens : /legal/mentions, /legal/confidentialite, /legal/cookies, /legal/licences."],
  ["#banniere-cookies", "Bandeau fixé en bas, attribut hidden au départ. common.js le montre si le stockage local n'a pas fiches-cookies = compris."],
  ["#cookies-ok", "Bouton « J'ai compris ». Il cache le bandeau et écrit l'accusé dans le navigateur."],
  ["block scripts", "Emplacement du script propre à la page, après common.js."]
], [
  "Le navigateur charge style.css, puis le corps : lien d'évitement, barre, contenu, pied, bandeau.",
  "common.js remplit #nav-compte et décide d'afficher le bandeau.",
  "La page fille remplit block contenu et, si besoin, block scripts."
]);

preciser("templates/index.html", "Accueil", [
  ["#salut", "Vide au départ. common.js y écrit « Bonjour » suivi du prénom et du nom."],
  ["#selecteur", "Trois listes matière, classe, spécialité, créées par monterSelecteur."],
  ["#statut", "Message d'attente ou d'erreur, role=status."],
  ["form-recherche.q", "Texte libre, 120 caractères, type search."],
  ["form-recherche.auteur", "Nom d'auteur, 80 caractères."],
  ["form-recherche.etoiles_min", "Nombre entier, de 0 à 1 000 000."],
  ["#resultats", "Cartes de la recherche. Se remplit pendant la saisie, se vide si tous les champs sont vides."],
  ["#fichiers", "Cartes du cours choisi."],
  ["#invite-connexion", "Lien vers /auth/login-page?next=/accueil. Caché dès qu'un compte est connu."],
  ["#form-envoi", "Fichier, titre (120), description (2000). Caché sans compte. Pas de champ auteur."]
], [
  "accueil.js démarre le sélecteur et charge les fiches du cours.",
  "Taper ou changer un critère interroge /info/recherche et peint #resultats, sans bouton.",
  "Changer de cours repeint #fichiers.",
  "Sans compte, le formulaire de publication reste caché et l'invite de connexion apparaît.",
  "Publier envoie le fichier vers /upload/matière/classe/spécialité."
]);

preciser("templates/user_dashboard.html", "Espace élève", [
  ["profil.name", "Prénom affiché dans la phrase d'accueil, échappé par Jinja."],
  ["profil.surname", "Nom affiché à côté."],
  ["details.menu-liste", "Menu « Mon menu » : audit de mes fiches, publier une fiche."],
  ["#envoyes", "Liste des fiches envoyées. Remplie par espace.js."],
  ["#telecharges", "Liste des fiches téléchargées, sans Modifier ni Supprimer."],
  ["#fiches-data", "JSON { envoyes, telecharges } déjà rendu par le serveur."]
], [
  "Le serveur rend la page avec le profil et le JSON des fiches.",
  "espace.js lit fiches-data.",
  "Il peint les envois avec Modifier et Supprimer, puis les téléchargements sans ces actions."
]);

preciser("templates/audit_perso.html", "Audit de mes fiches", [
  ["details Actions", "Retour à /users/dashboard et bouton #bouton-actualiser."],
  ["#graphique-perso", "Barres d'étoiles dessinées par audit_perso.js."],
  ["#zone-resume", "Grille de chiffres, attribut hidden. Les graphiques la remplacent."],
  ["#zone-plus", "Phrase de détail sous le graphique."],
  ["#zone-fiches", "Tableau des fiches de ce compte."],
  ["#zone-commentaires", "Commentaires que cet élève a le droit de lire."],
  ["#audit-data", "JSON du relevé personnel, rendu par le serveur."]
], [
  "audit_perso.js lit audit-data et dessine les barres, les fiches et les commentaires.",
  "Actualiser redemande le relevé du même compte, sans identifiant dans l'adresse."
]);

preciser("templates/audit.html", "Audit du propriétaire", [
  ["#etat-site", "Phrase qui dit si le site est ouvert ou suspendu."],
  ["#bouton-site", "Dans le menu Pilotage. Suspendre ou rouvrir le site."],
  ["#bouton-actualiser", "Dans le même menu. Redemande le relevé."],
  ["[data-onglet]", "Cinq onglets : vue, sessions, contenu, etoiles, securite. Un seul a aria-selected vrai."],
  ["#onglet-vue", "Visible au chargement. Contient #graphiques."],
  ["#onglet-sessions", "Caché. Contient #zone-sessions."],
  ["#onglet-contenu", "Caché. Stockage, comptes, activité, contenu, orphelins."],
  ["#onglet-etoiles", "Caché. #zone-etoile-globale et #zone-etoiles-matiere."],
  ["#onglet-securite", "Caché. Identifiants bloqués et comptes suspendus."],
  ["#audit-data", "JSON du relevé de tout le site."]
], [
  "graphiques.js puis audit.js sont chargés.",
  "audit.js peint la vue d'ensemble : anneau des rôles, barres de disque, matières et étoiles.",
  "Un clic d'onglet cache les autres panneaux et montre celui qui correspond à data-onglet.",
  "La page se rafraîchit toute seule pour les sessions."
]);

preciser("templates/staff_dashboard.html", "Espace modération ou administration", [
  ["titre", "« Espace administration » ou « Espace modération », selon la route."],
  ["comptes_url", "Lien du menu vers la page des comptes de ce rôle."],
  ["#form-recherche", "Texte, auteur, étoiles minimum. Pas de matière, classe ni spécialité."],
  ["#resultats", "Cartes trouvées par la recherche."],
  ["#selecteur", "Menu de cours."],
  ["#fichiers", "Fiches du cours, avec Modifier et Supprimer."],
  ["#staff-config", "Attribut data-prefix : /admin ou /moderator. Caché."]
], [
  "staff.js lit data-prefix.",
  "Il charge les fiches du cours et pose les liens de modification sous ce préfixe.",
  "La recherche suit la saisie et remplit #resultats sans changer le cours affiché en dessous."
]);

preciser("templates/comptes.html", "Gestion des comptes", [
  ["prefix", "Début des adresses d'action : /admin ou /moderator."],
  ["form-recherche.q", "Nom, prénom ou identifiant, 80 caractères."],
  ["form-recherche.role", "Vide, user, moderator, admin ou owner."],
  ["form-recherche.etat", "Vide, actif ou suspendu."],
  ["#bouton-tous", "Efface les critères et réaffiche la liste initiale."],
  ["#corps-comptes", "Corps du tableau, vide dans le HTML."],
  ["#comptes-config", "data-prefix, data-roles (1 ou 0), data-moi (identifiant du compte connecté)."],
  ["#comptes-data", "JSON des profils, sans mot de passe."]
], [
  "comptes.js lit la configuration et le JSON.",
  "Il dessine une ligne par compte : nom, identifiant, rôle, état, actions.",
  "Taper un nom ou choisir un rôle ou un état remplace le tableau. Vider les critères, ou Tout afficher, revient à la liste d'origine."
]);

preciser("templates/modifier.html", "Modifier une fiche", [
  ["metadata.author", "Identifiant de l'auteur, affiché, non modifiable."],
  ["#form-modifier", "data-save-url pour l'enregistrement, data-retour-url pour Annuler et pour le succès."],
  ["#selecteur", "Cours actuel, prérempli."],
  ["name=title", "Titre, obligatoire, 120 caractères, valeur déjà remplie."],
  ["name=desc", "Description, obligatoire, 2000 caractères."],
  ["name=file", "Fichier facultatif. Les mêmes extensions que la publication, sans HTML."],
  ["metadata.original_filename", "Nom du fichier actuel, montré sous le champ."],
  ["#fiche-data", "JSON public de la fiche, lu par modifier.js."]
], [
  "modifier.js préremplit le sélecteur avec la matière, la classe et la spécialité.",
  "Enregistrer envoie le formulaire vers data-save-url.",
  "Succès : le navigateur va vers data-retour-url. Annuler y va sans enregistrer."
]);

preciser("templates/erreur.html", "Page d'erreur", [
  ["message", "Texte fourni par le serveur, échappé. Jamais interprété comme du HTML."]
], [
  "La page affiche le titre Oups, le message, puis un lien vers /accueil."
]);

preciser("templates/suspendu.html", "Site suspendu", [
  ["depuis", "Date de la pause, affichée seulement si le serveur la connaît."]
], [
  "La page explique la pause.",
  "Si depuis est rempli, une note donne la date.",
  "Le lien Connexion mène à /auth/login-page. Le propriétaire peut encore entrer."
]);

preciser("auth/login/login.html", "Connexion", [
  ["site_suspendu", "Si vrai, une phrase d'erreur dit que seul le propriétaire peut entrer."],
  ["name=username", "Identifiant, obligatoire, 80 caractères, autocomplete username."],
  ["name=password", "Mot de passe, obligatoire, 200 caractères, autocomplete current-password."],
  ["#login-config", "JSON { next }. Chemin interne déjà nettoyé par le serveur."]
], [
  "login.js lit next.",
  "Entrer envoie un JSON à /auth/login, pas le formulaire HTML classique.",
  "Si le compte doit changer de mot de passe, la page part vers /auth/mot-de-passe.",
  "Sinon elle suit next, ou la page d'accueil du rôle."
]);

preciser("auth/logout/logout.html", "Déconnexion", [
  ["user.name", "Prénom dans la phrase d'au revoir."],
  ["user.surname", "Nom à côté."],
  ["#form-sortie", "Un seul bouton. logout.js intercepte l'envoi."],
  ["retour", "Adresse « Rester connecté », page d'accueil du rôle."]
], [
  "Le clic poste /auth/logout avec le jeton CSRF.",
  "Succès : redirection vers /accueil.",
  "Rester connecté quitte la page sans appeler la déconnexion."
]);

preciser("auth/mot-de-passe/mot-de-passe.html", "Mot de passe", [
  ["obligatoire", "Vrai à la première connexion. Change le titre et le lien du bas."],
  ["name=actuel", "Mot de passe courant, 200 caractères."],
  ["name=nouveau", "Nouveau mot de passe, 10 à 200 caractères."],
  ["name=confirmation", "Deuxième saisie, mêmes bornes."],
  ["retour", "Page d'accueil du rôle, utilisée seulement si le changement n'est pas forcé."],
  ["#mot-de-passe-config", "JSON { obligatoire, retour }."]
], [
  "Si obligatoire, le titre est « Choisis ton mot de passe » et le lien du bas est la déconnexion.",
  "Sinon le titre est « Modifier mon mot de passe » et le lien ramène à l'espace.",
  "Enregistrer envoie actuel, nouveau et confirmation en JSON vers /auth/mot-de-passe."
]);

preciser("templates/legal/mentions.html", "Mentions légales", [
  ["h1", "Mentions légales."],
  ["Éditeur", "Le compte dont le rôle est owner. Un seul."],
  ["Hébergement", "La machine du serveur. Dossiers matiere/ et uploads/, base SQLite locale."],
  ["Contact", "Hors du site : le site n'envoie pas d'e-mail."],
  ["Contenu publié", "L'auteur affiché est l'identifiant du compte qui a déposé la fiche."]
], [
  "La page s'affiche sans script et sans lecture de la base.",
  "Elle reste ouverte même si le site est suspendu ou si un mot de passe doit être changé."
]);

preciser("templates/legal/confidentialite.html", "Politique de confidentialité", [
  ["Compte", "Prénom, nom, identifiant, rôle, suspension, date de création, hash du mot de passe."],
  ["Fiches", "Fichier, titre, description, cours, nom d'origine. Suppression en cascade des étoiles et commentaires."],
  ["Activité", "Identifiants envoyés et téléchargés, étoiles, commentaires et leur visibilité."],
  ["Session", "Identifiant du compte, dates, nom court du navigateur. Pas d'adresse IP. Huit heures."],
  ["Durée", "Tant que le compte et les fiches existent. La déconnexion ferme la session."]
], [
  "La page décrit seulement ce que le programme enregistre vraiment.",
  "Elle ne charge aucun script."
]);

preciser("templates/legal/cookies.html", "Gestion des cookies", [
  ["Cookie de session", "HttpOnly, déposé à la connexion, lu seulement par le serveur, huit heures."],
  ["Cookie CSRF", "Déposé en même temps. Le script l'envoie avec les actions qui modifient des données."],
  ["fiches-cookies", "Clé du stockage local. Valeur compris après « J'ai compris ». Ce n'est pas un cookie."],
  ["#cookies-oublier", "Bouton « Revoir le bandeau ». cookies.js retire la clé."]
], [
  "La page liste les deux cookies et explique le stockage local.",
  "Revoir le bandeau efface fiches-cookies. Au prochain affichage, common.js remontrera le bandeau."
]);

preciser("templates/legal/licences.html", "Licences", [
  ["Flask, Werkzeug, Flask-SQLAlchemy", "BSD à trois clauses."],
  ["SQLAlchemy, Flask-JWT-Extended, Gunicorn", "MIT."],
  ["Requests", "Apache 2.0."],
  ["Fiches des élèves", "Restent la propriété de leurs auteurs. Elles ne sont pas couvertes par ces licences."]
], [
  "La page nomme les bibliothèques et leur licence.",
  "Les textes complets sont ceux livrés avec chaque paquet Python sur le serveur."
]);

preciser("documentation/index.html", "Page de cette documentation", [
  ["#recherche", "Champ de recherche. Il ne quitte pas la page."],
  ["#filtres", "Pastilles de langage, remplies par menu.js."],
  ["#menu", "Sommaire : langage, fichier, nom."],
  ["#lecture", "Résumé, variables, actions à gauche. Code à droite, moitié moitié."],
  ["donnees-*.js", "Textes des fiches. Chargés par des balises script, sans fetch."],
  ["precisions.js", "Variables et actions des fonctions."],
  ["sources.js", "Extraits de code affichés à droite."],
  ["coloration.js", "Couleurs du thème sombre, appliquées au code."],
  ["menu.js", "Filtre, recherche, et mise en page de la fiche."]
], [
  "Ouvrir le fichier dans le navigateur. Aucun serveur n'est contacté.",
  "menu.js construit les pastilles et le sommaire à partir de window.DOCS.",
  "Un clic de fiche pose le texte à gauche et le code coloré à droite, chacun sur la moitié.",
  "Le code s'affiche en entier : pas de hauteur maximale, pas de barre de défilement dans le bloc.",
  "Le contenu de #lecture monte en fondu. prefers-reduced-motion annule ce mouvement."
]);

preciser("static/common.js", "carteFiche", [
  ["barre", "Ligne avec l'étoile et le menu Actions."],
  ["menu", "Élément details.menu-liste. Le résumé dit Actions."],
  ["lien", "Télécharger, vers /download/matière/classe/spécialité/identifiant."],
  ["actions", "Modifier, Supprimer, ou rien, selon la page qui appelle la carte."],
  ["commentaires", "Objet { bloc, ouvrir } de zoneCommentaires. Le bouton va dans le menu, le panneau sous la carte."]
], [
  "Pose le titre, l'auteur, le cours, la description et le nom du fichier avec textContent.",
  "Ajoute l'étoile si la fiche a un identifiant.",
  "Ouvre le menu Actions : Télécharger, puis les actions fournies, puis Commentaires."
]);

preciser("static/common.js", "remplirNavigation", [
  ["zone", "Élément #nav-compte."],
  ["compte", "Réponse de /auth/me, ou null si personne n'est connecté."],
  ["menuCompte", "Menu details dont le résumé est le prénom."],
  ["espace", "Lien vers la page d'accueil du rôle."],
  ["motDePasse", "Lien vers /auth/mot-de-passe."],
  ["sortie", "Lien vers /auth/logout-page."]
], [
  "Sans compte, pose seulement le lien Connexion.",
  "Si le mot de passe doit changer et que la page n'est pas /auth/mot-de-passe, y envoie le navigateur.",
  "Sinon pose le menu : Mon espace, Mot de passe, Déconnexion.",
  "Écrit Bonjour dans #salut s'il existe, puis émet compte-connu."
]);

preciser("static/common.js", "preparerCookies", [
  ["bandeau", "Élément #banniere-cookies, caché dans le HTML."],
  ["bouton", "Élément #cookies-ok."],
  ["fiches-cookies", "Clé du stockage local. Valeur compris après le clic."]
], [
  "Si la clé vaut déjà compris, ne montre rien.",
  "Sinon retire hidden du bandeau.",
  "J'ai compris écrit compris et cache le bandeau."
]);

preciser("static/comptes.js", "criteres", [
  ["params", "URLSearchParams. Un champ vide n'y est pas ajouté."]
], [
  "Lit le formulaire de recherche des comptes.",
  "Renvoie les critères non vides."
]);

preciser("static/comptes.js", "lancer", [
  ["serie", "Numéro de la recherche. Une réponse plus ancienne est ignorée."],
  ["prefixe", "/admin ou /moderator, lu dans comptes-config."]
], [
  "Sans critère, redessine la liste complète déjà dans la page.",
  "Sinon interroge prefixe/comptes/recherche.",
  "Un 401 renvoie à la connexion.",
  "Au-delà de 100 comptes, un message le signale."
]);

preciser("static/comptes.js", "bientot", [
  ["delai", "Minuteur de 250 ms, remis à zéro à chaque frappe."]
], [
  "Chaque lettre du nom reporte la recherche.",
  "Le changement d'une liste n'utilise pas ce délai."
]);

preciser("static/audit.js", "dessinerGraphiques", [
  ["rolesParts", "Élèves, modérateurs, administrateurs, propriétaire, chacun avec une couleur."],
  ["blocStock", "Barres utilisé et libre, sur le total du disque."],
  ["matieres", "Huit premières matières, barres rapportées à la plus fournie."],
  ["etoiles", "Phrase de la fiche la plus étoilée, puis six barres de têtes de matière."]
], [
  "Vide #graphiques.",
  "Pose l'anneau des rôles, les barres de disque, de matières et d'étoiles.",
  "Si le site est suspendu, ajoute la note en premier."
]);

preciser("static/audit.js", "etoilesDe", [
  ["releve.etoiles", "Bloc du classement, ou un objet vide s'il manque."]
], [
  "Retourne releve.etoiles, ou {}."
]);

preciser("static/graphiques.js", "barreAnimee", [
  ["etiquette", "Nom affiché avant le point médian."],
  ["valeur", "Mesure de cette barre."],
  ["maximum", "Référence pour calculer le pourcentage."],
  ["detail", "Texte après le point médian."],
  ["--largeur", "Pourcentage écrit sur le remplissage. Au moins 6 si la valeur est positive."]
], [
  "Calcule la part, avec un plancher de 6 % pour une valeur positive.",
  "Pose --largeur. L'animation CSS va de 0 à cette largeur.",
  "Renvoie la ligne, prête à être ajoutée."
]);

preciser("static/graphiques.js", "anneau", [
  ["parts", "Tableau de { libelle, valeur, couleur }."],
  ["total", "Somme des valeurs, ou 1 si tout est nul."],
  ["--part", "Pourcentage du cercle pour un segment."],
  ["legende", "Liste : pastille de la couleur, libellé et valeur."]
], [
  "Ignore une part de valeur nulle.",
  "Décale le segment suivant avec strokeDashoffset.",
  "Renvoie l'anneau et sa légende."
]);

preciser("static/cookies.js", "Revoir le bandeau", [
  ["#cookies-oublier", "Bouton de la page Gestion des cookies."],
  ["fiches-cookies", "Clé retirée du stockage local. Les cookies HTTP ne sont pas effacés."]
], [
  "Au clic, retire fiches-cookies.",
  "Affiche que le bandeau reviendra au prochain affichage."
]);

preciser("legal/routes.py", "mentions", [
  ["retour", "Le modèle templates/legal/mentions.html. Aucune lecture de la base."]
], [
  "Répond à GET /legal/mentions."
]);

preciser("legal/routes.py", "confidentialite", [
  ["retour", "Le modèle templates/legal/confidentialite.html."]
], [
  "Répond à GET /legal/confidentialite."
]);

preciser("legal/routes.py", "cookies", [
  ["retour", "Le modèle templates/legal/cookies.html, avec cookies.js."]
], [
  "Répond à GET /legal/cookies."
]);

preciser("legal/routes.py", "licences", [
  ["retour", "Le modèle templates/legal/licences.html."]
], [
  "Répond à GET /legal/licences."
]);

preciser("static/style.css", ".menu-liste", [
  ["summary", "Pilule blanche, bord forêt, sans puce de liste."],
  [".menu-panneau", "Panneau absolu, fond blanc, ombre, liens et boutons empilés."]
], ["S'ouvre au clic sur le résumé avec l'animation deployer. Le panneau passe au-dessus du contenu."]);

preciser("static/style.css", ".menu-legal", [
  ["display", "flex, centré, avec retour à la ligne."]
], ["Quatre liens du pied de page."]);

preciser("static/style.css", ".barre-fiche", [
  ["display", "flex, avec retour à la ligne."]
], ["Étoile à gauche, menu Actions à côté."]);

preciser("static/style.css", ".onglets", [
  ["button[aria-selected=true]", "Texte forêt foncée, bord bas forêt."]
], ["La couleur et le trait changent en transition. Le panneau visible joue surgir."]);

preciser("static/style.css", ".piste", [
  ["span", "Largeur 0 au départ, animation jusqu'à --largeur en 0,8 s."],
  ["@keyframes remplir", "Termine sur width: var(--largeur)."]
], ["Rail beige, remplissage forêt."]);

preciser("static/style.css", ".anneau", [
  ["width", "9rem."],
  [".segment", "stroke-dasharray part de 0 et va jusqu'à --part."],
  ["@keyframes tracer", "Termine sur la part du cercle."]
], ["L'anneau tourne de -90 degrés pour commencer en haut."]);

preciser("static/style.css", ".banniere-cookies", [
  ["position", "fixed, en bas, au-dessus du contenu."],
  ["p", "Prend la place restante, au moins 16rem avant de passer à la ligne."]
], ["Cachée tant que hidden est posé. À l'apparition, l'animation glisser la fait monter."]);

preciser("static/style.css", "mouvements", [
  ["--duree", "0,28 s. Durée de base des transitions."],
  ["--courbe", "cubic-bezier(0.22, 1, 0.36, 1). Arrivée plus douce que le départ."],
  ["monter", "Opacité 0 et 12 pixels plus bas, vers l'état normal. Panneaux, cartes, commentaires, statistiques."],
  ["surgir", "Même idée, 8 pixels, pour l'onglet qui devient visible."],
  ["deployer", "Le menu part un peu au-dessus, légèrement réduit, puis se pose."],
  ["glisser", "Le bandeau cookies part 1,2 rem plus bas."],
  ["fondu", "Opacité seule. Messages, légende, lignes du tableau."],
  ["eclat", "L'étoile posée passe à l'échelle 1,12 puis revient à 1."]
], [
  "Les blocs directs de main arrivent l'un après l'autre, décalés de 0,05 s.",
  "Les huit premières cartes d'une liste sont décalées de 0,04 s.",
  "Ouvrir un menu details joue deployer sur .menu-panneau.",
  "Changer d'onglet joue surgir sur le panneau montré.",
  "Poser une étoile joue eclat parce que aria-pressed passe à true."
]);

preciser("static/style.css", "mouvement réduit", [
  ["prefers-reduced-motion", "Réglage du système, pas un bouton du site."],
  ["animation-duration", "0,01 ms, avec !important, pour gagner sur les autres règles."],
  ["transition-duration", "0,01 ms aussi."],
  ["scroll-behavior", "auto, pas de défilement doux."]
], [
  "Si le visiteur demande moins de mouvement, les cartes, menus, onglets, barres et l'anneau apparaissent déjà en place."
]);

preciser("static/common.js", "monterRechercheFiches", [
  ["formulaire", "Formulaire de recherche de fiches : texte, auteur, étoiles minimum."],
  ["zone", "Élément #resultats, vidé puis rempli avec les cartes."],
  ["actionsPour", "Fonction facultative qui donne Modifier et Supprimer à une carte. Absente sur l'accueil."],
  ["delai", "Minuteur de 250 ms. Il repart à chaque frappe, pour ne pas interroger le serveur à chaque lettre."],
  ["serie", "Numéro de la recherche en cours. Une réponse plus ancienne est ignorée."],
  ["params", "Critères non vides. Le zéro du minimum d'étoiles est ignoré, comme sur le serveur."]
], [
  "Une frappe dans un champ texte programme la recherche 250 ms plus tard.",
  "Effacer le champ avec la croix du navigateur lance la recherche tout de suite.",
  "Un changement de liste déroulante lance la recherche tout de suite.",
  "Sans aucun critère, #resultats est vidé et aucun message d'erreur n'est affiché.",
  "La réponse peint les cartes, ou « Aucune fiche ne correspond. ».",
  "Si la liste dépasse 80 fiches, une note demande d'affiner."
]);

preciser("static/style.css", "petit écran", [
  ["max-width", "700px."],
  [".barre", "flex-direction column, align-items flex-start."],
  ["main", "Largeur min(100% - 1.2rem, 980px)."]
], ["Le bandeau n'écrase plus le menu sur un téléphone."]);

(function () {
  function remplacer(fichier, nom, ancien, nouveau) {
    var fiche = window.PRECISIONS[fichier + "\n" + nom];
    if (!fiche) return;
    fiche.actions = fiche.actions.map(function (ligne) {
      return ligne.indexOf(ancien) === -1 ? ligne : ligne.split(ancien).join(nouveau);
    });
  }
  var creation = window.PRECISIONS["app.py\ncreate_app"];
  if (creation) {
    var deja = creation.actions.some(function (ligne) {
      return ligne.indexOf("legal_bp") !== -1;
    });
    if (!deja) {
      var retour = creation.actions.pop();
      creation.actions.push("Exécute app.register_blueprint(legal_bp). app.register_blueprint(legal_bp)");
      if (retour) creation.actions.push(retour);
    }
  }
  remplacer(
    "utils/access.py",
    "forcer_mot_de_passe",
    "request.path.startswith(('/static/', '/auth/static/'))",
    "request.path.startswith(('/static/', '/auth/static/', '/legal/'))"
  );
  remplacer(
    "utils/site_gate.py",
    "bloquer_si_suspendu",
    "request.path.startswith('/static/')",
    "request.path.startswith(('/static/', '/legal/'))"
  );
})();
