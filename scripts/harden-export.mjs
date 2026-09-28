import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { hardenHtml, headerPolicy, headerRules, inlineScriptHashes } from "./security-policy.mjs";
import { visualizationPath, validateVisualization } from "./preserved-visualization.mjs";

const root = resolve("out");
const files = (await readdir(root, { recursive: true })).filter((file) => file.endsWith(".html")).sort();
if (!files.includes("index.html")) throw new Error("Static export missing");
const rules = [headerRules([])];
for (const file of files) {
  const path = resolve(root, file);
  const assetPath = file.replaceAll("\\", "/");
  const preserved = assetPath === visualizationPath;
  let policy;
  if (preserved) {
    policy = validateVisualization(await readFile(path));
  } else {
    const html = await readFile(path, "utf8");
    policy = headerPolicy(inlineScriptHashes(html));
    await writeFile(path, hardenHtml(html));
  }
  const paths = [`/${assetPath}`];
  if (assetPath !== "404.html") {
    const pageRoute = assetPath === "index.html" ? "/" : `/${assetPath.slice(0, -5).replace(/\/index$/, "")}`;
    paths.push(pageRoute);
    if (pageRoute !== "/") paths.push(`${pageRoute}/`);
  }
  for (const route of paths) {
    // Remove the wildcard CSP before setting this document's exact policy.
    rules.push(`${route}\n  ! Content-Security-Policy\n  Content-Security-Policy: ${policy}\n${preserved ? "  ! Cache-Control\n  Cache-Control: private, no-store, no-transform\n" : ""}`);
  }
}
// Cloudflare-compatible configuration. Live enforcement depends on Sites
// forwarding _headers; the per-document meta CSP remains the fallback.
await writeFile(resolve(root, "_headers"), rules.join("\n"));
console.log(`Security policy generated for ${files.length} HTML documents.`);
