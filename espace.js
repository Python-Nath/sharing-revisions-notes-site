const statusEl = document.getElementById("status");

function zoneDe(id) {
  const section = document.getElementById(id);
  return section ? section.querySelector(".contenu") : null;
}

function codeAleatoire() {
  const octets = new Uint8Array(8);
  crypto.getRandomValues(octets);
  let texte = "";
  octets.forEach(function (o) {
    texte += o.toString(16).padStart(2, "0");
  });
  return texte.slice(0, 8) + "-" + texte.slice(8);
}

function ajouterChamp(form, id, texteLabel, valeur, grand) {
  const p = el("p");
  const label = el("label", "", texteLabel);
  label.htmlFor = id;
  const champ = el(grand ? "textarea" : "input");
  champ.id = id;
  champ.value = valeur;
  if (!grand) champ.type = "text";
  p.appendChild(label);
  p.appendChild(champ);
  form.appendChild(p);
  return champ;
}

function modifierFiche(carte, f, recharger) {
  carte.textContent = "";
  const form = el("form", "edition");
  const titre = ajouterChamp(form, "e-titre-" + f.id, "Titre", f.titre);
  const auteur = ajouterChamp(form, "e-auteur-" + f.id, "Auteur", f.auteur);
  const description = ajouterChamp(form, "e-desc-" + f.id, "Description", f.description, true);

  const boutons = el("div", "actions");
  const valider = el("button", "", "Enregistrer");
  valider.type = "submit";
  const annuler = el("button", "bouton-clair", "Annuler");
  annuler.type = "button";
  annuler.addEventListener("click", recharger);
  boutons.appendChild(valider);
  boutons.appendChild(annuler);
  form.appendChild(boutons);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const r = await api("/api/fiches/" + f.id + "/modifier", {
      json: { titre: titre.value, auteur: auteur.value, description: description.value },
    });
    if (!r.ok) {
      setStatus(statusEl, messageErreur(r), "erreur");
      return;
    }
    setStatus(statusEl, "Fiche modifiée.", "ok");
    recharger();
  });
  carte.appendChild(form);
}

async function supprimerFiche(f, recharger) {
  if (!confirm("Supprimer définitivement « " + f.titre + " » ?")) return;
  const r = await api("/api/fiches/" + f.id + "/supprimer", { method: "POST" });
  if (!r.ok) {
    setStatus(statusEl, messageErreur(r), "erreur");
    return;
  }
  setStatus(statusEl, "Fiche supprimée.", "ok");
  recharger();
}

function boutonsDeFiche(f, recharger) {
  return [
    {
      libelle: "Modifier",
      visible: f.peut_modifier,
      action: function (carte) {
        modifierFiche(carte, f, recharger);
      },
    },
    {
      libelle: "Supprimer",
      classe: "bouton-danger",
      visible: f.peut_supprimer,
      action: function () {
        supprimerFiche(f, recharger);
      },
    },
  ];
}

function remplirListe(liste, fiches, recharger) {
  fiches.forEach(function (f) {
    liste.appendChild(creerCarteFiche(f, { actions: boutonsDeFiche(f, recharger) }));
  });
}

function sectionMesFiches() {
  const zone = zoneDe("section-mes-fiches");
  if (!zone) return;

  async function charger() {
    const r = await api("/api/compte/mes-fiches");
    zone.textContent = "";
    if (!r.ok) {
      zone.appendChild(el("p", "note-auto", messageErreur(r)));
    } else if (r.data.fiches.length === 0) {
      zone.appendChild(el("p", "compteur", "Aucune fiche déposée avec ce compte pour le moment."));
    } else {
      const liste = el("div", "liste-fiches");
      remplirListe(liste, r.data.fiches, charger);
      zone.appendChild(liste);
    }
  }
  charger();
}

function sectionToutesFiches() {
  const zone = zoneDe("section-toutes-fiches");
  if (!zone) return;

  const recherche = el("input");
  recherche.type = "search";
  recherche.placeholder = "Filtrer par mot-clé";
  const info = el("p", "compteur");
  const liste = el("div", "liste-fiches");
  zone.appendChild(recherche);
  zone.appendChild(info);
  zone.appendChild(liste);

  async function charger() {
    const params = new URLSearchParams({ q: recherche.value.trim(), limite: 50 });
    const r = await api("/api/recherche?" + params.toString());
    liste.textContent = "";
    if (!r.ok) {
      info.textContent = messageErreur(r);
      return;
    }
    const total = r.data.total;
    info.textContent = total === 1 ? "1 fiche" : total + " fiches";
    if (total > 50) info.textContent += " (50 premières affichées)";
    remplirListe(liste, r.data.fiches, charger);
  }

  let minuteur = null;
  recherche.addEventListener("input", function () {
    clearTimeout(minuteur);
    minuteur = setTimeout(charger, 250);
  });
  charger();
}

