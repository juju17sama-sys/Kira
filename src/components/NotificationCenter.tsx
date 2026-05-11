// ╔══════════════════════════════════════════════════════════════════╗
// ║  NOTIFICATION CENTER — Étoiles filantes globales                 ║
// ║                                                                  ║
// ║  Détecte les transitions importantes du pipeline et fait glisser ║
// ║  une notification discrète depuis le haut, avec un son cristallin.║
// ║                                                                  ║
// ║  Triggers :                                                      ║
// ║   - mission terminée (✦ doré, son chime)                         ║
// ║   - mission bloquée (⚠ ambre, son grave)                         ║
// ║                                                                  ║
// ║  Style : intégré au monde, pas un toast SaaS — typo serif, or,   ║
// ║  apparition gracieuse, durée 4s puis fade.                       ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePipelineState } from '../pipeline/usePipeline';
import { sfxBack, sfxChime } from '../utils/sound';

type Notif = {
  id: string;
  kind: 'done' | 'blocked';
  title: string;
  detail?: string;
};

const NOTIF_DURATION = 4500;

export function NotificationCenter() {
  const state = usePipelineState();
  const [notifs, setNotifs] = useState<Notif[]>([]);

  // Référence pour comparer le state d'une frame à la suivante
  const seenMissionStatuses = useRef<Map<string, string>>(new Map());
  const seenArchivedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const newNotifs: Notif[] = [];

    // Détection des nouvelles missions archivées (= terminées avec succès)
    for (const m of state.archivedMissions) {
      if (!seenArchivedIds.current.has(m.id)) {
        seenArchivedIds.current.add(m.id);
        newNotifs.push({
          id: `done-${m.id}`,
          kind: 'done',
          title: m.title,
          detail: 'Relais divin terminé · archivé par Pandore',
        });
        sfxChime();
      }
    }

    // Détection des transitions vers 'blocked' sur les missions actives
    for (const m of state.missions) {
      const prev = seenMissionStatuses.current.get(m.id);
      if (m.status === 'blocked' && prev !== 'blocked') {
        newNotifs.push({
          id: `blocked-${m.id}-${Date.now()}`,
          kind: 'blocked',
          title: m.title,
          detail: 'Un dieu requiert votre intervention',
        });
        sfxBack();
      }
      seenMissionStatuses.current.set(m.id, m.status);
    }

    if (newNotifs.length > 0) {
      setNotifs((prev) => [...prev, ...newNotifs]);
      newNotifs.forEach((n) => {
        setTimeout(() => {
          setNotifs((prev) => prev.filter((x) => x.id !== n.id));
        }, NOTIF_DURATION);
      });
    }
  }, [state.archivedMissions, state.missions]);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {notifs.map((n) => (
          <NotifBanner key={n.id} notif={n} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotifBanner({ notif }: { notif: Notif }) {
  const isDone = notif.kind === 'done';
  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 240, damping: 24 }}
      className="px-6 py-3 rounded-sm border-2 backdrop-blur-md flex items-center gap-3 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
      style={{
        background: isDone ? 'rgba(20,15,8,0.85)' : 'rgba(28,12,12,0.85)',
        borderColor: isDone ? '#e9c97a' : '#d65d6e',
        boxShadow: isDone
          ? '0 0 30px rgba(233,201,122,0.35)'
          : '0 0 30px rgba(214,93,110,0.3)',
      }}
    >
      <span
        className="font-serif text-2xl"
        style={{ color: isDone ? '#ffe9a8' : '#ff9da9' }}
      >
        {isDone ? '✦' : '⚠'}
      </span>
      <div className="flex flex-col">
        <span
          className="font-serif text-xs tracking-[0.3em]"
          style={{ color: isDone ? '#e9c97a' : '#d65d6e' }}
        >
          {isDone ? 'MISSION ACHEVÉE' : 'MISSION BLOQUÉE'}
        </span>
        <span className="font-body text-marble text-base leading-tight mt-0.5">
          {notif.title}
        </span>
        {notif.detail && (
          <span className="font-body italic text-marble/60 text-xs mt-0.5">
            {notif.detail}
          </span>
        )}
      </div>
    </motion.div>
  );
}
