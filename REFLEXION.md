# Reflexión · CI/CD con Firebase Hosting

Repositorio: https://github.com/micaelahryhorezuk/practica-firebase-cicd
Producción prevista: https://practica-cicd-micela.web.app (**no verificada**).
Esta es una preparación local: no se ejecutaron push, PR, deploy ni rollback.

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
El nombre previsto del secreto debe confirmarse después de `firebase init hosting:github`.

## 4. CSP y funcionamiento

El HTML exportado contiene tres scripts inline en cada página inspeccionada: `/`, `/cursos`
y `404.html`. `script-src 'self'` permite archivos del propio origen, pero no estos scripts
inline de hidratación de Next.js. Por ello podría verse la página y no funcionar el filtro.
Esto se comprobó inspeccionando el HTML, **no reproduciendo el bloqueo en un navegador**.

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
por eso la evidencia relevante es el GET. Falta validar la imagen y el filtro en navegador.

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

### Pendiente en las cuentas de la usuaria

- [ ] Login y vinculación de GitHub; confirmar el nombre exacto del secreto.
- [ ] Medición B1 real de producción sin hardening y calificación de securityheaders.com.
  Como esta rama ya contiene headers, no desplegarla como si fuera el estado inicial.
  La medición inicial requiere publicar primero la base sin estos cambios de seguridad.
- [ ] PR mergeado, comentario del bot y URL de preview: **pendientes**.
- [ ] Verificación del filtro y la portada en navegador local y preview.
- [ ] Medición B5 de producción: pegar salida real de `check-headers.mjs` y calificación final.
- [ ] Rollback desde Hosting → Release history y comparación del SHA anterior/posterior.

No se presentan mediciones locales como evidencia de producción ni se declara ejecutado
ninguno de los pasos pendientes.
