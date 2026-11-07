import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const preview = read(".github/workflows/firebase-hosting-pull-request.yml");
const production = read(".github/workflows/firebase-hosting-merge.yml");

test("A1: preview responde a PR y producción solamente a push de main", () => {
  assert.match(preview, /on:\s*\n  pull_request:/);
  assert.doesNotMatch(preview, /^  pull_request_target:/m);
  assert.match(production, /on:\s*\n  push:\s*\n    branches: \[main\]/);
  for (const workflow of [preview, production]) {
    assert.match(workflow, /run: npm ci/);
    assert.match(workflow, /run: npm run typecheck/);
    assert.match(workflow, /run: npm run build/);
  }
});

test("A2: se compila el mismo commit y rama que indica el footer", () => {
  assert.match(preview, /ref: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/);
  assert.match(preview, /NEXT_PUBLIC_BUILD_SHA: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/);
  assert.match(preview, /NEXT_PUBLIC_BUILD_REF: \$\{\{ github\.head_ref \}\}/);
  assert.match(production, /NEXT_PUBLIC_BUILD_SHA: \$\{\{ github\.sha \}\}/);
  assert.match(production, /NEXT_PUBLIC_BUILD_REF: \$\{\{ github\.ref_name \}\}/);
});

test("A3: proyecto correcto, secreto referenciado, preview temporal y canal live", () => {
  const project = JSON.parse(read(".firebaserc")).projects.default;
  assert.equal(project, "practica-cicd-micela");
  for (const workflow of [preview, production]) {
    assert.match(workflow, /projectId: practica-cicd-micela/);
    assert.match(workflow, /firebaseServiceAccount: \$\{\{ secrets\.FIREBASE_SERVICE_ACCOUNT_PRACTICA_CICD_MICELA \}\}/);
  }
  assert.match(preview, /^          expires: 3d$/m);
  assert.match(preview, /repoToken: \$\{\{ secrets\.GITHUB_TOKEN \}\}/);
  assert.match(production, /^          channelId: live$/m);
});

test("el preview no intenta usar credenciales para código de forks", () => {
  assert.match(preview, /if: \$\{\{ github\.event\.pull_request\.head\.repo\.full_name == github\.repository \}\}/);
  for (const workflow of [preview, production]) {
    assert.match(workflow, /persist-credentials: false/);
    assert.match(workflow, /contents: read/);
  }
});
