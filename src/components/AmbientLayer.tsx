// ╔══════════════════════════════════════════════════════════════════╗
// ║  AMBIENT LAYER — Particules dorees + brume basse                 ║
// ║                                                                  ║
// ║  Donne vie a une scene fixe sans toucher au decor :              ║
// ║   - 14 etincelles dorees qui montent lentement                   ║
// ║   - voile de brume qui derive en bas                             ║
// ║   - rayons de lumiere divine tres discrets                       ║
// ║                                                                  ║
// ║  Pur CSS — aucun re-render React, performant.                    ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useMemo } from 'react';

interface Spark {
  left: number;     // % horizontal
  delay: number;    // s
  duration: number; // s
  size: number;     // px
  drift: number;    // px de derive horizontale
}

// Generation deterministe des etincelles (seed-like)
function genSparks(count: number): Spark[] {
  const sparks: Spark[] = [];
  for (let i = 0; i < count; i++) {
    sparks.push({
      left: (i * 73 + 17) % 100,
      delay: (i * 1.7) % 8,
      duration: 9 + ((i * 3) % 6),
      size: 2 + ((i * 5) % 4),
      drift: ((i * 11) % 60) - 30,
    });
  }
  return sparks;
}

export function AmbientLayer({
  sparkCount = 14,
  intensity = 1,
}: {
  sparkCount?: number;
  intensity?: number;
}) {
  const sparks = useMemo(() => genSparks(sparkCount), [sparkCount]);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ opacity: intensity }}
    >
      {/* Brume basse derivante */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            'linear-gradient(to top, rgba(244,236,220,0.18) 0%, rgba(244,236,220,0) 100%)',
          animation: 'mistDrift 24s ease-in-out infinite alternate',
          mixBlendMode: 'screen',
        }}
      />

      {/* Rayons de lumiere divine — diagonale tres legere */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, transparent 40%, rgba(255,220,140,0.06) 50%, transparent 60%)',
          animation: 'rayShift 18s ease-in-out infinite alternate',
          mixBlendMode: 'screen',
        }}
      />

      {/* Etincelles dorees */}
      {sparks.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            bottom: '-10px',
            width: `${s.size}px`,
            height: `${s.size}px`,
            background: 'radial-gradient(circle, #ffe9a8 0%, rgba(255,217,124,0) 70%)',
            boxShadow: '0 0 6px 2px rgba(255,220,140,0.6)',
            animation: `sparkRise ${s.duration}s linear ${s.delay}s infinite`,
            // @ts-expect-error variable CSS custom
            '--drift': `${s.drift}px`,
          }}
        />
      ))}

      <style>{`
        @keyframes sparkRise {
          0%   { transform: translate(0, 0) scale(0.6); opacity: 0; }
          12%  { opacity: 0.9; }
          50%  { transform: translate(calc(var(--drift) * 0.5), -50vh) scale(1); opacity: 0.85; }
          100% { transform: translate(var(--drift), -110vh) scale(0.4); opacity: 0; }
        }
        @keyframes mistDrift {
          0%   { transform: translateX(-3%); opacity: 0.7; }
          100% { transform: translateX(3%);  opacity: 1; }
        }
        @keyframes rayShift {
          0%   { opacity: 0.6; transform: translateX(-2%); }
          100% { opacity: 1;   transform: translateX(2%); }
        }
      `}</style>
    </div>
  );
}
