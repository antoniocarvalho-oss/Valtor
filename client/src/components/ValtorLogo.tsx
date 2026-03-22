// Logo recortada (sem espaço em branco) para renderização maior na navbar
const LOGO_CROPPED_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663436858219/5Sb2Q4HEgP7cWSHaDrz6fk/valtor_logo_cropped_d9720bff.png";

interface ValtorLogoProps {
  dark?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { height: "36px", maxWidth: "160px" },
  md: { height: "48px", maxWidth: "220px" },
  lg: { height: "64px", maxWidth: "300px" },
};

export default function ValtorLogo({ dark = false, className = "", size = "md" }: ValtorLogoProps) {
  const dims = SIZES[size];

  return (
    <img
      src={LOGO_CROPPED_URL}
      alt="Valtor — Onde a matemática encontra a sorte."
      className={`block ${className}`}
      style={{
        height: dims.height,
        width: "auto",
        maxWidth: dims.maxWidth,
        objectFit: "contain",
        objectPosition: "left",
        ...(dark ? { filter: "brightness(0) invert(1)" } : {}),
      }}
    />
  );
}
