import { Img } from "remotion";
import { hexToRgba } from "../utils";

type BrandBadgeProps = {
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  textColor: string;
};

export const BrandBadge: React.FC<BrandBadgeProps> = ({
  brandName,
  logoUrl,
  primaryColor,
  textColor,
}) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 18,
        alignSelf: "flex-start",
        borderRadius: 999,
        padding: "16px 24px 16px 16px",
        backgroundColor: hexToRgba("#08101F", 0.64),
        boxShadow: `0 18px 60px ${hexToRgba(primaryColor, 0.24)}`,
        border: `1px solid ${hexToRgba("#FFFFFF", 0.14)}`,
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Img
          src={logoUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
      <div
        style={{
          color: textColor,
          fontFamily: '"Avenir Next", "Montserrat", sans-serif',
          fontSize: 30,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {brandName}
      </div>
    </div>
  );
};
