/* Audit d'un élève. Les chiffres viennent de /users/audit.json, jamais d'un autre compte. */

document.addEventListener("DOMContentLoaded", function () {
  let audit = lireJson("audit-data");

  function nombre(valeur) {
    return Number(valeur || 0).toLocaleString("fr-FR");
  }

  function octets(valeur) {
    const n = Number(valeur || 0);
    const unites = ["o", "Ko", "Mo", "Go"];
    let reste = n;
    let index = 0;
    while (reste >= 1024 && index < unites.length - 1) {
      reste /= 1024;
      index += 1;
    }
    const texte = index === 0
      ? String(Math.round(reste))
      : reste.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
    return texte + " " + unites[index];
  }

  function dateCourte(iso) {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString("fr-FR");
  }

  function vider(id) {
    const zone = document.getElementById(id);
    if (zone) zone.replaceChildren();
    return zone;
  }

  function carte(libelle, valeur, detail) {
    const article = document.createElement("article");
    article.className = "stat";
    const fort = document.createElement("strong");
    fort.textContent = valeur;
    const span = document.createElement("span");
    span.textContent = libelle;
    article.append(fort, span);
    if (detail) {
      const petit = document.createElement("small");
      petit.textContent = detail;
      article.append(petit);
    }
    return article;
  }

  function tableau(colonnes, lignes, vide) {
    if (!lignes.length) {
      const paragraphe = document.createElement("p");
      paragraphe.className = "vide";
      paragraphe.textContent = vide;
      return paragraphe;
    }
    const enveloppe = document.createElement("div");
    enveloppe.className = "table-scroll";
    const table = document.createElement("table");
    table.className = "comptes";
    const entete = document.createElement("tr");
    colonnes.forEach(function (colonne) {
      const th = document.createElement("th");
      th.textContent = colonne;
      entete.append(th);
    });
    const thead = document.createElement("thead");
    thead.append(entete);
    const corps = document.createElement("tbody");
    lignes.forEach(function (cellules) {
      const tr = document.createElement("tr");
      cellules.forEach(function (cellule) {
        const td = document.createElement("td");
        td.textContent = cellule == null ? "" : String(cellule);
        tr.append(td);
      });
      corps.append(tr);
    });
    table.append(thead, corps);
    enveloppe.append(table);
    return enveloppe;
  }

  function cours(fiche) {
    return [fiche.matiere, fiche.classe, fiche.specialite].filter(Boolean).join(" · ");
  }

  function audience(valeur) {
    if (valeur === "auteur") return "Tous les utilisateurs";
    if (valeur === "equipe") return "Équipe";
    if (valeur === "les_deux") return "Utilisateurs et équipe";
    return valeur || "";
  }

  function statut(valeur, responsable) {
    if (valeur === "valide") return "Validé" + (responsable ? " par " + responsable : "");
    if (valeur === "pris") return "Pris en charge" + (responsable ? " par " + responsable : "");
    return "En attente";
  }

  function peindre() {
    if (!audit) return;
    const resume = audit.resume || {};
    const commentaires = resume.commentaires || {};
    const zone = vider("zone-resume");
    zone.append(
      carte("Fiches", nombre(resume.fiches)),
      carte("Volume", octets(resume.octets)),
      carte("Étoiles reçues", nombre(resume.etoiles)),
      carte("Téléchargements", nombre(resume.telechargements), "de tes fiches"),
      carte("Commentaires ouverts", nombre(commentaires.ouverts)),
      carte("Pris en charge", nombre(commentaires.pris)),
      carte("Validés", nombre(commentaires.valides))
    );
    const plus = document.getElementById("zone-plus");
    plus.textContent = audit.plus_etoilee
      ? "Ta fiche la plus étoilée : " + audit.plus_etoilee.titre
        + " (" + nombre(audit.plus_etoilee.etoiles) + ")."
      : "Aucune de tes fiches n'a encore d'étoile.";

    vider("zone-fiches").append(tableau(
      ["Titre", "Cours", "Étoiles", "Commentaires", "Taille"],
      (audit.liste || []).map(function (fiche) {
        const suivi = fiche.commentaires || {};
        const detail = nombre(suivi.ouverts) + " ouverts, "
          + nombre(suivi.pris) + " pris, "
          + nombre(suivi.valides) + " validés";
        return [fiche.titre, cours(fiche), nombre(fiche.etoiles), detail, octets(fiche.octets)];
      }),
      "Tu n'as pas encore publié de fiche."
    ));

    vider("zone-commentaires").append(tableau(
      ["Fiche", "Commentaire", "Visible par", "État", "Quand"],
      (audit.commentaires_recents || []).map(function (ligne) {
        return [
          ligne.fiche + (ligne.matiere ? " · " + ligne.matiere : ""),
          ligne.texte,
          audience(ligne.audience),
          statut(ligne.statut, ligne.responsable),
          dateCourte(ligne.le)
        ];
      }),
      "Aucun commentaire à lire."
    ));
  }

  document.getElementById("bouton-actualiser").addEventListener("click", function () {
    api("/users/audit.json").then(function (reponse) {
      if (reponse.status === 401) {
        window.location.assign("/auth/login-page?next=/users/audit");
        return;
      }
      if (!reponse.ok) {
        afficherStatut("statut", reponse.data.error || "Relevé indisponible", "erreur");
        return;
      }
      audit = reponse.data;
      peindre();
      afficherStatut("statut", "Relevé actualisé.", "ok");
    });
  });

  peindre();
});
