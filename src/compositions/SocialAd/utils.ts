import type { MediaType, SceneRole, SocialAdProps, TemplateFamily } from "./schema";

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = hex.replace("#", "");
  const safe =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const bigint = Number.parseInt(safe, 16);
  const red = (bigint >> 16) & 255;
  const green = (bigint >> 8) & 255;
  const blue = bigint & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export const stringHash = (input: string): number => {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
};

export const seededIndex = (seed: string, length: number): number => {
  if (length <= 1) {
    return 0;
  }

  return stringHash(seed) % length;
};

export const seededPick = <T,>(seed: string, values: readonly T[]): T => {
  return values[seededIndex(seed, values.length)];
};

export const inferMediaType = (url: string): MediaType => {
  const normalized = url.toLowerCase();
  if (
    normalized.includes(".mp4") ||
    normalized.includes(".webm") ||
    normalized.includes(".mov") ||
    normalized.includes("video")
  ) {
    return "video";
  }

  return "image";
};

export const fitHeadlineSize = (headline: string): number => {
  const length = headline.trim().length;

  if (length < 24) {
    return 124;
  }

  if (length < 42) {
    return 104;
  }

  if (length < 62) {
    return 88;
  }

  return 74;
};

export const splitCaptionText = (text: string): string[] => {
  const cleaned = text
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return [];
  }

  const sentenceChunks = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sentenceChunks.length > 1) {
    return sentenceChunks;
  }

  const wordChunks = cleaned.split(" ").filter(Boolean);
  if (wordChunks.length <= 4) {
    return [cleaned];
  }

  const chunkSize = wordChunks.length > 10 ? 5 : 4;
  const output: string[] = [];

  for (let index = 0; index < wordChunks.length; index += chunkSize) {
    output.push(wordChunks.slice(index, index + chunkSize).join(" "));
  }

  return output;
};

export const getBrandPalette = (props: SocialAdProps) => {
  return {
    primary: props.primaryColor,
    secondary: props.secondaryColor,
    accent: props.accentColor ?? "#F6E27A",
    text: props.textColor ?? "#F8FAFC",
    surface: props.surfaceColor ?? "#111827",
  };
};

const roleWeights: Record<SceneRole, number> = {
  hook: 1.35,
  pain: 1.1,
  solution: 1.05,
  proof: 1.2,
  offer: 1.05,
  cta: 1.0,
};

export const getSceneWeight = (role: SceneRole, override?: number): number => {
  if (override) {
    return override;
  }

  return roleWeights[role];
};

export const familyTransitionFrames = (
  family: TemplateFamily,
  fps: number,
): number => {
  switch (family) {
    case "proof-driven":
      return Math.round(fps * 0.45);
    case "problem-solution":
      return Math.round(fps * 0.4);
    case "story/testimonial":
      return Math.round(fps * 0.55);
    default:
      return Math.round(fps * 0.45);
  }
};
