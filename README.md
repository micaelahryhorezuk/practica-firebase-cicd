# Prácticas · Firebase Hosting y SQL Connect

## Clase 2 · SQL Connect

La guía local de L1–L6 y los pasos pendientes de L7 están en [docs/CLASE2.md](docs/CLASE2.md).
Las seis respuestas y los resultados de auditoría, cuando estén disponibles, van en [REFLEXION.md](REFLEXION.md).
La entrega de clase 1 se conserva en [REFLEXION-CLASE1.md](REFLEXION-CLASE1.md).

El catálogo de clase 2 usa SQL Connect y requiere emuladores o un servicio configurado; no hay publicación ni comprobación de navegador de clase 2. Los apartados siguientes son instrucciones y evidencias **históricas de clase 1**, no pasos de despliegue de esta solución. Para probar la CSP de clase 2, usar el export servido por Hosting; `npm run dev` no aplica sus headers.

# Clase 1 · CI/CD con Firebase Hosting y hardening de headers HTTP

**Programación Avanzada** · Duración: 60 minutos · Plan Firebase **Spark** (sin tarjeta de crédito)

Este repo es el punto de partida. La app (un catálogo de cursos hecho con Next.js en modo
export estático) **ya funciona**: no hay que programar features. El trabajo es construir el
camino a producción y endurecer la seguridad de lo que se sirve.

> El enunciado completo, el cronograma y la rúbrica están en el documento de la práctica
> que entrega la cátedra. Este README es la guía rápida técnica.

---

## Estado de esta copia

Proyecto configurado: **`practica-cicd-micela`**. Los workflows ya implementan A1–A3;
los comentarios A4 y A5 son extras opcionales que todavía no se implementaron.
El preview compila el SHA de la rama del PR; los PR de forks se omiten para no usar secretos.

Estado actual (las capturas de la base y de previews citadas abajo son **anteriores** a los merges):

- Login y `firebase init hosting:github` completados por la usuaria; GitHub confirmó el
  nombre del secreto `FIREBASE_SERVICE_ACCOUNT_PRACTICA_CICD_MICELA`, no su valor.
- La base sin hardening `bc9898b` se publicó inicialmente en
  <https://practica-cicd-micela.web.app>. La [salida manual B1](docs/evidence/b1-manual-output.md)
  y el [reporte manual B1](docs/evidence/b1-securityheaders-manual.md) registran calificación
  **D** y caché `max-age=3600`. Los fallos automáticos históricos de conexión y scanner
  HTTP 403 pertenecen a B1, no a un escaneo B5.
- La usuaria confirmó manualmente filtro e imagen del preview. Tras restaurar live, el
  09 Nov 2026 02:28 UTC se probó producción en navegador: el filtro `intermedio` mostró
  2 de 6 cursos y la imagen de portada cargó a 960×320. Las [capturas anteriores de versión](docs/evidence/manual-version-verification.md)
  muestran preview `b6639e2` y producción base `bc9898b` **antes** de los merges.
