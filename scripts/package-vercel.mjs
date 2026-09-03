import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { inlineScriptHashes } from "./security-policy.mjs";
import { makeVercelConfig } from "./vercel-output.mjs";

const entries = await readdir("out", { recursive: true, withFileTypes: true });
const files = [];
const hashes = new Set();
for (const entry of entries) {
  if (entry.isSymbolicLink()) throw new Error("Symlinks are not allowed in deployment output.");
  if (!entry.isFile()) continue;
  const file = join(entry.parentPath, entry.name).replace(/^out\//, "");
  if (file === "_headers") continue; // Cloudflare syntax is not used on Vercel.
  files.push(file);
  if (file.endsWith(".html")) {
    inlineScriptHashes(await readFile(join("out", file), "utf8")).forEach(hash => hashes.add(hash));
  }
}
const config = makeVercelConfig(files, [...hashes].sort());
// Only generated output is replaced; .vercel/project.json and local env files stay untouched.
await rm(".vercel/output", { recursive: true, force: true });
await mkdir(".vercel/output/static", { recursive: true });
for (const file of files) {
  const destination = join(".vercel/output/static", file);
  await mkdir(dirname(destination), { recursive: true });
  await cp(join("out", file), destination, { recursive: false });
}
await writeFile(".vercel/output/config.json", JSON.stringify(config, null, 2) + "\n");
console.log(`Prepared ${files.length} assets with Vercel-native security headers and read-only routes.`);
