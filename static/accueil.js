/* Accueil : le cours choisi charge les fiches sans bouton intermédiaire. */

document.addEventListener("DOMContentLoaded", function () {
  const fichiers = document.getElementById("fichiers");
  const formulaire = document.getElementById("form-envoi");
  const invite = document.getElementById("invite-connexion");
  let choix = null;
  let connecte = false;

  function afficherZones() {
    const pret = Boolean(choix);
    formulaire.hidden = !(pret && connecte);
    invite.hidden = !(pret && !connecte);
  }

  document.addEventListener("compte-connu", function (event) {
    connecte = Boolean(event.detail);
    afficherZones();
  });

  function cheminCours() {
    return "/info/files/"
      + encodeURIComponent(choix.matiere) + "/"
      + encodeURIComponent(choix.classe) + "/"
      + encodeURIComponent(choix.specialite);
  }

  function chargerFiches() {
    fichiers.replaceChildren();
    if (!choix) return;
    const attente = document.createElement("p");
    attente.className = "vide";
    attente.textContent = "Chargement des fiches…";
    fichiers.append(attente);
    api(cheminCours()).then(function (reponse) {
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
        fichiers.append(carteFiche(fiche, []));
      });
    });
  }

  monterRechercheFiches(document.getElementById("form-recherche"), document.getElementById("resultats"));

  const selecteur = monterSelecteur(document.getElementById("selecteur"), {
    onChange: function (nouveau) {
      choix = nouveau;
      afficherZones();
      chargerFiches();
    }
  });
  selecteur.demarrer();

  formulaire.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!choix) return;
    const bouton = formulaire.querySelector("button");
    bouton.disabled = true;
    const url = "/upload/"
      + encodeURIComponent(choix.matiere) + "/"
      + encodeURIComponent(choix.classe) + "/"
      + encodeURIComponent(choix.specialite);
    api(url, { method: "POST", body: new FormData(formulaire) }).then(function (reponse) {
      bouton.disabled = false;
      if (reponse.status === 401) {
        window.location.assign("/auth/login-page?next=/accueil");
        return;
      }
      if (!reponse.ok) {
        afficherStatut("statut", reponse.data.error || "Envoi impossible", "erreur");
        return;
      }
      formulaire.reset();
      afficherStatut("statut", "Fiche publiée.", "ok");
      chargerFiches();
    });
  });
});
