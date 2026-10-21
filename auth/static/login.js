/* Formulaire de connexion. Le mot de passe part en JSON, jamais dans l'adresse. */

document.addEventListener("DOMContentLoaded", function () {
  const config = lireJson("login-config") || { next: "/accueil" };
  const formulaire = document.getElementById("form-login");

  document.addEventListener("compte-connu", function (event) {
    if (!event.detail) return;
    if (event.detail.must_change_password) {
      window.location.assign("/auth/mot-de-passe");
      return;
    }
    window.location.assign(destinationSure(event.detail.role, config.next));
  });

  formulaire.addEventListener("submit", function (event) {
    event.preventDefault();
    const bouton = formulaire.querySelector("button");
    bouton.disabled = true;
    api("/auth/login", {
      method: "POST",
      json: {
        username: formulaire.username.value.trim(),
        password: formulaire.password.value,
        next: config.next
      }
    }).then(function (reponse) {
      bouton.disabled = false;
      if (!reponse.ok) {
        afficherStatut("statut", reponse.data.error || "Connexion impossible", "erreur");
        return;
      }
      if (reponse.data.must_change_password) {
        window.location.assign("/auth/mot-de-passe");
        return;
      }
      window.location.assign(reponse.data.home || lienEspace(reponse.data.role));
    });
  });
});
