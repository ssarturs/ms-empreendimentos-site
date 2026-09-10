import assert from "node:assert/strict";
import { createHash } from "node:crypto";

// The uploaded document is data. Never rewrite or evaluate its content.
// Pin its bytes so the original sandbox and both CSP policies stay intact.
export const visualizationPath = "modelos/planta-03-interativa.html";
export const visualizationSha256 = "a92bcecf5e9a0060eb8d0fcbc387d8cddd7dc0d5666004d69fabf579b7acb62b";

export function validateVisualization(bytes) {
  assert.equal(createHash("sha256").update(bytes).digest("hex"), visualizationSha256,
    "The supplied visualization must remain byte-for-byte unchanged");
  const html = bytes.toString("utf8");
  assert.match(html, /<iframe\b[^>]*sandbox="allow-scripts"/);
  const policy = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/i)?.[1];
  assert.ok(policy, "The original visualization CSP is required");
  return `${policy}; frame-ancestors 'self' https://chatgpt.com`;
}
