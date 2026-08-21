"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { MusicPlayerBar } from "@/components/music/MusicPlayerBar";
import { logoutAction } from "@/lib/auth/logoutAction";

type NavItem = { label: string; href: string };

type SideMenuProps = {
  displayName: string;
  avatarShape: "CIRCLE" | "HEART" | "SQUARE_ROUNDED" | "HEXAGON" | "DIAMOND" | "OVAL" | "STAR";
  trackTitle: string | null;
  trackUrl: string | null;
  navItems: NavItem[];
  showSwitchProfile: boolean;
};

/**
 * Un seul menu, entièrement piloté par le thème actif (variables CSS)
 * et par la liste d'éléments réellement disponibles (Partie 2 §80 :
 * "les éléments auxquels la personne n'a pas accès ne doivent pas
 * apparaître" — étendu ici aux fonctionnalités pas encore construites,
 * pour ne jamais afficher de bouton qui ne fait rien, Partie 12 §98).
 */
export function SideMenu({
  displayName,
  avatarShape,
  trackTitle,
  trackUrl,
  navItems,
  showSwitchProfile,
}: SideMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="cfe-glass fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full sm:left-6 sm:top-6"
      >
        <Menu size={19} strokeWidth={1.75} />
      </button>

      {open && (
        <button
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] transform flex-col gap-6 p-6 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--cfe-surface)", backdropFilter: "blur(24px)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ProfileAvatar shape={avatarShape} initial={displayName.charAt(0)} size={48} />
            <div>
              <p className="text-sm font-semibold" style={{ fontFamily: "var(--cfe-font-display)" }}>
                {displayName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer"
            className="text-[var(--cfe-muted)]"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <MusicPlayerBar trackTitle={trackTitle} trackUrl={trackUrl} />

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-[var(--cfe-text)] hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
          {showSwitchProfile && (
            <Link
              href="/select-profile"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-[var(--cfe-text)] hover:bg-white/10"
            >
              Changer d&rsquo;espace
            </Link>
          )}
        </nav>

        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-xl border border-red-400/30 px-3 py-3 text-left text-sm font-medium text-red-300 hover:bg-red-500/10"
          >
            Déconnexion
          </button>
        </form>
      </aside>
    </>
  );
}
