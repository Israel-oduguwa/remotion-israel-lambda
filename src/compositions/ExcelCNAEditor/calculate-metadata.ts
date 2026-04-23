import { getAudioDurationInSeconds } from "@remotion/media-utils";
import type { CalculateMetadataFunction } from "remotion";
import type { ExcelCNAEditorProps } from "./schema";

export const calculateExcelCnaEditorMetadata: CalculateMetadataFunction<
  ExcelCNAEditorProps
> = async ({ props }) => {
  const fps = 30;
  const sceneDurationSec =
    Math.max(...props.scenes.map((scene) => scene.endMs), 0) / 1000;
  let durationInSeconds = Math.max(sceneDurationSec, 1);

  try {
    durationInSeconds = Math.max(
      durationInSeconds,
      await getAudioDurationInSeconds(props.voiceoverUrl),
    );
  } catch (error) {
    console.warn(
      `Falling back to scene duration for ${props.adId}:`,
      error instanceof Error ? error.message : error,
    );
  }

  return {
    durationInFrames: Math.max(Math.ceil(durationInSeconds * fps), 1),
    defaultOutName: `excelcna-editor-${props.adId}`,
  };
};
