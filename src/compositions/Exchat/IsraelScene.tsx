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
import type { SocialAdProps } from "../SocialAd/schema";
import type { ResolvedCaption, TimelineScene } from "../SocialAd/timeline";
import { getBrandPalette, hexToRgba, seededIndex } from "../SocialAd/utils";

type IsraelSceneProps = {
  entry: TimelineScene;
  props: SocialAdProps;
  sceneIndex: number;
};

type MediaLayerProps = {
  src: string;
  mediaType: "image" | "video";
  accentColor: string;
};

type CaptionProps = {
  text: string;
  startFrame: number;
  endFrame: number;
  accentColor: string;
  textColor: string;
};

const TYPE_FX = staticFile("assets/fx/virtualzero-keyboard-typing-fast-371229.mp3");
const MECH_FX = staticFile(
  "assets/fx/virtualzero-mechanical-keyboard-typing-hd-372290.mp3",
);
const POP_FX = staticFile("assets/fx/soundreality-pop-423717.mp3");
const BUBBLE_FX = staticFile("assets/fx/soundreality-bubble-pop-424583.mp3");
const BLINK_FX = staticFile("assets/fx/universfield-cartoon-blinking-487897.mp3");
const WOOSH_FX = staticFile("assets/fx/studiokolomna-whoosh-transitions-sfx-01-118227.mp3");

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const splitWords = (text: string): string[] => {
  return text.trim().split(/\s+/).filter(Boolean);
};

const getActiveCaption = (
  captions: ResolvedCaption[],
  frame: number,
): ResolvedCaption | null => {
  return (
    captions.find((caption) => frame >= caption.startFrame && frame <= caption.endFrame) ??
    null
  );
};

