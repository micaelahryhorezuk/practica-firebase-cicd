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

La configuración de `lib/firebase-config.ts` apunta a `demo-catalogo` para esta ejecución aislada. Los campos de ejemplo de apiKey/appId sirven solamente con emuladores. Abrir <http://localhost:3000/cursos>, crear una cuenta, inscribirse, consultar Mis inscripciones y darse de baja. `npm run dev` no aplica los headers de Hosting: la lógica local se prueba allí con Auth y Data Connect emulados. Para inspeccionar el header CSP se necesita el export servido por Hosting; las conexiones del navegador a emuladores en otros puertos no están permitidas por esta lista de orígenes de producción. No ampliar la CSP de producción para hacer funcionar esos puertos.

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

Estos pasos requieren tu autorización y acceso a tu proyecto. No fueron ejecutados por preparar la solución:

1. En Firebase Console, habilitar Authentication → Correo electrónico/contraseña.
2. Copiar la configuración **web pública** del proyecto a `lib/firebase-config.ts`; debe coincidir con `.firebaserc`. No usar credenciales de service account en el navegador.
3. Revisar las condiciones vigentes y la elegibilidad de la prueba de Cloud SQL en la consola. No asumir costo cero ni activar facturación sin comprobarlo.
4. Con sesión autorizada del CLI, inspeccionar la migración:
   ```bash
   npx firebase dataconnect:sql:diff
   npx firebase deploy --only dataconnect
   ```
   Revisar el SQL y las confirmaciones antes de aceptarlas.
5. Si corresponde cargar los cursos iniciales, revisar `dataconnect/seed_data.gql` antes de ejecutar:
   ```bash
   npx firebase dataconnect:execute dataconnect/seed_data.gql
   ```
   El archivo también carga dos alumnos ficticios; decidir si corresponde incluirlos en producción. No reemplazar datos existentes inadvertidamente.
6. Publicar la rama mediante PR y revisar su preview. Los workflows y el proyecto de clase 1 se mantienen. No hacer merge hasta probar registro, inscripción y baja en el preview.
7. En el navegador, con el build de producción, comprobar Network y consola: solicitudes a Auth/SQL Connect sin errores CSP. Revisar también el filtro, la imagen de portada y la identidad del build.
8. Solo después, autorizar el merge y comprobar <https://practica-cicd-micela.web.app>.

## CSP

`connect-src` permite el propio origen y estos tres orígenes HTTPS:

- `identitytoolkit.googleapis.com`: registro e inicio de sesión por email/contraseña.
- `securetoken.googleapis.com`: renovación del token de Auth.
- `firebasedataconnect.googleapis.com`: operaciones del conector.

El SDK instalado de Data Connect construye sus URLs con `firebasedataconnect.googleapis.com`. No se autoriza `*.googleapis.com`, ya que permitiría servicios que la app no necesita. Esto cubre el flujo email/contraseña del enunciado, no agrega proveedores OAuth. Se conserva la política de scripts de clase 1, incluida su concesión documentada `'unsafe-inline'`; endurecerla con hashes sería un trabajo distinto. El test estructural de `firebase.json` no demuestra que el navegador complete la conexión: queda pendiente probar Network y consola en un preview autorizado con configuración real de Auth y Data Connect. No se afirma que el flujo funcione en navegador bajo la CSP antes de esa prueba.

## Entregables

- URL del repositorio con esta rama integrada: pendiente de publicación.
- Salidas reales antes/después de `npm run atacar`: [REFLEXION.md](../REFLEXION.md).
- URL del PR de CSP mergeado: pendiente.
- URL de producción con inscripción: pendiente de L7.
- Seis respuestas: [REFLEXION.md](../REFLEXION.md).
