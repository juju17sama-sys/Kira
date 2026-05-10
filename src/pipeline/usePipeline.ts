// ╔══════════════════════════════════════════════════════════════════╗
// ║  HOOK usePipeline — Pont React vers la source pipeline           ║
// ║                                                                  ║
// ║  L'app n'a qu'une instance de source (singleton module).         ║
// ║  Les composants s'abonnent via ce hook et re-render à chaque     ║
// ║  changement d'état.                                              ║
// ║                                                                  ║
// ║  Pour brancher le vrai pipeline plus tard, il suffira de :       ║
// ║   - créer src/pipeline/apiSource.ts                              ║
// ║   - remplacer createMockPipelineSource par createApiPipelineSource║
// ║  Tout le reste de l'app reste inchangé.                          ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useEffect, useState } from 'react';
import { createMockPipelineSource, tasksForGod } from './mockSource';
import type { PipelineSource, PipelineState } from './types';
import type { GodId } from '../data/gods';

// Singleton — créé une seule fois pour toute l'application
let _source: PipelineSource | null = null;
function getSource(): PipelineSource {
  if (!_source) _source = createMockPipelineSource();
  return _source;
}

/** Hook principal : retourne l'état global du pipeline */
export function usePipelineState(): PipelineState {
  const [state, setState] = useState<PipelineState>(() => getSource().getState());
  useEffect(() => {
    return getSource().subscribe(setState);
  }, []);
  return state;
}

/** Hook ciblé : tâches d'un seul dieu */
export function useGodTasks(godId: GodId) {
  const state = usePipelineState();
  return tasksForGod(state, godId);
}
