/* Fonctions Python. Ce fichier ne fait qu'ajouter des textes au menu. */

ajouter("python", "app.py", "fonction", "_load_secret", "_load_secret()",
  "Trouve la clé qui signe les sessions.",
  "Elle lit JWT_SECRET_KEY si la variable existe. Sinon elle réutilise instance/jwt_secret, ou en crée une et la protège en lecture pour le compte du serveur. Sans cette clé stable, tout le monde serait déconnecté à chaque redémarrage.");

ajouter("python", "app.py", "fonction", "create_app", "create_app()",
  "Construit l'application, la base et les protections.",
  "Elle règle la taille maximale d'un envoi à 100 Mo, les cookies de session, le CSRF, et la base SQLite. Elle crée les tables, ajoute les colonnes manquantes (mot de passe à changer, commentaire corrigé), puis garantit un seul propriétaire. Le serveur lancé par python app.py n'active pas le débogueur Flask.");

ajouter("python", "app.py", "fonction", "token_revoked", "token_revoked(en-tête, payload)",
  "Invalide un jeton déjà émis.",
  "Fonction interne de create_app. Elle refuse le cookie si le compte a disparu, s'il est suspendu, ou si la session a été fermée. Le rôle n'est pas dans le jeton : la base est relue.");

ajouter("python", "app.py", "fonction", "site_en_pause", "site_en_pause()",
  "Arrête les visites quand le propriétaire a suspendu le site.",
  "Fonction interne de create_app. Elle appelle bloquer_si_suspendu avant chaque requête. Le propriétaire continue de passer pour pouvoir rouvrir le site.");

ajouter("python", "app.py", "fonction", "missing_token", "missing_token(raison)",
  "Répond quand aucun cookie de session n'est présent.",
  "Une page HTML est renvoyée vers la connexion. Un appel JavaScript reçoit un JSON 401. Si le message parle du CSRF, le texte demande de recharger la page.");

ajouter("python", "app.py", "fonction", "invalid_token", "invalid_token(raison)",
  "Répond quand le cookie de session est illisible.",
  "Même séparation : page de connexion pour le navigateur, JSON pour le script.");

ajouter("python", "app.py", "fonction", "expired_token", "expired_token(en-tête, payload)",
  "Répond quand les 8 heures de session sont passées.",
  "Il faut se reconnecter. Le cookie n'est pas prolongé tout seul.");

ajouter("python", "app.py", "fonction", "revoked_token", "revoked_token(en-tête, payload)",
  "Répond quand le compte est suspendu ou la session fermée.",
  "Le message dit que le compte est suspendu ou indisponible.");

ajouter("python", "app.py", "fonction", "security_headers", "security_headers(réponse)",
  "Ajoute les en-têtes qui limitent les fuites et l'intégration de la page.",
  "Elle note la présence, interdit le sniffing du type de fichier, interdit l'iframe, et pose une politique de contenu qui n'accepte que les scripts et styles du site. Les pages de compte ne sont pas mises en cache.");

ajouter("python", "app.py", "fonction", "not_found", "not_found(erreur)",
  "Répond 404 quand la page n'existe pas.",
  "Le texte est « Page introuvable », en HTML ou en JSON selon l'appel.");

ajouter("python", "app.py", "fonction", "too_large", "too_large(erreur)",
  "Refuse un envoi de plus de 100 Mo.",
  "Le code HTTP est 413.");

ajouter("python", "app.py", "fonction", "unexpected", "unexpected(erreur)",
  "Attrape une erreur imprévue.",
  "Les erreurs HTTP et les erreurs de jeton gardent leur message. Le reste est journalisé et renvoyé comme « Erreur interne », sans le détail technique au visiteur.");

ajouter("python", "app.py", "fonction", "root", "root()",
  "Ouvre l'accueil depuis l'adresse nue.",
  "GET / redirige vers /accueil.");

ajouter("python", "app.py", "fonction", "accueil", "accueil()",
  "Affiche la page principale.",
  "GET /accueil rend le modèle index.html. Le choix du cours et les fiches sont chargés ensuite par le JavaScript.");

ajouter("python", "app.py", "fonction", "upload_file", "upload_file(matière, classe, spécialité)",
  "Publie une fiche pour le compte connecté.",
  "POST /upload/.... Le compte doit exister et ne pas être suspendu. L'auteur enregistré est toujours l'identifiant du compte, jamais une valeur du formulaire.");

ajouter("python", "app.py", "fonction", "download_file", "download_file(matière, classe, spécialité, identifiant)",
  "Envoie le fichier en téléchargement.",
  "GET /download/.... La consultation reste possible sans compte. Le nom d'origine est nettoyé et le type annoncé est neutre, pour que le navigateur n'ouvre pas le document comme une page. Si un compte est connecté, le téléchargement est mémorisé.");

ajouter("python", "app.py", "fonction", "_un_seul_proprietaire", "_un_seul_proprietaire()",
  "Garde un seul propriétaire.",
  "S'il en existe plusieurs au démarrage, le plus ancien reste propriétaire et les autres deviennent administrateurs. Sur SQLite, un index unique empêche d'en créer un second.");

ajouter("python", "app.py", "fonction", "_colonne_commentaire_corrigee", "_colonne_commentaire_corrigee()",
  "Met à jour une base déjà créée.",
  "Si la table des commentaires existe sans la colonne corrected, elle l'ajoute. Cette colonne dit que la personne qui suit un commentaire a ensuite modifié la fiche.");

ajouter("python", "app.py", "fonction", "_noter_presence", "_noter_presence()",
  "Met à jour la dernière activité de la session.",
  "Après la requête, si un jeton a été vérifié, la date « vu » de cette session est avancée. Les fichiers statiques ne comptent pas.");

ajouter("python", "database/model.py", "fonction", "generate_uuid", "generate_uuid()",
  "Crée un identifiant de compte.",
  "C'est un UUID version 4, distinct de l'identifiant d'une fiche.");

ajouter("python", "database/model.py", "fonction", "__repr__", "User.__repr__()",
  "Texte court utilisé dans les journaux.",
  "Affiche <User identifiant>. Ne montre ni le mot de passe ni les listes de fiches.");

ajouter("python", "database/model.py", "classe", "User", "User",
  "Un compte : élève, modérateur, administrateur ou propriétaire.",
  "Champs utiles : nom, prénom, identifiant unique, mot de passe hashé, rôle, suspension, must_change_password, listes JSON des fiches envoyées et téléchargées. Le mot de passe en clair n'est jamais stocké. must_change_password est vrai tant que la personne n'a pas choisi elle-même son mot de passe. Le rôle owner est unique.");

ajouter("python", "database/model.py", "classe", "Presence", "Presence",
  "Une session ouverte.",
  "La clé est le jti du jeton, pas un second secret. On retient le compte, l'ouverture, la dernière activité, l'expiration, le navigateur, et si la session a été révoquée.");

