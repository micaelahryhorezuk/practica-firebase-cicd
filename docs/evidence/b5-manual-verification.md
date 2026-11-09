# B5 · comprobación manual de producción

**B5: reporte SecurityHeaders A e identidad live confirmados por dos capturas manuales distintas.** Tras solicitar únicamente el reporte faltante, la usuaria respondió «listo». La [nueva captura original sin modificar](Captura%20de%20pantalla%202026-11-08%20210426.png) muestra el resumen de SecurityHeaders para `https://practica-cicd-micela.web.app/`: calificación **A**, `Report Time: 09 Nov 2026 00:04:18 UTC`. Se ven indicadores verdes para Content-Security-Policy, Permissions-Policy, Referrer-Policy, Strict-Transport-Security, X-Content-Type-Options y X-Frame-Options. El aviso dice «Grade capped at A, please see warnings below.»; la captura no muestra esas advertencias ni el detalle de las políticas. No se deduce la hora del reporte del nombre del archivo. La imagen solo muestra el reporte y datos públicos del sitio, incluido un IP público; no se observan secretos, datos personales ni rutas locales privadas.

La [captura anterior del footer sin modificar](Captura%20de%20pantalla%202026-11-08%20204322.png) muestra la URL pública visible `https://practica-cicd-micela.web.app` y el pie `Versión c3051dc`, `Rama main`, `Build: 2026-11-08T20:20:08-03:00`. El borde inferior corta parcialmente el pie, pero SHA corto y rama son legibles. Esa captura **no** demuestra la calificación; la nueva captura del reporte **no** muestra el footer. No se infiere hora de captura de ninguno de sus nombres ni se usa la fecha de build como hora del reporte.

La [medición automática B5](b5-headers.json) conserva script exit 0 para headers/caché, pero el fetch separado de identidad falló con `ETIMEDOUT` (colector exit 2, `identity.verified=false`, `httpVerificationComplete=false`, `securityHeadersGrade=null`). Estas capturas aportan identidad y calificación **por vía manual**, sin reescribir el JSON ni convertir el fallo automático en éxito. La [nota inicial B1](b1-securityheaders-manual.md) fue **D** a 08 Nov 2026 16:23:08 UTC; el reporte B5 posterior muestra **A** a 09 Nov 2026 00:04:18 UTC.

## Prueba interactiva en producción

Tras restaurar la versión endurecida, el 09 Nov 2026 a las 02:28 UTC se abrió `/cursos`
en el navegador contra la URL live. Al
seleccionar el filtro `intermedio`, quedaron visibles exactamente 2 de 6 cursos:
“Integración y entrega continua” y “Observabilidad y SRE”. En la portada, la imagen
decorativa terminó de cargar con dimensiones naturales de 960×320. Esto verifica el
funcionamiento interactivo observado en esa sesión; no sustituye la captura histórica del
reporte ni modifica el JSON de medición automática.

## Rollback y restauración

Se verificó el rollback real de Firebase Hosting usando los releases retenidos del canal
`live`. La release `1794191173659000` apuntó a la versión base `256fe433460fdb36` (SHA
visible `bc9898b`); la respuesta HTTP fue 200 y confirmó el HTML de `baseline`, `Cache-Control:
max-age=3600` y la ausencia de CSP y de los cuatro headers de hardening. Inmediatamente
después, la release `1794191223360000` restauró la versión endurecida
`8accd40869561b02` (footer `c3051dc`/`main`). La release live actual quedó apuntando a esa
versión endurecida.
