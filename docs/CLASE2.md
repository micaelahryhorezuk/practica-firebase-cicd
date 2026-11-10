# Clase 2 · SQL Connect

## Backend local

Solo emuladores, sin despliegue ni cambios de producción:

```bash
npm ci
npm run emulators -- --project demo-catalogo
```

En otra terminal:

```bash
GCLOUD_PROJECT=demo-catalogo npm run seed
GCLOUD_PROJECT=demo-catalogo npm run test:sql
```
