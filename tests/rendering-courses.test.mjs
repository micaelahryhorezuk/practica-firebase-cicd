import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadComponent } from "./render-helper.mjs";

const FiltroCursos = loadComponent("app/components/FiltroCursos.tsx");
const render = (props) => renderToStaticMarkup(React.createElement(FiltroCursos, props));
const curso = {
  id: "curso-demo",
  titulo: "Curso <seguro>",
  descripcion: "Descripción <sin HTML>",
  nivel: "inicial",
  horas: 2,
  cupo: 0,
};

test("FiltroCursos: initial render of empty list and one course, with optional action slot", () => {
  const empty = render({ cursos: [] });
  assert.match(empty, /0 de 0 cursos/);
  assert.doesNotMatch(empty, /card__accion/);

  const plain = render({ cursos: [curso] });
  assert.match(plain, /1 de 1 cursos/);
  assert.match(plain, /cupo 0/);
  assert.match(plain, /Curso &lt;seguro&gt;/);
  assert.match(plain, /Descripción &lt;sin HTML&gt;/);
  assert.doesNotMatch(plain, /<seguro>|<sin HTML>|card__accion/);

  const withAction = render({
    cursos: [curso],
    accion: (item) => React.createElement("button", { type: "button" }, `Inscribirme: ${item.id}`),
  });
  assert.match(withAction, /1 de 1 cursos/);
  assert.match(withAction, /cupo 0/);
  assert.match(withAction, /Curso &lt;seguro&gt;/);
  assert.match(withAction, /Descripción &lt;sin HTML&gt;/);
  assert.match(withAction, /class="card__accion"><button type="button">Inscribirme: curso-demo<\/button>/);
  assert.doesNotMatch(withAction, /<seguro>|<sin HTML>/);
});
