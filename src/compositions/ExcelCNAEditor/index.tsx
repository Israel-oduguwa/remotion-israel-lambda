import { AbsoluteFill, Audio, staticFile, useVideoConfig } from "remotion";
import { springTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { EditorScene } from "./EditorScene";
import { calculateExcelCnaEditorMetadata } from "./calculate-metadata";
import type { ExcelCNAEditorProps } from "./schema";
import { ExcelCNAEditorSchema } from "./schema";
import { buildExcelCnaEditorTimeline } from "./timeline";

const DEFAULT_MUSIC = staticFile(
  "assets/music/sonican-funky-afrobeat-feelgood-music-30-sec-479035.mp3",
);

const renderTransition = (
  transition: ExcelCNAEditorProps["scenes"][number]["transition"],
  fps: number,
  key: string,
) => {
  if (transition === "slide") {
    return (
      <TransitionSeries.Transition
        key={key}
        presentation={slide({ direction: "from-right" })}
        timing={springTiming({
          config: { damping: 175, stiffness: 180 },
          durationInFrames: Math.round(fps * 0.58),
        })}
      />
    );
  }

  if (transition === "wipe") {
    return (
      <TransitionSeries.Transition
        key={key}
        presentation={wipe()}
        timing={springTiming({
          config: { damping: 185, stiffness: 172 },
          durationInFrames: Math.round(fps * 0.54),
        })}
      />
    );
  }

  return (
    <TransitionSeries.Transition
      key={key}
      presentation={fade()}
      timing={springTiming({
        config: { damping: 200, stiffness: 168 },
        durationInFrames: Math.round(fps * 0.5),
      })}
    />
  );
};

export const ExcelCNAEditor: React.FC<ExcelCNAEditorProps> = (props) => {
  const { fps } = useVideoConfig();
  const timeline = buildExcelCnaEditorTimeline(props, fps);

  return (
    <AbsoluteFill style={{ background: props.surfaceColor ?? "#08101F" }}>
      <Audio src={props.voiceoverUrl} volume={1} />
      <Audio
        src={props.musicUrl ?? DEFAULT_MUSIC}
        loop
        volume={() => props.musicVolume ?? 0.1}
      />

      <TransitionSeries>
        {timeline.scenes.flatMap((entry, index) => {
          const nodes: React.ReactNode[] = [
            <TransitionSeries.Sequence
              key={`${entry.scene.id}-sequence`}
              durationInFrames={entry.sequenceDuration}
            >
              <EditorScene entry={entry} props={props} sceneIndex={index} />
            </TransitionSeries.Sequence>,
          ];

          if (index < timeline.scenes.length - 1) {
            nodes.push(
              renderTransition(
                entry.scene.transition,
                fps,
                `${entry.scene.id}-transition`,
              ) as React.ReactElement,
            );
          }

          return nodes;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

export { ExcelCNAEditorSchema, calculateExcelCnaEditorMetadata };
