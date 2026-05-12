// ╔══════════════════════════════════════════════════════════════════╗
// ║  AMBIENT LAYER — Particules ambiantes selon le mode              ║
// ║                                                                  ║
// ║  Mode "normal" : etincelles dorees montantes + brume claire +    ║
// ║                  rayons de lumiere divine.                       ║
// ║                                                                  ║
// ║  Mode "ragnarok" : cendres rouges DESCENDANTES + brume sombre +  ║
// ║                    eclairs occasionnels rouges.                  ║
// ║                                                                  ║
// ║  Pur CSS — aucun re-render React, performant.                    ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useMemo } from 'react';

export type AmbientMode = 'normal' | 'ragnarok';

interface Particle {
  left: number;     // % horizontal
  delay: number;    // s
  duration: number; // s
  size: number;     // px
  drift: number;    // px de derive horizontale
}

// Generation deterministe des particules (seed-like)
function genParticles(count: number, ragnarok: boolean): Particle[] {
  const list: Particle[] = [];
  for (let i = 0; i < count; i++) {
    list.push({
      left: (i * 73 + 17) % 100,
      delay: (i * 1.7) % 8,
      // En mode Ragnarok les cendres tombent plus vite (5-9s vs 9-15s)
      duration: ragnarok ? 5 + ((i * 3) % 4) : 9 + ((i * 3) % 6),
      size: 2 + ((i * 5) % 4),
      drift: ((i * 11) % 60) - 30,
    });
  }
  return list;
}

export function AmbientLayer({
  sparkCount = 14,
  intensity = 1,
  mode = 'normal',
}: {
  sparkCount?: number;
  intensity?: number;
  mode?: AmbientMode;
}) {
  const isRagnarok = mode === 'ragnarok';
  // Plus de cendres dans le mode Ragnarok pour l'ambiance apocalyptique
  const finalCount = isRagnarok ? Math.round(sparkCount * 1.8) : sparkCount;
  const particles = useMemo(
    () => genParticles(finalCount, isRagnarok),
    [finalCount, isRagnarok],
  );

  // Couleurs selon mode
  const mistColor = isRagnarok
    ? 'rgba(80,10,10,0.45)'   // brume sombre rouge
    : 'rgba(244,236,220,0.18)'; // brume claire

  const rayColor = isRagnarok
    ? 'rgba(255,40,40,0.12)'    // rayons rouges
    : 'rgba(255,220,140,0.06)'; // rayons dores

  const particleGradient = isRagnarok
    ? 'radial-gradient(circle, #ff7a7a 0%, rgba(160,20,20,0) 70%)' // cendre rouge
    : 'radial-gradient(circle, #ffe9a8 0%, rgba(255,217,124,0) 70%)'; // doré

  const particleGlow = isRagnarok
    ? '0 0 8px 3px rgba(220,30,30,0.7)'
    : '0 0 6px 2px rgba(255,220,140,0.6)';

  // Direction : montant en normal, descendant en ragnarok
  const startPos = isRagnarok ? { top: '-10px' } : { bottom: '-10px' };
  const animationName = isRagnarok ? 'cinderFall' : 'sparkRise';

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ opacity: intensity }}
    >
      {/* Brume (basse en normal, haute et basse en ragnarok pour effet enferme) */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: `linear-gradient(to top, ${mistColor} 0%, transparent 100%)`,
          animation: 'mistDrift 24s ease-in-out infinite alternate',
          mixBlendMode: isRagnarok ? 'multiply' : 'screen',
        }}
      />
      {isRagnarok && (
        <div
          className="absolute inset-x-0 top-0 h-1/4"
          style={{
            background: `linear-gradient(to bottom, rgba(30,0,0,0.5) 0%, transparent 100%)`,
            mixBlendMode: 'multiply',
          }}
        />
      )}

      {/* Rayons obliques */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, transparent 40%, ${rayColor} 50%, transparent 60%)`,
          animation: 'rayShift 18s ease-in-out infinite alternate',
          mixBlendMode: 'screen',
        }}
      />

      {/* Eclairs occasionnels — uniquement en mode Ragnarok */}
      {isRagnarok && (
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(255,200,200,0.4)',
            mixBlendMode: 'screen',
            animation: 'lightning 8.5s steps(1, end) infinite',
          }}
        />
      )}

      {/* Particules — etincelles dorees OU cendres rouges */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            ...startPos,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: particleGradient,
            boxShadow: particleGlow,
            animation: `${animationName} ${p.duration}s linear ${p.delay}s infinite`,
            // @ts-expect-error variable CSS custom
            '--drift': `${p.drift}px`,
          }}
        />
      ))}

      <style>{`
        /* Etincelles dorees qui montent (mode normal) */
        @keyframes sparkRise {
          0%   { transform: translate(0, 0) scale(0.6); opacity: 0; }
          12%  { opacity: 0.9; }
          50%  { transform: translate(calc(var(--drift) * 0.5), -50vh) scale(1); opacity: 0.85; }
          100% { transform: translate(var(--drift), -110vh) scale(0.4); opacity: 0; }
        }
        /* Cendres rouges qui tombent (mode Ragnarok) */
        @keyframes cinderFall {
          0%   { transform: translate(0, 0) scale(0.8); opacity: 0; }
          8%   { opacity: 1; }
          50%  { transform: translate(calc(var(--drift) * 0.5), 50vh) scale(1); opacity: 0.9; }
          100% { transform: translate(var(--drift), 110vh) scale(0.4); opacity: 0; }
        }
        @keyframes mistDrift {
          0%   { transform: translateX(-3%); opacity: 0.7; }
          100% { transform: translateX(3%);  opacity: 1; }
        }
        @keyframes rayShift {
          0%   { opacity: 0.6; transform: translateX(-2%); }
          100% { opacity: 1;   transform: translateX(2%); }
        }
        /* Eclair : flash bref, puis long noir, puis flash double */
        @keyframes lightning {
          0%, 92%      { opacity: 0; }
          93%          { opacity: 0.4; }
          94%          { opacity: 0; }
          95%          { opacity: 0.7; }
          96%          { opacity: 0; }
          100%         { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
