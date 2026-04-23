import {
  AbsoluteFill,
  Audio,
  staticFile,
  useVideoConfig,
} from "remotion";
import {
  springTiming,
  TransitionSeries,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { StoryGlowScene } from "./StoryGlowScene";
import { calculateSocialAdMetadata, SocialAdSchema } from "../SocialAd";
import type { SocialAdProps } from "../SocialAd/schema";
import { buildTimelinePlan } from "../SocialAd/timeline";
import { seededPick } from "../SocialAd/utils";

const BG_MUSIC = staticFile("assets/music/idoberg-funky-guitar-and-bass-loop-in-gm-407639.mp3");

const renderTransition = (adId: string, index: number, fps: number, key: string) => {
  const directions = ["from-left", "from-right", "from-top", "from-bottom"] as const;
  const direction = seededPick(`${adId}-v3-${index}`, directions);
  // Story Glow prefers soft transitions: mostly fade, some wipe
  const useFade = index % 3 !== 1;

  if (useFade) {
    return (
      <TransitionSeries.Transition
        key={key}
        presentation={fade()}
        timing={springTiming({ config: { damping: 220, stiffness: 160 }, durationInFrames: Math.round(fps * 0.6) })}
      />
    );
  }
  return (
    <TransitionSeries.Transition
      key={key}
      presentation={wipe({ direction })}
      timing={springTiming({ config: { damping: 200, stiffness: 155 }, durationInFrames: Math.round(fps * 0.55) })}
    />
  );
};

export const SocialAdV3: React.FC<SocialAdProps> = (props) => {
  const { durationInFrames, fps } = useVideoConfig();
  const timeline = buildTimelinePlan(props, durationInFrames, fps);

  return (
    <AbsoluteFill style={{ background: "#040912" }}>
      {/* Voiceover — full volume */}
      <Audio src={props.prefetchedLocalPath ?? props.voiceoverUrl} volume={1} />

      {/* Background music — very subtle, warm */}
      <Audio src={BG_MUSIC} loop volume={0.09} />

      {/* Scene series */}
      <TransitionSeries>
        {timeline.scenes.flatMap((entry, index) => {
          const nodes: React.ReactNode[] = [
            <TransitionSeries.Sequence
              key={`${entry.scene.id}-seq`}
              durationInFrames={entry.sequenceDuration}
            >
              <StoryGlowScene
                entry={entry}
                props={props}
                zoomSeed={(index % 6) + 1}
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
