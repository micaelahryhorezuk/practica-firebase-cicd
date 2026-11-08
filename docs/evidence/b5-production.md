# B5 · producción tras integrar los dos PR

**Resultado parcial:** el script público pasó los controles de headers y caché en el sitio live. Una [captura manual B5](b5-manual-verification.md) confirma el footer live `c3051dc`/`main`, pero la calificación final de SecurityHeaders **sigue sin comprobarse**. Este registro es local: no hay autorización para publicarlo en GitHub ni para crear otro PR.

| Etapa | Evidencia observada |
|---|---|
| PR [#2](https://github.com/micaelahryhorezuk/practica-firebase-cicd/pull/2) | Merge normal a `main`, head fijado `3f6b763fa7d92d94823bd2be41fded8cc8825fe3`, merge `88e0938ab783d90d28820274fe7f88cefa886da5`; [run 42534289830](https://github.com/micaelahryhorezuk/practica-firebase-cicd/actions/runs/42534289830) SUCCESS, incluido `Deploy al canal live`. |
| PR [#3](https://github.com/micaelahryhorezuk/practica-firebase-cicd/pull/3) | Retarget a `main`, 14 archivos de evidencia/formato, JSON Firebase semánticamente idéntico; merge normal con head fijado `b15f7a3`, merge `c3051dc842a6de6fc15471cab8e8049c8cec5ce7` y árbol igual al head aprobado; [run 42534675406](https://github.com/micaelahryhorezuk/practica-firebase-cicd/actions/runs/42534675406) SUCCESS, incluido `Deploy al canal live`. |

Ambos merges siguieron el orden autorizado en S9, sin bypass, squash, borrado de ramas ni rollback. El commit `c3051dc842a6de6fc15471cab8e8049c8cec5ce7` era el **objetivo esperado** del despliegue/CI; el SHA corto y la rama se leen por separado en la captura manual, no en el fetch HTTP fallido.

## Script público B5

El [JSON público de la medición](b5-headers.json) conserva los resultados y solo oculta el prefijo local del diagnóstico; el original privado se preserva fuera de Git. Registra `2026-11-08T23:24:42.774Z`, comando `node scripts/check-headers.mjs https://practica-cicd-micela.web.app`, **exitCode 0**, `stderr` vacío y el siguiente `stdout` (solo se quitaron los códigos ANSI para lectura):

```text

▶ HTML: https://practica-cicd-micela.web.app/
  status 200
  ✔ content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'; img-src 'self' https://picsum.photos …
  ✔ strict-transport-security: max-age=31556926; includeSubDomains; preload
  ✔ x-content-type-options: nosniff
  ✔ x-frame-options: DENY
  ✔ referrer-policy: strict-origin-when-cross-origin
  ✔ permissions-policy: camera=(), microphone=(), geolocation=()
  · cache-control: no-cache

▶ Asset estático: /_next/static/chunks/1x6obpmlu1_c2.js
  ✔ cache-control: public, max-age=31536000, immutable

✅ Todos los controles pasaron.
```

La línea CSP termina en `…` porque **el script original la truncó**; esto no es la política completa observada. La salida muestra HTML 200, los seis headers que imprime (CSP y cinco básicos), `no-cache` en HTML y caché pública anual inmutable en JS. No equivale a medir una calificación del escáner ni a comprobar el footer.

## Comparación y pruebas pendientes

| Control | B1: base sin hardening | B5: después de los merges |
|---|---|---|
| Script público | [Captura manual](b1-manual-output.md): HTML 200, cinco controles básicos/CSP faltantes salvo HSTS; HTML y JS `max-age=3600`; seis controles pendientes. | Esta medición: exit 0, todos los controles pasaron, HTML `no-cache` y JS `public, max-age=31536000, immutable`. |
| SecurityHeaders | [Captura manual del reporte](b1-securityheaders-manual.md): **D**, 08 Nov 2026 16:23:08 UTC. El 403 automático es histórico de B1. | **UNKNOWN**: la nueva captura no muestra reporte, nota ni hora de SecurityHeaders. |
| Identidad visible | La [captura manual previa](manual-version-verification.md) corresponde a la base `bc9898b` en producción, antes de los merges. | [Captura manual B5](b5-manual-verification.md): URL `https://practica-cicd-micela.web.app`, footer `Versión c3051dc`, `Rama main`; línea parcialmente cortada abajo, SHA y rama legibles. El fetch separado de identidad dio `fetch failed` / `ETIMEDOUT`; `identity.verified=false` y `httpVerificationComplete=false` siguen siendo los valores de esa medición automática. |

El colector completo terminó **exit 2 por el fetch de identidad separado**, no porque fallara `check-headers.mjs` (exit 0, stderr vacío). `securityHeadersGrade=null`. No se repitieron solicitudes HTTP; el error de conexión no demuestra fallo del despliegue.

Para cerrar T15 falta **una prueba externa**: captura nueva del reporte de SecurityHeaders B5 para `https://practica-cicd-micela.web.app/` con URL, hora y calificación visibles. El footer live ya quedó confirmado manualmente; no se convirtió el fallo HTTP histórico en éxito. Hasta recibir el reporte no hay nota final. La usuaria confirmó manualmente filtro e imagen en el preview (L25); no fue interacción de navegador observada por el agente ni prueba interactiva de producción. Rollback no fue autorizado ni ejecutado.
