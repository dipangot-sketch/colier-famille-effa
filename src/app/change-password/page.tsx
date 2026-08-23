import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getProfileBySlugWithTheme, FALLBACK_THEME } from "@/lib/data/profile";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/forms/PasswordField";
import { changePasswordAction } from "./actions";

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const resolved = user.profile ? await getProfileBySlugWithTheme(user.profile.profileSlug) : null;
  const theme = resolved?.theme ?? FALLBACK_THEME;

  return (
    <ThemeProvider theme={theme}>
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
        <GlassPanel className="w-full max-w-sm p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--cfe-font-display)" }}>
              Crée ton nouveau mot de passe
            </h1>
            <p className="mt-2 text-sm text-[var(--cfe-muted)]">
              Ton mot de passe actuel est temporaire. Choisis-en un nouveau pour continuer.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={changePasswordAction} className="space-y-4">
            <PasswordField name="newPassword" label="Nouveau mot de passe" autoComplete="new-password" />
            <PasswordField
              name="confirmPassword"
              label="Confirmer le nouveau mot de passe"
              autoComplete="new-password"
            />
            <p className="text-xs text-[var(--cfe-muted)]">
              Au moins 8 caractères, avec des lettres et des chiffres.
            </p>
            <Button type="submit" className="w-full">
              Enregistrer
            </Button>
          </form>
        </GlassPanel>
      </main>
    </ThemeProvider>
  );
}
