// ╔══════════════════════════════════════════════════════════════════╗
// ║  HUB PANORAMIQUE — Vue d'ensemble du Mont Olympe                 ║
// ║  Le decor est l'interface. Pas de cartes, pas de panneaux fixes. ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GODS, type God, type GodStatus } from '../data/gods';
import { AlertGlyph } from './AlertGlyph';
import { AmbientLayer } from './AmbientLayer';

interface Props {
  // Statut courant de chaque dieu (pilote depuis le pipeline reel)
  statuses?: Partial<Record<God['id'], GodStatus>>;
  onSelect: (god: God) => void;
}

export function PanoramicHub({ statuses = {}, onSelect }: Props) {
  const [hovered, setHovered] = useState<God | null>(null);

  // ═══ Mode debug : touche D pour afficher/masquer les hotspots ═══
  // Active aussi via ?debug dans l'URL.
  const [debug, setDebug] = useState(
    () => typeof window !== 'undefined' && window.location.search.includes('debug'),
  );
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'd' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setDebug((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* ═══ Image de fond panoramique avec respiration de scene ═══ */}
      {/* Apparition initiale + respiration ambiante (scale 1.000 -> 1.006) */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      >
        <motion.img
          src="/olympe/mont-olympe.png"
          alt="Mont Olympe"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
          animate={{ scale: [1, 1.006, 1], y: [0, -2, 0] }}
          transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
        />
      </motion.div>

      {/* ═══ Couche ambiante : etincelles dorees + brume + rayons ═══ */}
      <AmbientLayer sparkCount={14} intensity={0.9} />

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

            {/* ═══ Mode debug : rectangle dore + label nom ═══ */}
            {debug && (
              <div className="absolute inset-0 border-2 border-yellow-300/80 bg-yellow-300/15 pointer-events-none">
                <div className="absolute -top-5 left-0 px-1.5 py-0.5 bg-yellow-300 text-black font-serif text-[10px] tracking-[0.15em] whitespace-nowrap">
                  {god.name.toUpperCase()} · {god.hotspot.x},{god.hotspot.y}
                </div>
              </div>
            )}

            {/* Indicateur "travaille" — flamme qui pulse au pied du dieu */}
            {status === 'working' && (
              <>
                <motion.div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                  style={{ background: god.palette.flame, filter: 'blur(2px)' }}
                  animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Aura douce — respiration coloree autour du dieu */}
                <motion.div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${god.palette.flame}33 0%, transparent 65%)`,
                  }}
                  animate={{ opacity: [0.25, 0.55, 0.25], scale: [0.9, 1.05, 0.9] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </>
            )}
          </button>
        );
      })}

      {/* Aucun cartouche au survol et aucun titre en haut :       */}
      {/* les noms sont deja graves dans la carte panoramique.     */}
      {/* L'immersion prime — la carte parle d'elle-meme.          */}

      {/* ═══ Indicateur mode debug — coin bas droit ═══ */}
      {debug && (
        <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-yellow-300/90 text-black font-serif text-[10px] tracking-[0.2em] pointer-events-none">
          MODE CALIBRATION · TOUCHE D POUR MASQUER
        </div>
      )}
    </div>
  );
}
