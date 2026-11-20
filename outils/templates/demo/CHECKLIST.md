# Checklist avant publication

Renseigner chaque ligne. Une ligne non cochée bloque la publication.

## Licence et droits

- [ ] Licence du code relevée et écrite dans `NOTICE.md`.
- [ ] Licence de chaque composant tiers relevée dans `THIRD_PARTY_NOTICES.md`.
- [ ] Droits des images et jeux de données confirmés par écrit.
- [ ] Crédits de l’auteur d’origine conservés.

## Fonctionnement

- [ ] Test réel exécuté sur au moins deux passages, à froid puis à chaud.
- [ ] Résultats, erreurs et interprétation écrits dans `docs/tests/`.
- [ ] Preuves `*.report.json` conservées avec les sorties.
- [ ] Aucun envoi de données hors du poste quand la démonstration est locale.

## Publication

- [ ] Capture d’écran ou image sociale produite et vérifiée.
- [ ] SEO contrôlé : titre, description, canonical, Open Graph, Twitter, `robots.txt`, `sitemap.xml`.
- [ ] Accessibilité contrôlée : langue, titres, contraste, navigation clavier, texte de remplacement.
- [ ] `check:site` vert.
- [ ] Sauvegarde du dépôt et des preuves vérifiée.
- [ ] Entrée ajoutée dans `demos/demos.json` avec `type`, `licence`, `credits`, `capture`, `resume_test`.
- [ ] Relecture d’Adama faite.
