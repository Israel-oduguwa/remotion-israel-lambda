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
import type { ExcelCNAEditorProps } from "./schema";
import type {
  ResolvedEditorCaption,
  ResolvedEditorOverlay,
  ResolvedEditorScene,
} from "./timeline";
import { hexToRgba, seededIndex } from "./utils";

type EditorSceneProps = {
  entry: ResolvedEditorScene;
  props: ExcelCNAEditorProps;
  sceneIndex: number;
};

const TYPE_FX = staticFile("assets/fx/virtualzero-keyboard-typing-fast-371229.mp3");
const MECH_FX = staticFile(
  "assets/fx/virtualzero-mechanical-keyboard-typing-hd-372290.mp3",
);
const POP_FX = staticFile("assets/fx/soundreality-pop-423717.mp3");
const BUBBLE_FX = staticFile("assets/fx/soundreality-bubble-pop-424583.mp3");
const BLINK_FX = staticFile("assets/fx/universfield-cartoon-blinking-487897.mp3");
const WOOSH_FX = staticFile("assets/fx/studiokolomna-whoosh-transitions-sfx-01-118227.mp3");
const CAPTION_FONT_SIZE = 70;
const CAPTION_WORD_GAP = "0.22em 0.36em";

const getPalette = (props: ExcelCNAEditorProps) => ({
  primary: props.primaryColor,
  secondary: props.secondaryColor,
  accent: props.accentColor ?? "#FDE68A",
  text: props.textColor ?? "#F8FAFC",
  surface: props.surfaceColor ?? "#08101F",
});

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const splitWords = (text: string) => text.trim().split(/\s+/).filter(Boolean);

const getActiveCaption = (
  captions: ResolvedEditorCaption[],
  frame: number,
): ResolvedEditorCaption | null =>
  captions.find(
    (caption) =>
      caption.type !== "pause" &&
      frame >= caption.startFrame &&
      frame <= caption.endFrame,
  ) ?? null;

const getEnvelope = (startFrame: number, endFrame: number) => {
  const duration = Math.max(endFrame - startFrame, 2);
  const intro = Math.max(1, Math.min(6, Math.floor(duration * 0.28)));
  const outro = Math.max(1, Math.min(5, Math.floor(duration * 0.22)));
  const enterEnd = Math.min(startFrame + intro, endFrame);
  const exitStart = Math.max(startFrame, endFrame - outro);

  return { duration, enterEnd, exitStart };
};

