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

## Auditoría

Con los mismos emuladores: `GCLOUD_PROJECT=demo-catalogo npm run atacar`.
Las salidas reales antes/después están en `docs/evidence/sql-connect/antes.txt` y `despues.txt`; los tests RED/GREEN están en ese mismo directorio.

## Cuenta local

La configuración web apunta a demo-catalogo. Ejecutar `npm run dev` y crear una cuenta desde Ingresar. La configuración de ejemplo no sirve para producción.

## Inscripciones propias

Abrir `/mis-inscripciones` con sesión iniciada. La página consulta solamente al usuario actual y permite dar de baja sus matrículas.
