window.DOCS = window.DOCS || [];

function ajouter(langue, fichier, genre, nom, signature, resume, detail) {
  window.DOCS.push({
    langue: langue,
    fichier: fichier,
    genre: genre,
    nom: nom,
    signature: signature,
    resume: resume,
    detail: detail
  });
}

ajouter(
  "guide",
  "Présentation",
  "mode d'emploi",
  "Ouvrir cette documentation",
  "documentation/index.html",
  "Cette documentation se lit dans le navigateur, sans lancer le site.",
  "Ouvre le fichier documentation/index.html. Le menu à gauche liste les textes. La case Rechercher filtre les titres, les fichiers, les variables et les actions. Les pastilles de couleur gardent un seul langage, ou tout le dossier.\n\nChaque fiche a trois parties : le résumé, le tableau Variables (nom et rôle), puis Actions dans l'ordre d'exécution. Rien ici n'appelle l'application."
);

ajouter(
  "guide",
  "Présentation",
  "vue d'ensemble",
  "Le site en une minute",
  "Partage de fiches entre élèves",
  "Des élèves déposent des fiches de révision. Les autres les retrouvent par matière, classe et spécialité, puis les téléchargent.",
  "Le programme est une application Flask. Les comptes sont dans une base SQLite. Les fiches elles-mêmes sont des fichiers : le document dans uploads/, sa description dans matiere/.\n\nQuatre rôles existent : élève, modérateur, administrateur, propriétaire. Il ne peut y avoir qu'un seul propriétaire.\n\nLes pages sont en HTML. Le JavaScript construit les listes et envoie les formulaires. Le CSS donne l'apparence papier et encre.\n\nLes actions d'un compte ou d'une fiche sont dans un menu, pas sur une rangée de boutons. La recherche de fiches et de comptes filtre pendant la saisie. L'audit du propriétaire s'ouvre sur des graphiques. Le pied de page mène aux mentions, à la confidentialité, aux cookies et aux licences.\n\nLes panneaux, les cartes, les menus et les onglets entrent en douceur. Poser une étoile la fait grossir un instant. Si le système demande moins de mouvement, ces animations sont coupées."
);

ajouter(
  "guide",
  "Présentation",
  "rôles",
  "Les quatre rôles",
  "user, moderator, admin, owner",
  "Le rôle est relu dans la base à chaque action. Il n'est pas copié dans le jeton de connexion.",
  "Élève (user) : publie ses fiches, les modifie, les supprime, met une étoile, commente, consulte l'audit de ses propres fiches.\n\nModérateur (moderator) : corrige ou retire une fiche, suspend un élève, cherche les comptes. Il ne change pas les rôles et ne suspend pas l'équipe.\n\nAdministrateur (admin) : fait le même travail de modération, change les rôles élève, modérateur ou administrateur, et suspend un élève ou un modérateur. Il ne touche pas au propriétaire.\n\nPropriétaire (owner) : voit l'audit de tout le site, suspend ou rouvre le site, et peut aussi modérer. Personne ne peut lui retirer ce rôle depuis les pages."
);

ajouter(
  "guide",
  "Présentation",
  "données",
  "Où vivent les fiches",
  "matiere/ et uploads/",
  "Le disque est la source de vérité. La base ne garde qu'un rappel pour les tableaux de bord.",
  "Une fiche a un identifiant UUID. Son JSON est dans matiere/matière/classe/spécialité/identifiant.json. Le fichier envoyé est dans uploads/, sous le nom identifiant_nom-sûr.\n\nLe compte retient la liste de ses envois et de ses téléchargements. Quand on modifie une fiche, ce rappel est mis à jour. Quand on la supprime, le JSON, le fichier, les étoiles et les commentaires partent ensemble.\n\nLes étoiles et les commentaires sont des lignes SQLite, pas des champs du JSON."
);

ajouter(
  "guide",
  "Présentation",
  "parcours",
  "Une fiche, de l'envoi au retrait",
  "publier, lire, étoiler, commenter, corriger, supprimer",
  "Voici le chemin complet, avec le rôle de chaque langage.",
  "1. L'élève choisit un cours dans le menu HTML, rempli par le JavaScript à partir des dossiers.\n2. Il envoie le formulaire. Python vérifie le type de fichier, le titre, la description et le chemin, puis écrit le disque et la base.\n3. La carte s'affiche. Le bouton étoile parle à Python. Un compte connecté peut poser ou retirer sa seule étoile.\n4. Un compte connecté peut commenter. Il choisit : tous les élèves, seulement l'équipe, ou les deux.\n5. L'auteur de la fiche, un modérateur, un administrateur ou le propriétaire peut suivre ce commentaire. Après avoir enregistré une modification de la fiche, cette personne peut le retirer.\n6. Supprimer recharge la page, pour que le lien de téléchargement disparaisse en même temps que le fichier."
);

ajouter(
  "guide",
  "Présentation",
  "mot de passe",
  "Le mot de passe",
  "première connexion, puis quand on veut",
  "Le mot de passe reçu au départ ne sert qu'une fois.",
  "À la première connexion, le site n'ouvre que la page pour en choisir un nouveau. L'ancien est redemandé, le nouveau fait au moins 10 caractères, et les deux saisies doivent être identiques. Il ne peut pas recopier l'identifiant ni l'ancien mot de passe.\n\nEnsuite, le lien Mot de passe du menu permet de le changer à tout moment. Le serveur vérifie encore l'ancien, pour qu'une session laissée ouverte ne suffise pas à elle seule."
);

ajouter(
  "guide",
  "Présentation",
  "couleurs",
  "Légende des couleurs",
  "gris, bleu, ambre, vert, violet",
  "Chaque langage a une couleur, dans le menu et sur la fiche.",
  "Gris encre : la présentation, pour comprendre avant de lire le code.\nBleu : Python, le serveur, les droits, les fichiers.\nAmbre : JavaScript, ce que le navigateur affiche et envoie.\nVert : HTML, la structure des pages.\nViolet : CSS, les couleurs et la mise en page du site lui-même.\n\nLe site des élèves utilise d'autres teintes : papier #f4efe4, encre #1c2430, forêt #1d6b4f, danger #8d2f2f, focus #b86b12. Elles sont décrites dans la partie CSS."
);
