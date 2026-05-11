// ╔══════════════════════════════════════════════════════════════════╗
// ║  SPEECH BUBBLE — Bulle de dialogue divine                        ║
// ║                                                                  ║
// ║  Le dieu parle EN PERSONNE — la bulle apparaît à côté de lui     ║
// ║  avec une queue pointant vers le personnage.                     ║
// ║                                                                  ║
// ║  Style : parchemin de marbre, typo serif, palette du dieu, tres  ║
// ║  intégrée à l'univers (pas un toast SaaS).                       ║
// ╚══════════════════════════════════════════════════════════════════╝

import { motion } from 'framer-motion';
import type { God } from '../data/gods';

interface Props {
  god: God;
  text: string;
  tone: 'idle' | 'working' | 'blocked';
  /** Position de la queue : "left" = bulle à gauche du dieu, "right" = à droite */
  pointTo?: 'left' | 'right';
  /** Mode inline (sans queue) : pour intégrer dans le parchemin */
  inline?: boolean;
  className?: string;
  /** Optionnel : action à déclencher au clic (CTA) */
  cta?: { label: string; onClick: () => void };
}

export function SpeechBubble({
  god,
  text,
  tone,
  pointTo = 'left',
  inline = false,
  className = '',
  cta,
}: Props) {
  // Couleur de bordure selon le ton
  const borderColor =
    tone === 'blocked'
      ? '#b22d3f'
      : tone === 'working'
        ? god.palette.primary
        : 'rgba(201,162,74,0.55)';

  const accentColor = tone === 'blocked' ? '#b22d3f' : god.palette.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.7 }}
      className={`relative max-w-md ${className}`}
    >
      <div
        className={`relative px-6 py-5 rounded-sm ${
          inline ? '' : 'shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-md'
        }`}
        style={{
          background: inline
            ? 'rgba(26,20,12,0.06)' // tres legere teinte sombre sur le parchemin
            : 'linear-gradient(180deg, rgba(244,236,220,0.96) 0%, rgba(232,220,195,0.96) 100%)',
          border: `2px solid ${borderColor}`,
          borderLeftWidth: inline ? '4px' : '2px',
        }}
      >
        {/* Étiquette en haut : nom du dieu qui parle */}
        <div
          className="font-serif text-[11px] tracking-[0.35em] mb-1.5 uppercase"
          style={{ color: accentColor }}
        >
          ⟁ {god.name}
        </div>

        {/* Texte du dialogue */}
        <div className="font-body italic text-ink/90 text-lg leading-relaxed">
          « {text} »
        </div>

        {/* Bouton CTA optionnel */}
        {cta && (
          <button
            onClick={cta.onClick}
            className="mt-4 px-4 py-2 font-serif text-xs tracking-[0.3em] transition-all hover:brightness-110"
            style={{
              border: `2px solid ${accentColor}`,
              color: tone === 'blocked' ? 'white' : accentColor,
              background: tone === 'blocked' ? accentColor : 'transparent',
            }}
          >
            {cta.label}
          </button>
        )}

        {/* ─── Queue de la bulle (pointe vers le dieu) — desactivee en mode inline ─── */}
        {!inline && (
          <>
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 ${
                pointTo === 'left' ? '-left-3' : '-right-3'
              }`}
              style={{
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                ...(pointTo === 'left'
                  ? { borderRight: `12px solid ${borderColor}` }
                  : { borderLeft: `12px solid ${borderColor}` }),
              }}
            />
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 ${
                pointTo === 'left' ? '-left-[10px]' : '-right-[10px]'
              }`}
              style={{
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                ...(pointTo === 'left'
                  ? { borderRight: '10px solid rgba(244,236,220,0.96)' }
                  : { borderLeft: '10px solid rgba(244,236,220,0.96)' }),
              }}
            />
          </>
        )}
      </div>
    </motion.div>
  );
}
