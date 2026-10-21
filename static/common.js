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

function destinationSure(role, chemin) {
  if (!chemin || chemin === "/accueil" || chemin === "/auth/login-page") return lienEspace(role);
  if (chemin.indexOf("/owner") === 0 && role !== "owner") return lienEspace(role);
  if (chemin.indexOf("/admin") === 0 && role !== "admin" && role !== "owner") return lienEspace(role);
  if (chemin.indexOf("/moderator") === 0 && role !== "moderator" && role !== "admin" && role !== "owner") {
    return lienEspace(role);
  }
  if (chemin.indexOf("/users") === 0 && role !== "user" && role !== "moderator" && role !== "admin" && role !== "owner") {
    return lienEspace(role);
  }
  return chemin;
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

function libelleAudience(audience) {
  if (audience === "auteur") return "Pour tous les utilisateurs";
  if (audience === "equipe") return "Pour l'équipe";
  if (audience === "les_deux") return "Pour les utilisateurs et l'équipe";
  return "";
}

function libelleStatutCommentaire(commentaire) {
  if (commentaire.statut === "valide") {
    return "Validé" + (commentaire.responsable ? " par " + commentaire.responsable : "");
  }
  if (commentaire.statut === "pris") {
    return "Pris en charge par " + (commentaire.responsable || "un responsable");
  }
  return "En attente";
}

function messageLocal(zone, texte, type) {
  let paragraphe = zone.querySelector(".statut-local");
  if (!paragraphe) {
    paragraphe = document.createElement("p");
    paragraphe.className = "statut statut-local";
    paragraphe.setAttribute("role", "status");
    zone.prepend(paragraphe);
  }
  paragraphe.textContent = texte || "";
  paragraphe.classList.remove("ok", "erreur");
  if (type) paragraphe.classList.add(type);
}

function allerConnexion() {
  const retour = window.location.pathname + window.location.search;
  window.location.assign("/auth/login-page?next=" + encodeURIComponent(retour));
}

function boutonEtoile(fiche) {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.className = "bouton bouton-secondaire etoile";

  function libelle(nombre, actif) {
    const compte = Number(nombre) || 0;
    bouton.textContent = (actif ? "★ " : "☆ ") + compte;
    bouton.setAttribute("aria-pressed", actif ? "true" : "false");
    bouton.setAttribute("aria-label", actif ? "Retirer mon étoile" : "Mettre une étoile");
  }

  libelle(fiche.etoiles, fiche.etoile_moi);
  bouton.addEventListener("click", function () {
    bouton.disabled = true;
    api("/fiches/" + encodeURIComponent(fiche.id) + "/etoile", { method: "POST" }).then(function (reponse) {
      bouton.disabled = false;
      if (reponse.status === 401) {
        allerConnexion();
        return;
      }
      if (!reponse.ok) {
        afficherStatut("statut", reponse.data.error || "Étoile impossible", "erreur");
        return;
      }
      libelle(reponse.data.etoiles, reponse.data.etoile);
    });
  });
  return bouton;
}

function dessinerCommentaires(fiche, panneau) {
  panneau.replaceChildren();
  const attente = document.createElement("p");
  attente.className = "vide";
  attente.textContent = "Chargement des commentaires…";
  panneau.append(attente);

  api("/fiches/" + encodeURIComponent(fiche.id) + "/commentaires").then(function (reponse) {
    panneau.replaceChildren();
    if (reponse.status === 401) {
      const lien = document.createElement("a");
      lien.href = "/auth/login-page?next=" + encodeURIComponent(window.location.pathname + window.location.search);
      lien.textContent = "Connecte-toi pour lire et écrire un commentaire.";
      panneau.append(lien);
      return;
    }
    if (!reponse.ok) {
      messageLocal(panneau, reponse.data.error || "Commentaires indisponibles", "erreur");
      return;
    }

    const form = document.createElement("form");
    const texte = document.createElement("textarea");
    texte.name = "texte";
    texte.required = true;
    texte.maxLength = 2000;
    texte.rows = 3;
    texte.placeholder = "Un retour pour améliorer la fiche";
    texte.setAttribute("aria-label", "Commentaire");
    const audience = document.createElement("select");
    audience.setAttribute("aria-label", "Qui peut lire ce commentaire");
    [
      ["auteur", "Pour tous les utilisateurs"],
      ["equipe", "Seulement pour l'équipe (modération, admin, propriétaire)"],
      ["les_deux", "Pour les utilisateurs et l'équipe"]
    ].forEach(function (paire) {
      const option = document.createElement("option");
      option.value = paire[0];
      option.textContent = paire[1];
      audience.append(option);
    });
    const envoyer = document.createElement("button");
    envoyer.type = "submit";
    envoyer.className = "bouton";
    envoyer.textContent = "Publier le commentaire";
    const note = document.createElement("p");
    note.className = "note";
    note.textContent = "N'importe quel compte peut commenter une fiche. L'équipe ne voit pas un commentaire réservé aux utilisateurs. Une seule personne le suit, puis peut le retirer après avoir modifié la fiche.";
    form.append(texte, audience, note, envoyer);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      envoyer.disabled = true;
      api("/fiches/" + encodeURIComponent(fiche.id) + "/commentaires", {
        method: "POST",
        json: { texte: texte.value, audience: audience.value }
      }).then(function (creation) {
        envoyer.disabled = false;
        if (creation.status === 401) {
          allerConnexion();
          return;
        }
        if (!creation.ok) {
          messageLocal(panneau, creation.data.error || "Commentaire refusé", "erreur");
          return;
        }
        texte.value = "";
        dessinerCommentaires(fiche, panneau);
      });
    });
    panneau.append(form);

    const liste = reponse.data.commentaires || [];
    if (!liste.length) {
      const vide = document.createElement("p");
      vide.className = "vide";
      vide.textContent = "Aucun commentaire visible pour toi.";
      panneau.append(vide);
      return;
    }
    liste.forEach(function (commentaire) {
      const article = document.createElement("article");
      article.className = "commentaire";
      const titre = document.createElement("p");
      titre.className = "meta";
      titre.textContent = (commentaire.auteur || "Compte") + " · " + libelleAudience(commentaire.audience) + " · " + libelleStatutCommentaire(commentaire);
      const corps = document.createElement("p");
      corps.textContent = commentaire.texte || "";
      article.append(titre, corps);
      if (commentaire.peut_prendre) {
        const prendre = document.createElement("button");
        prendre.type = "button";
        prendre.className = "bouton bouton-secondaire";
        prendre.textContent = "Je m'en occupe";
        prendre.addEventListener("click", function () {
          prendre.disabled = true;
          api("/fiches/" + encodeURIComponent(fiche.id) + "/commentaires/" + encodeURIComponent(commentaire.id) + "/prendre", {
            method: "POST"
          }).then(function (suite) {
            if (!suite.ok) {
              prendre.disabled = false;
              messageLocal(panneau, suite.data.error || "Prise en charge impossible", "erreur");
              return;
            }
            dessinerCommentaires(fiche, panneau);
          });
        });
        article.append(prendre);
      }
      if (commentaire.suivi && !commentaire.peut_retirer) {
        const aide = document.createElement("p");
        aide.className = "note";
        aide.textContent = "Tu suis ce commentaire. Enregistre une modification de la fiche pour pouvoir le retirer.";
        article.append(aide);
      }
      if (commentaire.peut_retirer) {
        const retirer = document.createElement("button");
        retirer.type = "button";
        retirer.className = "bouton bouton-danger";
        retirer.textContent = "Retirer le commentaire";
        retirer.addEventListener("click", function () {
          if (!window.confirm("Retirer ce commentaire ? La fiche a été modifiée pendant ce suivi.")) return;
          retirer.disabled = true;
          api("/fiches/" + encodeURIComponent(fiche.id) + "/commentaires/" + encodeURIComponent(commentaire.id), {
            method: "DELETE"
          }).then(function (suite) {
            if (!suite.ok) {
              retirer.disabled = false;
              messageLocal(panneau, suite.data.error || "Retrait impossible", "erreur");
              return;
            }
            dessinerCommentaires(fiche, panneau);
          });
        });
        article.append(retirer);
      }
      if (commentaire.peut_valider) {
        const valider = document.createElement("button");
        valider.type = "button";
        valider.className = "bouton";
        valider.textContent = "Valider le commentaire";
        valider.addEventListener("click", function () {
          valider.disabled = true;
          api("/fiches/" + encodeURIComponent(fiche.id) + "/commentaires/" + encodeURIComponent(commentaire.id) + "/valider", {
            method: "POST"
          }).then(function (suite) {
            if (!suite.ok) {
              valider.disabled = false;
              messageLocal(panneau, suite.data.error || "Validation impossible", "erreur");
              return;
            }
            dessinerCommentaires(fiche, panneau);
          });
        });
        article.append(valider);
      }
      panneau.append(article);
    });
  });
}

