import type { SocialAdProps } from "./schema";
import type { TimelineScene } from "./timeline";
import { CleanCaptionScene } from "./templates/CleanCaptionScene";

type SceneRendererProps = {
  entry: TimelineScene;
  props: SocialAdProps;
  zoomSeed: number;
};

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  entry,
  props,
  zoomSeed,
}) => {
  return <CleanCaptionScene entry={entry} props={props} zoomSeed={zoomSeed} />;
};
