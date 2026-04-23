#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const [, , payloadArg, outputArg = "out/social-ad.mp4", compositionArg = "SocialAd"] =
  process.argv;

if (!payloadArg) {
  console.error(
    "Usage: node scripts/render-social-ad.mjs <payload.json> [output.mp4] [compositionId]",
  );
  process.exit(1);
}

const payloadPath = resolve(process.cwd(), payloadArg);
const payload = JSON.parse(readFileSync(payloadPath, "utf8"));

const result = spawnSync(
  "npx",
  [
    "remotion",
    "render",
    "src/index.ts",
    compositionArg,
    outputArg,
    "--props",
    JSON.stringify(payload),
  ],
  {
    stdio: "inherit",
  },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
