import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { contentPolicy, hardenHtml, headerRules, inlineScriptHashes } from "./security-policy.mjs";

const body = "self.__next_f.push([0]);";
const html = `<html><head><script src="/_next/static/a.js"></script></head><body><script>${body}</script></body></html>`;

test("CSP hashes exact inline bytes", () => {
  assert.deepEqual(inlineScriptHashes(html), [`'sha256-${createHash("sha256").update(body).digest("base64")}'`]);
  assert.notDeepEqual(inlineScriptHashes(html), inlineScriptHashes(html.replace(body, body + " ")));
});
test("policy precedes scripts and hardening is idempotent", () => {
  const secured = hardenHtml(html);
  assert.ok(secured.indexOf('http-equiv="Content-Security-Policy"') < secured.indexOf("<script"));
  assert.equal(hardenHtml(secured), secured);
});
test("no arbitrary inline JavaScript or event handlers", () => {
  const policy = contentPolicy(inlineScriptHashes(html));
  assert.ok(!policy.match(/script-src [^;]+/)[0].includes("unsafe-inline"));
  assert.ok(!policy.includes("unsafe-eval"));
  assert.ok(policy.includes("script-src-attr 'none'"));
  assert.ok(policy.includes("form-action 'none'"));
});
test("unapproved script origins fail the build", () => {
  assert.throws(() => inlineScriptHashes(html.replace("/_next/static/a.js", "https://untrusted.example/x.js")));
});
test("anti-framing directive is header-only; allowed parent preserves ChatGPT", () => {
  assert.ok(!contentPolicy([]).includes("frame-ancestors"));
  assert.ok(headerRules([]).includes("frame-ancestors 'self' https://chatgpt.com"));
});
test("missing export head fails closed", () => {
  assert.throws(() => hardenHtml("<body>invalid</body>"));
});
