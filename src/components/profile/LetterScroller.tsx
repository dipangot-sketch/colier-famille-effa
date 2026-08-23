"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

type LetterScrollerProps = {
  content: string;
  scrollSpeed: number; // secondes pour un aller simple
  scrollEnabled: boolean;
  opacity: number;
  canPause?: boolean;
};

/**
 * RÈGLE (Partie 2 §74-75, Partie 5 §10-12) :
 * - défilement lent, continu, jamais brutal ;
 * - jamais enfermée dans un bandeau opaque qui masque la photo ;
 * - la personne ne peut PAS modifier le texte, seulement la lecture
 *   (pause / reprise) si cette option est autorisée.
 */
export function LetterScroller({
  content,
  scrollSpeed,
  scrollEnabled,
  opacity,
  canPause = true,
}: LetterScrollerProps) {
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const shouldAnimate = scrollEnabled && !paused;

  return (
    <div className="relative w-full max-w-lg">
      <div
        ref={containerRef}
        className={cn(
          "cfe-glass max-h-[46vh] overflow-hidden rounded-2xl px-6 py-6 text-center sm:max-h-[52vh]"
        )}
      >
        <div
          className={shouldAnimate ? "cfe-letter-scroll" : ""}
          style={
            {
              "--cfe-scroll-duration": `${scrollSpeed}s`,
              "--cfe-scroll-distance": "-30%",
              opacity,
              fontFamily: "var(--cfe-font-letter)",
              whiteSpace: "pre-line",
              lineHeight: 1.9,
              fontSize: "1.05rem",
              textShadow: "0 1px 6px rgba(0,0,0,0.25)",
            } as React.CSSProperties
          }
        >
          {content}
        </div>
      </div>

      {canPause && scrollEnabled && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/30 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md"
        >
          {paused ? "Reprendre" : "Pause"}
        </button>
      )}
    </div>
  );
}
