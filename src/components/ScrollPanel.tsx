// ╔══════════════════════════════════════════════════════════════════╗
// ║  PARCHEMIN D'ACTION — Panneau contextuel par dieu                ║
// ║  S'ouvre sur clic du dieu. Esthétique parchemin/marbre, pas modal. ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { God } from '../data/gods';
import { sfxChime } from '../utils/sound';

interface Props {
  god: God | null;
  onClose: () => void;
}

// Faux contenu pipeline pour la demo — sera connecte au vrai pipeline plus tard.
const FAKE_TASKS: Record<string, { title: string; status: string }[]> = {
  cronos: [
    { title: 'Orchestration du clip #042', status: 'En cours' },
    { title: 'Synchronisation des dieux', status: 'Veille' },
  ],
  zeus: [
    { title: 'Analyse tendances TikTok 24h', status: 'En cours' },
    { title: 'Veille hashtags MLBB', status: 'Termine' },
  ],
  poseidon: [
    { title: 'Montage clip #041', status: 'Termine' },
    { title: 'Pre-cut clip #042', status: 'En attente' },
  ],
  hades: [
    { title: 'Analyse replay match #128', status: 'En cours' },
    { title: 'Detection moments cles', status: 'En cours' },
  ],
  apollon: [
    { title: 'Selection BGM lo-fi', status: 'En cours' },
    { title: 'Sync audio clip #041', status: 'Termine' },
  ],
  aphrodite: [
    { title: 'Miniature clip #041', status: 'Termine' },
    { title: 'Brouillon miniature #042', status: 'En cours' },
  ],
  athena: [
    { title: 'Validation qualite clip #041', status: 'Termine' },
    { title: 'Audit pipeline hebdo', status: 'En attente' },
  ],
  hermes: [
    { title: 'Hook clip #041', status: 'Termine' },
    { title: 'Description + tags #042', status: 'En cours' },
  ],
  pandore: [
    { title: '3 clips archives ce mois', status: 'Memoire' },
    { title: '12 lecons consignees', status: 'Memoire' },
  ],
};

export function ScrollPanel({ god, onClose }: Props) {
  // Tintement cristallin à l'ouverture du parchemin
  useEffect(() => {
    if (god) sfxChime();
  }, [god]);

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

              {/* Liste des taches */}
              <div className="px-10 pb-6">
                <div className="font-serif text-xs tracking-[0.3em] text-ink/60 mb-3">
                  TÂCHES EN COURS
                </div>
                <div className="space-y-2">
                  {(FAKE_TASKS[god.id] ?? []).map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 px-3 border-l-2 hover:bg-gold/10 transition-colors"
                      style={{ borderColor: god.palette.primary }}
                    >
                      <span className="font-body text-ink">{t.title}</span>
                      <span className="font-serif text-[10px] tracking-[0.2em] text-ink/60">
                        {t.status.toUpperCase()}
                      </span>
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
