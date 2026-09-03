import { createHash } from "node:crypto";

export const cspMetaPattern = /<meta\b[^>]*http-equiv="Content-Security-Policy"[^>]*>/gi;

export function inlineScriptHashes(html) {
  // This parser is deliberately scoped to Next's generated static HTML,
  // never to user-provided markup. Reject unsupported script tag shapes.
  const hashes = new Set();
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const [, attrs, body] = match;
    if (/\bsrc\s*=/i.test(attrs)) {
      const src = attrs.match(/\bsrc="([^"]+)"/i)?.[1];
      if (!src || !src.startsWith("/_next/") || src.includes("\\") || body.trim()) {
        throw new Error("Unexpected external script in static export");
      }
    } else {
      hashes.add(`'sha256-${createHash("sha256").update(body).digest("base64")}'`);
    }
  }
  return [...hashes].sort();
}

export function contentPolicy(hashes, { header = false } = {}) {
  return [
    "default-src 'self'",
    "base-uri 'none'",
    "object-src 'none'",
    `script-src 'self' ${hashes.join(" ")}`.trim(),
    "script-src-attr 'none'",
    // Framer Motion and Swiper require dynamic inline styles, not inline JS.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src 'self' https://www.google.com https://maps.google.com",
    "form-action 'none'",
    "media-src 'none'",
    "worker-src 'none'",
    ...(header ? ["frame-ancestors 'self' https://chatgpt.com"] : []),
    "upgrade-insecure-requests",
  ].join("; ");
}

export function hardenHtml(html) {
  const clean = html.replace(cspMetaPattern, "");
  if (!/<head>/i.test(clean)) throw new Error("Missing head in export");
  const policy = contentPolicy(inlineScriptHashes(clean));
  // Before any preload or script; an HTML meta cannot enforce frame-ancestors.
  return clean.replace(/<head>/i, `<head><meta http-equiv="Content-Security-Policy" content="${policy}">`);
}

export function headerRules(hashes) {
  const csp = contentPolicy(hashes, { header: true });
  if (csp.length > 1800) throw new Error("CSP exceeds conservative header line budget");
  return `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Strict-Transport-Security: max-age=31536000
  Cache-Control: private, no-store
  X-Robots-Tag: noindex, nofollow
`;
}
