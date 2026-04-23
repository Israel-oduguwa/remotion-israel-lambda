#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { renderMediaOnLambda } from "@remotion/lambda/client";
import { normalizeExcelCnaEditorProps } from "./lib/excelcna-editor-props.mjs";
import {
  getLambdaConfig,
  getMergedRenderDefaults,
  readDeploymentManifest,
} from "./lib/lambda-config.mjs";

const [, , payloadArg, manifestArg] = process.argv;

if (!payloadArg) {
  console.error(
    "Usage: node scripts/render-on-lambda.mjs <payload.json> [deployment-manifest.json]",
  );
  process.exit(1);
}

const payloadPath = resolve(process.cwd(), payloadArg);
const payload = JSON.parse(await readFile(payloadPath, "utf8"));
const props = normalizeExcelCnaEditorProps(payload);
const config = await getLambdaConfig({
  deploymentManifestPath: manifestArg
    ? resolve(process.cwd(), manifestArg)
    : undefined,
});
const manifest = await readDeploymentManifest(config.deploymentManifestPath);
const renderDefaults = getMergedRenderDefaults(manifest, config);

const render = await renderMediaOnLambda({
  region: manifest.region,
  functionName: manifest.functionName,
  serveUrl: manifest.serveUrl,
  composition: "ExcelCNAEditor",
  inputProps: props,
  ...renderDefaults,
  outName: {
    key: `${
      payload.slug || `${props.adId}-${Date.now().toString(36)}`
    }.mp4`,
  },
  logLevel: "info",
});

console.log(JSON.stringify(render, null, 2));
