import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { clean, slugify, toNumber } from "./excelcna-editor-props.mjs";

export const DEFAULT_AWS_REGION = process.env.AWS_REGION || "us-east-1";
export const DEFAULT_DEPLOYMENT_MANIFEST = resolve(
  process.cwd(),
  "deployment/remotion-lambda.json",
);

const toBoolean = (value, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
};

export const getLambdaConfig = async (overrides = {}) => {
  const packageJsonPath = resolve(process.cwd(), "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  const packageName = slugify(packageJson.name || "remotion");

  return {
    region: overrides.region || process.env.REMOTION_AWS_REGION || process.env.AWS_REGION || DEFAULT_AWS_REGION,
    entryPoint: overrides.entryPoint || resolve(process.cwd(), "src/index.ts"),
    siteName:
      overrides.siteName ||
      process.env.REMOTION_SITE_NAME ||
      `${packageName}-site`,
    deploymentManifestPath:
      overrides.deploymentManifestPath ||
      process.env.REMOTION_DEPLOYMENT_MANIFEST ||
      DEFAULT_DEPLOYMENT_MANIFEST,
    functionOptions: {
      timeoutInSeconds: toNumber(
        overrides.timeoutInSeconds ?? process.env.REMOTION_FUNCTION_TIMEOUT_SEC,
        240,
      ),
      memorySizeInMb: toNumber(
        overrides.memorySizeInMb ?? process.env.REMOTION_FUNCTION_MEMORY_MB,
        3008,
      ),
      diskSizeInMb: toNumber(
        overrides.diskSizeInMb ?? process.env.REMOTION_FUNCTION_DISK_MB,
        4096,
      ),
      createCloudWatchLogGroup: toBoolean(
        overrides.createCloudWatchLogGroup ??
          process.env.REMOTION_CREATE_CLOUDWATCH_LOG_GROUP,
        true,
      ),
      cloudWatchLogRetentionPeriodInDays: toNumber(
        overrides.cloudWatchLogRetentionPeriodInDays ??
          process.env.REMOTION_CLOUDWATCH_RETENTION_DAYS,
        14,
      ),
      enableLambdaInsights: toBoolean(
        overrides.enableLambdaInsights ?? process.env.REMOTION_ENABLE_LAMBDA_INSIGHTS,
        false,
      ),
    },
    renderDefaults: {
      codec: overrides.codec || process.env.REMOTION_RENDER_CODEC || "h264",
      crf: toNumber(overrides.crf ?? process.env.REMOTION_RENDER_CRF, 18),
      jpegQuality: toNumber(
        overrides.jpegQuality ?? process.env.REMOTION_RENDER_JPEG_QUALITY,
        95,
      ),
      framesPerLambda: toNumber(
        overrides.framesPerLambda ?? process.env.REMOTION_RENDER_FRAMES_PER_LAMBDA,
        undefined,
      ),
      concurrency: toNumber(
        overrides.concurrency ?? process.env.REMOTION_RENDER_CONCURRENCY,
        20,
      ),
      imageFormat: overrides.imageFormat || process.env.REMOTION_RENDER_IMAGE_FORMAT || "jpeg",
      maxRetries: toNumber(
        overrides.maxRetries ?? process.env.REMOTION_RENDER_MAX_RETRIES,
        1,
      ),
      privacy: clean(overrides.privacy || process.env.REMOTION_RENDER_PRIVACY) || undefined,
      downloadBehavior: null,
    },
  };
};

export const getMergedRenderDefaults = (manifest, config) => {
  const defaults = {
    codec: manifest.renderDefaults?.codec || config.renderDefaults.codec,
    imageFormat:
      manifest.renderDefaults?.imageFormat || config.renderDefaults.imageFormat,
    crf: manifest.renderDefaults?.crf ?? config.renderDefaults.crf,
    jpegQuality:
      manifest.renderDefaults?.jpegQuality ?? config.renderDefaults.jpegQuality,
    maxRetries:
      manifest.renderDefaults?.maxRetries ?? config.renderDefaults.maxRetries,
    privacy: manifest.renderDefaults?.privacy || config.renderDefaults.privacy,
    downloadBehavior: null,
  };

  const concurrency =
    manifest.renderDefaults?.concurrency ?? config.renderDefaults.concurrency;
  const framesPerLambda =
    manifest.renderDefaults?.framesPerLambda ??
    config.renderDefaults.framesPerLambda;

  if (concurrency) {
    return { ...defaults, concurrency };
  }

  if (framesPerLambda) {
    return { ...defaults, framesPerLambda };
  }

  return defaults;
};

export const writeDeploymentManifest = async (manifestPath, data) => {
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
};

export const readDeploymentManifest = async (
  manifestPath = DEFAULT_DEPLOYMENT_MANIFEST,
) => {
  let manifest = {};

  try {
    const raw = await readFile(manifestPath, "utf8");
    manifest = JSON.parse(raw);
  } catch (error) {
    if (!process.env.REMOTION_LAMBDA_FUNCTION_NAME || !process.env.REMOTION_LAMBDA_SERVE_URL) {
      throw new Error(
        `Could not read Remotion Lambda deployment manifest at ${manifestPath}. ` +
          "Deploy Lambda first, redeploy this API with deployment/remotion-lambda.json, " +
          "or set REMOTION_LAMBDA_FUNCTION_NAME, REMOTION_LAMBDA_SERVE_URL, and REMOTION_LAMBDA_BUCKET_NAME.",
      );
    }
  }

  return {
    ...manifest,
    region:
      clean(process.env.REMOTION_AWS_REGION || process.env.AWS_REGION) ||
      manifest.region,
    bucketName:
      clean(process.env.REMOTION_LAMBDA_BUCKET_NAME) || manifest.bucketName,
    functionName:
      clean(process.env.REMOTION_LAMBDA_FUNCTION_NAME) || manifest.functionName,
    serveUrl: clean(process.env.REMOTION_LAMBDA_SERVE_URL) || manifest.serveUrl,
  };
};

export const assertDeploymentManifest = (manifest) => {
  const missing = ["region", "bucketName", "functionName", "serveUrl"].filter(
    (key) => !clean(manifest[key]),
  );

  if (missing.length) {
    throw new Error(
      `Remotion Lambda deployment config is missing: ${missing.join(", ")}. ` +
        "Redeploy this API from the latest GitHub commit, or set these Render env vars: " +
        "REMOTION_LAMBDA_BUCKET_NAME, REMOTION_LAMBDA_FUNCTION_NAME, REMOTION_LAMBDA_SERVE_URL, REMOTION_AWS_REGION.",
    );
  }
};
