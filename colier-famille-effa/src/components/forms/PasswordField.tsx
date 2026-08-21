"use client";

import { useId, useState } from "react";

type PasswordFieldProps = {
  name: string;
  label: string;
  autoComplete?: string;
  required?: boolean;
};

/**
 * Champ mot de passe masqué par défaut, avec bouton pour l'afficher
 * temporairement (Partie 2 §65, Partie 5 §3).
 */
export function PasswordField({ name, label, autoComplete, required = true }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-[var(--cfe-muted)]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-white/15 bg-black/10 px-4 py-3 pr-20 text-sm text-[var(--cfe-text)] outline-none placeholder:text-[var(--cfe-muted)] focus:border-[var(--cfe-accent)]"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-[var(--cfe-muted)] hover:text-[var(--cfe-text)]"
        >
          {visible ? "Masquer" : "Afficher"}
        </button>
      </div>
    </div>
  );
}
