/* Graphiques dessinés ici, sans bibliothèque. Les largeurs partent de zéro puis s'animent. */

function barreAnimee(etiquette, valeur, maximum, detail) {
  const ligne = document.createElement("div");
  ligne.className = "ligne-graphique";
  const legende = document.createElement("p");
  legende.textContent = etiquette + " · " + detail;
  const piste = document.createElement("div");
  piste.className = "piste";
  const remplissage = document.createElement("span");
  const part = maximum > 0 ? Math.max(valeur > 0 ? 6 : 0, Math.round(valeur / maximum * 100)) : 0;
  remplissage.style.setProperty("--largeur", part + "%");
  piste.append(remplissage);
  ligne.append(legende, piste);
  return ligne;
}

function anneau(parts) {
  const bloc = document.createElement("div");
  bloc.className = "bloc-anneau";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 42 42");
  svg.setAttribute("class", "anneau");
  svg.setAttribute("role", "img");
  const total = parts.reduce(function (somme, part) { return somme + part.valeur; }, 0) || 1;
  let depart = 0;
  parts.forEach(function (part) {
    const portion = part.valeur / total * 100;
    if (portion <= 0) return;
    const cercle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    cercle.setAttribute("cx", "21");
    cercle.setAttribute("cy", "21");
    cercle.setAttribute("r", "15.9");
    cercle.setAttribute("fill", "none");
    cercle.setAttribute("stroke", part.couleur);
    cercle.setAttribute("stroke-width", "6");
    cercle.setAttribute("pathLength", "100");
    cercle.style.strokeDashoffset = String(25 - depart);
    cercle.style.setProperty("--part", String(portion));
    cercle.classList.add("segment");
    svg.append(cercle);
    depart += portion;
  });
  const liste = document.createElement("ul");
  liste.className = "legende-anneau";
  parts.forEach(function (part) {
    const item = document.createElement("li");
    const puce = document.createElement("i");
    puce.style.background = part.couleur;
    item.append(puce, document.createTextNode(part.libelle + " · " + part.valeur));
    liste.append(item);
  });
  bloc.append(svg, liste);
  return bloc;
}
