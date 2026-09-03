// Sites owns the private access gate. No identity or role is accepted from
// browser input. Client/partner APIs need separate server authorization
// before those currently nonexistent routes can be enabled.
export function createSiteWorker({ routes, csp, origin }) {
  const notFound = () => new Response("Página não encontrada", {
    status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" },
  });

  async function secure(response, method) {
    const headers = new Headers(response.headers);
    let body = method === "HEAD" ? null : response.body;
    let policy = csp;
    if (headers.get("Content-Type")?.startsWith("text/html") && method !== "HEAD") {
      // Cloudflare parses a response-header nonce to authorize its own injected
      // bot-detection script. Never permit arbitrary inline JS for compatibility.
      const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
      policy = csp.replace(/script-src ([^;]*)/, `$& 'nonce-${nonce}'`);
      // The actual HTTP policy now owns enforcement. A static meta policy would
      // reject the CDN's per-response nonce even when the header authorizes it.
      body = (await response.text()).replace(/<meta\b[^>]*http-equiv="Content-Security-Policy"[^>]*>/gi, "");
      headers.delete("Content-Length");
    }
    headers.set("Content-Security-Policy", policy);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "no-referrer");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
    headers.set("Strict-Transport-Security", "max-age=31536000");
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Robots-Tag", "noindex, nofollow");
    headers.delete("X-Powered-By");
    headers.delete("Access-Control-Allow-Origin");
    return new Response(body, {
      status: response.status, statusText: response.statusText, headers,
    });
  }

  return {
    async fetch(request, env) {
      let response;
      try {
        const url = new URL(request.url);
        if (url.protocol !== "https:") {
          const redirect = new URL(origin);
          redirect.pathname = url.pathname;
          redirect.search = url.search;
          response = new Response(null, { status: 308, headers: { Location: redirect.href } });
        } else if (request.method !== "GET" && request.method !== "HEAD") {
          // The institutional site has no write API; never silently accept data.
          response = new Response("Método não permitido", {
            status: 405, headers: { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" },
          });
        } else if (!Object.hasOwn(routes, url.pathname)) {
          response = notFound();
        } else {
          const assetUrl = new URL(routes[url.pathname], origin);
          // Do not forward credentials, cookies, query or identity headers.
          response = await env.ASSETS.fetch(new Request(assetUrl, { method: request.method }));
          if (response.status === 404) response = notFound();
        }
      } catch {
        // Diagnostic code only: no personal data, tokens, cookies or stack trace.
        console.error(JSON.stringify({ event: "site_asset_error" }));
        response = new Response("Não foi possível carregar a página. Tente novamente.", {
          status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
      return secure(response, request.method);
    },
  };
}
