// ╔══════════════════════════════════════════════════════════════════╗
// ║  WELCOME — Intro cinematique manuelle (touche W ou ?welcome)     ║
// ║                                                                  ║
// ║  Voile noir + titre dore qui apparait, sous-titre, puis fade.    ║
// ║  Pas declenche automatiquement pour ne pas gener le dev rapide.  ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Welcome() {
  const [visible, setVisible] = useState(
    () => typeof window !== 'undefined' && window.location.search.includes('welcome'),
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'w' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
          return;
        setVisible(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Auto-fermeture après 6 secondes
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[80] bg-black flex flex-col items-center justify-center cursor-pointer"
          onClick={() => setVisible(false)}
        >
          {/* Lueur dorée centrale */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(217,179,86,0.2) 0%, transparent 50%)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 30, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.3em' }}
            transition={{ delay: 0.8, duration: 1.8, ease: 'easeOut' }}
            className="font-serif text-6xl md:text-8xl text-amber-100 drop-shadow-[0_0_30px_rgba(217,179,86,0.7)]"
          >
            MONT OLYMPE
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1.2 }}
            className="mt-6 font-body italic text-amber-200/80 text-lg tracking-widest"
          >
            centre de commandement du panthéon
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4, duration: 0.8 }}
            className="mt-16 font-serif text-xs tracking-[0.4em] text-amber-200/40"
          >
            CLIQUEZ POUR ENTRER
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
