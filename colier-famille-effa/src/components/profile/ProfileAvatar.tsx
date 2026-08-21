import { cn } from "@/lib/utils/cn";

type AvatarShape = "CIRCLE" | "HEART" | "SQUARE_ROUNDED" | "HEXAGON" | "DIAMOND" | "OVAL" | "STAR";

type ProfileAvatarProps = {
  shape: AvatarShape;
  initial: string;
  size?: number;
  imageUrl?: string | null;
  className?: string;
};

const CLIP_PATHS: Partial<Record<AvatarShape, string>> = {
  HEXAGON: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)",
  DIAMOND: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  STAR: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  // Approximation "polygonale" du cœur : plus fiable entre navigateurs
  // qu'un clip-path path() (dont les unités ne s'adaptent pas à la
  // taille de la boîte), tout en restant légère à calculer sur mobile.
  HEART:
    "polygon(50% 15%, 61% 5%, 75% 5%, 90% 18%, 90% 34%, 50% 72%, 10% 34%, 10% 18%, 25% 5%, 39% 5%)",
};

const ROUNDED_CLASSES: Partial<Record<AvatarShape, string>> = {
  CIRCLE: "rounded-full",
  SQUARE_ROUNDED: "rounded-2xl",
  OVAL: "rounded-[50%/38%]",
};

/**
 * La forme est une préférence de présentation, jamais un pouvoir
 * (Partie 3 §46). Elle vient entièrement du thème/profil, pas d'un
 * choix codé en dur ici.
 */
export function ProfileAvatar({ shape, initial, size = 96, imageUrl, className }: ProfileAvatarProps) {
  const clipPath = CLIP_PATHS[shape];
  const roundedClass = ROUNDED_CLASSES[shape];

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden text-white shadow-lg",
        roundedClass,
        className
      )}
      style={{
        width: size,
        height: size,
        background: imageUrl ? undefined : "var(--cfe-primary)",
        clipPath,
        fontFamily: "var(--cfe-font-display)",
        fontSize: size * 0.4,
      }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={initial} className="h-full w-full object-cover" />
      ) : (
        initial.toUpperCase()
      )}
    </div>
  );
}
