import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { contentPolicy, inlineScriptHashes } from "./security-policy.mjs";

const files = await readdir("out", { recursive: true });
const textFiles = files.filter((f) => /\.(html|js|css|json|txt|svg)$/.test(f));
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/,
];
for (const f of files) {
  assert.ok(!/(^|\/)(?:\.env[^/]*|\.git|node_modules)(\/|$)/.test(f), `Private file in export: ${f}`);
  assert.ok(!f.endsWith(".map"), `Source map in export: ${f}`);
  assert.ok(!/(^|\/)(?:uploads?|documentos?|contratos?|clientes?|parceiros|admin|api)(\/|\.|$)/i.test(f), `Private portal content must never be statically exported: ${f}`);
}
let documentCount = 0;
for (const file of textFiles) {
  const text = await readFile(`out/${file}`, "utf8");
  assert.ok(!secretPatterns.some((pattern) => pattern.test(text)), `Possible secret in ${file}; value withheld`);
  if (!file.endsWith(".html")) continue;
  documentCount++;
  const expected = contentPolicy(inlineScriptHashes(text));
  assert.ok(text.includes(`<head><meta http-equiv="Content-Security-Policy" content="${expected}">`), `Missing early CSP: ${file}`);
  assert.ok(!/<[^>]+\son[a-z]+\s*=/i.test(text), `Inline event handler: ${file}`);
  for (const match of text.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) {
    assert.ok(/rel="[^"]*noopener/.test(match[0]) && /rel="[^"]*noreferrer/.test(match[0]), `Unsafe external link: ${file}`);
  }
}
// Heuristic checks; not a complete secret scanner or penetration test.
const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
for (const file of tracked.filter((f) => /\.(js|mjs|ts|json|jsonc|md|ya?ml)$/.test(f))) {
  const text = await readFile(file, "utf8");
  assert.ok(!secretPatterns.some((pattern) => pattern.test(text)), `Possible source secret in ${file}; value withheld`);
}
const headers = await readFile("out/_headers", "utf8");
assert.ok(headers.includes("X-Content-Type-Options: nosniff"));
assert.ok(headers.includes("Cache-Control: private, no-store"));
console.log(`PASS: ${documentCount} documents, ${textFiles.length} exported text assets; policy, links and basic secret checks.`);
