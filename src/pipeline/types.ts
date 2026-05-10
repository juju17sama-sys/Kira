// ╔══════════════════════════════════════════════════════════════════╗
// ║  TYPES DU PIPELINE — Contrat partagé avec Viral AI Studio        ║
// ║                                                                  ║
// ║  Cette interface est le pont entre Kira (interface immersive)    ║
// ║  et le pipeline réel. Aujourd'hui mockée, demain branchée.       ║
// ╚══════════════════════════════════════════════════════════════════╝

import type { GodId, GodStatus } from '../data/gods';

/** Une tâche en cours de traitement par un agent */
export interface PipelineTask {
  id: string;
  godId: GodId;
  title: string;
  status: 'queued' | 'running' | 'done' | 'failed' | 'blocked';
  progress?: number; // 0 → 1
  startedAt?: string;
  finishedAt?: string;
  /** Si bloqué : raison pour Julien (apparaît dans le parchemin) */
  blockReason?: string;
}

/** État global du pipeline à un instant T */
export interface PipelineState {
  /** Statut courant de chaque dieu (synthèse des tâches) */
  godStatuses: Partial<Record<GodId, GodStatus>>;
  /** Toutes les tâches connues */
  tasks: PipelineTask[];
  /** Dernière mise à jour */
  updatedAt: string;
}

/**
 * Contrat d'une source de données pipeline.
 * Aujourd'hui : MockPipelineSource (statuts simulés).
 * Demain : ApiPipelineSource (HTTP/WS sur Viral AI Studio).
 */
export interface PipelineSource {
  /** S'abonner aux changements d'état. Retourne une fonction de désinscription. */
  subscribe(listener: (state: PipelineState) => void): () => void;
  /** Lecture synchrone du dernier état connu */
  getState(): PipelineState;
}
