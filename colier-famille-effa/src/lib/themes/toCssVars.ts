import type { ThemeTokens } from "./types";
import type { CSSProperties } from "react";

/**
 * Traduit un thème (venant de la base de données) en variables CSS
 * personnalisées, appliquées dynamiquement par ThemeProvider
 * (Partie 9 §40). Le reste de l'interface consomme uniquement ces
 * variables (--primary, --background, ...), jamais de couleurs en dur.
 */
export function themeToCssVars(theme: ThemeTokens): CSSProperties {
  return {
    "--cfe-primary": theme.primaryColor,
    "--cfe-secondary": theme.secondaryColor,
    "--cfe-accent": theme.accentColor,
    "--cfe-background": theme.backgroundColor,
    "--cfe-surface": theme.surfaceColor,
    "--cfe-text": theme.textColor,
    "--cfe-muted": theme.mutedTextColor,
    "--cfe-font-display": theme.fontDisplay,
    "--cfe-font-body": theme.fontBody,
    "--cfe-font-letter": theme.fontLetter,
  } as CSSProperties;
}
