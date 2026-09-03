import { rm } from "node:fs/promises";

// Never republish obsolete JS/manifests left by an older framework build.
for (const directory of [".next", "out", "dist"]) {
  await rm(directory, { recursive: true, force: true });
}
