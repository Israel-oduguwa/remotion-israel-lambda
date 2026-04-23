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

export const ProofDrivenScene: React.FC<FamilySceneProps> = ({
  entry,
  props,
  zoomSeed,
}) => {
  const frame = useCurrentFrame();
  const palette = getBrandPalette(props);
  const x = interpolate(frame, [0, 20], [50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <BackgroundMedia
        mediaType={entry.mediaType}
        src={entry.scene.prefetchedLocalPath ?? entry.scene.mediaUrl}
        primaryColor={palette.primary}
        secondaryColor={palette.secondary}
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
            transform: `translateX(${x}px)`,
          }}
        >
          <BrandBadge
            brandName={props.brandName}
            logoUrl={props.logoUrl}
            primaryColor={palette.primary}
            textColor={palette.text}
          />
          <ProofChip
            label={entry.scene.badgeLabel}
            value={entry.scene.badgeValue}
            primaryColor={palette.primary}
            textColor={palette.text}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 30,
          }}
        >
          <div
            style={{
              width: 180,
              height: 18,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${palette.primary} 0%, ${palette.secondary} 100%)`,
              boxShadow: `0 14px 32px ${hexToRgba(palette.primary, 0.34)}`,
            }}
          />
          <HeadlineBlock
            eyebrow={entry.scene.role.replace("/", " ")}
            headline={entry.scene.headline}
            supportingText={entry.scene.supportingText}
            accentColor={palette.accent}
            textColor={palette.text}
          />
          {entry.scene.role === "cta" ? (
            <CtaCard
              ctaLabel={props.ctaLabel}
              ctaUrl={props.ctaUrl}
              primaryColor={palette.primary}
              secondaryColor={palette.secondary}
              textColor={palette.text}
            />
          ) : null}
        </div>
        <div
          style={{
            paddingBottom: 136,
          }}
        >
          <CaptionBand
            captions={entry.captions}
            textColor={palette.text}
            accentColor={palette.primary}
            variant="band"
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
