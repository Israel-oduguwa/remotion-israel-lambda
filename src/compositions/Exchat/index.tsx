import { AbsoluteFill, Audio, staticFile, useVideoConfig } from "remotion";
import { springTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import {
  calculateSocialAdMetadata,
  SocialAdSchema,
} from "../SocialAd";
import type { SocialAdProps } from "../SocialAd/schema";
import { seededPick } from "../SocialAd/utils";
import { IsraelScene } from "./IsraelScene";
import { buildIsraelTimeline } from "./israel-timeline";

const BG_MUSIC = staticFile(
  "assets/music/sonican-funky-afrobeat-feelgood-music-30-sec-479035.mp3",
);

const renderTransition = (
  adId: string,
  index: number,
  fps: number,
  key: string,
): React.ReactNode => {
  const directions = ["from-left", "from-right", "from-top", "from-bottom"] as const;
  const direction = seededPick(`${adId}-exchat-${index}`, directions);
  const mode = index % 3;

  if (mode === 0) {
    return (
      <TransitionSeries.Transition
        key={key}
        presentation={slide({ direction })}
        timing={springTiming({
          config: { damping: 175, stiffness: 180 },
          durationInFrames: Math.round(fps * 0.58),
        })}
      />
    );
  }

  if (mode === 1) {
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

export const Exchat: React.FC<SocialAdProps> = (props) => {
  const { durationInFrames, fps } = useVideoConfig();
  const timeline = buildIsraelTimeline(props, durationInFrames, fps);

  return (
    <AbsoluteFill style={{ background: "#020617" }}>
      <Audio src={props.prefetchedLocalPath ?? props.voiceoverUrl} volume={1} />
      <Audio src={BG_MUSIC} loop volume={0.1} />

      <TransitionSeries>
        {timeline.scenes.flatMap((entry, index) => {
          const nodes: React.ReactNode[] = [
            <TransitionSeries.Sequence
              key={`${entry.scene.id}-seq`}
              durationInFrames={entry.sequenceDuration}
            >
              <IsraelScene
                entry={entry}
                props={props}
                sceneIndex={index}
              />
            </TransitionSeries.Sequence>,
          ];

          if (index < timeline.scenes.length - 1) {
            nodes.push(
              renderTransition(props.adId, index, fps, `${entry.scene.id}-t`) as React.ReactElement,
            );
          }

          return nodes;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

export { calculateSocialAdMetadata, SocialAdSchema };
