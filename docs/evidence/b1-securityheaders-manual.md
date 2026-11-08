# B1 · calificación manual de SecurityHeaders

La [captura aportada por la usuaria](image.png) muestra el reporte de SecurityHeaders para <https://practica-cicd-micela.web.app/> con calificación **D** y hora del reporte **08 Nov 2026 16:23:08 UTC**. En la captura, Strict-Transport-Security figura presente; Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy y Permissions-Policy figuran ausentes.

Es evidencia manual de la **base sin hardening**, no de una medición automática exitosa ni del estado después de B2–B5. El [intento automático anterior](b1-securityheaders.json) conserva HTTP 403 y calificación desconocida; no se modifica.
