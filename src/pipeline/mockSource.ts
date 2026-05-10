// ╔══════════════════════════════════════════════════════════════════╗
// ║  MOCK PIPELINE SOURCE — Statuts simulés                          ║
// ║                                                                  ║
// ║  Simule un pipeline vivant : les statuts changent toutes les     ║
// ║  quelques secondes. Permet de tester l'interface immersive       ║
// ║  comme si le vrai pipeline tournait.                             ║
// ║                                                                  ║
// ║  Sera remplacé par une source HTTP / WebSocket connectée à       ║
// ║  Viral AI Studio.                                                ║
// ╚══════════════════════════════════════════════════════════════════╝

import type { GodId } from '../data/gods';
import type { PipelineSource, PipelineState, PipelineTask } from './types';

const GODS: GodId[] = [
  'cronos', 'zeus', 'poseidon', 'hades',
  'apollon', 'aphrodite', 'athena', 'hermes', 'pandore',
];

function makeInitialState(): PipelineState {
  return {
    godStatuses: {
      cronos: 'working',
      zeus: 'working',
      poseidon: 'idle',
      hades: 'working',
      apollon: 'idle',
      aphrodite: 'working',
      athena: 'blocked',
      hermes: 'idle',
      pandore: 'idle',
    },
    tasks: [
      { id: 't-001', godId: 'cronos',    title: 'Orchestration du clip #042', status: 'running' },
      { id: 't-002', godId: 'zeus',      title: 'Analyse tendances TikTok 24h', status: 'running' },
      { id: 't-003', godId: 'hades',     title: 'Analyse replay match #128',  status: 'running' },
      { id: 't-004', godId: 'aphrodite', title: 'Brouillon miniature #042',   status: 'running' },
      {
        id: 't-005',
        godId: 'athena',
        title: 'Validation qualité clip #041',
        status: 'blocked',
        blockReason: 'Le clip dépasse la durée TikTok recommandée (1m02 vs 60s).',
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function createMockPipelineSource(): PipelineSource {
  let state = makeInitialState();
  const listeners = new Set<(s: PipelineState) => void>();

  const emit = () => {
    state = { ...state, updatedAt: new Date().toISOString() };
    listeners.forEach((l) => l(state));
  };

  // Simulation : un agent change de statut toutes les 7 secondes
  // (idle <-> working aléatoirement, sauf Athéna qui reste bloquée pour la démo)
  const tick = () => {
    const pickable = GODS.filter((g) => g !== 'athena');
    const g = pickable[Math.floor(Math.random() * pickable.length)];
    const current = state.godStatuses[g];
    const next = current === 'working' ? 'idle' : 'working';
    state = {
      ...state,
      godStatuses: { ...state.godStatuses, [g]: next },
    };
    emit();
  };

  const interval = typeof window !== 'undefined' ? window.setInterval(tick, 7000) : 0;

  return {
    subscribe(listener) {
      listeners.add(listener);
      listener(state); // émission initiale
      return () => {
        listeners.delete(listener);
        // Si plus aucun listener, on pourrait stopper l'interval — mais
        // l'app n'a qu'une seule source globale, donc on laisse tourner.
      };
    },
    getState: () => state,
    // @ts-expect-error helper interne pour les tests éventuels
    _dispose: () => clearInterval(interval),
  };
}

// Helper pour récupérer les tâches d'un dieu donné
export function tasksForGod(state: PipelineState, godId: GodId): PipelineTask[] {
  return state.tasks.filter((t) => t.godId === godId);
}
