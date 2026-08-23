import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getAndClearQrFlash } from "@/lib/auth/qrFlash";
import { generateQrDataUrl } from "@/lib/qrImage";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { CopyLinkButton } from "@/components/ui/CopyLinkButton";
import { logoutAction } from "@/lib/auth/logoutAction";
import { revokeQrAction, generateQrAction } from "./actions";

const ROLE_LABELS: Record<string, string> = {
  MEMBER: "Membre",
  FAMILY_ADMIN: "Administrateur familial",
  SUPER_ADMIN: "Super administrateur",
};

export default async function SuperAdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/super-admin/login");
  if (user.mustChangePassword) redirect("/change-password");
  if (user.role !== "SUPER_ADMIN") redirect("/select-profile");

  const flash = await getAndClearQrFlash();
  const flashQrImage = flash ? await generateQrDataUrl(flash.accessUrl) : null;

  const profiles = await prisma.profile.findMany({
    where: { isActive: true },
    include: {
      user: { include: { role: true } },
      qrTokens: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="min-h-dvh bg-neutral-950 px-6 py-10 text-neutral-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">
              Colier Famille Effa
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Administration</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/select-profile"
              className="rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-white/5"
            >
              Espaces familiaux
            </a>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-white/5"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>

        {flash && flashQrImage && (
          <GlassPanel className="mb-8 flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={flashQrImage}
              alt={`QR code pour ${flash.profileName}`}
              className="h-40 w-40 rounded-xl bg-white p-2"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-emerald-300">
                Nouveau QR généré pour {flash.profileName}
              </p>
              <p className="mt-1 break-all text-xs text-neutral-400">{flash.accessUrl}</p>
              <p className="mt-2 text-xs text-neutral-500">
                Ce lien ne sera plus réaffiché : télécharge ou imprime le QR maintenant.
              </p>
              <div className="mt-3">
                <CopyLinkButton value={flash.accessUrl} />
              </div>
            </div>
          </GlassPanel>
        )}

        <div className="space-y-4">
          {profiles.map((profile: (typeof profiles)[number]) => {
            type QrTokenRow = (typeof profile.qrTokens)[number];
            const activeQr = profile.qrTokens.find((qr: QrTokenRow) => qr.status === "ACTIVE");
            const revokedCount = profile.qrTokens.filter((qr: QrTokenRow) => qr.status === "REVOKED").length;

            return (
              <GlassPanel key={profile.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{profile.displayName}</p>
                    <p className="mt-0.5 text-xs uppercase tracking-wide text-neutral-500">
                      {ROLE_LABELS[profile.user.role.name] ?? profile.user.role.name} · /{profile.profileSlug}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {activeQr ? (
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                        QR actif
                      </span>
                    ) : (
                      <span className="rounded-full bg-neutral-500/15 px-3 py-1 text-xs font-medium text-neutral-400">
                        Aucun QR actif
                      </span>
                    )}
                    {revokedCount > 0 && (
                      <span className="text-xs text-neutral-500">{revokedCount} révoqué(s)</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {activeQr && (
                    <form action={revokeQrAction} className="flex items-center gap-2">
                      <input type="hidden" name="qrTokenId" value={activeQr.id} />
                      <select
                        name="reason"
                        className="rounded-lg border border-white/15 bg-black/20 px-2 py-1.5 text-xs text-neutral-200"
                        defaultValue="LOST"
                      >
                        <option value="LOST">Perdu</option>
                        <option value="STOLEN">Volé</option>
                        <option value="SECURITY">Sécurité</option>
                        <option value="OTHER">Autre</option>
                      </select>
                      <Button type="submit" variant="danger" className="px-4 py-2 text-xs">
                        Révoquer
                      </Button>
                    </form>
                  )}
                  {!activeQr && (
                    <form action={generateQrAction}>
                      <input type="hidden" name="profileId" value={profile.id} />
                      <Button type="submit" className="px-4 py-2 text-xs">
                        Générer un nouvel accès
                      </Button>
                    </form>
                  )}
                </div>
              </GlassPanel>
            );
          })}
        </div>

        <p className="mt-8 text-xs text-neutral-600">
          Création de nouveaux profils, gestion fine des thèmes et journal d&rsquo;activité détaillé :
          phase suivante.
        </p>
      </div>
    </main>
  );
}
