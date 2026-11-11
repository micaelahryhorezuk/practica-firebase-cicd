# SQL Connect · clase 2
Solución de clase 2 integrada con la clase 1; preparación local terminada.
Despliegue en practica-cicd-micela autorizado sin facturación/costos; consulta/push/PR de revisión en GitHub autorizados posteriormente. Merge y publicación live autorizados el 2026-11-11, condicionados a build y flujo de navegador aprobados; sin facturación ni borrado de recursos.

## Specs
S1. Usuario: «tengo que hacer Clase2_lunes_SQLConnect_Enunciado.pdf»; autorización: «prepara la solicion».
S2. L1: «clave primaria compuesta por alumno y curso, y un campo fecha que complete el servidor».
S3. L2: «Solo para usuarios autenticados.» «La operación no puede aceptar un id de alumno como variable.» «Debe ser idempotente: inscribirse dos veces no falla ni duplica.» L3: «devuelve únicamente las inscripciones del usuario que llama»; respuesta: «alumno { nombre matriculas { fecha curso { id titulo nivel horas } } }».
S4. L4: «Corregila con el nivel de acceso adecuado y justificá tu decisión.» L5: «Borra solo la inscripción del usuario que llama en ese curso.» Auditoría: «Salida de npm run atacar antes y después de corregir».
S5. L6: «Agregá a connect-src solo los orígenes necesarios.» «No uses comodines amplios como https://*.googleapis.com». L7: «El frontend se publica como en la clase 1: rama, Pull Request, preview, merge.» Preparación local completada; despliegue posterior limitado por S7.
S6. «Respondelas en REFLEXION.md (breves y concretas)»; seis preguntas en la sección 10 del PDF original. Conservar la reflexión de clase 1.

S7. Autorización de la usuaria: «ah perfecto, si autorizo», en respuesta a «¿Autorizas desplegarla en Firebase, proyecto practica-cicd-micela, sin activar facturación ni aceptar costos?». Comprobar plan/elegibilidad y migración antes de mutar producción; no aceptar una operación destructiva ni costos.

S8. Enunciado original: «PostgreSQL 17». El proveedor creó POSTGRES_18; la usuaria eligió «Mantener PostgreSQL 18 sin cambiar de plan», documentando esa diferencia sin recrear recursos.
S9. La usuaria eligió «Autorizar consulta, push y PR; sin merge» para github.com/micaelahryhorezuk/practica-firebase-cicd, usando sesión gh y lectura de /home/micaelahryhorezuk/.config/gh/hosts.yml y config.yml sin mostrar credenciales. Se publicarán solo ramas/PR de revisión, sin merge ni publicación live.

S10. Usuario: «haz lo que haga falta» y «si», en respuesta a «¿Autorizas usar tus sesiones configuradas de GitHub y Firebase para integrar los PR de clase 2 y publicar en practica-cicd-micela, únicamente después de corregir el build y verificar el flujo, sin activar facturación ni borrar recursos?»

S11. Alcance S10: corregir el fallo de inscripción reproducido en live: «violates SQL foreign key constraint: matricula_alumno_id_fkey». No cambiar permisos, esquema ni datos existentes.

## Tasks
T1 [done] S1: integrar material provisto conservando proyecto/workflows; inline; commits: fcc1b7e, eba6a50, ba9bc97, 8c78edc.
T2 [done] S2–S4: esquema y operaciones, RED/GREEN y auditoría local aislada; gentle-ai-worker (context backstop); Risk: item 2 (autorización); commits: fcc1b7e, a7f3bab.
T3 [done] S5–S6: CSP, reflexión y guía local; gentle-ai-worker (context backstop); Risk: item 2 (CSP); commit: 7207614.
T4 [done] S1–S6: 6 tests SQL, 11 tests estáticos/renderizado, tipos, build y verificación independiente aprobados; seis slices locales y cierre documental; commit: rama feat/clase2-sql-connect-06-csp-delivery.

