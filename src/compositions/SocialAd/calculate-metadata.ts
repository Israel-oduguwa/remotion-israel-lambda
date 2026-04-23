import { getAudioDurationInSeconds } from "@remotion/media-utils";
import type { CalculateMetadataFunction } from "remotion";
import type { SocialAdProps } from "./schema";
import { clamp } from "./utils";

export const calculateSocialAdMetadata: CalculateMetadataFunction<
  SocialAdProps
> = async ({ props }) => {
  const fps = 30;
  let durationInSeconds = clamp(props.targetDurationSec ?? 45, 35, 60);

  try {
    durationInSeconds = await getAudioDurationInSeconds(
      props.prefetchedLocalPath ?? props.voiceoverUrl,
    );
  } catch (error) {
    console.warn(
      `Falling back to targetDurationSec for ${props.adId}:`,
      error instanceof Error ? error.message : error,
    );
  }

  return {
    durationInFrames: Math.max(Math.ceil(durationInSeconds * fps), 1),
    defaultOutName: `social-ad-${props.adId}`,
  };
};
