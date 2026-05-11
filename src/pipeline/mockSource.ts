// ╔══════════════════════════════════════════════════════════════════╗
// ║  MOCK PIPELINE SOURCE — Statuts simulés + missions en relais     ║
// ║                                                                  ║
// ║  Simule un pipeline vivant :                                     ║
// ║   - les statuts des dieux changent toutes les quelques secondes  ║
// ║   - une mission créée traverse les 9 dieux en relais             ║
// ║                                                                  ║
// ║  Sera remplacé par une source HTTP / WebSocket connectée à       ║
// ║  Viral AI Studio.                                                ║
// ╚══════════════════════════════════════════════════════════════════╝

import type { GodId } from '../data/gods';
import type {
  Mission,
  MissionStage,
  PipelineSource,
  PipelineState,
  PipelineTask,
} from './types';

// ─── Le relais divin standard pour produire un clip MLBB ─────────────
// L'ordre suit la chaîne de valeur du pipeline Viral AI Studio.
const RELAY: { godId: GodId; label: string; duration: number }[] = [
  { godId: 'cronos',    label: 'Orchestration et planification',         duration: 4000 },
  { godId: 'zeus',      label: 'Identification de la tendance porteuse', duration: 5500 },
  { godId: 'hades',     label: 'Analyse gameplay et moments-clés',       duration: 7000 },
  { godId: 'poseidon',  label: 'Montage et rythme du flow',              duration: 8000 },
  { godId: 'apollon',   label: 'Sélection audio et synchronisation',     duration: 5500 },
  { godId: 'aphrodite', label: 'Composition de la miniature',            duration: 6500 },
  { godId: 'hermes',    label: 'Écriture du hook et de la description',  duration: 5000 },
  { godId: 'athena',    label: 'Contrôle qualité et validation',         duration: 5000 },
  { godId: 'pandore',   label: 'Archivage de la leçon dans la mémoire',  duration: 3500 },
];

function makeStages(): MissionStage[] {
  return RELAY.map((step) => ({
    godId: step.godId,
    label: step.label,
    status: 'pending',
  }));
}

function makeInitialState(): PipelineState {
  return {
    godStatuses: {
      cronos: 'idle',
      zeus: 'idle',
      poseidon: 'idle',
      hades: 'idle',
      apollon: 'idle',
      aphrodite: 'idle',
      athena: 'blocked',
      hermes: 'idle',
      pandore: 'idle',
    },
    tasks: [
      {
        id: 't-005',
        godId: 'athena',
        title: 'Validation qualité clip #041',
        status: 'blocked',
        blockReason: 'Le clip dépasse la durée TikTok recommandée (1m02 vs 60s).',
      },
    ],
    missions: [],
    archivedMissions: [],
    updatedAt: new Date().toISOString(),
  };
}

let nextMissionNumber = 42;

// ─── Persistance localStorage ─────────────────────────────────────────
const STORAGE_KEY = 'kira:pipeline:v1';

function loadPersistedState(): PipelineState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PipelineState & { _nextMissionNumber?: number };
    if (parsed._nextMissionNumber) nextMissionNumber = parsed._nextMissionNumber;
    // On ne restaure PAS les missions en cours (les timers seraient perdus,
    // mieux vaut un état propre). Seules les archives sont persistées.
    return {
      godStatuses: parsed.godStatuses ?? {},
      tasks: parsed.tasks ?? [],
      missions: [], // missions actives jetées (timers perdus au refresh)
      archivedMissions: parsed.archivedMissions ?? [],
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function persistState(state: PipelineState) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        _nextMissionNumber: nextMissionNumber,
      }),
    );
  } catch {
    /* quota/private — on ignore */
  }
}

// Raisons aléatoires de blocage par Athéna — réalistes vs un pipeline TikTok
const ATHENA_BLOCK_REASONS = [
  'Le clip dépasse la durée TikTok recommandée (1m02 vs 60s).',
  'La miniature contient du texte mal positionné — risque d’illisibilité mobile.',
  'Le hook audio démarre 0.4s après l’action visuelle — perte de rétention prévue.',
  'Le hashtag principal est en déclin depuis 72h — proposition de remplacement nécessaire.',
  'Un sous-titre comporte une faute de frappe — relecture requise.',
];

