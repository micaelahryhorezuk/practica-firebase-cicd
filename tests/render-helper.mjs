import { readFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));

/** Compile a current repository component for isolated server-render tests. */
export function loadComponent(relativePath, mocks = {}) {
  const filename = resolve(root, relativePath);
  const inside = relative(root, filename);
  if (isAbsolute(relativePath) || inside.startsWith("..") || isAbsolute(inside) || inside.split(/[\\/]/).includes(".git")) {
    throw new Error("Component must be inside the current repository");
  }

  const source = readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const requireFromSource = createRequire(filename);
  const compiled = new Module(filename);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(dirname(filename));
  compiled.require = (id) => Object.hasOwn(mocks, id) ? mocks[id] : requireFromSource(id);
  compiled._compile(outputText, filename);
  return compiled.exports.default;
}
