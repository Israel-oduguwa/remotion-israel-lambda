import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BackgroundMedia } from "../atoms/BackgroundMedia";
import { BrandBadge } from "../atoms/BrandBadge";
import { CaptionBand } from "../atoms/CaptionBand";
import { CtaCard } from "../atoms/CtaCard";
import { HeadlineBlock } from "../atoms/HeadlineBlock";
import { ProofChip } from "../atoms/ProofChip";
import type { TimelineScene } from "../timeline";
import { getBrandPalette, hexToRgba } from "../utils";
import type { SocialAdProps } from "../schema";

type FamilySceneProps = {
  entry: TimelineScene;
  props: SocialAdProps;
  zoomSeed: number;
};

export const StoryTestimonialScene: React.FC<FamilySceneProps> = ({
  entry,
  props,
  zoomSeed,
}) => {
  const frame = useCurrentFrame();
  const palette = getBrandPalette(props);
  const quoteScale = interpolate(frame, [0, 18], [0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <BackgroundMedia
        mediaType={entry.mediaType}
        src={entry.scene.prefetchedLocalPath ?? entry.scene.mediaUrl}
        primaryColor={palette.secondary}
        secondaryColor={palette.accent}
        tintStrength={0.68}
        zoomSeed={zoomSeed}
      />
      <AbsoluteFill
        style={{
          padding: 68,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 24,
          }}
        >
          <BrandBadge
            brandName={props.brandName}
            logoUrl={props.logoUrl}
            primaryColor={palette.secondary}
            textColor={palette.text}
          />
          <ProofChip
            label={entry.scene.badgeLabel ?? "Student proof"}
            value={entry.scene.badgeValue}
            primaryColor={palette.secondary}
            textColor={palette.text}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            padding: 40,
            borderRadius: 44,
            background: `linear-gradient(180deg, ${hexToRgba(
              "#FFFFFF",
              0.16,
            )} 0%, ${hexToRgba("#08101F", 0.74)} 100%)`,
            border: `1px solid ${hexToRgba("#FFFFFF", 0.18)}`,
            transform: `scale(${quoteScale})`,
            boxShadow: `0 24px 80px ${hexToRgba(palette.secondary, 0.18)}`,
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            style={{
              color: palette.accent,
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 110,
              lineHeight: 0.7,
            }}
          >
            "
          </div>
          <HeadlineBlock
            eyebrow={entry.scene.role === "proof" ? "Student Story" : "Transformation"}
            headline={entry.scene.headline}
            supportingText={entry.scene.supportingText}
            accentColor={palette.accent}
            textColor={palette.text}
          />
          {entry.scene.role === "cta" ? (
            <CtaCard
              ctaLabel={props.ctaLabel}
              ctaUrl={props.ctaUrl}
              primaryColor={palette.accent}
              secondaryColor={palette.primary}
              textColor={palette.text}
            />
          ) : null}
        </div>
        <div
          style={{
            paddingBottom: 128,
          }}
        >
          <CaptionBand
            captions={entry.captions}
            textColor={palette.text}
            accentColor={palette.secondary}
            variant="band"
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
