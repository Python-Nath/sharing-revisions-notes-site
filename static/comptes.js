/* Tableau des comptes. Les boutons affichés suivent le rôle, le serveur revérifie. */

document.addEventListener("DOMContentLoaded", function () {
  const config = document.getElementById("comptes-config");
  const prefixe = config.dataset.prefix;
  const peutRoles = config.dataset.roles === "1";
  const moi = config.dataset.moi;
  const comptes = lireJson("comptes-data") || [];
  const corps = document.getElementById("corps-comptes");

  function dessiner(liste) {
    corps.replaceChildren();
    liste.forEach(ajouterLigne);
  }

  function cellule(texte) {
    const td = document.createElement("td");
    td.textContent = texte;
    return td;
  }

  function ajouterLigne(compte) {
    const ligne = document.createElement("tr");
    ligne.append(
      cellule((compte.name || "") + " " + (compte.surname || "")),
      cellule(compte.username || ""),
      cellule(libelleRole(compte.role)),
      cellule(compte.is_ban ? "Suspendu" : "Actif")
    );
    const actions = document.createElement("td");

    if (compte.id === moi) {
      actions.textContent = "C'est toi";
    } else if (compte.role === "owner") {
      actions.textContent = "Propriétaire";
    } else if (peutRoles || compte.role === "user") {
      if (peutRoles) {
        const select = document.createElement("select");
        [
          ["user", "Élève"],
          ["moderator", "Modérateur"],
          ["admin", "Administrateur"]
        ].forEach(function (paire) {
          const option = document.createElement("option");
          option.value = paire[0];
          option.textContent = paire[1];
          if (paire[0] === compte.role) option.selected = true;
          select.append(option);
        });
        const enregistrer = document.createElement("button");
        enregistrer.type = "button";
        enregistrer.className = "bouton bouton-secondaire";
        enregistrer.textContent = "Changer le rôle";
        enregistrer.addEventListener("click", function () {
          enregistrer.disabled = true;
          api(prefixe + "/dashboard/role/" + encodeURIComponent(compte.id), {
            method: "POST",
            json: { role: select.value }
          }).then(function (reponse) {
            enregistrer.disabled = false;
            if (!reponse.ok) {
              afficherStatut("statut", reponse.data.error || "Changement impossible", "erreur");
              return;
            }
            window.location.reload();
          });
        });
        const barre = document.createElement("div");
        barre.className = "ligne-actions";
        barre.append(select, enregistrer);
        actions.append(barre);
      }
      if (peutRoles && compte.role === "admin") {
        /* Un administrateur ne suspend pas un autre administrateur. */
      } else {
        const suspendre = document.createElement("button");
        suspendre.type = "button";
        suspendre.className = "bouton bouton-danger";
        suspendre.textContent = compte.is_ban ? "Réactiver" : "Suspendre";
        suspendre.addEventListener("click", function () {
          const action = compte.is_ban ? "unban" : "ban";
          const question = compte.is_ban
            ? "Réactiver ce compte ?"
            : "Suspendre ce compte ? Il ne pourra plus se connecter.";
          if (!window.confirm(question)) return;
          api(prefixe + "/dashboard/" + action + "/" + encodeURIComponent(compte.id), {
            method: "POST"
          }).then(function (reponse) {
            if (!reponse.ok) {
              afficherStatut("statut", reponse.data.error || "Action impossible", "erreur");
              return;
            }
            window.location.reload();
          });
        });
        actions.append(suspendre);
      }
    } else {
      actions.textContent = "Aucune action";
    }

    ligne.append(actions);
    corps.append(ligne);
  }

  const formulaire = document.getElementById("form-recherche");
  let delai = 0;
  let serie = 0;

  function criteres() {
    const params = new URLSearchParams();
    if (!formulaire) return params;
    new FormData(formulaire).forEach(function (valeur, cle) {
      const texte = String(valeur || "").trim();
      if (texte) params.set(cle, texte);
    });
    return params;
  }

  function lancer() {
    const params = criteres();
    const ticket = ++serie;
    if (!params.toString()) {
      dessiner(comptes);
      afficherStatut("statut", "", "");
      return;
    }
    api(prefixe + "/comptes/recherche?" + params.toString()).then(function (reponse) {
      if (ticket !== serie) return;
      if (reponse.status === 401) {
        window.location.assign("/auth/login-page?next=" + encodeURIComponent(window.location.pathname));
        return;
      }
      if (!reponse.ok) {
        afficherStatut("statut", reponse.data.error || "Recherche impossible", "erreur");
        return;
      }
      dessiner(reponse.data.comptes || []);
      afficherStatut(
        "statut",
        reponse.data.tronque ? "Liste limitée aux 100 premiers comptes." : "",
        reponse.data.tronque ? "ok" : ""
      );
    });
  }

  function bientot() {
    window.clearTimeout(delai);
    delai = window.setTimeout(lancer, 250);
  }

  if (formulaire) {
    formulaire.addEventListener("submit", function (event) {
      event.preventDefault();
      window.clearTimeout(delai);
      lancer();
    });
    formulaire.querySelectorAll("input").forEach(function (champ) {
      champ.addEventListener("input", bientot);
      champ.addEventListener("search", function () {
        window.clearTimeout(delai);
        lancer();
      });
    });
    formulaire.querySelectorAll("select").forEach(function (champ) {
      champ.addEventListener("change", function () {
        window.clearTimeout(delai);
        lancer();
      });
    });
  }

  const tout = document.getElementById("bouton-tous");
  if (tout) {
    tout.addEventListener("click", function () {
      if (formulaire) formulaire.reset();
      dessiner(comptes);
      afficherStatut("statut", "", "");
    });
  }

  dessiner(comptes);
});
