// ╔══════════════════════════════════════════════════════════════════╗
// ║  TERRASSE DU DIEU — Vue moyenne, le dieu plein corps             ║
// ║  Clic sur le dieu => parchemin d'action                          ║
// ║  Clic ailleurs ou bouton retour => hub panoramique               ║
// ╚══════════════════════════════════════════════════════════════════╝

import { motion } from 'framer-motion';
import type { God } from '../data/gods';

interface Props {
  god: God;
  onBack: () => void;
  onOpenPanel: () => void;
}

export function GodTerrace({ god, onBack, onOpenPanel }: Props) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <motion.img
        src={god.portraitSrc}
        alt={god.name}
        className="absolute inset-0 w-full h-full object-cover select-none"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        draggable={false}
        onClick={onOpenPanel}
      />

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-black/20" />

      {/* Bouton retour — discret, en haut a gauche */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 group focus:outline-none"
        aria-label="Retour au Mont Olympe"
      >
        <div className="flex items-center gap-3 px-5 py-2 bg-black/40 backdrop-blur-sm border border-gold/30 rounded-sm hover:border-gold/70 transition-colors">
          <span className="text-gold-light text-lg">‹</span>
          <span className="font-serif text-xs tracking-[0.3em] text-gold-light/80 group-hover:text-gold-light">
            MONT OLYMPE
          </span>
        </div>
      </button>

      {/* Cartouche d'identite du dieu — bas droite */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="absolute bottom-10 right-10 max-w-md"
      >
        <div className="px-7 py-5 bg-black/55 backdrop-blur-sm border border-gold/40 rounded-sm">
          <div
            className="font-serif text-3xl tracking-[0.25em]"
            style={{ color: god.palette.accent }}
          >
            {god.name.toUpperCase()}
          </div>
          <div className="font-body italic text-marble/85 text-base mt-1">
            {god.title}
          </div>
          <div className="font-body text-gold/70 text-sm mt-2 tracking-wider">
            {god.role}
          </div>
          <button
            onClick={onOpenPanel}
            className="mt-4 px-5 py-2 border border-gold/60 hover:border-gold-light hover:bg-gold/10 transition-colors font-serif text-xs tracking-[0.3em] text-gold-light"
          >
            CONSULTER
          </button>
        </div>
      </motion.div>

      {/* Indication discrete : "Cliquez le dieu pour interagir" */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none"
      >
        <div className="font-body italic text-marble/40 text-xs tracking-widest">
          — adressez-vous au dieu —
        </div>
      </motion.div>
    </div>
  );
}
