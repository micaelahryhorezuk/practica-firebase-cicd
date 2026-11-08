# B1 · salida manual del script sobre la base

La usuaria aportó una [captura de la salida](Captura%20de%20pantalla%202026-11-07%20175000.png) de `check-headers.mjs` para <https://practica-cicd-micela.web.app/>. Se transcribe únicamente la parte legible; la línea de comando está recortada. No se observa el código de salida del proceso ni se confirma una hora de captura.

```text
▶ HTML: https://practica-cicd-micela.web.app/
  status 200
  ✘ content-security-policy (falta)
  ✔ strict-transport-security: max-age=31556926; includeSubDomains; preload
  ✘ x-content-type-options (falta)
  ✘ x-frame-options (falta)
  ✘ referrer-policy (falta)
  ✘ permissions-policy (falta)
  · cache-control: max-age=3600

▶ Asset estático: /_next/static/chunks/1x6obpmlu1_c2.js
  ✘ cache-control: max-age=3600

❌ 6 control(es) pendiente(s).
```

Los controles pendientes son esperables en la **base sin hardening** antes de B2–B5; no son una regresión de build o tests. Esta captura aporta la salida completa que faltaba para B1, pero no una calificación de SecurityHeaders ni una prueba de navegador. El intento automático anterior sigue documentado, sin modificación, en [b1-headers.json](b1-headers.json) (fallo de conexión); [b1-securityheaders.json](b1-securityheaders.json) conserva el HTTP 403 y la calificación desconocida. Para completar B1 falta únicamente la calificación y captura de SecurityHeaders aportadas desde el navegador de la usuaria.
