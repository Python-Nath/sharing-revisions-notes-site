/* Outils communs à toutes les pages.

   Le cookie de session est HttpOnly : ce script ne peut pas le lire.
   Il envoie seulement le cookie CSRF, exigé par le serveur pour toute
   action qui modifie quelque chose (publier, supprimer, suspendre). */

function lireCookie(nom) {
  const morceaux = document.cookie.split(";");
  for (let i = 0; i < morceaux.length; i += 1) {
    const partie = morceaux[i].trim();
    const egal = partie.indexOf("=");
    if (egal > 0 && partie.slice(0, egal) === nom) {
      return decodeURIComponent(partie.slice(egal + 1));
    }
  }
  return "";
}

function api(chemin, options) {
  options = options || {};
  const methode = options.method || "GET";
  const entetes = { Accept: "application/json" };
  if (methode !== "GET" && methode !== "HEAD") {
    const jeton = lireCookie("csrf_access_token");
    if (jeton) entetes["X-CSRF-TOKEN"] = jeton;
  }
  let corps;
  if (options.json !== undefined) {
    entetes["Content-Type"] = "application/json";
    corps = JSON.stringify(options.json);
  } else if (options.body) {
    corps = options.body;
  }

  return fetch(chemin, {
    method: methode,
    credentials: "same-origin",
    headers: entetes,
    body: corps
  }).then(function (reponse) {
    return reponse.text().then(function (texte) {
      let data = {};
      if (texte) {
        try {
          data = JSON.parse(texte);
        } catch (e) {
          data = {
            error: reponse.status === 413
              ? "Fichier trop volumineux."
              : "Réponse inattendue du serveur."
          };
        }
      }
      return { ok: reponse.ok, status: reponse.status, data: data };
    });
  }).catch(function () {
    return { ok: false, status: 0, data: { error: "Impossible de joindre le serveur." } };
  });
}

function afficherStatut(id, message, type) {
  const zone = document.getElementById(id);
  if (!zone) return;
  zone.textContent = message || "";
  zone.classList.remove("ok", "erreur");
  if (type) zone.classList.add(type);
}

function lienEspace(role) {
  if (role === "owner") return "/owner/audit";
  if (role === "admin") return "/admin/dashboard";
  if (role === "moderator") return "/moderator/dashboard";
  return "/users/dashboard";
}

function libelleRole(role) {
  if (role === "owner") return "Propriétaire";
  if (role === "admin") return "Administrateur";
  if (role === "moderator") return "Modérateur";
  return "Élève";
}

function lireJson(id) {
  const zone = document.getElementById(id);
  if (!zone) return null;
  try {
    return JSON.parse(zone.textContent);
  } catch (e) {
    return null;
  }
}

/* Carte d'une fiche. Le texte vient de textContent, jamais de innerHTML. */
function carteFiche(fiche, actions) {
  const carte = document.createElement("article");
  carte.className = "fiche";

  const titre = document.createElement("h3");
  titre.textContent = fiche.title || "Sans titre";

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = [fiche.author, fiche.matiere, fiche.classe, fiche.specialite]
    .filter(Boolean)
    .join(" · ");

  const description = document.createElement("p");
  description.textContent = fiche.desc || "";

  const fichier = document.createElement("p");
  fichier.className = "fichier";
  fichier.textContent = fiche.original_filename || "";

  const barre = document.createElement("div");
  barre.className = "actions";
  const lien = document.createElement("a");
  lien.className = "bouton";
  lien.textContent = "Télécharger";
  lien.href = "/download/"
    + encodeURIComponent(fiche.matiere) + "/"
    + encodeURIComponent(fiche.classe) + "/"
    + encodeURIComponent(fiche.specialite) + "/"
    + encodeURIComponent(fiche.id);
  barre.append(lien);

  (actions || []).forEach(function (action) {
    if (action.href) {
      const aller = document.createElement("a");
      aller.className = "bouton bouton-secondaire";
      aller.href = action.href;
      aller.textContent = action.libelle;
      barre.append(aller);
      return;
    }
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "bouton " + (action.classe || "bouton-secondaire");
    bouton.textContent = action.libelle;
    bouton.addEventListener("click", action.onClick);
    barre.append(bouton);
  });

  carte.append(titre, meta, description, fichier, barre);
  return carte;
}

