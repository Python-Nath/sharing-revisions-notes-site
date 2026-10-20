/* Pages HTML. Elles décrivent la structure, pas une adresse du serveur à appeler depuis ici. */

ajouter("html", "templates/base.html", "page", "Squelette commun", "templates/base.html",
  "Le cadre de toutes les pages : langue, titre, menu, contenu, pied et bandeau cookies.",
  "Le lien « Aller au contenu » sert à sauter le menu au clavier. La barre a la marque Fiches, le lien Accueil, et une zone nav-compte remplie par le JavaScript. Le pied porte les quatre liens légaux. Le bandeau cookies est caché tant que le navigateur n'a pas mémorisé l'accusé. Le style vient de static/style.css. Le script commun est chargé avant le script propre à la page.");

ajouter("html", "templates/index.html", "page", "Accueil", "templates/index.html",
  "Choisir un cours, chercher une fiche, lire les cartes, publier.",
  "Le sélecteur de cours est au-dessus. La recherche n'a plus matière, classe ni spécialité : ces trois choix sont dans le menu. Restent le texte, l'auteur et le minimum d'étoiles. La liste suit la saisie, sans bouton Rechercher. Le formulaire d'envoi est caché tant qu'on n'est pas connecté. L'auteur n'est pas demandé : le serveur prend le compte.");

ajouter("html", "templates/user_dashboard.html", "page", "Espace élève", "templates/user_dashboard.html",
  "Les envois et les téléchargements de la personne, derrière un menu.",
  "Le menu Mon menu contient l'audit des fiches et le retour vers la publication. Les deux listes sont vides au départ : espace.js les remplit à partir du JSON fiches-data déjà dans la page.");

ajouter("html", "templates/audit_perso.html", "page", "Audit de mes fiches", "templates/audit_perso.html",
  "Graphique, liste et commentaires de ses propres fiches.",
  "Le menu Actions contient le retour au tableau de bord et le bouton Actualiser. Le graphique des étoiles est dans graphique-perso. La grille de chiffres zone-resume reste cachée. Le JSON audit-data est dans la page.");

ajouter("html", "templates/audit.html", "page", "Audit du propriétaire", "templates/audit.html",
  "Relevé de tout le site, réservé au propriétaire, rangé en onglets.",
  "Le menu Pilotage contient suspendre, actualiser, modérer et gérer les comptes. L'onglet Vue d'ensemble montre les graphiques. Sessions, Contenu, Étoiles et Sécurité sont cachés jusqu'au clic. Les zones sont vides dans le HTML : audit.js les peint. Le premier relevé est dans audit-data.");

ajouter("html", "templates/staff_dashboard.html", "page", "Espace modération ou administration", "templates/staff_dashboard.html",
  "Même page pour les deux rôles. Le préfixe change.",
  "Le menu contient Gérer les comptes et Voir l'accueil. La recherche de fiches garde le texte, l'auteur et les étoiles, et suit la saisie. Le cours se choisit dans le menu. La balise staff-config porte data-prefix, /admin ou /moderator, lu par staff.js pour les liens Modifier et Supprimer.");

ajouter("html", "templates/comptes.html", "page", "Gestion des comptes", "templates/comptes.html",
  "Tableau des comptes, avec recherche.",
  "Critères : nom ou identifiant, rôle, état. Le tableau suit la saisie et les listes, sans bouton Rechercher. Le mot de passe n'apparaît nulle part. comptes-config dit si le rôle peut être changé et qui est la personne connectée. Les lignes sont dessinées par comptes.js.");

ajouter("html", "templates/modifier.html", "page", "Modifier une fiche", "templates/modifier.html",
  "Formulaire de correction.",
  "Le sélecteur de cours, le titre, la description et un fichier facultatif. Les adresses d'enregistrement et de retour sont dans les attributs du formulaire. La fiche actuelle est dans fiche-data.");

ajouter("html", "templates/erreur.html", "page", "Page d'erreur", "templates/erreur.html",
  "Message simple quand une page HTML reçoit une erreur.",
  "Le titre est « Oups ». Le message vient du serveur, échappé par le modèle, pas réinterprété comme du code.");

ajouter("html", "templates/suspendu.html", "page", "Site suspendu", "templates/suspendu.html",
  "Page montrée pendant la pause.",
  "Elle explique que le propriétaire a suspendu le site, avec la date si on la connaît. Le propriétaire, lui, continue de naviguer.");

ajouter("html", "auth/login/login.html", "page", "Connexion", "auth/login/login.html",
  "Identifiant et mot de passe.",
  "Le formulaire est envoyé par login.js en JSON. L'adresse de retour next est dans login-config, déjà nettoyée par le serveur. Une bannière prévient si le site est suspendu.");

ajouter("html", "auth/logout/logout.html", "page", "Déconnexion", "auth/logout/logout.html",
  "Confirmation avant de quitter.",
  "Le formulaire form-sortie est posté par logout.js. On ne sort pas seulement en suivant un lien, pour que le jeton CSRF parte avec la requête.");

ajouter("html", "auth/mot-de-passe/mot-de-passe.html", "page", "Mot de passe", "auth/mot-de-passe/mot-de-passe.html",
  "Choisir un mot de passe à la première connexion, ou le modifier plus tard.",
  "Trois champs : actuel, nouveau, confirmation. Le titre et le texte changent selon obligatoire. À la première fois, le seul autre lien est la déconnexion. Ensuite, un lien ramène à l'espace du rôle. Les règles affichées : au moins 10 caractères, différent de l'actuel et de l'identifiant.");

ajouter("html", "templates/legal/mentions.html", "page", "Mentions légales", "templates/legal/mentions.html",
  "Qui édite le site, où il est hébergé, et qui publie les fiches.",
  "Page publique, sans script. L'éditeur est le compte propriétaire. L'hébergement est la machine qui lance l'application. Les fiches restent dans matiere/ et uploads/. Le site n'envoie pas d'e-mail.");

ajouter("html", "templates/legal/confidentialite.html", "page", "Politique de confidentialité", "templates/legal/confidentialite.html",
  "Quelles données sont gardées, qui peut les lire, et pendant combien de temps.",
  "Compte, fiches, activité, session. Le mot de passe n'est stocké qu'en hash. L'adresse IP n'est pas dans la table des sessions. Rien n'est vendu ni envoyé à un service publicitaire.");

ajouter("html", "templates/legal/cookies.html", "page", "Gestion des cookies", "templates/legal/cookies.html",
  "Les deux cookies nécessaires, et le bouton pour revoir le bandeau.",
  "Cookie de session HttpOnly, huit heures. Cookie CSRF lisible par le script des formulaires. L'accusé du bandeau est dans le stockage local, sous le nom fiches-cookies, et n'est pas envoyé au serveur. cookies.js efface cet accusé.");

ajouter("html", "templates/legal/licences.html", "page", "Licences", "templates/legal/licences.html",
  "Licences des bibliothèques du serveur. Les fiches restent aux auteurs.",
  "Flask, Werkzeug et Flask-SQLAlchemy en BSD à trois clauses. SQLAlchemy, Flask-JWT-Extended et Gunicorn en MIT. Requests en Apache 2.0. Pas de script sur cette page.");

ajouter("html", "documentation/index.html", "page", "Page de cette documentation", "documentation/index.html",
  "Le fichier ouvert dans le navigateur, sans le site Flask.",
  "En-tête, recherche, pastilles de langage, sommaire et zone de lecture. Les scripts donnees-*.js, precisions.js, sources.js, coloration.js et menu.js sont dans la page. Aucun n'appelle l'application.");
