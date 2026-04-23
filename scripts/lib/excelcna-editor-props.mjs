const ALLOWED_ROLES = new Set(["hook", "pain", "solution", "proof", "offer", "cta"]);
const ALLOWED_TRANSITIONS = new Set(["slide", "wipe", "fade"]);
const ALLOWED_MEDIA_TYPES = new Set(["image", "video"]);
const ALLOWED_CAPTION_TYPES = new Set(["phrase", "pause", "emphasis", "cta"]);
const ALLOWED_CAPTION_EFFECTS = new Set(["auto", "type", "pop", "glow", "scatter"]);
const ALLOWED_OVERLAY_TYPES = new Set([
  "underline_sweep",
  "glow_blob",
  "ring_pulse",
  "highlight_box",
  "scribble_draw",
]);

export const clean = (value, fallback = "") => {
  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value).trim();
};

export const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

export const parseJson = (value, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const makeId = (prefix, index) =>
  `${prefix}-${String(index + 1).padStart(2, "0")}`;

export const slugify = (value, fallback = "render") =>
  clean(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;

const normalizeOverlay = (overlay, sceneStartMs, sceneEndMs, index) => {
  const type = clean(overlay.type || overlay.overlay_type);
  if (!ALLOWED_OVERLAY_TYPES.has(type)) {
    return null;
  }

  const startMs = toNumber(overlay.startMs ?? overlay.start_ms, sceneStartMs);
  const endMs = Math.max(
    startMs + 1,
    toNumber(overlay.endMs ?? overlay.end_ms, Math.min(sceneEndMs, startMs + 800)),
  );

  return {
    id: clean(overlay.id, `overlay-${index + 1}`),
    type,
    startMs,
    endMs,
    x: overlay.x !== undefined ? toNumber(overlay.x) : undefined,
    y: overlay.y !== undefined ? toNumber(overlay.y) : undefined,
    width: overlay.width !== undefined ? toNumber(overlay.width) : undefined,
    height: overlay.height !== undefined ? toNumber(overlay.height) : undefined,
    color: clean(overlay.color || overlay.color_hint) || undefined,
    target:
      clean(overlay.target) === "frame"
        ? "frame"
        : clean(overlay.target) === "caption"
          ? "caption"
          : undefined,
  };
};

const normalizeScene = (scene, index) => {
  const startMs = toNumber(scene.startMs, 0);
  const endMs = Math.max(startMs + 1, toNumber(scene.endMs, startMs + 1000));
  const overlaysRaw = Array.isArray(scene.overlays)
    ? scene.overlays
    : parseJson(scene.overlays_json, []);

  return {
    id: clean(scene.id, makeId("scene", index)),
    role: ALLOWED_ROLES.has(clean(scene.role)) ? clean(scene.role) : "solution",
    startMs,
    endMs,
    mediaUrl: clean(scene.mediaUrl || scene.media_url || scene.scene_asset_url),
    mediaType: ALLOWED_MEDIA_TYPES.has(clean(scene.mediaType || scene.media_type))
      ? clean(scene.mediaType || scene.media_type)
      : "image",
    headline: clean(scene.headline) || undefined,
    transition: ALLOWED_TRANSITIONS.has(clean(scene.transition))
      ? clean(scene.transition)
      : "fade",
    overlays: overlaysRaw
      .map((overlay, overlayIndex) =>
        normalizeOverlay(overlay, startMs, endMs, overlayIndex),
      )
      .filter(Boolean),
  };
};

const normalizeCaption = (caption, index) => {
  const startMs = toNumber(caption.startMs, 0);
  const endMs = Math.max(startMs + 1, toNumber(caption.endMs, startMs + 100));
  const type = clean(caption.type || "phrase");
  const effect = clean(caption.effect || "auto");

  return {
    id: clean(caption.id, makeId("caption", index)),
    text: clean(caption.text),
    startMs,
    endMs,
    type: ALLOWED_CAPTION_TYPES.has(type) ? type : "phrase",
    effect: ALLOWED_CAPTION_EFFECTS.has(effect) ? effect : "auto",
  };
};

export const normalizeExcelCnaEditorProps = (input) => {
  const source = input?.excelCnaEditorProps || input?.props || input?.payload || input;
  const brand = source.brand || {};
  const scenesInput = Array.isArray(source.scenes) ? source.scenes : [];
  const captionsInput = Array.isArray(source.captions) ? source.captions : [];

  if (!scenesInput.length) {
    throw new Error("Payload is missing a non-empty scenes array.");
  }

  if (!captionsInput.length) {
    throw new Error("Payload is missing a non-empty captions array.");
  }

  const props = {
    adId: clean(
      source.adId ||
        source.ad_id ||
        `${clean(source.week_id, "manual")}-${clean(source.action_id, "render")}`,
    ),
    brandName: clean(source.brandName || brand.brandName, "ExcelCNA"),
    voiceoverUrl: clean(
      source.voiceoverUrl ||
        source.voiceover_url ||
        source.voiceoverPublicUrl ||
        source.voiceover_public_url,
    ),
    musicUrl: clean(source.musicUrl || source.music_url) || undefined,
    musicVolume:
      source.musicVolume !== undefined ? toNumber(source.musicVolume, 0.1) : undefined,
    primaryColor: clean(source.primaryColor || brand.primaryColor, "#0E7490"),
    secondaryColor: clean(source.secondaryColor || brand.secondaryColor, "#F59E0B"),
    textColor: clean(source.textColor || brand.textColor, "#F8FAFC"),
    accentColor: clean(source.accentColor || brand.accentColor, "#FDE68A"),
    surfaceColor: clean(source.surfaceColor || brand.surfaceColor, "#08101F"),
    scenes: scenesInput.map(normalizeScene),
    captions: captionsInput.map(normalizeCaption),
  };

  if (!props.voiceoverUrl) {
    throw new Error("Payload is missing voiceoverUrl.");
  }

  if (props.scenes.some((scene) => !scene.mediaUrl)) {
    throw new Error("At least one scene is missing mediaUrl.");
  }

  return props;
};

export const getLastCaptionEndMs = (props) =>
  Math.max(...props.captions.map((caption) => caption.endMs), 1000);
