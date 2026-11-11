import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { hosting } = JSON.parse(readFileSync(new URL("../firebase.json", import.meta.url)));
const headersFor = (source) => Object.fromEntries(
  hosting.headers.find((rule) => rule.source === source)?.headers.map(({ key, value }) => [key, value]) ?? [],
);

test("se conservan el export estático y las URLs limpias originales", () => {
  assert.equal(hosting.public, "out");
  assert.equal(hosting.cleanUrls, true);
  assert.equal(hosting.trailingSlash, false);
  assert.deepEqual(hosting.ignore, ["firebase.json", "**/.*", "**/node_modules/**"]);
});

test("B2: los cinco headers básicos se aplican a todas las rutas", () => {
  const headers = headersFor("**");
  assert.equal(headers["Strict-Transport-Security"], "max-age=31536000");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.equal(headers["Permissions-Policy"], "camera=(), microphone=(), geolocation=()");
});

test("B3: CSP limita orígenes, permite hidratación y bloquea objetos e iframes", () => {
  const csp = headersFor("**")["Content-Security-Policy"] ?? "";
  const directives = Object.fromEntries(csp.split(";").filter((s) => s.trim()).map((s) => {
    const [key, ...values] = s.trim().split(/\s+/);
    return [key, values];
  }));
  assert.deepEqual(directives["default-src"], ["'self'"]);
  assert.deepEqual(directives["script-src"], ["'self'", "'unsafe-inline'"]);
  assert.deepEqual(directives["style-src"], ["'self'"]);
  assert.deepEqual(directives["img-src"], ["'self'", "https://picsum.photos", "https://fastly.picsum.photos"]);
  assert.deepEqual(directives["object-src"], ["'none'"]);
  assert.deepEqual(directives["base-uri"], ["'self'"]);
  assert.deepEqual(directives["frame-ancestors"], ["'none'"]);
  assert.deepEqual(directives["form-action"], ["'self'"]);
  assert.ok(!csp.includes("'unsafe-eval'"));
});

test("L6: connect-src permite únicamente Auth y SQL Connect con orígenes exactos", () => {
  const csp = headersFor("**")["Content-Security-Policy"];
  const connect = csp.split(";").find((s) => s.trim().startsWith("connect-src "))?.trim().split(/\s+/).slice(1);
  assert.deepEqual(connect, [
    "'self'",
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    "https://firebasedataconnect.googleapis.com",
  ]);
});

test("B4: HTML revalida y los assets versionados sobreescriben la regla general", () => {
  assert.equal(headersFor("**")["Cache-Control"], "no-cache");
  assert.equal(headersFor("/_next/static/**")["Cache-Control"], "public, max-age=31536000, immutable");
  assert.ok(hosting.headers.findIndex((r) => r.source === "**") <
    hosting.headers.findIndex((r) => r.source === "/_next/static/**"));
});
