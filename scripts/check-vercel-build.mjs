import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { inlineScriptHashes } from "./security-policy.mjs";
import { makeVercelConfig } from "./vercel-output.mjs";
import { resolveSiteOrigin } from "../app/site-origin.mjs";

const root = ".vercel/output/static";
const entries = await readdir(root, { recursive: true, withFileTypes: true });
const files = entries.filter(e => e.isFile()).map(e => join(e.parentPath, e.name).slice(root.length + 1)).sort();
const sourceEntries = await readdir("out", { recursive: true, withFileTypes: true });
const sourceFiles = sourceEntries.filter(e => e.isFile())
  .map(e => join(e.parentPath, e.name).replace(/^out\//, ""))
  .filter(file => file !== "_headers").sort();
assert.deepEqual(files, sourceFiles, "Every exported asset must be preserved, with no extra files");
const hashes = new Set();
for (const file of files) {
  const source = await readFile(join("out", file));
  const output = await readFile(join(root, file));
  const digest = bytes => createHash("sha256").update(bytes).digest("hex");
  assert.equal(digest(source), digest(output), `Changed asset: ${file}`);
  if (file.endsWith(".html")) inlineScriptHashes(output.toString("utf8")).forEach(hash => hashes.add(hash));
}
const config = JSON.parse(await readFile(".vercel/output/config.json", "utf8"));
assert.deepEqual(config, makeVercelConfig(files, [...hashes].sort()));
const html = await readFile(join(root, "index.html"), "utf8");
const origin = resolveSiteOrigin();
assert.ok(html.includes(`${origin}/og.png`), "Social metadata must use the selected destination");
assert.ok(!files.includes("_headers"));
assert.ok(files.includes("quem-somos.html"));
assert.ok(files.includes("modelos/planta-03.glb"));
console.log(`PASS: ${files.length} Vercel assets match the validated export; routes, headers, 3D model and destination metadata checked.`);
