import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * RÈGLE (Partie 3 §10-11, Partie 4 §42, Partie 8 §2) :
 * - Le QR ne contient jamais le mot de passe ni les données privées.
 * - Il porte uniquement un token aléatoire, imprévisible.
 * - Seul un hash du token est stocké en base.
 * - Le profil n'est jamais recréé lors d'un remplacement de QR : on
 *   révoque l'ancien token puis on en crée un nouveau pour le même
 *   profileId.
 */

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function buildAccessUrl(baseUrl: string, token: string): string {
  return `${baseUrl.replace(/\/$/, "")}/access/${token}`;
}

export async function createQrTokenForProfile(
  profileId: string,
  createdById: string,
  label?: string
) {
  const token = randomBytes(24).toString("base64url");
  const tokenHash = hashToken(token);

  const record = await prisma.qrToken.create({
    data: {
      profileId,
      tokenHash,
      createdById,
      label,
    },
  });

  // Le token en clair n'est renvoyé qu'une seule fois, au moment de la
  // création, pour être encodé dans l'image QR puis affiché/exporté par
  // l'administrateur. Il n'est jamais recalculable ensuite.
  return { plainToken: token, record };
}

export type QrResolution =
  | { status: "VALID"; profileId: string; profileSlug: string; displayName: string }
  | { status: "INVALID" }
  | { status: "REVOKED" }
  | { status: "PROFILE_INACTIVE" };

export async function resolveQrToken(token: string): Promise<QrResolution> {
  const tokenHash = hashToken(token);

  const record = await prisma.qrToken.findUnique({
    where: { tokenHash },
    include: { profile: { select: { id: true, profileSlug: true, displayName: true, isActive: true } } },
  });

  if (!record) {
    return { status: "INVALID" };
  }

  if (record.status === "REVOKED") {
    return { status: "REVOKED" };
  }

  if (!record.profile.isActive) {
    return { status: "PROFILE_INACTIVE" };
  }

  await prisma.qrToken.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    status: "VALID",
    profileId: record.profile.id,
    profileSlug: record.profile.profileSlug,
    displayName: record.profile.displayName,
  };
}

export async function revokeQrToken(
  qrTokenId: string,
  reason: "LOST" | "STOLEN" | "REPLACED" | "SECURITY" | "OTHER" = "OTHER"
) {
  return prisma.qrToken.update({
    where: { id: qrTokenId },
    data: { status: "REVOKED", revokedAt: new Date(), revokeReason: reason },
  });
}