const interpolateOpacitySafe = (
  frame: number,
  startFrame: number,
  endFrame: number,
  enterEnd: number,
  exitStart: number,
) => {
  const safeStart = startFrame;
  const safeEnd = Math.max(endFrame, safeStart + 1);
  const safeEnter = Math.max(safeStart + 1, Math.min(enterEnd, safeEnd - 1));
  const safeExit = Math.max(safeEnter + 1, Math.min(exitStart, safeEnd - 1));

  if (safeEnd - safeStart <= 2) {
    return interpolate(frame, [startFrame, endFrame], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  if (safeExit >= safeEnd || safeExit <= safeEnter) {
    const midpoint = Math.max(
      safeStart + 1,
      Math.min(safeEnd - 1, Math.round((safeStart + safeEnd) / 2)),
    );
    return interpolate(frame, [safeStart, midpoint, safeEnd], [0, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  return interpolate(frame, [safeStart, safeEnter, safeExit, safeEnd], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

const interpolateLiftSafe = (
  frame: number,
  startFrame: number,
  enterEnd: number,
  from: number,
  to: number,
) => {
  if (enterEnd <= startFrame) {
    return to;
  }

  return interpolate(frame, [startFrame, enterEnd], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

const MediaDriftA: React.FC<{
  src: string;
  mediaType: "image" | "video";
}> = ({ src, mediaType }) => {
  const frame = useCurrentFrame();
  const Media = mediaType === "video" ? OffthreadVideo : Img;
  return (
    <Media
      src={src}
      {...(mediaType === "video" ? { muted: true } : {})}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${interpolate(frame, [0, 120], [1.18, 1.04], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}) translateX(${interpolate(frame, [0, 120], [-36, 18], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        })}px) rotate(${interpolate(frame, [0, 120], [-1.4, -0.2], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}deg)`,
        filter: "saturate(1.08) contrast(1.06) brightness(0.88)",
      }}
    />
  );
};

const MediaDriftB: React.FC<{
  src: string;
  mediaType: "image" | "video";
}> = ({ src, mediaType }) => {
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
  return (
    <Media
      src={src}
      {...(mediaType === "video" ? { muted: true } : {})}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${settle}) translateY(${interpolate(frame, [0, 110], [26, -10], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}px)`,
        filter: "saturate(1.1) contrast(1.05) brightness(0.9)",
      }}
    />
  );
};

const MediaDriftC: React.FC<{
  src: string;
  mediaType: "image" | "video";
  accentColor: string;
}> = ({ src, mediaType, accentColor }) => {
  const frame = useCurrentFrame();
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
          transform: `scale(${interpolate(frame, [0, 120], [1.08, 1.14], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })})`,
          filter: "saturate(1.12) contrast(1.04) brightness(0.87)",
        }}
      />
      <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.42, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: -260,
            left: interpolate(frame, [0, 88], [-220, 1200], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
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

const mediaVariants = [MediaDriftA, MediaDriftB, MediaDriftC] as const;

const captionShell = (
  accentColor: string,
  children: React.ReactNode,
  opacity: number,
  lift: number,
  glow = 0.2,
) => (
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
        background: `linear-gradient(180deg, ${hexToRgba("#02060F", 0.26)} 0%, ${hexToRgba(
          "#02060F",
          0.6,
        )} 100%)`,
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

const TypeCaption: React.FC<{
  caption: ResolvedEditorCaption;
  accentColor: string;
  textColor: string;
}> = ({ caption, accentColor, textColor }) => {
  const frame = useCurrentFrame();
  const { duration, enterEnd, exitStart } = getEnvelope(
    caption.startFrame,
    caption.endFrame,
  );
  const localFrame = clamp(frame - caption.startFrame, 0, duration);
  const visibleChars = Math.max(
    1,
    Math.floor(
      interpolate(localFrame, [0, duration * 0.72], [0, caption.text.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      }),
    ),
  );
  return captionShell(
    accentColor,
    <div
      style={{
        color: textColor,
        fontFamily: '"Montserrat", "Avenir Next", sans-serif',
        fontWeight: 800,
        fontSize: CAPTION_FONT_SIZE,
        lineHeight: 1.02,
        letterSpacing: "-0.04em",
        textAlign: "center",
        textShadow: `0 0 28px ${hexToRgba(accentColor, 0.38)}, 0 4px 20px rgba(0,0,0,0.45)`,
      }}
    >
      {caption.text.slice(0, visibleChars)}
      <span
        style={{
          display: "inline-block",
          width: 10,
          marginLeft: 6,
          borderRadius: 999,
          backgroundColor: hexToRgba("#FFFFFF", Math.sin(localFrame / 2) > 0 ? 1 : 0.18),
          boxShadow: `0 0 14px ${hexToRgba(accentColor, 0.55)}`,
        }}
      >
        &nbsp;
      </span>
    </div>,
    interpolateOpacitySafe(
      frame,
      caption.startFrame,
      caption.endFrame,
      enterEnd,
      exitStart,
    ),
    interpolateLiftSafe(frame, caption.startFrame, enterEnd, 24, 0),
    0.18,
  );
};

const PopCaption: React.FC<{
  caption: ResolvedEditorCaption;
  accentColor: string;
  textColor: string;
}> = ({ caption, accentColor, textColor }) => {
  const frame = useCurrentFrame();
  const { enterEnd, exitStart } = getEnvelope(caption.startFrame, caption.endFrame);
  const words = splitWords(caption.text);
  const duration = Math.max(caption.endFrame - caption.startFrame, words.length * 3);
  const localFrame = clamp(frame - caption.startFrame, 0, duration);
  const framesPerWord = Math.max(2, duration / Math.max(words.length, 1));

  return captionShell(
    accentColor,
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: CAPTION_WORD_GAP }}>
      {words.map((word, index) => {
        const trigger = clamp(localFrame - index * framesPerWord, 0, 24);
        const scale = spring({
          frame: trigger,
          fps: 30,
          config: { damping: 11, stiffness: 220, mass: 0.72 },
          from: 0.72,
          to: 1,
        });
        return (
          <span
            key={`${caption.id}-${word}-${index}`}
            style={{
              color: trigger < 8 ? "#FFFFFF" : textColor,
              fontFamily: '"Montserrat", "Avenir Next", sans-serif',
              fontWeight: 900,
              fontSize: CAPTION_FONT_SIZE,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              textShadow:
                trigger < 8
                  ? `0 0 30px ${hexToRgba(accentColor, 0.62)}`
                  : "0 3px 18px rgba(0,0,0,0.35)",
              transform: `translateY(${interpolate(trigger, [0, 10], [26, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.22, 1, 0.36, 1),
              })}px) scale(${scale})`,
              display: "inline-block",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>,
    interpolateOpacitySafe(
      frame,
      caption.startFrame,
      caption.endFrame,
      enterEnd,
      exitStart,
    ),
    0,
    0.22,
  );
};

const GlowCaption: React.FC<{
  caption: ResolvedEditorCaption;
  accentColor: string;
  textColor: string;
}> = ({ caption, accentColor, textColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { enterEnd, exitStart } = getEnvelope(caption.startFrame, caption.endFrame);
  return captionShell(
    accentColor,
    <div
      style={{
        position: "relative",
        transform: `scale(${spring({
          frame: frame - caption.startFrame,
          fps,
          config: { damping: 15, stiffness: 140, mass: 1 },
          from: 0.84,
          to: 1,
        })})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-12px -26px",
          borderRadius: 32,
          background: `linear-gradient(90deg, transparent 0%, ${hexToRgba(
            "#FFFFFF",
            0.22,
          )} ${interpolate(frame, [caption.startFrame, caption.endFrame], [-40, 100], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}%, transparent 100%)`,
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
          fontSize: CAPTION_FONT_SIZE,
          lineHeight: 1.02,
          letterSpacing: "-0.04em",
          textAlign: "center",
          textShadow: `0 0 32px ${hexToRgba(accentColor, 0.56)}, 0 4px 20px rgba(0,0,0,0.42)`,
        }}
      >
        {caption.text}
      </div>
    </div>,
    interpolateOpacitySafe(
      frame,
      caption.startFrame,
      caption.endFrame,
      enterEnd,
      exitStart,
    ),
    0,
    0.28,
  );
};

const ScatterCaption: React.FC<{
  caption: ResolvedEditorCaption;
  accentColor: string;
  textColor: string;
}> = ({ caption, accentColor, textColor }) => {
  const frame = useCurrentFrame();
  const { enterEnd, exitStart } = getEnvelope(caption.startFrame, caption.endFrame);
  const words = splitWords(caption.text);
  const duration = Math.max(caption.endFrame - caption.startFrame, words.length * 3);
  const localFrame = clamp(frame - caption.startFrame, 0, duration);
  const framesPerWord = Math.max(2, duration / Math.max(words.length, 1));
  return captionShell(
    accentColor,
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: CAPTION_WORD_GAP }}>
      {words.map((word, index) => {
        const trigger = clamp(localFrame - index * framesPerWord, 0, 12);
        return (
          <span
            key={`${caption.id}-${word}-${index}`}
            style={{
              color: textColor,
              fontFamily: '"Montserrat", "Avenir Next", sans-serif',
              fontWeight: 800,
              fontSize: CAPTION_FONT_SIZE,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              textShadow: `0 0 18px ${hexToRgba(accentColor, 0.28)}, 0 3px 18px rgba(0,0,0,0.35)`,
              opacity: interpolate(trigger, [0, 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              transform: `translateY(${interpolate(trigger, [0, 8], [24, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.22, 1, 0.36, 1),
              })}px) rotate(${interpolate(trigger, [0, 8], [index % 2 === 0 ? -4 : 4, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}deg)`,
              display: "inline-block",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>,
    interpolateOpacitySafe(
      frame,
      caption.startFrame,
      caption.endFrame,
      enterEnd,
      exitStart,
    ),
    0,
    0.16,
  );
};

const CaptionRenderer: React.FC<{
  caption: ResolvedEditorCaption;
  accentColor: string;
  textColor: string;
}> = ({ caption, accentColor, textColor }) => {
  switch (caption.effect) {
    case "type":
      return <TypeCaption caption={caption} accentColor={accentColor} textColor={textColor} />;
    case "pop":
      return <PopCaption caption={caption} accentColor={accentColor} textColor={textColor} />;
    case "glow":
      return <GlowCaption caption={caption} accentColor={accentColor} textColor={textColor} />;
    case "scatter":
    case "auto":
    default:
      return <ScatterCaption caption={caption} accentColor={accentColor} textColor={textColor} />;
  }
};

const CaptionOverlay: React.FC<{
  overlay: ResolvedEditorOverlay;
  accentColor: string;
}> = ({ overlay, accentColor }) => {
  const frame = useCurrentFrame();
  const enter = Math.max(overlay.startFrame + 2, Math.min(overlay.endFrame, overlay.startFrame + 6));
  const exitStart = Math.max(enter + 1, overlay.endFrame - 4);
  const opacity = interpolateOpacitySafe(
    frame,
    overlay.startFrame,
    overlay.endFrame,
    enter,
    exitStart,
  );
  const color = overlay.color ?? accentColor;
  const x = overlay.target === "caption" ? 50 : overlay.x ?? 50;
  const y = overlay.target === "caption" ? 79 : overlay.y ?? 50;
  const width = overlay.target === "caption" ? 62 : overlay.width ?? 24;
  const height = overlay.target === "caption" ? 10 : overlay.height ?? 24;

  if (overlay.type === "underline_sweep") {
    return (
      <div
        style={{
          position: "absolute",
          left: `${x - width / 2}%`,
          top: `${y}%`,
          width: `${width}%`,
          height: 8,
          opacity,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${interpolate(frame, [overlay.startFrame, overlay.endFrame], [0, 100], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}%`,
            height: "100%",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${hexToRgba(color, 0.4)} 0%, ${color} 50%, #FFFFFF 100%)`,
            boxShadow: `0 0 18px ${hexToRgba(color, 0.6)}`,
          }}
        />
      </div>
    );
  }

  if (overlay.type === "glow_blob") {
    return (
      <div
        style={{
          position: "absolute",
          left: `${x - width / 2}%`,
          top: `${y - height / 2}%`,
          width: `${width}%`,
          height: `${height}%`,
          borderRadius: "50%",
          background: color,
          opacity: opacity * 0.28,
          filter: "blur(44px)",
        }}
      />
    );
  }

  if (overlay.type === "ring_pulse") {
    const pulse = spring({
      frame: frame - overlay.startFrame,
      fps: 30,
      config: { damping: 12, stiffness: 160, mass: 0.8 },
      from: 0.5,
      to: 1.4,
    });
    return (
      <svg
        style={{
          position: "absolute",
          left: `${x - width / 2}%`,
          top: `${y - height / 2}%`,
          width: `${width}%`,
          height: `${height}%`,
          opacity,
        }}
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={30}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeOpacity={0.9}
          style={{ transformOrigin: "50% 50%", transform: `scale(${pulse})` }}
        />
      </svg>
    );
  }

  if (overlay.type === "highlight_box") {
    return (
      <div
        style={{
          position: "absolute",
          left: `${x - width / 2}%`,
          top: `${y - height / 2}%`,
          width: `${width}%`,
          height: `${height}%`,
          borderRadius: 28,
          border: `3px solid ${color}`,
          boxShadow: `0 0 18px ${hexToRgba(color, 0.5)}`,
          opacity,
        }}
      />
    );
  }

  return (
    <svg
      style={{
        position: "absolute",
        left: `${x - width / 2}%`,
        top: `${y - height / 2}%`,
        width: `${width}%`,
        height: `${height}%`,
        opacity,
      }}
      viewBox="0 0 200 60"
    >
      <path
        d="M10 35 C 45 10, 75 55, 110 30 S 170 20, 190 38"
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="240"
        strokeDashoffset={interpolate(frame, [overlay.startFrame, overlay.endFrame], [240, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
      />
    </svg>
  );
};

const SceneSfx: React.FC<{ captions: ResolvedEditorCaption[] }> = ({ captions }) => (
  <>
    <Audio src={WOOSH_FX} volume={0.18} />
    {captions
      .filter((caption) => caption.type !== "pause")
      .map((caption) => {
        const src =
          caption.effect === "type"
            ? TYPE_FX
            : caption.effect === "pop"
              ? POP_FX
              : caption.effect === "glow"
                ? BLINK_FX
                : BUBBLE_FX;
        const volume = caption.effect === "pop" ? 0.22 : 0.16;
        return (
          <Sequence key={caption.id} from={caption.startFrame} layout="none">
            <Audio src={src} volume={volume} />
            {caption.effect === "type" ? <Audio src={MECH_FX} volume={0.05} /> : null}
          </Sequence>
        );
      })}
  </>
);

export const EditorScene: React.FC<EditorSceneProps> = ({ entry, props, sceneIndex }) => {
  const frame = useCurrentFrame();
  const palette = getPalette(props);
  const MediaVariant = mediaVariants[
    seededIndex(`${props.adId}-editor-media-${sceneIndex}`, mediaVariants.length)
  ];
  const activeCaption = getActiveCaption(entry.captions, frame);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.surface }}>
      <MediaVariant
        src={entry.scene.mediaUrl}
        mediaType={entry.scene.mediaType}
        accentColor={palette.secondary}
      />

      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${hexToRgba(
            palette.surface,
            0.02,
          )} 0%, transparent 26%, ${hexToRgba(palette.surface, 0.2)} 58%, ${hexToRgba(
            palette.surface,
            0.74,
          )} 100%)`,
        }}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at top right, ${hexToRgba(
            palette.secondary,
            interpolate(frame, [0, 18, 52], [0, 0.12, 0.05], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          )} 0%, transparent 34%), radial-gradient(circle at bottom left, ${hexToRgba(
            palette.primary,
            0.12,
          )} 0%, transparent 38%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: "0 54px",
          transform: `translateY(${interpolate(frame, [0, 14], [210, 188], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px)`,
        }}
      >
        {activeCaption ? (
          <CaptionRenderer
            caption={activeCaption}
            accentColor={palette.accent}
            textColor={palette.text}
          />
        ) : null}
      </AbsoluteFill>

      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {entry.overlays.map((overlay) => (
          <CaptionOverlay key={overlay.id} overlay={overlay} accentColor={palette.accent} />
        ))}
      </AbsoluteFill>

      <SceneSfx captions={entry.captions} />
    </AbsoluteFill>
  );
};
