# B5 · producción tras integrar los dos PR

**B5 completada con evidencia automática y manual separada:** el script público pasó los controles de headers y caché en live. Las [capturas manuales B5](b5-manual-verification.md) confirman el footer `c3051dc`/`main` y un reporte SecurityHeaders **A** para `https://practica-cicd-micela.web.app/` a 09 Nov 2026 00:04:18 UTC. El fetch automático de identidad sigue fallido y el JSON conserva nota nula. También se probaron el filtro y la imagen en producción y se hizo rollback/restauración de `live`, sin alterar el JSON automático.

| Etapa | Evidencia observada |
|---|---|
| PR [#2](https://github.com/micaelahryhorezuk/practica-firebase-cicd/pull/2) | Merge normal a `main`, head fijado `3f6b763fa7d92d94823bd2be41fded8cc8825fe3`, merge `88e0938ab783d90d28820274fe7f88cefa886da5`; [run 42534289830](https://github.com/micaelahryhorezuk/practica-firebase-cicd/actions/runs/42534289830) SUCCESS, incluido `Deploy al canal live`. |
| PR [#3](https://github.com/micaelahryhorezuk/practica-firebase-cicd/pull/3) | Retarget a `main`, 14 archivos de evidencia/formato, JSON Firebase semánticamente idéntico; merge normal con head fijado `b15f7a3`, merge `c3051dc842a6de6fc15471cab8e8049c8cec5ce7` y árbol igual al head aprobado; [run 42534675406](https://github.com/micaelahryhorezuk/practica-firebase-cicd/actions/runs/42534675406) SUCCESS, incluido `Deploy al canal live`. |

Ambos merges siguieron el orden autorizado en S9, sin bypass, squash ni borrado de ramas; el rollback documentado abajo ocurrió después. El commit `c3051dc842a6de6fc15471cab8e8049c8cec5ce7` era el **objetivo esperado** del despliegue/CI; el SHA corto y la rama se leen por separado en la captura manual, no en el fetch HTTP fallido.

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

## Comparación y límites de las pruebas

| Control | B1: base sin hardening | B5: después de los merges |
|---|---|---|
| Script público | [Captura manual](b1-manual-output.md): HTML 200, cinco controles básicos/CSP faltantes salvo HSTS; HTML y JS `max-age=3600`; seis controles pendientes. | Esta medición: exit 0, todos los controles pasaron, HTML `no-cache` y JS `public, max-age=31536000, immutable`. |
| SecurityHeaders | [Captura manual del reporte](b1-securityheaders-manual.md): **D**, 08 Nov 2026 16:23:08 UTC. El 403 automático es histórico de B1. | [Reporte manual B5](b5-manual-verification.md) ([imagen original](Captura%20de%20pantalla%202026-11-08%20210426.png)): **A**, `https://practica-cicd-micela.web.app/`, 09 Nov 2026 00:04:18 UTC. Indicadores verdes de CSP y los cinco headers básicos; aviso de nota limitada a A, advertencias no visibles. No es una calificación automática. |
| Identidad visible | La [captura manual previa](manual-version-verification.md) corresponde a la base `bc9898b` en producción, antes de los merges. | [Captura manual B5](b5-manual-verification.md): URL `https://practica-cicd-micela.web.app`, footer `Versión c3051dc`, `Rama main`; línea parcialmente cortada abajo, SHA y rama legibles. El fetch separado de identidad dio `fetch failed` / `ETIMEDOUT`; `identity.verified=false` y `httpVerificationComplete=false` siguen siendo los valores de esa medición automática. |
| Funcionamiento | No aplicaba antes del hardening. | [Prueba interactiva B5](b5-manual-verification.md), 09 Nov 2026 02:28 UTC, después de restaurar live: filtro `intermedio` muestra 2 de 6 cursos; imagen de portada cargada a 960×320. |
| Rollback | La base `bc9898b` es la versión anterior sin hardening. | Release `1794191173659000` revirtió `live` a `256fe433460fdb36` (`bc9898b`); HTTP confirmó status 200 y headers base. Release `1794191223360000` restauró `8accd40869561b02` (`c3051dc`/`main`), que es la versión live actual. |

El colector completo terminó **exit 2 por el fetch de identidad separado**, no porque fallara `check-headers.mjs` (exit 0, stderr vacío). `securityHeadersGrade=null`. No se repitieron solicitudes HTTP; el error de conexión no demuestra fallo del despliegue.

El script B5 salió 0 y las pruebas manuales confirman el footer live, el reporte nuevo con URL/hora/calificación visibles y el funcionamiento del filtro y la imagen. La comparación manual es **D → A**; no se convirtió el fallo HTTP histórico en éxito. `securityHeadersGrade=null` permanece en el JSON del colector y el reporte manual A no prueba el detalle de CSP. Tras la prueba de rollback, el canal `live` quedó restaurado a la versión endurecida.

Después de restaurar, la consulta del canal confirmó la versión `8accd40869561b02`; una
petición HTTP devolvió 200, el footer esperado `c3051dc`, CSP y `Cache-Control: no-cache`.
Un reintento de `check-headers.mjs` tuvo `ETIMEDOUT` antes de imprimir controles; no se cuenta
como resultado B5 nuevo. El estado funcional sí se volvió a comprobar en navegador.
