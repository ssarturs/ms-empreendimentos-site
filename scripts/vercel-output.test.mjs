import test from "node:test";
import assert from "node:assert/strict";
import { makeVercelConfig } from "./vercel-output.mjs";

const files = ["index.html", "404.html", "icon.svg", "quem-somos.html", "_next/static/app.a.js", "modelos/planta-03.glb"];
const config = makeVercelConfig(files, ["'sha256-example'"]);
// This checks our routing configuration, not the hosted Vercel implementation.
function resolve(path, method = "GET") {
  const headers = {};
  for (const route of config.routes) {
    if (!new RegExp(route.src).test(path) || (route.methods && !route.methods.includes(method))) continue;
    Object.assign(headers, route.headers);
    if (!route.continue) return { ...route, headers };
  }
  throw new Error("Unmatched request");
}
test("generated routes serve pages, scripts and the 3D asset with exact matches", () => {
  for (const path of ["/", "/index.html", "/quem-somos", "/quem-somos/", "/quem-somos.html", "/_next/static/app.a.js", "/modelos/planta-03.glb", "/favicon.ico"]) {
    assert.ok(resolve(path).dest, path);
    assert.notEqual(resolve(path).status, 404, path);
    assert.equal(resolve(path, "HEAD").dest, resolve(path).dest);
  }
  assert.equal(resolve("/_next/static/appXaXjs").status, 404);
  assert.equal(config.overrides["modelos/planta-03.glb"].contentType, "model/gltf-binary");
});
test("unknown routes fail closed and every non-read method is rejected", () => {
  for (const path of ["/", "/quem-somos", "/_next/static/app.a.js", "/missing", "/.env", "/api/clientes"]) {
    for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS", "TRACE", "CONNECT", "CUSTOM"]) {
      assert.equal(resolve(path, method).status, 405);
      assert.equal(resolve(path, method).headers.Allow, "GET, HEAD");
    }
  }
  assert.equal(resolve("/missing").status, 404);
  assert.equal(resolve("/404.html").status, 404);
});
test("security headers apply to assets, errors and method rejections", () => {
  for (const [path, method] of [["/", "GET"], ["/icon.svg", "GET"], ["/missing", "GET"], ["/", "POST"]]) {
    const { headers } = resolve(path, method);
    assert.equal(headers["Cache-Control"], "private, no-store");
    assert.equal(headers["X-Robots-Tag"], "noindex, nofollow");
    assert.equal(headers["X-Content-Type-Options"], "nosniff");
    assert.ok(headers["Content-Security-Policy"].includes("'sha256-example'"));
    assert.ok(!headers["Content-Security-Policy"].includes("unsafe-eval"));
  }
  assert.ok(config.routes.every(route => !route.handle));
});
test("private files, unknown asset types and missing entrypoints cannot be packaged", () => {
  for (const file of [".env", "secret.map", "../secret.js", "clientes/one.json", "node_modules/a.js", "api/data.json"]) {
    assert.throws(() => makeVercelConfig([...files, file], []));
  }
  assert.throws(() => makeVercelConfig(["index.html"], []));
});
