import Link from "next/link";
import { getPendingProfileSlug } from "@/lib/auth/pendingProfile";
import { getProfileBySlugWithTheme, FALLBACK_THEME } from "@/lib/data/profile";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/forms/PasswordField";
import { DecorativeLayer } from "@/components/profile/DecorativeLayer";
import { loginAction } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Identifiants incorrects.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const pendingSlug = await getPendingProfileSlug();

  const resolved = pendingSlug ? await getProfileBySlugWithTheme(pendingSlug) : null;
  const theme = resolved?.theme ?? FALLBACK_THEME;
  const displayName = resolved?.profile.displayName ?? null;

  return (
    <ThemeProvider theme={theme}>
      <main
        className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-12"
        style={{
          background: `radial-gradient(circle at 50% 0%, var(--cfe-primary) 0%, transparent 45%), var(--cfe-background)`,
        }}
      >
        <DecorativeLayer decorationConfig={theme.decorationConfig} animationConfig={theme.animationConfig} />
        <GlassPanel className="relative w-full max-w-sm p-8">
          <div className="mb-8 text-center">
            <p
              className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--cfe-muted)]"
              style={{ fontFamily: "var(--cfe-font-body)" }}
            >
              Colier Famille Effa
            </p>
            <h1
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--cfe-font-display)" }}
            >
              {displayName ? `Connexion à l'espace de ${displayName.split(" ")[0]}` : "Connexion"}
            </h1>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
              {ERROR_MESSAGES[error] ?? "Une erreur est survenue. Réessaie."}
            </div>
          )}

          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="redirectTarget" value="/login" />
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-[var(--cfe-muted)]"
              >
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-white/15 bg-black/10 px-4 py-3 text-sm outline-none placeholder:text-[var(--cfe-muted)] focus:border-[var(--cfe-accent)]"
              />
            </div>

            <PasswordField name="password" label="Mot de passe" autoComplete="current-password" />

            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--cfe-muted)]">
            Compte administrateur système ?{" "}
            <Link href="/super-admin/login" className="underline underline-offset-2">
              Connexion Super Admin
            </Link>
          </p>
        </GlassPanel>
      </main>
    </ThemeProvider>
  );
}
