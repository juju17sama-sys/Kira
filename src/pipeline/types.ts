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

/**
 * Un stage d'une mission — un passage dans les mains d'un dieu.
 * Une mission = une succession de stages (le relais divin).
 */
export interface MissionStage {
  godId: GodId;
  /** Action effectuée à ce stage (ex: "Analyse du replay") */
  label: string;
  status: 'pending' | 'active' | 'done' | 'blocked';
  startedAt?: string;
  finishedAt?: string;
  /** Si l'étape a été bloquée à un moment, on garde la raison historique */
  blockHistory?: string;
}

/** Une mission de bout en bout (un clip de A à Z) */
export interface Mission {
  id: string;
  title: string;
  createdAt: string;
  stages: MissionStage[];
  /** Index du stage actuellement actif (-1 = terminée) */
  currentStageIndex: number;
  /** done si tous les stages sont done, blocked si l'un est blocked */
  status: 'running' | 'done' | 'blocked';
  /** Si blocked : raison textuelle pour Julien */
  blockReason?: string;
}

/** État global du pipeline à un instant T */
export interface PipelineState {
  /** Statut courant de chaque dieu (synthèse des tâches) */
  godStatuses: Partial<Record<GodId, GodStatus>>;
  /** Tâches isolées (hors mission) */
  tasks: PipelineTask[];
  /** Missions en cours (relais divin actif) */
  missions: Mission[];
  /** Missions terminées — la mémoire de Pandore les conserve */
  archivedMissions: Mission[];
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
  /** Crée une nouvelle mission (le relais divin démarre immédiatement) */
  createMission(title: string): Mission;
  /** Débloque une mission bloquée (typiquement par Athéna) */
  unblockMission(missionId: string): void;
}
