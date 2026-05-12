// ╔══════════════════════════════════════════════════════════════════╗
// ║  GOD DIALOG — Fenêtre de dialogue interactive avec un dieu       ║
// ║                                                                  ║
// ║  Apparait sur la terrasse, à côté du dieu, comme une vraie bulle ║
// ║  de BD. Julien tape un message, le dieu répond en personnage.    ║
// ║                                                                  ║
// ║  Architecture : moteur godDialog → réponses scriptées par intent ║
// ║  (sera remplacé par Claude API quand backend dispo).             ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { God } from '../data/gods';
import { generateGodSpeech } from '../utils/godSpeech';
import { getGodResponse } from '../utils/godDialog';
import { usePipelineState } from '../pipeline/usePipeline';
import { sfxChime, sfxHover } from '../utils/sound';

interface Props {
  god: God;
}

interface Message {
  id: number;
  from: 'god' | 'user';
  text: string;
  at: number; // timestamp
}

const TYPING_DELAY = 700; // ms — illusion de "le dieu réfléchit"

export function GodDialog({ god }: Props) {
  const pipeline = usePipelineState();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [godTyping, setGodTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const initRef = useRef(false);

  // Premier message du dieu — généré dynamiquement à l'arrivée
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const opening = generateGodSpeech(god.id, pipeline);
    setMessages([
      {
        id: Date.now(),
        from: 'god',
        text: opening.text,
        at: Date.now(),
      },
    ]);
  }, [god.id, pipeline]);

  // Auto-scroll vers le bas à chaque nouveau message
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, godTyping]);

  // Envoie un message — soit la saisie courante, soit un texte passe en argument
  // (utilise pour les suggestions rapides).
  const sendMessage = (forced?: string) => {
    const text = (forced ?? input).trim();
    if (!text || godTyping) return;
    const userMsg: Message = {
      id: Date.now(),
      from: 'user',
      text,
      at: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setGodTyping(true);
    sfxHover();

    // Délai pour simuler la "réflexion" du dieu
    setTimeout(() => {
      const reply = getGodResponse(god.id, text, pipeline);
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, from: 'god', text: reply, at: Date.now() },
      ]);
      setGodTyping(false);
      sfxChime();
    }, TYPING_DELAY + Math.random() * 400);
  };

  // ─── Suggestions rapides — amorces de conversation ───
  const QUICK_SUGGESTIONS = [
    { label: 'Salut', payload: 'Salut' },
    { label: 'Où en es-tu ?', payload: 'où en es-tu ?' },
    { label: 'Aide', payload: 'aide' },
  ];

  return (
    <div
      className="relative w-full max-w-md rounded-sm border-2 backdrop-blur-md shadow-[0_15px_50px_rgba(0,0,0,0.5)] flex flex-col"
      style={{
        background:
          'linear-gradient(180deg, rgba(244,236,220,0.96) 0%, rgba(232,220,195,0.96) 100%)',
        borderColor: god.palette.primary,
        height: '60vh',
        maxHeight: '520px',
      }}
    >
      {/* En-tete — nom du dieu */}
      <div
        className="px-5 py-3 border-b-2 flex items-center gap-3"
        style={{ borderColor: `${god.palette.primary}55` }}
      >
        <span
          className="font-serif text-lg"
          style={{ color: god.palette.primary }}
        >
          ⟁
        </span>
        <div className="flex-1">
          <div
            className="font-serif text-sm tracking-[0.3em]"
            style={{ color: god.palette.primary }}
          >
            {god.name.toUpperCase()}
          </div>
          <div className="font-body italic text-ink/60 text-xs">
            {god.title}
          </div>
        </div>
      </div>

      {/* Fil de messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-sm font-body text-base leading-snug ${
                  m.from === 'god' ? 'italic' : ''
                }`}
                style={
                  m.from === 'god'
                    ? {
                        background: 'rgba(26,20,12,0.06)',
                        borderLeft: `3px solid ${god.palette.primary}`,
                        color: '#1a140c',
                      }
                    : {
                        background: god.palette.primary,
                        color: 'white',
                      }
                }
              >
                {m.from === 'god' && '« '}
                {m.text}
                {m.from === 'god' && ' »'}
              </div>
            </motion.div>
          ))}

          {godTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div
                className="px-4 py-2.5 rounded-sm flex items-center gap-1.5"
                style={{
                  background: 'rgba(26,20,12,0.06)',
                  borderLeft: `3px solid ${god.palette.primary}`,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: god.palette.primary }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1.1,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestions rapides — amorces de conversation */}
      <div
        className="px-4 pt-2 pb-1 flex flex-wrap gap-1.5 border-t"
        style={{ borderColor: `${god.palette.primary}33` }}
      >
        {QUICK_SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => sendMessage(s.payload)}
            disabled={godTyping}
            className="px-3 py-1 font-serif text-[11px] tracking-[0.2em] border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink/5"
            style={{
              borderColor: `${god.palette.primary}66`,
              color: god.palette.primary,
            }}
          >
            {s.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Input bas */}
      <div
        className="px-4 py-3 border-t-2 flex items-center gap-2"
        style={{ borderColor: `${god.palette.primary}55` }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !godTyping) sendMessage();
          }}
          placeholder={`Parle à ${god.name}…`}
          className="flex-1 bg-transparent outline-none px-2 py-2 font-body text-ink placeholder:text-ink/40 text-base"
          disabled={godTyping}
        />
        <button
          onClick={() => sendMessage()}
          disabled={godTyping || !input.trim()}
          className="px-4 py-2 font-serif text-xs tracking-[0.25em] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: god.palette.primary,
            color: 'white',
          }}
        >
          ENVOYER
        </button>
      </div>
    </div>
  );
}
