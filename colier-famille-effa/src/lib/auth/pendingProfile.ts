import "server-only";
import { cookies } from "next/headers";

/**
 * Après un scan de QR valide, on sait quel profil demande à se
 * connecter, mais l'utilisateur n'est PAS encore authentifié
 * (Partie 4 §5, Partie 8 §1). Ce cookie ne sert qu'à savoir quel thème
 * afficher sur l'écran de connexion — il ne contient aucune donnée
 * sensible et n'accorde aucun accès. Durée de vie courte.
 */
export const PENDING_PROFILE_COOKIE = "cfe_pending_profile";
const PENDING_PROFILE_TTL_MINUTES = 15;

export async function setPendingProfile(profileSlug: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PENDING_PROFILE_COOKIE, profileSlug, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_PROFILE_TTL_MINUTES * 60,
  });
}

export async function getPendingProfileSlug(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(PENDING_PROFILE_COOKIE)?.value ?? null;
}
