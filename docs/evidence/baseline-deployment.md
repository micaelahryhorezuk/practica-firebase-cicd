# Publicación inicial sin hardening

Sitio: https://practica-cicd-micela.web.app
Base: `bc9898bb9a8320c6920bcba9e026a0732d70f9ff` (`Initial commit`).
Copia aislada: `../09-practica-firebase-cicd-baseline`, en detached HEAD.

## Alcance autorizado

Ante la pregunta «¿Autorizas publicar primero la versión base sin hardening en **`practica-cicd-micela`**? Esto actualizará el sitio público; después mediremos B1 y seguiremos con el PR de mejoras.», la usuaria respondió «si».
Esta ejecución publicó únicamente la base para medir B1. En esa etapa no se ejecutaron push, creación de PR, merge, publicación del hardening ni rollback. Después se autorizaron push y dos PR encadenados solo para preview (fuente hacia `main`, evidencia B1 hacia la rama de fuente), aún no ejecutados. Merge, publicación del hardening, B5 y rollback siguen sin autorizar.

## Comprobaciones previas

- `firebase hosting:sites:list --project practica-cicd-micela --json --non-interactive`: exit 0; confirmó el sitio predeterminado `projects/practica-cicd-micela/sites/practica-cicd-micela` y su URL.
- `npm ci --no-audit --no-fund`: exit 0; 661 paquetes. Avisos de deprecación de `node-domexception`, `uuid`, `glob` y `json-ptr`; no se cambiaron versiones ni el lockfile.
- `npm run typecheck`: exit 0.
- `npm run build`: exit 0; export de `/`, `/cursos` y 404.
- Variables del build: `NEXT_TELEMETRY_DISABLED=1`, `NEXT_PUBLIC_BUILD_SHA=bc9898bb9a8320c6920bcba9e026a0732d70f9ff`, `NEXT_PUBLIC_BUILD_REF=baseline`, `NEXT_PUBLIC_BUILD_TIME` con la fecha UTC del build.
- Comprobación estructural del export: exit 0; HTML con SHA `bc9898b`, etiqueta `baseline` y archivos HTML no vacíos.
- `git diff --exit-code` sobre `app`, `lib`, `package.json`, `package-lock.json` y `next.config.ts`: exit 0 respecto de la base.

## Incidente y corrección acotada

El primer intento de `firebase deploy --only hosting --project practica-cicd-micela --non-interactive` terminó con exit 2:

```text
Error: Assertion failed: resolving hosting target of a site with no site name or target name. This should have caused an error earlier
```

La CLI no resolvió el sitio implícito. Se revisó `firebase-tools/lib/hosting/config.js`: `extract` usa `options.site` cuando no hay `site` ni `target`, y `resolveTargets` rechaza un nombre ausente.

Único ajuste en el `firebase.json` de la copia base: `hosting.site = "practica-cicd-micela"`. Una comparación JSON contra el commit base confirmó que, al quitar ese campo, la configuración es idéntica: conserva `headers: []`, sirve `out` y no agrega hooks ni rewrites. No se modificó el código de la aplicación ni la configuración de la rama de mejoras.

## Despliegue confirmado

Desde la copia base, con el sitio explícito:

```bash
./node_modules/.bin/firebase deploy --only hosting --project practica-cicd-micela --non-interactive
```

Resultado: exit 0.

```text
=== Deploying to 'practica-cicd-micela'...

i  deploying hosting
i  hosting[practica-cicd-micela]: beginning deploy...
i  hosting[practica-cicd-micela]: found 29 files in out
i  hosting: uploading new files [0/25] (0%)
i  hosting: uploading new files [17/25] (68%)
i  hosting: upload complete
✔  hosting[practica-cicd-micela]: file upload complete
i  hosting[practica-cicd-micela]: finalizing version...
✔  hosting[practica-cicd-micela]: version finalized
i  hosting[practica-cicd-micela]: releasing new version...
✔  hosting[practica-cicd-micela]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/practica-cicd-micela/overview
Hosting URL: https://practica-cicd-micela.web.app
```

## Límites de la evidencia

- El verificador independiente no fue admitido por el harness para esta operación sin cambios de código. No produjo informe ni aprobación; las comprobaciones anteriores son del orquestador.
- No se ejecutó una prueba interactiva de navegador.
- La medición HTTP y el estado de la consulta a SecurityHeaders se guardan por separado en este directorio. No se debe inferir una calificación de seguridad a partir de un error de acceso al escáner.

Risk: item 5 (publicación en el canal live de Firebase Hosting).
