# Clase 2 · SQL Connect

La práctica se integra en este repositorio. La reflexión y las evidencias de clase 1 se conservan en [REFLEXION-CLASE1.md](../REFLEXION-CLASE1.md).
La entrega nueva está en [REFLEXION.md](../REFLEXION.md).

## Ejecutar en local

Desde la raíz de este repositorio:

```bash
npm ci
npm run emulators -- --project demo-catalogo
```

En otra terminal:

```bash
GCLOUD_PROJECT=demo-catalogo npm run seed
npm run dev
```

En desarrollo, `lib/firebase-config.ts` mantiene los cuatro valores de `demo-catalogo` para esta ejecución aislada. Los campos de ejemplo de apiKey/appId sirven solamente con emuladores. En producción, el módulo ya contiene los cuatro valores públicos de la app web de `practica-cicd-micela`; esto no demuestra que Auth, el despliegue o el flujo en navegador funcionen. Abrir <http://localhost:3000/cursos>, crear una cuenta, inscribirse, consultar Mis inscripciones y darse de baja. `npm run dev` no aplica los headers de Hosting: la lógica local se prueba allí con Auth y Data Connect emulados. Para inspeccionar el header CSP se necesita el export servido por Hosting; las conexiones del navegador a emuladores en otros puertos no están permitidas por esta lista de orígenes de producción. No ampliar la CSP de producción para hacer funcionar esos puertos.

En una tercera terminal, con esos mismos emuladores y datos, ejecutar las comprobaciones cuando la implementación esté lista:

```bash
GCLOUD_PROJECT=demo-catalogo npm run atacar
GCLOUD_PROJECT=demo-catalogo npm run test:sql
npm test
npm run typecheck
npm run build
```

Los usuarios y matrículas de estas pruebas quedan solo en el emulador. No ejecutar la auditoría contra producción. No borrar un directorio de datos existente para resolver errores: usar un directorio nuevo de prueba o revisar primero qué contiene.

## Solución

| Regla | Archivo | Decisión |
|---|---|---|
| L1 | `dataconnect/schema/schema.gql` | Clave compuesta alumno/curso; fecha por defecto del servidor. |
| L2 | `dataconnect/cursos/mutations.gql` | USER; UID del token; upsert para no duplicar. |
| L3 | `dataconnect/cursos/queries.gql` | USER; consulta por auth.uid, alias matriculas. |
| L4 | `dataconnect/cursos/queries.gql` | ListAlumnos con NO_ACCESS; no alcanza con USER. |
| L5 | `dataconnect/cursos/mutations.gql` | Baja por clave compuesta con auth.uid. |
| L6 | `firebase.json` | Orígenes exactos de Auth y SQL Connect. |

La fecha es un valor por defecto al insertar: repetir el upsert sin enviar fecha conserva la fecha original. El cliente no envía ni UID, ni email, ni fecha para una matrícula. `@default` por sí solo no impide una escritura arbitraria de administrador: la protección del cliente está en las operaciones expuestas y sus expresiones.

## Producción y entrega pendientes (L7)

### Completado con autorización posterior

- Proyecto `practica-cicd-micela`: facturación desactivada y sin cuenta de cobro asociada, comprobado antes del despliegue. No se activó Blaze.
- App web registrada. `lib/firebase-config.ts` usa sus cuatro valores públicos en producción y conserva `demo-catalogo` en desarrollo; no contiene credenciales administrativas.
- `firebase deploy --only dataconnect --project practica-cicd-micela`: exit 0. Esquema y conector `catalogo/cursos` publicados bajo la prueba gratuita. El CLI informó creación de Cloud SQL y uso temporal de una base de datos mientras se completa; no se afirma que una migración física omitida durante esa creación ya haya terminado.
- Base nueva vacía comprobada antes del seed. Se cargó el archivo original del enunciado: 7 cursos y 2 alumnos ficticios. No volver a sembrar automáticamente una base con datos.
- API real, sin emuladores: 7 cursos públicos; ListAlumnos, MisInscripciones, Inscribirme y DarmeDeBaja rechazadas sin token; catálogo sin cambios tras esos rechazos.
- Pruebas del padre: `npm test` 13/13; tipos y build correctos. El verificador independiente confirmó el diferencial de exports y la configuración/costos, sin bloqueantes de implementación. Su suite/tipos aislados no pudieron reproducirse por dependencias `typescript`/`react` y ejecutable `tsc` ausentes: no se cuentan como una segunda ejecución aprobada. Esto tampoco acredita interacción en navegador.

