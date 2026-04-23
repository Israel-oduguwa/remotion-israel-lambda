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
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";
import { KineticFluxScene } from "./KineticFluxScene";
import { calculateSocialAdMetadata, SocialAdSchema } from "../SocialAd";
import type { SocialAdProps } from "../SocialAd/schema";
import { buildTimelinePlan } from "../SocialAd/timeline";
import { seededPick } from "../SocialAd/utils";

const BG_MUSIC = staticFile("assets/music/idoberg-funky-drum-and-bass-jam-333630.mp3");

const renderTransition = (adId: string, index: number, fps: number, key: string) => {
  const directions = ["from-left", "from-right", "from-top", "from-bottom"] as const;
  const direction = seededPick(`${adId}-v2-${index}`, directions);
  const useSlide = index % 3 === 0;
  const useWipe = index % 3 === 1;

  if (useSlide) {
    return (
      <TransitionSeries.Transition
        key={key}
        presentation={slide({ direction })}
        timing={springTiming({ config: { damping: 160, stiffness: 200 }, durationInFrames: Math.round(fps * 0.55) })}
      />
    );
  }
  if (useWipe) {
    return (
      <TransitionSeries.Transition
        key={key}
        presentation={wipe({ direction })}
        timing={springTiming({ config: { damping: 170, stiffness: 195 }, durationInFrames: Math.round(fps * 0.5) })}
      />
    );
  }
  return (
    <TransitionSeries.Transition
      key={key}
      presentation={fade()}
      timing={springTiming({ config: { damping: 200, stiffness: 170 }, durationInFrames: Math.round(fps * 0.45) })}
    />
  );
};

export const SocialAdV2: React.FC<SocialAdProps> = (props) => {
  const { durationInFrames, fps } = useVideoConfig();
  const timeline = buildTimelinePlan(props, durationInFrames, fps);

  return (
    <AbsoluteFill style={{ background: "#04090F" }}>
      {/* Voiceover — full volume */}
      <Audio src={props.prefetchedLocalPath ?? props.voiceoverUrl} volume={1} />

      {/* Background music — ducked low */}
      <Audio src={BG_MUSIC} loop volume={0.1} />

      {/* Scene series */}
      <TransitionSeries>
        {timeline.scenes.flatMap((entry, index) => {
          const nodes: React.ReactNode[] = [
            <TransitionSeries.Sequence
              key={`${entry.scene.id}-seq`}
              durationInFrames={entry.sequenceDuration}
            >
              <KineticFluxScene
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
