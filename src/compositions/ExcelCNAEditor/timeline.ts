import type { ExcelCNAEditorProps } from "./schema";

export type ResolvedEditorCaption = {
  id: string;
  text: string;
  startFrame: number;
  endFrame: number;
  type: ExcelCNAEditorProps["captions"][number]["type"];
  effect: ExcelCNAEditorProps["captions"][number]["effect"];
};

export type ResolvedEditorOverlay = {
  id: string;
  type: NonNullable<ExcelCNAEditorProps["scenes"][number]["overlays"]>[number]["type"];
  startFrame: number;
  endFrame: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  target?: "caption" | "frame";
};

export type ResolvedEditorScene = {
  scene: ExcelCNAEditorProps["scenes"][number];
  sequenceDuration: number;
  durationInFrames: number;
  captions: ResolvedEditorCaption[];
  overlays: ResolvedEditorOverlay[];
};

const toFrame = (ms: number, fps: number): number => Math.round((ms * fps) / 1000);

const transitionFrames = (transition: ExcelCNAEditorProps["scenes"][number]["transition"], fps: number) => {
  switch (transition) {
    case "slide":
      return Math.round(fps * 0.58);
    case "wipe":
      return Math.round(fps * 0.54);
    case "fade":
    default:
      return Math.round(fps * 0.5);
  }
};

export const buildExcelCnaEditorTimeline = (
  props: ExcelCNAEditorProps,
  fps: number,
) => {
  const sortedScenes = [...props.scenes].sort((left, right) => left.startMs - right.startMs);
  const sortedCaptions = [...props.captions].sort(
    (left, right) => left.startMs - right.startMs,
  );

  const sceneCaptionMap = new Map<string, typeof sortedCaptions>();

  for (const scene of sortedScenes) {
    sceneCaptionMap.set(scene.id, []);
  }

  for (const caption of sortedCaptions) {
    const midpoint = caption.startMs + (caption.endMs - caption.startMs) / 2;
    const owner =
      sortedScenes.find(
        (scene) => midpoint >= scene.startMs && midpoint < scene.endMs,
      ) ??
      sortedScenes.find(
        (scene) => midpoint >= scene.startMs && midpoint <= scene.endMs,
      ) ??
      sortedScenes[sortedScenes.length - 1];

    sceneCaptionMap.get(owner.id)?.push(caption);
  }

  const scenes = sortedScenes
    .map((scene, index, collection): ResolvedEditorScene => {
      const durationInFrames = Math.max(toFrame(scene.endMs - scene.startMs, fps), 1);
      const overlap =
        index < collection.length - 1 ? transitionFrames(scene.transition, fps) : 0;
      const sceneCaptions = sceneCaptionMap.get(scene.id) ?? [];

      return {
        scene,
        durationInFrames,
        sequenceDuration: durationInFrames + overlap,
        captions: sceneCaptions.map((caption, captionIndex) => ({
            id: caption.id ?? `${scene.id}-caption-${captionIndex}`,
            text: caption.text,
            startFrame: Math.max(toFrame(caption.startMs - scene.startMs, fps), 0),
            endFrame: Math.max(
              Math.min(toFrame(caption.endMs - scene.startMs, fps), durationInFrames),
              Math.max(toFrame(caption.startMs - scene.startMs, fps) + 1, 1),
            ),
            type: caption.type,
            effect: caption.effect,
          })),
        overlays: (scene.overlays ?? []).map((overlay, overlayIndex) => ({
          id: overlay.id ?? `${scene.id}-overlay-${overlayIndex}`,
          type: overlay.type,
          startFrame: Math.max(toFrame(overlay.startMs - scene.startMs, fps), 0),
          endFrame: Math.max(toFrame(overlay.endMs - scene.startMs, fps), 1),
          x: overlay.x,
          y: overlay.y,
          width: overlay.width,
          height: overlay.height,
          color: overlay.color,
          target: overlay.target,
        })),
      };
    });

  return { scenes };
};
