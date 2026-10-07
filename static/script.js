const $ = (id) => document.getElementById(id);

// State
let currentPath = {
  matiere: "",
  classe: "",
  specialite: ""
};

// View Management
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  $(viewId).classList.remove('hidden');
}

function status(message, error = false) {
  $("status").textContent = message;
  $("status").style.color = error ? "red" : "green";
}

async function get(path) {
  const res = await fetch(path);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur HTTP " + res.status);
  return data;
}

function fillSelect(select, entries, label = "-- Choisir --") {
  select.innerHTML = `<option value="">${label}</option>`;
  entries.forEach(val => {
    const option = document.createElement('option');
    option.value = val;
    option.textContent = val;
    select.appendChild(option);
  });
}

// Sequential Loading Logic
async function initMatiere() {
  try {
    const data = await get("/info/matiere");
    fillSelect($("matiere"), data.matiere);
  } catch (e) {
    status("Erreur chargement matières : " + e.message, true);
  }
}

$("matiere").onchange = async () => {
  const m = $("matiere").value;
  currentPath.matiere = m;
  $("classe").disabled = true;
  $("specialite").disabled = true;
  $("classe").innerHTML = '<option value="">-- Choisir --</option>';
  $("specialite").innerHTML = '<option value="">-- Choisir --</option>';
  $("btn-next").disabled = true;
  $("summary").textContent = "Veuillez sélectionner une classe.";

  if (!m) return;

  try {
    const data = await get(`/info/classe/${m}`);
    fillSelect($("classe"), data.classe);
    $("classe").disabled = false;
  } catch (e) {
    status("Erreur chargement classes : " + e.message, true);
  }
};

$("classe").onchange = async () => {
  const c = $("classe").value;
  const m = $("matiere").value;
  currentPath.classe = c;
  $("specialite").disabled = true;
  $("specialite").innerHTML = '<option value="">-- Choisir --</option>';
  $("btn-next").disabled = true;
  $("summary").textContent = "Veuillez sélectionner une spécialité.";

  if (!c) return;

  try {
    const data = await get(`/info/specialite/${m}/${c}`);
    fillSelect($("specialite"), data.specialite);
    $("specialite").disabled = false;
  } catch (e) {
    status("Erreur chargement spécialités : " + e.message, true);
  }
};

$("specialite").onchange = () => {
  const s = $("specialite").value;
  currentPath.specialite = s;

  if (!s) {
    $("btn-next").disabled = true;
    $("summary").textContent = "Veuillez sélectionner une spécialité.";
    return;
  }

  $("summary").textContent = `Matière: ${currentPath.matiere}, Classe: ${currentPath.classe}, Spécialité: ${currentPath.specialite}`;
  $("btn-next").disabled = false;
};

// Navigation
$("btn-next").onclick = () => {
  $("choice-summary").textContent = `Vous avez choisi : ${currentPath.matiere} > ${currentPath.classe} > ${currentPath.specialite}`;
  showView("view-choice");
};

$("btn-back-selection").onclick = () => showView("view-selection");
$("btn-back-choice").onclick = () => showView("view-choice");
$("btn-back-choice-upload").onclick = () => showView("view-choice");

$("btn-go-upload").onclick = () => showView("view-upload");

$("btn-go-download").onclick = async () => {
  showView("view-download");
  const filesDiv = $("files");
  filesDiv.innerHTML = "Chargement des fiches...";

  try {
    const { metadata } = await get(`/info/files/${currentPath.matiere}/${currentPath.classe}/${currentPath.specialite}`);

    if (!metadata || metadata.length === 0) {
      filesDiv.innerHTML = "<p>Aucune fiche disponible pour le moment.</p>";
      return;
    }

    filesDiv.innerHTML = "";
    metadata.forEach(item => {
      const card = document.createElement('div');
      card.className = 'file-card';
      card.innerHTML = `
        <strong>${item.title}</strong> (par ${item.author})<br>
        <p>${item.desc}</p>
        <small>Fichier original: ${item.original_filename}</small><br>
        <a href="/download/${currentPath.matiere}/${currentPath.classe}/${currentPath.specialite}/${item.id}" target="_blank">Télécharger</a>
      `;
      filesDiv.appendChild(card);
    });
  } catch (e) {
    status("Erreur chargement fichiers : " + e.message, true);
    filesDiv.innerHTML = "Erreur lors du chargement.";
  }
};

// Upload
$("upload-form").onsubmit = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);

  try {
    const res = await fetch(`/upload/${currentPath.matiere}/${currentPath.classe}/${currentPath.specialite}`, {
      method: "POST",
      body: formData
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) throw new Error(data.error || "Erreur HTTP " + res.status);

    status(`Fichier "${data.metadata.title}" envoyé avec succès !`);
    event.target.reset();

    // Ensure the "See files" button is only added once
    if (!$("btn-view-files")) {
      const btn = document.createElement('button');
      btn.id = "btn-view-files";
      btn.textContent = "Voir les fichiers";
      btn.style.marginTop = "1rem";
      btn.onclick = () => $("btn-go-download").click();
      $("upload-form").appendChild(btn);
    }

  } catch (e) {
    status("Échec de l'envoi : " + e.message, true);
  }
};

// Initialize
initMatiere();
