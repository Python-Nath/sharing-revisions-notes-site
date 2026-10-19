const statusEl = document.getElementById("status");
const qInput = document.getElementById("q");
const triSelect = document.getElementById("tri");
const resumeFiltre = document.getElementById("resume-filtre");
const nbResultats = document.getElementById("nb-resultats");
const resultatsEl = document.getElementById("resultats");
const boutonPlus = document.getElementById("plus");

const TAILLE_PAGE = 20;
let filtre = null;
let depart = 0;
let minuteur = null;
let numeroRecherche = 0;

async function lancer(depuisDebut) {
  if (depuisDebut) depart = 0;
  numeroRecherche++;
  const monNumero = numeroRecherche;

  const q = qInput.value.trim();
  const params = new URLSearchParams({ q: q, tri: triSelect.value, depart: depart, limite: TAILLE_PAGE });
  if (filtre) {
    params.set("matiere", filtre.matiere);
    if (filtre.classe) params.set("classe", filtre.classe);
    if (filtre.specialite) params.set("specialite", filtre.specialite);
  }

  const r = await api("/api/recherche?" + params.toString());
  if (monNumero !== numeroRecherche) return;

  if (!r.ok) {
    setStatus(statusEl, messageErreur(r), "erreur");
    return;
  }
  setStatus(statusEl, "", "info");
  if (depuisDebut) resultatsEl.textContent = "";

  const total = r.data.total;
  if (total === 0) {
    nbResultats.textContent = q ? "Aucune fiche trouvée." : "Aucune fiche pour le moment.";
    boutonPlus.hidden = true;
    return;
  }

  let texte = total === 1 ? "1 fiche" : total + " fiches";
  if (!q) texte += ", les plus récentes d'abord";
  if (r.data.partiel) texte = "Aucune fiche ne contient tous les mots, voici les résultats partiels : " + texte;
  nbResultats.textContent = texte;

  r.data.fiches.forEach(function (fiche) {
    resultatsEl.appendChild(creerCarteFiche(fiche));
  });
  depart += r.data.fiches.length;
  boutonPlus.hidden = depart >= total;
}

async function demarrer() {
  const adresse = new URLSearchParams(location.search);
  qInput.value = adresse.get("q") || "";

  try {
    await chargerCatalogue();
  } catch (e) {
    setStatus(statusEl, e.message, "erreur");
    return;
  }

  const selecteur = await creerSelecteur(document.getElementById("selecteur"), {
    onChange: function (cours) {
      filtre = cours;
      resumeFiltre.textContent = cours ? texteCours(cours) : "aucun filtre";
      lancer(true);
    },
  });

  qInput.addEventListener("input", function () {
    clearTimeout(minuteur);
    minuteur = setTimeout(function () {
      lancer(true);
    }, 250);
  });
  document.getElementById("recherche").addEventListener("submit", function (e) {
    e.preventDefault();
    lancer(true);
  });
  triSelect.addEventListener("change", function () {
    lancer(true);
  });
  boutonPlus.addEventListener("click", function () {
    lancer(false);
  });
  document.getElementById("effacer").addEventListener("click", function () {
    selecteur.reset();
  });

  lancer(true);
}

demarrer();
