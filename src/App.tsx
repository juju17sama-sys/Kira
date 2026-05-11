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
import { CronosCommandRoom } from './components/CronosCommandRoom';
import { ScrollPanel } from './components/ScrollPanel';
import { SoundToggle } from './components/SoundToggle';
import { NotificationCenter } from './components/NotificationCenter';
import { preloadGodPortraits } from './utils/preload';
import { sfxBack, sfxSelect, startWind, stopWind } from './utils/sound';
import { usePipelineState } from './pipeline/usePipeline';
import type { God } from './data/gods';

type Scene =
  | { kind: 'hub' }
  | { kind: 'terrace'; god: God }
  | { kind: 'vault' }     // la Boîte de Pandore — archives
  | { kind: 'command' };  // la Salle du Commandement — Cronos

export default function App() {
  const [scene, setScene] = useState<Scene>({ kind: 'hub' });
  const [panelGod, setPanelGod] = useState<God | null>(null);

  // État vivant du pipeline — mocké pour l'instant, vrai backend plus tard
  const pipeline = usePipelineState();

  // Démarrage du vent ambiant au 1er clic utilisateur (politique autoplay).
  useEffect(() => {
    const onFirstInteraction = () => {
      startWind();
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
    };
    window.addEventListener('click', onFirstInteraction);
    window.addEventListener('keydown', onFirstInteraction);

    // Préchargement des portraits en arrière-plan, après que le hub soit affiché
    const preloadTimer = setTimeout(preloadGodPortraits, 1500);

    return () => {
      stopWind();
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      clearTimeout(preloadTimer);
    };
  }, []);

  // Route vers la bonne scène selon le dieu choisi.
  // Pandore => archives ; Cronos => salle du commandement ; autres => terrasse.
  const enterGod = (god: God) => {
    sfxSelect();
    if (god.id === 'pandore') setScene({ kind: 'vault' });
    else if (god.id === 'cronos') setScene({ kind: 'command' });
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
            statuses={pipeline.godStatuses}
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
        {scene.kind === 'command' && (
          <CronosCommandRoom key="command" onBack={backToHub} />
        )}
      </AnimatePresence>

      <ScrollPanel god={panelGod} onClose={() => setPanelGod(null)} />
      <SoundToggle />
      <NotificationCenter />
    </div>
  );
}
