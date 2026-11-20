# AdamAI Lab

Analyses courtes, structurées et non techniques sur l'intelligence artificielle, pour les décideurs qui doivent trancher sans avoir le temps de tout lire.

Site : https://lab.adamai.fr

## Ce que vous trouverez

- **Insights** : les signaux IA qui comptent, avec les points de vigilance et les questions utiles.
- **Focus** : des analyses cadrées sur un sujet précis, avec une grille de lecture.
- **Méthode** : une démarche en quatre étapes, cadrer, trier, analyser, recommander.
- **Démos** : les démonstrations exécutables, avec leur rapport de test.
- **Contact** : un échange de 20 minutes pour cadrer un sujet IA.

## Démos et tests

Chaque démo vit dans son propre dossier sous `demos/<sujet>/`, avec ses liens relatifs et son URL canonique. Le registre `demos/demos.json` alimente le catalogue, l'index des tests et le sitemap.

| Commande | Rôle |
|---|---|
| `node outils/verify-registry.mjs` | contrôle le registre : champs requis, slugs, doublons, chemins |
| `node outils/sync-demo.mjs --slug <sujet>` | copie une démo, réécrit son URL de base et écrit `version.json` |
| `node outils/build-hub.mjs` | régénère catalogue, index des tests et sitemap |
| `node outils/verify-site.mjs` | contrôle canonical, sitemap, liens et absence de tiret cadratin |
| `node outils/scan-typographie.mjs` | audit des tirets et de la typographie ; `--strict` pour échouer |

Les modèles de dépôt de démo et de rapport de test sont dans `outils/templates/`. Le processus complet, les rôles,
les portillons et la cadence sont décrits dans `outils/templates/GUIDE-USINE.md`.

## Structure du dépôt

| Fichier | Rôle |
|---|---|
| `index.html` | page d'accueil |
| `insights.html` | veille éditorialisée |
| `focus.html` | analyses Focus |
| `gpt-image.html` | Focus sur la génération d'images |
| `method.html` | méthode en quatre étapes |
| `contact.html` | prise de contact |
| `css/style.css` | styles du site |
| `demos/` | catalogue et démonstrations |
| `tests/` | index et rapports de test |
| `outils/` | scripts de synchronisation et de contrôle |
| `.github/workflows/pages.yml` | publication GitHub Pages |
| `.nojekyll` | désactive Jekyll sur la branche publiée |
| `CNAME` | domaine `lab.adamai.fr` |
| `robots.txt` | règles d'indexation |
| `sitemap.xml` | plan du site |

## Lancer en local

Le site est statique. Ouvrir `index.html` dans un navigateur, ou servir le dossier :

```bash
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

## Publication

Le site est publié via GitHub Pages, en source GitHub Actions. Le workflow `.github/workflows/pages.yml` vérifie le site, prépare un artefact limité aux pages publiées, puis déploie. Le fichier `CNAME` porte le domaine. Ne pas le modifier sans mettre à jour le DNS.

## Licence

MIT pour le code du hub, voir `LICENSE`. Cette licence ne couvre ni les démonstrations copiées sous `demos/`, ni
leurs composants tiers. La licence de chaque démonstration est portée par son dépôt source et rappelée dans le registre.
