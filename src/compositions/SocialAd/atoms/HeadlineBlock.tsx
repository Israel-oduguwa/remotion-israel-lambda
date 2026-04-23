import { fitHeadlineSize, hexToRgba } from "../utils";

type HeadlineBlockProps = {
  eyebrow?: string;
  headline: string;
  supportingText: string;
  accentColor: string;
  textColor: string;
  align?: "left" | "center";
};

export const HeadlineBlock: React.FC<HeadlineBlockProps> = ({
  eyebrow,
  headline,
  supportingText,
  accentColor,
  textColor,
  align = "left",
}) => {
  const headlineSize = fitHeadlineSize(headline);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 22,
        textAlign: align,
      }}
    >
      {eyebrow ? (
        <div
          style={{
            display: "inline-flex",
            alignSelf: align === "left" ? "flex-start" : "center",
            borderRadius: 999,
            padding: "12px 18px",
            backgroundColor: hexToRgba(accentColor, 0.2),
            color: textColor,
            fontFamily: '"Avenir Next", "Montserrat", sans-serif',
            textTransform: "uppercase",
            fontSize: 26,
            letterSpacing: "0.14em",
            fontWeight: 700,
          }}
        >
          {eyebrow}
        </div>
      ) : null}
      <div
        style={{
          color: textColor,
          fontFamily: '"Avenir Next Condensed", "Impact", sans-serif',
          fontSize: headlineSize,
          fontWeight: 800,
          letterSpacing: "-0.05em",
          lineHeight: 0.95,
          textTransform: "uppercase",
          maxWidth: 860,
        }}
      >
        {headline}
      </div>
      <div
        style={{
          color: hexToRgba(textColor, 0.86),
          fontFamily: '"Avenir Next", "Montserrat", sans-serif',
          fontSize: 42,
          lineHeight: 1.15,
          maxWidth: 760,
        }}
      >
        {supportingText}
      </div>
    </div>
  );
};
