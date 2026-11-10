# SQL Connect · clase 2
Preparar la solución local del enunciado, integrada con la clase 1.
Publicación, PR, merge y cambios en producción no autorizados.

## Specs
S1. Usuario: «tengo que hacer Clase2_lunes_SQLConnect_Enunciado.pdf»; autorización: «prepara la solicion».
S2. L1: «clave primaria compuesta por alumno y curso, y un campo fecha que complete el servidor».
S3. L2: «Solo para usuarios autenticados.» «La operación no puede aceptar un id de alumno como variable.» «Debe ser idempotente: inscribirse dos veces no falla ni duplica.» L3: «devuelve únicamente las inscripciones del usuario que llama»; respuesta: «alumno { nombre matriculas { fecha curso { id titulo nivel horas } } }».
S4. L4: «Corregila con el nivel de acceso adecuado y justificá tu decisión.» L5: «Borra solo la inscripción del usuario que llama en ese curso.» Auditoría: «Salida de npm run atacar antes y después de corregir».
S5. L6: «Agregá a connect-src solo los orígenes necesarios.» «No uses comodines amplios como https://*.googleapis.com». L7: «El frontend se publica como en la clase 1: rama, Pull Request, preview, merge.» Preparar instrucciones, sin ejecutar publicación.
S6. «Respondelas en REFLEXION.md (breves y concretas)»; seis preguntas en la sección 10 del PDF original. Conservar la reflexión de clase 1.

## Tasks
T1 [done] S1: integrar material provisto conservando proyecto/workflows; inline; commits: fcc1b7e, eba6a50, ba9bc97, 8c78edc.
T2 [done] S2–S4: esquema y operaciones, RED/GREEN y auditoría local aislada; gentle-ai-worker (context backstop); Risk: item 2 (autorización); commits: fcc1b7e, a7f3bab.
T3 [done] S5–S6: CSP, reflexión y guía local; gentle-ai-worker (context backstop); Risk: item 2 (CSP); commit: rama feat/clase2-sql-connect-06-csp-delivery.
T4 [in_progress] S1–S6: 6 tests SQL, 11 tests estáticos/renderizado, tipos, build y verificación independiente aprobados; cierre de ramas local en curso; commit: rama feat/clase2-sql-connect-06-csp-delivery.

## Log
L1. Solicitud original: «tengo que hacer Clase2_lunes_SQLConnect_Enunciado.pdf».
L2. Autorización: «prepara la solicion».
L3. Workspace padre sin Git; repositorio existente limpio: 09-practica-firebase-cicd, base 1e4f30e, remoto practica-firebase-cicd, proyecto practica-cicd-micela. Mantener workflows y proyecto.
L4. Memoria/Engram no disponible; el documento es el registro de continuidad. CLI gentle-ai no está en PATH; revisión nativa se evaluará mediante la herramienta, sin inventar resultados.
L5. Material provisto: clase-2-lunes-script-correjido.zip. Pronóstico: aproximadamente 250–350 líneas propias, más archivos de base importados de la cátedra; contar el diff real antes de los commits. Estrategia elegida por la usuaria: feature-branch-chain; ramas locales encadenadas. No autoriza push, PR, merge ni despliegue. Los datos de prueba deben permanecer en emuladores y proyecto demo local; nunca sembrar producción.
L6. La usuaria autorizó el repositorio anidado con «si» y eligió «Rama de seguimiento y PR encadenados (recomendado)». Se conservan seis ramas locales consecutivas: 01-backend → 02-audit → 03-auth → 04-enrollments → 05-catalog → 06-csp-delivery (prefijo feat/clase2-sql-connect-). Cada slice tiene menos de ~400 líneas propias, excluyendo lock y salidas generadas. No se publicaron ramas ni PR.
L7. Se corrigió incompatibilidad del material: Firebase 13 exige Node24, mientras el proyecto/workflows usan Node22. SDK fijado en firebase@12.6.0; app/auth instalados admiten Node>=20. Compilación y pruebas pasan con Node22.19.0.
L8. Auditoría inicial: 1 vulnerabilidad y 2 controles pendientes; RED: 6 fallos. Auditoría corregida: todos los controles pasaron; GREEN: 6/6 en ~4.6s, con teardown público signOut/terminate/deleteApp. npm test: 11/11; typecheck y build export estático: exit0. Evidencia en docs/evidence/sql-connect/.
L9. Verificador independiente: S1–S6 cumplidas para preparación local, sin bloqueantes reproducidos. Comparó preservación de workflows, CSP anterior, reflexión de clase1 y renderizado del filtro; no se ejecutó navegador. Browser runner no disponible, y producción no autorizada.
L10. Evaluación nativa del candidato completo: nativeRisk medium, reviewDue false (under_budget); escalación item2 exigió verificador independiente, realizado. No se inició revisión nativa. Evaluación del primer commit no disponible por archivos de slices posteriores aún no rastreados; no se reintentó la misma evaluación. Los commits intermedios mantienen exactamente el código ya verificado.