export function createMockPipelineSource(): PipelineSource {
  // Tente de restaurer depuis localStorage, sinon état initial.
  const persisted = loadPersistedState();
  let state: PipelineState = persisted
    ? { ...makeInitialState(), ...persisted, missions: [] }
    : makeInitialState();

  const listeners = new Set<(s: PipelineState) => void>();
  const stageTimers = new Map<string, ReturnType<typeof setTimeout>>();

  const emit = () => {
    state = { ...state, updatedAt: new Date().toISOString() };
    persistState(state);
    listeners.forEach((l) => l(state));
  };

  // Re-calcule godStatuses à partir des missions actives + tâches bloquées
  const recomputeGodStatuses = () => {
    const next: Partial<Record<GodId, 'idle' | 'working' | 'blocked' | 'done'>> = {
      cronos: 'idle',
      zeus: 'idle',
      poseidon: 'idle',
      hades: 'idle',
      apollon: 'idle',
      aphrodite: 'idle',
      athena: 'idle',
      hermes: 'idle',
      pandore: 'idle',
    };

    // Toute mission en cours met "working" le dieu de son stage actif
    for (const m of state.missions) {
      if (m.status !== 'running') continue;
      const stage = m.stages[m.currentStageIndex];
      if (stage) next[stage.godId] = 'working';
    }

    // Tâches bloquées priment
    for (const t of state.tasks) {
      if (t.status === 'blocked') next[t.godId] = 'blocked';
    }

    state = { ...state, godStatuses: next };
  };

  // Avance le stage suivant d'une mission
  const advanceMission = (missionId: string) => {
    const idx = state.missions.findIndex((m) => m.id === missionId);
    if (idx === -1) return;
    const mission = state.missions[idx];
    if (mission.status !== 'running') return;

    const stages = mission.stages.map((s) => ({ ...s }));
    const cur = stages[mission.currentStageIndex];
    if (cur) {
      cur.status = 'done';
      cur.finishedAt = new Date().toISOString();
    }

    const nextIndex = mission.currentStageIndex + 1;
    let nextStatus: Mission['status'] = mission.status;
    let archivedMissions = state.archivedMissions;

    if (nextIndex >= stages.length) {
      // Terminée — archive automatique dans la mémoire de Pandore
      nextStatus = 'done';
      archivedMissions = [
        { ...mission, stages, currentStageIndex: -1, status: 'done' },
        ...state.archivedMissions,
      ];
    } else {
      const next = stages[nextIndex];
      next.status = 'active';
      next.startedAt = new Date().toISOString();

      // ═══ Athéna peut bloquer la mission (1 chance sur 3) ═══
      // Réalisme : le contrôle qualité est ce qui rate le plus souvent dans
      // un pipeline. Donne du sens au rôle de Julien (débloquer manuellement).
      const isAthena = next.godId === 'athena';
      const willBlock = isAthena && Math.random() < 0.34;

      if (willBlock) {
        next.status = 'blocked';
        nextStatus = 'blocked';
        const reason =
          ATHENA_BLOCK_REASONS[
            Math.floor(Math.random() * ATHENA_BLOCK_REASONS.length)
          ];
        // On stocke la raison sur la mission ET sur le stage
        // (mission.blockReason est défini plus bas dans le nouveau state)
        (stages[nextIndex] as MissionStage & { blockReason?: string }).blockReason = reason;
      } else {
        // Programmer l'avancement normalement
        const t = setTimeout(
          () => advanceMission(missionId),
          RELAY[nextIndex].duration,
        );
        stageTimers.set(missionId, t);
      }
    }

    let newMissions = [...state.missions];
    if (nextStatus === 'done') {
      // Retirer la mission active (elle vit maintenant dans archivedMissions)
      newMissions.splice(idx, 1);
      stageTimers.delete(missionId);
    } else {
      const blockReason =
        nextStatus === 'blocked'
          ? (stages[nextIndex] as MissionStage & { blockReason?: string }).blockReason
          : undefined;
      newMissions[idx] = {
        ...mission,
        stages,
        currentStageIndex: nextIndex >= stages.length ? -1 : nextIndex,
        status: nextStatus,
        blockReason,
      };
    }

    state = { ...state, missions: newMissions, archivedMissions };
    recomputeGodStatuses();
    emit();
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => {
        listeners.delete(listener);
      };
    },
    getState: () => state,

    createMission(title) {
      const id = `m-${Date.now()}`;
      const finalTitle = title.trim() || `Clip #${nextMissionNumber++}`;

      const stages = makeStages();
      stages[0].status = 'active';
      stages[0].startedAt = new Date().toISOString();

      const mission: Mission = {
        id,
        title: finalTitle,
        createdAt: new Date().toISOString(),
        stages,
        currentStageIndex: 0,
        status: 'running',
      };

      state = { ...state, missions: [mission, ...state.missions] };
      recomputeGodStatuses();
      emit();

      // Démarrer le relais : avancer après la durée du premier stage
      const t = setTimeout(
        () => advanceMission(id),
        RELAY[0].duration,
      );
      stageTimers.set(id, t);

      return mission;
    },

    unblockMission(missionId) {
      const idx = state.missions.findIndex((m) => m.id === missionId);
      if (idx === -1) return;
      const mission = state.missions[idx];
      if (mission.status !== 'blocked') return;

      // Le stage actif (bloqué) repasse à 'active' et on relance le timer
      const stages = mission.stages.map((s) => ({ ...s }));
      const cur = stages[mission.currentStageIndex];
      if (!cur) return;
      cur.status = 'active';
      (cur as MissionStage & { blockReason?: string }).blockReason = undefined;

      const newMissions = [...state.missions];
      newMissions[idx] = {
        ...mission,
        stages,
        status: 'running',
        blockReason: undefined,
      };
      state = { ...state, missions: newMissions };
      recomputeGodStatuses();
      emit();

      // Relancer l'avancement
      const t = setTimeout(
        () => advanceMission(missionId),
        RELAY[mission.currentStageIndex].duration,
      );
      stageTimers.set(missionId, t);
    },
  };
}

// ─── Helpers de lecture ─────────────────────────────────────────────
export function tasksForGod(state: PipelineState, godId: GodId): PipelineTask[] {
  return state.tasks.filter((t) => t.godId === godId);
}

/** Toutes les missions qui passent (ou sont passées) chez ce dieu */
export function missionsForGod(state: PipelineState, godId: GodId): Mission[] {
  return state.missions.filter((m) => m.stages.some((s) => s.godId === godId));
}

/** Le stage actif d'une mission, ou null si terminée */
export function activeStage(m: Mission): MissionStage | null {
  if (m.currentStageIndex < 0) return null;
  return m.stages[m.currentStageIndex] ?? null;
}
