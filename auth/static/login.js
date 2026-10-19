/* Formulaire de connexion. Le mot de passe part en JSON, jamais dans l'adresse. */

document.addEventListener("DOMContentLoaded", function () {
  const config = lireJson("login-config") || { next: "/accueil" };
  const formulaire = document.getElementById("form-login");

  document.addEventListener("compte-connu", function (event) {
    if (!event.detail) return;
    const suivant = config.next && config.next !== "/accueil"
      ? config.next
      : lienEspace(event.detail.role);
    window.location.assign(suivant);
  });

  formulaire.addEventListener("submit", function (event) {
    event.preventDefault();
    const bouton = formulaire.querySelector("button");
    bouton.disabled = true;
    api("/auth/login", {
      method: "POST",
      json: {
        username: formulaire.username.value.trim(),
        password: formulaire.password.value
      }
    }).then(function (reponse) {
      bouton.disabled = false;
      if (!reponse.ok) {
        afficherStatut("statut", reponse.data.error || "Connexion impossible", "erreur");
        return;
      }
      if (config.next && config.next !== "/accueil" && config.next !== "/auth/login-page") {
        window.location.assign(config.next);
        return;
      }
      window.location.assign(reponse.data.home || lienEspace(reponse.data.role));
    });
  });
});
