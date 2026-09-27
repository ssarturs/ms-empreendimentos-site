import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { inlineScriptHashes } from "./security-policy.mjs";
import { visualizationPath, validateVisualization } from "./preserved-visualization.mjs";

const source = await readFile("dist/server/index.js", "utf8");
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
assert.equal(typeof worker.fetch, "function", "Missing ESM fetch handler");
const origin = "https://msempreendimentos.inf.br";
const files = (await readdir("out", { recursive: true })).map(f => f.replaceAll("\\", "/")).filter(f => /\.(html|js|css|json|txt|svg|jpe?g|png|glb)$/.test(f));
const mimeTypes = {
  html: "text/html; charset=utf-8", js: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8", json: "application/json; charset=utf-8",
  txt: "text/plain; charset=utf-8", svg: "image/svg+xml",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  ico: "image/x-icon", woff: "font/woff", woff2: "font/woff2",
  glb: "model/gltf-binary",
};
const env = {
  ASSETS: {
    async fetch(request) {
      const pathname = decodeURIComponent(new URL(request.url).pathname);
      try {
        const data = await readFile(`out${pathname}`);
        const type = mimeTypes[pathname.split(".").at(-1)];
        if (!type) throw new Error(`Unapproved asset format: ${pathname}`);
        return new Response(request.method === "HEAD" ? null : data, {
          headers: { "Content-Type": type },
        });
      } catch (error) {
        if (error.code === "ENOENT") return new Response(null, { status: 404 });
        throw error;
      }
    },
  },
};
for (const path of ["/", ...files.map(f => `/${f}`)]) {
  const response = await worker.fetch(new Request(origin + path), env);
  assert.equal(response.status, 200, `Build route failed: ${path}`);
  if (path === `/${visualizationPath}`) {
    const expected = await readFile(`public/${visualizationPath}`);
    const policy = validateVisualization(expected);
    assert.equal(response.headers.get("Content-Security-Policy"), policy);
    assert.equal(response.headers.get("Cache-Control"), "private, no-store, no-transform");
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), expected, "Visualization changed through ASSETS");
    const head = await worker.fetch(new Request(origin + path, { method: "HEAD" }), env);
    assert.equal(head.status, 200);
    assert.equal(head.headers.get("Content-Security-Policy"), policy);
    assert.equal(head.headers.get("Cache-Control"), "private, no-store, no-transform");
    assert.equal(await head.text(), "");
    continue;
  }
  assert.equal(response.headers.get("Cache-Control"), "public, max-age=3600");
  if (path.endsWith(".glb")) assert.equal(response.headers.get("Content-Type"), "model/gltf-binary");
  const bytes = Buffer.from(await response.arrayBuffer());
  let expected = await readFile(`out${path === "/" ? "/index.html" : path}`);
  if (path === "/" || path.endsWith(".html")) {
    expected = Buffer.from(expected.toString("utf8").replace(/<meta\b[^>]*http-equiv="Content-Security-Policy"[^>]*>/gi, ""));
    assert.match(response.headers.get("Content-Security-Policy"), /'nonce-[A-Za-z0-9+/]{22}=='/);
  }
  assert.deepEqual(bytes, expected, `Corrupt asset: ${path}`);
  if (path === "/" || path.endsWith(".html")) {
    const html = bytes.toString("utf8");
    for (const hash of inlineScriptHashes(html)) {
      assert.ok(response.headers.get("Content-Security-Policy").includes(hash), `Unapproved required script in ${path}`);
    }
  }
}
for (const path of ["/clientes", "/parceiros", "/admin", "/api/clientes", "/_headers", "/.openai/hosting.json", "/server/index.js"]) {
  assert.equal((await worker.fetch(new Request(origin + path), env)).status, 404, path);
}
for (const path of ["/quem-somos", "/quem-somos/"]) {
  const response = await worker.fetch(new Request(origin + path), env);
  assert.equal(response.status, 200, `Clean page route failed: ${path}`);
  assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
  const expected = (await readFile("out/quem-somos.html", "utf8")).replace(/<meta\b[^>]*http-equiv="Content-Security-Policy"[^>]*>/gi, "");
  assert.equal(await response.text(), expected, `Wrong page served at ${path}`);
}
console.log(`PASS: generated ESM Worker, ${files.length} assets, HTML script hashes and closed private routes.`);
