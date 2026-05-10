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

// ─── Vent ambiant : bruit rose filtré (vrai vent, pas un drone harmonique) ────
//
// Recette : bufferSource (bruit blanc bouclé) → biquad low-pass modulé par LFO
// → gain global modulé par un 2e LFO (respiration). Le bruit est genere une
// seule fois dans un AudioBuffer de 3 secondes et lu en boucle.
let windNodes: {
  src: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  lfoCutoff: OscillatorNode;
  lfoAmp: OscillatorNode;
} | null = null;

function createNoiseBuffer(c: AudioContext, seconds: number): AudioBuffer {
  const sampleRate = c.sampleRate;
  const length = sampleRate * seconds;
  const buf = c.createBuffer(1, length, sampleRate);
  const data = buf.getChannelData(0);
  // Approximation simple de bruit rose (Voss-McCartney simplifié)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < length; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.96900 * b2 + w * 0.1538520;
    b3 = 0.86650 * b3 + w * 0.3104856;
    b4 = 0.55000 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.115;
    b6 = w * 0.115926;
  }
  return buf;
}

export function startWind() {
  const c = ensureCtx();
  if (!c || !masterGain || windNodes) return;

  // Source : bruit rose en boucle
  const src = c.createBufferSource();
  src.buffer = createNoiseBuffer(c, 3);
  src.loop = true;

  // Filtre passe-bas : ne garde que les basses fréquences (souffle)
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 380;
  filter.Q.value = 0.7;

  // LFO 1 : module la fréquence de coupure (vent qui forcit/faiblit en timbre)
  const lfoCutoff = c.createOscillator();
  lfoCutoff.frequency.value = 0.12;
  const lfoCutoffGain = c.createGain();
  lfoCutoffGain.gain.value = 120;
  lfoCutoff.connect(lfoCutoffGain);
  lfoCutoffGain.connect(filter.frequency);

  // Gain final, démarrage en silence puis fade-in
  const gain = c.createGain();
  gain.gain.value = 0;

  // LFO 2 : module l'amplitude (respiration du vent)
  const lfoAmp = c.createOscillator();
  lfoAmp.frequency.value = 0.08;
  const lfoAmpGain = c.createGain();
  lfoAmpGain.gain.value = 0.025;
  lfoAmp.connect(lfoAmpGain);
  lfoAmpGain.connect(gain.gain);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  src.start();
  lfoCutoff.start();
  lfoAmp.start();

  // Fade in tres doux (5s) — on tombe sur ~0.08 + variation LFO
  gain.gain.linearRampToValueAtTime(0.08, c.currentTime + 5);

  windNodes = { src, filter, gain, lfoCutoff, lfoAmp };
}

export function stopWind() {
  if (!ctx || !windNodes) return;
  const { src, gain, lfoCutoff, lfoAmp } = windNodes;
  gain.gain.cancelScheduledValues(ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
  setTimeout(() => {
    try {
      src.stop();
      lfoCutoff.stop();
      lfoAmp.stop();
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
