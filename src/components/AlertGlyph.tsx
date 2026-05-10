// Triangle d'alerte dore — apparait au-dessus d'un dieu en blocage.
// Volontairement minuscule, sans bord rouge agressif.

import { motion } from 'framer-motion';

export function AlertGlyph({ size = 22 }: { size?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -3, 0], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
      className="drop-shadow-[0_0_6px_rgba(233,201,122,0.8)]"
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 3 L22 20 L2 20 Z"
          fill="url(#goldGrad)"
          stroke="#7a5a1d"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <text
          x="12"
          y="17"
          textAnchor="middle"
          fontFamily="Cinzel, serif"
          fontSize="11"
          fontWeight="700"
          fill="#3a2a0a"
        >
          !
        </text>
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5d97a" />
            <stop offset="100%" stopColor="#b8862b" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
