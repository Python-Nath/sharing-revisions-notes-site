/* Tableau de bord élève : les fiches sont déjà dans la page, pas rechargées. */

document.addEventListener("DOMContentLoaded", function () {
  const data = lireJson("fiches-data") || { envoyes: [], telecharges: [] };

  function remplir(zone, fiches, avecActions) {
    zone.replaceChildren();
    if (!fiches.length) {
      const vide = document.createElement("p");
      vide.className = "vide";
      vide.textContent = "Rien ici pour le moment.";
      zone.append(vide);
      return;
    }
    fiches.forEach(function (fiche) {
      const actions = avecActions ? [
        {
          libelle: "Modifier",
          href: "/users/dashboard/modify/" + encodeURIComponent(fiche.id)
        },
        {
          libelle: "Supprimer",
          classe: "bouton-danger",
          onClick: function () {
            supprimerFiche("/users/dashboard/delete/" + encodeURIComponent(fiche.id));
          }
        }
      ] : [];
      zone.append(carteFiche(fiche, actions));
    });
  }

  remplir(document.getElementById("envoyes"), data.envoyes || [], true);
  remplir(document.getElementById("telecharges"), data.telecharges || [], false);
});
