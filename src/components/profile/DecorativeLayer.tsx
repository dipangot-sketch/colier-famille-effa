import {
  CircleDot,
  Flower2,
  Heart,
  Hexagon,
  Leaf,
  Sparkles,
  Star,
  Waves,
  type LucideIcon,
} from "lucide-react";

type DecorativeLayerProps = {
  decorationConfig: Record<string, unknown>;
  animationConfig: Record<string, unknown>;
};

const MOTIF_ICONS: Record<string, LucideIcon> = {
  butterflies: Sparkles,
  leaves: Leaf,
  stars: Star,
  hearts: Heart,
  flowers: Flower2,
  geometry: Hexagon,
  waves: Waves,
  particles: CircleDot,
  sparkles: Sparkles,
};

const ANIMATION_CLASS: Record<string, string> = {
  float: "cfe-decoration-float",
  twinkle: "cfe-decoration-twinkle",
  glow: "cfe-decoration-glow",
  drift: "cfe-decoration-float",
  sway: "cfe-decoration-float",
  shimmer: "cfe-decoration-twinkle",
};

const DENSITY_COUNT: Record<string, number> = {
  none: 0,
  low: 3,
  medium: 5,
  high: 7,
};

// Positions et tailles présélectionnées pour rester discrètes, jamais
// centrées sur la lettre ni sur les zones de lecture (Partie 5 §41,
// Partie 9 §45 : "les décorations doivent rester discrètes").
const SLOTS = [
  { top: "8%", left: "10%", size: 22, delay: "0s" },
  { top: "14%", left: "82%", size: 16, delay: "1.2s" },
  { top: "68%", left: "6%", size: 18, delay: "2.1s" },
  { top: "78%", left: "88%", size: 20, delay: "0.6s" },
  { top: "34%", left: "92%", size: 14, delay: "1.8s" },
  { top: "6%", left: "48%", size: 15, delay: "2.6s" },
  { top: "90%", left: "46%", size: 17, delay: "1s" },
];

export function DecorativeLayer({ decorationConfig, animationConfig }: DecorativeLayerProps) {
  const motifs = Array.isArray(decorationConfig.motifs)
    ? (decorationConfig.motifs as string[])
    : [];
  const density = typeof decorationConfig.density === "string" ? decorationConfig.density : "none";
  const style = typeof animationConfig.style === "string" ? animationConfig.style : undefined;

  const count = DENSITY_COUNT[density] ?? 0;
  if (count === 0 || motifs.length === 0) return null;

  const animationClass = style ? ANIMATION_CLASS[style] : undefined;
  const slots = SLOTS.slice(0, count);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {slots.map((slot, index) => {
        const Icon = MOTIF_ICONS[motifs[index % motifs.length]];
        if (!Icon) return null;
        return (
          <span
            key={index}
            className={animationClass}
            style={
              {
                position: "absolute",
                top: slot.top,
                left: slot.left,
                color: "var(--cfe-accent)",
                opacity: 0.35,
                "--cfe-decoration-duration": `${7 + index}s`,
                animationDelay: slot.delay,
              } as React.CSSProperties
            }
          >
            <Icon size={slot.size} strokeWidth={1.25} />
          </span>
        );
      })}
    </div>
  );
}
