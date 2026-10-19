async function afficherCompteur() {
  const zone = document.getElementById("compteur-fiches");
  const r = await api("/api/recherche?limite=1");
  if (!r.ok) return;

  const n = r.data.total;
  if (n === 0) zone.textContent = "Aucune fiche pour le moment.";
  else if (n === 1) zone.textContent = "1 fiche disponible.";
  else zone.textContent = n + " fiches disponibles.";
}

afficherCompteur();
