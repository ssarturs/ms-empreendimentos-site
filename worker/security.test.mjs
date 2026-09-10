import test from "node:test";
import assert from "node:assert/strict";
import { createSiteWorker } from "./security.mjs";

const origin = "https://ms-empreendimentos-socorro.arturzinzito.chatgpt.site";
const csp = "default-src 'self'; script-src 'self'; frame-ancestors 'self' https://chatgpt.com";
const worker = createSiteWorker({ origin, csp, routes: { "/": "/", "/icon.svg": "/icon.svg" } });
const env = { ASSETS: { fetch: async () => new Response("<html>MS</html>", {
  headers: { "Content-Type": "text/html", "X-Powered-By": "test", "Access-Control-Allow-Origin": "*" },
}) } };
const request = (path = "/", options) => new Request(origin + path, options);

function secureHeaders(response) {
  assert.equal(response.headers.get("Content-Security-Policy").replace(/ 'nonce-[^']+'/g, ""), csp);
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  assert.equal(response.headers.get("Referrer-Policy"), "no-referrer");
  assert.equal(response.headers.get("Strict-Transport-Security"), "max-age=31536000");
  assert.equal(response.headers.get("X-Powered-By"), null);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
}

test("serves the existing page and applies response protections", async () => {
  const response = await worker.fetch(request(), env);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /MS/);
  secureHeaders(response);
});

test("private paths, unknown files and forged roles never reach assets", async () => {
  const forbiddenEnv = { ASSETS: { fetch: () => { assert.fail("Assets must not be queried"); } } };
  for (const path of ["/admin", "/cliente", "/clientes", "/parceiros", "/api/clientes", "/.env", "/.git/config", "/uploads/contrato.pdf", "/_headers", "/toString", "/__proto__", "/%2eenv"]) {
    const response = await worker.fetch(request(path, { headers: { "X-Role": "admin" } }), forbiddenEnv);
    assert.equal(response.status, 404, path);
    secureHeaders(response);
  }
});

test("rejects write methods without reading or saving a body", async () => {
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
    const response = await worker.fetch(request("/", { method, body: "private test data" }), env);
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("Allow"), "GET, HEAD");
    assert.ok(!(await response.text()).includes("private test data"));
    secureHeaders(response);
  }
});

test("HEAD returns the same policy without a body", async () => {
  const response = await worker.fetch(request("/", { method: "HEAD" }), env);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "");
  secureHeaders(response);
});

test("HTTP redirects use the configured HTTPS origin, including // paths", async () => {
  for (const path of ["/", "//other.example/path", "/?x=1"]) {
    const response = await worker.fetch(new Request("http://untrusted.example" + path, {
      headers: { "X-Forwarded-Host": "other.example" },
    }), env);
    assert.equal(response.status, 308);
    assert.equal(new URL(response.headers.get("Location")).origin, origin);
    secureHeaders(response);
  }
});

test("does not forward query strings or caller credentials to assets", async () => {
  let seen;
  await worker.fetch(request("/?private=value", { headers: { Cookie: "secret", Authorization: "secret", "oai-authenticated-user-id": "forged" } }), {
    ASSETS: { fetch: async r => { seen = r; return new Response("ok"); } },
  });
  assert.equal(seen.url, origin + "/");
  assert.equal([...seen.headers].length, 0);
});

test("asset failures return a generic secured response and redact diagnostics", async t => {
  const log = t.mock.method(console, "error", () => {});
  const response = await worker.fetch(request(), { ASSETS: { fetch: () => { throw new Error("secret connection value"); } } });
  assert.equal(response.status, 503);
  assert.ok(!(await response.text()).includes("secret"));
  assert.deepEqual(log.mock.calls[0].arguments, [JSON.stringify({ event: "site_asset_error" })]);
  secureHeaders(response);
});

test("HTML gets a fresh header nonce compatible with CDN bot detection", async () => {
  const htmlEnv = { ASSETS: { fetch: async () => new Response('<html><head><meta http-equiv="Content-Security-Policy" content="old"></head><body>MS</body></html>', {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  }) } };
  const first = await worker.fetch(request(), htmlEnv);
  const second = await worker.fetch(request(), htmlEnv);
  const firstPolicy = first.headers.get("Content-Security-Policy");
  assert.match(firstPolicy, /'nonce-[A-Za-z0-9+/]{22}=='/);
  assert.notEqual(firstPolicy, second.headers.get("Content-Security-Policy"));
  assert.ok(!firstPolicy.includes("unsafe-inline"));
  assert.ok(!(await first.text()).includes("http-equiv"));
  secureHeaders(first);
  secureHeaders(second);
});

test("an isolated uploaded document retains its CSP, sandbox and exact bytes", async () => {
  const documentPath = "/modelos/planta-03-interativa.html";
  const policy = "default-src 'none'; script-src 'unsafe-inline'; frame-ancestors 'self'";
  const html = '<!doctype html>\r\n<meta http-equiv="Content-Security-Policy" content="default-src \'none\'">\r\n<iframe sandbox="allow-scripts"></iframe>';
  const isolatedWorker = createSiteWorker({ origin, csp,
    routes: { "/": "/", [documentPath]: documentPath },
    preservedDocumentPolicies: { [documentPath]: policy },
  });
  const isolatedEnv = { ASSETS: { fetch: async () => new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  }) } };
  for (const method of ["GET", "HEAD"]) {
    const response = await isolatedWorker.fetch(request(documentPath, { method }), isolatedEnv);
    assert.equal(response.headers.get("Content-Security-Policy"), policy);
    assert.equal(response.headers.get("Cache-Control"), "private, no-store, no-transform");
    assert.equal(await response.text(), method === "HEAD" ? "" : html);
  }
  secureHeaders(await isolatedWorker.fetch(request("/"), isolatedEnv));
  secureHeaders(await isolatedWorker.fetch(request(documentPath, { method: "POST" }), isolatedEnv));
  secureHeaders(await isolatedWorker.fetch(request(documentPath), {
    ASSETS: { fetch: async () => new Response("missing", { status: 404 }) },
  }));
});
