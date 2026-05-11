// ╔══════════════════════════════════════════════════════════════════╗
// ║  GOD SPEECH — Génération narrative des dialogues des dieux       ║
// ║                                                                  ║
// ║  Chaque dieu parle EN PERSONNE (à la première personne).         ║
// ║  Son message dépend de son état réel : missions actives,         ║
// ║  blocages, statut idle.                                          ║
// ║                                                                  ║
// ║  C'est ce qui transforme les agents IA en personnages vivants.   ║
// ╚══════════════════════════════════════════════════════════════════╝

import type { GodId } from '../data/gods';
import type { PipelineState, Mission } from '../pipeline/types';
import { activeStage } from '../pipeline/mockSource';

// ─── Phrases "idle" par dieu — quand aucune mission active ──────────
const IDLE_SPEECH: Record<GodId, string[]> = {
  cronos: [
    'Aucune mission n’est en relais. Le temps coule, j’attends ton signal.',
    'Le panthéon est paisible. Donne-moi un clip à orchestrer.',
  ],
  zeus: [
    'Le ciel des tendances est calme. Donne-moi une mission, je trouverai la voie.',
    'Aucune foudre à invoquer pour l’instant. Le radar des tendances reste actif.',
  ],
  poseidon: [
    'Mes outils de montage sont prêts. Lance-moi un clip, je le ferai couler.',
    'Les flots attendent. Aucune coupe à orchestrer pour l’instant.',
  ],
  hades: [
    'Mes replays patientent dans la pénombre. Je peux disséquer n’importe quelle partie.',
    'Aucune analyse en cours. Les enfers sont silencieux.',
  ],
  apollon: [
    'Ma lyre est accordée. Donne-moi une vidéo, je l’habillerai de musique.',
    'Aucun beat à caler. J’écoute les vibrations du panthéon.',
  ],
  aphrodite: [
    'Mes pinceaux sont prêts. Une miniature à composer ?',
    'Aucune visuelle en chantier. Le rose et l’or attendent.',
  ],
  athena: [
    'Tout est en ordre. Aucun clip ne passera sans mon sceau.',
    'Mes yeux veillent. Aucun contrôle qualité en cours pour l’instant.',
  ],
  hermes: [
    'Mes mots attendent. Donne-moi un sujet, je trouverai le hook.',
    'Aucun titre à forger. Je polis mes phrases en silence.',
  ],
  pandore: [
    'Ma mémoire est intacte. Tout ce qui a été fait y demeure.',
  ],
};

// ─── Phrases "working" génériques (fallback si pas de mission) ──────
const WORKING_IDLE: Partial<Record<GodId, string>> = {
  cronos:    'Je supervise l’horloge du pipeline. Tout tourne.',
  zeus:      'Je scrute les tendances. La foudre cherche sa cible.',
  poseidon:  'Je polis le flow. Une vague à modeler.',
  hades:     'J’analyse en profondeur. Les ombres révèlent.',
  apollon:   'J’accorde l’audio. Le rythme se cale.',
  aphrodite: 'Je compose. Les couleurs prennent forme.',
  athena:    'J’inspecte. Rien ne m’échappe.',
  hermes:    'J’écris. Les mots prennent forme.',
  pandore:   'J’archive. La mémoire s’épaissit.',
};

/** Choisit une variante deterministe (basée sur le jour) pour éviter le flicker */
function pick<T>(list: T[]): T {
  const idx = Math.floor(Date.now() / (1000 * 60 * 10)) % list.length;
  return list[idx];
}

/**
 * Génère le dialogue du dieu en fonction de son état réel.
 * Retourne le message + éventuellement la mission liée (pour l'UI).
 */
export function generateGodSpeech(
  godId: GodId,
  state: PipelineState,
): { text: string; tone: 'idle' | 'working' | 'blocked'; mission?: Mission } {
  // Missions qui passent CHEZ ce dieu (stage actif)
  const missionsHere = state.missions.filter(
    (m) => activeStage(m)?.godId === godId,
  );

  // ─── Cas 1 : blocage (priorité absolue) ──────────────────────────
  const blocked = missionsHere.find((m) => m.status === 'blocked');
  if (blocked) {
    return {
      text: `J’ai dû bloquer « ${blocked.title} ». ${blocked.blockReason ?? 'Quelque chose ne va pas.'} J’attends ton intervention, Julien.`,
      tone: 'blocked',
      mission: blocked,
    };
  }

  // ─── Cas 2 : mission active en cours ─────────────────────────────
  const running = missionsHere.find((m) => m.status === 'running');
  if (running) {
    const stage = activeStage(running);
    const totalMissions = missionsHere.length;
    const extra =
      totalMissions > 1
        ? ` ${totalMissions - 1} autre${totalMissions > 2 ? 's' : ''} mission${totalMissions > 2 ? 's' : ''} m’attend${totalMissions > 2 ? 'ent' : ''}.`
        : '';
    return {
      text: `Je m’occupe en ce moment de « ${running.title} ». ${stage?.label ?? ''}.${extra}`,
      tone: 'working',
      mission: running,
    };
  }

  // ─── Cas 3 : statut working hors mission (fallback) ──────────────
  if (state.godStatuses[godId] === 'working') {
    return {
      text: WORKING_IDLE[godId] ?? 'Je suis occupé sur une tâche.',
      tone: 'working',
    };
  }

  // ─── Cas 4 : idle ───────────────────────────────────────────────
  const phrases = IDLE_SPEECH[godId] ?? ['…'];
  return {
    text: pick(phrases),
    tone: 'idle',
  };
}
