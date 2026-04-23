import {
  springTiming,
  TransitionSeries,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { Audio, AbsoluteFill, useVideoConfig } from "remotion";
import { SceneRenderer } from "./SceneRenderer";
import { calculateSocialAdMetadata } from "./calculate-metadata";
import type { SocialAdProps } from "./schema";
import { SocialAdSchema } from "./schema";
import { buildTimelinePlan } from "./timeline";
import { getBrandPalette, seededPick } from "./utils";

const renderFamilyTransition = (
  props: SocialAdProps,
  index: number,
  fps: number,
  key: string,
): React.ReactNode => {
  const directions = ["from-left", "from-right", "from-top", "from-bottom"] as const;
  const direction = seededPick(`${props.adId}-${index}`, directions);
  const useSlide = index % 2 === 0;

  switch (props.templateFamily) {
    case "problem-solution":
      if (useSlide) {
        return (
          <TransitionSeries.Transition
            key={key}
            presentation={slide({ direction })}
            timing={springTiming({
              config: {
                damping: 180,
                stiffness: 170,
              },
              durationInFrames: Math.round(fps * 0.62),
            })}
          />
        );
      }

      return (
        <TransitionSeries.Transition
          key={key}
          presentation={wipe()}
          timing={springTiming({
            config: {
              damping: 180,
              stiffness: 170,
            },
            durationInFrames: Math.round(fps * 0.62),
          })}
        />
      );
    case "story/testimonial":
      return (
        <TransitionSeries.Transition
          key={key}
          presentation={fade()}
          timing={springTiming({
            config: {
              damping: 200,
              stiffness: 170,
            },
            durationInFrames: Math.round(fps * 0.55),
          })}
        />
      );
    case "proof-driven":
    default:
      if (useSlide) {
        return (
          <TransitionSeries.Transition
            key={key}
            presentation={wipe()}
            timing={springTiming({
              config: {
                damping: 190,
                stiffness: 168,
              },
              durationInFrames: Math.round(fps * 0.64),
            })}
          />
        );
      }

      return (
        <TransitionSeries.Transition
          key={key}
          presentation={slide({ direction })}
          timing={springTiming({
            config: {
              damping: 190,
              stiffness: 168,
            },
            durationInFrames: Math.round(fps * 0.64),
          })}
        />
      );
  }
};

export const SocialAd: React.FC<SocialAdProps> = (props) => {
  const { durationInFrames, fps } = useVideoConfig();
  const palette = getBrandPalette(props);
  const timeline = buildTimelinePlan(props, durationInFrames, fps);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${palette.surface} 0%, #030712 100%)`,
      }}
    >
      <Audio src={props.prefetchedLocalPath ?? props.voiceoverUrl} />
      <TransitionSeries>
        {timeline.scenes.flatMap((entry, index) => {
          const nodes = [
            <TransitionSeries.Sequence
              key={`${entry.scene.id}-sequence`}
              durationInFrames={entry.sequenceDuration}
            >
              <SceneRenderer
                entry={entry}
                props={props}
                zoomSeed={(index % 5) + 1}
              />
            </TransitionSeries.Sequence>,
          ];

          if (index < timeline.scenes.length - 1) {
            nodes.push(
              renderFamilyTransition(
                props,
                index,
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

export { calculateSocialAdMetadata, SocialAdSchema };