ajouter("python", "database/model.py", "classe", "Star", "Star",
  "Une étoile d'un compte sur une fiche.",
  "Le couple compte + fiche est unique. Un même élève ne peut donc pas étoiler deux fois la même fiche.");

ajouter("python", "database/model.py", "classe", "Comment", "Comment",
  "Un commentaire sur une fiche.",
  "audience vaut auteur (tous les élèves), equipe (modération) ou les_deux. status vaut ouvert, pris, puis valide. handler_id est la seule personne qui suit le commentaire. corrected devient vrai après que cette personne a modifié la fiche.");

ajouter("python", "utils/security.py", "fonction", "segment_ok", "segment_ok(nom)",
  "Accepte un nom de dossier de cours.",
  "Lettres, chiffres, tiret et souligné, 80 caractères maximum. Les points, les barres et « .. » sont refusés.");

ajouter("python", "utils/security.py", "fonction", "is_uuid", "is_uuid(valeur)",
  "Vérifie un identifiant de fiche ou de compte.",
  "Seuls les UUID version 4 en minuscules, tels que le site les crée, sont acceptés.");

ajouter("python", "utils/security.py", "fonction", "clean_text", "clean_text(valeur, longueur max)",
  "Nettoie un titre, une description ou un commentaire.",
  "Retourne None si ce n'est pas un texte, s'il est vide, trop long, ou s'il contient un caractère nul.");

ajouter("python", "utils/security.py", "fonction", "extension_allowed", "extension_allowed(nom de fichier)",
  "Dit si le suffixe est autorisé.",
  "PDF, textes, images, documents bureautiques et zip. Le HTML, le SVG et le JavaScript sont exclus.");

ajouter("python", "utils/security.py", "fonction", "valid_stored_name", "valid_stored_name(identifiant, nom stocké)",
  "Vérifie le nom interne dans uploads/.",
  "Il doit commencer par l'identifiant de la fiche, rester un simple nom de fichier, et garder une extension autorisée.");

ajouter("python", "utils/security.py", "fonction", "stored_name", "stored_name(identifiant, nom d'origine)",
  "Construit le nom unique du fichier stocké.",
  "Forme : identifiant_nom sûr. Retourne None si le type est interdit.");

ajouter("python", "utils/security.py", "fonction", "project_dir", "project_dir(dossier)",
  "Donne le chemin réel d'un dossier du projet.",
  "Sert à comparer les chemins après résolution, pour empêcher une sortie de matiere/ ou de uploads/.");

ajouter("python", "utils/security.py", "fonction", "valid_category", "valid_category(matière, classe, spécialité)",
  "Retrouve le dossier du cours s'il existe vraiment.",
  "Les liens symboliques sont refusés. Le dossier doit être exactement matière / classe / spécialité sous matiere/.");

ajouter("python", "utils/security.py", "fonction", "metadata_path", "metadata_path(dossier, identifiant)",
  "Chemin du JSON de la fiche.",
  "Le fichier doit rester dans le dossier du cours. Un identifiant invalide donne None.");

ajouter("python", "utils/security.py", "fonction", "upload_path", "upload_path(nom stocké)",
  "Chemin du fichier dans uploads/.",
  "Retourne None si le nom tente de remonter d'un dossier.");

ajouter("python", "utils/files.py", "fonction", "location_cache", "location_cache(identifiant, fichier, matière, classe, spécialité)",
  "Petit rappel stocké sur le compte.",
  "Il indique où retrouver la fiche. Il ne contient pas le contenu du document.");

ajouter("python", "utils/files.py", "fonction", "public_metadata", "public_metadata(métadonnées)",
  "Champs montrés sur une carte.",
  "Identifiant, titre, auteur, description, nom d'origine, matière, classe, spécialité. Le nom interne du disque n'est pas inclus.");

ajouter("python", "utils/files.py", "fonction", "read_metadata", "read_metadata(chemin)",
  "Charge le JSON d'une fiche.",
  "Retourne None si le fichier est illisible ou si l'identifiant n'est pas un UUID valide.");

ajouter("python", "utils/files.py", "fonction", "_remove_file", "_remove_file(chemin)",
  "Supprime un fichier s'il existe.",
  "Une erreur disque est écrite dans le journal, pas montrée telle quelle au visiteur.");

ajouter("python", "utils/files.py", "fonction", "_propagate_downloads", "_propagate_downloads(identifiant, rappel)",
  "Met à jour le rappel chez ceux qui ont déjà téléchargé la fiche.",
  "Après un déplacement de catégorie ou un nouveau fichier, leur historique pointe encore au bon endroit.");

ajouter("python", "utils/files.py", "fonction", "files_from_cache", "files_from_cache(identifiants, rappel)",
  "Reconstruit les fiches visibles d'un compte.",
  "Une fiche absente du disque est ignorée. On ne montre donc pas un téléchargement dont le fichier a été supprimé, une fois la page rechargée.");

ajouter("python", "utils/files.py", "fonction", "owner_of", "owner_of(identifiant)",
  "Retrouve le compte auteur d'une fiche.",
  "L'auteur du JSON doit exister, et la fiche doit figurer dans ses envois. Sinon l'action est refusée.");

ajouter("python", "utils/files.py", "fonction", "store_upload", "store_upload(compte, matière, classe, spécialité, fichier, titre, description)",
  "Enregistre une nouvelle fiche.",
  "Vérifie le cours, le titre, la description et le type. Écrit le fichier, puis le JSON, puis le compte. Si la base échoue, le fichier et le JSON sont retirés. L'auteur est le compte connecté.");

ajouter("python", "utils/files.py", "fonction", "_noter_suivi", "_noter_suivi(acteur, identifiant)",
  "Débloque le retrait des commentaires suivis par ce compte.",
  "Après une modification réussie de la fiche, les commentaires que ce compte suit passent corrected à vrai. La modification d'une autre personne ne compte pas.");

ajouter("python", "utils/files.py", "fonction", "update_file", "update_file(auteur, identifiant, formulaire, fichier, acteur)",
  "Modifie le texte, le cours, et éventuellement le document.",
  "L'auteur affiché ne change pas. acteur est la personne qui enregistre : élève, modérateur, admin ou propriétaire. C'est lui qui pourra retirer le commentaire qu'il suit.");

ajouter("python", "utils/files.py", "fonction", "remove_file", "remove_file(auteur, identifiant)",
  "Retire la fiche du compte, puis du disque.",
  "Les étoiles et les commentaires de cette fiche sont supprimés dans la même transaction. Le JSON et le document partent ensuite.");

ajouter("python", "utils/files.py", "fonction", "resolve_download", "resolve_download(matière, classe, spécialité, identifiant)",
  "Prépare un téléchargement.",
  "Vérifie l'identifiant, le cours, la cohérence du JSON et la présence du fichier. Le nom proposé au navigateur est nettoyé.");

