import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessProfile } from "@/lib/permissions";
import { getProfileBySlugWithTheme } from "@/lib/data/profile";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SideMenu } from "@/components/layout/SideMenu";
import { LetterScroller } from "@/components/profile/LetterScroller";
import { DecorativeLayer } from "@/components/profile/DecorativeLayer";
import { resolveMediaUrl } from "@/lib/storage";

export default async function ProfileHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.mustChangePassword) redirect("/change-password");
  if (!canAccessProfile(user, slug)) {
    // Vérification serveur réelle, pas seulement un lien caché
    // (Partie 6 §45-46, Partie 8 §26-27) : un MEMBER ne peut pas ouvrir
    // l'espace d'un autre profil simplement en changeant l'URL.
    redirect(user.profile ? `/profile/${user.profile.profileSlug}` : "/select-profile");
  }

  const resolved = await getProfileBySlugWithTheme(slug);
  if (!resolved) notFound();

  const { profile, theme } = resolved;
  const letter = profile.letters[0] ?? null;
  const track = profile.musicTracks[0] ?? null;

  const navItems = [{ label: "Accueil", href: `/profile/${slug}` }];

  return (
    <ThemeProvider theme={theme}>
      <main className="relative min-h-dvh overflow-hidden">
        {/* Fond : dégradé thématique tant qu'aucune photo n'a été
            importée pour ce profil (Partie 2 §71, Partie 6 §118). */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 22% 8%, var(--cfe-primary) 0%, transparent 50%), radial-gradient(circle at 85% 88%, var(--cfe-accent) 0%, transparent 42%), radial-gradient(circle at 90% 10%, var(--cfe-secondary) 0%, transparent 38%), var(--cfe-background)`,
          }}
        />
        <div className="absolute inset-0 bg-black/10" />
        <DecorativeLayer
          decorationConfig={theme.decorationConfig}
          animationConfig={theme.animationConfig}
        />

        <SideMenu
          displayName={profile.displayName}
          avatarShape={theme.avatarDefaultShape as never}
          trackTitle={track?.title ?? null}
          trackUrl={resolveMediaUrl(track?.media?.storageKey)}
          navItems={navItems}
          showSwitchProfile={user.role === "FAMILY_ADMIN" || user.role === "SUPER_ADMIN"}
        />

        <div className="relative flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-24 text-center">
          <div>
            <p
              className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-[var(--cfe-muted)]"
              style={{ fontFamily: "var(--cfe-font-body)" }}
            >
              Colier Famille Effa
            </p>
            <h1
              className="text-4xl font-semibold sm:text-5xl"
              style={{ fontFamily: "var(--cfe-font-display)", color: "var(--cfe-text)" }}
            >
              {profile.displayName.split(" ")[0]}
            </h1>
          </div>

          {letter ? (
            <LetterScroller
              content={letter.content}
              scrollSpeed={letter.scrollSpeed}
              scrollEnabled={letter.scrollEnabled}
              opacity={letter.opacity}
            />
          ) : (
            <p className="text-sm text-[var(--cfe-muted)]">Aucune lettre configurée pour ce profil.</p>
          )}
        </div>
      </main>
    </ThemeProvider>
  );
}
