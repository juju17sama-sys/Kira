// ╔══════════════════════════════════════════════════════════════════╗
// ║  ARCHIVES BUTTON — Accès à la Boîte de Pandore                   ║
// ║                                                                  ║
// ║  Pandore n'est plus un personnage visible sur le hub. Cette      ║
// ║  icône discrète (style coffre/grimoire) ouvre la vue archives.   ║
// ║  Position : coin haut-gauche, sous le titre.                     ║
// ╚══════════════════════════════════════════════════════════════════╝

import { motion } from 'framer-motion';

interface Props {
  onClick: () => void;
}

export function ArchivesButton({ onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 0.7 }}
      className="fixed top-6 left-6 group flex items-center gap-3 px-5 py-2.5 bg-black/45 backdrop-blur-sm border border-violet-400/40 hover:border-violet-300/80 hover:bg-violet-950/40 rounded-sm transition-all z-50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
      aria-label="Consulter les archives de Pandore"
    >
      {/* Glyphe coffre stylisé */}
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        className="text-violet-300 group-hover:text-violet-200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="7" width="18" height="13" rx="1.5" />
        <path d="M3 11h18" />
        <path d="M9 11v3" />
        <path d="M15 11v3" />
        <path d="M7 7c0-2 2-3 5-3s5 1 5 3" />
      </svg>
      <span className="font-serif text-xs tracking-[0.3em] text-violet-100/85 group-hover:text-violet-50">
        ARCHIVES
      </span>
    </motion.button>
  );
}
