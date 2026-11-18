# AdamAI Lab

Analyses courtes, structurées et non techniques sur l'intelligence artificielle, pour les décideurs qui doivent trancher sans avoir le temps de tout lire.

Site : https://lab.adamai.fr

## Ce que vous trouverez

- **Insights** : les signaux IA qui comptent, avec les points de vigilance et les questions utiles.
- **Focus** : des analyses cadrées sur un sujet précis, avec une grille de lecture.
- **Méthode** : une démarche en quatre étapes, cadrer, trier, analyser, recommander.
- **Contact** : un échange de 20 minutes pour cadrer un sujet IA.

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

Le site est publié via GitHub Pages sur `lab.adamai.fr`. Le fichier `CNAME` porte le domaine. Ne pas le modifier sans mettre à jour le DNS.

## Licence

MIT, voir `LICENSE`.
