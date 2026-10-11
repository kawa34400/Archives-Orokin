# Archives Orokin

Registre non officiel du lore de **Warframe**, en français, dans une interface inspirée du Vitruvien.

- **Chronologie** : 40 événements dans l'ordre interne de l'histoire, de l'Empire orokin à *Jade Shadows : Constellations* (2026), avec lecture guidée et révélations masquables.
- **Carte** du système Origine et des lieux hors orbite (Néant, Zariman, Duviri, Höllvania, Tau).
- **Archives classifiées** : les sources du lore (fragments, Leverian, quêtes, journaux).
- **Index** des personnages, factions et syndicats.
- **Galerie des Warframes** dont l'histoire est racontée dans le jeu.

Recherche globale avec `Ctrl+K` ou `/`. Chaque fiche a un lien direct (`#ev-zariman`, `#en-ballas`, `#pl-lune`…).

## Modifier le site

Le site est un seul fichier, `index.html`, assemblé depuis `src/` :

| Fichier | Contenu |
|---|---|
| `src/data.js` | Tout le contenu : ères, événements, archives, index, Warframes, lieux |
| `src/app.js` | Navigation, recherche, chronologie, carte, fiches |
| `src/anim.js` | Fond animé et diagramme holographique |
| `src/head.html`, `src/extra.css` | Styles |
| `src/body.html` | Structure de la page |

Après une modification dans `src/`, régénérer la page :

```bash
python3 build.py
```

## Mention

Projet de fans non officiel. Warframe et tous ses éléments appartiennent à Digital Extremes. Les textes sont des résumés rédigés pour ce site ; aucun dialogue du jeu n'y est reproduit.
