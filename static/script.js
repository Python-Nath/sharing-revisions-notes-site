const $ = (id) => document.getElementById(id);
const [matiere, classe, spe] = ["matiere", "classe", "specialite"].map($);
const catalog = {};
let current;

const CLASSES = { "2nd": "Seconde", "1ere": "Première", term: "Terminale" };
const LABELS = { specialite: "Spécialité", "pas-specialite": "Sans spécialité", euro: "Euro", option: "Option" };

const ok = (names) => names.filter((n) => !n.startsWith("."));
const fill = (select, entries) =>
  (select.innerHTML = entries.map(([v, l]) => `<option value="${v}">${l}</option>`).join(""));

function status(message, error) {
  $("status").textContent = message;
  $("status").style.color = error ? "red" : "green";
}

async function get(path) {
  const res = await fetch(path);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur HTTP " + res.status);
  return data;
}

async function loadCatalog() {
  for (const m of ok((await get("/info/matiere")).matiere)) {
    catalog[m] = {};
    for (const c of ok((await get("/info/classe/" + m)).classe)) {
      catalog[m][c] = ok((await get(`/info/specialite/${m}/${c}`)).specialite);
    }
  }
}

function buildMenus() {
  const names = Object.keys(catalog);
  const matieres = [...new Set(names.map((m) => m.replace("DNL-", "")))].sort();
  const spes = new Set(names.flatMap((m) => Object.values(catalog[m]).flat()));
  spes.delete("pas-specialite");
  fill(matiere, [["", "-- choisir --"], ...matieres.map((m) => [m, m])]);
  fill(classe, [["", "-- choisir --"], ...Object.entries(CLASSES)]);
  fill(spe, [["pas-specialite", LABELS["pas-specialite"]], ...[...spes].map((s) => [s, LABELS[s] || s]), ["dnl", "DNL"]]);
}

function resolve() {
  if (!matiere.value || !classe.value) return;
  const dnl = spe.value === "dnl";
  const list = catalog[(dnl ? "DNL-" : "") + matiere.value]?.[classe.value];
  const found = dnl ? list?.[0] : list?.find((s) => s === spe.value);
  return found && [dnl ? "DNL-" + matiere.value : matiere.value, classe.value, found].join("/");
}

async function refresh() {
  const [m, c, s] = [matiere, classe, spe].map((x) => x.selectedOptions[0].text);
  $("summary").textContent = `Matière : ${m} | Classe : ${c} | Spécialité : ${s}`;
  status("");
  current = resolve();
  $("course").hidden = !current;
  $("unavailable").hidden = !(matiere.value && classe.value && !current);
  if (!current) return;

  const path = current;
  try {
    const { files } = await get("/info/files/" + path);
    if (path !== current) return;
    $("files").innerHTML =
      files
        .filter((f) => f.endsWith(".json"))
        .map((f) => `<li><a href="/download/${path}/${f.slice(0, -5)}">${f.slice(0, -5)}</a></li>`)
        .join("") || "<li>Aucun fichier pour le moment.</li>";
  } catch (e) {
    status(e.message, true);
  }
}

$("upload-form").onsubmit = async (event) => {
  event.preventDefault();
  try {
    const res = await fetch("/upload/" + current, { method: "POST", body: new FormData(event.target) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Erreur HTTP " + res.status);
    event.target.reset();
    await refresh();
    status("Fichier envoyé avec succès.");
  } catch (e) {
    status("Échec de l'envoi : " + e.message, true);
  }
};

[matiere, classe, spe].forEach((select) => (select.onchange = refresh));

loadCatalog()
  .then(() => {
    buildMenus();
    refresh();
  })
  .catch((e) => status("Impossible de charger les cours : " + e.message, true));
