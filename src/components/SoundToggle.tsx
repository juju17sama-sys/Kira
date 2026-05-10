// ╔══════════════════════════════════════════════════════════════════╗
// ║  SOUND TOGGLE — Bouton minimaliste mute / unmute                 ║
// ║  Position : coin haut-droit, discret, en accord avec l'or olympe ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useState } from 'react';
import { isMuted, setMuted } from '../utils/sound';

export function SoundToggle() {
  const [m, setM] = useState(isMuted());
  const toggle = () => {
    const next = !m;
    setMuted(next);
    setM(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={m ? 'Activer le son' : 'Couper le son'}
      title={m ? 'Activer le son' : 'Couper le son'}
      className="fixed top-6 right-6 z-50 w-10 h-10 flex items-center justify-center bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-gold/40 hover:border-gold-light/80 rounded-sm transition-all"
    >
      {m ? (
        // Icône mute — note barrée
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-gold-light/80">
          <path d="M3 10v4h4l5 4V6L7 10H3z" fill="currentColor" stroke="none" />
          <line x1="16" y1="9" x2="22" y2="15" />
          <line x1="22" y1="9" x2="16" y2="15" />
        </svg>
      ) : (
        // Icône son — vagues
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-gold-light">
          <path d="M3 10v4h4l5 4V6L7 10H3z" fill="currentColor" stroke="none" />
          <path d="M16 8c1.5 1.2 2.5 2.5 2.5 4s-1 2.8-2.5 4" />
          <path d="M19 5c2.5 2 4 4.3 4 7s-1.5 5-4 7" />
        </svg>
      )}
    </button>
  );
}
