// ╔══════════════════════════════════════════════════════════════════╗
// ║  CRONOS COMMAND ROOM — Salle du commandement du superviseur      ║
// ║                                                                  ║
// ║  Cronos est l'orchestrateur. Sa salle montre :                   ║
// ║   - toutes les missions actives en timeline                      ║
// ║   - le tempo global (missions du jour, durée moyenne)            ║
// ║   - un bouton invocation rapide                                  ║
// ║                                                                  ║
// ║  Esthétique : or sépia + crépuscule, style table de stratège.    ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GODS, getGod, type GodId } from '../data/gods';
import { assetUrl } from '../utils/assets';
import { AmbientLayer } from './AmbientLayer';
import { invokeMission, usePipelineState } from '../pipeline/usePipeline';
import { activeStage } from '../pipeline/mockSource';
import type { Mission } from '../pipeline/types';
import { sfxSelect } from '../utils/sound';

interface Props {
  onBack: () => void;
}

const GOD_PALETTE = (id: GodId) =>
  GODS.find((g) => g.id === id)?.palette ?? { primary: '#c9a24a', accent: '#e9c97a', flame: '#ffc94a' };

export function CronosCommandRoom({ onBack }: Props) {
  const cronos = getGod('cronos');
  const pipeline = usePipelineState();

  const [invoking, setInvoking] = useState(false);
  const [missionTitle, setMissionTitle] = useState('');

  const handleInvoke = () => {
    sfxSelect();
    invokeMission(missionTitle);
    setMissionTitle('');
    setInvoking(false);
  };

  // Statistiques
  const stats = useMemo(() => {
    const active = pipeline.missions.length;
    const archived = pipeline.archivedMissions.length;
    return { active, archived, total: active + archived };
  }, [pipeline.missions, pipeline.archivedMissions]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* ═══ Décor : Cronos ═══ */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <motion.img
          src={assetUrl(cronos.portraitSrc)}
          alt="Cronos"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
          animate={{ scale: [1, 1.008, 1] }}
          transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
        />
      </motion.div>

      <AmbientLayer sparkCount={18} intensity={0.85} />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-black/55 to-black/85" />

      {/* ═══ Bouton retour ═══ */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 group focus:outline-none z-30"
      >
        <div className="flex items-center gap-3 px-5 py-2 bg-black/50 backdrop-blur-sm border border-amber-400/40 rounded-sm hover:border-amber-300/80 transition-colors">
          <span className="text-amber-200 text-lg">‹</span>
          <span className="font-serif text-xs tracking-[0.3em] text-amber-100/80 group-hover:text-amber-100">
            MONT OLYMPE
          </span>
        </div>
      </button>

      {/* ═══ Titre du lieu ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none z-20"
      >
        <div className="font-serif text-5xl tracking-[0.3em] text-amber-100 drop-shadow-[0_0_20px_rgba(217,179,86,0.7)]">
          SALLE DU COMMANDEMENT
        </div>
        <div className="font-body italic text-amber-200/80 text-sm mt-2 tracking-widest">
          Cronos · Maître du Temps · Chef d'orchestre
        </div>
      </motion.div>

      {/* ═══ Statistiques globales ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute top-32 left-1/2 -translate-x-1/2 flex items-center gap-8 z-20"
      >
        <Stat label="MISSIONS ACTIVES" value={stats.active} />
        <div className="w-px h-10 bg-amber-400/30" />
        <Stat label="MISSIONS ARCHIVÉES" value={stats.archived} />
        <div className="w-px h-10 bg-amber-400/30" />
        <Stat label="TOTAL JOUR" value={stats.total} />
      </motion.div>

      {/* ═══ Action rapide : INVOQUER ═══ */}
      <div className="absolute top-56 left-1/2 -translate-x-1/2 z-20">
        {!invoking ? (
          <button
            onClick={() => setInvoking(true)}
            className="px-6 py-3 bg-amber-500/15 border-2 border-amber-400 hover:bg-amber-400/25 transition-all font-serif text-xs tracking-[0.3em] text-amber-100 rounded-sm shadow-[0_0_30px_rgba(217,179,86,0.3)]"
          >
            ⟁ INVOQUER UNE NOUVELLE MISSION
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-2 bg-black/70 border-2 border-amber-400 rounded-sm"
          >
            <input
              autoFocus
              value={missionTitle}
              onChange={(e) => setMissionTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInvoke();
                if (e.key === 'Escape') setInvoking(false);
              }}
              placeholder="Titre de la mission…"
              className="bg-transparent outline-none px-3 py-1 font-body text-amber-50 placeholder:text-amber-200/40 text-base w-72"
            />
            <button
              onClick={handleInvoke}
              className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-serif text-[11px] tracking-[0.2em] rounded-sm"
            >
              LANCER
            </button>
            <button
              onClick={() => setInvoking(false)}
              className="px-3 py-1.5 text-amber-200/60 hover:text-amber-100 font-serif text-[11px] tracking-[0.2em]"
            >
              ✕
            </button>
          </motion.div>
        )}
      </div>

      {/* ═══ Liste des missions actives — timeline ═══ */}
      <div className="absolute inset-0 top-80 px-12 pb-12 overflow-y-auto z-10">
        <div className="max-w-5xl mx-auto pt-2">
          <div className="font-serif text-xs tracking-[0.3em] text-amber-200/70 mb-4">
            RELAIS EN COURS
          </div>

          {pipeline.missions.length === 0 && (
            <div className="text-center py-16 font-body italic text-amber-100/40">
              — aucune mission active. La cité dort, dans l'attente d'une invocation. —
            </div>
          )}

          <AnimatePresence>
            <div className="space-y-3">
              {pipeline.missions.map((m) => (
                <MissionTimeline key={m.id} mission={m} />
              ))}
            </div>
          </AnimatePresence>

          {/* Section archives récentes */}
          {pipeline.archivedMissions.length > 0 && (
            <div className="mt-10">
              <div className="font-serif text-xs tracking-[0.3em] text-amber-200/50 mb-3">
                MISSIONS ACHEVÉES · DERNIÈRES
              </div>
              <div className="space-y-1.5">
                {pipeline.archivedMissions.slice(0, 5).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between py-2 px-4 bg-black/35 border-l-2 border-amber-400/40"
                  >
                    <span className="font-body text-amber-100/80">{m.title}</span>
                    <span className="font-serif text-[10px] tracking-[0.2em] text-amber-200/50">
                      ✓ {m.stages.length}/{m.stages.length} TERMINÉE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="font-serif text-3xl text-amber-100 tabular-nums">
        {value}
      </div>
      <div className="font-serif text-[10px] tracking-[0.25em] text-amber-200/60 mt-1">
        {label}
      </div>
    </div>
  );
}

// ─── Timeline visuelle d'une mission ─────────────────────────────────
function MissionTimeline({ mission }: { mission: Mission }) {
  const cur = activeStage(mission);
  const stageNum = mission.currentStageIndex + 1;
  const total = mission.stages.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-black/55 border border-amber-400/40 rounded-sm p-4 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-serif text-amber-50 text-base tracking-wide">
            {mission.title}
          </div>
          {cur && (
            <div className="font-body italic text-amber-100/70 text-sm mt-0.5">
              ⟶ {cur.label} ({GOD_PALETTE(cur.godId).primary && cur.godId})
            </div>
          )}
        </div>
        <div className="font-mono text-xs text-amber-200/60 tabular-nums">
          {stageNum}/{total}
        </div>
      </div>

      {/* Timeline : 9 segments, 1 par stage */}
      <div className="flex gap-1">
        {mission.stages.map((s, i) => {
          const palette = GOD_PALETTE(s.godId);
          let bg = 'rgba(255,255,255,0.08)'; // pending
          if (s.status === 'done') bg = palette.primary;
          if (s.status === 'active') bg = palette.flame;

          return (
            <div key={i} className="flex-1 relative" title={`${s.godId} — ${s.label}`}>
              <div
                className="h-2 rounded-sm transition-colors duration-500"
                style={{ background: bg }}
              />
              {s.status === 'active' && (
                <motion.div
                  className="absolute inset-0 h-2 rounded-sm"
                  style={{
                    background: palette.flame,
                    boxShadow: `0 0 12px ${palette.flame}`,
                  }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
              {/* Label compact en dessous */}
              <div className="text-center mt-1 font-serif text-[9px] tracking-wider text-amber-200/50 uppercase">
                {s.godId.slice(0, 4)}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
