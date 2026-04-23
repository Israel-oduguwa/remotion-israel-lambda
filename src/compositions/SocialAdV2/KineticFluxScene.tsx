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
// IMAGE ANIMATION VARIANTS (6)
// ─────────────────────────────────────────────────────────

const ImageVariant0: React.FC<{ src: string; mediaType: "image" | "video" }> = ({ src, mediaType }) => {
  // Ken Burns: zoom-in + rightward pan
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 120], [1.04, 1.14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tx = interpolate(frame, [0, 120], [0, 28], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
          transform: `scale(${scale}) translateX(${tx}px)`,
          filter: "saturate(1.1) contrast(1.05) brightness(0.88)",
        }}
      />
    </AbsoluteFill>
  );
};

const ImageVariant1: React.FC<{ src: string; mediaType: "image" | "video" }> = ({ src, mediaType }) => {
  // Ken Burns: zoom-out + leftward pan
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 120], [1.18, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tx = interpolate(frame, [0, 120], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
          transform: `scale(${scale}) translateX(-${tx}px)`,
          filter: "saturate(1.08) contrast(1.04) brightness(0.86)",
        }}
      />
    </AbsoluteFill>
  );
};

const ImageVariant2: React.FC<{ src: string; mediaType: "image" | "video" }> = ({ src, mediaType }) => {
  // Vertical slide-reveal: image slides up from bottom
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ty = interpolate(frame, [0, Math.round(fps * 0.55)], [160, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const scale = interpolate(frame, [0, 120], [1.06, 1.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const Media = mediaType === "video" ? OffthreadVideo : Img;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Media
        src={src}
        {...(mediaType === "video" ? { muted: true } : {})}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `translateY(${ty}px) scale(${scale})`,
          filter: "saturate(1.12) contrast(1.03) brightness(0.9)",
        }}
      />
    </AbsoluteFill>
  );
};

const ImageVariant3: React.FC<{ src: string; mediaType: "image" | "video" }> = ({ src, mediaType }) => {
  // Diagonal parallax drift
  const frame = useCurrentFrame();
  const tx = interpolate(frame, [0, 120], [-18, 18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ty = interpolate(frame, [0, 120], [-12, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 120], [1.12, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
          transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
          filter: "saturate(1.06) contrast(1.06) brightness(0.85)",
        }}
      />
    </AbsoluteFill>
  );
};

const ImageVariant4: React.FC<{ src: string; mediaType: "image" | "video" }> = ({ src, mediaType }) => {
  // Horizontal wipe-in from right: clip-path reveals image
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = interpolate(frame, [0, Math.round(fps * 0.7)], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const scale = interpolate(frame, [0, 120], [1.08, 1.14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const Media = mediaType === "video" ? OffthreadVideo : Img;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}>
        <Media
          src={src}
          {...(mediaType === "video" ? { muted: true } : {})}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
            filter: "saturate(1.1) contrast(1.04) brightness(0.88)",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ImageVariant5: React.FC<{ src: string; mediaType: "image" | "video" }> = ({ src, mediaType }) => {
  // Scale pulse: starts large, bounces to settle
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80, mass: 1.2 },
    from: 1.28,
    to: 1.06,
  });
  const ty = interpolate(frame, [0, 120], [0, -16], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
          filter: "saturate(1.14) contrast(1.05) brightness(0.87)",
        }}
      />
    </AbsoluteFill>
  );
};

const imageVariants = [ImageVariant0, ImageVariant1, ImageVariant2, ImageVariant3, ImageVariant4, ImageVariant5];

// ─────────────────────────────────────────────────────────
// CAPTION ANIMATION VARIANTS (5)
// ─────────────────────────────────────────────────────────

type CaptionProps = {
  text: string;
  startFrame: number;
  endFrame: number;
  accentColor: string;
  textColor: string;
  variant: number;
};