const MediaDriftA: React.FC<MediaLayerProps> = ({
  src,
  mediaType,
}) => {
  const frame = useCurrentFrame();
  const Media = mediaType === "video" ? OffthreadVideo : Img;
  const scale = interpolate(frame, [0, 120], [1.18, 1.04], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tx = interpolate(frame, [0, 120], [-36, 18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const rotate = interpolate(frame, [0, 120], [-1.4, -0.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Media
      src={src}
      {...(mediaType === "video" ? { muted: true } : {})}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${scale}) translateX(${tx}px) rotate(${rotate}deg)`,
        filter: "saturate(1.08) contrast(1.06) brightness(0.88)",
      }}
    />
  );
};

const MediaDriftB: React.FC<MediaLayerProps> = ({
  src,
  mediaType,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Media = mediaType === "video" ? OffthreadVideo : Img;
  const settle = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 92, mass: 1.4 },
    from: 1.34,
    to: 1.06,
  });
  const ty = interpolate(frame, [0, 110], [26, -10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Media
      src={src}
      {...(mediaType === "video" ? { muted: true } : {})}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${settle}) translateY(${ty}px)`,
        filter: "saturate(1.1) contrast(1.05) brightness(0.9)",
      }}
    />
  );
};

const MediaDriftC: React.FC<MediaLayerProps> = ({
  src,
  mediaType,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const Media = mediaType === "video" ? OffthreadVideo : Img;
  const scale = interpolate(frame, [0, 120], [1.08, 1.14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sweepX = interpolate(frame, [0, 88], [-220, 1200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
          filter: "saturate(1.12) contrast(1.04) brightness(0.87)",
        }}
      />
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: 0.42,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -260,
            left: sweepX,
            width: 260,
            height: 2400,
            transform: "rotate(14deg)",
            background: `linear-gradient(180deg, transparent 0%, ${hexToRgba(
              accentColor,
              0.38,
            )} 48%, transparent 100%)`,
            filter: "blur(28px)",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const mediaVariants = [MediaDriftA, MediaDriftB, MediaDriftC];

const captionShell = (
  accentColor: string,
  children: React.ReactNode,
  opacity: number,
  lift: number,
  glow = 0.2,
) => {
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${lift}px)`,
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 930,
          padding: "22px 26px 26px",
          borderRadius: 38,
          background: `linear-gradient(180deg, ${hexToRgba(
            "#02060F",
            0.26,
          )} 0%, ${hexToRgba("#02060F", 0.6)} 100%)`,
          border: `1px solid ${hexToRgba("#FFFFFF", 0.14)}`,
          boxShadow: `0 24px 80px ${hexToRgba("#000000", 0.34)}, 0 0 64px ${hexToRgba(
            accentColor,
            glow,
          )}`,
          backdropFilter: "blur(22px)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 38,
            background: `linear-gradient(135deg, ${hexToRgba(
              accentColor,
              0.2,
            )} 0%, transparent 44%, ${hexToRgba("#FFFFFF", 0.08)} 100%)`,
            pointerEvents: "none",
          }}
        />
        {children}
      </div>
    </div>
  );
};

const TypePulseCaption: React.FC<CaptionProps> = ({
  text,
  startFrame,
  endFrame,
  accentColor,
  textColor,
}) => {
  const frame = useCurrentFrame();
  const duration = Math.max(endFrame - startFrame, 10);
  const localFrame = clamp(frame - startFrame, 0, duration);
  const visibleChars = Math.max(
    1,
    Math.floor(interpolate(localFrame, [0, duration * 0.72], [0, text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    })),
  );
  const cursorOpacity = Math.sin(localFrame / 2) > 0 ? 1 : 0.18;
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 4, endFrame - 4, endFrame],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const lift = interpolate(frame, [startFrame, startFrame + 8], [28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return captionShell(
    accentColor,
    <div
      style={{
        position: "relative",
        color: textColor,
        fontFamily: '"Montserrat", "Avenir Next", sans-serif',
        fontWeight: 800,
        fontSize: 58,
        lineHeight: 1.02,
        letterSpacing: "-0.04em",
        textAlign: "center",
        textShadow: `0 0 28px ${hexToRgba(accentColor, 0.38)}, 0 4px 20px rgba(0,0,0,0.45)`,
      }}
    >
      {text.slice(0, visibleChars)}
      <span
        style={{
          display: "inline-block",
          width: 10,
          marginLeft: 6,
          borderRadius: 999,
          backgroundColor: hexToRgba("#FFFFFF", cursorOpacity),
          boxShadow: `0 0 14px ${hexToRgba(accentColor, 0.55)}`,
        }}
      >
        &nbsp;
      </span>
    </div>,
    opacity,
    lift,
    0.18,
  );
};

const PopSpringCaption: React.FC<CaptionProps> = ({
  text,
  startFrame,
  endFrame,
  accentColor,
  textColor,
}) => {
  const frame = useCurrentFrame();
  const words = splitWords(text);
  const duration = Math.max(endFrame - startFrame, words.length * 3);
  const localFrame = clamp(frame - startFrame, 0, duration);
  const framesPerWord = Math.max(2, duration / Math.max(words.length, 1));
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 3, endFrame - 4, endFrame],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return captionShell(
    accentColor,
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.14em 0.28em",
      }}
    >
      {words.map((word, index) => {
        const trigger = clamp(localFrame - index * framesPerWord, 0, 24);
        const scale = spring({
          frame: trigger,
          fps: 30,
          config: { damping: 11, stiffness: 220, mass: 0.72 },
          from: 0.72,
          to: 1,
        });
        const translateY = interpolate(trigger, [0, 10], [26, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        });
        const isFresh = trigger < 8;

        return (
          <span
            key={`${word}-${index}`}
            style={{
              color: isFresh ? "#FFFFFF" : textColor,
              fontFamily: '"Montserrat", "Avenir Next", sans-serif',
              fontWeight: 900,
              fontSize: 58,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              textShadow: isFresh
                ? `0 0 30px ${hexToRgba(accentColor, 0.62)}`
                : "0 3px 18px rgba(0,0,0,0.35)",
              transform: `translateY(${translateY}px) scale(${scale})`,
              display: "inline-block",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>,
    opacity,
    0,
    0.22,
  );
};

const GlowWaveCaption: React.FC<CaptionProps> = ({
  text,
  startFrame,
  endFrame,
  accentColor,
  textColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 15, stiffness: 140, mass: 1 },
    from: 0.84,
    to: 1,
  });
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 6, endFrame - 5, endFrame],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const sweep = interpolate(frame, [startFrame, endFrame], [-40, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return captionShell(
    accentColor,
    <div style={{ position: "relative", transform: `scale(${enter})` }}>
      <div
        style={{
          position: "absolute",
          inset: "-12px -26px",
          borderRadius: 32,
          background: `linear-gradient(90deg, transparent 0%, ${hexToRgba(
            "#FFFFFF",
            0.22,
          )} ${sweep}%, transparent ${Math.min(sweep + 18, 100)}%)`,
          filter: "blur(22px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          color: textColor,
          fontFamily: '"Montserrat", "Avenir Next", sans-serif',
          fontWeight: 800,
          fontSize: 58,
          lineHeight: 1.02,
          letterSpacing: "-0.04em",
          textAlign: "center",
          textShadow: `0 0 32px ${hexToRgba(accentColor, 0.56)}, 0 4px 20px rgba(0,0,0,0.42)`,
        }}
      >
        {text}
      </div>
    </div>,
    opacity,
    0,
    0.28,
  );
};

const LiftScatterCaption: React.FC<CaptionProps> = ({
  text,
  startFrame,
  endFrame,
  accentColor,
  textColor,
}) => {
  const frame = useCurrentFrame();
  const words = splitWords(text);
  const duration = Math.max(endFrame - startFrame, words.length * 3);
  const localFrame = clamp(frame - startFrame, 0, duration);
  const framesPerWord = Math.max(2, duration / Math.max(words.length, 1));
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 4, endFrame - 4, endFrame],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return captionShell(
    accentColor,
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.14em 0.28em",
      }}
    >
      {words.map((word, index) => {
        const trigger = clamp(localFrame - index * framesPerWord, 0, 12);
        const wordOpacity = interpolate(trigger, [0, 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const translateY = interpolate(trigger, [0, 8], [24, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        });
        const rotate = interpolate(trigger, [0, 8], [index % 2 === 0 ? -4 : 4, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <span
            key={`${word}-${index}`}
            style={{
              color: textColor,
              fontFamily: '"Montserrat", "Avenir Next", sans-serif',
              fontWeight: 800,
              fontSize: 58,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              textShadow: `0 0 18px ${hexToRgba(accentColor, 0.28)}, 0 3px 18px rgba(0,0,0,0.35)`,
              opacity: wordOpacity,
              transform: `translateY(${translateY}px) rotate(${rotate}deg)`,
              display: "inline-block",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>,
    opacity,
    0,
    0.16,
  );
};

const captionVariants = [
  TypePulseCaption,
  PopSpringCaption,
  GlowWaveCaption,
  LiftScatterCaption,
] as const;

const captionFxMap = [TYPE_FX, POP_FX, BLINK_FX, BUBBLE_FX] as const;

const ActiveCaption: React.FC<{
  captions: TimelineScene["captions"];
  accentColor: string;
  textColor: string;
  sceneId: string;
}> = ({ captions, accentColor, textColor, sceneId }) => {
  const frame = useCurrentFrame();
  const activeCaption = getActiveCaption(captions, frame);

  if (!activeCaption) {
    return null;
  }

  const captionIndex = captions.indexOf(activeCaption);
  const variantIndex = seededIndex(
    `${sceneId}-israel-caption-${captionIndex}`,
    captionVariants.length,
  );
  const CaptionComponent = captionVariants[variantIndex];

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

const CaptionSfx: React.FC<{
  captions: TimelineScene["captions"];
  sceneId: string;
}> = ({ captions, sceneId }) => {
  return (
    <>
      <Audio src={WOOSH_FX} volume={0.18} />
      {captions.map((caption, index) => {
        const variantIndex = seededIndex(
          `${sceneId}-israel-caption-${index}`,
          captionVariants.length,
        );
        const fx = captionFxMap[variantIndex];
        const volume = variantIndex === 0 ? 0.14 : variantIndex === 1 ? 0.22 : 0.18;
        return (
          <Sequence key={caption.id} from={caption.startFrame} layout="none">
            <Audio src={fx} volume={volume} />
            {variantIndex === 0 ? <Audio src={MECH_FX} volume={0.05} /> : null}
          </Sequence>
        );
      })}
    </>
  );
};

export const IsraelScene: React.FC<IsraelSceneProps> = ({
  entry,
  props,
  sceneIndex,
}) => {
  const frame = useCurrentFrame();
  const palette = getBrandPalette(props);
  const variantIndex = seededIndex(
    `${props.adId}-israel-media-${sceneIndex}`,
    mediaVariants.length,
  );
  const MediaVariant = mediaVariants[variantIndex];
  const lift = interpolate(frame, [0, 14], [22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flareOpacity = interpolate(frame, [0, 18, 52], [0, 0.55, 0.24], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#020617" }}>
      <MediaVariant
        src={entry.scene.prefetchedLocalPath ?? entry.scene.mediaUrl}
        mediaType={entry.mediaType}
        accentColor={palette.secondary}
      />

      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${hexToRgba(
            "#020617",
            0.02,
          )} 0%, transparent 26%, ${hexToRgba("#020617", 0.2)} 58%, ${hexToRgba(
            "#020617",
            0.74,
          )} 100%)`,
        }}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at top right, ${hexToRgba(
            palette.secondary,
            flareOpacity * 0.22,
          )} 0%, transparent 34%), radial-gradient(circle at bottom left, ${hexToRgba(
            palette.primary,
            flareOpacity * 0.18,
          )} 0%, transparent 38%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          padding: "0 54px 148px",
          transform: `translateY(${lift}px)`,
        }}
      >
        <ActiveCaption
          captions={entry.captions}
          accentColor={palette.secondary}
          textColor={palette.text}
          sceneId={entry.scene.id}
        />
      </AbsoluteFill>

      <CaptionSfx captions={entry.captions} sceneId={entry.scene.id} />
    </AbsoluteFill>
  );
};
