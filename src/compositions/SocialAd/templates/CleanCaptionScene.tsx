import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BackgroundMedia } from "../atoms/BackgroundMedia";
import { CaptionBand } from "../atoms/CaptionBand";
import type { TimelineScene } from "../timeline";
import { getBrandPalette, hexToRgba } from "../utils";
import type { SocialAdProps } from "../schema";

type FamilySceneProps = {
  entry: TimelineScene;
  props: SocialAdProps;
  zoomSeed: number;
};

export const CleanCaptionScene: React.FC<FamilySceneProps> = ({
  entry,
  props,
  zoomSeed,
}) => {
  const frame = useCurrentFrame();
  const palette = getBrandPalette(props);
  const sweepX = interpolate(frame, [0, 80], [-220, 920], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sweepRotate = interpolate(frame, [0, 80], [-14, 10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const captionLift = interpolate(frame, [0, 14], [30, 0], {
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
        tintStrength={0.2}
        zoomSeed={zoomSeed}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${hexToRgba(
            "#020617",
            0.02,
          )} 0%, transparent 40%, ${hexToRgba("#020617", 0.3)} 72%, ${hexToRgba(
            "#020617",
            0.58,
          )} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          mixBlendMode: "screen",
          opacity: 0.55,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            left: sweepX,
            width: 340,
            height: 2400,
            transform: `rotate(${sweepRotate}deg)`,
            background: `linear-gradient(180deg, transparent 0%, ${hexToRgba(
              palette.secondary,
              0.15,
            )} 30%, ${hexToRgba("#FFFFFF", 0.1)} 52%, transparent 76%)`,
            filter: "blur(24px)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          padding: "0 54px 150px",
          transform: `translateY(${captionLift}px)`,
        }}
      >
        <CaptionBand
          captions={entry.captions}
          textColor="#F8FAFC"
          accentColor={palette.secondary}
          variant="social"
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
