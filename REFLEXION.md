# Reflexión · CI/CD con Firebase Hosting

Repositorio: https://github.com/micaelahryhorezuk/practica-firebase-cicd
Producción: https://practica-cicd-micela.web.app. **Antes de los merges**, la base
`bc9898b` sin hardening estaba verificada por HTTP; las
[capturas manuales de versión](docs/evidence/manual-version-verification.md) muestran
preview `b6639e2` y producción `bc9898b` en ese momento, no el footer live actual.
Con autorización posterior S9, [PR #2](https://github.com/micaelahryhorezuk/practica-firebase-cicd/pull/2)
se integró a `main` (`88e0938ab783d90d28820274fe7f88cefa886da5`, run de producción
42534289830 SUCCESS) y luego [PR #3](https://github.com/micaelahryhorezuk/practica-firebase-cicd/pull/3)
(`c3051dc842a6de6fc15471cab8e8049c8cec5ce7`, run 42534675406 SUCCESS); ambos
incluyeron `Deploy al canal live`. La [medición B5 local](docs/evidence/b5-production.md)
registra script público exit 0 para headers/caché; el fetch separado de identidad falló.
La [captura manual B5](docs/evidence/b5-manual-verification.md) confirma el footer live
`c3051dc`/`main` junto a la URL, aunque el pie está parcialmente cortado abajo. Aún no hay
calificación final de SecurityHeaders. Estas notas no están autorizadas para publicación;
rollback no fue autorizado ni ejecutado.

## 1. ¿Por qué vence el preview?

El vencimiento de tres días limita entornos abandonados, consumo de cuota y exposición
prolongada de versiones antiguas. La URL de preview no es un control de acceso:
no debe contener secretos ni datos sensibles aunque sea temporal.

## 2. Desplegar y liberar

Desplegar instala una versión en un entorno. Liberar la hace disponible a sus usuarios.
El PR despliega un preview sin liberar en producción; el push a `main` publica en `live`,
por lo que en este flujo despliegue y liberación de producción están acoplados.
Un rollback cambia Hosting, no Git: el próximo push a `main` volvería a publicar su código.
Para mantener la corrección, el equipo debe revertir o corregir el cambio mediante un PR.

## 3. Credenciales

La clave JSON autentica a la service account. Si se publica, quien la obtenga puede actuar
con sus permisos, por ejemplo desplegar contenido malicioso. Debe estar únicamente en un
secreto de GitHub, con permisos mínimos de despliegue, acceso restringido y rotación ante
exposición. No basta con borrar una clave del último commit: debe revocarse.
El workflow omite PR de forks y no usa `pull_request_target` para ejecutar su código con secretos.
Después de `firebase init hosting:github`, GitHub confirmó el secreto
`FIREBASE_SERVICE_ACCOUNT_PRACTICA_CICD_MICELA`, coincidente con ambos workflows.
Solo se consultaron el nombre y la fecha de actualización, nunca el valor.

## 4. CSP y funcionamiento

El HTML exportado contiene tres scripts inline en cada página inspeccionada: `/`, `/cursos`
y `404.html`. `script-src 'self'` permite archivos del propio origen, pero no estos scripts
inline de hidratación de Next.js. Por ello podría verse la página y no funcionar el filtro.
Esto se comprobó inspeccionando el HTML, **no reproduciendo el bloqueo en un navegador**.
La usuaria informó después que el filtro funciona y la imagen de Inicio se ve en el preview;
es su comprobación manual, no interacción del agente ni observación de producción.

La política preparada permite `'unsafe-inline'` solo en `script-src`, sin `'unsafe-eval'`.
Es una concesión: los scripts inline legítimos funcionan, pero también podrían ejecutarse
scripts inline inyectados si existiera una vulnerabilidad XSS. No elimina la necesidad de
validar datos y evitar inserciones inseguras de HTML. `style-src` permanece en `'self'`:
el export inspeccionado usa CSS externo y no contiene estilos inline.

La alternativa más restrictiva es calcular hashes SHA-256 de cada script inline del export
en cada build e incorporarlos a la CSP antes de desplegar. No está implementada en esta
versión. Un nonce distinto por respuesta necesita renderizado dinámico; un nonce fijo en
archivos estáticos no proporciona esa garantía.

La portada solicita `https://picsum.photos` y un GET real respondió con redirección 302 a
`https://fastly.picsum.photos`, seguido de HTTP 200 (`image/jpeg`). Ambos orígenes exactos
están en `img-src`; no se habilitaron `https:` ni comodines. La solicitud HEAD respondió 405,
por eso la evidencia relevante es el GET. La usuaria confirmó filtro e imagen en el
preview (L25 del seguimiento ODD); el agente no realizó esa prueba interactiva ni la
comprobó en producción.

## 5. Headers básicos

| Header | Mitigación y decisión |
|---|---|
| Strict-Transport-Security | Obliga a futuras conexiones HTTPS durante un año tras una respuesta HTTPS. No protege una primera visita HTTP por sí solo. Sin preload ni includeSubDomains, que exigirían revisar todos los subdominios. Firebase puede reemplazarlo en dominios `web.app`. |
| X-Content-Type-Options | `nosniff` evita interpretación de contenido con tipos distintos al MIME declarado. |
| X-Frame-Options | `DENY` evita incrustación en iframes y reduce clickjacking; complementado por CSP `frame-ancestors 'none'`. |
| Referrer-Policy | `strict-origin-when-cross-origin` limita el referrer entre orígenes al origen y no lo envía al bajar de HTTPS a HTTP. |
| Permissions-Policy | Deshabilita cámara, micrófono y geolocalización, que el catálogo no necesita. |

## 6. Caché

`/_next/static/**` usa `public, max-age=31536000, immutable`: sus nombres incluyen hashes;
al cambiar el contenido se genera otra URL. El HTML usa `no-cache`, que permite almacenarlo
pero exige revalidación antes de reutilizarlo. Así se detectan deploys y rollbacks sin esperar
un año. La regla específica de assets aparece después de la general y la sobreescribe.

## 7. Si se necesitara SSR

`output: "export"` dejaría de servir: se necesitaría un runtime de servidor, por ejemplo
Firebase App Hosting sobre Cloud Run, con plan Blaze y facturación habilitada.
La CSP podría usar nonces nuevos por respuesta y adaptarse a los orígenes realmente usados.
Habría que revisar también la caché del HTML dinámico y no cachear contenido personalizado
como si fuera un asset público.

## Evidencias y entrega

### Local (no sustituye B1/B5 en producción)

- Instalación: `npm ci --no-audit --no-fund`, exit 0; sin cambios de versiones.
- Plantilla antes de modificar: `npm run typecheck` y `npm run build`, exit 0.
- Antes de headers, emulador con proyecto ficticio `demo-practica-cicd-micela`:
  `check-headers.mjs` terminó con exit 1 y `❌ 7 control(es) pendiente(s).`.
- Después de headers, el mismo script en el emulador terminó con exit 0 y
  `✅ Todos los controles pasaron.`. Un probe HTTP verificó `/` y `/cursos` con status 200,
  ruta desconocida con 404, HTML con `Cache-Control: no-cache` y asset JavaScript con
  `public, max-age=31536000, immutable`.
- Tests estructurales de pipeline y headers: 4 + 4 pasan por separado.
- Checks finales: suite 8/8, `npm run typecheck`, `npm run build` y `git diff --check`, exit 0.
- Revisión independiente: preparación local aprobada por S1–S6; también ejecutó typecheck,
  build y suite 8/8 en una copia aislada, y validó semánticamente ambos YAML. No encontró
  bloqueos. No ejecutó operaciones remotas ni pruebas de navegador.

### Producción inicial: B1 completa con evidencias manuales

Medición UTC: `2026-11-07T20:38:02.457Z`. Base publicada:
`bc9898bb9a8320c6920bcba9e026a0732d70f9ff`, con etiqueta de build `baseline`.
El HTML de `/` coincide exactamente con el export local; `/` y `/cursos` respondieron 200,
una ruta inexistente 404 y un asset JavaScript 200.

Los headers HTTP capturados muestran:

- HSTS agregado por Firebase: `max-age=31556926; includeSubDomains; preload`.
- Ausentes: CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy y Permissions-Policy.
- `Cache-Control: max-age=3600` tanto en HTML como en el asset inspeccionado, sin `immutable`.

La [captura manual de la salida completa del script B1](docs/evidence/b1-manual-output.md)
ya muestra `/` con status 200, los headers iniciales, el caché del HTML y del asset, y
`❌ 6 control(es) pendiente(s).` Son controles esperables en la base antes del hardening,
no una regresión de build o tests. La captura no muestra el código de salida del proceso.

El intento **automático anterior**, conservado por separado, terminó con exit 1 por
`TypeError: fetch failed` (`ETIMEDOUT`/`ENETUNREACH`) después de imprimir solo la URL del
HTML. No llegó al resumen de controles; este fallo de conexión ya no bloquea la salida B1.
El intento automático de SecurityHeaders respondió HTTP 403, sin calificación. Por separado,
la [captura manual del reporte](docs/evidence/b1-securityheaders-manual.md) muestra **D** para
<https://practica-cicd-micela.web.app/> (08 Nov 2026 16:23:08 UTC): HSTS presente y CSP,
X-Frame-Options, X-Content-Type-Options, Referrer-Policy y Permissions-Policy ausentes.
Esto completa B1 sin afirmar que el escaneo automático haya funcionado ni que la base esté
endurecida. La usuaria confirmó después filtro e imagen en preview; no es una
comprobación interactiva del agente.

Evidencias conservadas:

- [Despliegue, incidente corregido y límites](docs/evidence/baseline-deployment.md).
- [Salida manual del script B1 y captura original](docs/evidence/b1-manual-output.md).
- [Identidad, headers, rutas y fallo histórico del intento automático](docs/evidence/b1-headers.json).
  Para publicar este JSON solo se sustituyó el prefijo absoluto local del proyecto en
  `stderr` por `<PROJECT_ROOT>`; el original sin redacción se conserva privadamente.
  Mediciones, `stdout`, `exitCode`, marcas temporales y demás campos no cambiaron.
- [Respuesta automática histórica de SecurityHeaders: HTTP 403 sin calificación](docs/evidence/b1-securityheaders.json).
- [Reporte manual de SecurityHeaders: D y captura](docs/evidence/b1-securityheaders-manual.md).
- [Capturas manuales de versión: preview de cierre y base en producción](docs/evidence/manual-version-verification.md).

### B5: medición parcial de producción tras los merges

El [registro B5 y su JSON crudo](docs/evidence/b5-production.md) documentan script público
exit 0 (HTML 200, seis headers presentes, HTML `no-cache`, JS anual `immutable`) a
`2026-11-08T23:24:42.774Z`. El colector terminó exit 2 por un fetch **separado** de
identidad (`ETIMEDOUT`); `identity.verified=false`, `httpVerificationComplete=false` y
`securityHeadersGrade=null`. `c3051dc` era el commit esperado en ese JSON, **no** el footer
leído automáticamente. La [captura manual B5](docs/evidence/b5-manual-verification.md)
muestra URL live y footer `c3051dc`/`main`, legibles pese al corte inferior; no sustituye
el fetch automático fallido. La nota final sigue **UNKNOWN**, no una extrapolación de la
**D** inicial (08 Nov 2026 16:23:08 UTC); el HTTP 403 del scanner corresponde solo a B1.
Falta únicamente una captura nueva del reporte de SecurityHeaders B5 con URL, hora y nota.
No se hicieron nuevas consultas ni rollback; estas notas son locales y aún no están publicadas.

### Seguimiento de la usuaria

- [x] Login y vinculación de GitHub; nombre exacto del secreto confirmado.
- [x] Publicación autorizada de la base sin hardening y comprobación de identidad pública.
- [x] Salida íntegra de `check-headers.mjs` en la captura aportada por la usuaria.
- [x] B1: salida manual del script y captura de SecurityHeaders con calificación D
  sobre la base sin hardening. Ese era el estado inicial; el hardening se desplegó
  después de integrar ambos PR.
- [x] Cadena entregada inicialmente como PR de preview (etapa anterior):
  [PR #2 de fuente](https://github.com/micaelahryhorezuk/practica-firebase-cicd/pull/2)
  `feat/firebase-cicd` → `main` (`3f6b763fa7d92d94823bd2be41fded8cc8825fe3`,
  342 líneas) y [PR #3 de evidencia](https://github.com/micaelahryhorezuk/practica-firebase-cicd/pull/3)
  `docs/firebase-b1-evidence` → `feat/firebase-cicd`
  (commit documental anterior `5404476`, cierre comprobado `b6639e2`). Ambos enlazan sin cerrar
  la [issue aprobada #1](https://github.com/micaelahryhorezuk/practica-firebase-cicd/issues/1),
  todavía abierta. El commit de evidencia contiene la documentación de T6–T8b.
- [x] CI de fuente SUCCESS (run 42503835084), evidencia anterior SUCCESS
  (run 42503853409) y cierre `b6639e2` SUCCESS (run 42505029051).
- [x] Identidad manual del cierre: las [capturas de `/cursos`](docs/evidence/manual-version-verification.md)
  muestran `b6639e2` en preview de evidencia y `bc9898b` en producción. La última
  consulta HTTP automática falló por conexión; no se presenta como éxito.
- [x] Comentarios del bot y URLs de preview verificados:
  [fuente](https://practica-cicd-micela--pr2-feat-firebase-cicd-zjdzsiyo.web.app) y
  [evidencia](https://practica-cicd-micela--pr3-docs-firebase-b1-evi-eftmpc87.web.app).
  Ambos: HTTP 200, SHA/rama correctos y `check-headers.mjs` exit 0, todos los controles.
  HSTS lo agrega Firebase, HTML usa `no-cache` y JS caché anual `immutable`.
  Esto no es una comprobación interactiva de navegador ni la medición B5 de producción.
- [x] PR #2 y luego PR #3 integrados normalmente en `main` con S9; runs 42534289830 y
  42534675406 SUCCESS, incluido `Deploy al canal live` en ambos. Sin bypass ni rollback.
- [x] Filtro e imagen confirmados manualmente por la usuaria en preview (L25); no hay prueba
  interactiva del agente ni confirmación equivalente de producción.
- [x] B5: salida real del script público registrada con exit 0 en
  [evidencia local](docs/evidence/b5-production.md); no es calificación ni identidad live.
- [x] B5: captura manual del footer live `c3051dc`/`main` junto a la URL; el fallo
  automático de identidad por `ETIMEDOUT` se conserva por separado.
- [ ] B5: captura nueva de SecurityHeaders con URL, hora y nota final.
- [ ] Rollback desde Hosting → Release history y comparación del SHA anterior/posterior:
  pendiente y **no autorizado**, no ejecutado.

No se presentan las capturas históricas como prueba de identidad B5; la captura nueva
confirma solo el footer, no la calificación final. Ninguna nota B5 local está publicada
remotamente.
