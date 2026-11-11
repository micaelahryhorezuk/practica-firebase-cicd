import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { deleteApp, initializeApp } from "firebase/app";
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { connectDataConnectEmulator, executeMutation, executeQuery, getDataConnect, mutationRef, queryRef, terminate } from "firebase/data-connect";

const projectId = process.env.GCLOUD_PROJECT || "demo-catalogo";
const apps = [];
const cursoId = "0b7c1a2e-0001-4c3a-9d5e-000000000003";
const normalizar = (id) => id.replaceAll("-", "").toLowerCase();
const query = async (c, name) => (await executeQuery(queryRef(c.dc, name))).data;
const mutate = (c, name, variables) => executeMutation(mutationRef(c.dc, name, variables));
const inscripciones = async (c) => (await query(c, "MisInscripciones")).alumno.matriculas;

function cliente(name) {
  const app = initializeApp({ projectId, apiKey: "fake-api-key", appId: "1:1:web:test" }, name);
  const auth = getAuth(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  const dc = getDataConnect(app, { location: "us-east4", service: "catalogo", connector: "cursos" });
  connectDataConnectEmulator(dc, "127.0.0.1", 9399);
  apps.push({ app, auth, dc });
  return { auth, dc };
}

let anon, a, b;
before(async () => {
  anon = cliente("test-anon");
  a = cliente("test-a");
  b = cliente("test-b");
  const suffix = Date.now();
  for (const [c, name] of [[a, "A"], [b, "B"]]) {
    await createUserWithEmailAndPassword(c.auth, `test-${name}-${suffix}@example.test`, "test-password");
    await mutate(c, "UpsertAlumno", { nombre: name });
  }
});
after(async () => {
  await Promise.all(apps.map(async ({ app, auth, dc }) => {
    try {
      await signOut(auth);
    } finally {
      try {
        await terminate(dc);
      } finally {
        await deleteApp(app);
      }
    }
  }));
});

test("ListCursos y UpsertAlumno mantienen su contrato", async () => {
  const { cursos } = await query(anon, "ListCursos");
  assert.equal(cursos.length, 7);
  assert.deepEqual(Object.keys(cursos[0]).sort(), ["cupo", "descripcion", "horas", "id", "nivel", "titulo"]);
  assert.deepEqual(cursos.map((c) => c.titulo), cursos.map((c) => c.titulo).sort());
  assert.equal((await query(a, "MisInscripciones")).alumno.nombre, "A");
  await mutate(a, "UpsertAlumno", { nombre: "A actualizado" });
  assert.equal((await query(a, "MisInscripciones")).alumno.nombre, "A actualizado");
});

test("L1/L2: inscripción única, fecha del servidor e idempotencia", async () => {
  const inicio = Date.now();
  await mutate(a, "Inscribirme", { cursoId });
  const primera = await inscripciones(a);
  assert.equal(primera.length, 1);
  assert.equal(normalizar(primera[0].curso.id), normalizar(cursoId));
  assert.deepEqual(Object.keys(primera[0].curso).sort(), ["horas", "id", "nivel", "titulo"]);
  assert.ok(Date.parse(primera[0].fecha) >= inicio - 1000);
  assert.ok(Date.parse(primera[0].fecha) <= Date.now() + 1000);
  await mutate(a, "Inscribirme", { cursoId });
  assert.deepEqual(await inscripciones(a), primera);
});

test("L2/L3/L5: operaciones privadas rechazan llamadas sin login sin cambiar datos", async () => {
  const anterior = await inscripciones(a);
  for (const [name, call] of [
    ["Inscribirme", () => mutate(anon, "Inscribirme", { cursoId })],
    ["MisInscripciones", () => query(anon, "MisInscripciones")],
    ["DarmeDeBaja", () => mutate(anon, "DarmeDeBaja", { cursoId })],
  ]) {
    await assert.rejects(call, (e) => /unauthenticated|permission.denied|unauthorized/i.test(String(e)), name);
    assert.deepEqual(await inscripciones(a), anterior);
  }
});

test("L3: B solo puede leer sus propias inscripciones", async () => {
  assert.equal((await inscripciones(a)).length, 1);
  assert.deepEqual(await inscripciones(b), []);
  await mutate(b, "Inscribirme", { cursoId });
  assert.equal((await inscripciones(b)).length, 1);
  assert.equal((await query(b, "MisInscripciones")).alumno.nombre, "B");
});

test("L4: datos personales bloqueados también para un usuario autenticado", async () => {
  const anterior = await inscripciones(a);
  for (const c of [anon, a]) {
    await assert.rejects(() => query(c, "ListAlumnos"), /permission.denied|unauthorized|unauthenticated/i);
  }
  assert.deepEqual(await inscripciones(a), anterior);
});

test("L5: B elimina solo su matrícula y la de A permanece intacta", async () => {
  const anterior = await inscripciones(a);
  await mutate(b, "DarmeDeBaja", { cursoId });
  assert.deepEqual(await inscripciones(b), []);
  assert.deepEqual(await inscripciones(a), anterior);
  await mutate(a, "DarmeDeBaja", { cursoId });
  assert.deepEqual(await inscripciones(a), []);
});
