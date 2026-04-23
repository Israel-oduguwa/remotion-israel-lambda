import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { TimelineScene } from "../SocialAd/timeline";
import type { SocialAdProps } from "../SocialAd/schema";
import { getBrandPalette, hexToRgba, seededIndex } from "../SocialAd/utils";

type SceneProps = {
  entry: TimelineScene;
  props: SocialAdProps;
  zoomSeed: number;
  sceneIndex: number;
};

// ─────────────────────────────────────────────────────────
// IMAGE ANIMATION VARIANTS (6) — Warm, cinematic, emotional
// ─────────────────────────────────────────────────────────

const ImageV0: React.FC<{ src: string; mediaType: "image" | "video" }> = ({ src, mediaType }) => {
  // Soft Ken Burns: slow upward drift + gentle zoom-in
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 120], [1.06, 1.13], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ty = interpolate(frame, [0, 120], [30, -10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });
  const brightnessIn = interpolate(frame, [0, 18], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const Media = mediaType === "video" ? OffthreadVideo : Img;
  return (
    <AbsoluteFill>
      <Media
        src={src}
        {...(mediaType === "video" ? { muted: true } : {})}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translateY(${ty}px)`,
          filter: `saturate(1.05) contrast(1.02) brightness(${brightnessIn * 0.88})`,
        }}
      />
    </AbsoluteFill>
  );
};

const ImageV1: React.FC<{ src: string; mediaType: "image" | "video" }> = ({ src, mediaType }) => {
  // Cross-dissolve: fade in from dark to full
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, Math.round(fps * 0.65)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.6, 1),
  });
  const scale = interpolate(frame, [0, 120], [1.06, 1.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const Media = mediaType === "video" ? OffthreadVideo : Img;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#030812" }} />
      <AbsoluteFill style={{ opacity }}>
        <Media
          src={src}
          {...(mediaType === "video" ? { muted: true } : {})}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
            filter: "saturate(1.08) contrast(1.03) brightness(0.86)",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ImageV2: React.FC<{ src: string; mediaType: "image" | "video"; palette: { primary: string; secondary: string } }> = ({ src, mediaType }) => {
  // Center zoom + vignette expand
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 120], [1.18, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vignetteOpacity = interpolate(frame, [0, 20], [0.85, 0.38], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const Media = mediaType === "video" ? OffthreadVideo : Img;
  return (
    <AbsoluteFill>
      <Media
        src={src}
        {...(mediaType === "video" ? { muted: true } : {})}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          filter: "saturate(1.06) contrast(1.04) brightness(0.9)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, ${hexToRgba("#020617", vignetteOpacity)} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const ImageV3: React.FC<{ src: string; mediaType: "image" | "video"; palette: { secondary: string } }> = ({ src, mediaType, palette }) => {
  // Left-to-right light sweep as image reveals
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sweepX = interpolate(frame, [0, Math.round(fps * 1.2)], [-30, 130], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.6, 1),
  });
  const scale = interpolate(frame, [0, 120], [1.06, 1.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const Media = mediaType === "video" ? OffthreadVideo : Img;
  return (
    <AbsoluteFill>
      <Media
        src={src}
        {...(mediaType === "video" ? { muted: true } : {})}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          filter: "saturate(1.1) contrast(1.02) brightness(0.85)",
        }}
      />
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          pointerEvents: "none",
          opacity: 0.5,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${sweepX}%`,
            width: "25%",
            height: "100%",
            background: `linear-gradient(90deg, transparent 0%, ${hexToRgba(palette.secondary, 0.5)} 40%, ${hexToRgba("#FFFFFF", 0.3)} 50%, transparent 100%)`,
            filter: "blur(28px)",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ImageV4: React.FC<{ src: string; mediaType: "image" | "video" }> = ({ src, mediaType }) => {
  // Zoom-out settle: 1.3 → 1.0 (feels like pulling back to reveal the scene)
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 90, mass: 1.5 },
    from: 1.32,
    to: 1.05,
  });
  const Media = mediaType === "video" ? OffthreadVideo : Img;
  return (
    <AbsoluteFill>
      <Media
        src={src}
        {...(mediaType === "video" ? { muted: true } : {})}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          filter: "saturate(1.08) contrast(1.04) brightness(0.87)",
        }}
      />
    </AbsoluteFill>
  );
};

