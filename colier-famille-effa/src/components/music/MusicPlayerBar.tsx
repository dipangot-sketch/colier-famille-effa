"use client";

import { useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

type MusicPlayerBarProps = {
  trackTitle: string | null;
  trackUrl: string | null;
};

/**
 * RÈGLE (Partie 2 §79, Partie 5 §13, Partie 9 §52, Partie 12 §43) :
 * l'autoplay peut être bloqué par le navigateur mobile — prévoir un
 * bouton "Activer la musique" plutôt que de tenter un contournement.
 * RÈGLE (Partie 6 §118) : si aucune musique n'est configurée, afficher
 * un état vide clair plutôt qu'un lecteur cassé.
 */
export function MusicPlayerBar({ trackTitle, trackUrl }: MusicPlayerBarProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsManualStart, setNeedsManualStart] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);

  if (!trackUrl) {
    return (
      <div className="cfe-glass flex items-center gap-3 rounded-full px-4 py-2.5 text-xs text-[var(--cfe-muted)]">
        <span className="inline-block h-2 w-2 rounded-full bg-[var(--cfe-muted)]" />
        Aucune musique configurée pour ce profil.
      </div>
    );
  }

  const attemptPlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setIsPlaying(true);
      setNeedsManualStart(false);
    } catch {
      // Autoplay bloqué par le navigateur : proposer le démarrage manuel.
      setNeedsManualStart(true);
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      void attemptPlay();
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (audioRef.current) audioRef.current.volume = value;
  };

  return (
    <div className="cfe-glass flex w-full max-w-md items-center gap-3 rounded-full px-4 py-2.5">
      <audio
        ref={audioRef}
        src={trackUrl}
        loop
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Lecture"}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--cfe-primary)] text-white"
      >
        {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-[var(--cfe-text)]">{trackTitle}</p>
        {needsManualStart && (
          <button
            type="button"
            onClick={() => void attemptPlay()}
            className="text-[11px] font-medium text-[var(--cfe-accent)] underline underline-offset-2"
          >
            Activer la musique
          </button>
        )}
      </div>

      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={(e) => handleVolumeChange(Number(e.target.value))}
        className="w-16 accent-[var(--cfe-primary)]"
        aria-label="Volume"
      />

      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Réactiver le son" : "Couper le son"}
        className="shrink-0 text-xs text-[var(--cfe-muted)]"
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </div>
  );
}
