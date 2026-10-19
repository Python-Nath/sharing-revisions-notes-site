const statusEl = document.getElementById("status");
const zoneConnexion = document.getElementById("zone-connexion");
const zoneConnecte = document.getElementById("zone-connecte");
const formulaire = document.getElementById("connexion");
const champ = document.getElementById("mdp");

function afficher(moi) {
  const connecte = moi && moi.connecte;
  zoneConnexion.hidden = connecte;
  zoneConnecte.hidden = !connecte;
  if (connecte) {
    document.getElementById("titre-connecte").textContent = "Connecté : " + moi.nom + " (" + moi.libelle + ")";
  }
}

async function connecter(e) {
  e.preventDefault();
  const bouton = formulaire.querySelector("button");
  bouton.disabled = true;
  setStatus(statusEl, "Vérification…", "info");

  const r = await api("/api/compte/connexion", { json: { mot_de_passe: champ.value } });
  bouton.disabled = false;

  if (!r.ok) {
    setStatus(statusEl, messageErreur(r), "erreur");
    champ.select();
    return;
  }
  location.href = r.data.espace;
}

async function deconnecter() {
  await api("/api/compte/deconnexion", { method: "POST" });
  champ.value = "";
  setStatus(statusEl, "Tu es déconnecté.", "ok");
  afficher(null);
}

async function demarrer() {
  const moi = await api("/api/compte/moi");
  afficher(moi.ok ? moi.data : null);
  formulaire.addEventListener("submit", connecter);
  document.getElementById("quitter").addEventListener("click", deconnecter);
}

demarrer();