const ImageV5: React.FC<{ src: string; mediaType: "image" | "video" }> = ({ src, mediaType }) => {
  // Subtle sway rotation -1° → +1° (feels alive and breathing)
  const frame = useCurrentFrame();
  const rotate = interpolate(frame, [0, 60, 120], [-0.8, 0.4, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.5, 0, 0.5, 1),
  });
  const scale = interpolate(frame, [0, 120], [1.08, 1.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const Media = mediaType === "video" ? OffthreadVideo : Img;
  return (
    <AbsoluteFill>
      <Media
        src={src}
        {...(mediaType === "video" ? { muted: true } : {})}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) rotate(${rotate}deg)`,
          filter: "saturate(1.06) contrast(1.03) brightness(0.88)",
        }}
      />
    </AbsoluteFill>
  );
};

type ImageVariantProps = { src: string; mediaType: "image" | "video"; palette: { primary: string; secondary: string } };
const imageVariantFns: React.FC<ImageVariantProps>[] = [
  ({ src, mediaType }) => <ImageV0 src={src} mediaType={mediaType} />,
  ({ src, mediaType }) => <ImageV1 src={src} mediaType={mediaType} />,
  ({ src, mediaType, palette }) => <ImageV2 src={src} mediaType={mediaType} palette={palette} />,
  ({ src, mediaType, palette }) => <ImageV3 src={src} mediaType={mediaType} palette={palette} />,
  ({ src, mediaType }) => <ImageV4 src={src} mediaType={mediaType} />,
  ({ src, mediaType }) => <ImageV5 src={src} mediaType={mediaType} />,
];

// ─────────────────────────────────────────────────────────
// CAPTION VARIANTS (5) — Emotional, warm, varied
// ─────────────────────────────────────────────────────────

type CaptionProps = {
  text: string;
  startFrame: number;
  endFrame: number;
  accentColor: string;
  textColor: string;
};

// Variant 0: Line-by-line word fade — soft staggered opacity (gentle, warm)
const SGCaptionV0: React.FC<CaptionProps> = ({ text, startFrame, endFrame, accentColor, textColor }) => {
  const frame = useCurrentFrame();
  const words = text.trim().split(/\s+/);
  const duration = Math.max(endFrame - startFrame, words.length * 6);
  const framesPerWord = Math.max(5, Math.floor(duration / words.length));
  const localFrame = frame - startFrame;

  const containerOpacity = interpolate(frame, [startFrame, startFrame + 8, endFrame - 8, endFrame], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: containerOpacity,
        display: "flex",
        flexWrap: "wrap",
        gap: "0.12em 0.3em",
        justifyContent: "center",
        padding: "24px 36px 28px",
        borderRadius: 40,
        background: hexToRgba("#03080E", 0.55),
        border: `1px solid ${hexToRgba("#FFFFFF", 0.1)}`,
        backdropFilter: "blur(24px)",
        boxShadow: `0 26px 80px ${hexToRgba("#000000", 0.28)}, inset 0 0 80px ${hexToRgba(accentColor, 0.04)}`,
        maxWidth: 880,
      }}
    >
      {words.map((word, i) => {
        const wordAppear = Math.max(localFrame - i * framesPerWord, 0);
        const wordOpacity = interpolate(wordAppear, [0, 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        });
        const wordTy = interpolate(wordAppear, [0, 10], [16, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        });
        return (
          <span
            key={`sg0-${startFrame}-${i}`}
            style={{
              color: textColor,
              fontFamily: '"Montserrat", "Avenir Next", sans-serif',
              fontWeight: 700,
              fontSize: 52,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              opacity: wordOpacity,
              transform: `translateY(${wordTy}px)`,
              display: "inline-block",
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// Variant 1: Glow burst — text appears with radial glow that pulses in
const SGCaptionV1: React.FC<CaptionProps> = ({ text, startFrame, endFrame, accentColor, textColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glowScale = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 1 },
    from: 2.2,
    to: 1,
  });
  const glowOpacity = interpolate(frame, [startFrame, startFrame + 8, endFrame - 8, endFrame], [0, 0.7, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = interpolate(frame, [startFrame, startFrame + 10, endFrame - 8, endFrame], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textScale = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 18, stiffness: 160, mass: 0.8 },
    from: 0.82,
    to: 1,
  });

  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center", maxWidth: 900 }}>
      {/* Glow circle behind text */}
      <div
        style={{
          position: "absolute",
          inset: -60,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${hexToRgba(accentColor, 0.4)} 0%, transparent 70%)`,
          transform: `scale(${glowScale})`,
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          opacity: textOpacity,
          transform: `scale(${textScale})`,
          position: "relative",
          padding: "22px 32px 26px",
          borderRadius: 36,
          background: hexToRgba("#050E1E", 0.65),
          border: `1px solid ${hexToRgba(accentColor, 0.28)}`,
          boxShadow: `0 24px 70px ${hexToRgba("#000000", 0.35)}, 0 0 80px ${hexToRgba(accentColor, 0.15)}`,
          backdropFilter: "blur(20px)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: textColor,
            fontFamily: '"Montserrat", "Avenir Next", sans-serif',
            fontWeight: 800,
            fontSize: 52,
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            textShadow: `0 0 40px ${hexToRgba(accentColor, 0.5)}, 0 4px 20px rgba(0,0,0,0.5)`,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

// Variant 2: Scale-in sentence — scales from 0.8 → 1.0 with fade
const SGCaptionV2: React.FC<CaptionProps> = ({ text, startFrame, endFrame, accentColor, textColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20, stiffness: 200, mass: 0.9 },
    from: 0.78,
    to: 1,
  });
  const opacity = interpolate(frame, [startFrame, startFrame + 10, endFrame - 8, endFrame], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Gradient line accent
  const progressWidth = interpolate(frame, [startFrame, endFrame], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        padding: "20px 32px 24px",
        borderRadius: 38,
        background: hexToRgba("#040B18", 0.72),
        border: `1px solid ${hexToRgba("#FFFFFF", 0.12)}`,
        boxShadow: `0 22px 65px ${hexToRgba("#000000", 0.35)}`,
        backdropFilter: "blur(22px)",
        maxWidth: 900,
        overflow: "hidden",
      }}
    >
      {/* Progress bar at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 5,
          width: `${progressWidth}%`,
          background: `linear-gradient(90deg, ${accentColor} 0%, #FFFFFF 100%)`,
          borderRadius: "0 4px 4px 0",
          opacity: 0.7,
        }}
      />
      <div
        style={{
          color: textColor,
          fontFamily: '"Montserrat", "Avenir Next", sans-serif',
          fontWeight: 800,
          fontSize: 50,
          lineHeight: 1.12,
          letterSpacing: "-0.02em",
          textShadow: `0 0 24px ${hexToRgba(accentColor, 0.25)}, 0 3px 16px rgba(0,0,0,0.45)`,
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Variant 3: Blur-to-sharp — starts blurred (emotional haze), snaps crisp
const SGCaptionV3: React.FC<CaptionProps> = ({ text, startFrame, endFrame, accentColor, textColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const blur = interpolate(frame, [startFrame, startFrame + Math.round(fps * 0.5)], [22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  const opacity = interpolate(frame, [startFrame, startFrame + 6, endFrame - 8, endFrame], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ty = interpolate(frame, [startFrame, startFrame + Math.round(fps * 0.4)], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  return (
    <div
      style={{
        opacity,
        filter: `blur(${blur}px)`,
        transform: `translateY(${ty}px)`,
        padding: "24px 34px 28px",
        borderRadius: 38,
        background: `linear-gradient(135deg, ${hexToRgba(accentColor, 0.12)} 0%, ${hexToRgba("#04090F", 0.76)} 100%)`,
        border: `1px solid ${hexToRgba(accentColor, 0.22)}`,
        boxShadow: `0 28px 90px ${hexToRgba("#000000", 0.4)}, 0 0 40px ${hexToRgba(accentColor, 0.08)}`,
        backdropFilter: "blur(24px)",
        maxWidth: 900,
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: textColor,
          fontFamily: '"Montserrat", "Avenir Next", sans-serif',
          fontWeight: 700,
          fontSize: 52,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          textShadow: `0 0 32px ${hexToRgba(accentColor, 0.35)}, 0 4px 20px rgba(0,0,0,0.5)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Variant 4: Ink drop — character-by-character opacity reveal (no cursor)
const SGCaptionV4: React.FC<CaptionProps> = ({ text, startFrame, endFrame, accentColor, textColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = endFrame - startFrame;
  const revealTo = Math.round(duration * 0.7);
  const charsToShow = Math.floor(
    interpolate(frame, [startFrame, startFrame + revealTo], [0, text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.4, 0.0, 0.6, 1),
    }),
  );
  const containerOpacity = interpolate(frame, [startFrame, startFrame + 6, endFrame - 8, endFrame], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 22, stiffness: 180 },
    from: 0.94,
    to: 1,
  });

  return (
    <div
      style={{
        opacity: containerOpacity,
        transform: `scale(${scale})`,
        padding: "22px 36px 26px",
        borderRadius: 36,
        background: hexToRgba("#030912", 0.68),
        border: `1px solid ${hexToRgba("#FFFFFF", 0.1)}`,
        boxShadow: `0 24px 80px ${hexToRgba("#000000", 0.35)}`,
        backdropFilter: "blur(22px)",
        maxWidth: 900,
        textAlign: "center",
      }}
    >
      <span
        style={{
          color: textColor,
          fontFamily: '"Montserrat", "Avenir Next", sans-serif',
          fontWeight: 700,
          fontSize: 52,
          lineHeight: 1.1,
          letterSpacing: "-0.018em",
          textShadow: `0 0 28px ${hexToRgba(accentColor, 0.3)}, 0 4px 20px rgba(0,0,0,0.5)`,
        }}
      >
        {text.slice(0, charsToShow)}
        <span style={{ opacity: 0 }}>{text.slice(charsToShow)}</span>
      </span>
    </div>
  );
};

const captionVariants = [SGCaptionV0, SGCaptionV1, SGCaptionV2, SGCaptionV3, SGCaptionV4];

// ─────────────────────────────────────────────────────────
// ACTIVE CAPTION RENDERER
// ─────────────────────────────────────────────────────────

const ActiveCaption: React.FC<{
  captions: TimelineScene["captions"];
  accentColor: string;
  textColor: string;
  sceneId: string;
}> = ({ captions, accentColor, textColor, sceneId }) => {
  const frame = useCurrentFrame();
  const activeCaption = captions.find((c) => frame >= c.startFrame && frame <= c.endFrame) ?? null;
  if (!activeCaption) return null;
  const idx = captions.indexOf(activeCaption);
  const variantIdx = seededIndex(`${sceneId}-sgcap-${idx}`, captionVariants.length);
  const CaptionComponent = captionVariants[variantIdx];
  return (
    <CaptionComponent
      text={activeCaption.text}
      startFrame={activeCaption.startFrame}
      endFrame={activeCaption.endFrame}
      accentColor={accentColor}
      textColor={textColor}
    />
  );
};

// ─────────────────────────────────────────────────────────
// SFX LAYER
// ─────────────────────────────────────────────────────────

const SceneSFX: React.FC<{ sceneRole: string; captions: TimelineScene["captions"]; sceneId: string }> = ({
  sceneRole,
  captions,
}) => {
  return (
    <>
      {/* Woosh on scene entry */}
      <Audio
        src={staticFile("assets/fx/Woosh Effect.mp3")}
        volume={0.32}
        startFrom={0}
      />
      {/* Blink on first caption appear */}
      {captions.length > 0 && (
        <Sequence from={captions[0].startFrame} layout="none">
          <Audio
            src={staticFile("assets/fx/universfield-cartoon-blinking-487897.mp3")}
            volume={0.18}
          />
        </Sequence>
      )}
      {/* Pop on CTA */}
      {sceneRole === "cta" && (
        <Sequence from={10} layout="none">
          <Audio
            src={staticFile("assets/fx/dragon-studio-pop-402324.mp3")}
            volume={0.42}
          />
        </Sequence>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN SCENE COMPONENT
// ─────────────────────────────────────────────────────────

export const StoryGlowScene: React.FC<SceneProps> = ({ entry, props, sceneIndex }) => {
  const frame = useCurrentFrame();
  const palette = getBrandPalette(props);

  const imageVariantIdx = seededIndex(`${props.adId}-sg-img-${sceneIndex}`, imageVariantFns.length);
  const ImageVariant = imageVariantFns[imageVariantIdx];

  const src = entry.scene.prefetchedLocalPath ?? entry.scene.mediaUrl;

  // Warm vignette overlay
  const vignetteOpacity = interpolate(frame, [0, 20], [0.6, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      {/* Background image with variant */}
      <ImageVariant src={src} mediaType={entry.mediaType} palette={palette} />

      {/* Warm bottom gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(
            180deg,
            ${hexToRgba("#030812", 0.06)} 0%,
            transparent 25%,
            ${hexToRgba("#030812", 0.22)} 60%,
            ${hexToRgba("#030812", 0.78)} 100%
          )`,
        }}
      />

      {/* Warm color wash from primary color */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at bottom left, ${hexToRgba(palette.primary, 0.18)} 0%, transparent 55%)`,
          mixBlendMode: "soft-light",
        }}
      />

      {/* Corner vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 45%, ${hexToRgba("#020617", vignetteOpacity)} 100%)`,
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          padding: "60px 58px 136px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        {/* Caption */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ActiveCaption
            captions={entry.captions}
            accentColor={palette.accent}
            textColor={palette.text}
            sceneId={entry.scene.id}
          />
        </div>
      </AbsoluteFill>

      {/* SFX */}
      <SceneSFX sceneRole={entry.scene.role} captions={entry.captions} sceneId={entry.scene.id} />
    </AbsoluteFill>
  );
};
