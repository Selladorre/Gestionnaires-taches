# Gestionnaire de tâches

TP JavaScript : une application web pour ajouter, consulter, modifier, supprimer, filtrer et rechercher des tâches. Les données sont conservées dans le `localStorage` du navigateur.

## Fonctionnalités

- **Ajouter** une tâche avec un titre (obligatoire), une description et un statut.
- **Afficher** les tâches sous forme de cartes générées en JavaScript, avec un badge et une couleur par statut :
  à faire (bleu), en cours (orange), terminée (vert).
- **Modifier** le titre, la description et le statut d'une tâche.
- **Supprimer** une tâche (avec confirmation).
- **Filtrer** par statut : toutes, à faire, en cours, terminée. Chaque bouton affiche le nombre de tâches concernées.
- **Rechercher** un texte dans le titre ou la description.
- **Sauvegarder** automatiquement dans `localStorage` et recharger les tâches à l'ouverture.
- Messages d'erreur clairs (titre vide, statut non autorisé) et message adapté quand la liste est vide.


## Données d'une tâche

```js
{
  id: 1732450000000,          // Date.now()
  titre: "Réviser le TP",     // obligatoire
  description: "…",           // facultative
  statut: "en cours",         // "à faire" | "en cours" | "terminée"
  createdAt: "2026-11-24T…",  // date de création (ISO)
  couleur: "orange"           // bleu | orange | vert
}
```

## Structure

```
index.html   Structure de la page et formulaire
style.css    Mise en forme et couleurs des statuts
script.js    Tableau de tâches, CRUD, validation, filtres, recherche, localStorage
README.md    Présentation du projet
```

## Lancer le projet

Aucune installation n'est nécessaire : ouvrir `index.html` dans un navigateur (ou utiliser l'extension *Live Server* de VS Code).