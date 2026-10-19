const ORDRE_CLASSES = ["2nd", "1ere", "term"];
let catalogue = null;

async function api(chemin, options) {
  options = options || {};
  const requete = { method: "GET", credentials: "same-origin", headers: {} };

  if (options.method) requete.method = options.method;
  if (options.json !== undefined) {
    requete.method = "POST";
    requete.headers["Content-Type"] = "application/json";
    requete.body = JSON.stringify(options.json);
  }
  if (options.body) {
    requete.method = "POST";
    requete.body = options.body;
  }

  try {
    const reponse = await fetch(chemin, requete);
    let data = {};
    try {
      data = await reponse.json();
    } catch (e) {}
    return { ok: reponse.ok, status: reponse.status, data: data };
  } catch (e) {
    return { ok: false, status: 0, data: { erreur: "Impossible de joindre le serveur." } };
  }
}

function messageErreur(r) {
  return r.data.erreur || "Erreur " + r.status;
}

function setStatus(element, message, type) {
  element.textContent = message;
  element.className = type || "";
}

function el(balise, classe, texte) {
  const element = document.createElement(balise);
  if (classe) element.className = classe;
  if (texte) element.textContent = texte;
  return element;
}

function formaterTaille(octets) {
  if (octets < 1024) return octets + " o";
  if (octets < 1048576) return Math.round(octets / 1024) + " Ko";
  return (octets / 1048576).toFixed(1) + " Mo";
}

function formaterDate(date) {
  return new Date(date).toLocaleDateString("fr-FR");
}

async function chargerCatalogue() {
  if (catalogue) return catalogue;
  const r = await api("/api/catalogue");
  if (!r.ok) throw new Error(messageErreur(r));
  catalogue = r.data;
  return catalogue;
}

function libelle(genre, valeur) {
  const noms = catalogue.libelles[genre] || {};
  return noms[valeur] || valeur;
}

function texteCours(cours) {
  const morceaux = [];
  if (cours.matiere) morceaux.push(libelle("matiere", cours.matiere));
  if (cours.classe) morceaux.push(libelle("classe", cours.classe));
  if (cours.specialite) morceaux.push(libelle("specialite", cours.specialite));
  return morceaux.join(" · ");
}

async function creerSelecteur(conteneur, options) {
  const complet = options.complet;
  const cat = await chargerCatalogue();
  let choix = { matiere: null, classe: null, specialite: null };

  if (options.memoire) {
    try {
      const vieux = JSON.parse(sessionStorage.getItem("srn_cours"));
      const classes = cat.cours[vieux.matiere];
      if (classes && classes[vieux.classe] && classes[vieux.classe].includes(vieux.specialite)) {
        choix = vieux;
      }
    } catch (e) {}
  }

  function classesDe(matiere) {
    return Object.keys(cat.cours[matiere]).sort(function (a, b) {
      return ORDRE_CLASSES.indexOf(a) - ORDRE_CLASSES.indexOf(b);
    });
  }

  function choisirAuto() {
    if (!complet || !choix.matiere) return;
    const classes = classesDe(choix.matiere);
    if (!choix.classe && classes.length === 1) choix.classe = classes[0];
    if (choix.classe && !choix.specialite) {
      const specialites = cat.cours[choix.matiere][choix.classe];
      if (specialites.length === 1) choix.specialite = specialites[0];
    }
  }

  function lireChoix() {
    if (!choix.matiere) return null;
    if (complet && (!choix.classe || !choix.specialite)) return null;
    return { matiere: choix.matiere, classe: choix.classe, specialite: choix.specialite };
  }

  function dessinerLigne(titre, valeurs, genre, actuel, quandClic, bloque) {
    const ligne = el("div", "selecteur-niveau");
    ligne.appendChild(el("span", "etiquette", titre));
    valeurs.forEach(function (valeur) {
      let classe = "carte";
      if (actuel === valeur) classe += " choisie";
      if (bloque) classe += " disabled";
      const bouton = el("button", classe, libelle(genre, valeur));
      bouton.type = "button";
      if (!bloque) {
        bouton.addEventListener("click", function () {
          quandClic(actuel === valeur && !complet ? null : valeur);
          miseAJour();
        });
      }
      ligne.appendChild(bouton);
    });
    conteneur.appendChild(ligne);
  }

  function dessiner() {
    conteneur.textContent = "";

    const matieres = Object.keys(cat.cours).sort(function (a, b) {
      return libelle("matiere", a).localeCompare(libelle("matiere", b), "fr");
    });
    dessinerLigne("Matière", matieres, "matiere", choix.matiere, function (v) {
      choix = { matiere: v, classe: null, specialite: null };
    }, false);
    if (!choix.matiere) return;

    const classes = classesDe(choix.matiere);
    dessinerLigne("Classe", classes, "classe", choix.classe, function (v) {
      choix.classe = v;
      choix.specialite = null;
    }, complet && classes.length === 1);
    if (!choix.classe) return;

    const specialites = cat.cours[choix.matiere][choix.classe];
    const seule = complet && specialites.length === 1;
    dessinerLigne("Spécialité", specialites, "specialite", choix.specialite, function (v) {
      choix.specialite = v;
    }, seule);
    if (seule) {
      conteneur.appendChild(el("p", "note-auto", "Seule spécialité disponible, sélectionnée automatiquement."));
    }
  }

  let dernierChoix = JSON.stringify(lireChoix());

  function miseAJour() {
    choisirAuto();
    if (options.memoire) sessionStorage.setItem("srn_cours", JSON.stringify(choix));
    dessiner();
    const nouveau = JSON.stringify(lireChoix());
    if (nouveau !== dernierChoix) {
      dernierChoix = nouveau;
      options.onChange(lireChoix());
    }
  }

  choisirAuto();
  dessiner();
  dernierChoix = JSON.stringify(lireChoix());

  return {
    get: lireChoix,
    reset: function () {
      choix = { matiere: null, classe: null, specialite: null };
      miseAJour();
    },
  };
}

function creerCarteFiche(f, options) {
  const carte = el("div", "fiche");
  carte.appendChild(el("h3", "", f.titre));

  const cours = texteCours({ matiere: f.matiere, classe: f.classe, specialite: f.specialite });
  carte.appendChild(el("p", "meta", f.auteur + " — " + cours + " — " + formaterDate(f.date)));

  if (f.description) carte.appendChild(el("p", "desc", f.description));
  carte.appendChild(el("p", "fichier", "Fichier : " + f.nom_original + " (" + formaterTaille(f.taille) + ")"));

  const actions = el("div", "actions");
  const lien = el("a", "telecharger", "Télécharger");
  lien.href = "/api/telecharger/" + f.id;
  lien.setAttribute("download", f.nom_original);
  actions.appendChild(lien);

  const boutons = (options && options.actions) || [];
  boutons.forEach(function (a) {
    if (a.visible === false) return;
    const bouton = el("button", "bouton-clair " + (a.classe || ""), a.libelle);
    bouton.type = "button";
    bouton.addEventListener("click", function () {
      a.action(carte);
    });
    actions.appendChild(bouton);
  });

  carte.appendChild(actions);
  return carte;
}

async function adapterLienCompte() {
  const lien = document.querySelector('nav a[href="compte.html"]');
  if (!lien || lien.classList.contains("actif")) return;
  const r = await api("/api/compte/moi");
  if (r.ok && r.data.connecte) {
    lien.textContent = "Mon espace";
    lien.href = "/espace";
  }
}
adapterLienCompte();
