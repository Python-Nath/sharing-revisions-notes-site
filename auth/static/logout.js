/* Confirme la sortie, puis efface les cookies de session. */

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("form-sortie").addEventListener("submit", function (event) {
    event.preventDefault();
    api("/auth/logout", { method: "POST" }).then(function (reponse) {
      if (!reponse.ok) {
        afficherStatut("statut", reponse.data.error || "Déconnexion impossible", "erreur");
        return;
      }
      window.location.assign("/accueil");
    });
  });
});
