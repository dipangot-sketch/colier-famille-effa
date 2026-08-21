import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/forms/PasswordField";
import { loginAction } from "../../login/actions";

const ADMIN_THEME = {
  slug: "admin",
  name: "Administration",
  primaryColor: "#6C63FF",
  secondaryColor: "#1A1B26",
  accentColor: "#FF6584",
  backgroundColor: "#0B0C14",
  surfaceColor: "rgba(255,255,255,0.06)",
  textColor: "#E8E8F0",
  mutedTextColor: "#9497B0",
  fontDisplay: "'Space Grotesk', sans-serif",
  fontBody: "'Inter', sans-serif",
  fontLetter: "'Space Grotesk', sans-serif",
  avatarDefaultShape: "SQUARE_ROUNDED",
  cardStyle: "glass-dark",
  buttonStyle: "sharp",
  decorationConfig: {},
  animationConfig: {},
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Identifiants incorrects.",
};

/**
 * Le SUPER_ADMIN ne dépend d'aucun collier (Partie 4 §11, Partie 6 §35-37,
 * Partie 11 §24-25). Cette route est publique mais n'accorde évidemment
 * aucun accès sans authentification correcte.
 */
export default async function SuperAdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <ThemeProvider theme={ADMIN_THEME}>
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
        <GlassPanel className="w-full max-w-sm p-8">
          <div className="mb-8 text-center">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--cfe-muted)]">
              Colier Famille Effa
            </p>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--cfe-font-display)" }}>
              Administration système
            </h1>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
              {ERROR_MESSAGES[error] ?? "Une erreur est survenue. Réessaie."}
            </div>
          )}

          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="redirectTarget" value="/super-admin/login" />
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[var(--cfe-muted)]">
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
        </GlassPanel>
      </main>
    </ThemeProvider>
  );
}
