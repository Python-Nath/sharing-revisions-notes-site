/* Retire seulement l'accusé du bandeau. Les cookies de session ne sont pas effacés ici. */

document.addEventListener("DOMContentLoaded", function () {
  const bouton = document.getElementById("cookies-oublier");
  if (!bouton) return;
  bouton.addEventListener("click", function () {
    localStorage.removeItem("fiches-cookies");
    afficherStatut("statut", "Le bandeau réapparaîtra au prochain affichage.", "ok");
  });
});
