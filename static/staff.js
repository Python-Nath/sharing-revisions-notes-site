/* Tableau de bord admin et modérateur.

   Le préfixe (/admin ou /moderator) vient de la page, donc les deux rôles
   partagent ce script sans dupliquer les boutons. */

document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("compte-connu", function (event) {
    const role = event.detail && event.detail.role;
    if (role !== "moderator" && role !== "admin" && role !== "owner") {
      window.location.replace(lienEspace(role || "user"));
      return;
    }
    demarrer();
  });
});

function demarrer() {
  const config = document.getElementById("staff-config");
  const prefixe = config ? config.dataset.prefix : "";
  if (prefixe !== "/moderator" && prefixe !== "/admin") {
    window.location.replace("/users/dashboard");
    return;
  }
  const fichiers = document.getElementById("fichiers");
  let choix = null;

  function charger() {
    fichiers.replaceChildren();
    if (!choix) return;
    const attente = document.createElement("p");
    attente.className = "vide";
    attente.textContent = "Chargement des fiches…";
    fichiers.append(attente);
    const url = "/info/files/"
      + encodeURIComponent(choix.matiere) + "/"
      + encodeURIComponent(choix.classe) + "/"
      + encodeURIComponent(choix.specialite);
    api(url).then(function (reponse) {
      fichiers.replaceChildren();
      if (!reponse.ok) {
        afficherStatut("statut", reponse.data.error || "Fiches indisponibles", "erreur");
        return;
      }
      const liste = reponse.data.metadata || [];
      if (!liste.length) {
        const vide = document.createElement("p");
        vide.className = "vide";
        vide.textContent = "Aucune fiche pour ce cours.";
        fichiers.append(vide);
        return;
      }
      liste.forEach(function (fiche) {
        if (!fiche || !fiche.id) return;
        const actions = [
          {
            libelle: "Modifier",
            href: prefixe + "/dashboard/modify/" + encodeURIComponent(fiche.id)
          },
          {
            libelle: "Supprimer",
            classe: "bouton-danger",
            onClick: function () {
              supprimerFiche(prefixe + "/dashboard/delete/" + encodeURIComponent(fiche.id));
            }
          }
        ];
        fichiers.append(carteFiche(fiche, actions));
      });
    });
  }

  monterRechercheFiches(document.getElementById("form-recherche"), document.getElementById("resultats"), function (fiche) {
    return [
      {
        libelle: "Modifier",
        href: prefixe + "/dashboard/modify/" + encodeURIComponent(fiche.id)
      },
      {
        libelle: "Supprimer",
        classe: "bouton-danger",
        onClick: function () {
          supprimerFiche(prefixe + "/dashboard/delete/" + encodeURIComponent(fiche.id));
        }
      }
    ];
  });

  const selecteur = monterSelecteur(document.getElementById("selecteur"), {
    onChange: function (nouveau) {
      choix = nouveau;
      charger();
    }
  });
  selecteur.demarrer();
}
