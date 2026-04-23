#!/usr/bin/env node

import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import { getRenderProgress, renderMediaOnLambda } from "@remotion/lambda/client";
import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { access, mkdir } from "node:fs/promises";
import http from "node:http";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { setTimeout as wait } from "node:timers/promises";
import {
  clean,
  normalizeExcelCnaEditorProps,
  slugify,
} from "./lib/excelcna-editor-props.mjs";
import {
  assertDeploymentManifest,
  getLambdaConfig,
  getMergedRenderDefaults,
  readDeploymentManifest,
} from "./lib/lambda-config.mjs";

const PORT = Number(process.env.PORT || 3030);
const HOST = process.env.HOST || "0.0.0.0";
const REMOTION_ENTRY = resolve(process.cwd(), "src/index.ts");
const OUTPUT_DIR = resolve(process.cwd(), "out/api-renders");
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || "";
const RENDER_API_TOKEN = process.env.RENDER_API_TOKEN || "";
const LAMBDA_WAIT_TIMEOUT_MS = Number(process.env.LAMBDA_WAIT_TIMEOUT_MS || 900000);
const LAMBDA_WAIT_POLL_INTERVAL_MS = Number(
  process.env.LAMBDA_WAIT_POLL_INTERVAL_MS || 2000,
);

let serveUrlPromise = null;

const getBodyJson = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    throw new Error("Request body is empty.");
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Invalid JSON body: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(JSON.stringify(payload, null, 2));
};

const isAuthorized = (req) => {
  if (!RENDER_API_TOKEN) {
    return true;
  }

  const authorization = req.headers.authorization || "";
  return authorization === `Bearer ${RENDER_API_TOKEN}`;
};

