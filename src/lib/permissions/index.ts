import "server-only";
import { prisma } from "@/lib/prisma";
import type { RoleName } from "@/generated/prisma/client";
import type { SessionUser } from "@/lib/auth/session";

/**
 * RÈGLE ABSOLUE (Partie 4 §12, Partie 6 §45-46, Partie 8 §27, Partie 11 §47) :
 * La sécurité ne dépend JAMAIS uniquement du frontend. Chaque action
 * sensible doit être revérifiée ici, côté serveur, avant exécution.
 *
 * Liste des permissions — reflète exactement la Partie 7 §33-36 et la
 * Partie 3 §7 du cahier des charges. La table `Permission` en base est
 * la source de vérité (seedée depuis cette même liste) ; ces constantes
 * évitent les fautes de frappe dans le code applicatif.
 */
export const PERMISSIONS = {
  PROFILE_VIEW: "profile.view",
  PROFILE_EDIT: "profile.edit",
  THEME_VIEW: "theme.view",
  THEME_EDIT: "theme.edit",
  LETTER_VIEW: "letter.view",
  LETTER_EDIT: "letter.edit",
  AUDIO_VIEW: "audio.view",
  AUDIO_EDIT: "audio.edit",
  GALLERY_VIEW: "gallery.view",
  GALLERY_UPLOAD: "gallery.upload",
  GALLERY_DELETE: "gallery.delete",
  CHAT_VIEW: "chat.view",
  CHAT_SEND: "chat.send",
  CALENDAR_VIEW: "calendar.view",
  CALENDAR_EDIT: "calendar.edit",
  EVENTS_VIEW: "events.view",
  EVENTS_CREATE: "events.create",
  EVENTS_EDIT: "events.edit",
  GAMES_PLAY: "games.play",
  QR_CREATE: "qr.create",
  QR_REVOKE: "qr.revoke",
  QR_MANAGE: "qr.manage",
  USERS_MANAGE: "users.manage",
  ROLES_MANAGE: "roles.manage",
  PROFILES_CREATE: "profiles.create",
  PROFILES_DELETE: "profiles.delete",
  SECURITY_MANAGE: "security.manage",
  AUDIT_VIEW: "audit.view",
  SYSTEM_MANAGE: "system.manage",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Erreur levée quand une action est refusée. À traduire en 401/403 par l'appelant. */
export class AuthError extends Error {
  status: 401 | 403;
  constructor(message: string, status: 401 | 403) {
    super(message);
    this.status = status;
  }
}

export function requireAuth(user: SessionUser | null): SessionUser {
  if (!user) {
    throw new AuthError("Authentification requise.", 401);
  }
  return user;
}

export function requireRole(user: SessionUser, allowed: RoleName[]): void {
  if (!allowed.includes(user.role)) {
    throw new AuthError("Accès refusé pour ce rôle.", 403);
  }
}

const permissionCache = new Map<RoleName, Set<string>>();

async function getPermissionsForRole(role: RoleName): Promise<Set<string>> {
  const cached = permissionCache.get(role);
  if (cached) return cached;

  const rows: { permission: { code: string } }[] = await prisma.rolePermission.findMany({
    where: { role: { name: role } },
    select: { permission: { select: { code: true } } },
  });
  const set = new Set<string>(rows.map((r) => r.permission.code));
  permissionCache.set(role, set);
  return set;
}

/** À appeler après toute modification des permissions en base (admin). */
export function clearPermissionCache(): void {
  permissionCache.clear();
}

export async function hasPermission(
  user: SessionUser,
  code: PermissionCode
): Promise<boolean> {
  const perms = await getPermissionsForRole(user.role);
  return perms.has(code);
}

export async function requirePermission(
  user: SessionUser,
  code: PermissionCode
): Promise<void> {
  const allowed = await hasPermission(user, code);
  if (!allowed) {
    throw new AuthError("Permission insuffisante.", 403);
  }
}

/**
 * Un profil MEMBER ne peut consulter/agir que sur son propre espace.
 * FAMILY_ADMIN et SUPER_ADMIN peuvent accéder aux profils autorisés
 * (Partie 4 §32-33, Partie 6 §28-29).
 */
export function canAccessProfile(user: SessionUser, profileSlug: string): boolean {
  if (user.role === "SUPER_ADMIN" || user.role === "FAMILY_ADMIN") {
    return true;
  }
  return user.profile?.profileSlug === profileSlug;
}

/**
 * Seuls FAMILY_ADMIN et SUPER_ADMIN peuvent modifier la configuration
 * (thème, musique, lettre, fond) d'un profil autre que le leur.
 * Un MEMBER ne peut jamais modifier sa propre configuration officielle
 * (Partie 6 §92, Partie 11 §3).
 */
export function canEditProfileConfig(user: SessionUser): boolean {
  return user.role === "SUPER_ADMIN" || user.role === "FAMILY_ADMIN";
}
