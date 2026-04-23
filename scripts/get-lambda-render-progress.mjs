#!/usr/bin/env node

import { getRenderProgress } from "@remotion/lambda/client";
import { resolve } from "node:path";
import { getLambdaConfig, readDeploymentManifest } from "./lib/lambda-config.mjs";

const [, , renderId, bucketNameArg, functionNameArg, manifestArg] = process.argv;

if (!renderId) {
  console.error(
    "Usage: node scripts/get-lambda-render-progress.mjs <renderId> [bucketName] [functionName] [deployment-manifest.json]",
  );
  process.exit(1);
}

const config = await getLambdaConfig({
  deploymentManifestPath: manifestArg
    ? resolve(process.cwd(), manifestArg)
    : undefined,
});
const manifest = await readDeploymentManifest(config.deploymentManifestPath);

const progress = await getRenderProgress({
  renderId,
  bucketName: bucketNameArg || manifest.bucketName,
  functionName: functionNameArg || manifest.functionName,
  region: manifest.region,
  logLevel: "info",
});

console.log(JSON.stringify(progress, null, 2));