ajouter("python", "utils/files.py", "fonction", "remember_download", "remember_download(compte, identifiant, rappel)",
  "Ajoute la fiche à l'historique du compte.",
  "Un compte suspendu n'est pas mis à jour. Un second téléchargement ne duplique pas la ligne, il rafraîchit le rappel.");

ajouter("python", "utils/catalogue.py", "fonction", "_conforme", "_conforme(méta, matière, classe, spécialité, identifiant)",
  "Vérifie qu'un JSON est bien dans son dossier.",
  "L'identifiant et les trois niveaux du cours doivent correspondre au fichier lu.");

ajouter("python", "utils/catalogue.py", "fonction", "toutes_les_fiches", "toutes_les_fiches()",
  "Liste les fiches valides du disque.",
  "Ignore les JSON illisibles, les identifiants douteux et les fiches dont le contenu ne correspond pas au dossier.");

ajouter("python", "utils/catalogue.py", "fonction", "trouver_fiche", "trouver_fiche(identifiant)",
  "Retrouve une fiche par son identifiant.",
  "S'il y a zéro ou plusieurs JSON pour le même identifiant, le résultat est None. On ne choisit pas au hasard.");

ajouter("python", "utils/catalogue.py", "fonction", "vue_publique", "vue_publique(méta)",
  "Prépare les champs publics d'une fiche.",
  "Même forme que public_metadata. Le nom interne du disque n'est pas recopié.");

ajouter("python", "utils/catalogue.py", "fonction", "taille_octets", "taille_octets(méta)",
  "Taille du document envoyé.",
  "Retourne 0 si le nom stocké est douteux, si le fichier manque, ou si c'est un lien symbolique.");

ajouter("python", "utils/etoiles.py", "fonction", "_maintenant", "_maintenant()",
  "Heure UTC utilisée pour une étoile.",
  "La date est stockée sans fuseau, comme le reste de la base.");

ajouter("python", "utils/etoiles.py", "fonction", "compter", "compter(identifiants)",
  "Nombre d'étoiles par fiche.",
  "Les identifiants inconnus valent zéro. Le résultat ne dit pas qui a voté.");

ajouter("python", "utils/etoiles.py", "fonction", "deja_etoilees", "deja_etoilees(compte, identifiants)",
  "Quelles fiches ce compte a déjà étoilées.",
  "Sert à afficher l'étoile pleine seulement pour la personne qui regarde.");

ajouter("python", "utils/etoiles.py", "fonction", "annoter", "annoter(fiches, compte)",
  "Ajoute etoiles et etoile_moi sur des cartes.",
  "etoiles est le total public. etoile_moi est vrai seulement pour le compte connecté.");

ajouter("python", "utils/etoiles.py", "fonction", "nombre_pour", "nombre_pour(identifiant)",
  "Total d'étoiles d'une fiche.",
  "Raccourci de compter pour une seule fiche.");

ajouter("python", "utils/etoiles.py", "fonction", "basculer", "basculer(compte, identifiant)",
  "Pose l'étoile, ou la retire si elle est déjà posée.",
  "La fiche doit exister. Deux clics simultanés ne créent pas deux lignes grâce à la contrainte unique.");

ajouter("python", "utils/etoiles.py", "fonction", "_courte", "_courte(méta, étoiles)",
  "Résumé d'une fiche pour le classement.",
  "Titre, auteur, cours et nombre d'étoiles. Pas de nom de fichier interne.");

ajouter("python", "utils/etoiles.py", "fonction", "classement", "classement()",
  "La fiche la plus étoilée, et les têtes de chaque matière.",
  "Une matière n'apparaît que si au moins une fiche a une étoile. En cas d'égalité dans la matière, toutes les fiches à ce maximum sont gardées. Le classement global n'en retient qu'une, par le titre puis l'identifiant.");

ajouter("python", "utils/commentaires.py", "fonction", "_maintenant", "_maintenant()",
  "Heure UTC d'un commentaire.",
  "Même convention que les étoiles et les sessions.");

ajouter("python", "utils/commentaires.py", "fonction", "_equipe", "_equipe(compte)",
  "Vrai pour un modérateur, un admin ou le propriétaire non suspendu.",
  "Sert à décider qui voit un commentaire d'équipe et qui peut le valider.");

ajouter("python", "utils/commentaires.py", "fonction", "_auteur_fiche", "_auteur_fiche(méta)",
  "Identifiant affiché de l'auteur de la fiche.",
  "Chaîne vide si le JSON n'a pas d'auteur exploitable.");

ajouter("python", "utils/commentaires.py", "fonction", "peut_voir", "peut_voir(compte, commentaire, auteur de la fiche)",
  "Décide qui lit un commentaire.",
  "L'auteur du commentaire le voit toujours. audience auteur : tous les élèves. audience equipe : modérateur, admin, propriétaire. audience les_deux : les élèves et l'équipe. Un compte suspendu ne lit rien.");

ajouter("python", "utils/commentaires.py", "fonction", "_peut_suivre", "_peut_suivre(compte, auteur de la fiche)",
  "Qui peut cliquer sur « Je m'en occupe ».",
  "L'auteur de la fiche, ou un membre de l'équipe. Un autre élève peut lire et écrire, mais pas suivre le commentaire.");

ajouter("python", "utils/commentaires.py", "fonction", "_responsable_actif", "_responsable_actif(identifiant)",
  "Le compte qui suit est-il encore capable d'agir.",
  "Non s'il a disparu ou s'il est suspendu. Le propriétaire du site ne reprend la validation que dans ce cas.");

ajouter("python", "utils/commentaires.py", "fonction", "peut_prendre", "peut_prendre(compte, commentaire, auteur)",
  "Le bouton « Je m'en occupe » peut-il s'afficher.",
  "Le commentaire doit être ouvert, sans responsable, visible, et le compte doit avoir le droit de suivre.");

ajouter("python", "utils/commentaires.py", "fonction", "peut_retirer", "peut_retirer(compte, commentaire, auteur)",
  "Le bouton « Retirer » peut-il s'afficher.",
  "Seulement pour la personne qui suit, et seulement après qu'elle a modifié la fiche.");

ajouter("python", "utils/commentaires.py", "fonction", "peut_valider", "peut_valider(compte, commentaire, auteur)",
  "Le bouton « Valider » peut-il s'afficher.",
  "Réservé à l'équipe. En temps normal, seul le responsable valide. Le propriétaire reprend si ce responsable n'est plus actif.");

ajouter("python", "utils/commentaires.py", "fonction", "_presenter", "_presenter(commentaire, compte, auteur)",
  "Forme JSON d'un commentaire pour la page.",
  "Texte, visibilité, statut, responsable, et les trois droits : suivre, valider, retirer. Les identifiants internes de compte ne sont pas envoyés.");

