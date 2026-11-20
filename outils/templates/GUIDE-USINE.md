# Usine à démos et à tests

Ce guide décrit le processus reproductible qui transforme un dépôt candidat en démonstration ou en test publiable sur
le hub `lab.adamai.fr`. Le processus ne publie jamais automatiquement.

## Rôles

| Rôle | Qui | Ce qu’il fait |
|---|---|---|
| Décision | Adama | valide un candidat, remplit la file, tranche les cas limites |
| Production | agent | prépare le dépôt, les tests, les preuves, la documentation et la fiche du registre |
| Publication | Adama et agent | branche, pull request, relecture, fusion ; le hub déploie après fusion |

Une seule session écrit dans un état mutable à la fois. Un candidat non validé ne devient jamais une entrée publiée.

## Entrée du processus

La file de candidats vit dans `veille-github/data/demos-a-valider.txt`, séparée de `data/valides.txt`. Un dépôt par
ligne, au format `Adam-s-tech/nom` ou `Adam-s-tech/nom | demo` ou `Adam-s-tech/nom | test`.

La file ne remplace pas `valides.txt`. Elle ne modifie ni `scores.jsonl`, ni `candidats.csv`, ni les scripts de la
veille. Adama remplit la file et décide du type.

## Étapes

1. Choisir un candidat validé et fixer `type` : `demo` ou `test`.
2. Créer un dépôt source dédié à partir du modèle `outils/templates/demo/`.
3. Écrire les tests réels, conserver les sorties et les preuves `*.report.json`.
4. Renseigner `NOTICE.md`, les crédits, les licences et les droits des images.
5. Renseigner l’entrée de `demos/demos.json` : `slug`, `type`, `titre`, `resume`, `source`, `date_ajout`, `statut`,
   puis `documentation` pour une démo, `rapport`, `resume_test`, `licence`, `credits`, `capture`, `tags` quand ils
   s’appliquent. Les champs `source_commit` et `synced_at` sont écrits par `sync-demo.mjs`.
6. Pour une démo, lancer `node outils/sync-demo.mjs --slug <slug>`.
7. Pour un test, copier `outils/templates/rapport/index.html` vers `tests/<slug>/index.html` et le remplir.
8. Lancer `node outils/verify-registry.mjs`, puis `node outils/build-hub.mjs` et `node outils/verify-site.mjs`.
9. Ouvrir une branche, une pull request, et attendre la validation d’Adama.
10. Après fusion, le hub se déploie automatiquement. Vérifier les URL publiques.

## Portillons

Une publication est bloquée si un portillon manque.

| Portillon | Preuve attendue |
|---|---|
| Licence relevée | licence du code et de chaque composant dans `NOTICE.md` |
| Droits des images | accord écrit ou images produites par Adama |
| Test réel | au moins deux passages, à froid puis à chaud, avec durées |
| Preuves | `*.report.json` conservés avec les sorties |
| Capture | image sociale ou capture vérifiée |
| SEO | titre, description, canonical, Open Graph, Twitter, `robots.txt`, `sitemap.xml` |
| Accessibilité | langue, titres, contraste, clavier, texte de remplacement |
| Sauvegarde | dépôt, documentation et preuves couverts par la sauvegarde |
| Crédits | auteur d’origine et composants tiers cités |
| Relecture | validation explicite d’Adama |

## Cadence

Une démonstration ou un test par mois, ou à chaque candidat validé. La cadence est décidée par Adama. L’agent propose
un calendrier et signale les candidats prêts. La publication suit la revue, jamais un calendrier seul.

## Registre

`demos/demos.json` reste la seule source. Champs communs : `slug`, `type`, `titre`, `date_ajout`, `statut`.
Champs de démo : `resume`, `source`, `documentation`, `capture`. Champs de test : `rapport`, `resume` ou
`resume_test`. Champs optionnels communs : `tags`, `licence`, `credits`, `source_commit`, `synced_at`.

Une entrée `demo` produit une carte de catalogue et une URL `/demos/<slug>/`. Une entrée avec `rapport` produit une
carte et une URL `/tests/<rapport>/`. Une entrée `test` ne produit pas de dossier `demos/<slug>/`.

## Nommage

Slug en minuscules avec traits d’union. Titre en français. Pas de crochets dans un nom de fichier, de dossier, de
workflow ou de nœud. Pas de tiret cadratin ni de demi-cadratin dans les textes produits. Apostrophe typographique
`U+2019` dans les documents français.

## Licence

Chaque fiche porte la licence du code et des composants. La licence MIT du lab ne couvre pas la démonstration copiée.
Un code sans licence ouverte reste sans licence ouverte : la fiche le dit explicitement.

## Correction

Une démonstration se corrige dans son dépôt source, puis se resynchronise. Jamais dans `demos/`. Après correction,
relancer `sync-demo.mjs`, `build-hub.mjs` et `verify-site.mjs`, puis ouvrir une pull request.

## Publication

Branche, pull request, validation, fusion. Un push sur `main` du lab déploie automatiquement. Ne pas pousser
directement sur `main`. Ne pas activer GitHub Pages sur un dépôt de démonstration sans décision explicite d’Adama.

## Références

- Modèle de dépôt : `outils/templates/demo/`
- Modèle de rapport : `outils/templates/rapport/index.html`
- File de candidats : `../../veille-github/data/demos-a-valider.txt`
- Modèle de mission : `../../referentiel-adam-ai-next-gen-ai/template-mission-demo.md`
