const sitesOrigin = "https://ms-empreendimentos-socorro.arturzinzito.chatgpt.site";

export function resolveSiteOrigin(env = process.env) {
  const candidate = env.MS_SITE_ORIGIN ||
    (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined);
  if (!candidate) {
    if (env.MS_DEPLOY_TARGET === "vercel" || env.VERCEL === "1") {
      throw new Error("Vercel build needs MS_SITE_ORIGIN or VERCEL_URL; no Sites URL fallback is allowed.");
    }
    return sitesOrigin;
  }
  const url = new URL(candidate);
  if (url.protocol !== "https:" || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash) {
    throw new Error("MS_SITE_ORIGIN must be an HTTPS origin without credentials, path, query or fragment.");
  }
  return url.origin;
}