ajouter("python", "utils/commentaires.py", "fonction", "lister", "lister(compte, identifiant)",
  "Commentaires visibles sur une fiche.",
  "Un commentaire que le compte n'a pas le droit de lire n'est pas dans la liste. On ne révèle donc pas son existence.");

ajouter("python", "utils/commentaires.py", "fonction", "publier", "publier(compte, identifiant, texte, visibilité)",
  "Ajoute un commentaire sur n'importe quelle fiche existante.",
  "N'importe quel compte connecté peut le faire. La visibilité doit être auteur, equipe ou les_deux. Le texte est nettoyé, 2000 caractères maximum. Plafonds : 20 commentaires de ce compte sur la fiche, 30 par jour.");

ajouter("python", "utils/commentaires.py", "fonction", "prendre", "prendre(compte, fiche, commentaire)",
  "Réserve le commentaire.",
  "Une seule réservation peut réussir. La mise à jour en base exige que personne ne l'ait pris entre-temps. corrected repasse à faux : il faudra modifier la fiche après ce suivi.");

ajouter("python", "utils/commentaires.py", "fonction", "valider", "valider(compte, fiche, commentaire)",
  "Marque le commentaire comme traité.",
  "Seul le responsable, encore membre de l'équipe, peut le faire. Le propriétaire peut le faire si le responsable a disparu ou a été suspendu.");

ajouter("python", "utils/commentaires.py", "fonction", "retirer", "retirer(compte, fiche, commentaire)",
  "Efface le commentaire suivi.",
  "Refusé si ce n'est pas le suiveur, ou s'il n'a pas modifié la fiche depuis qu'il suit le commentaire. La suppression est refaite en base avec les mêmes conditions, pour éviter qu'un autre compte l'efface.");

ajouter("python", "utils/recherche.py", "fonction", "_contient", "_contient(valeur, aiguille)",
  "Recherche sans tenir compte des majuscules ni des accents de casse simples.",
  "Le caractère % n'est pas un joker : il est cherché tel quel.");

ajouter("python", "utils/recherche.py", "fonction", "_entier", "_entier(valeur, plafond)",
  "Lit un nombre d'étoiles minimum.",
  "Vide signifie « pas de filtre ». Un texte ou un nombre trop grand est refusé.");

ajouter("python", "utils/recherche.py", "fonction", "chercher_fiches", "chercher_fiches(arguments, compte)",
  "Cherche des fiches.",
  "Les critères remplis se cumulent : texte, matière, classe, spécialité, auteur, étoiles minimum. Le texte regarde le titre, la description, l'auteur, le nom du fichier et le cours. Au plus 80 résultats. Le nom interne du disque n'est pas renvoyé. Il faut au moins un critère.");

ajouter("python", "utils/recherche.py", "fonction", "chercher_comptes", "chercher_comptes(arguments)",
  "Cherche des comptes.",
  "Nom, prénom, identifiant, rôle ou état. Les critères se cumulent. Le mot de passe n'est jamais inclus. Au plus 100 comptes. L'appelant doit déjà avoir vérifié que le compte est modérateur, admin ou propriétaire.");

ajouter("python", "utils/access.py", "fonction", "home_for_role", "home_for_role(rôle)",
  "Page d'arrivée selon le rôle.",
  "Propriétaire : audit du site. Admin : espace administration. Modérateur : espace modération. Élève : son tableau de bord.");

ajouter("python", "utils/access.py", "fonction", "load_current_user", "load_current_user()",
  "Compte lié au jeton.",
  "None si le compte a été supprimé entre-temps.");

ajouter("python", "utils/access.py", "fonction", "optional_user", "optional_user()",
  "Compte connecté, ou None.",
  "Un cookie absent, expiré ou révoqué ne bloque pas une page publique : la personne est traitée comme non connectée. Sert aux étoiles « déjà posées par moi » sur les listes ouvertes.");

ajouter("python", "utils/access.py", "fonction", "require_user", "require_user()",
  "Exige un compte encore là et non suspendu.",
  "Retourne le compte, ou une réponse d'erreur.");

ajouter("python", "utils/access.py", "fonction", "require_roles", "require_roles(compte, rôles)",
  "Limite une page à certains rôles.",
  "Une navigation HTML est renvoyée vers l'espace du rôle réel. Un appel de script reçoit 403.");

ajouter("python", "utils/access.py", "fonction", "can_moderate", "can_moderate(acteur, cible)",
  "Qui peut suspendre qui.",
  "Personne ne se suspend soi-même. Le propriétaire est intouchable. Le propriétaire suspend les autres. Un admin suspend un élève ou un modérateur. Un modérateur suspend seulement un élève.");

ajouter("python", "utils/access.py", "fonction", "set_ban", "set_ban(acteur, identifiant, suspendu)",
  "Suspend ou réactive un compte.",
  "Le jeton déjà émis devient inutilisable grâce au contrôle de révocation. L'action est refusée si can_moderate dit non.");

ajouter("python", "utils/access.py", "fonction", "set_role", "set_role(acteur, identifiant, rôle)",
  "Change le rôle.",
  "Réservé à l'admin et au propriétaire. Le rôle propriétaire ne s'attribue pas ici. On ne modifie ni son propre rôle, ni le propriétaire. Il doit rester au moins un administrateur.");

ajouter("python", "utils/users.py", "fonction", "public_profile", "public_profile(compte, avec état)",
  "Champs d'un compte montrables à l'écran.",
  "Identifiant, nom, prénom, nom d'utilisateur, rôle, et si un nouveau mot de passe est encore obligatoire. L'état et la date arrivent seulement si on le demande. Jamais le mot de passe lui-même.");

ajouter("python", "utils/users.py", "fonction", "list_profiles", "list_profiles()",
  "Tous les comptes, triés par identifiant.",
  "Pour les pages de gestion. Même filtre : pas de secret.");

ajouter("python", "utils/http.py", "fonction", "wants_html", "wants_html()",
  "Distingue une page d'un appel de script.",
  "Les adresses /info, /upload et /download restent en JSON. Le reste dépend de l'en-tête Accept.");

ajouter("python", "utils/http.py", "fonction", "error_response", "error_response(message, code)",
  "Erreur lisible des deux côtés.",
  "Page simple pour le navigateur, JSON pour le script.");

ajouter("python", "utils/http.py", "fonction", "safe_next_url", "safe_next_url(valeur, défaut)",
  "N'accepte qu'un chemin interne après la connexion.",
  "Bloque les adresses vers un autre site, les doubles barres et les caractères de contrôle.");

ajouter("python", "utils/http.py", "fonction", "redirect_to_login", "redirect_to_login()",
  "Envoie vers la page de connexion.",
  "Le paramètre next reprend la page demandée, après nettoyage.");

