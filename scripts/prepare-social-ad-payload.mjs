#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [, , inputArg, outputArg] = process.argv;

if (!inputArg || !outputArg) {
  console.error(
    "Usage: node scripts/prepare-social-ad-payload.mjs <input.json> <output.json>",
  );
  process.exit(1);
}

const inputPath = resolve(process.cwd(), inputArg);
const outputPath = resolve(process.cwd(), outputArg);

const raw = JSON.parse(readFileSync(inputPath, "utf8"));
const wrapper = Array.isArray(raw) ? raw[0] : raw;
const sourcePayload = wrapper.remotion_payload ?? wrapper;

if (!sourcePayload || typeof sourcePayload !== "object") {
  console.error("Could not find a Remotion payload in the provided JSON.");
  process.exit(1);
}

const sourceScenes = Array.isArray(sourcePayload.scenes) ? sourcePayload.scenes : [];

if (sourceScenes.length === 0) {
  console.error("The provided payload has no scenes.");
  process.exit(1);
}

const normalizedScenes = sourceScenes.map((scene, index) => ({
  ...scene,
  id: `scene-${String(index + 1).padStart(2, "0")}`,
}));

const hasProofScene = normalizedScenes.some((scene) => scene.role === "proof");
const ctaIndex = normalizedScenes.findIndex((scene) => scene.role === "cta");

if (!hasProofScene && ctaIndex > 0) {
  normalizedScenes[ctaIndex - 1] = {
    ...normalizedScenes[ctaIndex - 1],
    role: "proof",
  };
}

const normalizedCaptions = Array.isArray(sourcePayload.captions?.phrases)
  ? sourcePayload.captions.phrases.map((caption, index) => ({
      ...caption,
      sceneId:
        caption.sceneId && normalizedScenes[index]
          ? normalizedScenes[index].id
          : caption.sceneId,
    }))
  : undefined;

const targetDurationSec =
  wrapper.scenes?.reduce(
    (sum, scene) => sum + Number(scene.scene_duration_seconds || 0),
    0,
  ) ||
  sourcePayload.targetDurationSec ||
  45;

const preparedPayload = {
  ...sourcePayload,
  targetDurationSec,
  scenes: normalizedScenes,
  captions: normalizedCaptions ? { phrases: normalizedCaptions } : sourcePayload.captions,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(preparedPayload, null, 2));

console.log(`Wrote prepared payload to ${outputPath}`);
