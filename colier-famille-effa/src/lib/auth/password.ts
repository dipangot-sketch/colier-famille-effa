import bcrypt from "bcryptjs";

/**
 * RÈGLE (Partie 3 §52, Partie 12 §32) :
 * Les mots de passe ne doivent jamais être stockés en clair.
 *
 * Choix technique : bcryptjs (coût 12).
 * Le cahier des charges recommande Argon2id "ou une solution équivalente
 * correctement configurée". bcryptjs est retenu ici plutôt que argon2
 * natif car il s'agit d'une implémentation JavaScript pure : elle ne
 * nécessite aucune compilation native, ce qui la rend fiable sur tous
 * les environnements de déploiement (y compris les plateformes
 * serverless où la compilation native pose parfois problème). Un coût
 * de 12 offre un bon équilibre sécurité/performance en 2026 pour un
 * usage de ce type (peu de comptes, authentification peu fréquente).
 */

const BCRYPT_COST = 12;

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, BCRYPT_COST);
}

export async function verifyPassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Politique minimale de mot de passe (Partie 8 §8).
 * Refuse les mots de passe évidemment trop faibles.
 */
const WEAK_PASSWORDS = new Set([
  "1234",
  "0000",
  "1111",
  "password",
  "azerty",
  "123456",
  "12345678",
  "qwerty",
]);

export function isPasswordStrongEnough(password: string): {
  valid: boolean;
  reason?: string;
} {
  if (password.length < 8) {
    return { valid: false, reason: "Le mot de passe doit contenir au moins 8 caractères." };
  }
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return { valid: false, reason: "Ce mot de passe est trop simple. Choisis-en un autre." };
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return {
      valid: false,
      reason: "Le mot de passe doit contenir au moins une lettre et un chiffre.",
    };
  }
  return { valid: true };
}