ajouter("python", "utils/dir.py", "fonction", "list_names", "list_names(dossier, sorte)",
  "Liste les enfants d'un dossier de cours.",
  "sorte vaut dir ou file. Les fichiers cachés et les liens symboliques sont ignorés. Le dossier doit rester sous matiere/.");

ajouter("python", "utils/dir.py", "fonction", "child_dir", "child_dir(parent, nom)",
  "Ouvre un sous-dossier direct.",
  "None si le nom est invalide, absent, ou s'il sort de l'arborescence.");

ajouter("python", "utils/dir.py", "fonction", "find_metadata_path", "find_metadata_path(identifiant)",
  "Retrouve le JSON d'une fiche.",
  "S'il existe deux fichiers pour le même identifiant, retourne None.");

ajouter("python", "utils/json_utils.py", "fonction", "load_json_object", "load_json_object(chemin)",
  "Lit un objet JSON.",
  "None si le fichier est illisible ou n'est pas un objet.");

ajouter("python", "utils/json_utils.py", "fonction", "load_json_file", "load_json_file(chemin)",
  "Ancienne forme de lecture.",
  "Retourne un dictionnaire vide quand la lecture échoue.");

ajouter("python", "utils/json_utils.py", "fonction", "save_json_file", "save_json_file(chemin, données)",
  "Écrit un JSON sans le casser à moitié.",
  "Écriture dans un fichier temporaire, puis remplacement. Si le programme s'arrête au milieu, l'ancien JSON reste.");

ajouter("python", "utils/presence.py", "fonction", "_maintenant", "_maintenant()",
  "Heure UTC de la session.",
  "Datetime naïf, comme le reste de SQLite dans ce projet.");

ajouter("python", "utils/presence.py", "fonction", "_depuis_claim", "_depuis_claim(valeur)",
  "Convertit l'expiration du jeton en date.",
  "Accepte une date ou un nombre de secondes. Le résultat est en UTC sans fuseau.");

ajouter("python", "utils/presence.py", "fonction", "_iso", "_iso(moment)",
  "Date lisible pour le JSON.",
  "Forme 2026-10-20T10:00:00Z. None si la date manque.");

ajouter("python", "utils/presence.py", "fonction", "_agent", "_agent(valeur)",
  "Raccourcit le nom du navigateur.",
  "Au plus 240 caractères, pour la colonne de l'audit. Pas un secret.");

ajouter("python", "utils/presence.py", "fonction", "ouvrir_presence", "ouvrir_presence(compte, jeton, navigateur)",
  "Ouvre une ligne de session à la connexion.",
  "La clé est le jti du jeton. On retient l'ouverture, l'expiration et le navigateur.");

ajouter("python", "utils/presence.py", "fonction", "fermer_presence", "fermer_presence(jti)",
  "Marque la session comme révoquée à la déconnexion.",
  "Le cookie seul ne suffit plus : token_revoked le refuse.");

ajouter("python", "utils/presence.py", "fonction", "est_revoquee", "est_revoquee(jti)",
  "Dit si cette session a été fermée explicitement.",
  "Vrai seulement quand la ligne existe et qu'elle est marquée révoquée. Un jeton émis avant ce suivi, sans ligne, reste valable jusqu'à son expiration. Le ban du compte est vérifié à part.");

ajouter("python", "utils/presence.py", "fonction", "toucher_presence", "toucher_presence(jti)",
  "Avance la dernière activité, au plus une fois toutes les 30 secondes.",
  "Ne fait rien si une écriture en base est déjà en cours, si la session est inconnue, ou si elle est révoquée. Sert au badge « en ligne » de l'audit.");

ajouter("python", "utils/presence.py", "fonction", "resume_sessions", "resume_sessions()",
  "Résumé des sessions pour l'audit du propriétaire.",
  "Nombre de personnes, sessions ouvertes, déconnectées encore en base, et la liste avec le rôle et l'état en ligne (activité de moins de 15 minutes).");

ajouter("python", "utils/site_gate.py", "fonction", "_chemin", "_chemin()",
  "Fichier qui mémorise la suspension.",
  "SITE_STATUS_PATH si la variable existe, sinon instance/site_status.json.");

ajouter("python", "utils/site_gate.py", "fonction", "_ouvert", "_ouvert()",
  "État « le site fonctionne ».",
  "suspended faux, sans date ni auteur.");

ajouter("python", "utils/site_gate.py", "fonction", "lire_etat", "lire_etat()",
  "Lit l'état courant.",
  "Un fichier absent ou illisible veut dire : le site est ouvert. On ne bloque pas tout le lycée pour un JSON cassé.");

ajouter("python", "utils/site_gate.py", "fonction", "definir_suspension", "definir_suspension(suspendu, identifiant)",
  "Suspend ou rouvre le site.",
  "Une seconde suspension ne change pas la date de la première. L'écriture passe par un fichier temporaire.");

ajouter("python", "utils/site_gate.py", "fonction", "_date_lisible", "_date_lisible(iso)",
  "Date affichée sur la page de pause.",
  "Forme jour/mois/année et heure UTC. None si le texte n'est pas une date.");

ajouter("python", "utils/site_gate.py", "fonction", "_est_proprietaire", "_est_proprietaire()",
  "Vrai si le cookie courant est le propriétaire non suspendu.",
  "Une erreur de jeton ne bloque pas la requête : l'appelant décide ensuite. Sert à laisser passer le propriétaire pendant la pause.");

ajouter("python", "utils/site_gate.py", "fonction", "bloquer_si_suspendu", "bloquer_si_suspendu()",
  "Réponse 503 si le site est en pause.",
  "La connexion, la déconnexion et les fichiers statiques restent ouverts. Le propriétaire passe. Les autres reçoivent la page « Site suspendu » ou un JSON.");

ajouter("python", "utils/audit.py", "fonction", "_taille_dossier", "_taille_dossier(racine)",
  "Additionne la taille des vrais fichiers d'un dossier.",
  "Ignore les liens symboliques. Une erreur de lecture sur un fichier est sautée.");

ajouter("python", "utils/audit.py", "fonction", "_taille_base", "_taille_base()",
  "Taille du fichier SQLite.",
  "Zéro si la base n'est pas SQLite ou si le fichier est introuvable.");

ajouter("python", "utils/audit.py", "fonction", "_naive", "_naive(moment)",
  "Ramène une date en UTC sans fuseau.",
  "Pour comparer les dates de création des comptes.");

ajouter("python", "utils/audit.py", "fonction", "_compte", "_compte(utilisateur)",
  "Résumé « identifiant + date de création ».",
  "None si la date manque.");

ajouter("python", "utils/audit.py", "fonction", "_parcourir", "_parcourir()",
  "Parcourt matiere/ pour l'audit.",
  "Compte les cours, les JSON invalides, les doublons, les cours vides, et décrit chaque fiche valide : taille, extension, présence du fichier.");

