// ╔══════════════════════════════════════════════════════════════════╗
// ║  PANDORE VAULT — Vue spéciale archives                           ║
// ║                                                                  ║
// ║  La Boîte de Pandore n'est pas un agent comme les autres :       ║
// ║  c'est un LIEU. Quand on entre, la boîte est ouverte, la mémoire ║
// ║  du projet s'échappe en particules et les fragments d'archives   ║
// ║  flottent autour.                                                ║
// ║                                                                  ║
// ║  Esthétique : violet sacré + or, parchemin sombre, hibou.        ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ARCHIVES, type ArchiveEntry, type ArchiveKind } from '../data/archives';
import { getGod } from '../data/gods';
import { assetUrl } from '../utils/assets';
import { AmbientLayer } from './AmbientLayer';
import { usePipelineState } from '../pipeline/usePipeline';
import type { Mission } from '../pipeline/types';

interface Props {
  onBack: () => void;
}

const KIND_LABELS: Record<ArchiveKind, string> = {
  clip: 'Clips',
  'leçon': 'Leçons',
  'succès': 'Succès',
  erreur: 'Erreurs',
};

const KIND_COLORS: Record<ArchiveKind, string> = {
  clip: '#8a4dd6',       // violet sacré
  'leçon': '#c9a24a',    // or
  'succès': '#5dd6a4',   // vert succès très tamisé
  erreur: '#d65d6e',     // rouge bordeaux
};

const KIND_GLYPHS: Record<ArchiveKind, string> = {
  clip: '▶',
  'leçon': '◈',
  'succès': '✦',
  erreur: '⚠',
};

// Convertit une mission terminée en entrée d'archive consultable dans Pandore
function missionToArchive(m: Mission): ArchiveEntry {
  const stagesSummary = m.stages.map((s) => `${s.godId}`).join(' → ');
  return {
    id: `mission-${m.id}`,
    date: m.createdAt.slice(0, 10),
    kind: 'clip',
    title: m.title,
    detail: `Relais complet : ${stagesSummary}. Mission orchestrée par Cronos et archivée par Pandore.`,
    tags: ['mission', 'pipeline', 'auto'],
  };
}

