import { hexToRgba } from "../utils";

type ProofChipProps = {
  label?: string;
  value?: string;
  primaryColor: string;
  textColor: string;
};

export const ProofChip: React.FC<ProofChipProps> = ({
  label,
  value,
  primaryColor,
  textColor,
}) => {
  if (!label && !value) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        alignSelf: "flex-start",
        padding: "20px 24px",
        borderRadius: 28,
        background: `linear-gradient(135deg, ${hexToRgba(
          primaryColor,
          0.34,
        )} 0%, ${hexToRgba("#08101F", 0.84)} 100%)`,
        border: `1px solid ${hexToRgba("#FFFFFF", 0.14)}`,
        boxShadow: `0 18px 60px ${hexToRgba(primaryColor, 0.18)}`,
      }}
    >
      {label ? (
        <div
          style={{
            color: hexToRgba(textColor, 0.72),
            fontFamily: '"Avenir Next", "Montserrat", sans-serif',
            fontSize: 24,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontWeight: 700,
          }}
        >
          {label}
        </div>
      ) : null}
      {value ? (
        <div
          style={{
            color: textColor,
            fontFamily: '"Avenir Next Condensed", "Impact", sans-serif',
            fontSize: 56,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            fontWeight: 800,
          }}
        >
          {value}
        </div>
      ) : null}
    </div>
  );
};
