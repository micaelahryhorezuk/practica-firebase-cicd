# Práctica · CI/CD con Firebase Hosting y hardening de headers HTTP

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

Estado verificado tras la vinculación y el despliegue inicial:

- Login y `firebase init hosting:github` completados por la usuaria sin sobrescribir workflows.
- GitHub confirmó el secreto `FIREBASE_SERVICE_ACCOUNT_PRACTICA_CICD_MICELA`, coincidente
  con ambos workflows. Solo se consultaron nombre y fecha, nunca su valor.
- Con autorización explícita, se publicó la **base sin hardening** `bc9898b` en
  <https://practica-cicd-micela.web.app>, desde una copia aislada. Las mejoras de seguridad
  están publicadas solo en previews; producción conserva esa base.
- La [salida manual del script B1](docs/evidence/b1-manual-output.md) ya fue aportada en una
  captura sobre la base sin hardening. La [medición automática anterior](docs/evidence/b1-headers.json)
  falló por conexión; se conserva como antecedente, no como bloqueo actual del script.
- **B1 completa por evidencia manual:** el [reporte de SecurityHeaders y su captura](docs/evidence/b1-securityheaders-manual.md)
  muestran calificación **D** para la base sin hardening. El intento automático anterior
  devolvió HTTP 403 y permanece registrado como fallo histórico, no como escaneo exitoso.
- Entrega en dos PR abiertos y no draft, sin merge: [fuente #2](https://github.com/micaelahryhorezuk/practica-firebase-cicd/pull/2)
  `feat/firebase-cicd` → `main` (commit `3f6b763fa7d92d94823bd2be41fded8cc8825fe3`,
  342 líneas) y [evidencia B1 #3](https://github.com/micaelahryhorezuk/practica-firebase-cicd/pull/3)
  `docs/firebase-b1-evidence` → `feat/firebase-cicd` (commit
  `5404476eae8beb1b97838d754a5dbbf0ba754b0f`, 388 líneas). Ambos referencian sin cerrar
  la [issue aprobada #1](https://github.com/micaelahryhorezuk/practica-firebase-cicd/issues/1),
  aún abierta. El commit de evidencia conserva los resultados documentales de T6–T8b.
  En el SHA de fuente, `build_and_preview` y `Deploy Preview` terminaron SUCCESS (run
  42503835084). El [preview de fuente](https://practica-cicd-micela--pr2-feat-firebase-cicd-zjdzsiyo.web.app)
  respondió HTTP 200 con SHA `3f6b763` y rama correctos; `check-headers.mjs` pasó todos los
  controles de headers y caché (exit 0). Esto no acredita interacción en navegador.
  El [preview de evidencia](https://practica-cicd-micela--pr3-docs-firebase-b1-evi-eftmpc87.web.app)
  también pasó CI y los controles HTTP de headers, caché y metadatos para `5404476`
  (run 42503853409). El cierre documental posterior tendrá su propia comprobación de CI.
  La interacción en navegador sigue pendiente; merge, publicación del hardening, B5 y
  rollback no están autorizados.

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
