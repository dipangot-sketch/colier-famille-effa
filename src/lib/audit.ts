import "server-only";
import { prisma } from "@/lib/prisma";

export async function logAudit(params: {
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  // RÈGLE (Partie 3 §34) : ne jamais journaliser de mot de passe, hash,
  // token de session ou autre secret dans metadata.
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: params.metadata as any, // Correction du typage Prisma
    },
  });
}