import { zColor } from "@remotion/zod-types";
import { z } from "zod";

const captionEffectValues = ["auto", "type", "pop", "glow", "scatter"] as const;
const captionTypeValues = ["phrase", "pause", "emphasis", "cta"] as const;
const overlayTypeValues = [
  "underline_sweep",
  "glow_blob",
  "ring_pulse",
  "highlight_box",
  "scribble_draw",
] as const;
const transitionValues = ["slide", "wipe", "fade"] as const;
const mediaTypeValues = ["image", "video"] as const;
const roleValues = ["hook", "pain", "solution", "proof", "offer", "cta"] as const;

export const EditorCaptionSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    text: z.string(),
    startMs: z.number().nonnegative(),
    endMs: z.number().nonnegative(),
    type: z.enum(captionTypeValues).default("phrase"),
    effect: z.enum(captionEffectValues).default("auto"),
  })
  .refine((value) => value.endMs > value.startMs, {
    message: "Caption endMs must be greater than startMs",
    path: ["endMs"],
  });

export const EditorOverlaySchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    type: z.enum(overlayTypeValues),
    startMs: z.number().nonnegative(),
    endMs: z.number().nonnegative(),
    x: z.number().min(0).max(100).optional(),
    y: z.number().min(0).max(100).optional(),
    width: z.number().min(0).max(100).optional(),
    height: z.number().min(0).max(100).optional(),
    color: zColor().optional(),
    target: z.enum(["caption", "frame"]).optional(),
  })
  .refine((value) => value.endMs > value.startMs, {
    message: "Overlay endMs must be greater than startMs",
    path: ["endMs"],
  });

export const EditorSceneSchema = z
  .object({
    id: z.string().trim().min(1),
    role: z.enum(roleValues),
    startMs: z.number().nonnegative(),
    endMs: z.number().nonnegative(),
    mediaUrl: z.url(),
    mediaType: z.enum(mediaTypeValues).default("image"),
    headline: z.string().trim().min(1).optional(),
    transition: z.enum(transitionValues).default("fade"),
    overlays: z.array(EditorOverlaySchema).optional(),
  })
  .refine((value) => value.endMs > value.startMs, {
    message: "Scene endMs must be greater than startMs",
    path: ["endMs"],
  });

export const ExcelCNAEditorSchema = z.object({
  adId: z.string().trim().min(1),
  brandName: z.string().trim().min(1),
  voiceoverUrl: z.url(),
  musicUrl: z.url().optional(),
  musicVolume: z.number().min(0).max(1).optional(),
  primaryColor: zColor(),
  secondaryColor: zColor(),
  textColor: zColor().optional(),
  accentColor: zColor().optional(),
  surfaceColor: zColor().optional(),
  scenes: z.array(EditorSceneSchema).min(1),
  captions: z.array(EditorCaptionSchema).min(1),
});

export type ExcelCNAEditorProps = z.infer<typeof ExcelCNAEditorSchema>;
export type EditorScene = z.infer<typeof EditorSceneSchema>;
export type EditorCaption = z.infer<typeof EditorCaptionSchema>;
export type EditorOverlay = z.infer<typeof EditorOverlaySchema>;
export type CaptionEffect = (typeof captionEffectValues)[number];
export type CaptionType = (typeof captionTypeValues)[number];
export type OverlayType = (typeof overlayTypeValues)[number];
export type TransitionType = (typeof transitionValues)[number];
