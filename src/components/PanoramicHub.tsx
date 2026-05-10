// ╔══════════════════════════════════════════════════════════════════╗
// ║  HUB PANORAMIQUE — Vue d'ensemble du Mont Olympe                 ║
// ║  Le decor est l'interface. Pas de cartes, pas de panneaux fixes. ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GODS, type God, type GodStatus } from '../data/gods';
import { AlertGlyph } from './AlertGlyph';

interface Props {
  // Statut courant de chaque dieu (pilote depuis le pipeline reel)
  statuses?: Partial<Record<God['id'], GodStatus>>;
  onSelect: (god: God) => void;
}

export function PanoramicHub({ statuses = {}, onSelect }: Props) {
  const [hovered, setHovered] = useState<God | null>(null);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Image de fond panoramique — couvre l'ecran */}
      <motion.img
        src="/olympe/mont-olympe.png"
        alt="Mont Olympe"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        draggable={false}
      />

      {/* Vignette douce pour ancrer la lecture */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/40" />

      {/* Zones cliquables au-dessus de chaque dieu */}
      {GODS.map((god) => {
        const status = statuses[god.id] ?? god.defaultStatus;
        const isHovered = hovered?.id === god.id;
        return (
          <button
            key={god.id}
            onMouseEnter={() => setHovered(god)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(god)}
            className="absolute group focus:outline-none"
            style={{
              left: `${god.hotspot.x - god.hotspot.w / 2}%`,
              top: `${god.hotspot.y - god.hotspot.h / 2}%`,
              width: `${god.hotspot.w}%`,
              height: `${god.hotspot.h}%`,
            }}
            aria-label={`Entrer dans le sanctuaire de ${god.name}`}
          >
            {/* Halo dore au survol — discret */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                opacity: isHovered ? 0.55 : 0,
                scale: isHovered ? 1.05 : 0.85,
              }}
              transition={{ duration: 0.4 }}
              style={{
                background:
                  'radial-gradient(circle, rgba(233,201,122,0.55) 0%, rgba(233,201,122,0) 70%)',
              }}
            />

            {/* Glyphe d'alerte — uniquement si l'agent est bloque */}
            {status === 'blocked' && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                <AlertGlyph />
              </div>
            )}

            {/* Indicateur "travaille" — flamme qui pulse subtilement */}
            {status === 'working' && (
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                style={{ background: god.palette.flame, filter: 'blur(2px)' }}
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
            )}
          </button>
        );
      })}

      {/* Cartouche de nom au survol — bas-centre, discret */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key={hovered.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <div className="px-8 py-3 bg-black/55 backdrop-blur-sm border border-gold/40 rounded-sm text-center">
              <div className="font-serif text-2xl tracking-[0.3em] text-gold-light">
                {hovered.name.toUpperCase()}
              </div>
              <div className="font-body italic text-marble/80 text-sm mt-1">
                {hovered.title}
              </div>
              <div className="font-body text-gold/70 text-xs mt-1 tracking-wider">
                {hovered.role}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Titre cockpit en haut, tres discret */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="font-serif text-gold-light/70 text-xs tracking-[0.5em]">
          MONT OLYMPE — CENTRE DE COMMANDEMENT
        </div>
      </div>
    </div>
  );
}
