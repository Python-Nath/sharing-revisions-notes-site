/* Page d'audit du propriétaire. Le texte passe par textContent. */

document.addEventListener("DOMContentLoaded", function () {
  let audit = lireJson("audit-data");
  let enCours = false;

  function nombre(valeur) {
    return Number(valeur || 0).toLocaleString("fr-FR");
  }

  function octets(valeur) {
    const n = Number(valeur || 0);
    const unites = ["o", "Ko", "Mo", "Go", "To"];
    let reste = n;
    let index = 0;
    while (reste >= 1024 && index < unites.length - 1) {
      reste /= 1024;
      index += 1;
    }
    const texte = index === 0
      ? String(Math.round(reste))
      : reste.toLocaleString("fr-FR", { maximumFractionDigits: reste >= 10 ? 0 : 1 });
    return texte + " " + unites[index];
  }

  function detailOctets(valeur) {
    return nombre(valeur) + " octets";
  }

  function dateCourte(iso) {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString("fr-FR");
  }

  function duree(secondes) {
    const total = Math.max(0, Math.floor(Number(secondes) || 0));
    const heures = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    if (heures) return heures + " h " + minutes + " min";
    return minutes + " min";
  }

  function pourcent(part, total) {
    if (!total) return "0 %";
    return (part / total * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " %";
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
    const thead = document.createElement("thead");
    const entete = document.createElement("tr");
    colonnes.forEach(function (colonne) {
      const th = document.createElement("th");
      th.textContent = colonne;
      entete.append(th);
    });
    thead.append(entete);
    const corps = document.createElement("tbody");
    lignes.forEach(function (cellules) {
      const tr = document.createElement("tr");
      cellules.forEach(function (cellule) {
        const td = document.createElement("td");
        if (cellule && cellule.noeud) {
          td.append(cellule.noeud);
        } else {
          td.textContent = cellule == null ? "" : String(cellule);
        }
        tr.append(td);
      });
      corps.append(tr);
    });
    table.append(thead, corps);
    enveloppe.append(table);
    return enveloppe;
  }

  function listeSimple(items, vide) {
    if (!items.length) {
      const paragraphe = document.createElement("p");
      paragraphe.className = "vide";
      paragraphe.textContent = vide;
      return paragraphe;
    }
    const ul = document.createElement("ul");
    items.forEach(function (texte) {
      const li = document.createElement("li");
      li.textContent = texte;
      ul.append(li);
    });
    return ul;
  }

  function cours(fiche) {
    return [fiche.matiere, fiche.classe, fiche.specialite].filter(Boolean).join(" · ");
  }

  function peindre() {
    if (!audit) return;
    const site = audit.site || {};
    const stockage = audit.stockage || {};
    const sessions = audit.sessions || {};
    const comptes = audit.comptes || {};
    const activite = audit.activite || {};
    const contenu = audit.contenu || {};
    const securite = audit.securite || {};
    const roles = comptes.par_role || {};

    const etat = document.getElementById("etat-site");
    etat.textContent = "Relevé du " + dateCourte(audit.genere_le)
      + " · processus démarré depuis " + duree(site.duree_secondes)
      + " · session " + nombre(site.session_heures) + " h"
      + " · cookie " + (site.cookie_securise ? "HTTPS seulement" : "aussi en HTTP");

    const bouton = document.getElementById("bouton-site");
    if (site.suspendu) {
      bouton.textContent = "Réactiver le site";
      bouton.className = "bouton";
    } else {
      bouton.textContent = "Suspendre le site";
      bouton.className = "bouton bouton-danger";
    }

    let banniere = document.getElementById("banniere-site");
    if (site.suspendu) {
      if (!banniere) {
        banniere = document.createElement("p");
        banniere.id = "banniere-site";
        banniere.className = "banniere";
        document.getElementById("zone-pilotage").prepend(banniere);
      }
      banniere.textContent = "Le site est suspendu"
        + (site.par ? " par " + site.par : "")
        + (site.depuis ? " depuis le " + dateCourte(site.depuis) : "")
        + ". Toi seul peux encore naviguer.";
    } else if (banniere) {
      banniere.remove();
    }

    const zoneSessions = vider("zone-sessions");
    const grilleSessions = document.createElement("div");
    grilleSessions.className = "grille-stats";
    grilleSessions.append(
      carte("En ligne", nombre(sessions.en_ligne), "activité < 15 min"),
      carte("Personnes avec une session", nombre(sessions.personnes)),
      carte("Sessions ouvertes", nombre(sessions.ouvertes)),
      carte("Déconnectées, jeton encore en base", nombre(sessions.deconnectees))
    );
    zoneSessions.append(grilleSessions);
    zoneSessions.append(tableau(
      ["Nom", "Identifiant", "Rôle", "État", "Depuis", "Dernière activité", "Expire", "Navigateur"],
      (sessions.liste || []).map(function (session) {
        const etatSession = document.createElement("span");
        if (session.suspendu) {
          etatSession.textContent = "Compte suspendu";
        } else if (session.en_ligne) {
          etatSession.className = "badge";
          etatSession.textContent = "En ligne";
        } else {
          etatSession.textContent = "Session ouverte";
        }
        return [
          session.nom,
          session.username,
          session.role ? libelleRole(session.role) : "—",
          { noeud: etatSession },
          dateCourte(session.depuis),
          dateCourte(session.vu),
          dateCourte(session.expire),
          session.agent || "—"
        ];
      }),
      "Personne n'est connecté."
    ));

    const zoneStockage = vider("zone-stockage");
    zoneStockage.append(
      carte("Fichiers envoyés", octets(stockage.uploads_octets), detailOctets(stockage.uploads_octets) + " · " + nombre(stockage.uploads_fichiers) + " fichiers"),
      carte("Fiches (JSON)", octets(stockage.matiere_octets), detailOctets(stockage.matiere_octets) + " · " + nombre(stockage.matiere_fichiers) + " fichiers"),
      carte("Base des comptes", octets(stockage.base_octets), detailOctets(stockage.base_octets)),
      carte("Dossier instance", octets(stockage.instance_octets), detailOctets(stockage.instance_octets)),
      carte("Orphelins", octets(stockage.orphelins_octets), nombre(stockage.orphelins) + " fichiers sans fiche"),
      carte("Disque utilisé", pourcent(stockage.disque_utilise_octets, stockage.disque_total_octets), octets(stockage.disque_utilise_octets) + " sur " + octets(stockage.disque_total_octets)),
      carte("Disque libre", octets(stockage.disque_libre_octets), detailOctets(stockage.disque_libre_octets)),
      carte("Taille max d'un envoi", octets(site.envoi_max_octets), detailOctets(site.envoi_max_octets))
    );

    const zoneComptes = vider("zone-comptes");
    zoneComptes.append(
      carte("Comptes", nombre(comptes.total)),
      carte("Actifs", nombre(comptes.actifs)),
      carte("Suspendus", nombre(comptes.suspendus)),
      carte("Élèves", nombre(roles.user)),
      carte("Modérateurs", nombre(roles.moderator)),
      carte("Administrateurs", nombre(roles.admin)),
      carte("Propriétaires", nombre(roles.owner)),
      carte("Créés en 24 h", nombre(comptes.crees_24h)),
      carte("Créés en 7 jours", nombre(comptes.crees_7j)),
      carte("Créés en 30 jours", nombre(comptes.crees_30j)),
      carte("Ont publié", nombre(comptes.avec_envois)),
      carte("Ont téléchargé", nombre(comptes.avec_telechargements)),
      carte("Sans activité", nombre(comptes.sans_activite))
    );
    const anciennete = document.getElementById("zone-anciennete");
    const ancien = comptes.plus_ancien;
    const recent = comptes.plus_recent;
    anciennete.textContent = ancien
      ? "Plus ancien : " + ancien.username + " (" + dateCourte(ancien.le) + "). Plus récent : " + recent.username + " (" + dateCourte(recent.le) + ")."
      : "Aucun compte daté.";

    const zoneActivite = vider("zone-activite");
    zoneActivite.append(
      carte("Envois enregistrés", nombre(activite.envois)),
      carte("Téléchargements enregistrés", nombre(activite.telechargements)),
      carte("Fiches distinctes téléchargées", nombre(activite.fiches_telechargees)),
      carte("Envois perdus", nombre(activite.envois_perdus), "cités sur un compte, absents du disque")
    );
    vider("zone-auteurs").append(tableau(
      ["Identifiant", "Fiches"],
      (activite.top_auteurs || []).map(function (ligne) { return [ligne.username, nombre(ligne.nombre)]; }),
      "Aucune publication."
    ));
    const etoiles = audit.etoiles || {};
    const zoneEtoiles = vider("zone-etoiles");
    if (zoneEtoiles) {
      zoneEtoiles.append(
        carte("Étoiles posées", nombre(etoiles.total)),
        carte("Matières avec une étoile", nombre((etoiles.par_matiere || []).length))
      );
    }
    const globale = vider("zone-etoile-globale");
    if (globale) {
      if (!etoiles.plus_etoilee) {
        const vide = document.createElement("p");
        vide.className = "vide";
        vide.textContent = "Aucune fiche n'a encore d'étoile.";
        globale.append(vide);
      } else {
        const fiche = etoiles.plus_etoilee;
        globale.append(tableau(
          ["Titre", "Auteur", "Cours", "Étoiles"],
          [[fiche.titre, fiche.auteur, cours(fiche), nombre(fiche.etoiles)]],
          "Aucune fiche n'a encore d'étoile."
        ));
      }
    }
    const parMatiere = [];
    (etoiles.par_matiere || []).forEach(function (groupe) {
      (groupe.fiches || []).forEach(function (fiche) {
        parMatiere.push([groupe.matiere, fiche.titre, fiche.auteur, cours(fiche), nombre(fiche.etoiles)]);
      });
    });
    const zoneMatieresEtoiles = vider("zone-etoiles-matiere");
    if (zoneMatieresEtoiles) {
      zoneMatieresEtoiles.append(tableau(
        ["Matière", "Titre", "Auteur", "Cours", "Étoiles"],
        parMatiere,
        "Aucune matière n'a de fiche étoilée."
      ));
    }

    vider("zone-lecteurs").append(tableau(
      ["Identifiant", "Téléchargements"],
      (activite.top_lecteurs || []).map(function (ligne) { return [ligne.username, nombre(ligne.nombre)]; }),
      "Aucun téléchargement."
    ));

    const zoneContenu = vider("zone-contenu");
    zoneContenu.append(
      carte("Fiches valides", nombre(contenu.fiches)),
      carte("Matières", nombre(contenu.matieres)),
      carte("Classes", nombre(contenu.classes)),
      carte("Spécialités", nombre(contenu.specialites)),
      carte("Cours vides", nombre(contenu.cours_vides)),
      carte("JSON invalides", nombre(contenu.json_invalides)),
      carte("Identifiants en double", nombre(contenu.doublons)),
      carte("Fichiers manquants", nombre(contenu.fichiers_manquants)),
      carte("Auteurs inconnus", nombre(contenu.auteurs_inconnus)),
      carte("Taille moyenne", octets(contenu.taille_moyenne_octets), detailOctets(contenu.taille_moyenne_octets))
    );
    vider("zone-matieres").append(tableau(
      ["Matière", "Fiches", "Cours", "Volume"],
      (contenu.par_matiere || []).map(function (ligne) {
        return [ligne.nom, nombre(ligne.fiches), nombre(ligne.cours), octets(ligne.octets)];
      }),
      "Aucune fiche."
    ));
    vider("zone-classes").append(tableau(
      ["Classe", "Fiches", "Volume"],
      (contenu.par_classe || []).map(function (ligne) {
        return [ligne.nom, nombre(ligne.fiches), octets(ligne.octets)];
      }),
      "Aucune fiche."
    ));
    vider("zone-extensions").append(tableau(
      ["Type", "Fiches", "Volume"],
      (contenu.par_extension || []).map(function (ligne) {
        return [ligne.nom, nombre(ligne.fiches), octets(ligne.octets)];
      }),
      "Aucune fiche."
    ));
    vider("zone-gros").append(tableau(
      ["Titre", "Auteur", "Cours", "Taille"],
      (contenu.plus_gros || []).map(function (ligne) {
        return [ligne.titre, ligne.auteur, cours(ligne), octets(ligne.octets)];
      }),
      "Aucun fichier."
    ));
    vider("zone-recentes").append(tableau(
      ["Titre", "Auteur", "Cours", "Quand"],
      (contenu.dernieres || []).map(function (ligne) {
        return [ligne.titre, ligne.auteur, cours(ligne), dateCourte(ligne.le)];
      }),
      "Aucune fiche."
    ));
    vider("zone-vides").append(listeSimple(
      (contenu.cours_vides_liste || []).map(function (ligne) {
        return ligne.matiere + " · " + ligne.classe + " · " + ligne.specialite;
      }),
      "Aucun cours vide."
    ));
    if ((contenu.cours_vides || 0) > (contenu.cours_vides_liste || []).length) {
      const suite = document.createElement("p");
      suite.className = "note";
      suite.textContent = "Extrait de " + (contenu.cours_vides_liste || []).length + " cours vides sur " + nombre(contenu.cours_vides) + ".";
      document.getElementById("zone-vides").append(suite);
    }
    vider("zone-orphelins").append(tableau(
      ["Fichier", "Taille"],
      (contenu.orphelins_liste || []).map(function (ligne) {
        return [ligne.nom, octets(ligne.octets)];
      }),
      "Aucun orphelin."
    ));
    document.getElementById("zone-types").textContent = "Types autorisés à l'envoi : " + (contenu.types_autorises || []).join(", ");

    const zoneSecurite = vider("zone-securite");
    zoneSecurite.append(
      carte("Identifiants suivis", nombre(securite.tentatives_suivies), "échecs récents de mot de passe"),
      carte("Identifiants bloqués", nombre((securite.identifiants_bloques || []).length)),
      carte("Comptes suspendus", nombre((securite.comptes_suspendus || []).length))
    );
    vider("zone-bloques").append(listeSimple(securite.identifiants_bloques || [], "Aucun identifiant bloqué."));
    vider("zone-bannis").append(tableau(
      ["Identifiant", "Rôle"],
      (securite.comptes_suspendus || []).map(function (ligne) {
        return [ligne.username, libelleRole(ligne.role)];
      }),
      "Aucun compte suspendu."
    ));
  }

  function appliquer(data, message) {
    audit = data;
    peindre();
    if (message) afficherStatut("statut", message, "ok");
  }

  function actualiser(message) {
    if (enCours) return;
    enCours = true;
    api("/owner/audit.json").then(function (reponse) {
      enCours = false;
      if (reponse.status === 401) {
        window.location.assign("/auth/login-page?next=/owner/audit");
        return;
      }
      if (!reponse.ok) {
        afficherStatut("statut", reponse.data.error || "Relevé indisponible", "erreur");
        return;
      }
      appliquer(reponse.data, message);
    });
  }

  document.getElementById("bouton-actualiser").addEventListener("click", function () {
    actualiser("Relevé actualisé.");
  });

  document.getElementById("bouton-site").addEventListener("click", function () {
    if (!audit || enCours) return;
    const suspendre = !audit.site.suspendu;
    const question = suspendre
      ? "Suspendre le site ? Les élèves, les modérateurs et les administrateurs n'y auront plus accès."
      : "Réactiver le site pour tout le monde ?";
    if (!window.confirm(question)) return;
    enCours = true;
    const bouton = document.getElementById("bouton-site");
    bouton.disabled = true;
    api("/owner/site", { method: "POST", json: { suspendu: suspendre } }).then(function (reponse) {
      enCours = false;
      bouton.disabled = false;
      if (!reponse.ok) {
        afficherStatut("statut", reponse.data.error || "Action impossible", "erreur");
        return;
      }
      appliquer(reponse.data, suspendre ? "Site suspendu." : "Site réactivé.");
    });
  });

  peindre();
  setInterval(function () {
    if (document.hidden) return;
    actualiser("");
  }, 20000);
});
