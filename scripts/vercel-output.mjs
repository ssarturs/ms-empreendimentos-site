import { contentPolicy } from "./security-policy.mjs";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const assetTypes = {
  html: "text/html; charset=utf-8", js: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8", json: "application/json; charset=utf-8",
  txt: "text/plain; charset=utf-8", svg: "image/svg+xml",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
  ico: "image/x-icon", woff: "font/woff", woff2: "font/woff2",
  glb: "model/gltf-binary",
};

export function makeVercelConfig(files, hashes) {
  for (const required of ["index.html", "404.html", "icon.svg"]) {
    if (!files.includes(required)) throw new Error(`Missing export: ${required}`);
  }
  const headers = {
    "Content-Security-Policy": contentPolicy(hashes, { header: true }),
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Strict-Transport-Security": "max-age=31536000",
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
  };
  const routes = [{ src: "^/.*$", headers, continue: true }];
  const overrides = {};
  const add = (path, dest, status) => routes.push({
    src: `^${escapeRegex(path)}$`, dest, methods: ["GET", "HEAD"],
    ...(status ? { status } : {}),
  });
  for (const file of [...files].sort()) {
    if (file.startsWith("/") || file.includes("\\") || /(^|\/)\.[^/]*(\/|$)/.test(file) ||
        /(^|\/)(?:node_modules|uploads?|documentos?|contratos?|clientes?|parceiros|admin|api)(\/|\.|$)/i.test(file)) {
      throw new Error(`Unsafe export path: ${file}`);
    }
    const contentType = assetTypes[file.split(".").at(-1)];
    if (!contentType) throw new Error(`Unapproved export type: ${file}`);
    overrides[file] = { contentType };
    add(`/${file}`, `/${file}`, file === "404.html" ? 404 : undefined);
    if (file.endsWith(".html") && file !== "404.html") {
      const path = file === "index.html" ? "/" : `/${file.slice(0, -5).replace(/\/index$/, "")}`;
      add(path, `/${file}`);
      if (path !== "/") add(`${path}/`, `/${file}`);
    }
  }
  add("/favicon.ico", "/icon.svg");
  // Explicit allowlist only: no filesystem phase may bypass the read-only routes.
  routes.push({ src: "^/.*$", methods: ["GET", "HEAD"], dest: "/404.html", status: 404 });
  routes.push({ src: "^/.*$", status: 405, headers: { Allow: "GET, HEAD" } });
  return { version: 3, routes, overrides };
}