ajouter("python", "utils/audit.py", "fonction", "_mesurer_uploads", "_mesurer_uploads(noms référencés)",
  "Mesure uploads/ et repère les orphelins.",
  "Un orphelin est un fichier présent dans uploads/ mais rattaché à aucune fiche valide.");

ajouter("python", "utils/audit.py", "fonction", "_crees_depuis", "_crees_depuis(durée)  — dans collecter_audit",
  "Compte les comptes créés depuis une durée.",
  "Fonction interne du relevé. Sert aux chiffres 24 h, 7 jours et 30 jours. Une date absente n'est pas comptée.");

ajouter("python", "utils/audit.py", "fonction", "collecter_audit", "collecter_audit()",
  "Tout le relevé du propriétaire.",
  "Stockage, sessions, comptes, activité, contenu, sécurité, et le classement des étoiles. Les chiffres viennent de la base et du disque. Rien n'est inventé.");

ajouter("python", "utils/audit.py", "fonction", "_fiche_courte", "_fiche_courte(fiche)",
  "Ligne courte pour les tableaux de l'audit.",
  "Titre, auteur, cours, taille, date.");

ajouter("python", "utils/audit.py", "fonction", "_demarrage", "_demarrage()",
  "Heure de démarrage du processus.",
  "Mémorisée une fois. Sert à afficher depuis combien de temps le serveur tourne.");

ajouter("python", "utils/audit_perso.py", "fonction", "_commentaires_visibles", "_commentaires_visibles(compte, fiches)",
  "Commentaires des fiches de ce compte qu'il a le droit de lire.",
  "Un commentaire réservé à l'équipe n'entre pas dans l'audit d'un élève.");

ajouter("python", "utils/audit_perso.py", "fonction", "collecter_audit_perso", "collecter_audit_perso(compte)",
  "Relevé limité aux fiches de la personne.",
  "Nombre, volume, étoiles reçues, téléchargements de ses fiches, commentaires visibles, fiche la plus étoilée. Aucune session des autres, aucune de leurs fiches.");

ajouter("python", "info/routes.py", "fonction", "get_matiere", "get_matiere()",
  "Liste des matières présentes sur le disque.",
  "GET /info/matiere. Public. Noms de dossiers seulement.");

ajouter("python", "info/routes.py", "fonction", "get_classe", "get_classe(matière)",
  "Classes d'une matière.",
  "Ordre scolaire : 2nd, 1ere, term, puis le reste. 404 si la matière n'existe pas.");

ajouter("python", "info/routes.py", "fonction", "get_specialite", "get_specialite(matière, classe)",
  "Spécialités d'un cours.",
  "404 si la matière ou la classe manque.");

ajouter("python", "info/routes.py", "fonction", "recherche", "recherche()",
  "Recherche publique de fiches.",
  "GET /info/recherche. Ajoute le nombre d'étoiles. etoile_moi seulement pour le compte qui regarde. Les champs matière, classe et spécialité restent acceptés par l'adresse, même s'ils ne sont plus dans le formulaire : le menu de cours sert à ça.");

ajouter("python", "info/routes.py", "fonction", "get_files", "get_files(matière, classe, spécialité)",
  "Fiches d'un cours.",
  "GET /info/files/.... Descriptifs et identifiants, plus le nombre d'étoiles. Le téléchargement passe par /download.");

ajouter("python", "fiches/routes.py", "fonction", "_connecte", "_connecte()",
  "Compte exigé pour étoiler ou commenter.",
  "Raccourci de require_user.");

ajouter("python", "fiches/routes.py", "fonction", "_id_invalide", "_id_invalide(identifiant)",
  "Refuse un identifiant qui n'est pas un UUID.",
  "Réponse 400 avant d'aller chercher la fiche.");

ajouter("python", "fiches/routes.py", "fonction", "_reponse", "_reponse(résultat, erreur, code)",
  "Transforme le couple des fonctions métier en réponse HTTP.",
  "Erreur JSON si le second élément est rempli, sinon le dictionnaire avec le code demandé.");

ajouter("python", "fiches/routes.py", "fonction", "etoile", "etoile(identifiant)",
  "Pose ou retire l'étoile du compte.",
  "POST /fiches/identifiant/etoile. Connexion et jeton CSRF obligatoires.");

ajouter("python", "fiches/routes.py", "fonction", "commentaires", "commentaires(identifiant)",
  "Liste les commentaires visibles.",
  "GET /fiches/identifiant/commentaires. Compte connecté obligatoire.");

ajouter("python", "fiches/routes.py", "fonction", "ajouter_commentaire", "ajouter_commentaire(identifiant)",
  "Publie un commentaire.",
  "POST avec le JSON texte et audience. Un corps de plus de 16 Ko est refusé avant lecture complète du texte.");

ajouter("python", "fiches/routes.py", "fonction", "prendre_commentaire", "prendre_commentaire(fiche, commentaire)",
  "Le premier compte autorisé qui appelle cette adresse s'en charge.",
  "POST .../prendre.");

ajouter("python", "fiches/routes.py", "fonction", "valider_commentaire", "valider_commentaire(fiche, commentaire)",
  "Valide le commentaire.",
  "POST .../valider. Réservé au responsable.");

ajouter("python", "fiches/routes.py", "fonction", "retirer_commentaire", "retirer_commentaire(fiche, commentaire)",
  "Retire le commentaire.",
  "DELETE .../commentaire. Même compte que le suivi, et fiche déjà modifiée par lui.");

ajouter("python", "users/routes.py", "fonction", "dashboard", "dashboard()",
  "Tableau de bord de l'élève.",
  "Ses envois et ses téléchargements, avec le nombre d'étoiles. Le lien vers l'audit personnel est sur la page.");

ajouter("python", "users/routes.py", "fonction", "audit_page", "audit_page()",
  "Page d'audit de ses fiches.",
  "GET /users/audit. Le relevé ne contient que les fiches de ce compte.");

ajouter("python", "users/routes.py", "fonction", "audit_json", "audit_json()",
  "Même relevé, pour le bouton Actualiser.",
  "GET /users/audit.json. Pas d'identifiant dans l'adresse : on ne peut pas demander l'audit d'un autre.");

ajouter("python", "users/routes.py", "fonction", "modify_file", "modify_file(identifiant)",
  "Formulaire de modification d'une fiche de l'élève.",
  "La fiche doit être dans ses envois et il doit en être l'auteur.");

ajouter("python", "users/routes.py", "fonction", "save_modified_file", "save_modified_file(identifiant)",
  "Enregistre la modification de l'élève.",
  "L'acteur du suivi de commentaire est l'élève lui-même.");

ajouter("python", "users/routes.py", "fonction", "delete_file", "delete_file(identifiant)",
  "Supprime une fiche de l'élève.",
  "Passe par remove_file. Le JavaScript recharge ensuite la page.");

