import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { GlassPanel } from "@/components/ui/GlassPanel";

/**
 * Cette page n'est normalement atteinte qu'en dehors du parcours QR
 * habituel (scan → /access/[token] → /login). Si une session valide
 * existe déjà, on redirige directement vers le bon espace ; sinon, on
 * affiche un message neutre plutôt qu'un formulaire de connexion
 * générique (Partie 4 §2 : le QR est le point d'entrée normal).
 */
export default async function RootPage() {
  const user = await getCurrentUser();

  if (user) {
    if (user.mustChangePassword) {
      redirect("/change-password");
    }
    if (user.role === "SUPER_ADMIN" || user.role === "FAMILY_ADMIN") {
      redirect("/select-profile");
    }
    if (user.profile) {
      redirect(`/profile/${user.profile.profileSlug}`);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-950 px-6 text-neutral-100">
      <GlassPanel className="max-w-sm p-8 text-center">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
          Colier Famille Effa
        </p>
        <h1 className="mb-3 text-lg font-medium">Scanne ton collier pour accéder à ton espace</h1>
        <p className="text-sm text-neutral-400">
          Compte administrateur système ?{" "}
          <a href="/super-admin/login" className="underline underline-offset-2">
            Se connecter ici
          </a>
        </p>
      </GlassPanel>
    </main>
  );
}
