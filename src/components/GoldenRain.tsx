// ╔══════════════════════════════════════════════════════════════════╗
// ║  GOLDEN RAIN — Easter egg : pluie d'étincelles dorées            ║
// ║                                                                  ║
// ║  Touche K (initiale de Kira) → 80 étincelles tombent pendant 3s. ║
// ║  Bénédiction divine. Aucune utilité fonctionnelle.               ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useEffect, useState } from 'react';
import { sfxChime } from '../utils/sound';

interface Drop {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export function GoldenRain() {
  const [active, setActive] = useState(false);
  const [drops, setDrops] = useState<Drop[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'k' &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        // Ne pas déclencher quand on tape dans un input
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        triggerRain();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const triggerRain = () => {
    if (active) return;
    setActive(true);
    sfxChime();

    const newDrops: Drop[] = [];
    for (let i = 0; i < 80; i++) {
      newDrops.push({
        id: Date.now() + i,
        left: Math.random() * 100,
        delay: Math.random() * 1500,
        duration: 2200 + Math.random() * 1500,
        size: 3 + Math.random() * 4,
      });
    }
    setDrops(newDrops);

    setTimeout(() => {
      setActive(false);
      setDrops([]);
    }, 4500);
  };

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[70] overflow-hidden">
      {drops.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.left}%`,
            top: '-20px',
            width: `${d.size}px`,
            height: `${d.size}px`,
            background:
              'radial-gradient(circle, #fff8d8 0%, #ffd97a 50%, transparent 100%)',
            boxShadow: '0 0 12px 3px rgba(255,217,124,0.7)',
            animation: `goldenDrop ${d.duration}ms linear ${d.delay}ms forwards`,
          }}
        />
      ))}

      <style>{`
        @keyframes goldenDrop {
          0%   { transform: translateY(0) rotate(0deg);     opacity: 0; }
          10%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(180deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
