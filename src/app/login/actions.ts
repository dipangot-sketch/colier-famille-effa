"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validators/auth";
import { PENDING_PROFILE_COOKIE } from "@/lib/auth/pendingProfile";

/**
 * RÈGLE (Partie 4 §5, Partie 8 §37) :
 * Le message d'erreur doit rester générique — ne jamais révéler si
 * l'e-mail existe ou non, ni si c'est l'e-mail ou le mot de passe qui
 * est incorrect.
 */
export async function loginAction(formData: FormData): Promise<void> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const redirectTarget = (formData.get("redirectTarget") as string | null) ?? "/login";

  if (!parsed.success) {
    redirect(`${redirectTarget}?error=invalid`);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user || !user.isActive) {
    redirect(`${redirectTarget}?error=invalid`);
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    redirect(`${redirectTarget}?error=invalid`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession(user.id);

  const cookieStore = await cookies();
  cookieStore.delete(PENDING_PROFILE_COOKIE);

  if (user.mustChangePassword) {
    redirect("/change-password");
  }

  if (user.role.name === "SUPER_ADMIN") {
    redirect("/select-profile");
  }

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  if (user.role.name === "FAMILY_ADMIN") {
    redirect("/select-profile");
  }

  if (profile) {
    redirect(`/profile/${profile.profileSlug}`);
  }

  redirect("/select-profile");
}
