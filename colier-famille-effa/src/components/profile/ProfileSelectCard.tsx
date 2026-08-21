import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import type { ThemeTokens } from "@/lib/themes/types";
import { themeToCssVars } from "@/lib/themes/toCssVars";

type ProfileSelectCardProps = {
  href: string;
  displayName: string;
  roleLabel: string;
  theme: ThemeTokens;
};

/**
 * Cartes d'identité modernes (Partie 5 §32-33, Partie 9 §35-36) : léger
 * effet de profondeur au survol, sans excès — la version tactile
 * s'appuie simplement sur l'état :active.
 */
export function ProfileSelectCard({ href, displayName, roleLabel, theme }: ProfileSelectCardProps) {
  return (
    <Link href={href} className="group block">
      <GlassPanel
        style={themeToCssVars(theme)}
        className="relative overflow-hidden p-6 transition-transform duration-300 ease-out group-hover:-translate-y-1 group-active:scale-[0.98]"
      >
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background: `linear-gradient(135deg, var(--cfe-primary) 0%, transparent 60%)`,
          }}
        />
        <div className="relative">
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white"
            style={{ background: "var(--cfe-primary)" }}
          >
            {displayName.charAt(0)}
          </div>
          <p
            className="text-lg font-semibold text-[var(--cfe-text)]"
            style={{ fontFamily: "var(--cfe-font-display)" }}
          >
            {displayName}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wide text-[var(--cfe-muted)]">{roleLabel}</p>
        </div>
      </GlassPanel>
    </Link>
  );
}
