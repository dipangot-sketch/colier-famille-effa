"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAuth, requireRole } from "@/lib/permissions";
import { createQrTokenForProfile, revokeQrToken, buildAccessUrl } from "@/lib/auth/qr";
import { setQrFlash } from "@/lib/auth/qrFlash";
import { logAudit } from "@/lib/audit";

const REVOKE_REASONS = new Set(["LOST", "STOLEN", "REPLACED", "SECURITY", "OTHER"]);

/**
 * Perte d'un collier (Partie 4 §36-39, Partie 6 §6-7, Partie 8 §22,
 * Partie 11 §31-33) : révoquer l'ancien accès ne supprime jamais le
 * profil ni ses données. Chaque action passe par requireAuth +
 * requireRole côté serveur — la sécurité ne dépend jamais du frontend.
 */
export async function revokeQrAction(formData: FormData): Promise<void> {
  const sessionUser = requireAuth(await getCurrentUser());
  requireRole(sessionUser, ["SUPER_ADMIN"]);

  const qrTokenId = formData.get("qrTokenId") as string;
  const reasonRaw = formData.get("reason") as string;
  const reason = REVOKE_REASONS.has(reasonRaw)
    ? (reasonRaw as "LOST" | "STOLEN" | "REPLACED" | "SECURITY" | "OTHER")
    : "OTHER";

  const revoked = await revokeQrToken(qrTokenId, reason);

  await logAudit({
    actorUserId: sessionUser.id,
    action: "QR_REVOKED",
    targetType: "QrToken",
    targetId: revoked.id,
    metadata: { profileId: revoked.profileId, reason },
  });

  redirect("/super-admin");
}

export async function generateQrAction(formData: FormData): Promise<void> {
  const sessionUser = requireAuth(await getCurrentUser());
  requireRole(sessionUser, ["SUPER_ADMIN"]);

  const profileId = formData.get("profileId") as string;

  const profile = await prisma.profile.findUniqueOrThrow({ where: { id: profileId } });

  const { plainToken, record } = await createQrTokenForProfile(profileId, sessionUser.id, "Régénéré");

  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const accessUrl = buildAccessUrl(`${protocol}://${host}`, plainToken);

  await logAudit({
    actorUserId: sessionUser.id,
    action: "QR_CREATED",
    targetType: "QrToken",
    targetId: record.id,
    metadata: { profileId },
  });

  await setQrFlash({
    profileSlug: profile.profileSlug,
    profileName: profile.displayName,
    token: plainToken,
    accessUrl,
  });

  redirect("/super-admin");
}
