/* Formulaire de modification, commun à l'élève, au modérateur et à l'admin. */

document.addEventListener("DOMContentLoaded", function () {
  const metadata = lireJson("fiche-data") || {};
  const formulaire = document.getElementById("form-modifier");
  const selecteur = monterSelecteur(document.getElementById("selecteur"), {
    valeurs: {
      matiere: metadata.matiere,
      classe: metadata.classe,
      specialite: metadata.specialite
    }
  });
  selecteur.demarrer();

  formulaire.addEventListener("submit", function (event) {
    event.preventDefault();
    const choix = selecteur.lire();
    if (!choix) {
      afficherStatut("statut", "Choisis une matière, une classe et une spécialité.", "erreur");
      return;
    }
    const bouton = formulaire.querySelector("button[type=submit]");
    bouton.disabled = true;
    const data = new FormData(formulaire);
    data.set("matiere", choix.matiere);
    data.set("classe", choix.classe);
    data.set("specialite", choix.specialite);
    api(formulaire.dataset.saveUrl, { method: "POST", body: data }).then(function (reponse) {
      bouton.disabled = false;
      if (!reponse.ok) {
        afficherStatut("statut", reponse.data.error || "Enregistrement impossible", "erreur");
        return;
      }
      window.location.assign(formulaire.dataset.retourUrl);
    });
  });
});
