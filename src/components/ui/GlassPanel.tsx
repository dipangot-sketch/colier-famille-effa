import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Effet verre léger (Partie 5 §4, Partie 9 §10) : transparence, flou,
 * bordure fine, ombre douce — jamais au détriment de la lisibilité.
 */
export function GlassPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("cfe-glass rounded-2xl", className)} {...props} />;
}