export function PandoreVault({ onBack }: Props) {
  const pandore = getGod('pandore');
  const [filter, setFilter] = useState<ArchiveKind | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ArchiveEntry | null>(null);

  const pipeline = usePipelineState();

  // Fusion : missions auto-archivées (en haut) + archives de démo (statiques)
  const allArchives = useMemo(() => {
    const fromMissions = pipeline.archivedMissions.map(missionToArchive);
    return [...fromMissions, ...ARCHIVES];
  }, [pipeline.archivedMissions]);

  const filtered = useMemo(() => {
    let list = allArchives;
    if (filter !== 'all') list = list.filter((a) => a.kind === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.detail.toLowerCase().includes(q) ||
          a.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }
    // Plus récent en premier
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [filter, query, allArchives]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* ═══ Décor : la Boîte de Pandore (entree dolly-zoom dramatique) ═══ */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.25, opacity: 0, filter: 'blur(10px)' }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src={assetUrl(pandore.portraitSrc)}
          alt="Boîte de Pandore"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
          // Respiration plus prononcée — la boîte vibre, libère
          animate={{ scale: [1, 1.012, 1], y: [0, -4, 0] }}
          transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
        />
      </motion.div>

      {/* ═══ Couche ambiante violette intense — la mémoire qui s'échappe ═══ */}
      <AmbientLayer sparkCount={28} intensity={1.1} />

      {/* Voile sombre pour lisibilité du contenu */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-black/55 to-black/80" />

      {/* ═══ Bouton retour — haut gauche ═══ */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 group focus:outline-none z-30"
        aria-label="Retour au Mont Olympe"
      >
        <div className="flex items-center gap-3 px-5 py-2 bg-black/50 backdrop-blur-sm border border-violet-400/40 rounded-sm hover:border-violet-300/80 transition-colors">
          <span className="text-violet-200 text-lg">‹</span>
          <span className="font-serif text-xs tracking-[0.3em] text-violet-100/80 group-hover:text-violet-100">
            MONT OLYMPE
          </span>
        </div>
      </button>

      {/* ═══ Titre du lieu ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none z-20"
      >
        <div className="font-serif text-3xl sm:text-5xl tracking-[0.2em] sm:tracking-[0.3em] text-violet-100 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] px-4">
          BOÎTE DE PANDORE
        </div>
        <div className="font-body italic text-violet-200/80 text-sm mt-2 tracking-widest">
          mémoire du projet · origine des leçons
        </div>
      </motion.div>

      {/* ═══ Filtres — bandeau central ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="absolute top-32 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-2 z-20 max-w-[92vw] px-2"
      >
        <FilterChip
          label="Tout"
          active={filter === 'all'}
          color="#c690ff"
          onClick={() => setFilter('all')}
        />
        {(Object.keys(KIND_LABELS) as ArchiveKind[]).map((k) => (
          <FilterChip
            key={k}
            label={KIND_LABELS[k]}
            color={KIND_COLORS[k]}
            active={filter === k}
            onClick={() => setFilter(k)}
            glyph={KIND_GLYPHS[k]}
          />
        ))}

        {/* Recherche */}
        <div className="ml-4 flex items-center gap-2 px-4 py-1.5 bg-black/55 border border-violet-400/40 rounded-sm">
          <span className="text-violet-200/60 text-sm">⌕</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="rechercher dans la mémoire…"
            className="bg-transparent outline-none font-body italic text-violet-100 placeholder:text-violet-200/40 text-sm w-56"
          />
        </div>
      </motion.div>

      {/* ═══ Grille de fragments d'archives ═══ */}
      <div className="absolute inset-0 top-48 px-12 pb-12 overflow-y-auto z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto pt-4">
          <AnimatePresence>
            {filtered.map((entry, i) => (
              <motion.button
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                onClick={() => setSelected(entry)}
                className="group text-left p-5 bg-black/55 backdrop-blur-sm border border-violet-400/30 hover:border-violet-300/80 hover:bg-violet-900/30 transition-all rounded-sm"
                style={{ borderLeft: `3px solid ${KIND_COLORS[entry.kind]}` }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span
                    className="font-serif text-xl"
                    style={{ color: KIND_COLORS[entry.kind] }}
                  >
                    {KIND_GLYPHS[entry.kind]}
                  </span>
                  <span className="font-mono text-[10px] text-violet-200/50 tracking-wider">
                    {entry.date}
                  </span>
                </div>
                <div className="font-serif text-violet-50 text-base leading-snug mb-1.5 group-hover:text-white">
                  {entry.title}
                </div>
                <div className="font-body italic text-violet-100/65 text-sm line-clamp-2">
                  {entry.detail}
                </div>
                {entry.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {entry.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[10px] tracking-wider text-violet-200/50 px-1.5 py-0.5 border border-violet-400/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </motion.button>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 font-body italic text-violet-200/40">
              — la mémoire est silencieuse pour cette requête —
            </div>
          )}
        </div>
      </div>

      {/* ═══ Détail d'un fragment ═══ */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 backdrop-blur-md bg-black/60"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 240, damping: 26 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(640px,92vw)]"
            >
              <div
                className="relative px-9 py-8 bg-gradient-to-b from-violet-950/95 to-black/95 border-2 rounded-sm shadow-[0_0_60px_rgba(168,85,247,0.4)]"
                style={{ borderColor: KIND_COLORS[selected.kind] }}
              >
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-4 font-serif text-violet-200/70 hover:text-white text-2xl leading-none"
                  aria-label="Fermer"
                >
                  ×
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="font-serif text-3xl"
                    style={{ color: KIND_COLORS[selected.kind] }}
                  >
                    {KIND_GLYPHS[selected.kind]}
                  </span>
                  <span
                    className="font-serif text-xs tracking-[0.3em] uppercase"
                    style={{ color: KIND_COLORS[selected.kind] }}
                  >
                    {KIND_LABELS[selected.kind]}
                  </span>
                  <span className="ml-auto font-mono text-xs text-violet-200/50">
                    {selected.date}
                  </span>
                </div>
                <div className="font-serif text-2xl text-violet-50 leading-tight mb-4">
                  {selected.title}
                </div>
                <div className="font-body text-violet-100/85 text-base leading-relaxed">
                  {selected.detail}
                </div>
                {selected.tags && (
                  <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-violet-400/20">
                    {selected.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-xs tracking-wider text-violet-200/70 px-2 py-1 border border-violet-400/30"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Filtre — chip avec glyphe coloré
// ─────────────────────────────────────────────────────────────────────
function FilterChip({
  label,
  color,
  active,
  onClick,
  glyph,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
  glyph?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 border rounded-sm font-serif text-xs tracking-[0.2em] transition-all flex items-center gap-2"
      style={{
        borderColor: active ? color : 'rgba(168,85,247,0.3)',
        color: active ? color : 'rgba(255,255,255,0.7)',
        background: active ? `${color}15` : 'rgba(0,0,0,0.4)',
      }}
    >
      {glyph && <span style={{ color }}>{glyph}</span>}
      <span>{label.toUpperCase()}</span>
    </button>
  );
}
