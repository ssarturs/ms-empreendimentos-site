import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { contentPolicy, inlineScriptHashes } from "./security-policy.mjs";

// Sites serves matching static assets before calling the Worker. Embed this
// small institutional export so every response goes through the policy code.
// Next/OpenNext is used only at build time, never in the hosted runtime.
const files = await readdir("out", { recursive: true, withFileTypes: true });
const routes = { "/": "/", "/favicon.ico": "/icon.svg" };
const hashes = new Set();
const mimeTypes = {
  html: "text/html; charset=utf-8", js: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8", json: "application/json; charset=utf-8",
  txt: "text/plain; charset=utf-8", svg: "image/svg+xml",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  ico: "image/x-icon", woff: "font/woff", woff2: "font/woff2",
  glb: "model/gltf-binary",
};
for (const entry of files) {
  if (!entry.isFile()) continue;
  const assetPath = relative("out", join(entry.parentPath, entry.name)).split(sep).join("/");
  if (assetPath === "_headers") continue;
  const data = await readFile(join("out", assetPath));
  if (assetPath.endsWith(".html")) {
    inlineScriptHashes(data.toString("utf8")).forEach(hash => hashes.add(hash));
  }
  if (!mimeTypes[assetPath.split(".").at(-1)]) {
    throw new Error(`Unapproved asset format: ${assetPath}`);
  }
  routes[`/${assetPath}`] = `/${assetPath}`;
  if (assetPath.endsWith(".html") && assetPath !== "404.html") {
    const pageRoute = assetPath === "index.html" ? "/" : `/${assetPath.slice(0, -5).replace(/\/index$/, "")}`;
    routes[pageRoute] = `/${assetPath}`;
    if (pageRoute !== "/") routes[`${pageRoute}/`] = `/${assetPath}`;
  }
}
await rm("dist", { recursive: true, force: true });
await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await cp(".openai/hosting.json", "dist/.openai/hosting.json");
const runtime = await readFile("worker/security.mjs", "utf8");
const config = {
  routes,
  csp: contentPolicy([...hashes].sort(), { header: true }),
  origin: "https://ms-empreendimentos-socorro.arturzinzito.chatgpt.site",
};
const workerEntry = `
const securedWorker = createSiteWorker(${JSON.stringify(config)});
export default {
  fetch(request, env) {
    return securedWorker.fetch(request, env);
  },
};
`;
const workerSource = `${runtime}\n${workerEntry}`;
await writeFile("dist/server/index.js", workerSource);
console.log(`Sites ESM Worker prepared with ${Object.keys(routes).length} protected routes.`);
