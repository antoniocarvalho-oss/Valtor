import { getLotteryColor } from "@/lib/utils";

interface LotteryBallProps {
  number: number;
  loteria?: string;
  size?: "sm" | "md" | "lg" | "xl";
  highlighted?: boolean;
  className?: string;
}

const FIXED_COLORS: Record<string, { bg: string; text: string }> = {
  "navy": { bg: "#0d1b3e", text: "#fff" },
  "gray": { bg: "#e2e8f0", text: "#475569" },
};

const SIZES: Record<string, { container: string; text: string }> = {
  sm: { container: "w-8 h-8 text-xs", text: "text-xs" },
  md: { container: "w-10 h-10 text-sm", text: "text-sm" },
  lg: { container: "w-12 h-12 text-base", text: "text-base" },
  xl: { container: "w-14 h-14 text-lg", text: "text-lg" },
};

export default function LotteryBall({
  number,
  loteria = "navy",
  size = "md",
  highlighted = false,
  className = "",
}: LotteryBallProps) {
  const fixed = FIXED_COLORS[loteria];
  const color = fixed ?? { bg: getLotteryColor(loteria), text: "#fff" };
  const sizeClass = SIZES[size] ?? SIZES.md;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold select-none flex-shrink-0 transition-transform ${
        highlighted ? "scale-110 ring-2 ring-offset-1" : ""
      } ${sizeClass.container} ${className}`}
      style={{
        backgroundColor: color.bg,
        color: color.text,
      }}
    >
      {number}
    </span>
  );
}

interface BallRowProps {
  numbers: number[];
  loteria?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  highlightedNumbers?: number[];
}

export function BallRow({ numbers, loteria = "navy", size = "md", className = "", highlightedNumbers }: BallRowProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {numbers.map((n, i) => (
        <LotteryBall
          key={i}
          number={n}
          loteria={loteria}
          size={size}
          highlighted={highlightedNumbers ? highlightedNumbers.includes(n) : false}
        />
      ))}
    </div>
  );
}
