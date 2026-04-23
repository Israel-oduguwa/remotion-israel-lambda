import "./index.css";
import { Composition } from "remotion";
import {
  ExcelCNAEditor,
  ExcelCNAEditorSchema,
  calculateExcelCnaEditorMetadata,
} from "./compositions/ExcelCNAEditor";
import { excelCnaEditorInput } from "./compositions/ExcelCNAEditor/editor-input";

export const RemotionRoot: React.FC = () => {
  return (
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
  );
};
