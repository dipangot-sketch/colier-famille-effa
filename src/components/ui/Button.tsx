import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

/**
 * Boutons suffisamment grands pour le tactile (Partie 5 §59, Partie 9 §50) :
 * hauteur minimale de 44px, zone cliquable généreuse.
 */
export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "min-h-11 px-5 py-2.5 text-sm font-medium transition-all duration-200",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cfe-accent)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "rounded-[var(--cfe-radius,0.75rem)]",
        variant === "primary" &&
          "bg-[var(--cfe-primary)] text-white hover:brightness-110 active:brightness-95 shadow-lg shadow-black/10",
        variant === "ghost" &&
          "bg-transparent border border-white/20 text-[var(--cfe-text)] hover:bg-white/10",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-500",
        className
      )}
      {...props}
    />
  );
}