function supprimerFiche(url, carte) {
  if (!window.confirm("Supprimer cette fiche ? Cette action est définitive.")) return;
  api(url, { method: "DELETE" }).then(function (reponse) {
    if (!reponse.ok) {
      afficherStatut("statut", reponse.data.error || "Suppression impossible", "erreur");
      return;
    }
    if (carte) carte.remove();
    afficherStatut("statut", "Fiche supprimée.", "ok");
  });
}

/* Trois listes reliées à /info/matiere, /info/classe et /info/specialite. */
function monterSelecteur(racine, options) {
  options = options || {};
  const etat = { matiere: "", classe: "", specialite: "" };
  let valeurs = options.valeurs || null;
  if (!valeurs) {
    try {
      valeurs = JSON.parse(sessionStorage.getItem("fiche-cours") || "null");
    } catch (e) {
      valeurs = null;
    }
  }

  function creerSelect(etiquette) {
    const bloc = document.createElement("label");
    bloc.className = "champ";
    const span = document.createElement("span");
    span.textContent = etiquette;
    const select = document.createElement("select");
    bloc.append(span, select);
    racine.append(bloc);
    return select;
  }

  function vider(select, libelle) {
    select.replaceChildren();
    const option = document.createElement("option");
    option.value = "";
    option.textContent = libelle;
    select.append(option);
  }

  function remplir(select, noms, libelle) {
    vider(select, libelle);
    (noms || []).forEach(function (nom) {
      const option = document.createElement("option");
      option.value = nom;
      option.textContent = nom;
      select.append(option);
    });
  }

  const selectMatiere = creerSelect("Matière");
  const selectClasse = creerSelect("Classe");
  const selectSpecialite = creerSelect("Spécialité");
  selectClasse.disabled = true;
  selectSpecialite.disabled = true;

  function valeurUnique(select) {
    /* Un seul vrai choix : on le prend, le placeholder ne compte pas. */
    let seule = "";
    let nombre = 0;
    for (let i = 0; i < select.options.length; i += 1) {
      const valeur = select.options[i].value;
      if (!valeur) continue;
      nombre += 1;
      seule = valeur;
    }
    return nombre === 1 ? seule : "";
  }

  function choixComplet() {
    if (!etat.matiere || !etat.classe || !etat.specialite) return null;
    return { matiere: etat.matiere, classe: etat.classe, specialite: etat.specialite };
  }

  function notifier() {
    const choix = choixComplet();
    if (choix) sessionStorage.setItem("fiche-cours", JSON.stringify(choix));
    if (options.onChange) options.onChange(choix);
  }

  function chargerSpecialites() {
    vider(selectSpecialite, "Choisir une spécialité");
    selectSpecialite.disabled = true;
    etat.specialite = "";
    if (!etat.classe) {
      notifier();
      return Promise.resolve();
    }
    const url = "/info/specialite/"
      + encodeURIComponent(etat.matiere) + "/"
      + encodeURIComponent(etat.classe);
    return api(url).then(function (reponse) {
      if (!reponse.ok) {
        afficherStatut("statut", reponse.data.error || "Spécialités indisponibles", "erreur");
        notifier();
        return;
      }
      remplir(selectSpecialite, reponse.data.specialite, "Choisir une spécialité");
      selectSpecialite.disabled = false;
      if (valeurs && valeurs.specialite) {
        selectSpecialite.value = valeurs.specialite;
        if (selectSpecialite.value) etat.specialite = valeurs.specialite;
        valeurs = null;
      }
      if (!etat.specialite) {
        const seule = valeurUnique(selectSpecialite);
        if (seule) {
          selectSpecialite.value = seule;
          etat.specialite = seule;
        }
      }
      notifier();
    });
  }

  function chargerClasses() {
    vider(selectClasse, "Choisir une classe");
    vider(selectSpecialite, "Choisir une spécialité");
    selectClasse.disabled = true;
    selectSpecialite.disabled = true;
    etat.classe = "";
    etat.specialite = "";
    if (!etat.matiere) {
      notifier();
      return Promise.resolve();
    }
    return api("/info/classe/" + encodeURIComponent(etat.matiere)).then(function (reponse) {
      if (!reponse.ok) {
        afficherStatut("statut", reponse.data.error || "Classes indisponibles", "erreur");
        notifier();
        return;
      }
      remplir(selectClasse, reponse.data.classe, "Choisir une classe");
      selectClasse.disabled = false;
      if (valeurs && valeurs.classe) {
        selectClasse.value = valeurs.classe;
        if (selectClasse.value) {
          etat.classe = valeurs.classe;
          return chargerSpecialites();
        }
        valeurs = null;
      }
      const seuleClasse = valeurUnique(selectClasse);
      if (seuleClasse) {
        selectClasse.value = seuleClasse;
        etat.classe = seuleClasse;
        return chargerSpecialites();
      }
      notifier();
    });
  }

  selectMatiere.addEventListener("change", function () {
    etat.matiere = selectMatiere.value;
    valeurs = null;
    chargerClasses();
  });
  selectClasse.addEventListener("change", function () {
    etat.classe = selectClasse.value;
    valeurs = null;
    chargerSpecialites();
  });
  selectSpecialite.addEventListener("change", function () {
    etat.specialite = selectSpecialite.value;
    notifier();
  });

  return {
    lire: choixComplet,
    demarrer: function () {
      vider(selectMatiere, "Choisir une matière");
      vider(selectClasse, "Choisir une classe");
      vider(selectSpecialite, "Choisir une spécialité");
      return api("/info/matiere").then(function (reponse) {
        if (!reponse.ok) {
          afficherStatut("statut", reponse.data.error || "Matières indisponibles", "erreur");
          return;
        }
        remplir(selectMatiere, reponse.data.matiere, "Choisir une matière");
        if (valeurs && valeurs.matiere) {
          selectMatiere.value = valeurs.matiere;
          if (selectMatiere.value) {
            etat.matiere = valeurs.matiere;
            return chargerClasses();
          }
          valeurs = null;
        }
        const seuleMatiere = valeurUnique(selectMatiere);
        if (seuleMatiere) {
          selectMatiere.value = seuleMatiere;
          etat.matiere = seuleMatiere;
          return chargerClasses();
        }
      });
    }
  };
}

function remplirNavigation() {
  const zone = document.getElementById("nav-compte");
  if (!zone) return;
  api("/auth/me").then(function (reponse) {
    zone.replaceChildren();
    const compte = reponse.ok ? reponse.data : null;
    document.body.dataset.connecte = compte ? "1" : "0";
    document.body.dataset.role = compte ? compte.role : "";
    if (!compte) {
      const lien = document.createElement("a");
      lien.href = "/auth/login-page";
      lien.textContent = "Connexion";
      zone.append(lien);
    } else {
      const espace = document.createElement("a");
      espace.href = lienEspace(compte.role);
      espace.textContent = "Mon espace";
      const sortie = document.createElement("a");
      sortie.href = "/auth/logout-page";
      sortie.textContent = "Déconnexion";
      zone.append(espace, sortie);
      const salut = document.getElementById("salut");
      if (salut) salut.textContent = "Bonjour " + compte.name + " " + compte.surname + ".";
    }
    document.dispatchEvent(new CustomEvent("compte-connu", { detail: compte }));
  });
}

document.addEventListener("DOMContentLoaded", remplirNavigation);