function zoneCommentaires(fiche) {
  const bloc = document.createElement("div");
  bloc.className = "commentaires";
  const ouvrir = document.createElement("button");
  ouvrir.type = "button";
  ouvrir.textContent = "Commentaires";
  const panneau = document.createElement("div");
  panneau.hidden = true;
  ouvrir.addEventListener("click", function () {
    panneau.hidden = !panneau.hidden;
    ouvrir.setAttribute("aria-expanded", panneau.hidden ? "false" : "true");
    if (!panneau.hidden) dessinerCommentaires(fiche, panneau);
  });
  ouvrir.setAttribute("aria-expanded", "false");
  bloc.append(panneau);
  return { bloc: bloc, ouvrir: ouvrir };
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
  barre.className = "barre-fiche";
  if (fiche.id) barre.append(boutonEtoile(fiche));
  const menu = document.createElement("details");
  menu.className = "menu-liste";
  const resume = document.createElement("summary");
  resume.textContent = "Actions";
  const panneau = document.createElement("div");
  panneau.className = "menu-panneau";
  const lien = document.createElement("a");
  lien.textContent = "Télécharger";
  lien.href = "/download/"
    + encodeURIComponent(fiche.matiere) + "/"
    + encodeURIComponent(fiche.classe) + "/"
    + encodeURIComponent(fiche.specialite) + "/"
    + encodeURIComponent(fiche.id);
  panneau.append(lien);
  (actions || []).forEach(function (action) {
    if (action.href) {
      const aller = document.createElement("a");
      aller.href = action.href;
      aller.textContent = action.libelle;
      panneau.append(aller);
      return;
    }
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.textContent = action.libelle;
    bouton.addEventListener("click", action.onClick);
    panneau.append(bouton);
  });
  if (fiche.id) {
    const commentaires = zoneCommentaires(fiche);
    panneau.append(commentaires.ouvrir);
    carte.append(titre, meta, description, fichier, barre, commentaires.bloc);
  } else {
    carte.append(titre, meta, description, fichier, barre);
  }
  menu.append(resume, panneau);
  barre.append(menu);
  return carte;
}

