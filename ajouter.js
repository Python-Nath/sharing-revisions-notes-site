const statusEl = document.getElementById("status");
const recapEl = document.getElementById("recap");
const formulaire = document.getElementById("formulaire");
const form = document.getElementById("upload-form");
const fichierInput = document.getElementById("file");
const auteurInput = document.getElementById("author");

let coursChoisi = null;

function appliquerCours(cours) {
  coursChoisi = cours;
  if (cours) {
    recapEl.textContent = texteCours(cours);
    recapEl.classList.add("complet");
    formulaire.disabled = false;
  } else {
    recapEl.textContent = "Aucun cours choisi.";
    recapEl.classList.remove("complet");
    formulaire.disabled = true;
  }
}

async function envoyer(e) {
  e.preventDefault();
  if (!coursChoisi) {
    setStatus(statusEl, "Choisis un cours complet avant d'envoyer.", "erreur");
    return;
  }

  const auteur = auteurInput.value.trim();
  const donnees = new FormData();
  donnees.append("file", fichierInput.files[0]);
  donnees.append("titre", document.getElementById("title").value.trim());
  donnees.append("auteur", auteur);
  donnees.append("description", document.getElementById("desc").value.trim());
  donnees.append("matiere", coursChoisi.matiere);
  donnees.append("classe", coursChoisi.classe);
  donnees.append("specialite", coursChoisi.specialite);

  setStatus(statusEl, "Envoi en cours…", "info");
  formulaire.disabled = true;
  const r = await api("/api/upload", { body: donnees });
  formulaire.disabled = false;

  if (!r.ok) {
    setStatus(statusEl, messageErreur(r), "erreur");
    return;
  }
  localStorage.setItem("srn_auteur", auteur);
  setStatus(statusEl, "Fiche envoyée avec succès.", "ok");
  form.reset();
  auteurInput.value = auteur;
}

async function demarrer() {
  auteurInput.value = localStorage.getItem("srn_auteur") || "";

  let cat;
  try {
    cat = await chargerCatalogue();
  } catch (e) {
    setStatus(statusEl, e.message, "erreur");
    return;
  }
  fichierInput.accept = "." + cat.extensions.join(",.");
  document.getElementById("aide-fichier").textContent =
    "Formats : " + cat.extensions.join(", ") + ". Taille maximale : " + Math.round(cat.taille_max / 1048576) + " Mo.";

  const moi = await api("/api/compte/moi");
  if (moi.data.connecte && !auteurInput.value) auteurInput.value = moi.data.nom;

  const selecteur = await creerSelecteur(document.getElementById("selecteur"), {
    complet: true,
    memoire: true,
    onChange: appliquerCours,
  });
  appliquerCours(selecteur.get());

  form.addEventListener("submit", envoyer);
}

demarrer();
