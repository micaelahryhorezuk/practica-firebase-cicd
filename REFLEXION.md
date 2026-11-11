# Reflexión · SQL Connect (clase 2)

Solución integrada con el proyecto de clase 1. La reflexión anterior se conserva en [REFLEXION-CLASE1.md](REFLEXION-CLASE1.md).
El backend SQL Connect está desplegado y su API pública fue comprobada. Hay tracker y siete PR hijos en borrador, con ocho workflows de CI/preview aprobadas para sus SHA exactos. El [preview integrado](https://practica-cicd-micela--pr13-feat-clase2-sql-conn-pigrmg72.web.app/cursos) no equivale a publicación live. El flujo completo de registro, inscripción, aislamiento entre cuentas y baja pasó en Chromium en el preview integrado; la publicación live sigue en curso.

## 1. Identidad e IDOR

Ninguna operación del alumno recibe su UID porque permitir que el cliente elija el dueño del recurso facilita IDOR: acceder a un objeto de otra persona cambiando un identificador. El servidor obtiene `auth.uid` de un token validado y lo usa tanto en la consulta como en la clave de escritura/baja. Autenticarse no basta: además se debe comprobar la propiedad del recurso.

`UpsertAlumno` toma también el email de `auth.token.email`, no de un formulario que pueda falsificar el email de otra persona.

## 2. PUBLIC, USER y NO_ACCESS

El catálogo no contiene información personal y debe poder consultarse sin iniciar sesión: `ListCursos` es PUBLIC. `ListAlumnos` expone UID, nombre y email: necesita NO_ACCESS desde el cliente. USER sería insuficiente, pues permitiría que cualquier alumno autenticado consultara a todos los demás.

Un panel administrativo podría usar un backend privilegiado con Admin SDK, autenticación y autorización explícita del rol administrador, IAM mínimo y registro de accesos. Las credenciales administrativas nunca deben incluirse en el frontend. NO_ACCESS no elimina la posibilidad de acceso privilegiado administrativo.

## 3. Clave compuesta e idempotencia

La clave `(alumno, curso)` impone la unicidad en PostgreSQL, también si llegan solicitudes simultáneas o se omite el frontend. Una validación del cliente se puede eludir y tiene condiciones de carrera.

`matricula_insert` fallaría ante un duplicado. `matricula_upsert` crea la matrícula o conserva/actualiza la existente sin duplicarla. No se envía fecha en el upsert: `@default(expr: "request.time")` la completa al insertar y la inscripción repetida conserva la fecha original. El cupo se muestra pero el enunciado no pide implementar reserva de vacantes; eso requeriría una regla transaccional adicional en el servidor.

## 4. Configuración pública y App Check

La configuración web de Firebase identifica el proyecto y viaja en el bundle; no equivale a una clave de servicio ni concede acceso administrativo. Auth y las reglas de cada operación son las que autorizan los datos.

App Check agrega una señal de autenticidad de la aplicación/dispositivo y permite rechazar clientes no atestados cuando se configura y exige en el servicio. No sustituye Auth ni las reglas de propiedad, y no garantiza eliminar todo abuso. Aquí se explica esa capa; no se declara implementada.

## 5. Comparación con Express + pg

SQL Connect aporta esquema relacional declarativo, operaciones predefinidas compiladas a SQL, integración con Auth y generación de SDK. El navegador invoca nombres y variables, no SQL arbitrario. La plataforma parametriza las variables; no hay que construir consultas concatenando texto del usuario.

Frente a una API propia se pierde flexibilidad para lógica arbitraria, middleware y protocolos personalizados, y se depende del modelo y límites del proveedor. Con Express + pg se controla más, pero hay que construir y mantener autenticación, autorización por recurso, consultas parametrizadas, validación y operación del servidor.

A diferencia de Firestore Rules sobre documentos, aquí la autorización se declara en operaciones sobre un modelo relacional con claves foráneas y restricciones de base de datos.

## 6. CSP y orígenes exactos

La CSP anterior solo permitía conexiones al propio origen por herencia de `default-src 'self'`. Auth y SQL Connect requieren otros orígenes. `connect-src` permite únicamente `'self'`, `https://identitytoolkit.googleapis.com`, `https://securetoken.googleapis.com` y `https://firebasedataconnect.googleapis.com` para este flujo.

Un comodín como `https://*.googleapis.com` permitiría muchos servicios no usados por la app y ampliaría innecesariamente los destinos de una posible exfiltración. `connect-src` limita conexiones del navegador, pero no sustituye Auth ni la autorización de operaciones en SQL Connect. El flujo en navegador pasó en el preview servido por Hosting; ver [evidencia](docs/evidence/sql-connect/preview-browser.json).

## Evidencia de auditoría

Se registran aquí las salidas observadas de `npm run atacar`, antes y después de corregir. Solo emuladores locales y datos ficticios. Los resultados no sustituyen la comprobación en navegador ni prueban producción.

- Antes: [salida real](docs/evidence/sql-connect/antes.txt): el catálogo devuelve 7 cursos; ListAlumnos filtra datos personales sin login; faltan las operaciones de inscripción. Resultado: **1 vulnerabilidad y 2 controles pendientes**.
- Después: [salida real](docs/evidence/sql-connect/despues.txt): **Todos los controles pasaron**, sin vulnerabilidades ni pendientes. ListAlumnos se rechaza, la inscripción anónima se rechaza, la repetición no falla y se comprueba el aislamiento entre A y B.
- Pruebas de integración: [salida GREEN](docs/evidence/sql-connect/green.txt), **6/6 pasan**, exit 0. [RED original](docs/evidence/sql-connect/red.txt): 6 fallos por operaciones aún inexistentes. Tras completar la solución, también pasan `npm test` (13/13, incluidas configuración por entorno y regresiones de renderizado/cambio de cuenta), `npm run typecheck` y `npm run build` (export estático de las cuatro rutas).
- CSP: RED observado antes del cambio; después pasan las **9 pruebas de headers y pipeline**. [Headers/caché del preview](docs/evidence/sql-connect/preview-headers.txt) y [HTTP/CSP/identidad](docs/evidence/sql-connect/preview-http.json) pasan para SHA9234403. Esto no sustituye la comprobación de Network/consola en navegador.
- Backend de producción: [deploy exitoso](docs/evidence/sql-connect/production-deploy.txt) bajo prueba gratuita, sin activar facturación. [API real](docs/evidence/sql-connect/production-public-check.json): 7 cursos y 4 operaciones privadas rechazadas sin token; catálogo sin cambios tras los rechazos. El seed se ejecutó solo tras comprobar base vacía y cargó 7 cursos y 2 alumnos ficticios. Al principio el CLI usó base temporal; después [Cloud SQL quedó RUNNABLE](docs/evidence/sql-connect/production-instance-ready.json), [sql:diff no encontró diferencias](docs/evidence/sql-connect/production-sql-diff.txt) y se conservaron los siete IDs de cursos. El proveedor usa PostgreSQL18 frente a17 del enunciado; la usuaria aceptó esa diferencia sin cambiar de plan.
- Auth: la [primera consulta](docs/evidence/sql-connect/production-auth-status.json) devolvió CONFIGURATION_NOT_FOUND. Tras nueva captura del proveedor Habilitada, [la configuración pública del SDK ya responde200](docs/evidence/sql-connect/auth-sdk-ready.json) para el proyecto correcto. Flujo completo verificado en Chromium en preview; publicación live en curso.

## Entrega pendiente

- Repositorio existente: <https://github.com/micaelahryhorezuk/practica-firebase-cicd>.
- PR de clase 2 mergeado: pendiente.
- URL objetivo: <https://practica-cicd-micela.web.app>; inscripción de clase 2 todavía no verificada allí.
- Habilitación de Auth, publicación del frontend y cierre de L7: [pasos de entrega](docs/CLASE2.md#producción-y-entrega-pendientes-l7).
