/**
 * Un thème ne pilote QUE la présentation (Partie 9 §57, Partie 5 §56).
 * Il ne contrôle jamais les permissions, les rôles, l'authentification
 * ou la sécurité — ces éléments vivent exclusivement côté serveur dans
 * lib/permissions et lib/auth.
 */
export type ThemeTokens = {
  slug: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  fontDisplay: string;
  fontBody: string;
  fontLetter: string;
  avatarDefaultShape: string;
  cardStyle: string;
  buttonStyle: string;
  decorationConfig: Record<string, unknown>;
  animationConfig: Record<string, unknown>;
};
