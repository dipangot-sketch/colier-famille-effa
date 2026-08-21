import "server-only";
import { prisma } from "@/lib/prisma";
import type { ThemeTokens } from "@/lib/themes/types";

/** Thème neutre utilisé quand aucun profil n'est encore identifié (Partie 9 §11 : la lisibilité prime). */
export const FALLBACK_THEME: ThemeTokens = {
  slug: "minimal",
  name: "Minimaliste",
  primaryColor: "#333333",
  secondaryColor: "#FFFFFF",
  accentColor: "#666666",
  backgroundColor: "#FAFAFA",
  surfaceColor: "rgba(255,255,255,0.85)",
  textColor: "#1A1A1A",
  mutedTextColor: "#767676",
  fontDisplay: "'Inter', sans-serif",
  fontBody: "'Inter', sans-serif",
  fontLetter: "'Inter', sans-serif",
  avatarDefaultShape: "SQUARE_ROUNDED",
  cardStyle: "flat",
  buttonStyle: "sharp",
  decorationConfig: {},
  animationConfig: {},
};

type SettingsWithTheme = {
  primaryColorOverride: string | null;
  fontFamilyOverride: string | null;
  avatarShape: ThemeTokens["avatarDefaultShape"];
  theme: {
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
    cardStyle: string;
    buttonStyle: string;
    decorationConfig: unknown;
    animationConfig: unknown;
  };
};

export function settingsToThemeTokens(settings: SettingsWithTheme | null): ThemeTokens {
  if (!settings) return FALLBACK_THEME;
  return {
    slug: settings.theme.slug,
    name: settings.theme.name,
    primaryColor: settings.primaryColorOverride ?? settings.theme.primaryColor,
    secondaryColor: settings.theme.secondaryColor,
    accentColor: settings.theme.accentColor,
    backgroundColor: settings.theme.backgroundColor,
    surfaceColor: settings.theme.surfaceColor,
    textColor: settings.theme.textColor,
    mutedTextColor: settings.theme.mutedTextColor,
    fontDisplay: settings.theme.fontDisplay,
    fontBody: settings.theme.fontBody,
    fontLetter: settings.fontFamilyOverride ?? settings.theme.fontLetter,
    avatarDefaultShape: settings.avatarShape,
    cardStyle: settings.theme.cardStyle,
    buttonStyle: settings.theme.buttonStyle,
    decorationConfig: settings.theme.decorationConfig as Record<string, unknown>,
    animationConfig: settings.theme.animationConfig as Record<string, unknown>,
  };
}

export async function getProfileBySlugWithTheme(slug: string) {
  const profile = await prisma.profile.findUnique({
    where: { profileSlug: slug },
    include: {
      user: { include: { role: true } },
      settings: { include: { theme: true } },
      letters: { where: { isCurrent: true }, take: 1 },
      musicTracks: { where: { isActive: true }, take: 1, include: { media: true } },
      avatarMedia: true,
    },
  });

  if (!profile || !profile.isActive) return null;

  const theme: ThemeTokens = profile.settings
    ? {
        slug: profile.settings.theme.slug,
        name: profile.settings.theme.name,
        primaryColor: profile.settings.primaryColorOverride ?? profile.settings.theme.primaryColor,
        secondaryColor: profile.settings.theme.secondaryColor,
        accentColor: profile.settings.theme.accentColor,
        backgroundColor: profile.settings.theme.backgroundColor,
        surfaceColor: profile.settings.theme.surfaceColor,
        textColor: profile.settings.theme.textColor,
        mutedTextColor: profile.settings.theme.mutedTextColor,
        fontDisplay: profile.settings.theme.fontDisplay,
        fontBody: profile.settings.theme.fontBody,
        fontLetter: profile.settings.fontFamilyOverride ?? profile.settings.theme.fontLetter,
        avatarDefaultShape: profile.settings.avatarShape,
        cardStyle: profile.settings.theme.cardStyle,
        buttonStyle: profile.settings.theme.buttonStyle,
        decorationConfig: profile.settings.theme.decorationConfig as Record<string, unknown>,
        animationConfig: profile.settings.theme.animationConfig as Record<string, unknown>,
      }
    : FALLBACK_THEME;

  return { profile, theme };
}

/**
 * FAMILY_ADMIN et SUPER_ADMIN voient actuellement les mêmes profils
 * actifs (Partie 4 §33, Partie 9 §37). Le paramètre est conservé pour
 * permettre une restriction future par profil sans changer la
 * signature de la fonction.
 */
export async function listAccessibleProfiles() {
  return prisma.profile.findMany({
    where: { isActive: true },
    include: {
      user: { include: { role: true } },
      settings: { include: { theme: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}
