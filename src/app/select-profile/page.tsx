import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listAccessibleProfiles, settingsToThemeTokens } from "@/lib/data/profile";
import { ProfileSelectCard } from "@/components/profile/ProfileSelectCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { logoutAction } from "@/lib/auth/logoutAction";

const ROLE_LABELS: Record<string, string> = {
  MEMBER: "Membre",
  FAMILY_ADMIN: "Administrateur familial",
  SUPER_ADMIN: "Super administrateur",
};

export default async function SelectProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }
  if (user.mustChangePassword) {
    redirect("/change-password");
  }
  if (user.role !== "FAMILY_ADMIN" && user.role !== "SUPER_ADMIN") {
    // Un MEMBER n'a qu'un seul espace : pas de sélecteur (Partie 6 §1).
    if (user.profile) redirect(`/profile/${user.profile.profileSlug}`);
    redirect("/login");
  }

  const profiles = await listAccessibleProfiles();

  return (
    <main className="min-h-dvh bg-neutral-950 px-6 py-12 text-neutral-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">
              Colier Famille Effa
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Choisis un espace</h1>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-white/5"
            >
              Déconnexion
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {profiles.map((profile: (typeof profiles)[number]) => (
            <ProfileSelectCard
              key={profile.id}
              href={`/profile/${profile.profileSlug}`}
              displayName={profile.displayName}
              roleLabel={ROLE_LABELS[profile.user.role.name] ?? profile.user.role.name}
              theme={settingsToThemeTokens(profile.settings)}
            />
          ))}

          {user.role === "SUPER_ADMIN" && (
            <a href="/super-admin" className="group block">
              <GlassPanel className="flex h-full flex-col justify-center p-6 transition-transform duration-300 ease-out group-hover:-translate-y-1">
                <p className="text-lg font-semibold">Administration</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
                  Comptes, QR codes, sécurité
                </p>
              </GlassPanel>
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
