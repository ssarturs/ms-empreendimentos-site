import { execFileSync } from "node:child_process";
import { resolveSiteOrigin } from "../app/site-origin.mjs";

const env = { ...process.env, MS_DEPLOY_TARGET: "vercel" };
resolveSiteOrigin(env); // Reject a missing/invalid destination before building.
const node = (args) => execFileSync(process.execPath, args, { stdio: "inherit", env });
node(["scripts/clean-build.mjs"]);
node(["node_modules/next/dist/bin/next", "build"]);
node(["scripts/harden-export.mjs"]);
node(["--test", "scripts/security-policy.test.mjs", "worker/security.test.mjs", "scripts/vercel-output.test.mjs", "scripts/site-origin.test.mjs"]);
node(["scripts/check-security.mjs"]);
node(["scripts/package-vercel.mjs"]);
node(["scripts/check-vercel-build.mjs"]);
console.log("Vercel output prepared locally. Nothing was deployed; account ownership and Deployment Protection still require verification.");
