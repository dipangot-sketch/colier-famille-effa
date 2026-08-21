import "server-only";
import { cookies } from "next/headers";

const QR_FLASH_COOKIE = "cfe_new_qr_flash";

type QrFlashPayload = {
  profileSlug: string;
  profileName: string;
  token: string;
  accessUrl: string;
};

/**
 * Le token en clair d'un QR nouvellement généré ne doit apparaître
 * qu'une seule fois à l'écran (Partie 4 §41, Partie 8 §54). Plutôt que
 * de le faire transiter par l'URL (visible dans l'historique/les logs
 * serveur), on le pose brièvement dans un cookie HttpOnly, lu puis
 * immédiatement supprimé au prochain rendu de la page.
 */
export async function setQrFlash(payload: QrFlashPayload): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(QR_FLASH_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/super-admin",
    maxAge: 120,
  });
}

export async function getAndClearQrFlash(): Promise<QrFlashPayload | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(QR_FLASH_COOKIE)?.value;
  if (!raw) return null;
  cookieStore.delete(QR_FLASH_COOKIE);
  try {
    return JSON.parse(raw) as QrFlashPayload;
  } catch {
    return null;
  }
}
