import type {
  PhraseCaption,
  SocialAdProps,
  SocialAdScene,
  TimedCaption,
} from "./schema";
import {
  clamp,
  familyTransitionFrames,
  getSceneWeight,
  inferMediaType,
  splitCaptionText,
} from "./utils";

export type ResolvedCaption = {
  id: string;
  text: string;
  startFrame: number;
  endFrame: number;
};

export type TimelineScene = {
  scene: SocialAdScene;
  mediaType: "image" | "video";
  sequenceDuration: number;
  outputStartFrame: number;
  outputEndFrame: number;
  captions: ResolvedCaption[];
};

export type TimelinePlan = {
  totalFrames: number;
  transitionFrames: number;
  scenes: TimelineScene[];
};

const allocateFrames = (
  totalFrames: number,
  weights: number[],
  minimums: number[],
): number[] => {
  const base = [...minimums];
  let remaining = totalFrames - minimums.reduce((sum, item) => sum + item, 0);

  if (remaining < 0) {
    const even = Math.floor(totalFrames / minimums.length);
    return minimums.map((_, index) =>
      index === minimums.length - 1
        ? totalFrames - even * (minimums.length - 1)
        : even,
    );
  }

  const weightTotal = weights.reduce((sum, item) => sum + item, 0);
  const rawShares = weights.map((weight) => (remaining * weight) / weightTotal);
  const floorShares = rawShares.map((value) => Math.floor(value));

  for (let index = 0; index < base.length; index += 1) {
    base[index] += floorShares[index];
  }

  remaining -= floorShares.reduce((sum, item) => sum + item, 0);

  const ranked = rawShares
    .map((value, index) => ({ index, remainder: value - floorShares[index] }))
    .sort((left, right) => right.remainder - left.remainder);

  for (let index = 0; index < remaining; index += 1) {
    base[ranked[index % ranked.length].index] += 1;
  }

  return base;
};

const derivePhraseCaptions = (
  scene: SocialAdScene,
  durationInFrames: number,
  fps: number,
  phrases: PhraseCaption[],
): ResolvedCaption[] => {
  const scopedPhrases = phrases
    .filter((caption) => !caption.sceneId || caption.sceneId === scene.id)
    .map((caption) => caption.text);

  const sourcePhrases =
    scopedPhrases.length > 0
      ? scopedPhrases
      : splitCaptionText(
          scene.captionText ?? `${scene.headline}. ${scene.supportingText}`,
        );

  if (sourcePhrases.length === 0) {
    return [];
  }

  const leadIn = Math.round(fps * 0.2);
  const tailBuffer = Math.round(fps * 0.4);
  const activeWindow = Math.max(
    durationInFrames - leadIn - tailBuffer,
    sourcePhrases.length * Math.round(fps * 0.6),
  );
  const slot = Math.max(Math.floor(activeWindow / sourcePhrases.length), 16);

  return sourcePhrases.map((text, index) => {
    const startFrame = clamp(leadIn + index * slot, 0, durationInFrames - 8);
    const endFrame = clamp(
      leadIn + (index + 1) * slot,
      startFrame + 8,
      durationInFrames - 2,
    );

    return {
      id: `${scene.id}-phrase-${index}`,
      text,
      startFrame,
      endFrame,
    };
  });
};

const resolveTimedCaptions = (
  timed: TimedCaption[],
  scene: SocialAdScene,
  outputStartFrame: number,
  outputEndFrame: number,
  sequenceDuration: number,
  fps: number,
): ResolvedCaption[] => {
  return timed
    .filter((caption) => {
      if (caption.sceneId) {
        return caption.sceneId === scene.id;
      }

      const midpointFrame = (((caption.startMs + caption.endMs) / 2) * fps) / 1000;
      return midpointFrame >= outputStartFrame && midpointFrame <= outputEndFrame;
    })
    .map((caption, index) => {
      const startFrame = clamp(
        Math.round((caption.startMs * fps) / 1000) - outputStartFrame,
        0,
        sequenceDuration - 8,
      );
      const endFrame = clamp(
        Math.round((caption.endMs * fps) / 1000) - outputStartFrame,
        startFrame + 8,
        sequenceDuration - 2,
      );

      return {
        id: caption.id ?? `${scene.id}-timed-${index}`,
        text: caption.text,
        startFrame,
        endFrame,
      };
    });
};

export const buildTimelinePlan = (
  props: SocialAdProps,
  totalFrames: number,
  fps: number,
): TimelinePlan => {
  const transitionFrames = familyTransitionFrames(props.templateFamily, fps);
  const overlapBudget = transitionFrames * Math.max(props.scenes.length - 1, 0);
  const allocatableFrames = totalFrames + overlapBudget;
  const ctaIndex = props.scenes.findIndex((scene) => scene.role === "cta");
  const ctaFloor = Math.round(fps * 4.5);
  const sharedMinimum = Math.round(fps * 2.8);

  const minimums = props.scenes.map((scene, index) =>
    index === ctaIndex ? ctaFloor : sharedMinimum,
  );
  const weights = props.scenes.map((scene) =>
    getSceneWeight(scene.role, scene.weight),
  );
  const sequenceDurations = allocateFrames(allocatableFrames, weights, minimums);

  let outputCursor = 0;
  const scenes = props.scenes.map((scene, index) => {
    const sequenceDuration = sequenceDurations[index];
    const outputStartFrame = outputCursor;
    const outputEndFrame = outputStartFrame + sequenceDuration;
    outputCursor += sequenceDuration - transitionFrames;

    return {
      scene,
      mediaType: scene.mediaType ?? inferMediaType(scene.mediaUrl),
      sequenceDuration,
      outputStartFrame,
      outputEndFrame,
      captions: [] as ResolvedCaption[],
    };
  });

  const timedCaptions = props.captions?.timed ?? [];
  const phraseCaptions = props.captions?.phrases ?? [];

  const resolvedScenes = scenes.map((entry) => {
    const timed = resolveTimedCaptions(
      timedCaptions,
      entry.scene,
      entry.outputStartFrame,
      entry.outputEndFrame,
      entry.sequenceDuration,
      fps,
    );

    const captions =
      timed.length > 0
        ? timed
        : derivePhraseCaptions(
            entry.scene,
            entry.sequenceDuration,
            fps,
            phraseCaptions,
          );

    return {
      ...entry,
      captions,
    };
  });

  return {
    totalFrames,
    transitionFrames,
    scenes: resolvedScenes,
  };
};
