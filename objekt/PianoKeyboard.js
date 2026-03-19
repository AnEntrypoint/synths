import { createElement, applyDiff } from 'webjsx';
import { PITCHES } from './constants.js';

const WHITE_KEYS = PITCHES.filter(k => k.type === 'white');
const BLACK_KEYS = PITCHES.filter(k => k.type === 'black');
const WHITE_COUNT = WHITE_KEYS.length;

const KEY_MAP = {
  a: 130.81, w: 138.59, s: 146.83, e: 155.56, d: 164.81, f: 174.61,
  t: 185.00, g: 196.00, y: 207.65, h: 220.00, u: 233.08, j: 246.94,
  k: 261.63, o: 277.18, l: 293.66, p: 311.13, ';': 329.63,
};

let pressedKeys = new Set();
let keyboardListenersAdded = false;
let pianoContainer = null;
let pianoProps = null;

function rerender() {
  if (!pianoContainer || !pianoProps) return;
  applyDiff(pianoContainer, PianoKeyboard(pianoProps));
}

function handleNoteOn(freq) {
  pressedKeys.add(freq);
  pianoProps.onNoteOn(freq);
  rerender();
}

function handleNoteOff(freq) {
  pressedKeys.delete(freq);
  rerender();
}

function addKeyboardListeners() {
  if (keyboardListenersAdded) return;
  keyboardListenersAdded = true;
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const freq = KEY_MAP[e.key.toLowerCase()];
    if (freq) handleNoteOn(freq);
  });
  window.addEventListener('keyup', (e) => {
    const freq = KEY_MAP[e.key.toLowerCase()];
    if (freq) handleNoteOff(freq);
  });
}

export function PianoKeyboard(props) {
  pianoProps = props;
  addKeyboardListeners();

  const whiteKeys = WHITE_KEYS.map((k, i) => {
    const isActive = pressedKeys.has(k.freq) || props.activeFreq === k.freq;
    const bg = isActive ? 'linear-gradient(to bottom, #c0c0c0, #a0a0a0)' : 'linear-gradient(to bottom, #f6f6f6, #d8d8d8)';
    const shadow = isActive ? 'inset 0 4px 8px rgba(0,0,0,0.2)' : 'inset 0 -3px 6px rgba(0,0,0,0.08), 0 1px 0 rgba(0,0,0,0.15)';
    let borderRadius = '';
    if (i === 0) borderRadius = '0 0 0 4px';
    else if (i === WHITE_COUNT - 1) borderRadius = '0 0 4px 0';
    return createElement('div', {
      key: k.note,
      style: `background:${bg};box-shadow:${shadow};cursor:pointer;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;box-sizing:border-box;position:relative;border-right:${i === WHITE_COUNT - 1 ? 'none' : '1px solid #aaa'};border-radius:${borderRadius};user-select:none;transition:background 75ms;`,
      onmousedown: () => handleNoteOn(k.freq),
      onmouseup: () => handleNoteOff(k.freq),
      onmouseleave: () => handleNoteOff(k.freq),
      ontouchstart: (e) => { e.preventDefault(); handleNoteOn(k.freq); },
      ontouchend: () => handleNoteOff(k.freq),
    },
      createElement('span', { style: 'opacity:0;font-size:9px;font-weight:900;color:black;letter-spacing:0.1em;pointer-events:none;user-select:none;' }, k.note)
    );
  });

  const blackKeys = BLACK_KEYS.map((k) => {
    const isActive = pressedKeys.has(k.freq) || props.activeFreq === k.freq;
    const bg = isActive ? 'linear-gradient(to bottom, #555, #2a2a2a)' : 'linear-gradient(to bottom, #3a3a3a, #111)';
    const shadow = isActive ? 'inset 0 4px 6px rgba(0,0,0,0.6), 3px 5px 8px rgba(0,0,0,0.7)' : '3px 5px 10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)';
    return createElement('div', {
      key: k.note,
      style: `position:absolute;top:0;z-index:10;cursor:pointer;border-radius:0 0 4px 4px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;user-select:none;height:62%;left:${(k.offset / WHITE_COUNT) * 100}%;transform:translateX(-50%);width:${(0.65 / WHITE_COUNT) * 100}%;background:${bg};box-shadow:${shadow};border-left:1px solid #0a0a0a;border-right:1px solid #0a0a0a;border-bottom:2px solid #0a0a0a;`,
      onmousedown: (e) => { e.stopPropagation(); handleNoteOn(k.freq); },
      onmouseup: (e) => { e.stopPropagation(); handleNoteOff(k.freq); },
      onmouseleave: () => handleNoteOff(k.freq),
      ontouchstart: (e) => { e.preventDefault(); handleNoteOn(k.freq); },
      ontouchend: () => handleNoteOff(k.freq),
    },
      createElement('span', { style: 'opacity:0;font-size:8px;font-weight:900;letter-spacing:-0.025em;color:#dca628;pointer-events:none;user-select:none;' }, k.note)
    );
  });

  return createElement('div', {
    style: `width:1060px;height:104px;margin:0 auto;border-radius:0 0 12px 12px;border:4px solid #222;border-top:none;background:#111;flex-shrink:0;position:relative;overflow:hidden;margin-top:8px;box-shadow:0 20px 50px rgba(0,0,0,0.8),inset 0 2px 8px rgba(0,0,0,0.9);`,
  },
    createElement('div', {
      style: `display:grid;width:100%;height:100%;position:relative;z-index:0;grid-template-columns:repeat(${WHITE_COUNT},1fr);`,
    }, ...whiteKeys),
    ...blackKeys,
    createElement('div', { style: 'position:absolute;bottom:0;left:0;right:0;height:3px;opacity:0.2;background:linear-gradient(to right,transparent,#dca628,transparent);' })
  );
}

export function mountPianoKeyboard(container, props) {
  pianoContainer = container;
  pianoProps = props;
  applyDiff(container, PianoKeyboard(props));
}

export function updatePianoKeyboard(props) {
  pianoProps = { ...pianoProps, ...props };
  rerender();
}
