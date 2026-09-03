import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { hardenHtml, headerRules, inlineScriptHashes } from "./security-policy.mjs";

const root = resolve("out");
const files = (await readdir(root, { recursive: true })).filter((file) => file.endsWith(".html"));
if (!files.includes("index.html")) throw new Error("Static export missing");
const hashes = new Set();
for (const file of files) {
  const path = resolve(root, file);
  const html = await readFile(path, "utf8");
  inlineScriptHashes(html).forEach((hash) => hashes.add(hash));
  await writeFile(path, hardenHtml(html));
}
// Cloudflare-compatible configuration. Live enforcement depends on Sites
// forwarding _headers; the per-document meta CSP remains the fallback.
await writeFile(resolve(root, "_headers"), headerRules([...hashes].sort()));
console.log(`Security policy generated for ${files.length} HTML documents.`);
