import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Module from "node:module";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const filename = fileURLToPath(new URL("../lib/firebase-config.ts", import.meta.url));
const source = readFileSync(filename, "utf8");
const { outputText } = ts.transpileModule(source, {
  fileName: filename,
  compilerOptions: { module: ts.ModuleKind.CommonJS },
});

function loadConfig(env) {
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = env;
    const compiled = new Module(filename);
    compiled.filename = filename;
    compiled._compile(outputText, filename);
    return compiled.exports;
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
}

const sqlConnectConfig = {
  location: "us-east4",
  service: "catalogo",
  connector: "cursos",
};

test("production exports the public web app config and unchanged SQL Connect target", () => {
  const config = loadConfig("production");
  assert.deepEqual(config.firebaseConfig, {
    apiKey: "AIzaSyAINAqTc-KQSdWicmuuOSVwIegK2vPsIO8",
    authDomain: "practica-cicd-micela.firebaseapp.com",
    projectId: "practica-cicd-micela",
    appId: "1:390346504572:web:34ee489a5b23d65c7f8cf9",
  });
  assert.deepEqual(config.sqlConnectConfig, sqlConnectConfig);
  assert.deepEqual(Object.keys(config).sort(), ["firebaseConfig", "sqlConnectConfig"]);
});

test("development retains the four-field demo config and unchanged SQL Connect target", () => {
  const config = loadConfig("development");
  assert.deepEqual(config.firebaseConfig, {
    apiKey: "REEMPLAZAR",
    authDomain: "demo-catalogo.firebaseapp.com",
    projectId: "demo-catalogo",
    appId: "REEMPLAZAR",
  });
  assert.deepEqual(config.sqlConnectConfig, sqlConnectConfig);
  assert.deepEqual(Object.keys(config).sort(), ["firebaseConfig", "sqlConnectConfig"]);
});
