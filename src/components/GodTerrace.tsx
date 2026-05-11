// ╔══════════════════════════════════════════════════════════════════╗
// ║  TERRASSE DU DIEU — Vue moyenne, le dieu plein corps             ║
// ║                                                                  ║
// ║  Animations :                                                    ║
// ║   - respiration de scene (scale + y subtils, infini)             ║
// ║   - parallax souris (decor bouge a contre-souris, 12px max)      ║
// ║   - couche ambiante (etincelles + brume)                         ║
// ║                                                                  ║
// ║  Clic sur le dieu => parchemin d'action                          ║
// ║  Bouton retour => hub panoramique                                ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { God } from '../data/gods';
import { AmbientLayer } from './AmbientLayer';
import { GodDialog } from './GodDialog';
import { assetUrl } from '../utils/assets';

interface Props {
  god: God;
  onBack: () => void;
  onOpenPanel: () => void;
}

const PARALLAX_AMPLITUDE = 14; // px max de derive du decor

export function GodTerrace({ god, onBack, onOpenPanel }: Props) {
  // Position relative de la souris (-0.5 a +0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Lissage par spring — mouvement organique, pas saccade
  const springX = useSpring(mouseX, { stiffness: 50, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 18 });

  // Le decor se deplace a contre-souris
  const bgX = useTransform(springX, (v) => -v * PARALLAX_AMPLITUDE);
  const bgY = useTransform(springY, (v) => -v * PARALLAX_AMPLITUDE);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  const [hoveringGod, setHoveringGod] = useState(false);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* ═══ Decor : respiration + parallax + entree dolly-zoom cinematique ═══ */}
      {/* Le decor commence zoomé (camera proche) et recule lentement.        */}
      {/* Donne la sensation "tu marches vers le dieu" en t'approchant.       */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.22, opacity: 0, filter: 'blur(8px)' }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ x: bgX, y: bgY }}
      >
        <motion.img
          src={assetUrl(god.portraitSrc)}
          alt={god.name}
          className="absolute inset-0 w-full h-full object-cover select-none cursor-pointer"
          draggable={false}
          onClick={onOpenPanel}
          onMouseEnter={() => setHoveringGod(true)}
          onMouseLeave={() => setHoveringGod(false)}
          // Respiration ambiante : scale + flottement vertical desynchronises
          // pour eviter une oscillation trop "mecanique"
          animate={{
            scale: [1, 1.012, 1.006, 1.014, 1],
            y: [0, -3, -1, -4, 0],
          }}
          transition={{
            duration: 9,
            ease: 'easeInOut',
            repeat: Infinity,
            times: [0, 0.3, 0.55, 0.8, 1],
          }}
        />

        {/* Halo doux quand on survole le dieu — rappel d'interactivite */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: hoveringGod ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: `radial-gradient(circle at 50% 60%, ${god.palette.flame}1f 0%, transparent 55%)`,
          }}
        />
      </motion.div>

      {/* ═══ Couche ambiante : etincelles dorees + brume ═══ */}
      <AmbientLayer sparkCount={10} intensity={0.85} />

      {/* Vignette pour ancrer la lecture */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/55 via-transparent to-black/20" />

      {/* ═══ Bouton retour — haut gauche ═══ */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 group focus:outline-none z-20"
        aria-label="Retour au Mont Olympe"
      >
        <div className="flex items-center gap-3 px-5 py-2 bg-black/40 backdrop-blur-sm border border-gold/30 rounded-sm hover:border-gold/70 transition-colors">
          <span className="text-gold-light text-lg">‹</span>
          <span className="font-serif text-xs tracking-[0.3em] text-gold-light/80 group-hover:text-gold-light">
            MONT OLYMPE
          </span>
        </div>
      </button>

      {/* ═══ Dialogue interactif avec le dieu — bas droite ═══ */}
      {/* Vrai chat : Julien peut parler, le dieu repond en personnage.   */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-20"
      >
        <GodDialog god={god} />
      </motion.div>

      {/* Bouton CONSULTER LE PARCHEMIN — discret, sous le bouton son */}
      <motion.button
        onClick={onOpenPanel}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="absolute top-20 right-6 px-5 py-2 bg-black/45 backdrop-blur-sm border border-gold/40 hover:border-gold-light/80 transition-colors font-serif text-xs tracking-[0.3em] text-gold-light z-20"
      >
        📜 CONSULTER LE PARCHEMIN
      </motion.button>

    </div>
  );
}
