# Harnais de test

Le harnais pilote la démonstration sans interface visible, exécute au moins deux passages et écrit une preuve
`*.report.json` à côté du JSON de sortie.

## Contrat

- entrée : une image ou un jeu de données réel ;
- sortie : JSON brut et preuve avec horodatage, version et durée ;
- échec : code de sortie non nul et message explicite ;
- aucune donnée envoyée hors du poste quand la démonstration est locale.

## Commande

```bash
node tests/e2e.mjs --image {{IMAGE}} --json {{JSON}} --runs 2
```
