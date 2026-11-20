# Installation et publication

## Prérequis

{{PREREQUIS}}

## Installation locale

```bash
git clone {{SOURCE}}
cd {{DEPOT}}
{{INSTALLATION}}
```

## Vérifications

```bash
{{COMMANDE_VERIFICATION}}
```

## Publication sur le hub

La démonstration est publiée par le hub `adamai-lab`, dossier `demos/{{SLUG}}/`. Le dépôt source n’active pas GitHub
Pages pour l’application.

Procédure :

1. fusionner la branche de travail dans `main` du dépôt source ;
2. dans `adamai-lab`, renseigner `demos/demos.json` avec `type`, `source`, `documentation`, `rapport`, `licence`,
   `credits`, `capture` ;
3. lancer `node outils/sync-demo.mjs --slug {{SLUG}}` ;
4. lancer `node outils/verify-registry.mjs`, `node outils/build-hub.mjs` et `node outils/verify-site.mjs` ;
5. ouvrir une branche, une pull request, puis attendre la validation d’Adama.

La synchronisation écrit `demos/{{SLUG}}/version.json` avec `slug`, `source`, `source_commit` et `synced_at`.