const sendFile = (res, filePath) => {
  const stat = statSync(filePath);
  res.writeHead(200, {
    "Content-Type": "video/mp4",
    "Content-Length": stat.size,
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  createReadStream(filePath).pipe(res);
};

const buildPublicUrl = (req, fileName) => {
  if (PUBLIC_BASE_URL) {
    return `${PUBLIC_BASE_URL.replace(/\/+$/, "")}/renders/${fileName}`;
  }

  const host = req.headers.host || `localhost:${PORT}`;
  const protocol = req.headers["x-forwarded-proto"] || "http";
  return `${protocol}://${host}/renders/${fileName}`;
};

const ensureBundled = async () => {
  if (!serveUrlPromise) {
    serveUrlPromise = bundle({
      entryPoint: REMOTION_ENTRY,
      onProgress: () => undefined,
      onDirectoryCreated: () => undefined,
      ignoreRegisterRootWarning: true,
      outDir: join(tmpdir(), "remotion-render-api-bundle"),
      enableCaching: true,
      publicPath: null,
      rootDir: process.cwd(),
      publicDir: null,
      onPublicDirCopyProgress: () => undefined,
      onSymlinkDetected: () => undefined,
      keyboardShortcutsEnabled: false,
      askAIEnabled: false,
      rspack: false,
      bufferStateDelayInMilliseconds: null,
      maxTimelineTracks: null,
      audioLatencyHint: null,
      experimentalClientSideRenderingEnabled: false,
      experimentalVisualModeEnabled: false,
      gitSource: null,
      renderDefaults: null,
    });
  }

  return serveUrlPromise;
};

const renderExcelCnaEditor = async (props, outputLocation) => {
  const serveUrl = await ensureBundled();
  const compositions = await getCompositions(serveUrl, {
    inputProps: props,
    logLevel: "error",
  });

  const composition = compositions.find((entry) => entry.id === "ExcelCNAEditor");
  if (!composition) {
    throw new Error('Composition "ExcelCNAEditor" not found.');
  }

  await mkdir(dirname(outputLocation), { recursive: true });

  await renderMedia({
    serveUrl,
    composition,
    inputProps: props,
    codec: "h264",
    outputLocation,
    overwrite: true,
    logLevel: "error",
  });
};

const renderExcelCnaEditorOnLambda = async (body) => {
  const props = normalizeExcelCnaEditorProps(body);
  const config = await getLambdaConfig();
  const deployment = await readDeploymentManifest(config.deploymentManifestPath);
  assertDeploymentManifest(deployment);
  const outKeyBase = slugify(body.slug || body.video_title || props.adId, props.adId);
  const renderDefaults = getMergedRenderDefaults(deployment, config);

  const render = await renderMediaOnLambda({
    region: deployment.region,
    functionName: deployment.functionName,
    serveUrl: deployment.serveUrl,
    composition: "ExcelCNAEditor",
    inputProps: props,
    forceBucketName: deployment.bucketName,
    ...renderDefaults,
    outName: {
      bucketName: deployment.bucketName,
      key: `${outKeyBase}-${Date.now()}-${randomUUID().slice(0, 8)}.mp4`,
    },
    logLevel: "info",
  });

  return {
    ...render,
    functionName: deployment.functionName,
    serveUrl: deployment.serveUrl,
    region: deployment.region,
  };
};

const waitForLambdaRender = async (render) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < LAMBDA_WAIT_TIMEOUT_MS) {
    const progress = await getRenderProgress({
      renderId: render.renderId,
      bucketName: render.bucketName,
      functionName: render.functionName,
      region: render.region,
      logLevel: "info",
    });

    if (progress.fatalErrorEncountered) {
      const firstError = progress.errors?.[0];
      throw new Error(
        firstError?.message || "Lambda render failed with a fatal error.",
      );
    }

    if (progress.done) {
      return progress;
    }

    await wait(LAMBDA_WAIT_POLL_INTERVAL_MS);
  }

  throw new Error(
    `Lambda render did not finish within ${Math.round(
      LAMBDA_WAIT_TIMEOUT_MS / 1000,
    )} seconds. Use the async progress route with this renderId: ${render.renderId}`,
  );
};

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    return sendJson(res, 400, { ok: false, error: "Missing request URL." });
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);

  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "GET" && url.pathname === "/config") {
    if (!isAuthorized(req)) {
      return sendJson(res, 401, { ok: false, error: "Unauthorized." });
    }

    try {
      const config = await getLambdaConfig();
      const deployment = await readDeploymentManifest(config.deploymentManifestPath);
      assertDeploymentManifest(deployment);

      return sendJson(res, 200, {
        ok: true,
        deploymentManifestPath: config.deploymentManifestPath,
        region: deployment.region,
        bucketName: deployment.bucketName,
        functionName: deployment.functionName,
        serveUrl: deployment.serveUrl,
        siteName: deployment.siteName,
        deployedAt: deployment.deployedAt,
        renderDefaults: getMergedRenderDefaults(deployment, config),
      });
    } catch (error) {
      return sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (req.method === "GET" && url.pathname.startsWith("/renders/")) {
    const fileName = decodeURIComponent(url.pathname.replace(/^\/renders\//, ""));
    const filePath = join(OUTPUT_DIR, fileName);

    if (!existsSync(filePath) || extname(filePath) !== ".mp4") {
      return sendJson(res, 404, { ok: false, error: "Render not found." });
    }

    return sendFile(res, filePath);
  }

  if (req.method === "GET" && url.pathname === "/render/lambda/progress") {
    if (!isAuthorized(req)) {
      return sendJson(res, 401, { ok: false, error: "Unauthorized." });
    }

    try {
      const renderId = clean(url.searchParams.get("renderId"));
      if (!renderId) {
        throw new Error("Missing renderId query parameter.");
      }

      const config = await getLambdaConfig();
      const deployment = await readDeploymentManifest(config.deploymentManifestPath);
      assertDeploymentManifest(deployment);
      const bucketName = clean(url.searchParams.get("bucketName"), deployment.bucketName);
      const functionName = clean(
        url.searchParams.get("functionName"),
        deployment.functionName,
      );

      const progress = await getRenderProgress({
        renderId,
        bucketName,
        functionName,
        region: deployment.region,
        logLevel: "info",
      });

      return sendJson(res, 200, { ok: true, ...progress });
    } catch (error) {
      return sendJson(res, 400, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (req.method === "POST" && (url.pathname === "/render" || url.pathname === "/render/excelcna-editor")) {
    if (!isAuthorized(req)) {
      return sendJson(res, 401, { ok: false, error: "Unauthorized." });
    }

    try {
      const body = await getBodyJson(req);
      const props = normalizeExcelCnaEditorProps(body);
      const slug = clean(body.slug || body.video_title || props.adId, props.adId)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const fileName = `${slug || "render"}-${Date.now()}-${randomUUID().slice(0, 8)}.mp4`;
      const outputLocation = join(OUTPUT_DIR, fileName);

      await mkdir(OUTPUT_DIR, { recursive: true });
      await renderExcelCnaEditor(props, outputLocation);

      if (url.searchParams.get("download") === "1") {
        return sendFile(res, outputLocation);
      }

      return sendJson(res, 200, {
        ok: true,
        compositionId: "ExcelCNAEditor",
        fileName,
        outputLocation,
        renderUrl: buildPublicUrl(req, fileName),
        props,
      });
    } catch (error) {
      return sendJson(res, 400, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (
    req.method === "POST" &&
    (url.pathname === "/render/lambda" ||
      url.pathname === "/render/excelcna-editor/lambda")
  ) {
    if (!isAuthorized(req)) {
      return sendJson(res, 401, { ok: false, error: "Unauthorized." });
    }

    try {
      const body = await getBodyJson(req);
      const render = await renderExcelCnaEditorOnLambda(body);

      return sendJson(res, 200, {
        ok: true,
        compositionId: "ExcelCNAEditor",
        ...render,
        progressUrl:
          `/render/lambda/progress?renderId=${encodeURIComponent(render.renderId)}` +
          `&bucketName=${encodeURIComponent(render.bucketName)}` +
          `&functionName=${encodeURIComponent(render.functionName)}`,
      });
    } catch (error) {
      return sendJson(res, 400, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (
    req.method === "POST" &&
    (url.pathname === "/render/lambda/wait" ||
      url.pathname === "/render/excelcna-editor/lambda/wait")
  ) {
    if (!isAuthorized(req)) {
      return sendJson(res, 401, { ok: false, error: "Unauthorized." });
    }

    try {
      const body = await getBodyJson(req);
      const render = await renderExcelCnaEditorOnLambda(body);
      const progress = await waitForLambdaRender(render);

      return sendJson(res, 200, {
        ok: true,
        compositionId: "ExcelCNAEditor",
        renderId: render.renderId,
        bucketName: render.bucketName,
        functionName: render.functionName,
        region: render.region,
        outputFile: progress.outputFile,
        videoUrl: progress.outputFile,
        outKey: progress.outKey,
        timeToFinish: progress.timeToFinish,
        renderSize: progress.renderSize,
      });
    } catch (error) {
      return sendJson(res, 400, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return sendJson(res, 404, { ok: false, error: "Route not found." });
});

await access(dirname(OUTPUT_DIR)).catch(async () => {
  await mkdir(dirname(OUTPUT_DIR), { recursive: true });
});
mkdirSync(OUTPUT_DIR, { recursive: true });

server.listen(PORT, HOST, () => {
  console.log(`Render API listening on http://${HOST}:${PORT}`);
});
