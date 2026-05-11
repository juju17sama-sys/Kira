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
import { Welcome } from './components/Welcome';
import { ArchivesButton } from './components/ArchivesButton';
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

  // ═══ Mode Ragnarök : bascule du décor (touche K) ═══
  // Persistant en sessionStorage pour ne pas se réinitialiser au refresh dev.
  const [ragnarok, setRagnarok] = useState(() => {
    try {
      return sessionStorage.getItem('kira:ragnarok') === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem('kira:ragnarok', ragnarok ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [ragnarok]);

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

  // Navigation clavier : 1-9 dieux, K bascule Ragnarok, Esc retour hub
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      // Touche K : bascule du mode Ragnarok
      if (e.key.toLowerCase() === 'k') {
        setRagnarok((v) => !v);
        return;
      }

      // Echap : retour au hub
      if (e.key === 'Escape') {
        backToHub();
        return;
      }

      // 1-9 : acces direct au dieu correspondant
      const num = parseInt(e.key, 10);
      if (Number.isNaN(num) || num < 1 || num > 9) return;
      import('./data/gods').then(({ GODS }) => {
        const god = GODS[num - 1];
        if (god) enterGod(god);
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            ragnarokMode={ragnarok}
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
      <Welcome />

      {/* Bouton ARCHIVES (Pandore) — visible uniquement sur le hub */}
      {scene.kind === 'hub' && (
        <ArchivesButton onClick={() => setScene({ kind: 'vault' })} />
      )}
    </div>
  );
}