T5 [done] S7: sesión y límite de costos comprobados; Spark sin facturación/cuenta de cobro, API SQL Connect sin uso/deshabilitada, instancia inexistente; inline y mapa de fuentes por explorador; commit: pendiente. La validación definitiva de prueba gratuita corresponde al servidor antes de provisionar.
T6 [done] S5/S7: configuración web por worker, deploy seguro por padre; RED de producción demo observado y corregido; 13 tests/tipos/build pasan; esquema/conector desplegados con exit0 bajo prueba gratuita. Risk: item 5 (entorno/despliegue); commit: rama feat/clase2-sql-connect-07-production.
T7 [done: navegador Chromium aprobado; limitación independiente conservada] S5/S7: backend/CI/HTTP comprobados; Auth configurado. Espera crear cuenta, inscribirse, ver Mis inscripciones y darse de baja en preview. Suite independiente aislada no reproducida, limitación declarada; CI sí ejecutó tipos/build. Sin merge/live; commit: rama feat/clase2-sql-connect-07-production.
T8 [done] S7: proveedor Habilitada en captura y SDK público HTTP200/proyecto390346504572 confirmados. Ocho PR actualizados con readback y heads/draft/tipo conservados. No se cambió proveedor/plan/código ni se probó registro real.
T9 [done] S5/S7/S9: issue5 aprobado y confirmado; tracker draft6 y siete hijos draft7..13 confirmados con readback de body, tipo único, bases y rutas de diff. Refs#5 no cerrante; sin merge/live.
T10 [done] S8: PostgreSQL18 de la prueba gratuita aceptado por la usuaria sin cambio de plan.
T11 [done] S5/S7/S9: ocho runs CI/preview success para SHA exactos, metadatos de ocho PR confirmados; HTTP/headers/CSP/caché/footer del preview integrado pasan para9234403. No se reiniciaron runs ni se probó navegador.

T12 [done] S5/S10: inline; confirmar build, navegador, integración encadenada y publicación live. Build exit0 fuera del sandbox; GitHub confirma ocho CI success. Sin cambios de código previstos.

T13 [done] S10/S11: inline; asegurar perfil propio antes de matrícula; regresión RED/GREEN, preview, verificador, PR y publicación. Risk: item4 (orden asíncrono de creación de perfil/matrícula).

