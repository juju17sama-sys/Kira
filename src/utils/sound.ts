// ╔══════════════════════════════════════════════════════════════════╗
// ║  SOUND — Sons procéduraux via Web Audio API                      ║
// ║                                                                  ║
// ║  Pas de fichiers externes (allègement bundle, pas de licences).  ║
// ║  Tous les sons sont synthétisés à la demande :                   ║
// ║                                                                  ║
// ║   - vent      : drone basse + filtrage en peigne (ambiance hub)  ║
// ║   - hover     : note brève (clavecin minimal)                    ║
// ║   - select    : harpe descendante (entrer dans une terrasse)     ║
// ║   - back      : note grave courte (retour)                       ║
// ║   - chime     : tintement (parchemin / archives)                 ║
// ║                                                                  ║
// ║  L'AudioContext n'est créé qu'au 1er clic utilisateur (Chrome).  ║
// ╚══════════════════════════════════════════════════════════════════╝

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = (() => {
  try {
    return localStorage.getItem('kira:muted') === '1';
  } catch {
    return false;
  }
})();

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      // @ts-expect-error vendors
      const Ctor = window.AudioContext || window.webkitAudioContext;
      ctx = new Ctor();
      masterGain = ctx.createGain();
      masterGain.gain.value = muted ? 0 : 0.6;
      masterGain.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  // Sur Safari/Chrome : reprendre si suspendu (autoplay policy)
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem('kira:muted', m ? '1' : '0');
  } catch {
    /* ignore */
  }
  if (masterGain && ctx) {
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(m ? 0 : 0.6, ctx.currentTime + 0.2);
  }
}
export function isMuted() {
  return muted;
}

// ─── Vent ambiant : drone subtil, joué en boucle pendant que la scène est active
let windNodes: { osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode } | null = null;

export function startWind() {
  const c = ensureCtx();
  if (!c || !masterGain || windNodes) return;

  const osc = c.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = 55; // basse profonde

  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 220;
  filter.Q.value = 0.6;

  const gain = c.createGain();
  gain.gain.value = 0.0;

  // LFO pour faire respirer le vent
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 0.05;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  osc.start();
  lfo.start();

  // Fade in doux
  gain.gain.linearRampToValueAtTime(0.07, c.currentTime + 4);

  windNodes = { osc, gain, lfo };
}

export function stopWind() {
  if (!ctx || !windNodes) return;
  const { osc, gain, lfo } = windNodes;
  gain.gain.cancelScheduledValues(ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
  setTimeout(() => {
    try {
      osc.stop();
      lfo.stop();
    } catch {
      /* ignore */
    }
  }, 900);
  windNodes = null;
}

// ─── Note simple générique (pour les hover / clic) ──────────────────────
function playNote(freq: number, duration = 0.25, type: OscillatorType = 'sine', vol = 0.18) {
  const c = ensureCtx();
  if (!c || !masterGain) return;

  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;

  const gain = c.createGain();
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(vol, c.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(c.currentTime + duration + 0.05);
}

// ─── Hover : note rapide, claveciniste minimaliste ──────────────────────
export function sfxHover() {
  playNote(880, 0.12, 'triangle', 0.08);
}

// ─── Select : harpe descendante (3 notes) — entrée d'une terrasse ───────
export function sfxSelect() {
  const c = ensureCtx();
  if (!c) return;
  const notes = [880, 660, 440];
  notes.forEach((f, i) => {
    setTimeout(() => playNote(f, 0.55, 'sine', 0.16), i * 90);
  });
}

// ─── Back : note grave courte ───────────────────────────────────────────
export function sfxBack() {
  playNote(220, 0.3, 'sine', 0.14);
}

// ─── Chime : ouverture d'un parchemin / archive (cristallin) ────────────
export function sfxChime() {
  const c = ensureCtx();
  if (!c) return;
  const notes = [523, 784, 1046]; // do – sol – do octave
  notes.forEach((f, i) => {
    setTimeout(() => playNote(f, 0.7, 'triangle', 0.12), i * 60);
  });
}
