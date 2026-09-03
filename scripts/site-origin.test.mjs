import test from "node:test";
import assert from "node:assert/strict";
import { resolveSiteOrigin } from "../app/site-origin.mjs";

test("Sites default is unchanged; Vercel needs an explicit or assigned origin", () => {
  assert.equal(resolveSiteOrigin({}), "https://ms-empreendimentos-socorro.arturzinzito.chatgpt.site");
  assert.throws(() => resolveSiteOrigin({ MS_DEPLOY_TARGET: "vercel" }));
  assert.equal(resolveSiteOrigin({ VERCEL_URL: "ms-preview.example.com" }), "https://ms-preview.example.com");
  assert.equal(resolveSiteOrigin({ MS_SITE_ORIGIN: "https://ms.example.com/", VERCEL_URL: "ignored.example.com" }), "https://ms.example.com");
});
test("invalid origins fail closed", () => {
  for (const MS_SITE_ORIGIN of ["http://example.com", "https://user:pass@example.com", "https://example.com/path", "https://example.com/?a=b", "https://example.com/#x"]) {
    assert.throws(() => resolveSiteOrigin({ MS_SITE_ORIGIN }));
  }
});
