"use strict";

/* ---------- Données et constantes ---------- */
const CLE_STOCKAGE = "gestionnaire-taches";

const STATUTS = {
  "à faire": { couleur: "bleu", libelle: "À faire", filtre: "À faire" },
  "en cours": { couleur: "orange", libelle: "En cours", filtre: "En cours" },
  "terminée": { couleur: "vert", libelle: "Terminée", filtre: "Terminée" },
};

const formulaire = document.getElementById("form-tache");
const champTitre = document.getElementById("titre");
const champDescription = document.getElementById("description");
const champStatut = document.getElementById("statut");
const zoneErreur = document.getElementById("erreur");
const boutonValider = document.getElementById("btn-valider");
const boutonAnnuler = document.getElementById("btn-annuler");
const titreFormulaire = document.getElementById("titre-form");
const champRecherche = document.getElementById("recherche");
const zoneFiltres = document.getElementById("filtres");
const zoneTaches = document.getElementById("taches");
const messageVide = document.getElementById("vide");

let taches = chargerTaches();
let filtreActif = "toutes";
let texteRecherche = "";
let idEnEdition = null;

/* ---------- Fonctions utilitaires ---------- */
function statutValide(statut) {
  return Object.keys(STATUTS).includes(statut);
}

function noeud(balise, classe, texte) {
  const element = document.createElement(balise);
  if (classe) element.className = classe;
  if (texte) element.textContent = texte;
  return element;
}

/* ---------- localStorage ---------- */
function chargerTaches() {
  try {
    const donnees = JSON.parse(localStorage.getItem(CLE_STOCKAGE));
    if (!Array.isArray(donnees)) return [];
    return donnees.filter((t) => t && t.titre && statutValide(t.statut));
  } catch (erreur) {
    return [];
  }
}

function sauvegarderTaches() {
  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(taches));
}

/* ---------- Validation et création ---------- */
function validerSaisie(titre, statut) {
  if (titre.trim() === "") return "Le titre est obligatoire : saisissez au moins un caractère.";
  if (!statutValide(statut)) return "Le statut choisi n'est pas autorisé.";
  return "";
}

function creerTache(titre, description, statut) {
  return {
    id: Date.now(),
    titre: titre,
    description: description,
    statut: statut,
    createdAt: new Date().toISOString(),
    couleur: STATUTS[statut].couleur
  };
}

/* ---------- CRUD ---------- */
function supprimerTache(id) {
  const tache = taches.find((t) => t.id === id);
  if (!tache || !confirm("Supprimer la tâche « " + tache.titre + " » ?")) return;
  taches = taches.filter((t) => t.id !== id);
  if (idEnEdition === id) reinitialiserFormulaire();
  sauvegarderTaches();
  afficher();
}

function commencerEdition(id) {
  const tache = taches.find((t) => t.id === id);
  if (!tache) return;
  idEnEdition = id;
  champTitre.value = tache.titre;
  champDescription.value = tache.description || "";
  champStatut.value = tache.statut;
  titreFormulaire.textContent = "Modifier la tâche";
  boutonValider.textContent = "Enregistrer les modifications";
  boutonAnnuler.hidden = false;
  afficherErreur("");
  formulaire.scrollIntoView({ behavior: "smooth", block: "center" });
  champTitre.focus();
}

function reinitialiserFormulaire() {
  formulaire.reset();
  idEnEdition = null;
  titreFormulaire.textContent = "Nouvelle tâche";
  boutonValider.textContent = "Ajouter la tâche";
  boutonAnnuler.hidden = true;
  afficherErreur("");
}

function afficherErreur(message) {
  zoneErreur.textContent = message;
  champTitre.setAttribute("aria-invalid", String(message !== ""));
}

/* ---------- Affichage ---------- */
function tachesVisibles() {
  const recherche = texteRecherche.trim().toLowerCase();
  return taches.filter((t) => {
    const bonStatut = filtreActif === "toutes" || t.statut === filtreActif;
    const texte = (t.titre + " " + (t.description || "")).toLowerCase();
    return bonStatut && texte.includes(recherche);
  });
}

