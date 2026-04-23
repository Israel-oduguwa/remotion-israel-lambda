import { AbsoluteFill, Img, interpolate, OffthreadVideo, useCurrentFrame } from "remotion";
import { hexToRgba } from "../utils";

type BackgroundMediaProps = {
  mediaType: "image" | "video";
  src: string;
  primaryColor: string;
  secondaryColor: string;
  tintStrength?: number;
  zoomSeed: number;
};

export const BackgroundMedia: React.FC<BackgroundMediaProps> = ({
  mediaType,
  src,
  primaryColor,
  secondaryColor,
  tintStrength = 0.75,
  zoomSeed,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 90], [1.04, 1.1 + zoomSeed * 0.008], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, 120], [0, -22 - zoomSeed * 1.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateX = interpolate(frame, [0, 120], [0, 12 - zoomSeed * 2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rotate = interpolate(frame, [0, 120], [0, (zoomSeed % 2 === 0 ? -0.7 : 0.7)], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const Media = mediaType === "video" ? OffthreadVideo : Img;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}deg)`,
        }}
      >
        <Media
          src={src}
          {...(mediaType === "video" ? { muted: true } : {})}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "saturate(1.08) contrast(1.04) brightness(0.92)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${hexToRgba(
            primaryColor,
            tintStrength * 0.12,
          )} 0%, ${hexToRgba("#050816", 0.08)} 35%, ${hexToRgba(
            "#050816",
            0.48,
          )} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at top right, ${hexToRgba(
            secondaryColor,
            0.18,
          )} 0%, transparent 38%)`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