## Log
L1. Solicitud original: «tengo que hacer Clase2_lunes_SQLConnect_Enunciado.pdf».
L2. Autorización: «prepara la solicion».
L3. Workspace padre sin Git; repositorio existente limpio: 09-practica-firebase-cicd, base 1e4f30e, remoto practica-firebase-cicd, proyecto practica-cicd-micela. Mantener workflows y proyecto.
L4. Memoria/Engram no disponible; el documento es el registro de continuidad. CLI gentle-ai no está en PATH; revisión nativa se evaluará mediante la herramienta, sin inventar resultados.
L5. Material provisto: clase-2-lunes-script-correjido.zip. Pronóstico: aproximadamente 250–350 líneas propias, más archivos de base importados de la cátedra; contar el diff real antes de los commits. Estrategia elegida por la usuaria: feature-branch-chain; ramas locales encadenadas. No autoriza push, PR, merge ni despliegue. Los datos de prueba deben permanecer en emuladores y proyecto demo local; nunca sembrar producción.
L6. La usuaria autorizó el repositorio anidado con «si» y eligió «Rama de seguimiento y PR encadenados (recomendado)». Se conservan seis ramas locales consecutivas: 01-backend → 02-audit → 03-auth → 04-enrollments → 05-catalog → 06-csp-delivery (prefijo feat/clase2-sql-connect-). Las cinco primeras unidades tienen menos de ~400 líneas de diff excluyendo lock y salidas generadas. La sexta registra 454 líneas con detección de copias (628 sin ella): incluye la reubicación byte-idéntica de las 220 líneas de reflexión histórica y el cierre documental, además de una directiva CSP; no contiene un cambio de código de ese tamaño. No se publicaron ramas ni PR.
L7. Se corrigió incompatibilidad del material: Firebase 13 exige Node24, mientras el proyecto/workflows usan Node22. SDK fijado en firebase@12.6.0; app/auth instalados admiten Node>=20. Compilación y pruebas pasan con Node22.19.0.
L8. Auditoría inicial: 1 vulnerabilidad y 2 controles pendientes; RED: 6 fallos. Auditoría corregida: todos los controles pasaron; GREEN: 6/6 en ~4.6s, con teardown público signOut/terminate/deleteApp. npm test: 11/11; typecheck y build export estático: exit0. Evidencia en docs/evidence/sql-connect/.
L9. Verificador independiente: S1–S6 cumplidas para preparación local, sin bloqueantes reproducidos. Comparó preservación de workflows, CSP anterior, reflexión de clase1 y renderizado del filtro; no se ejecutó navegador. Browser runner no disponible, y producción no autorizada.
L10. Evaluación nativa del candidato completo: nativeRisk medium, reviewDue false (under_budget); escalación item2 exigió verificador independiente, realizado. No se inició revisión nativa. Evaluación del primer commit no disponible por archivos de slices posteriores aún no rastreados; no se reintentó la misma evaluación. Los commits intermedios mantienen exactamente el código ya verificado.
L11. Evaluación nativa del slice final 8c78edc..7207614: nativeRisk medium, reviewDue false (under_budget); no corresponde START. Spot check final: npm test 11/11, typecheck exit0; diff de app/lib/dataconnect/scripts/tests/config contra el árbol probado es vacío. No se requiere otro verificador para este cierre documental.
L12. Preparación local terminada. Para entrega completa siguen pendientes configuración web real, habilitación de Auth, prueba manual en navegador, publicación de ramas/PR y L7; eran acciones externas no autorizadas durante la preparación.
L13. Nueva autorización literal: «ah perfecto, si autorizo», para desplegar Clase 2 en practica-cicd-micela sin activar facturación ni aceptar costos. No concede push/PR/merge ni operaciones destructivas.
L14. Consulta de documentación oficial: Spark permite una prueba de instancia de 90 días por proyecto durante toda su vida; no debe asociarse facturación. La elegibilidad real del proyecto sigue sin comprobarse. La sesión aislada .local-config no tiene cuenta autorizada. Se requiere permiso específico para utilizar/actualizar /home/micaelahryhorezuk/.config/configstore/firebase-tools.json, o un login nuevo dentro del proyecto. No se leyó ese archivo externo en esa comprobación. Después la usuaria seleccionó «Usar la sesión existente de Firebase CLI», autorizando el uso y actualización de ese archivo únicamente para el proyecto indicado, sin mostrar credenciales.

L15. App web creada: 1:390346504572:web:34ee489a5b23d65c7f8cf9. Solo se añadieron cuatro campos públicos de producción; desarrollo conserva exactamente su configuración demo. RED de producción demo confirmado; GREEN del padre 13/13, typecheck y build exit0.
L16. Deploy SQL Connect exit0, sin --force, sin --non-interactive ni respuestas automáticas. Proyecto comprobado sin facturación/cuenta de cobro inmediatamente antes. Servidor confirmó prueba gratuita; se creó catalogo/cursos y catalogo-fdc. Antes del seed, cursos/alumnos estaban vacíos; se cargó el fixture original (7 cursos,2 alumnos ficticios). Seis controles de la API real pasan sin emuladores, sin mutaciones anónimas efectivas.
L17. Postflight inicial: PENDING_CREATE, POSTGRES_18, etiqueta ft, billingEnabled=false, sin cuenta de cobro. Estado posterior RUNNABLE confirmado con la misma etiqueta y sin facturación. Archivos production-* en docs/evidence/sql-connect. Diferencia con PostgreSQL17 del PDF visible en S8; no se recreó la instancia.
L18. Verificador independiente de este slice: exports de desarrollo idénticos a HEAD y producción solo cambia cuatro campos autorizados; no encontró bloqueantes de implementación. Su npm test aislado tuvo 9 checks correctos y 3 archivos sin dependencias typescript/react; typecheck aislado exit127 por tsc ausente. Es prueba independiente de suite/tipos no disponible, no GREEN ni fallo del código. No se reintentó; parent 13/13, typecheck/build pasan. Probes de entornos ya quedan cubiertos por las dos reglas públicas retenidas, sin añadir casos ajenos.
L19. Authentication no inicializado (404 CONFIGURATION_NOT_FOUND). Frontend sin publicar, sin reads/push/PR/merge en GitHub. Se requiere acción de la usuaria en Console y autorización de publicación; no se considera terminada la entrega completa.