function creerCarte(tache) {
  const info = STATUTS[tache.statut];
  const carte = noeud("article", "carte " + info.couleur);

  const boutonModifier = noeud("button", "btn btn-sec", "Modifier");
  const boutonSupprimer = noeud("button", "btn btn-sec btn-danger", "Supprimer");
  boutonModifier.type = "button";
  boutonSupprimer.type = "button";
  boutonModifier.setAttribute("aria-label", "Modifier la tâche " + tache.titre);
  boutonSupprimer.setAttribute("aria-label", "Supprimer la tâche " + tache.titre);
  boutonModifier.addEventListener("click", () => commencerEdition(tache.id));
  boutonSupprimer.addEventListener("click", () => supprimerTache(tache.id));

  const actions = noeud("div", "carte-actions");
  actions.append(boutonModifier, boutonSupprimer);

  carte.append(noeud("span", "badge", info.libelle), noeud("h3", "", tache.titre));
  if (tache.description) carte.append(noeud("p", "desc", tache.description));
  carte.append(
    noeud("small", "date", "Créée le " + new Date(tache.createdAt).toLocaleDateString("fr-FR")),
    actions
  );
  return carte;
}

function creerFiltres() {
  const filtres = { toutes: "Toutes" };
  Object.keys(STATUTS).forEach((s) => { filtres[s] = STATUTS[s].filtre; });
  Object.keys(filtres).forEach((cle) => {
    const bouton = noeud("button", "filtre");
    bouton.type = "button";
    bouton.dataset.filtre = cle;
    bouton.dataset.libelle = filtres[cle];
    zoneFiltres.append(bouton);
  });
}

function mettreAJourFiltres() {
  zoneFiltres.querySelectorAll(".filtre").forEach((bouton) => {
    const cle = bouton.dataset.filtre;
    const nombre = cle === "toutes" ? taches.length : taches.filter((t) => t.statut === cle).length;
    bouton.textContent = bouton.dataset.libelle + " (" + nombre + ")";
    bouton.setAttribute("aria-pressed", String(cle === filtreActif));
  });
}

function afficher() {
  mettreAJourFiltres();
  const visibles = tachesVisibles();
  zoneTaches.replaceChildren(...visibles.map(creerCarte));
  messageVide.hidden = visibles.length > 0;
  messageVide.textContent = taches.length === 0
    ? "Aucune tâche pour le moment. Ajoutez-en une avec le formulaire."
    : "Aucune tâche ne correspond à votre recherche ou au filtre choisi.";
}

/* ---------- Événements ---------- */
formulaire.addEventListener("submit", (evenement) => {
  evenement.preventDefault();
  const titre = champTitre.value.trim();
  const description = champDescription.value.trim();
  const statut = champStatut.value;

  const message = validerSaisie(titre, statut);
  if (message) {
    afficherErreur(message);
    champTitre.focus();
    return;
  }

  if (idEnEdition === null) {
    taches.unshift(creerTache(titre, description, statut));
  } else {
    const tache = taches.find((t) => t.id === idEnEdition);
    Object.assign(tache, { titre, description, statut, couleur: STATUTS[statut].couleur });
  }
  sauvegarderTaches();
  reinitialiserFormulaire();
  afficher();
});

boutonAnnuler.addEventListener("click", reinitialiserFormulaire);

champRecherche.addEventListener("input", () => {
  texteRecherche = champRecherche.value;
  afficher();
});

zoneFiltres.addEventListener("click", (evenement) => {
  const bouton = evenement.target.closest(".filtre");
  if (!bouton) return;
  filtreActif = bouton.dataset.filtre;
  afficher();
});

/* ---------- Initialisation ---------- */
Object.keys(STATUTS).forEach((statut) => {
  const option = noeud("option", "", STATUTS[statut].libelle);
  option.value = statut;
  champStatut.append(option);
});
creerFiltres();
afficher();
