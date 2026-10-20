/* Menu, filtres et recherche. Ce fichier ne contacte pas le site Flask. */

(function () {
  var COULEURS = {
    guide: { texte: "#1c2430", fond: "#ece7dc", nom: "Présentation" },
    python: { texte: "#1d4e89", fond: "#e7f0fa", nom: "Python" },
    javascript: { texte: "#8a4b08", fond: "#fbf0dc", nom: "JavaScript" },
    html: { texte: "#1d6b4f", fond: "#e5f4ec", nom: "HTML" },
    css: { texte: "#6b3fa0", fond: "#f3eafa", nom: "CSS" }
  };

  var docs = (window.DOCS || []).map(function (entree, index) {
    entree.id = entree.langue + "-" + index;
    return entree;
  });

  var menu = document.getElementById("menu");
  var lecture = document.getElementById("lecture");
  var recherche = document.getElementById("recherche");
  var filtres = document.getElementById("filtres");
  var langueActive = "tout";
  var courant = null;

  function normaliser(valeur) {
    return String(valeur || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function couleur(langue) {
    return COULEURS[langue] || COULEURS.guide;
  }

  function correspond(entree, aiguille) {
    if (langueActive !== "tout" && entree.langue !== langueActive) return false;
    if (!aiguille) return true;
    var precision = precisionDe(entree);
    var sac = [
      entree.nom, entree.fichier, entree.signature, entree.resume, entree.detail, entree.genre,
      couleur(entree.langue).nom,
      precision.variables.map(function (pair) { return pair[0] + " " + pair[1]; }).join(" "),
      precision.actions.join(" ")
    ].join(" ");
    return normaliser(sac).indexOf(aiguille) !== -1;
  }

  function precisionDe(entree) {
    var table = window.PRECISIONS || {};
    return table[entree.fichier + "\n" + entree.nom] || { variables: [], actions: [] };
  }

  function titreSection(texte) {
    var titre = document.createElement("h3");
    titre.textContent = texte;
    return titre;
  }

  function tableauVariables(paires) {
    var table = document.createElement("table");
    table.className = "variables";
    paires.forEach(function (pair) {
      var ligne = document.createElement("tr");
      var nom = document.createElement("th");
      nom.textContent = pair[0];
      var sens = document.createElement("td");
      sens.textContent = pair[1];
      ligne.append(nom, sens);
      table.append(ligne);
    });
    return table;
  }

  function listeActions(actions) {
    var ol = document.createElement("ol");
    ol.className = "actions-doc";
    actions.forEach(function (texte) {
      var li = document.createElement("li");
      li.textContent = texte;
      ol.append(li);
    });
    return ol;
  }

  function ouvrir(entree) {
    courant = entree.id;
    var teinte = couleur(entree.langue);
    lecture.replaceChildren();
    var badges = document.createElement("p");
    var badgeLangue = document.createElement("span");
    badgeLangue.className = "badge";
    badgeLangue.style.background = teinte.texte;
    badgeLangue.textContent = teinte.nom;
    var badgeGenre = document.createElement("span");
    badgeGenre.className = "badge";
    badgeGenre.style.background = "#4d5968";
    badgeGenre.textContent = entree.genre;
    badges.append(badgeLangue, badgeGenre);
    var titre = document.createElement("h2");
    titre.textContent = entree.nom;
    var chemin = document.createElement("p");
    chemin.className = "chemin";
    chemin.textContent = entree.fichier;
    var signature = document.createElement("pre");
    signature.className = "signature";
    signature.textContent = entree.signature;
    var resume = document.createElement("p");
    resume.className = "resume";
    resume.textContent = entree.resume;
    var detail = document.createElement("p");
    detail.className = "detail";
    detail.textContent = entree.detail;
    lecture.append(badges, titre, chemin, signature, resume, detail);
    var precision = precisionDe(entree);
    if (precision.variables.length) {
      lecture.append(titreSection("Variables"), tableauVariables(precision.variables));
    }
    if (precision.actions.length) {
      lecture.append(titreSection("Actions, dans l'ordre"), listeActions(precision.actions));
    }
    if (location.hash !== "#" + entree.id) {
      history.replaceState(null, "", "#" + entree.id);
    }
    lecture.focus();
    document.querySelectorAll(".lien-fonction").forEach(function (bouton) {
      bouton.classList.toggle("actif", bouton.dataset.id === entree.id);
    });
  }

  function peindreFiltres() {
    filtres.replaceChildren();
    var choix = [{ id: "tout", nom: "Tout", texte: "#1c2430" }].concat(
      Object.keys(COULEURS).map(function (cle) {
        return { id: cle, nom: COULEURS[cle].nom, texte: COULEURS[cle].texte };
      })
    );
    choix.forEach(function (item) {
      var bouton = document.createElement("button");
      bouton.type = "button";
      bouton.className = "puce";
      bouton.textContent = item.nom;
      bouton.setAttribute("aria-pressed", item.id === langueActive ? "true" : "false");
      if (item.id === langueActive) {
        bouton.style.background = item.texte;
        bouton.style.borderColor = item.texte;
      } else {
        bouton.style.color = item.texte;
        bouton.style.borderColor = item.texte;
      }
      bouton.addEventListener("click", function () {
        langueActive = item.id;
        peindreFiltres();
        peindreMenu();
      });
      filtres.append(bouton);
    });
  }

  function peindreMenu() {
    var aiguille = normaliser(recherche.value.trim());
    var visibles = docs.filter(function (entree) { return correspond(entree, aiguille); });
    menu.replaceChildren();
    var compte = document.createElement("p");
    compte.className = "compte";
    compte.textContent = visibles.length + (visibles.length > 1 ? " résultats" : " résultat");
    menu.append(compte);
    if (!visibles.length) {
      var vide = document.createElement("p");
      vide.className = "vide-menu";
      vide.textContent = "Aucun texte ne correspond.";
      menu.append(vide);
      return;
    }

    var parLangue = {};
    visibles.forEach(function (entree) {
      parLangue[entree.langue] = parLangue[entree.langue] || {};
      parLangue[entree.langue][entree.fichier] = parLangue[entree.langue][entree.fichier] || [];
      parLangue[entree.langue][entree.fichier].push(entree);
    });

    Object.keys(COULEURS).forEach(function (langue) {
      if (!parLangue[langue]) return;
      var bloc = document.createElement("details");
      bloc.className = "langue";
      bloc.open = true;
      var titre = document.createElement("summary");
      titre.textContent = couleur(langue).nom;
      titre.style.color = couleur(langue).texte;
      bloc.append(titre);
      Object.keys(parLangue[langue]).sort().forEach(function (fichier) {
        var groupe = document.createElement("details");
        groupe.className = "fichier";
        groupe.open = Boolean(aiguille) || fichier === "Présentation";
        var sousTitre = document.createElement("summary");
        sousTitre.textContent = fichier;
        groupe.append(sousTitre);
        var liste = document.createElement("div");
        liste.className = "liste-fonctions";
        parLangue[langue][fichier].forEach(function (entree) {
          var bouton = document.createElement("button");
          bouton.type = "button";
          bouton.className = "lien-fonction";
          bouton.dataset.id = entree.id;
          bouton.textContent = entree.nom;
          bouton.style.borderLeftColor = couleur(langue).texte;
          if (courant === entree.id) bouton.classList.add("actif");
          bouton.addEventListener("click", function () { ouvrir(entree); });
          liste.append(bouton);
        });
        groupe.append(liste);
        bloc.append(groupe);
      });
      menu.append(bloc);
    });
  }

  document.getElementById("form-recherche").addEventListener("submit", function (event) {
    event.preventDefault();
    var aiguille = normaliser(recherche.value.trim());
    var visibles = docs.filter(function (entree) { return correspond(entree, aiguille); });
    if (visibles.length === 1) ouvrir(visibles[0]);
  });

  recherche.addEventListener("input", peindreMenu);

  var demande = decodeURIComponent((location.hash || "").replace(/^#/, ""));
  var initiale = docs.filter(function (entree) { return entree.id === demande; })[0] || docs[0];
  peindreFiltres();
  if (initiale) ouvrir(initiale);
  peindreMenu();
})();