L20. Instancia RUNNABLE confirmada; sql:diff exit0, diffs vacíos, catálogo conserva los7IDs después de la provisión. Se registra production-instance-ready.json, production-sql-diff.txt y production-after-ready.json. Solo se quitó un espacio final del log copiado de deploy para git diff --check; el log crudo permanece en .local-cache. Fallo de formato corregido, sin alterar contenido semántico.

L21. Decisiones exactas del formulario: «Ya lo habilité» (Correo/Contraseña), «Mantener PostgreSQL 18 sin cambiar de plan», «Autorizar consulta, push y PR; sin merge». La API admin/v2 de Auth todavía devuelve404; su adecuación para Auth básico Spark está en diagnóstico, sin asumir que el reporte humano es incorrecto ni habilitar GCIP.
L22. GitHub autorizado: repositorio público micaelahryhorezuk/practica-firebase-cicd, default main, viewerPermission ADMIN. PR4 de finalización de clase1 ya está mergeado. Solo hay issue1 aprobado de clase1 y etiquetas status:approved/type:chore; comprobar alcance antes de usarlo en Clase2.

L23. Diagnóstico Auth acotado: GET público usado por SDK /v1/projects con clave del proyecto devuelve400 CONFIGURATION_NOT_FOUND, además del404 admin/v2. Esto no se corrige activando GCIP: pedir confirmar proyecto exacto/estado de Console o captura; no más reintentos sin cambio humano de estado.
L24. Main remota verificada en4b23c1bb87e2cd8b9e5e4742c0038a01e4b695ea; su árbol es idéntico a1e4f30e, de donde nacieron los slices. No hay contaminación de la diff inicial por la finalización de Clase1. Crear tracker draft desde main, con índice documental propio, y mantener hijos contra tracker/padre inmediato.
L25. Revisión nativa del commit02b18b2: review-e650361302f8255b, tres lentes, aprobada y reconocida; autoridad consumida según native-approved-acknowledgement-completed. R2-001 en config:12 es informativo y no abre corrección. La limpieza de la vista interna quedó diferida por candidate-view-git-failure; no se forzó Git ni se inició otra revisión. Esta aprobación no sustituye la suite independiente no reproducida ni autoriza merge/live.

L26. Issue1 leído completo: aprobación limitada a CI/CD/headers/Clase1, no SQL Connect/Clase2. No reutilizar su status:approved para un alcance distinto. PR nuevos requieren issue de Clase2; pedir autorización específica de creación, etiqueta protegida status:approved y etiqueta type:feature. Sesión GitHub tiene ADMIN, comprobado por API. Referencias propuestas no cerrantes Refs, no Closes.

L27. Push atómico exit0 a github.com/micaelahryhorezuk/practica-firebase-cicd: feat/clase2-sql-connect-review y siete ramas 01..07. Ninguna rama main modificada y ningún PR creado todavía. Tracker parte de main verificada y añade solo docs/CLASE2-CHAIN.md. Espera autorización de issue/etiqueta protegida para abrir PR con alcance aprobado de Clase2; se solicita además captura del proyecto/proveedor Auth por contradicción con la comprobación pública.

L28. Autorización literal de la usuaria: «Crear y aprobar el issue de Clase 2», para el target GitHub ya confirmado, status:approved y type:feature, referencias Refs sin cierre automático ni merge. Metadata GraphQL: isBlankIssuesEnabled=true, hasIssuesEnabled=true, ADMIN, sin formularios de issue/plantilla PR; búsqueda completa «SQL Connect» en títulos open/closed: cero duplicados. Por límite superior de workspace, BODY_FILE privado se materializa dentro de .local-cache ignorada (directorio700, archivo600), no fuera del proyecto; se limpia tras la operación.