function supprimerFiche(url) {
  if (!window.confirm("Supprimer cette fiche ? Cette action est définitive.")) return;
  api(url, { method: "DELETE" }).then(function (reponse) {
    if (!reponse.ok) {
      afficherStatut("statut", reponse.data.error || "Suppression impossible", "erreur");
      return;
    }
    /* Recharge toute la page : un lien de téléchargement encore affiché
       pointerait vers une fiche qui n'existe plus. */
    sessionStorage.setItem("flash", "Fiche supprimée.");
    window.location.reload();
  });
}

/* Recherche de fiches. Le tri suit la frappe et les listes, sans bouton. */
function monterRechercheFiches(formulaire, zone, actionsPour) {
  if (!formulaire || !zone) return;
  let delai = 0;
  let serie = 0;

  function criteres() {
    const params = new URLSearchParams();
    new FormData(formulaire).forEach(function (valeur, cle) {
      const texte = String(valeur || "").trim();
      if (!texte || texte === "0") return;
      params.set(cle, texte);
    });
    return params;
  }

  function peindre(reponse) {
    zone.replaceChildren();
    if (!reponse.ok) {
      afficherStatut("statut", reponse.data.error || "Recherche impossible", "erreur");
      return;
    }
    afficherStatut("statut", "", "");
    const liste = reponse.data.fiches || [];
    if (!liste.length) {
      const vide = document.createElement("p");
      vide.className = "vide";
      vide.textContent = "Aucune fiche ne correspond.";
      zone.append(vide);
      return;
    }
    liste.forEach(function (fiche) {
      if (!fiche || !fiche.id) return;
      zone.append(carteFiche(fiche, actionsPour ? actionsPour(fiche) : []));
    });
    if (reponse.data.tronque) {
      const suite = document.createElement("p");
      suite.className = "note";
      suite.textContent = "Seules les 80 premières fiches sont affichées. Affine la recherche.";
      zone.append(suite);
    }
  }

  function lancer() {
    const params = criteres();
    const ticket = ++serie;
    if (!params.toString()) {
      zone.replaceChildren();
      afficherStatut("statut", "", "");
      return;
    }
    api("/info/recherche?" + params.toString()).then(function (reponse) {
      if (ticket !== serie) return;
      peindre(reponse);
    });
  }

  function bientot() {
    window.clearTimeout(delai);
    delai = window.setTimeout(lancer, 250);
  }

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
    } else if (compte.must_change_password && window.location.pathname !== "/auth/mot-de-passe") {
      window.location.assign("/auth/mot-de-passe");
      return;
    } else {
      const menuCompte = document.createElement("details");
      menuCompte.className = "menu-liste";
      const resumeCompte = document.createElement("summary");
      resumeCompte.textContent = compte.name;
      const panneauCompte = document.createElement("div");
      panneauCompte.className = "menu-panneau";
      if (!compte.must_change_password) {
        const espace = document.createElement("a");
        espace.href = lienEspace(compte.role);
        espace.textContent = "Mon espace";
        const motDePasse = document.createElement("a");
        motDePasse.href = "/auth/mot-de-passe";
        motDePasse.textContent = "Mot de passe";
        panneauCompte.append(espace, motDePasse);
      }
      const sortie = document.createElement("a");
      sortie.href = "/auth/logout-page";
      sortie.textContent = "Déconnexion";
      panneauCompte.append(sortie);
      menuCompte.append(resumeCompte, panneauCompte);
      zone.append(menuCompte);
      const salut = document.getElementById("salut");
      if (salut) salut.textContent = "Bonjour " + compte.name + " " + compte.surname + ".";
    }
    document.dispatchEvent(new CustomEvent("compte-connu", { detail: compte }));
  });
}

function preparerCookies() {
  const bandeau = document.getElementById("banniere-cookies");
  const bouton = document.getElementById("cookies-ok");
  if (!bandeau || !bouton) return;
  if (localStorage.getItem("fiches-cookies") === "compris") return;
  bandeau.hidden = false;
  bouton.addEventListener("click", function () {
    localStorage.setItem("fiches-cookies", "compris");
    bandeau.hidden = true;
  });
}

document.addEventListener("DOMContentLoaded", function () {
  remplirNavigation();
  preparerCookies();
  const flash = sessionStorage.getItem("flash");
  if (!flash) return;
  sessionStorage.removeItem("flash");
  afficherStatut("statut", flash, "ok");
});
