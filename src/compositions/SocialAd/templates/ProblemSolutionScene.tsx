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

export const ProblemSolutionScene: React.FC<FamilySceneProps> = ({
  entry,
  props,
  zoomSeed,
}) => {
  const frame = useCurrentFrame();
  const palette = getBrandPalette(props);
  const cardRise = interpolate(frame, [0, 18], [90, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <BackgroundMedia
        mediaType={entry.mediaType}
        src={entry.scene.prefetchedLocalPath ?? entry.scene.mediaUrl}
        primaryColor={palette.secondary}
        secondaryColor={palette.primary}
        tintStrength={0.88}
        zoomSeed={zoomSeed}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${hexToRgba(
            "#050816",
            0.08,
          )} 0%, ${hexToRgba("#050816", 0.82)} 48%, ${hexToRgba(
            "#050816",
            0.96,
          )} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          padding: 68,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <BrandBadge
          brandName={props.brandName}
          logoUrl={props.logoUrl}
          primaryColor={palette.secondary}
          textColor={palette.text}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            transform: `translateY(${cardRise}px)`,
            padding: 40,
            borderRadius: 42,
            backgroundColor: hexToRgba("#08101F", 0.72),
            border: `1px solid ${hexToRgba("#FFFFFF", 0.12)}`,
            boxShadow: `0 28px 90px ${hexToRgba(palette.secondary, 0.18)}`,
            backdropFilter: "blur(18px)",
          }}
        >
          <ProofChip
            label={entry.scene.badgeLabel ?? "Why this works"}
            value={entry.scene.badgeValue}
            primaryColor={palette.accent}
            textColor={palette.text}
          />
          <HeadlineBlock
            eyebrow={
              entry.scene.role === "pain"
                ? "Stop Losing Attention"
                : entry.scene.role === "solution"
                  ? "Give Them A Clear Next Step"
                  : entry.scene.role
            }
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
              secondaryColor={palette.secondary}
              textColor={palette.text}
            />
          ) : null}
        </div>
        <div
          style={{
            paddingBottom: 132,
          }}
        >
          <CaptionBand
            captions={entry.captions}
            textColor="#04111D"
            accentColor={palette.accent}
            variant="kinetic"
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
