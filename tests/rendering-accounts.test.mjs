import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadComponent } from "./render-helper.mjs";

const previousResult = {
  uid: "A",
  error: null,
  items: [{ fecha: "2026-01-02T00:00:00.000Z", curso: { id: "curso-a", titulo: "PRIVATE A COURSE", nivel: "inicial", horas: 2 } }],
};

// These are initial server renders with a seeded hook value, not browser effect/lifecycle tests.
test("MisInscripciones: initial render hides A's seeded result for B, null and undefined", () => {
  let usuario = { uid: "A" };
  const Component = loadComponent("app/components/MisInscripciones.tsx", {
    react: { ...React, useState: () => [previousResult, () => {}] },
    "next/link": { __esModule: true, default: ({ children }) => React.createElement("a", { href: "/cursos" }, children) },
    "@/lib/useUsuario": { useUsuario: () => usuario },
    "@/lib/sqlconnect": {
      darmeDeBaja: () => { throw new Error("Unexpected mutation during render"); },
      misInscripciones: () => { throw new Error("Unexpected query during render"); },
      mensajeDeError: String,
    },
  });
  const render = () => renderToStaticMarkup(React.createElement(Component));

  const a = render();
  assert.match(a, /PRIVATE A COURSE/);
  assert.match(a, /Darme de baja/);

  for (const next of [{ uid: "B" }, null, undefined]) {
    usuario = next;
    const html = render();
    assert.doesNotMatch(html, /PRIVATE A COURSE/);
    assert.doesNotMatch(html, /Darme de baja/);
  }
});


for (const profileExists of [false, true]) {
  test(`Enrollment ensures own profile exists before writing (existing=${profileExists})`, async () => {
    const calls = [];
    let exists = profileExists;
    const enroll = loadComponent("lib/sqlconnect.ts", {
      "./firebase": { firebase: () => ({ dc: {}, auth: { currentUser: { displayName: "Student A", email: "student@example.com" } } }) },
      "firebase/data-connect": {
        queryRef: (_dc, name) => name,
        mutationRef: (_dc, name, variables) => ({ name, variables }),
        executeQuery: async () => ({ data: { alumno: exists ? { nombre: "Original name", matriculas: [] } : null } }),
        executeMutation: async ({ name, variables }) => {
          calls.push({ name, variables });
          if (name === "UpsertAlumno") exists = true;
          if (name === "Inscribirme" && !exists) throw new Error("foreign key constraint");
        },
      },
    }, "inscribirme");
    await enroll("course-a");
    assert.deepEqual(calls.map(call => call.name), profileExists ? ["Inscribirme"] : ["UpsertAlumno", "Inscribirme"]);
    assert.deepEqual(calls.at(-1).variables, { cursoId: "course-a" });
    if (!profileExists) assert.deepEqual(calls[0].variables, { nombre: "Student A" });
  });
}

test("Enrollment never writes a matricula when profile initialization fails", async () => {
  const calls = [];
  const enroll = loadComponent("lib/sqlconnect.ts", {
    "./firebase": { firebase: () => ({ dc: {}, auth: { currentUser: { displayName: "Student A" } } }) },
    "firebase/data-connect": {
      queryRef: () => ({}),
      mutationRef: (_dc, name) => name,
      executeQuery: async () => ({ data: { alumno: null } }),
      executeMutation: async name => { calls.push(name); throw new Error("profile unavailable"); },
    },
  }, "inscribirme");
  await assert.rejects(enroll("course-a"), /profile unavailable/);
  assert.deepEqual(calls, ["UpsertAlumno"]);
});