- Con el «si» posterior de S9, [PR #2](https://github.com/micaelahryhorezuk/practica-firebase-cicd/pull/2)
  se integró normalmente a `main` en `88e0938ab783d90d28820274fe7f88cefa886da5`
  (producción run 42534289830 SUCCESS, `Deploy al canal live` SUCCESS). Después,
  [PR #3](https://github.com/micaelahryhorezuk/practica-firebase-cicd/pull/3) se integró
  normalmente en `c3051dc842a6de6fc15471cab8e8049c8cec5ce7` (run 42534675406
  SUCCESS, `Deploy al canal live` SUCCESS); sin bypass, squash ni borrado de ramas.
- [Medición B5 local](docs/evidence/b5-production.md): el script público terminó exit 0,
  con HTML 200, headers presentes, HTML `no-cache` y JS anual `immutable`. El fetch separado
  del footer falló (`ETIMEDOUT`, colector exit 2), pero una
  [captura manual B5](docs/evidence/b5-manual-verification.md) muestra la URL live y el pie
  `c3051dc`/`main` legible aunque parcialmente cortado abajo; no cambia el JSON automático.
  Un [reporte manual B5 nuevo](docs/evidence/b5-manual-verification.md) para la URL live
  muestra calificación **A** a 09 Nov 2026 00:04:18 UTC, frente a la **D** inicial
  (08 Nov 2026 16:23:08 UTC). También se probó el filtro y la imagen en producción.
  Se hizo rollback a la versión base `bc9898b` y se restauró la versión endurecida
  `c3051dc`; el [registro B5](docs/evidence/b5-production.md) conserva los IDs de release.
  El JSON automático conserva `securityHeadersGrade=null` y el fallo de identidad.

Detalle del despliegue y su corrección de destino:
[docs/evidence/baseline-deployment.md](docs/evidence/baseline-deployment.md).
No copiar valores de secretos a archivos, capturas ni conversaciones.

Checks locales: `node --test tests/*.test.mjs`, `npm run typecheck` y `npm run build`.
Para verificar HTTP sin usar un proyecto real:

```bash
npx firebase emulators:exec --only hosting --project demo-practica-cicd-micela \
  "node scripts/check-headers.mjs http://127.0.0.1:5000"
```

Ver los fundamentos y las evidencias pendientes en [REFLEXION.md](REFLEXION.md).
El emulador no reemplaza las mediciones antes/después en producción ni la prueba del filtro
y la imagen en un navegador.

## Arquitectura

```
  dev ──push──▶ rama feature ──PR──▶ GitHub Actions ──deploy──▶ Preview channel (URL temporal)
                                         │
                       merge a main ─────┘──deploy──▶ Canal live (producción)
                                                        │
                                          firebase.json │ headers de seguridad + caché
                                                        ▼
                                                Firebase Hosting (CDN global)
```

| Pieza | Rol |
|---|---|
| `next.config.ts` | `output: "export"` → `next build` genera HTML/JS/CSS estáticos en `out/` |
| `firebase.json` | Qué carpeta se publica, URLs limpias y **headers HTTP** (lo completás vos) |
| `.github/workflows/*.yml` | Pipelines de preview (PR) y producción (merge a `main`) — **con TODOs** |
| `scripts/check-headers.mjs` | Verifica los headers de seguridad y caché de un despliegue |
| Footer de la app | Muestra commit, rama y fecha de build → sirve para saber qué versión está viva |

---

## Pre-clase (hacelo ANTES de la clase, ~20 min)

1. **Node.js 20 o superior** y **Git** instalados.
2. Creá un proyecto en <https://console.firebase.google.com> (plan Spark, sin Analytics).
   Anotá el **Project ID** (ej. `cursos-ana-7f3a2`).
3. Creá tu repo en GitHub a partir de este (botón *Use this template*, o descargá el zip
   y subilo a un repo **tuyo**; no trabajes sobre un fork, ver *Problemas comunes*).
4. Cloná tu repo e instalá dependencias:
   ```bash
   npm install
   npx firebase login
   ```
5. Reemplazá `REEMPLAZAR-POR-TU-PROJECT-ID` en `.firebaserc`.
6. Probá en local:
   ```bash
   npm run build
   npm run serve        # emulador de Hosting en http://localhost:5000
   ```
7. Conectá GitHub con Firebase (crea la service account y el secreto en tu repo):
   ```bash
   npx firebase init hosting:github
   ```
   - Elegí tu repo `usuario/nombre-repo`.
   - Si pregunta si querés sobrescribir archivos de workflow existentes, respondé **No**:
     los workflows ya vienen en este repo. Si igual los reemplaza, restauralos con
     `git checkout -- .github/workflows`.
   - Al terminar, verificá en GitHub → *Settings → Secrets and variables → Actions* que
     exista un secreto llamado `FIREBASE_SERVICE_ACCOUNT_...`. **Anotá ese nombre.**
8. Primer deploy manual para confirmar que todo anda:
   ```bash
   npx firebase deploy --only hosting
   ```
   Deberías ver la app en `https://<PROJECT_ID>.web.app`.

---

## Durante la clase

### Parte A — Pipeline (los TODO están en `.github/workflows/`)

| TODO | Qué hacer |
|---|---|
| A1 | Triggers: `pull_request` para preview, `push` a `main` para producción |
| A2 | Inyectar SHA, rama y fecha del build como variables `NEXT_PUBLIC_BUILD_*` |
| A3 | Nombre del secreto, `projectId`, `expires` del preview y `channelId` de producción |
| A4 *(opcional)* | `concurrency` distinto para preview y producción |
| A5 *(opcional)* | GitHub Environment `production` |

Flujo de prueba:

```bash
git checkout -b feat/mi-cambio
# cambiá algún texto visible (p. ej. el título en app/page.tsx)
git commit -am "feat: cambio visible"
git push -u origin feat/mi-cambio
# abrí el PR en GitHub → esperá el comentario del bot con la URL del preview
```

Rollback: Firebase Console → Hosting → *Release history* → ⋮ → **Rollback**.
Promover un preview a producción sin rebuild:

```bash
npx firebase hosting:clone <PROJECT_ID>:<CANAL_PREVIEW> <PROJECT_ID>:live
```

### Parte B — Headers de seguridad y caché (en `firebase.json`)

1. Medí el estado inicial:
   ```bash
   node scripts/check-headers.mjs https://<PROJECT_ID>.web.app
   ```
   y en <https://securityheaders.com>.
2. Agregá los headers en `hosting.headers` de `firebase.json`.
3. Probá **en local** antes de pushear:
   ```bash
   npm run build && npm run serve
   node scripts/check-headers.mjs http://localhost:5000
   ```
   Abrí <http://localhost:5000/cursos> con DevTools → *Console*: si el filtro dejó de
   funcionar, la CSP está bloqueando algo. Leé el error: te dice qué y por qué.
4. Cuando pase en local, hacelo por PR: el preview te deja validarlo antes de producción.

Formato de un header en `firebase.json`:

```json
"headers": [
  {
    "source": "**",
    "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" }
    ]
  }
]
```

> Si dos reglas que matchean la misma URL definen el mismo header, **gana la última**
> (verificado con el emulador). Usalo para la estrategia de caché.

---

## Comandos útiles

| Comando | Para qué |
|---|---|
| `npm run dev` | Desarrollo local con hot reload (no aplica headers de `firebase.json`) |
| `npm run build` | Export estático a `out/` |
| `npm run serve` | Emulador de Hosting: sirve `out/` **con** los headers de `firebase.json` |
| `npm run typecheck` | Chequeo de tipos (también corre en el pipeline) |
| `npx firebase hosting:channel:list` | Lista canales de preview y sus vencimientos |
| `npx firebase hosting:channel:delete <canal>` | Borra un preview |

## Problemas comunes

- **El workflow no corre:** el trigger sigue en `workflow_dispatch` (TODO A1).
- **`Input required and not supplied: firebaseServiceAccount`:** el nombre del secreto no
  coincide, o el PR viene de un **fork** (GitHub no expone secretos a PRs de forks).
- **`/cursos` da 404 en el emulador o en producción:** revisá que `cleanUrls` siga en
  `true` (el export genera `cursos.html`, no `cursos/index.html`).
- **La app se ve pero el filtro no responde:** CSP bloqueando scripts. Consola de DevTools.
- **La imagen de portada no carga:** CSP bloqueando `img-src`.
- **Cambié `firebase.json` y no veo los headers:** ¿reconstruiste y reiniciaste el emulador?
  ¿Estás mirando una respuesta cacheada? Probá con `curl -I` o en una ventana privada.
