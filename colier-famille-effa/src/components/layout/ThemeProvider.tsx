"use client";

import type { ReactNode } from "react";
import type { ThemeTokens } from "@/lib/themes/types";
import { themeToCssVars } from "@/lib/themes/toCssVars";

type ThemeProviderProps = {
  theme: ThemeTokens;
  children: ReactNode;
  className?: string;
};

/**
 * Applique les variables CSS d'un thème à son sous-arbre. Un seul
 * moteur de rendu sert les quatre profils (Partie 5 §61, Partie 9 §39) :
 * ce composant est ce qui les différencie visuellement.
 */
export function ThemeProvider({ theme, children, className }: ThemeProviderProps) {
  return (
    <div
      style={themeToCssVars(theme)}
      data-card-style={theme.cardStyle}
      data-button-style={theme.buttonStyle}
      className={className ?? "min-h-dvh bg-cfe-background text-cfe-text"}
    >
      {children}
    </div>
  );
}
