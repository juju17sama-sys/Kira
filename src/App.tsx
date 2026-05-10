// ╔══════════════════════════════════════════════════════════════════╗
// ║  KIRA — Centre de commandement immersif Mont Olympe              ║
// ║                                                                  ║
// ║  Orchestrateur des scenes :                                      ║
// ║   - hub        : carte panoramique du Mont                       ║
// ║   - terrace    : terrasse d'un dieu (sauf Pandore)               ║
// ║   - vault      : la Boîte de Pandore — vue archives spéciale     ║
// ║   + ScrollPanel : parchemin contextuel d'action (sur les dieux)  ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PanoramicHub } from './components/PanoramicHub';
import { GodTerrace } from './components/GodTerrace';
import { PandoreVault } from './components/PandoreVault';
import { ScrollPanel } from './components/ScrollPanel';
import { SoundToggle } from './components/SoundToggle';
import { sfxBack, sfxSelect, startWind, stopWind } from './utils/sound';
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
  | { kind: 'terrace'; god: God }
  | { kind: 'vault' }; // la Boîte de Pandore — lieu spécial

export default function App() {
  const [scene, setScene] = useState<Scene>({ kind: 'hub' });
  const [panelGod, setPanelGod] = useState<God | null>(null);

  // Démarrage du vent ambiant au 1er clic utilisateur (politique autoplay).
  useEffect(() => {
    const onFirstInteraction = () => {
      startWind();
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
    };
    window.addEventListener('click', onFirstInteraction);
    window.addEventListener('keydown', onFirstInteraction);
    return () => {
      stopWind();
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
    };
  }, []);

  // Route vers la bonne scène selon le dieu choisi.
  // Pandore => vault, sinon => terrace classique.
  const enterGod = (god: God) => {
    sfxSelect();
    if (god.id === 'pandore') setScene({ kind: 'vault' });
    else setScene({ kind: 'terrace', god });
  };

  const backToHub = () => {
    sfxBack();
    setPanelGod(null);
    setScene({ kind: 'hub' });
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {scene.kind === 'hub' && (
          <PanoramicHub
            key="hub"
            statuses={DEMO_STATUSES}
            onSelect={enterGod}
          />
        )}
        {scene.kind === 'terrace' && (
          <GodTerrace
            key={`terrace-${scene.god.id}`}
            god={scene.god}
            onBack={backToHub}
            onOpenPanel={() => setPanelGod(scene.god)}
          />
        )}
        {scene.kind === 'vault' && (
          <PandoreVault key="vault" onBack={backToHub} />
        )}
      </AnimatePresence>

      <ScrollPanel god={panelGod} onClose={() => setPanelGod(null)} />
      <SoundToggle />
    </div>
  );
}
