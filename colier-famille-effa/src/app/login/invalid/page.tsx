import { GlassPanel } from "@/components/ui/GlassPanel";

/**
 * RÈGLE (Partie 4 §43-45, Partie 6 §66-67, Partie 8 §16-19) :
 * Ne jamais révéler le nom, le profil ou toute donnée privée ici —
 * uniquement un message neutre et générique.
 */
const MESSAGES: Record<string, string> = {
  revoked: "Ce code d'accès n'est plus actif. Contacte l'administrateur pour obtenir un nouveau collier.",
  inactive: "Ce lien n'est plus disponible.",
  invalid: "Code d'accès invalide ou expiré.",
};

export default async function InvalidAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const message = MESSAGES[reason ?? "invalid"] ?? MESSAGES.invalid;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-950 px-6 text-neutral-100">
      <GlassPanel className="max-w-sm p-8 text-center">
        <h1 className="mb-3 text-lg font-medium">Accès indisponible</h1>
        <p className="text-sm text-neutral-300">{message}</p>
      </GlassPanel>
    </main>
  );
}
