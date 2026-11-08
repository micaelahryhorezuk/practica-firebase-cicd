# Identidad manual de preview y producción

Las dos capturas aportadas permiten identificar el snapshot desplegado en el preview de evidencia y la base que sigue visible en producción. Muestran la URL de `/cursos` y el pie de versión/rama; no son una ejecución del chequeo HTTP automático ni una prueba de interacción.

| Entorno | URL visible en la captura | Pie visible | Captura original |
|---|---|---|---|
| Preview del PR #3 | `https://practica-cicd-micela--pr3-docs-firebase-b1-evi-eftmpc87.web.app/cursos` | Versión `b6639e2`, rama `docs/firebase-b1-evidence` | [Captura de pantalla 2026-11-08 194554.png](Captura%20de%20pantalla%202026-11-08%20194554.png) |
| Producción | `https://practica-cicd-micela.web.app/cursos` | Versión `bc9898b`, rama `baseline` | [Captura de pantalla 2026-11-08 194615.png](Captura%20de%20pantalla%202026-11-08%20194615.png) |

Se asignó cada entorno por su URL y pie visibles, no por el nombre del archivo. En las capturas no se observan secretos, tokens ni identificadores privados; se ven URLs públicas, tarjetas del catálogo y datos de build. No se infiere la hora de captura a partir del nombre del archivo.

Este registro manual sustituye la confirmación de identidad que no produjo la última consulta HTTP automática (`fetch failed`, `ETIMEDOUT`/`ENETUNREACH`). Ese fallo sigue registrado; no invalida el CI SUCCESS del snapshot `b6639e2` (run 42505029051), pero tampoco se convierte en éxito HTTP. Las capturas estáticas no prueban que el filtro o la portada funcionen al interactuar. Ambos PR siguen abiertos, sin merge: no hay despliegue del hardening en producción, medición B5 ni rollback.
