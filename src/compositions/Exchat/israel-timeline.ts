import type { SocialAdProps, TimedCaption } from "../SocialAd/schema";
import type { ResolvedCaption, TimelinePlan, TimelineScene } from "../SocialAd/timeline";
import { buildTimelinePlan } from "../SocialAd/timeline";
import {
  familyTransitionFrames,
  getSceneWeight,
  inferMediaType,
} from "../SocialAd/utils";

type CaptionWithFrames = TimedCaption & {
  absoluteStartFrame: number;
  absoluteEndFrame: number;
};

const distributeCaptionCounts = (
  totalCaptions: number,
  props: SocialAdProps,
): number[] => {
  const sceneCount = props.scenes.length;

  if (totalCaptions < sceneCount) {
    return [];
  }

  const weights = props.scenes.map((scene) =>
    getSceneWeight(scene.role, scene.weight),
  );
  const counts = Array.from({ length: sceneCount }, () => 1);
  let remaining = totalCaptions - sceneCount;

  if (remaining <= 0) {
    return counts;
  }

  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  const rawShares = weights.map((weight) => (remaining * weight) / totalWeight);
  const floorShares = rawShares.map((value) => Math.floor(value));

  for (let index = 0; index < counts.length; index += 1) {
    counts[index] += floorShares[index];
  }

  remaining -= floorShares.reduce((sum, value) => sum + value, 0);

  const ranked = rawShares
    .map((value, index) => ({ index, remainder: value - floorShares[index] }))
    .sort((left, right) => right.remainder - left.remainder);

  for (let index = 0; index < remaining; index += 1) {
    counts[ranked[index % ranked.length].index] += 1;
  }

  return counts;
};

const toFrame = (ms: number, fps: number): number => {
  return Math.round((ms * fps) / 1000);
};

export const buildIsraelTimeline = (
  props: SocialAdProps,
  totalFrames: number,
  fps: number,
): TimelinePlan => {
  const timed = props.captions?.timed ?? [];

  if (timed.length === 0) {
    return buildTimelinePlan(props, totalFrames, fps);
  }

  const counts = distributeCaptionCounts(timed.length, props);

  if (counts.length === 0) {
    return buildTimelinePlan(props, totalFrames, fps);
  }

  const transitionFrames = familyTransitionFrames(props.templateFamily, fps);
  const sortedCaptions: CaptionWithFrames[] = [...timed]
    .sort((left, right) => left.startMs - right.startMs)
    .map((caption) => ({
      ...caption,
      absoluteStartFrame: toFrame(caption.startMs, fps),
      absoluteEndFrame: toFrame(caption.endMs, fps),
    }));

  const targetFrames = props.targetDurationSec
    ? Math.round(props.targetDurationSec * fps)
    : 0;
  const totalCaptionFrames = Math.max(
    ...sortedCaptions.map((caption) => caption.absoluteEndFrame),
  );
  const totalContentFrames = Math.max(totalFrames, totalCaptionFrames, targetFrames);

  let cursor = 0;
  const captionGroups = counts.map((count) => {
    const group = sortedCaptions.slice(cursor, cursor + count);
    cursor += count;
    return group;
  });

  let currentStartFrame = 0;

  const scenes: TimelineScene[] = props.scenes.map((scene, index) => {
    const group = captionGroups[index] ?? [];
    const nextGroup = captionGroups[index + 1] ?? [];
    const nextStartFrame =
      nextGroup[0]?.absoluteStartFrame ??
      totalContentFrames;
    const lastCaptionEnd =
      group[group.length - 1]?.absoluteEndFrame ??
      Math.max(currentStartFrame + Math.round(fps * 1.5), nextStartFrame);
    const sceneOutputEndFrame = Math.max(lastCaptionEnd, nextStartFrame);
    const actualDuration = Math.max(
      sceneOutputEndFrame - currentStartFrame,
      Math.round(fps * 1.4),
    );
    const sequenceDuration =
      index < props.scenes.length - 1
        ? actualDuration + transitionFrames
        : actualDuration;

    const captions: ResolvedCaption[] = group.map((caption, captionIndex) => ({
      id: caption.id ?? `${scene.id}-timed-${captionIndex}`,
      text: caption.text,
      startFrame: Math.max(caption.absoluteStartFrame - currentStartFrame, 0),
      endFrame: Math.max(
        caption.absoluteEndFrame - currentStartFrame,
        Math.max(caption.absoluteStartFrame - currentStartFrame + 1, 1),
      ),
    }));

    const outputStartFrame = currentStartFrame;
    const outputEndFrame = currentStartFrame + actualDuration;

    currentStartFrame = outputEndFrame;

    return {
      scene,
      mediaType: scene.mediaType ?? inferMediaType(scene.mediaUrl),
      sequenceDuration,
      outputStartFrame,
      outputEndFrame,
      captions,
    };
  });

  return {
    totalFrames: totalContentFrames,
    transitionFrames,
    scenes,
  };
};