ajouter("python", "moderator/routes.py", "fonction", "_staff_only", "_staff_only()",
  "Laisse passer modérateur, admin et propriétaire.",
  "Un élève est renvoyé vers son espace.");

ajouter("python", "moderator/routes.py", "fonction", "dashboard", "dashboard()",
  "Page pour parcourir et modérer les fiches.",
  "Même modèle que l'administration, avec le préfixe /moderator.");

ajouter("python", "moderator/routes.py", "fonction", "comptes_page", "comptes_page()",
  "Liste des comptes pour le modérateur.",
  "La suspension d'un élève est proposée. Le changement de rôle ne l'est pas.");

ajouter("python", "moderator/routes.py", "fonction", "recherche_comptes", "recherche_comptes()",
  "Recherche de comptes côté modération.",
  "GET /moderator/comptes/recherche. Un élève reçoit 403.");

ajouter("python", "moderator/routes.py", "fonction", "modify_file", "modify_file(identifiant)",
  "Formulaire de modération d'une fiche.",
  "Quel que soit l'auteur, si la fiche existe.");

ajouter("python", "moderator/routes.py", "fonction", "save_modified_file", "save_modified_file(identifiant)",
  "Enregistre la modération.",
  "L'auteur d'origine est conservé. L'acteur du commentaire suivi est le modérateur connecté.");

ajouter("python", "moderator/routes.py", "fonction", "delete_file", "delete_file(identifiant)",
  "Supprime une fiche.",
  "La retire aussi du compte de son auteur.");

ajouter("python", "moderator/routes.py", "fonction", "ban_user", "ban_user(identifiant)",
  "Suspend un élève.",
  "Un modérateur ou un administrateur est protégé par can_moderate.");

ajouter("python", "moderator/routes.py", "fonction", "unban_user", "unban_user(identifiant)",
  "Réactive un élève.",
  "Même limite de rôle que la suspension.");

ajouter("python", "admin/routes.py", "fonction", "_admin_only", "_admin_only()",
  "Laisse passer l'administrateur et le propriétaire.",
  "Le modérateur est renvoyé vers son espace.");

ajouter("python", "admin/routes.py", "fonction", "dashboard", "dashboard()",
  "Espace administration.",
  "Parcours des fiches, recherche, lien vers les comptes.");

ajouter("python", "admin/routes.py", "fonction", "comptes_page", "comptes_page()",
  "Gestion des comptes.",
  "Changement de rôle et suspension. Le propriétaire du site y a aussi accès.");

ajouter("python", "admin/routes.py", "fonction", "recherche_comptes", "recherche_comptes()",
  "Recherche de comptes pour l'admin et le propriétaire.",
  "GET /admin/comptes/recherche. Le modérateur utilise sa propre adresse.");

ajouter("python", "admin/routes.py", "fonction", "modify_file", "modify_file(identifiant)",
  "Formulaire de modification, quel qu'en soit l'auteur.",
  "Même garde que la modération.");

ajouter("python", "admin/routes.py", "fonction", "save_modified_file", "save_modified_file(identifiant)",
  "Enregistre la modification admin.",
  "L'auteur affiché ne change pas. L'acteur du suivi est l'admin ou le propriétaire connecté.");

ajouter("python", "admin/routes.py", "fonction", "delete_file", "delete_file(identifiant)",
  "Supprime une fiche depuis l'administration.",
  "Retire aussi les rappels, étoiles et commentaires.");

ajouter("python", "admin/routes.py", "fonction", "ban_user", "ban_user(identifiant)",
  "Suspend un élève ou un modérateur.",
  "Pas un autre admin, pas le propriétaire, pas soi-même.");

ajouter("python", "admin/routes.py", "fonction", "unban_user", "unban_user(identifiant)",
  "Réactive un compte suspendu.",
  "Mêmes limites que la suspension.");

ajouter("python", "admin/routes.py", "fonction", "change_role", "change_role(identifiant)",
  "Donne le rôle élève, modérateur ou administrateur.",
  "Le corps JSON est { role }. Le rôle propriétaire est refusé.");

ajouter("python", "owner/routes.py", "fonction", "_owner_only", "_owner_only()",
  "Réservé au propriétaire.",
  "Les autres rôles sont renvoyés vers leur espace.");

ajouter("python", "owner/routes.py", "fonction", "audit_page", "audit_page()",
  "Page d'audit du site.",
  "GET /owner/audit. Les chiffres du premier affichage sont déjà dans la page.");

ajouter("python", "owner/routes.py", "fonction", "audit_json", "audit_json()",
  "Relevé pour actualiser sans recharger.",
  "GET /owner/audit.json. Inclut le classement des étoiles.");

ajouter("python", "owner/routes.py", "fonction", "basculer_site", "basculer_site()",
  "Suspend ou réactive le site.",
  "POST /owner/site avec { suspendu: true ou false }. Toute autre forme est refusée.");

ajouter("python", "auth/routes.py", "fonction", "_max_attempts", "_max_attempts()",
  "Nombre d'échecs de mot de passe tolérés.",
  "LOGIN_MAX_ATTEMPTS, sinon 8. Une valeur illisible retombe sur 8. Le minimum est 1.");

ajouter("python", "auth/routes.py", "fonction", "_attempt_key", "_attempt_key(identifiant)",
  "Clé de suivi des échecs.",
  "Identifiant en minuscules, 80 caractères maximum.");

ajouter("python", "auth/routes.py", "fonction", "login_blocked", "login_blocked(identifiant)",
  "Vrai si cet identifiant a trop échoué en 10 minutes.",
  "Le compteur est par identifiant, pas par adresse IP : derrière l'école, tout le monde peut partager la même IP.");

ajouter("python", "auth/routes.py", "fonction", "login_failed", "login_failed(identifiant)",
  "Mémorise un échec.",
  "La liste est en mémoire du processus. Un redémarrage la vide.");

ajouter("python", "auth/routes.py", "fonction", "login_succeeded", "login_succeeded(identifiant)",
  "Oublie les échecs après une bonne connexion.",
  "Le compteur de cet identifiant repart à zéro.");

ajouter("python", "auth/routes.py", "fonction", "etat_tentatives", "etat_tentatives()",
  "Identifiants encore suivis ou bloqués.",
  "Pour la partie sécurité de l'audit du propriétaire. Pas les mots de passe.");

ajouter("python", "auth/routes.py", "fonction", "login", "login()",
  "Vérifie l'identifiant et pose le cookie.",
  "POST /auth/login. Le message d'erreur est le même si le compte n'existe pas ou si le mot de passe est faux. Un compte suspendu est refusé. Pendant une pause, seul le propriétaire entre. Le cookie est HttpOnly. Si le mot de passe doit encore être choisi, home vaut /auth/mot-de-passe.");