L29. Issue5 creado una sola vez y confirmado mediante readback de título/body/labels: https://github.com/micaelahryhorezuk/practica-firebase-cicd/issues/5. status:approved aplicado por instrucción humana específica y actor ADMIN; type:feature creado y aplicado como único tipo. BODY_FILE/readback privados limpiados tras resultado confirmado. Referencias de todos los PR serán Refs#5, sin cierre automático.

L30. Confirmados mediante readback: tracker https://github.com/micaelahryhorezuk/practica-firebase-cicd/pull/6 (main), hijos7..13 contra tracker/padre inmediato. Todos draft/OPEN, autoMerge nulo y tipo único type:feature. Diagramas completados con IDs reales. Presupuestos GitHub:41/1125/337/239/178/187/630/353 líneas; excesos de7(lock generado) y12(copia histórica/documentos) declarados, sin excepción de política inventada. Último hijo SHA9234403571a63f521fbf0723ce013d0c484c6564. CI aún no confirmada en este registro.

L31. CI PR9 aprobada para SHA eba6a5008f23065c3def40717cfb1b90923a0214, run42933363041. Los demás runs siguen pendientes de sus eventos de finalización; no se infiere su estado ni se reinician. El preview de este hijo intermedio no es la aplicación integrada.

L32. CI PR11 aprobada para SHA8c78edccf208c0525f0781a93f087f2771c934ab, run42933420614. Se conserva evidencia de previews intermedios sin presentarlos como aplicación integrada.

L33. CI tracker PR6 aprobada para SHAbf1ff5e978ab2c5cffac612600405b2c636b393d, run42933311775. Tracker sigue draft/no-merge y su preview es solo la base documental, no la aplicación integrada.

L34. CI PR12 aprobada para SHAab9cccc34ea674275c31847ab8de5a4b74e77a3b, run42933464175. La prueba de CSP en navegador sigue sin ejecutarse; no se confunde con el resultado de build/preview.

L35. CI PR10 aprobada para SHAba9bc97aa7d5588d938848570b530444901eee55, run42933397760. No se declara comprobado el ciclo de efectos/cambio de cuenta en navegador.

L36. CI PR8 aprobada para SHAa7f3bab495f0444fe52963d4de6ead01f67d3462, run42933348943. Evidencia local de auditoría antes/después conservada; no se ejecutó atacar contra producción.

L37. CI PR7 aprobada para SHAfcc1b7e1069eb386744a42974fffb7617269c8a2/run42933329701, y PR13 para SHA9234403571a63f521fbf0723ce013d0c484c6564/run42933481239. Las ocho workflows de preview6..13 quedaron observadas success para sus SHA exactos. No ejecutan npm test: sí npm ci/typecheck/build/deploy. Preview integrado: https://practica-cicd-micela--pr13-feat-clase2-sql-conn-pigrmg72.web.app. No prueba interacción de navegador ni resuelve Auth.

L38. Ocho PR conservan draft/OPEN y mismo head; CI observada publicada en sus bodies y readback confirmado. HTTP del preview13 exit0: seis headers, caché del asset immutable, /cursos200, connect-src exacto y footer9234403/rama07. No hay prueba de registro ni de interacción de navegador.
L39. Se congela el candidato remoto9234403 para la revisión/manual pendiente. Notas/evidencias posteriores se guardan en commit documental local sin push por ahora; no cambian app/lib/dataconnect/scripts/tests/package/config/workflows. Auth aún requiere evidencia humana y la suite independiente limitada sigue declarada. Sin merge/live ni cierre del issue.

L40. Captura proporcionada por la usuaria y leída solo desde el archivo seleccionado: muestra el formulario Crear cuenta de la aplicación, no Firebase Console; Tu nombre está vacío y no se ve URL/ID de proyecto ni estado del proveedor. No acredita habilitación de Authentication. No se copió/publicó la imagen ni se registraron los datos personales visibles. T8 sigue bloqueada esperando configurar Correo/Contraseña en el proyecto exacto y evidencia del proveedor habilitado.

