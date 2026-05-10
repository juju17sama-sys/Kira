// ╔══════════════════════════════════════════════════════════════════╗
// ║  KIRA — Centre de commandement immersif Mont Olympe              ║
// ║  Orchestrateur des scenes : Hub <-> Terrasse <-> Parchemin       ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PanoramicHub } from './components/PanoramicHub';
import { GodTerrace } from './components/GodTerrace';
import { ScrollPanel } from './components/ScrollPanel';
import type { God, GodId, GodStatus } from './data/gods';

// Statuts de demo — a remplacer par un store connecte au pipeline reel.
const DEMO_STATUSES: Partial<Record<GodId, GodStatus>> = {
  cronos: 'working',
  zeus: 'working',
  poseidon: 'idle',
  hades: 'working',
  apollon: 'idle',
  aphrodite: 'working',
  athena: 'blocked',
  hermes: 'idle',
  pandore: 'idle',
};

type Scene =
  | { kind: 'hub' }
  | { kind: 'terrace'; god: God };

export default function App() {
  const [scene, setScene] = useState<Scene>({ kind: 'hub' });
  const [panelGod, setPanelGod] = useState<God | null>(null);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {scene.kind === 'hub' && (
          <PanoramicHub
            key="hub"
            statuses={DEMO_STATUSES}
            onSelect={(god) => setScene({ kind: 'terrace', god })}
          />
        )}
        {scene.kind === 'terrace' && (
          <GodTerrace
            key={`terrace-${scene.god.id}`}
            god={scene.god}
            onBack={() => {
              setPanelGod(null);
              setScene({ kind: 'hub' });
            }}
            onOpenPanel={() => setPanelGod(scene.god)}
          />
        )}
      </AnimatePresence>

      <ScrollPanel god={panelGod} onClose={() => setPanelGod(null)} />
    </div>
  );
}