ajouter("python", "auth/routes.py", "fonction", "me", "me()",
  "Décrit le compte connecté.",
  "GET /auth/me. Sert au menu : nom, rôle, lien vers le bon espace.");

ajouter("python", "auth/routes.py", "fonction", "login_page", "login_page()",
  "Affiche le formulaire de connexion.",
  "Le paramètre next est nettoyé avant d'être donné au script. La page prévient si le site est suspendu.");

ajouter("python", "auth/routes.py", "fonction", "logout_page", "logout_page()",
  "Page de confirmation avant de sortir.",
  "Il faut être connecté.");

ajouter("python", "auth/routes.py", "fonction", "logout", "logout()",
  "Ferme la session.",
  "Révoque la présence, efface le cookie de session et le cookie CSRF.");

ajouter("python", "init_users.py", "fonction", "assurer_compte", "assurer_compte(compte)",
  "Crée ou remet à jour un compte de démonstration.",
  "Si le rôle demandé est propriétaire, les autres propriétaires redeviennent administrateurs avant l'écriture, pour respecter l'index unique. Le mot de passe de démonstration oblige un changement à la prochaine connexion.");

ajouter("python", "init_users.py", "fonction", "main", "main()",
  "Prépare les quatre comptes de test.",
  "Élève, modérateur, admin, propriétaire. À relancer autant de fois qu'on veut : ces identifiants retrouvent le mot de passe du script. Il n'y a pas d'inscription publique.");

ajouter("python", "make_structure.py", "fonction", "make_structure", "make_structure(structure)",
  "Crée les dossiers matiere/matière/classe/spécialité.",
  "Ne supprime pas ce qui existe déjà. Les noms viennent du dictionnaire du script.");

ajouter("python", "make_structure.py", "fonction", "main", "main()",
  "Lance la création de l'arborescence scolaire.",
  "À lancer une fois sur une machine neuve, avant les premiers envois.");

ajouter("python", "tests/test_flows.py", "fonction", "verifier", "verifier(condition, message)",
  "Arrête le test si la condition est fausse.",
  "Le message dit ce qui aurait dû se passer.");

ajouter("python", "tests/test_flows.py", "fonction", "suivre", "suivre(chemin)",
  "Retient un fichier créé par le test.",
  "Il sera effacé à la fin, même si une assertion casse.");

ajouter("python", "tests/test_flows.py", "fonction", "nettoyer", "nettoyer()",
  "Supprime les fichiers de test et la base temporaire.",
  "Ne touche pas aux fiches déjà présentes hors de la liste suivie.");

ajouter("python", "tests/test_flows.py", "fonction", "csrf", "csrf(client)",
  "Lit le cookie CSRF après la connexion.",
  "Les actions qui modifient quelque chose doivent l'envoyer.");

ajouter("python", "tests/test_flows.py", "fonction", "connecter", "connecter(client, identifiant, mot de passe)",
  "Ouvre une session de test.",
  "Vérifie que la connexion répond 200, puis retourne les en-têtes CSRF.");

ajouter("python", "tests/test_flows.py", "fonction", "creer_compte", "creer_compte(identifiant, rôle)",
  "Crée un compte dans la base de test.",
  "Mot de passe fixe de test, rôle demandé, listes vides.");

ajouter("python", "tests/test_flows.py", "fonction", "verifier_social", "verifier_social(client propriétaire)",
  "Vérifie étoiles, recherches, commentaires et audits.",
  "Un autre élève peut commenter une fiche qui n'est pas la sienne. La visibilité élève, équipe ou les deux est contrôlée. Le retrait n'est possible qu'après modification par le suiveur. Un second propriétaire est refusé.");

ajouter("python", "tests/test_flows.py", "fonction", "enregistrer", "enregistrer(client, en-têtes, préfixe, titre)  — dans verifier_social",
  "Envoie une modification de fiche pendant les tests.",
  "Sert à prouver qu'un commentaire ne se retire qu'après l'enregistrement par la personne qui le suit.");

ajouter("python", "tests/test_flows.py", "fonction", "scenario", "scenario()",
  "Parcours complet du site.",
  "Pages, connexion, publication, droits, chemins interdits, pause du site, puis le bloc social.");

ajouter("python", "app.py", "fonction", "_colonne_mot_de_passe", "_colonne_mot_de_passe()",
  "Ajoute must_change_password aux bases déjà créées.",
  "Les comptes déjà présents ne sont pas forcés. Les nouveaux comptes ont le drapeau à vrai grâce au modèle.");

ajouter("python", "app.py", "fonction", "mot_de_passe_a_choisir", "mot_de_passe_a_choisir()",
  "Avant chaque requête, ferme le site tant que le mot de passe n'est pas choisi.",
  "Fonction interne de create_app. Elle appelle forcer_mot_de_passe. La page de choix, la déconnexion et la connexion restent ouvertes.");

ajouter("python", "utils/access.py", "fonction", "forcer_mot_de_passe", "forcer_mot_de_passe()",
  "Bloque tout sauf le choix du mot de passe.",
  "Si le compte connecté a encore must_change_password, une page HTML est renvoyée vers /auth/mot-de-passe. Un appel de script reçoit 403. Sans session, ou une fois le mot de passe choisi, la requête continue.");

ajouter("python", "auth/routes.py", "fonction", "_refus_mot_de_passe", "_refus_mot_de_passe(compte, actuel, nouveau, confirmation)",
  "Contrôle le nouveau mot de passe.",
  "L'ancien doit être le bon. Les deux saisies du nouveau doivent être identiques, faire au moins 10 caractères, différer de l'ancien et de l'identifiant. Trop d'essais sur l'ancien bloque comme à la connexion. None si tout est acceptable.");

ajouter("python", "auth/routes.py", "fonction", "mot_de_passe_page", "mot_de_passe_page()",
  "Affiche le formulaire de mot de passe.",
  "GET /auth/mot-de-passe. Le texte change : première connexion, ou changement quand on veut. Il faut être connecté.");

ajouter("python", "auth/routes.py", "fonction", "changer_mot_de_passe", "changer_mot_de_passe()",
  "Enregistre le nouveau mot de passe.",
  "POST /auth/mot-de-passe avec actuel, nouveau et confirmation en JSON, plus le jeton CSRF. Le hash remplace l'ancien. must_change_password repasse à faux. La réponse indique la page d'accueil du rôle.");

ajouter("python", "tests/test_flows.py", "fonction", "verifier_mot_de_passe", "verifier_mot_de_passe()",
  "Vérifie le blocage de la première connexion et le changement libre.",
  "Un compte obligé ne lit pas les fiches avant d'avoir choisi un mot de passe. Un mot trop court, différent de sa confirmation, ou avec un ancien faux est refusé. Ensuite il peut le changer encore, puis se reconnecter avec le dernier.");
