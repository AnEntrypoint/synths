'use client';

import { useState, useCallback, useEffect } from 'react';
import { PITCHES } from './constants';

interface PianoKeyboardProps {
  onNoteOn: (freq: number) => void;
  onNoteOff: () => void;
  activeFreq?: number | null;
}

const WHITE_KEYS = PITCHES.filter((k) => k.type === 'white');
const BLACK_KEYS = PITCHES.filter((k) => k.type === 'black');
const WHITE_COUNT = WHITE_KEYS.length;

// Map computer keyboard keys to piano notes
const KEY_MAP: Record<string, number> = {
  a: 130.81, w: 138.59, s: 146.83, e: 155.56, d: 164.81, f: 174.61,
  t: 185.00, g: 196.00, y: 207.65, h: 220.00, u: 233.08, j: 246.94,
  k: 261.63, o: 277.18, l: 293.66, p: 311.13, ';': 329.63,
};

export default function PianoKeyboard({ onNoteOn, activeFreq }: PianoKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());

  const handleNoteOn = useCallback((freq: number) => {
    setPressedKeys((prev) => new Set(prev).add(freq));
    onNoteOn(freq);
  }, [onNoteOn]);

  const handleNoteOff = useCallback((freq: number) => {
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.delete(freq);
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const freq = KEY_MAP[e.key.toLowerCase()];
      if (freq) handleNoteOn(freq);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const freq = KEY_MAP[e.key.toLowerCase()];
      if (freq) handleNoteOff(freq);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleNoteOn, handleNoteOff]);

  return (
    <div
      className="w-[1060px] h-[104px] mx-auto rounded-b-xl border-[4px] border-t-0 bg-[#111] shrink-0 relative overflow-hidden mt-2"
      style={{ borderColor: '#222', boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 2px 8px rgba(0,0,0,0.9)' }}
    >
      {/* White Keys */}
      <div
        className="grid w-full h-full relative z-0"
        style={{ gridTemplateColumns: `repeat(${WHITE_COUNT}, 1fr)` }}
      >
        {WHITE_KEYS.map((k, i) => {
          const isActive = pressedKeys.has(k.freq) || activeFreq === k.freq;
          return (
            <div
              key={k.note}
              onMouseDown={() => handleNoteOn(k.freq)}
              onMouseUp={() => handleNoteOff(k.freq)}
              onMouseLeave={() => handleNoteOff(k.freq)}
              onTouchStart={(e) => { e.preventDefault(); handleNoteOn(k.freq); }}
              onTouchEnd={() => handleNoteOff(k.freq)}
              className={`
                group cursor-pointer flex items-end justify-center pb-2 box-border relative
                border-r border-[#aaa] select-none
                ${i === 0 ? 'rounded-bl-md' : ''}
                ${i === WHITE_COUNT - 1 ? 'border-r-0 rounded-br-md' : ''}
                transition-colors duration-75
              `}
              style={{
                background: isActive
                  ? 'linear-gradient(to bottom, #c0c0c0, #a0a0a0)'
                  : 'linear-gradient(to bottom, #f6f6f6, #d8d8d8)',
                boxShadow: isActive
                  ? 'inset 0 4px 8px rgba(0,0,0,0.2)'
                  : 'inset 0 -3px 6px rgba(0,0,0,0.08), 0 1px 0 rgba(0,0,0,0.15)',
              }}
            >
              <span className="opacity-0 group-hover:opacity-60 transition-opacity select-none pointer-events-none text-[9px] font-black text-black tracking-widest">
                {k.note}
              </span>
            </div>
          );
        })}
      </div>

      {/* Black Keys */}
      {BLACK_KEYS.map((k) => {
        const isActive = pressedKeys.has(k.freq) || activeFreq === k.freq;
        const offset = (k as { offset: number }).offset;
        return (
          <div
            key={k.note}
            onMouseDown={(e) => { e.stopPropagation(); handleNoteOn(k.freq); }}
            onMouseUp={(e) => { e.stopPropagation(); handleNoteOff(k.freq); }}
            onMouseLeave={() => handleNoteOff(k.freq)}
            onTouchStart={(e) => { e.preventDefault(); handleNoteOn(k.freq); }}
            onTouchEnd={() => handleNoteOff(k.freq)}
            className="absolute top-0 z-10 cursor-pointer rounded-b group select-none flex items-end justify-center pb-2"
            style={{
              height: '62%',
              left: `${(offset / WHITE_COUNT) * 100}%`,
              transform: 'translateX(-50%)',
              width: `${(0.65 / WHITE_COUNT) * 100}%`,
              background: isActive
                ? 'linear-gradient(to bottom, #555, #2a2a2a)'
                : 'linear-gradient(to bottom, #3a3a3a, #111)',
              boxShadow: isActive
                ? 'inset 0 4px 6px rgba(0,0,0,0.6), 3px 5px 8px rgba(0,0,0,0.7)'
                : '3px 5px 10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
              borderLeft: '1px solid #0a0a0a',
              borderRight: '1px solid #0a0a0a',
              borderBottom: '2px solid #0a0a0a',
            }}
          >
            <span className="opacity-0 group-hover:opacity-70 transition-opacity select-none pointer-events-none text-[8px] font-black tracking-tighter" style={{ color: '#dca628' }}>
              {k.note}
            </span>
          </div>
        );
      })}

      {/* Keyboard hint strip */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] opacity-20" style={{ background: 'linear-gradient(to right, transparent, #dca628, transparent)' }} />
    </div>
  );
}
