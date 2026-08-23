/**
 * PHASE 2 : le stockage des médias (photos, vidéos, musiques) n'est pas
 * encore branché sur un service compatible S3 (Partie 2 §27, Partie 7
 * §39, Partie 8 §46). En attendant, cette fonction retourne la clé de
 * stockage telle quelle ; elle sera remplacée par la génération d'une
 * URL signée à durée limitée, pour que les fichiers privés ne soient
 * jamais accessibles via une URL publique devinable (Partie 49).
 */
export function resolveMediaUrl(storageKey: string | null | undefined): string | null {
  if (!storageKey) return null;
  return storageKey;
}