Evidencias: [preflight](evidence/sql-connect/production-preflight.json), [deploy](evidence/sql-connect/production-deploy.txt), [seed](evidence/sql-connect/production-seed.json), [controles públicos](evidence/sql-connect/production-public-check.json) y [estado de Auth](evidence/sql-connect/production-auth-status.json). El [estado posterior](evidence/sql-connect/production-postflight.json) confirma que sigue sin facturación y que la instancia tiene etiqueta de prueba `ft`. En esa lectura estaba `PENDING_CREATE`; [la comprobación posterior](evidence/sql-connect/production-instance-ready.json) confirmó `RUNNABLE`, manteniendo prueba `ft` y sin cuenta de cobro. Después, [sql:diff](evidence/sql-connect/production-sql-diff.txt) terminó con exit 0 y `diffs: []`, y [la consulta posterior](evidence/sql-connect/production-after-ready.json) conservó los siete IDs de cursos. No se aplicó ninguna migración destructiva. El proveedor provisionó **PostgreSQL 18**, aunque el PDF menciona 17; la usuaria aceptó mantener la versión de la prueba gestionada sin cambiar de plan ni recrear la instancia.

### Verificación de navegador y cierre

El 2026-11-11 se comprobó el preview integrado con Chromium real: catálogo de siete cursos, filtro inicial de dos, registro, inscripción, consulta propia, cierre de sesión, aislamiento de una segunda cuenta, reingreso y baja. [Evidencia](evidence/sql-connect/preview-browser.json). Se usaron cuentas ficticias, conservadas sin publicar credenciales; un primer intento incompleto dejó una matrícula ficticia. No se alteraron registros de usuarios existentes. La ruta `/cursos` no contiene imágenes.

El build local y typecheck pasan; `npm test` informa cinco archivos aprobados en este entorno. El error anterior del build era EPERM al lanzar TypeScript en el sandbox, no una configuración inválida: fuera de esa restricción termina con exit 0 sin cambiar código.

La usuaria autorizó integrar los PR y publicar Hosting después de estas comprobaciones, sin activar facturación ni borrar recursos. Integración y comprobación live siguen en curso; no se presentan todavía como completadas. No se ejecuta auditoría, seed ni migración contra producción.

## CSP

`connect-src` permite el propio origen y estos tres orígenes HTTPS:

- `identitytoolkit.googleapis.com`: registro e inicio de sesión por email/contraseña.
- `securetoken.googleapis.com`: renovación del token de Auth.
- `firebasedataconnect.googleapis.com`: operaciones del conector.

El SDK instalado de Data Connect construye sus URLs con `firebasedataconnect.googleapis.com`. No se autoriza `*.googleapis.com`, ya que permitiría servicios que la app no necesita. Esto cubre el flujo email/contraseña del enunciado, no agrega proveedores OAuth. Se conserva la política de scripts de clase 1, incluida su concesión documentada `'unsafe-inline'`; endurecerla con hashes sería un trabajo distinto. El test estructural no basta por sí solo; el flujo de Auth e inscripción bajo esta CSP fue comprobado en Chromium en el preview integrado, según la evidencia enlazada.

## Entregables

- Código publicado para revisión: [rama integrada del último hijo](https://github.com/micaelahryhorezuk/practica-firebase-cicd/tree/feat/clase2-sql-connect-07-production). Aún no integrado a main.
- Salidas reales antes/después de `npm run atacar`: [REFLEXION.md](../REFLEXION.md).
- [Issue aprobado #5](https://github.com/micaelahryhorezuk/practica-firebase-cicd/issues/5), [tracker draft #6](https://github.com/micaelahryhorezuk/practica-firebase-cicd/pull/6), hijos #7–#13. [CSP #12](https://github.com/micaelahryhorezuk/practica-firebase-cicd/pull/12) y los demás siguen sin merge; aprobación posterior necesaria.
- [Ocho workflows CI/preview](evidence/sql-connect/ci-previews.json) aprobadas para sus SHA exactos. Ejecutan instalación, typecheck, build y deploy, no los 13 tests unitarios. [Preview integrado #13](https://practica-cicd-micela--pr13-feat-clase2-sql-conn-pigrmg72.web.app/cursos); no constituye prueba de navegador ni live.
- URL de producción con inscripción: pendiente de L7.
- Seis respuestas: [REFLEXION.md](../REFLEXION.md).