function sectionMotsDePasse() {
  const zone = zoneDe("section-mdp");
  if (!zone) return;

  async function charger() {
    const r = await api("/api/compte/mots-de-passe");
    zone.textContent = "";
    if (!r.ok) {
      zone.appendChild(el("p", "note-auto", messageErreur(r)));
      return;
    }
    const d = r.data;

    const table = el("table", "tableau");
    const entete = el("tr");
    entete.appendChild(el("th", "", "Nom"));
    entete.appendChild(el("th", "", "Type"));
    entete.appendChild(el("th", "", ""));
    table.appendChild(entete);

    d.comptes.forEach(function (c) {
      const ligne = el("tr");
      ligne.appendChild(el("td", "", c.nom));
      ligne.appendChild(el("td", "", d.libelles[c.type]));
      const cellule = el("td");

      const gerable = d.types_gerables.includes(c.type);
      const estMoi = c.nom.toLowerCase() === d.moi.toLowerCase();
      if (gerable && !estMoi) {
        const bouton = el("button", "bouton-clair bouton-danger", "Supprimer");
        bouton.type = "button";
        bouton.addEventListener("click", async function () {
          if (!confirm("Supprimer le compte « " + c.nom + " » ?")) return;
          const res = await api("/api/compte/mots-de-passe/supprimer", { json: { nom: c.nom } });
          if (!res.ok) {
            setStatus(statusEl, messageErreur(res), "erreur");
            return;
          }
          setStatus(statusEl, "Compte supprimé.", "ok");
          charger();
        });
        cellule.appendChild(bouton);
      }
      ligne.appendChild(cellule);
      table.appendChild(ligne);
    });
    zone.appendChild(table);

    zone.appendChild(el("h3", "", "Ajouter un compte"));
    const form = el("form", "formulaire-ligne");
    const nom = ajouterChamp(form, "nouveau-nom", "Nom", "");
    nom.required = true;
    nom.maxLength = 40;

    const pType = el("p");
    const lType = el("label", "", "Type");
    lType.htmlFor = "nouveau-type";
    const choixType = el("select");
    choixType.id = "nouveau-type";
    d.types_gerables.forEach(function (t) {
      const option = el("option", "", d.libelles[t]);
      option.value = t;
      choixType.appendChild(option);
    });
    pType.appendChild(lType);
    pType.appendChild(choixType);
    form.appendChild(pType);

    const mdp = ajouterChamp(form, "nouveau-mdp", "Mot de passe", "");
    mdp.required = true;
    mdp.minLength = 6;
    mdp.autocomplete = "off";

    const boutons = el("div", "actions");
    const generer = el("button", "bouton-clair", "Générer");
    generer.type = "button";
    generer.addEventListener("click", function () {
      mdp.value = codeAleatoire();
    });
    const ajouter = el("button", "", "Ajouter");
    ajouter.type = "submit";
    boutons.appendChild(generer);
    boutons.appendChild(ajouter);
    form.appendChild(boutons);

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const res = await api("/api/compte/mots-de-passe/ajouter", {
        json: { nom: nom.value, type: choixType.value, mot_de_passe: mdp.value },
      });
      if (!res.ok) {
        setStatus(statusEl, messageErreur(res), "erreur");
        return;
      }
      setStatus(statusEl, "Compte ajouté. Mot de passe à transmettre : " + mdp.value, "ok");
      charger();
    });
    zone.appendChild(form);
  }
  charger();
}

async function sectionStats() {
  const zone = zoneDe("section-stats");
  if (!zone) return;

  const r = await api("/api/stats");
  if (!r.ok) {
    zone.appendChild(el("p", "note-auto", messageErreur(r)));
    return;
  }
  const d = r.data;
  const grille = el("div", "grille-stats");

  function ajouterTuile(valeur, etiquette) {
    const tuile = el("div", "tuile");
    tuile.appendChild(el("strong", "", String(valeur)));
    tuile.appendChild(el("span", "", etiquette));
    grille.appendChild(tuile);
  }
  ajouterTuile(d.fiches, d.fiches > 1 ? "fiches" : "fiche");
  ajouterTuile(formaterTaille(d.taille_totale), "stockés");
  d.comptes.forEach(function (c) {
    ajouterTuile(c.nombre, c.libelle);
  });
  zone.appendChild(grille);

  if (d.par_matiere.length > 0) {
    zone.appendChild(el("h3", "", "Fiches par matière"));
    const liste = el("ul", "types-comptes");
    d.par_matiere.forEach(function (x) {
      liste.appendChild(el("li", "", x.matiere + " : " + x.nombre));
    });
    zone.appendChild(liste);
  }
}

async function demarrer() {
  const moi = await api("/api/compte/moi");
  if (!moi.ok || !moi.data.connecte) {
    location.href = "/compte.html";
    return;
  }
  const m = moi.data;

  try {
    await chargerCatalogue();
  } catch (e) {
    setStatus(statusEl, e.message, "erreur");
    return;
  }

  document.getElementById("identite").textContent = "Connecté en tant que " + m.nom + " (" + m.libelle + ")";

  const autres = document.getElementById("autres-espaces");
  const autresEspaces = m.espaces.filter(function (e) {
    return e.type !== m.type;
  });
  if (autresEspaces.length > 0) {
    autres.appendChild(el("span", "etiquette", "Autres espaces :"));
    autresEspaces.forEach(function (e) {
      const lien = el("a", "", e.libelle);
      lien.href = "/espace/" + e.type;
      autres.appendChild(lien);
    });
  }

  document.getElementById("deconnexion").addEventListener("click", async function () {
    await api("/api/compte/deconnexion", { method: "POST" });
    location.href = "/compte.html";
  });

  sectionStats();
  sectionMesFiches();
  sectionToutesFiches();
  sectionMotsDePasse();
}

demarrer();
