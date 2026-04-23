import { zColor } from "@remotion/zod-types";
import { z } from "zod";

export const sceneRoleValues = [
  "hook",
  "pain",
  "solution",
  "proof",
  "offer",
  "cta",
] as const;

export const templateFamilyValues = [
  "proof-driven",
  "problem-solution",
  "story/testimonial",
] as const;

export const mediaTypeValues = ["image", "video"] as const;

const captionTextSchema = z.string().trim().min(1).max(180);

export const TimedCaptionSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    sceneId: z.string().trim().min(1).optional(),
    text: captionTextSchema,
    startMs: z.number().nonnegative(),
    endMs: z.number().positive(),
  })
  .refine((value) => value.endMs > value.startMs, {
    message: "Timed caption endMs must be greater than startMs",
    path: ["endMs"],
  });

export const PhraseCaptionSchema = z.object({
  id: z.string().trim().min(1).optional(),
  sceneId: z.string().trim().min(1).optional(),
  text: captionTextSchema,
});

export const SceneSchema = z.object({
  id: z.string().trim().min(1),
  role: z.enum(sceneRoleValues),
  headline: z.string().trim().min(4).max(120),
  supportingText: z.string().trim().min(8).max(240),
  badgeLabel: z.string().trim().min(1).max(24).optional(),
  badgeValue: z.string().trim().min(1).max(36).optional(),
  mediaUrl: z.url(),
  mediaType: z.enum(mediaTypeValues).optional(),
  captionText: captionTextSchema.optional(),
  weight: z.number().min(0.5).max(2.5).optional(),
  prefetchedLocalPath: z.string().trim().min(1).optional(),
});

export const SocialAdSchema = z
  .object({
    adId: z.string().trim().min(1),
    campaignId: z.string().trim().min(1).optional(),
    templateFamily: z.enum(templateFamilyValues),
    brandName: z.string().trim().min(2).max(60),
    ctaLabel: z.string().trim().min(2).max(40),
    ctaUrl: z.url(),
    trackingSlug: z.string().trim().min(1).max(80).optional(),
    aspectRatio: z.enum(["9:16", "1:1", "16:9"]).optional(),
    logoUrl: z.url(),
    primaryColor: zColor(),
    secondaryColor: zColor(),
    textColor: zColor().optional(),
    accentColor: zColor().optional(),
    surfaceColor: zColor().optional(),
    voiceoverUrl: z.url(),
    targetDurationSec: z.number().min(10).max(90).optional(),
    prefetchedLocalPath: z.string().trim().min(1).optional(),
    scenes: z.array(SceneSchema).min(3).max(8),
    captions: z
      .object({
        timed: z.array(TimedCaptionSchema).min(1).optional(),
        phrases: z.array(PhraseCaptionSchema).min(1).optional(),
      })
      .optional(),
  })
  .superRefine((value, ctx) => {
    const hasProofScene = value.scenes.some((scene) => scene.role === "proof");
    const hasCtaScene = value.scenes.some((scene) => scene.role === "cta");
    const hasHookScene = value.scenes.some((scene) => scene.role === "hook");

    if (!hasHookScene) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one hook scene is required",
        path: ["scenes"],
      });
    }

    if (!hasProofScene) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one proof scene is required",
        path: ["scenes"],
      });
    }

    if (!hasCtaScene) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one CTA scene is required",
        path: ["scenes"],
      });
    }
  });

export type SocialAdProps = z.infer<typeof SocialAdSchema>;
export type SceneRole = (typeof sceneRoleValues)[number];
export type TemplateFamily = (typeof templateFamilyValues)[number];
export type MediaType = (typeof mediaTypeValues)[number];
export type TimedCaption = z.infer<typeof TimedCaptionSchema>;
export type PhraseCaption = z.infer<typeof PhraseCaptionSchema>;
export type SocialAdScene = z.infer<typeof SceneSchema>;
