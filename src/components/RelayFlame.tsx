// ╔══════════════════════════════════════════════════════════════════╗
// ║  RELAY FLAME — Étincelle dorée qui voyage de dieu en dieu        ║
// ║                                                                  ║
// ║  Quand le stage actif d'une mission change, on voit une flamme   ║
// ║  dorée glisser depuis l'ancien dieu vers le nouveau, comme un    ║
// ║  passage de témoin divin.                                        ║
// ║                                                                  ║
// ║  C'est ce détail qui transforme un hub statique en monde vivant. ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GODS, type GodId } from '../data/gods';
import { activeStage } from '../pipeline/mockSource';
import { usePipelineState } from '../pipeline/usePipeline';

interface FlightInProgress {
  id: string;          // unique pour clé React
  fromGod: GodId;
  toGod: GodId;
  startedAt: number;
}

const FLIGHT_DURATION = 1100; // ms — durée du vol entre 2 dieux

export function RelayFlame() {
  const state = usePipelineState();
  const [flights, setFlights] = useState<FlightInProgress[]>([]);

  // On garde la trace de "où est chaque mission" pour détecter les changements
  const lastStageByMission = useRef<Map<string, GodId>>(new Map());

  useEffect(() => {
    const newFlights: FlightInProgress[] = [];

    for (const m of state.missions) {
      if (m.status !== 'running') {
        // Mission terminée → on nettoie
        lastStageByMission.current.delete(m.id);
        continue;
      }
      const cur = activeStage(m);
      if (!cur) continue;

      const previous = lastStageByMission.current.get(m.id);
      if (previous && previous !== cur.godId) {
        // Le stage a changé → flamme qui voyage
        newFlights.push({
          id: `${m.id}-${cur.godId}-${Date.now()}`,
          fromGod: previous,
          toGod: cur.godId,
          startedAt: Date.now(),
        });
      }
      lastStageByMission.current.set(m.id, cur.godId);
    }

    if (newFlights.length > 0) {
      setFlights((prev) => [...prev, ...newFlights]);
      // Auto-cleanup après le vol
      newFlights.forEach((f) => {
        setTimeout(() => {
          setFlights((prev) => prev.filter((x) => x.id !== f.id));
        }, FLIGHT_DURATION + 200);
      });
    }
  }, [state.missions]);

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      <AnimatePresence>
        {flights.map((f) => {
          const from = GODS.find((g) => g.id === f.fromGod);
          const to = GODS.find((g) => g.id === f.toGod);
          if (!from || !to) return null;

          return (
            <motion.div
              key={f.id}
              initial={{
                left: `${from.hotspot.x}%`,
                top: `${from.hotspot.y}%`,
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                left: `${to.hotspot.x}%`,
                top: `${to.hotspot.y}%`,
                opacity: [0, 1, 1, 0.8, 0],
                scale: [0.5, 1.4, 1.2, 1, 0.6],
              }}
              transition={{
                duration: FLIGHT_DURATION / 1000,
                ease: 'easeInOut',
                opacity: { times: [0, 0.15, 0.5, 0.85, 1] },
                scale: { times: [0, 0.2, 0.5, 0.85, 1] },
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              {/* Cœur de la flamme */}
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, #fff8d8 0%, #ffd97a 35%, #c9a24a 70%, transparent 100%)',
                  boxShadow:
                    '0 0 24px 8px rgba(255,217,124,0.85), 0 0 48px 16px rgba(255,217,124,0.4)',
                }}
              />
              {/* Trainée — particule arrière */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
                style={{ background: 'rgba(255,217,124,0.5)', filter: 'blur(2px)' }}
                animate={{ scale: [1, 0.3], opacity: [0.6, 0] }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