// Variant 0: Word-by-word pop — each word scales in from 0 with bounce
const CaptionVariant0: React.FC<CaptionProps> = ({ text, startFrame, endFrame, accentColor, textColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.trim().split(/\s+/);
  const duration = Math.max(endFrame - startFrame, words.length * 4);
  const framesPerWord = Math.max(4, Math.floor(duration / words.length));
  const localFrame = frame - startFrame;

  const containerOpacity = interpolate(frame, [startFrame, startFrame + 4, endFrame - 5, endFrame], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: containerOpacity,
        display: "flex",
        flexWrap: "wrap",
        gap: "0 0.28em",
        justifyContent: "center",
        padding: "20px 32px 24px",
        borderRadius: 36,
        background: hexToRgba("#020617", 0.62),
        border: `1px solid ${hexToRgba("#FFFFFF", 0.14)}`,
        backdropFilter: "blur(18px)",
        boxShadow: `0 24px 70px ${hexToRgba("#000000", 0.3)}, 0 0 60px ${hexToRgba(accentColor, 0.08)}`,
        maxWidth: 900,
      }}
    >
      {words.map((word, i) => {
        const wordStart = i * framesPerWord;
        const popProgress = spring({
          frame: Math.max(localFrame - wordStart, 0),
          fps,
          config: { damping: 12, stiffness: 260, mass: 0.7 },
          from: 0,
          to: 1,
        });
        const isActive = localFrame >= wordStart && localFrame < wordStart + framesPerWord * 1.6;
        return (
          <span
            key={`${startFrame}-w${i}`}
            style={{
              color: isActive ? "#FFFFFF" : hexToRgba(textColor, 0.84),
              fontFamily: '"Montserrat", "Avenir Next", sans-serif',
              fontWeight: 900,
              fontSize: 54,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              textShadow: isActive ? `0 0 28px ${hexToRgba(accentColor, 0.5)}` : "0 2px 14px rgba(0,0,0,0.5)",
              transform: `scale(${popProgress}) translateY(${interpolate(popProgress, [0, 1], [22, 0])}px)`,
              opacity: popProgress,
              display: "inline-block",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// Variant 1: Typewriter reveal — characters appear one-by-one
const CaptionVariant1: React.FC<CaptionProps> = ({ text, startFrame, endFrame, accentColor, textColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = Math.max(endFrame - startFrame, text.length * 1.2);
  const charsToShow = Math.floor(interpolate(frame, [startFrame, startFrame + duration * 0.75], [0, text.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  }));
  const cursorBlink = Math.floor((frame - startFrame) / Math.round(fps * 0.3)) % 2 === 0;
  const containerOpacity = interpolate(frame, [startFrame, startFrame + 4, endFrame - 6, endFrame], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: containerOpacity,
        padding: "22px 36px 26px",
        borderRadius: 32,
        background: `linear-gradient(135deg, ${hexToRgba(accentColor, 0.18)} 0%, ${hexToRgba("#020617", 0.72)} 100%)`,
        border: `1px solid ${hexToRgba(accentColor, 0.3)}`,
        boxShadow: `0 20px 60px ${hexToRgba("#000000", 0.35)}, inset 0 1px 0 ${hexToRgba("#FFFFFF", 0.1)}`,
        backdropFilter: "blur(20px)",
        maxWidth: 900,
      }}
    >
      <span
        style={{
          color: textColor,
          fontFamily: '"Montserrat", "Avenir Next", monospace',
          fontWeight: 800,
          fontSize: 50,
          lineHeight: 1.12,
          letterSpacing: "0.01em",
          textShadow: `0 0 20px ${hexToRgba(accentColor, 0.35)}`,
        }}
      >
        {text.slice(0, charsToShow)}
        <span style={{ opacity: cursorBlink ? 1 : 0, color: accentColor, marginLeft: 2 }}>|</span>
      </span>
    </div>
  );
};

// Variant 2: Kinetic slide-up — entire bar slides up with spring + blur clear
const CaptionVariant2: React.FC<CaptionProps> = ({ text, startFrame, endFrame, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ty = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 18, stiffness: 200, mass: 0.9 },
    from: 80,
    to: 0,
  });
  const blur = interpolate(frame, [startFrame, startFrame + Math.round(fps * 0.4)], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [startFrame, startFrame + 6, endFrame - 6, endFrame], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scaleX = interpolate(frame, [startFrame, startFrame + Math.round(fps * 0.35)], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${ty}px) scaleX(${scaleX})`,
        filter: `blur(${blur}px)`,
        padding: "18px 28px 22px",
        borderRadius: 40,
        background: `linear-gradient(180deg, ${hexToRgba(accentColor, 0.7)} 0%, ${hexToRgba("#030B1B", 0.88)} 100%)`,
        border: `2px solid ${hexToRgba(accentColor, 0.45)}`,
        boxShadow: `0 28px 80px ${hexToRgba(accentColor, 0.22)}, 0 0 40px ${hexToRgba(accentColor, 0.14)}`,
        backdropFilter: "blur(16px)",
        maxWidth: 920,
        textTransform: "uppercase",
      }}
    >
      <div
        style={{
          color: "#04111D",
          fontFamily: '"Montserrat", "Impact", sans-serif',
          fontWeight: 900,
          fontSize: 52,
          lineHeight: 1.02,
          letterSpacing: "-0.03em",
          textShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Variant 3: Spotlight flash — text fades in with a radial light sweep moving across
const CaptionVariant3: React.FC<CaptionProps> = ({ text, startFrame, endFrame, accentColor, textColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [startFrame, startFrame + 10, endFrame - 8, endFrame], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sweepX = interpolate(frame, [startFrame, startFrame + Math.round(fps * 0.8)], [-20, 110], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.6, 1),
  });
  const scale = interpolate(frame, [startFrame, startFrame + Math.round(fps * 0.3)], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        position: "relative",
        overflow: "hidden",
        padding: "22px 32px 26px",
        borderRadius: 34,
        background: hexToRgba("#060F20", 0.78),
        border: `1px solid ${hexToRgba("#FFFFFF", 0.16)}`,
        boxShadow: `0 22px 65px ${hexToRgba("#000000", 0.4)}`,
        backdropFilter: "blur(22px)",
        maxWidth: 900,
      }}
    >
      {/* Moving light sweep */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: `${sweepX}%`,
          width: "30%",
          height: "100%",
          background: `linear-gradient(90deg, transparent 0%, ${hexToRgba(accentColor, 0.35)} 50%, transparent 100%)`,
          mixBlendMode: "screen",
          filter: "blur(8px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          color: textColor,
          fontFamily: '"Montserrat", "Avenir Next", sans-serif',
          fontWeight: 800,
          fontSize: 50,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          textShadow: `0 0 30px ${hexToRgba(accentColor, 0.4)}, 0 3px 16px rgba(0,0,0,0.5)`,
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Variant 4: Split-line — first half from left, second half from right
const CaptionVariant4: React.FC<CaptionProps> = ({ text, startFrame, endFrame, accentColor, textColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.trim().split(/\s+/);
  const half = Math.ceil(words.length / 2);
  const lineA = words.slice(0, half).join(" ");
  const lineB = words.slice(half).join(" ");

  const entryProgress = interpolate(frame, [startFrame, startFrame + Math.round(fps * 0.45)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const txA = interpolate(entryProgress, [0, 1], [-180, 0]);
  const txB = interpolate(entryProgress, [0, 1], [180, 0]);
  const opacity = interpolate(frame, [startFrame, startFrame + 6, endFrame - 6, endFrame], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: "20px 28px 24px",
        borderRadius: 36,
        background: hexToRgba("#040D1C", 0.74),
        border: `1px solid ${hexToRgba("#FFFFFF", 0.12)}`,
        boxShadow: `0 24px 72px ${hexToRgba("#000000", 0.32)}`,
        backdropFilter: "blur(20px)",
        maxWidth: 920,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          color: textColor,
          fontFamily: '"Montserrat", "Avenir Next", sans-serif',
          fontWeight: 900,
          fontSize: 50,
          lineHeight: 1.06,
          letterSpacing: "-0.025em",
          transform: `translateX(${txA}px)`,
          textShadow: `0 0 22px ${hexToRgba(accentColor, 0.3)}`,
        }}
      >
        {lineA}
      </div>
      {lineB ? (
        <div
          style={{
            color: accentColor,
            fontFamily: '"Montserrat", "Avenir Next", sans-serif',
            fontWeight: 900,
            fontSize: 50,
            lineHeight: 1.06,
            letterSpacing: "-0.025em",
            transform: `translateX(${txB}px)`,
            textShadow: `0 0 22px ${hexToRgba(accentColor, 0.45)}`,
          }}
        >
          {lineB}
        </div>
      ) : null}
    </div>
  );
};

const captionVariantComponents = [CaptionVariant0, CaptionVariant1, CaptionVariant2, CaptionVariant3, CaptionVariant4];

// ─────────────────────────────────────────────────────────
// ACTIVE CAPTION RENDERER
// ─────────────────────────────────────────────────────────

const ActiveCaptionRenderer: React.FC<{
  captions: TimelineScene["captions"];
  accentColor: string;
  textColor: string;
  sceneId: string;
}> = ({ captions, accentColor, textColor, sceneId }) => {
  const frame = useCurrentFrame();
  const activeCaption = captions.find((c) => frame >= c.startFrame && frame <= c.endFrame) ?? null;

  if (!activeCaption) return null;

  const captionIndex = captions.indexOf(activeCaption);
  const variantIndex = seededIndex(`${sceneId}-cap-${captionIndex}`, captionVariantComponents.length);
  const CaptionComponent = captionVariantComponents[variantIndex];

  return (
    <CaptionComponent
      text={activeCaption.text}
      startFrame={activeCaption.startFrame}
      endFrame={activeCaption.endFrame}
      accentColor={accentColor}
      textColor={textColor}
      variant={variantIndex}
    />
  );
};

// ─────────────────────────────────────────────────────────
// SFX PER SCENE
// ─────────────────────────────────────────────────────────

const SceneSFX: React.FC<{
  sceneRole: string;
  captions: TimelineScene["captions"];
  sceneId: string;
}> = ({ sceneRole, captions, sceneId }) => {
  const captionVariantForFirst = captions.length > 0
    ? seededIndex(`${sceneId}-cap-0`, captionVariantComponents.length)
    : -1;

  return (
    <>
      {/* Whoosh at scene start */}
      <Audio
        src={staticFile("assets/fx/studiokolomna-whoosh-transitions-sfx-01-118227.mp3")}
        volume={0.45}
        startFrom={0}
      />
      {/* Pop on CTA */}
      {sceneRole === "cta" && (
        <Sequence from={8} layout="none">
          <Audio
            src={staticFile("assets/fx/soundreality-pop-423717.mp3")}
            volume={0.38}
          />
        </Sequence>
      )}
      {/* Bubble-pop if first caption uses word-pop variant */}
      {captionVariantForFirst === 0 && captions.length > 0 && (
        <Sequence from={captions[0].startFrame} layout="none">
          <Audio
            src={staticFile("assets/fx/soundreality-bubble-pop-424583.mp3")}
            volume={0.28}
          />
        </Sequence>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN SCENE COMPONENT
// ─────────────────────────────────────────────────────────

export const KineticFluxScene: React.FC<SceneProps> = ({ entry, props, sceneIndex }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palette = getBrandPalette(props);

  const imageVariantIndex = seededIndex(`${props.adId}-img-${sceneIndex}`, imageVariants.length);
  const ImageVariant = imageVariants[imageVariantIndex];

  // Brand badge entrance
  const badgeOpacity = interpolate(frame, [0, Math.round(fps * 0.4)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const badgeTy = spring({ frame, fps, config: { damping: 18, stiffness: 180 }, from: -40, to: 0 });

  const src = entry.scene.prefetchedLocalPath ?? entry.scene.mediaUrl;

  return (
    <AbsoluteFill>
      {/* Background Image */}
      <ImageVariant src={src} mediaType={entry.mediaType} />

      {/* Dark overlay gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(
            180deg,
            ${hexToRgba("#020617", 0.1)} 0%,
            transparent 28%,
            ${hexToRgba("#020617", 0.18)} 55%,
            ${hexToRgba("#020617", 0.72)} 100%
          )`,
        }}
      />

      {/* Accent color glow strip at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background: `linear-gradient(90deg, ${palette.primary} 0%, ${palette.accent} 50%, ${palette.secondary} 100%)`,
          opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      />

      {/* Content layer */}
      <AbsoluteFill style={{ padding: "64px 60px 140px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Brand badge */}
        <div style={{ opacity: badgeOpacity, transform: `translateY(${badgeTy}px)`, alignSelf: "flex-start" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 16,
              borderRadius: 999,
              padding: "14px 22px 14px 14px",
              background: hexToRgba("#08101F", 0.7),
              border: `1px solid ${hexToRgba("#FFFFFF", 0.18)}`,
              backdropFilter: "blur(16px)",
              boxShadow: `0 16px 48px ${hexToRgba(palette.primary, 0.28)}`,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                overflow: "hidden",
                background: "#FFFFFF",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Img src={props.logoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div
              style={{
                color: palette.text,
                fontFamily: '"Montserrat", "Avenir Next", sans-serif',
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {props.brandName}
            </div>
          </div>
        </div>

        {/* Caption area */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ActiveCaptionRenderer
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
