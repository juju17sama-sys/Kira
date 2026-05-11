// ╔══════════════════════════════════════════════════════════════════╗
// ║  PARCHEMIN D'ACTION — Panneau contextuel par dieu                ║
// ║  S'ouvre sur clic du dieu. Esthétique parchemin/marbre, pas modal. ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { God } from '../data/gods';
import { sfxChime, sfxSelect } from '../utils/sound';
import {
  invokeMission,
  unblockMission,
  useGodMissions,
  useGodTasks,
  usePipelineState,
} from '../pipeline/usePipeline';
import { activeStage } from '../pipeline/mockSource';
import type { PipelineTask } from '../pipeline/types';

interface Props {
  god: God | null;
  onClose: () => void;
}

// Statut humain affiché sur le parchemin (traduction depuis l'état pipeline)
const TASK_STATUS_LABELS: Record<PipelineTask['status'], string> = {
  queued: 'En attente',
  running: 'En cours',
  done: 'Terminé',
  failed: 'Échec',
  blocked: 'Bloqué',
};

export function ScrollPanel({ god, onClose }: Props) {
  // Tintement cristallin à l'ouverture du parchemin
  useEffect(() => {
    if (god) sfxChime();
  }, [god]);

  // Tâches et missions réelles du dieu courant (via le pipeline)
  const tasks = useGodTasks(god?.id ?? 'cronos');
  const allMissions = useGodMissions(god?.id ?? 'cronos');
  const missions = allMissions.filter((m) => m.status === 'running');

  // Missions bloquées chez ce dieu (Athéna principalement)
  const fullPipeline = usePipelineState();
  const blockedHere = fullPipeline.missions.filter(
    (m) =>
      m.status === 'blocked' &&
      m.stages[m.currentStageIndex]?.godId === god?.id,
  );

  // État : invocation en cours (saisie du titre)
  const [invoking, setInvoking] = useState(false);
  const [missionTitle, setMissionTitle] = useState('');

  const handleInvoke = () => {
    sfxSelect();
    invokeMission(missionTitle);
    setMissionTitle('');
    setInvoking(false);
  };

  return (
    <AnimatePresence>
      {god && (
        <>
          {/* Backdrop tres leger — flou, pas opaque */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 backdrop-blur-[2px] bg-black/30"
            onClick={onClose}
          />

          {/* Parchemin — slide depuis le bas */}
          <motion.div
            key={god.id}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-[min(720px,92vw)] max-h-[80vh] overflow-y-auto"
          >
            <div
              className="relative rounded-t-lg border-t-2 border-x-2 border-gold/60 shadow-[0_-10px_40px_rgba(201,162,74,0.25)]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(244,236,220,0.97) 0%, rgba(232,220,195,0.97) 100%)',
                backgroundImage:
                  "linear-gradient(180deg, rgba(244,236,220,0.97) 0%, rgba(232,220,195,0.97) 100%), url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><filter id='n'><feTurbulence baseFrequency='0.9' /></filter><rect width='100' height='100' filter='url(%23n)' opacity='0.05'/></svg>\")",
              }}
            >
              {/* En-tete — nom et symbole */}
              <div className="px-10 pt-8 pb-4 border-b border-gold/40">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div
                      className="font-serif text-4xl tracking-[0.25em]"
                      style={{ color: god.palette.primary }}
                    >
                      {god.name.toUpperCase()}
                    </div>
                    <div className="font-body italic text-ink/85 text-xl mt-2">
                      {god.title}
                    </div>
                    <div className="font-body text-ink/70 text-base mt-1.5 tracking-wider">
                      {god.role}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="font-serif text-ink/60 hover:text-ink text-2xl leading-none"
                    aria-label="Fermer le parchemin"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="px-10 py-5">
                <p className="font-body text-ink/90 italic leading-relaxed text-lg">
                  « {god.description} »
                </p>
              </div>

              {/* ═══ Missions BLOQUÉES — intervention requise (Athéna) ═══ */}
              {blockedHere.length > 0 && (
                <div className="px-10 pb-3">
                  <div className="font-serif text-sm tracking-[0.3em] text-red-900 mb-3">
                    ⚠ INTERVENTION REQUISE · {blockedHere.length}
                  </div>
                  <div className="space-y-2">
                    {blockedHere.map((m) => (
                      <div
                        key={m.id}
                        className="py-3 px-4 border-l-4 border-red-700 bg-red-50/60 rounded-sm"
                      >
                        <div className="font-body text-ink font-semibold text-lg">
                          {m.title}
                        </div>
                        {m.blockReason && (
                          <div className="mt-1.5 font-body italic text-red-900/90 text-base leading-snug">
                            « {m.blockReason} »
                          </div>
                        )}
                        <button
                          onClick={() => unblockMission(m.id)}
                          className="mt-3 px-5 py-2 bg-red-700 hover:bg-red-600 text-white font-serif text-sm tracking-[0.2em] transition-colors"
                        >
                          ⟁ DÉBLOQUER ET POURSUIVRE
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ Missions actives passant chez ce dieu ═══ */}
              {missions.length > 0 && (
                <div className="px-10 pb-2">
                  <div className="font-serif text-sm tracking-[0.3em] text-ink/70 mb-3">
                    MISSIONS EN RELAIS · {missions.length}
                  </div>
                  <div className="space-y-2">
                    {missions.map((m) => {
                      const cur = activeStage(m);
                      const isHere = cur?.godId === god.id;
                      const stageNum = m.currentStageIndex + 1;
                      const total = m.stages.length;
                      const progress = (stageNum / total) * 100;
                      return (
                        <div
                          key={m.id}
                          className="py-2 px-3 border-l-2 bg-gold/5 rounded-sm"
                          style={{ borderColor: god.palette.primary }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              {isHere && (
                                <motion.span
                                  className="inline-block w-2 h-2 rounded-full"
                                  style={{ background: god.palette.flame }}
                                  animate={{ opacity: [0.4, 1, 0.4] }}
                                  transition={{ duration: 1.2, repeat: Infinity }}
                                />
                              )}
                              <span className="font-body text-ink text-base">
                                {m.title}
                              </span>
                            </div>
                            <span className="font-serif text-xs tracking-[0.2em] text-ink/70 whitespace-nowrap">
                              {stageNum}/{total}
                            </span>
                          </div>
                          {/* Mini barre de progression */}
                          <div className="mt-2 h-1 bg-ink/10 overflow-hidden rounded-full">
                            <motion.div
                              className="h-full"
                              style={{ background: god.palette.primary }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                          {isHere && cur && (
                            <div className="mt-1.5 font-body italic text-ink/75 text-sm">
                              ⟶ {cur.label}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Liste des taches — connectee au pipeline reel */}
              <div className="px-10 pb-6 pt-4">
                <div className="font-serif text-sm tracking-[0.3em] text-ink/70 mb-3">
                  TÂCHES EN COURS
                </div>
                <div className="space-y-2">
                  {tasks.length === 0 && (
                    <div className="py-2 px-3 font-body italic text-ink/55 text-base">
                      — aucune tâche assignée pour l'instant —
                    </div>
                  )}
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className="py-2.5 px-3 border-l-2 hover:bg-gold/10 transition-colors"
                      style={{ borderColor: god.palette.primary }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-body text-ink text-base">{t.title}</span>
                        <span
                          className="font-serif text-xs tracking-[0.2em] whitespace-nowrap"
                          style={{
                            color:
                              t.status === 'blocked' || t.status === 'failed'
                                ? '#a32d2d'
                                : 'rgba(26,20,12,0.75)',
                          }}
                        >
                          {TASK_STATUS_LABELS[t.status].toUpperCase()}
                        </span>
                      </div>
                      {t.blockReason && (
                        <div className="mt-1.5 font-body italic text-sm text-red-900/85">
                          ⚠ {t.blockReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ═══ Actions ═══ */}
              <div className="px-10 pb-8">
                {!invoking ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setInvoking(true)}
                      className="flex-1 py-3.5 border-2 font-serif text-sm tracking-[0.3em] hover:bg-gold/15 transition-colors"
                      style={{
                        borderColor: god.palette.primary,
                        color: god.palette.primary,
                      }}
                    >
                      INVOQUER UNE MISSION
                    </button>
                    <button className="flex-1 py-3.5 border border-ink/30 font-serif text-sm tracking-[0.3em] text-ink/75 hover:bg-ink/5 transition-colors">
                      CONSULTER LES ARCHIVES
                    </button>
                  </div>
                ) : (
                  /* Dialogue d'invocation — saisie du titre */
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="font-serif text-sm tracking-[0.3em] text-ink/70">
                      NOUVELLE MISSION — DICTEZ LE TITRE
                    </div>
                    <input
                      type="text"
                      autoFocus
                      value={missionTitle}
                      onChange={(e) => setMissionTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleInvoke();
                        if (e.key === 'Escape') setInvoking(false);
                      }}
                      placeholder="Clip #043 — Comeback Lancelot"
                      className="w-full px-4 py-3 bg-marble/40 border-2 outline-none font-body text-ink placeholder:text-ink/45 text-lg"
                      style={{ borderColor: god.palette.primary }}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleInvoke}
                        className="flex-1 py-3.5 border-2 font-serif text-sm tracking-[0.3em] transition-all hover:brightness-110"
                        style={{
                          borderColor: god.palette.primary,
                          background: god.palette.primary,
                          color: 'white',
                        }}
                      >
                        ⟁ INVOQUER LE RELAIS
                      </button>
                      <button
                        onClick={() => setInvoking(false)}
                        className="px-6 py-3.5 border border-ink/30 font-serif text-sm tracking-[0.3em] text-ink/75 hover:bg-ink/5 transition-colors"
                      >
                        ANNULER
                      </button>
                    </div>
                    <div className="font-body italic text-ink/60 text-sm">
                      La mission traversera les 9 dieux en relais. Tempo total ~50 secondes en démo.
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
