/* Changement de mot de passe. L'ancien et le nouveau partent en JSON, pas dans l'adresse. */

document.addEventListener("DOMContentLoaded", function () {
  const config = lireJson("mot-de-passe-config") || { obligatoire: false, retour: "/accueil" };
  const formulaire = document.getElementById("form-mot-de-passe");

  formulaire.addEventListener("submit", function (event) {
    event.preventDefault();
    const bouton = formulaire.querySelector("button");
    bouton.disabled = true;
    api("/auth/mot-de-passe", {
      method: "POST",
      json: {
        actuel: formulaire.actuel.value,
        nouveau: formulaire.nouveau.value,
        confirmation: formulaire.confirmation.value
      }
    }).then(function (reponse) {
      bouton.disabled = false;
      if (!reponse.ok) {
        afficherStatut("statut", reponse.data.error || "Changement impossible", "erreur");
        return;
      }
      window.location.assign(reponse.data.home || config.retour || "/accueil");
    });
  });
});
