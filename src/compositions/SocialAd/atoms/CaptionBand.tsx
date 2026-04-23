import { interpolate, useCurrentFrame } from "remotion";
import type { ResolvedCaption } from "../timeline";
import { hexToRgba } from "../utils";

type CaptionBandProps = {
  captions: ResolvedCaption[];
  textColor: string;
  accentColor: string;
  variant: "band" | "kinetic" | "social";
};

const getActiveCaption = (
  captions: ResolvedCaption[],
  frame: number,
): ResolvedCaption | null => {
  return (
    captions.find((caption) => frame >= caption.startFrame && frame <= caption.endFrame) ??
    captions[0] ??
    null
  );
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const splitWords = (text: string): string[] => {
  return text.trim().split(/\s+/).filter(Boolean);
};

export const CaptionBand: React.FC<CaptionBandProps> = ({
  captions,
  textColor,
  accentColor,
  variant,
}) => {
  const frame = useCurrentFrame();
  const activeCaption = getActiveCaption(captions, frame);

  if (!activeCaption) {
    return null;
  }

  const opacity = interpolate(
    frame,
    [activeCaption.startFrame, activeCaption.startFrame + 6, activeCaption.endFrame - 6, activeCaption.endFrame],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const translateY = interpolate(
    frame,
    [activeCaption.startFrame, activeCaption.startFrame + 8],
    [20, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const scale = interpolate(
    frame,
    [activeCaption.startFrame, activeCaption.startFrame + 10],
    [0.96, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const glowOpacity = interpolate(
    frame,
    [
      activeCaption.startFrame,
      activeCaption.startFrame + 8,
      activeCaption.endFrame - 10,
      activeCaption.endFrame,
    ],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  if (variant === "social") {
    const words = splitWords(activeCaption.text);
    const captionDuration = Math.max(
      activeCaption.endFrame - activeCaption.startFrame,
      12,
    );
    const leadFrames = Math.min(8, Math.max(4, Math.floor(captionDuration * 0.16)));
    const usableFrames = Math.max(captionDuration - leadFrames, words.length);
    const framesPerWord = Math.max(1, usableFrames / Math.max(words.length, 1));
    const localFrame = clamp(frame - activeCaption.startFrame, 0, captionDuration);
    const progressWidth = interpolate(
      frame,
      [activeCaption.startFrame, activeCaption.endFrame],
      [0.14, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );

    return (
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            maxWidth: 880,
            padding: "18px 22px 20px",
            borderRadius: 30,
            background: `linear-gradient(180deg, ${hexToRgba(
              "#020617",
              0.28,
            )} 0%, ${hexToRgba("#020617", 0.48)} 100%)`,
            border: `1px solid ${hexToRgba("#FFFFFF", 0.12)}`,
            boxShadow: `0 20px 60px ${hexToRgba("#000000", 0.24)}`,
            backdropFilter: "blur(16px)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 18,
              right: 18,
              top: 12,
              height: 4,
              borderRadius: 999,
              backgroundColor: hexToRgba("#FFFFFF", 0.08),
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressWidth * 100}%`,
                height: "100%",
                borderRadius: 999,
                background: `linear-gradient(90deg, ${hexToRgba(
                  accentColor,
                  0.92,
                )} 0%, ${hexToRgba("#FFFFFF", 0.86)} 100%)`,
                boxShadow: `0 0 18px ${hexToRgba(accentColor, 0.45)}`,
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              inset: -1,
              borderRadius: 30,
              background: `linear-gradient(135deg, ${hexToRgba(
                accentColor,
                0.42 * glowOpacity,
              )} 0%, transparent 55%, ${hexToRgba(
                "#FFFFFF",
                0.08 * glowOpacity,
              )} 100%)`,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.14em 0.22em",
              paddingTop: 8,
            }}
          >
            {words.map((word, index) => {
              const wordStart = leadFrames + index * framesPerWord;
              const wordEnd = wordStart + framesPerWord * 1.35;
              const wordEnter = clamp(localFrame - wordStart, 0, 8);
              const wordExit = clamp(wordEnd - localFrame, 0, 8);
              const wordOpacity = interpolate(
                wordEnter,
                [0, 8],
                [0.18, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              );
              const wordLift = interpolate(
                wordEnter,
                [0, 8],
                [18, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              );
              const wordBlur = interpolate(
                wordEnter,
                [0, 8],
                [10, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              );
              const isActive =
                localFrame >= Math.floor(wordStart) &&
                localFrame < Math.ceil(wordStart + framesPerWord);
              const settleOpacity = interpolate(
                wordExit,
                [0, 8],
                [0.8, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              );

              return (
                <span
                  key={`${activeCaption.id}-${index}-${word}`}
                  style={{
                    color: isActive ? "#FFFFFF" : hexToRgba(textColor, 0.8),
                    fontFamily: '"Avenir Next", "Montserrat", sans-serif',
                    fontWeight: 800,
                    fontSize: 52,
                    lineHeight: 1.02,
                    letterSpacing: "-0.035em",
                    textAlign: "center",
                    textShadow: isActive
                      ? `0 0 24px ${hexToRgba(accentColor, 0.42)}`
                      : "0 3px 18px rgba(0,0,0,0.28)",
                    opacity: wordOpacity * settleOpacity,
                    transform: `translateY(${wordLift}px) scale(${isActive ? 1.04 : 1})`,
                    filter: `blur(${wordBlur}px)`,
                    whiteSpace: "pre",
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const baseStyle: React.CSSProperties = {
    opacity,
    transform: `translateY(${translateY}px) scale(${scale})`,
    width: "100%",
    padding: variant === "kinetic" ? "22px 28px" : "26px 30px",
    borderRadius: variant === "kinetic" ? 34 : 28,
    color: textColor,
    fontFamily:
      variant === "kinetic"
        ? '"Avenir Next Condensed", "Impact", sans-serif'
        : '"Avenir Next", "Montserrat", sans-serif',
    fontWeight: variant === "kinetic" ? 800 : 700,
    fontSize: variant === "kinetic" ? 46 : 38,
    lineHeight: 1.05,
    letterSpacing: variant === "kinetic" ? "-0.03em" : "-0.01em",
    textTransform: variant === "kinetic" ? "uppercase" : "none",
    background:
      variant === "kinetic"
        ? `linear-gradient(135deg, ${hexToRgba(
            accentColor,
            0.74,
          )} 0%, ${hexToRgba("#050816", 0.84)} 100%)`
        : hexToRgba("#050816", 0.72),
    border: `1px solid ${hexToRgba("#FFFFFF", 0.14)}`,
    boxShadow: `0 18px 50px ${hexToRgba(accentColor, 0.2)}`,
    backdropFilter: "blur(16px)",
  };

  return <div style={baseStyle}>{activeCaption.text}</div>;
};
