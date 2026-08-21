"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { hashPassword, isPasswordStrongEnough } from "@/lib/auth/password";
import { changePasswordSchema } from "@/lib/validators/auth";

/**
 * RÈGLE (Partie 4 §8, Partie 6 §9, Partie 8 §7-9) :
 * Un changement de mot de passe ne modifie jamais le rôle, le profil,
 * le QR, la lettre ni la musique — uniquement le hash du mot de passe
 * et le drapeau mustChangePassword.
 */
export async function changePasswordAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const parsed = changePasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect(`/change-password?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const strength = isPasswordStrongEnough(parsed.data.newPassword);
  if (!strength.valid) {
    redirect(`/change-password?error=${encodeURIComponent(strength.reason ?? "Mot de passe invalide.")}`);
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, mustChangePassword: false },
  });

  if (user.role === "SUPER_ADMIN" || user.role === "FAMILY_ADMIN") {
    redirect("/select-profile");
  }

  if (user.profile) {
    redirect(`/profile/${user.profile.profileSlug}`);
  }

  redirect("/select-profile");
}
