import "./index.css";
import { Composition } from "remotion";
import {
  calculateSocialAdMetadata,
  SocialAd,
  SocialAdSchema,
} from "./compositions/SocialAd";
import { SocialAdV2 } from "./compositions/SocialAdV2";
import { SocialAdV3 } from "./compositions/SocialAdV3";
import { Exchat } from "./compositions/Exchat";
import {
  ExcelCNAEditor,
  ExcelCNAEditorSchema,
  calculateExcelCnaEditorMetadata,
} from "./compositions/ExcelCNAEditor";
import { excelCnaEditorInput } from "./compositions/ExcelCNAEditor/editor-input";
import { livePreviewInput } from "./compositions/SocialAd/live-preview-input";
import { resolveLivePreviewProps } from "./compositions/SocialAd/live-preview";

export const RemotionRoot: React.FC = () => {
  const defaultProps = resolveLivePreviewProps(livePreviewInput);

  return (
    <>
      {/* Original template (unchanged) */}
      <Composition
        id="SocialAd"
        component={SocialAd}
        durationInFrames={45 * 30}
        fps={30}
        width={1080}
        height={1920}
        schema={SocialAdSchema}
        defaultProps={defaultProps}
        calculateMetadata={calculateSocialAdMetadata}
      />

      {/* Template 1 — Kinetic Flux (high-energy, bold) */}
      <Composition
        id="SocialAdV2-KineticFlux"
        component={SocialAdV2}
        durationInFrames={45 * 30}
        fps={30}
        width={1080}
        height={1920}
        schema={SocialAdSchema}
        defaultProps={defaultProps}
        calculateMetadata={calculateSocialAdMetadata}
      />

      {/* Template 2 — Story Glow (warm, emotional, storytelling) */}
      <Composition
        id="SocialAdV3-StoryGlow"
        component={SocialAdV3}
        durationInFrames={45 * 30}
        fps={30}
        width={1080}
        height={1920}
        schema={SocialAdSchema}
        defaultProps={defaultProps}
        calculateMetadata={calculateSocialAdMetadata}
      />

      <Composition
        id="Exchat"
        component={Exchat}
        durationInFrames={45 * 30}
        fps={30}
        width={1080}
        height={1920}
        schema={SocialAdSchema}
        defaultProps={defaultProps}
        calculateMetadata={calculateSocialAdMetadata}
      />

      <Composition
        id="Israel"
        component={Exchat}
        durationInFrames={45 * 30}
        fps={30}
        width={1080}
        height={1920}
        schema={SocialAdSchema}
        defaultProps={defaultProps}
        calculateMetadata={calculateSocialAdMetadata}
      />

      <Composition
        id="ExcelCNAEditor"
        component={ExcelCNAEditor}
        durationInFrames={45 * 30}
        fps={30}
        width={1080}
        height={1920}
        schema={ExcelCNAEditorSchema}
        defaultProps={excelCnaEditorInput}
        calculateMetadata={calculateExcelCnaEditorMetadata}
      />
    </>
  );
};
