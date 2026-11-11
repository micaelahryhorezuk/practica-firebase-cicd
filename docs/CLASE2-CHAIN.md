# Clase 2 · seguimiento de revisión

Los siete PR hijos (#7–#13) fueron integrados con merge commits y CI aprobada para cada cabeza exacta. La usuaria autorizó merge y publicación live, sin facturación ni borrado de recursos. El tracker #6 es la integración final a main; su workflow publica Hosting.

## Base y alcance

- Base verificada: `main`, commit `4b23c1bb87e2cd8b9e5e4742c0038a01e4b695ea`.
- Su árbol coincide con la base local `1e4f30e`; los hijos conservan diffs limpias de Clase 2.
- Estrategia elegida: feature-branch-chain. No se reescribe el historial de los hijos.
- Backend desplegado en `practica-cicd-micela`, sin facturación, bajo prueba gratuita.
- Frontend de Clase 2 publicado y comprobado en [live](https://practica-cicd-micela.web.app); [evidencia](evidence/sql-connect/live-browser.json).

## Unidades

| Orden | Rama | Resultado |
|---|---|---|
| 1 | `feat/clase2-sql-connect-01-backend` | Modelo Matricula, autorización y tests SQL. |
| 2 | `feat/clase2-sql-connect-02-audit` | Auditoría y evidencia antes/después. |
| 3 | `feat/clase2-sql-connect-03-auth` | Cuenta por correo y perfil del alumno. |
| 4 | `feat/clase2-sql-connect-04-enrollments` | Inscripciones propias y aislamiento de cuentas. |
| 5 | `feat/clase2-sql-connect-05-catalog` | Catálogo SQL e inscripción desde la UI. |
| 6 | `feat/clase2-sql-connect-06-csp-delivery` | CSP, reflexión y preparación de entrega. |
| 7 | `feat/clase2-sql-connect-07-production` | Configuración real y evidencia del backend gratuito. |

El hijo 1 apunta al tracker; cada hijo posterior apunta al padre inmediato. El tracker apunta a main. No integrar ningún PR sin autorización.

## Prueba y límites

- Padre: 13 tests estáticos/renderizado/configuración; tipos y build correctos.
- Emuladores: 6 tests SQL y auditoría sin vulnerabilidades.
- API real: 7 cursos públicos, 4 operaciones privadas rechazadas sin token y catálogo conservado.
- Cloud SQL RUNNABLE, etiqueta gratuita `ft`, sin cuenta de cobro y sql:diff vacío.
- PostgreSQL18 de la prueba gestionada aceptado por la usuaria frente a17 del PDF.
- Revisión nativa del slice7 aprobada y reconocida; no sustituye las pruebas funcionales.
- La suite independiente no pudo ejecutarse completa por dependencias faltantes en su aislamiento; se conserva esa limitación. El diferencial independiente de configuración sí pasó.
- Auth confirmado: registro, ingreso, inscripción y baja funcionan en Chromium en el preview integrado. La evidencia inicial CONFIGURATION_NOT_FOUND quedó superada por la configuración posterior.
- Doce comprobaciones live aprobadas, incluyendo imagen. Corrección #14 integrada; suite17/17, tipos/build y verificación independiente aprobados.

## Integración completada

Hijos integrados del último al primero, conservando las bases originales, sin borrar ramas. El árbol funcional del tracker coincide con el preview probado9234403. Antes de integrar #6 se exige CI aprobada para su cabeza exacta. No borrar la instancia ni cambiar de plan: la prueba gratuita es única por proyecto. No se autorizó borrar recursos ni activar facturación.
