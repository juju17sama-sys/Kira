// ╔══════════════════════════════════════════════════════════════════╗
// ║  PARCHEMIN D'ACTION — Panneau contextuel par dieu                ║
// ║  S'ouvre sur clic du dieu. Esthétique parchemin/marbre, pas modal. ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { God } from '../data/gods';
import { sfxChime } from '../utils/sound';
import { useGodTasks } from '../pipeline/usePipeline';
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

  // Tâches réelles du dieu courant (via le pipeline)
  const tasks = useGodTasks(god?.id ?? 'cronos');

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
                      className="font-serif text-3xl tracking-[0.25em]"
                      style={{ color: god.palette.primary }}
                    >
                      {god.name.toUpperCase()}
                    </div>
                    <div className="font-body italic text-ink/80 text-base mt-1">
                      {god.title}
                    </div>
                    <div className="font-body text-ink/60 text-sm mt-1 tracking-wider">
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
                <p className="font-body text-ink/85 italic leading-relaxed">
                  « {god.description} »
                </p>
              </div>

              {/* Liste des taches — connectee au pipeline reel */}
              <div className="px-10 pb-6">
                <div className="font-serif text-xs tracking-[0.3em] text-ink/60 mb-3">
                  TÂCHES EN COURS
                </div>
                <div className="space-y-2">
                  {tasks.length === 0 && (
                    <div className="py-2 px-3 font-body italic text-ink/50">
                      — aucune tâche assignée pour l'instant —
                    </div>
                  )}
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className="py-2 px-3 border-l-2 hover:bg-gold/10 transition-colors"
                      style={{ borderColor: god.palette.primary }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-body text-ink">{t.title}</span>
                        <span
                          className="font-serif text-[10px] tracking-[0.2em] whitespace-nowrap"
                          style={{
                            color:
                              t.status === 'blocked' || t.status === 'failed'
                                ? '#a32d2d'
                                : 'rgba(26,20,12,0.65)',
                          }}
                        >
                          {TASK_STATUS_LABELS[t.status].toUpperCase()}
                        </span>
                      </div>
                      {t.blockReason && (
                        <div className="mt-1 font-body italic text-[13px] text-red-900/80">
                          ⚠ {t.blockReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="px-10 pb-8 flex gap-3">
                <button
                  className="flex-1 py-3 border-2 font-serif text-xs tracking-[0.3em] hover:bg-gold/15 transition-colors"
                  style={{
                    borderColor: god.palette.primary,
                    color: god.palette.primary,
                  }}
                >
                  INVOQUER
                </button>
                <button className="flex-1 py-3 border border-ink/30 font-serif text-xs tracking-[0.3em] text-ink/70 hover:bg-ink/5 transition-colors">
                  CONSULTER LES ARCHIVES
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
