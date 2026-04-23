import { hexToRgba } from "../utils";

type CtaCardProps = {
  ctaLabel: string;
  ctaUrl: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
};

export const CtaCard: React.FC<CtaCardProps> = ({
  ctaLabel,
  ctaUrl,
  primaryColor,
  secondaryColor,
  textColor,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        width: "100%",
        maxWidth: 760,
        padding: 28,
        borderRadius: 36,
        background: `linear-gradient(135deg, ${hexToRgba(
          primaryColor,
          0.28,
        )} 0%, ${hexToRgba(secondaryColor, 0.2)} 100%)`,
        border: `1px solid ${hexToRgba("#FFFFFF", 0.16)}`,
        boxShadow: `0 24px 80px ${hexToRgba(primaryColor, 0.24)}`,
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "flex-start",
          borderRadius: 999,
          padding: "18px 28px",
          background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          color: "#06101B",
          fontFamily: '"Avenir Next", "Montserrat", sans-serif',
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "-0.02em",
        }}
      >
        {ctaLabel}
      </div>
      <div
        style={{
          color: textColor,
          fontFamily: '"Avenir Next", "Montserrat", sans-serif',
          fontSize: 28,
          lineHeight: 1.2,
        }}
      >
        {ctaUrl}
      </div>
    </div>
  );
};
