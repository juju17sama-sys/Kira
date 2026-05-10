// ╔══════════════════════════════════════════════════════════════════╗
// ║  HUB PANORAMIQUE — Vue d'ensemble du Mont Olympe                 ║
// ║  Le decor est l'interface. Pas de cartes, pas de panneaux fixes. ║
// ║                                                                  ║
// ║  MODES :                                                         ║
// ║   - Touche D : afficher / masquer les hotspots (debug)           ║
// ║   - Touche E : activer l'editeur visuel (drag & resize)          ║
// ║       . poignee centrale = deplacement                           ║
// ║       . poignees coins   = redimensionnement                     ║
// ║       . bouton "COPIER"  = exporte le code a coller dans gods.ts ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GODS, type God, type GodId, type GodStatus } from '../data/gods';
import { AlertGlyph } from './AlertGlyph';
import { AmbientLayer } from './AmbientLayer';

interface Props {
  statuses?: Partial<Record<God['id'], GodStatus>>;
  onSelect: (god: God) => void;
}

type Hotspot = { x: number; y: number; w: number; h: number };
type DragMode = 'move' | 'nw' | 'ne' | 'sw' | 'se';

export function PanoramicHub({ statuses = {}, onSelect }: Props) {
  const [hovered, setHovered] = useState<God | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ═══ Mode debug + edition ═══
  const [debug, setDebug] = useState(
    () => typeof window !== 'undefined' && window.location.search.includes('debug'),
  );
  const [editing, setEditing] = useState(
    () => typeof window !== 'undefined' && window.location.search.includes('edit'),
  );

  // Surcharges locales — modifiees par l'editeur. Persistees dans localStorage.
  const [overrides, setOverrides] = useState<Record<string, Hotspot>>(() => {
    try {
      const raw = localStorage.getItem('kira:hotspot-overrides');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('kira:hotspot-overrides', JSON.stringify(overrides));
  }, [overrides]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === 'd') setDebug((v) => !v);
      if (k === 'e') {
        setEditing((v) => {
          const next = !v;
          if (next) setDebug(true); // l'edition implique l'affichage
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ═══ Drag state ═══
  const dragState = useRef<{
    godId: GodId;
    mode: DragMode;
    startX: number;
    startY: number;
    startHotspot: Hotspot;
  } | null>(null);

  const getHotspot = (god: God): Hotspot => overrides[god.id] ?? god.hotspot;

  // Conversion px souris → % de la viewport
  const pxToPct = (px: number, py: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const r = containerRef.current.getBoundingClientRect();
    return {
      x: ((px - r.left) / r.width) * 100,
      y: ((py - r.top) / r.height) * 100,
    };
  };

  const beginDrag = (
    e: React.MouseEvent,
    god: God,
    mode: DragMode,
  ) => {
    if (!editing) return;
    e.preventDefault();
    e.stopPropagation();
    dragState.current = {
      godId: god.id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startHotspot: { ...getHotspot(god) },
    };
  };

  useEffect(() => {
    if (!editing) return;
    const onMove = (e: MouseEvent) => {
      const ds = dragState.current;
      if (!ds) return;
      const start = pxToPct(ds.startX, ds.startY);
      const cur = pxToPct(e.clientX, e.clientY);
      const dx = cur.x - start.x;
      const dy = cur.y - start.y;
      const h = ds.startHotspot;
      let next: Hotspot = { ...h };
      const round = (n: number) => Math.round(n * 10) / 10; // pas de 0.1%
      if (ds.mode === 'move') {
        next.x = round(h.x + dx);
        next.y = round(h.y + dy);
      } else {
        // Redimensionnement : on conserve le coin oppose fixe
        const left = h.x - h.w / 2;
        const right = h.x + h.w / 2;
        const top = h.y - h.h / 2;
        const bottom = h.y + h.h / 2;
        let l = left, r = right, t = top, b = bottom;
        if (ds.mode === 'nw') { l = left + dx; t = top + dy; }
        if (ds.mode === 'ne') { r = right + dx; t = top + dy; }
        if (ds.mode === 'sw') { l = left + dx; b = bottom + dy; }
        if (ds.mode === 'se') { r = right + dx; b = bottom + dy; }
        const nw = Math.max(2, r - l);
        const nh = Math.max(2, b - t);
        next = {
          x: round((l + r) / 2),
          y: round((t + b) / 2),
          w: round(nw),
          h: round(nh),
        };
      }
      setOverrides((prev) => ({ ...prev, [ds.godId]: next }));
    };
    const onUp = () => {
      dragState.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [editing]);

  // ═══ Export TS pour gods.ts ═══
  const buildExport = () => {
    const lines = GODS.map((g) => {
      const h = getHotspot(g);
      return `// ${g.name.padEnd(18)} hotspot: { x: ${h.x}, y: ${h.y}, w: ${h.w}, h: ${h.h} },`;
    });
    return lines.join('\n');
  };

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(buildExport());
      setCopiedAt(Date.now());
    } catch {
      // ignore
    }
  };
  const [copiedAt, setCopiedAt] = useState(0);
  const justCopied = Date.now() - copiedAt < 1500;

  const resetAll = () => {
    if (confirm('Réinitialiser toutes les positions aux valeurs par défaut ?')) {
      setOverrides({});
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden bg-black">
      {/* ═══ Image de fond panoramique avec respiration de scene ═══ */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      >
        <motion.img
          src="/olympe/mont-olympe.png"
          alt="Mont Olympe"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
          animate={editing ? undefined : { scale: [1, 1.006, 1], y: [0, -2, 0] }}
          transition={
            editing ? undefined : { duration: 8, ease: 'easeInOut', repeat: Infinity }
          }
        />
      </motion.div>

      {/* ═══ Couche ambiante (desactivee en edition pour eviter les distractions) ═══ */}
      {!editing && <AmbientLayer sparkCount={14} intensity={0.9} />}

      {/* Vignette douce */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/40" />

      {/* ═══ Hotspots ═══ */}
      {GODS.map((god) => {
        const status = statuses[god.id] ?? god.defaultStatus;
        const isHovered = hovered?.id === god.id;
        const h = getHotspot(god);

        return (
          <div
            key={god.id}
            className="absolute"
            style={{
              left: `${h.x - h.w / 2}%`,
              top: `${h.y - h.h / 2}%`,
              width: `${h.w}%`,
              height: `${h.h}%`,
            }}
          >
            {/* Bouton clic / survol — desactive en mode edition */}
            <button
              onMouseEnter={() => !editing && setHovered(god)}
              onMouseLeave={() => !editing && setHovered(null)}
              onClick={() => !editing && onSelect(god)}
              onMouseDown={(e) => editing && beginDrag(e, god, 'move')}
              className="absolute inset-0 focus:outline-none"
              style={{ cursor: editing ? 'move' : 'pointer' }}
              aria-label={`Entrer dans le sanctuaire de ${god.name}`}
              disabled={editing}
            >
              {/* Halo dore au survol — discret */}
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                animate={{
                  opacity: isHovered && !editing ? 0.55 : 0,
                  scale: isHovered && !editing ? 1.05 : 0.85,
                }}
                transition={{ duration: 0.4 }}
                style={{
                  background:
                    'radial-gradient(circle, rgba(233,201,122,0.55) 0%, rgba(233,201,122,0) 70%)',
                }}
              />

              {/* Glyphe d'alerte */}
              {status === 'blocked' && !editing && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <AlertGlyph />
                </div>
              )}

              {/* Indicateur travaille */}
              {status === 'working' && !editing && (
                <>
                  <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                    style={{ background: god.palette.flame, filter: 'blur(2px)' }}
                    animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${god.palette.flame}33 0%, transparent 65%)`,
                    }}
                    animate={{ opacity: [0.25, 0.55, 0.25], scale: [0.9, 1.05, 0.9] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </>
              )}
            </button>

            {/* Rectangle debug + label */}
            {debug && (
              <div className="absolute inset-0 border-2 border-yellow-300/80 bg-yellow-300/15 pointer-events-none">
                <div className="absolute -top-5 left-0 px-1.5 py-0.5 bg-yellow-300 text-black font-serif text-[10px] tracking-[0.15em] whitespace-nowrap">
                  {god.name.toUpperCase()} · {h.x},{h.y} · {h.w}×{h.h}
                </div>
              </div>
            )}

            {/* Poignees de redimensionnement (mode edition uniquement) */}
            {editing && (
              <>
                {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => {
                  const pos = {
                    nw: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
                    ne: 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
                    sw: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
                    se: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
                  }[corner];
                  const cur = {
                    nw: 'nwse-resize',
                    ne: 'nesw-resize',
                    sw: 'nesw-resize',
                    se: 'nwse-resize',
                  }[corner];
                  return (
                    <div
                      key={corner}
                      onMouseDown={(e) => beginDrag(e, god, corner)}
                      className={`absolute ${pos} w-3 h-3 bg-yellow-300 border-2 border-black rounded-sm`}
                      style={{ cursor: cur }}
                    />
                  );
                })}
              </>
            )}
          </div>
        );
      })}

      {/* ═══ Barre d'edition flottante (haut centre) ═══ */}
      {editing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 bg-black/80 border-2 border-yellow-300 rounded-sm backdrop-blur-md z-50">
          <span className="font-serif text-yellow-300 text-xs tracking-[0.3em]">
            ÉDITEUR DE HOTSPOTS
          </span>
          <div className="w-px h-5 bg-yellow-300/40" />
          <button
            onClick={copyExport}
            className="px-3 py-1 bg-yellow-300 hover:bg-yellow-200 text-black font-serif text-[11px] tracking-[0.2em] transition-colors"
          >
            {justCopied ? '✓ COPIÉ' : 'COPIER LE CODE'}
          </button>
          <button
            onClick={resetAll}
            className="px-3 py-1 border border-yellow-300/60 hover:border-yellow-300 text-yellow-300 font-serif text-[11px] tracking-[0.2em] transition-colors"
          >
            RÉINITIALISER
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-1 border border-yellow-300/40 hover:border-yellow-300/80 text-yellow-300/80 font-serif text-[11px] tracking-[0.2em] transition-colors"
          >
            QUITTER (E)
          </button>
        </div>
      )}

      {/* ═══ Indicateur mode debug ═══ */}
      {debug && !editing && (
        <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-yellow-300/90 text-black font-serif text-[10px] tracking-[0.2em] pointer-events-none">
          DEBUG · D POUR MASQUER · E POUR ÉDITER
        </div>
      )}

      {/* Aperçu du code (mode edition) */}
      {editing && (
        <div className="absolute bottom-4 left-4 max-w-md max-h-48 overflow-auto px-3 py-2 bg-black/85 border border-yellow-300/40 backdrop-blur-md font-mono text-[10px] text-yellow-200 leading-relaxed z-50">
          <pre>{buildExport()}</pre>
        </div>
      )}
    </div>
  );
}
