#!/usr/bin/env node

import { deployFunction, deploySite, getOrCreateBucket } from "@remotion/lambda";
import { getLambdaConfig, writeDeploymentManifest } from "./lib/lambda-config.mjs";

const config = await getLambdaConfig();

console.log(`Using AWS region ${config.region}`);
console.log("Ensuring Remotion bucket exists...");
const bucket = await getOrCreateBucket({
  region: config.region,
  enableFolderExpiry: true,
  logLevel: "info",
});

console.log(`Bucket: ${bucket.bucketName}`);
console.log("Deploying Remotion site bundle...");
const site = await deploySite({
  entryPoint: config.entryPoint,
  bucketName: bucket.bucketName,
  region: config.region,
  siteName: config.siteName,
  options: {
    enableCaching: true,
    publicDir: null,
    rootDir: process.cwd(),
    ignoreRegisterRootWarning: true,
    keyboardShortcutsEnabled: false,
    askAIEnabled: false,
    experimentalClientSideRenderingEnabled: false,
    experimentalVisualModeEnabled: false,
    rspack: false,
  },
  indent: false,
});

console.log("Deploying / updating Lambda renderer...");
const fn = await deployFunction({
  region: config.region,
  timeoutInSeconds: config.functionOptions.timeoutInSeconds,
  memorySizeInMb: config.functionOptions.memorySizeInMb,
  diskSizeInMb: config.functionOptions.diskSizeInMb,
  createCloudWatchLogGroup: config.functionOptions.createCloudWatchLogGroup,
  cloudWatchLogRetentionPeriodInDays:
    config.functionOptions.cloudWatchLogRetentionPeriodInDays,
  enableLambdaInsights: config.functionOptions.enableLambdaInsights,
  logLevel: "info",
});

const manifest = {
  deployedAt: new Date().toISOString(),
  region: config.region,
  bucketName: bucket.bucketName,
  serveUrl: site.serveUrl,
  siteName: site.siteName,
  functionName: fn.functionName,
  functionAlreadyExisted: fn.alreadyExisted,
  renderDefaults: config.renderDefaults,
  functionOptions: config.functionOptions,
};

await writeDeploymentManifest(config.deploymentManifestPath, manifest);

console.log("");
console.log("Remotion Lambda deployment complete.");
console.log(`Function: ${manifest.functionName}`);
console.log(`Serve URL: ${manifest.serveUrl}`);
console.log(`Bucket: ${manifest.bucketName}`);
console.log(`Manifest: ${config.deploymentManifestPath}`);
