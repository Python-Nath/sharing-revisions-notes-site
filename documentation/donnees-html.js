/* Pages HTML. Elles décrivent la structure, pas une adresse du serveur à appeler depuis ici. */

ajouter("html", "templates/base.html", "page", "Squelette commun", "templates/base.html",
  "Le cadre de toutes les pages : langue, titre, menu, contenu, pied.",
  "Le lien « Aller au contenu » sert à sauter le menu au clavier. La barre a la marque Fiches, le lien Accueil, et une zone nav-compte remplie par le JavaScript. Le style vient de static/style.css. Le script commun est chargé avant le script propre à la page.");

ajouter("html", "templates/index.html", "page", "Accueil", "templates/index.html",
  "Choisir un cours, chercher une fiche, lire les cartes, publier.",
  "Le sélecteur de cours est au-dessus. La recherche n'a plus matière, classe ni spécialité : ces trois choix sont dans le menu. Restent le texte, l'auteur et le minimum d'étoiles. Le formulaire d'envoi est caché tant qu'on n'est pas connecté. L'auteur n'est pas demandé : le serveur prend le compte.");

ajouter("html", "templates/user_dashboard.html", "page", "Espace élève", "templates/user_dashboard.html",
  "Les envois et les téléchargements de la personne.",
  "Un lien mène à l'audit de ses fiches. Les deux listes sont vides au départ : espace.js les remplit à partir du JSON fiches-data déjà dans la page.");

ajouter("html", "templates/audit_perso.html", "page", "Audit de mes fiches", "templates/audit_perso.html",
  "Chiffres, liste et commentaires de ses propres fiches.",
  "Zones : résumé, fiche la plus étoilée, tableau des fiches, commentaires lisibles par cet élève. Le JSON audit-data est dans la page. Actualiser redemande le relevé sans changer de compte.");

ajouter("html", "templates/audit.html", "page", "Audit du propriétaire", "templates/audit.html",
  "Relevé de tout le site, réservé au propriétaire.",
  "Boutons Suspendre et Actualiser, puis sessions, stockage, comptes, activité, étoiles, contenu et sécurité. Les zones sont vides dans le HTML : audit.js les peint. Le premier relevé est dans audit-data.");

ajouter("html", "templates/staff_dashboard.html", "page", "Espace modération ou administration", "templates/staff_dashboard.html",
  "Même page pour les deux rôles. Le préfixe change.",
  "Recherche de fiches par texte, auteur et étoiles. Le cours se choisit dans le menu. La balise staff-config porte data-prefix, /admin ou /moderator, lu par staff.js pour les liens Modifier et Supprimer.");

ajouter("html", "templates/comptes.html", "page", "Gestion des comptes", "templates/comptes.html",
  "Tableau des comptes, avec recherche.",
  "Critères : nom ou identifiant, rôle, état. Le mot de passe n'apparaît nulle part. comptes-config dit si le rôle peut être changé et qui est la personne connectée. Les lignes sont dessinées par comptes.js.");

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