L41. Nueva captura seleccionada por la usuaria muestra la fila Correo electrónico/contraseña en estado Habilitada. Se leyó solo ese archivo y no se copió/publicó la imagen. Ante este cambio de evidencia se hizo una única consulta nueva al SDK público: HTTP200, projectId390346504572 y dominios de practica-cicd-micela. No devuelve flag email/password ni se usa como prueba de registro; el estado del proveedor se evidencia en la captura. No se modificó otro proveedor ni el plan. Próximo resultado requerido: prueba humana de cuenta/inscripción/baja en preview.

L42. Actualización de estado Auth en bodies PR6..13 confirmada mediante readback: cabezas, draft/OPEN y tipo único conservados. No se tocaron checkboxes de prueba manual ni se publicó la captura. T8 completada como configuración, no como prueba de registro. Continúa T7 con validación humana del flujo en preview; no hay nueva autorización de merge/live. Evidencia/notes locales, remoto9234403 congelado.

L43. 2026-11-11. Usuario: «haz lo que haga falta»; autorización final «si» al alcance S10. npm test 5 archivos aprobados, typecheck exit0. Build falló en sandbox por EPERM de subprocesos y stdout vacío; ejecución autorizada fuera del sandbox exit0 sin cambios de código. No es un defecto de tsconfig. Engram no disponible; mirror pendiente. Chromium instalado permite inspección CDP sin instalar dependencias.

L44. Chromium/CDP: diez comprobaciones aprobadas en preview9234403 (catálogo7, filtro2, registroA/B, inscripciónA, lista propia, salida oculta lista, B vacío, reingresoA, bajaA). Un primer intento de automatización no seleccionó la pestaña Ingresar; corregido el runner, no la app. Cuentas ficticias conservadas; una matrícula del intento incompleto permanece. Verificador independiente confirmó igualdad de runtime/config con9234403 y propagación segura13→12→…→7→6 por merge commits sin borrar ramas. Antes del merge6 se exige CI exacta y comparación de árbol; después, prueba live.

L45. Hijos13..7 integrados y confirmados MERGED, cada uno después de CI success para su cabeza propagada exacta. Tracker head fcc10e6; git diff --exit-code9234403 contra runtime/config/workflows devuelve0. Revisión independiente sin bloqueantes. Recurso404 identificado: /favicon.ico; sin fallos funcionales ni CSP en el flujo. No se cambió facturación, esquema ni recursos.

L46. PR6 MERGED1d46b45; deploy42958981054 success. Chromium live confirmó footer/catalogo/filtro/registro, pero inscripción falló por FK de alumno inexistente. No se cuenta como entrega terminada. Rama fix/clase2-registration-ready; se preserva esquema y autorización por token. Inicializar solo el perfil ausente mediante la operación UpsertAlumno existente antes de escribir matrícula; conservar perfiles existentes.

L47. RED observado por interfaz pública inscribirme: fallo FK para perfil ausente y escritura indebida tras fallo de perfil. GREEN4/4 focused; suite real fuera del sandbox16/16 (la salida de5 archivos en sandbox ocultaba los subtests); typecheck exit0 y build en verificación. Se reutiliza registrarAlumno y se preservan perfiles existentes; no cambios de GQL, reglas, dependencias ni migración.

L48. Build exit0. Verificador independiente PASS: perfil ausente espera upsert deliberadamente diferido, perfil existente conservado, fallo sin matrícula; baseline reproduce FK; seis diferenciales de listarCursos/misInscripciones/darmeDeBaja idénticos. Suite16/16 y focused4/4 en scratch. Spot check padre node probe.mjs exit0. Revisión nativa no disponible (gentle-ai ausente); no se inventa aprobación. Pendiente preview/live corregidos.

L49. PR14 MERGEDf8f910b (commits2870d60/f3d4e75); deploy42960034964 success. Suite final17/17, delayed probe conservado en tests. Preview corregido y live:12 comprobaciones cada uno, incluida inscripción inmediata y portada. Live solo favicon404 no bloqueante. T12/T13 cumplidas; cierre documental sin cambios runtime. Evidencia docs/evidence/sql-connect/live-browser.json. Datos ficticios conservados y límites declarados; no borrar recursos. Engram/CLI revisión nativa no disponibles; mirror pendiente, sin aprobación nativa inventada.
