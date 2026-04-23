import type { SocialAdProps } from "./schema";
import { sampleSocialAds } from "./sample-props";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const asNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePayload = (input: unknown): SocialAdProps | null => {
  const wrapper = Array.isArray(input) ? input[0] : input;

  if (!isRecord(wrapper)) {
    return null;
  }

  const payload = isRecord(wrapper.remotion_payload) ? wrapper.remotion_payload : wrapper;
  const sourceScenes = Array.isArray(payload.scenes) ? payload.scenes : [];

  if (sourceScenes.length === 0) {
    return null;
  }

  const normalizedScenes = sourceScenes
    .filter(isRecord)
    .map((scene, index) => ({
      id:
        asString(scene.id) || `scene-${String(index + 1).padStart(2, "0")}`,
      role: asString(scene.role, index === 0 ? "hook" : "solution") as SocialAdProps["scenes"][number]["role"],
      headline: asString(scene.headline, "Untitled scene"),
      supportingText: asString(scene.supportingText, "Supporting copy unavailable."),
      badgeLabel: asString(scene.badgeLabel) || undefined,
      badgeValue: asString(scene.badgeValue) || undefined,
      mediaUrl: asString(scene.mediaUrl),
      mediaType: asString(scene.mediaType, "image") as SocialAdProps["scenes"][number]["mediaType"],
      captionText: asString(scene.captionText) || undefined,
    }))
    .filter((scene) => scene.mediaUrl);

  if (normalizedScenes.length === 0) {
    return null;
  }

  const ctaIndex = normalizedScenes.findIndex((scene) => scene.role === "cta");
  const hasProof = normalizedScenes.some((scene) => scene.role === "proof");

  if (!hasProof && ctaIndex > 0) {
    normalizedScenes[ctaIndex - 1] = {
      ...normalizedScenes[ctaIndex - 1],
      role: "proof",
    };
  }

  const wrapperScenes = Array.isArray(wrapper.scenes) ? wrapper.scenes : [];
  const summedDuration = wrapperScenes
    .filter(isRecord)
    .reduce((sum, scene) => sum + asNumber(scene.scene_duration_seconds), 0);

  const timed =
    isRecord(payload.captions) && Array.isArray(payload.captions.timed)
      ? payload.captions.timed
          .filter(isRecord)
          .map((caption) => ({
            id: asString(caption.id) || undefined,
            sceneId: asString(caption.sceneId) || undefined,
            text: asString(caption.text),
            startMs: asNumber(caption.startMs),
            endMs: asNumber(caption.endMs),
          }))
          .filter(
            (caption) =>
              caption.text &&
              caption.endMs > caption.startMs,
          )
      : [];

  const phrases =
    isRecord(payload.captions) && Array.isArray(payload.captions.phrases)
      ? payload.captions.phrases
          .filter(isRecord)
          .map((caption, index) => ({
            sceneId:
              asString(caption.sceneId) ||
              normalizedScenes[index]?.id,
            text: asString(caption.text),
          }))
          .filter((caption) => caption.sceneId && caption.text)
      : [];

  const timedDurationSec = timed.length
    ? Math.ceil(
        timed.reduce((max, caption) => Math.max(max, caption.endMs), 0) / 1000,
      )
    : 0;

  return {
    adId: asString(payload.adId, "live-preview"),
    campaignId: asString(payload.campaignId) || undefined,
    templateFamily:
      asString(payload.templateFamily, "proof-driven") as SocialAdProps["templateFamily"],
    brandName: asString(payload.brandName, "ExcelCNA"),
    ctaLabel: asString(payload.ctaLabel, "Learn more"),
    ctaUrl: asString(payload.ctaUrl, "https://www.excelcna.com"),
    trackingSlug: asString(payload.trackingSlug) || undefined,
    aspectRatio: "9:16",
    logoUrl: asString(
      payload.logoUrl,
      "https://placehold.co/512x512/png?text=ExcelCNA",
    ),
    primaryColor: asString(payload.primaryColor, "#0E7490"),
    secondaryColor: asString(payload.secondaryColor, "#F59E0B"),
    textColor: asString(payload.textColor, "#F8FAFC"),
    accentColor: asString(payload.accentColor, "#FDE68A"),
    surfaceColor: asString(payload.surfaceColor, "#08101F"),
    voiceoverUrl: asString(payload.voiceoverUrl, "https://samplelib.com/lib/preview/mp3/sample-15s.mp3"),
    targetDurationSec:
      timedDurationSec ||
      summedDuration ||
      asNumber(payload.targetDurationSec, 45),
    scenes: normalizedScenes,
    captions:
      timed.length || phrases.length
        ? {
            ...(timed.length ? { timed } : {}),
            ...(phrases.length ? { phrases } : {}),
          }
        : undefined,
  };
};

export const resolveLivePreviewProps = (input: unknown): SocialAdProps => {
  return normalizePayload(input) ?? sampleSocialAds.proofDriven;
};
