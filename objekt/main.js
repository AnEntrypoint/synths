import { createElement, applyDiff } from 'webjsx';
import { COLORS, PRESETS, DEFAULT_PARAMS, MOD_MATRIX_ROWS } from './constants.js';
import { createAudioEngine } from './audio.js';
import { createLFO, createEnvelope, createCurve } from './lfo.js';
import { processModMatrix, applyModOffsets } from './modulation.js';
import { Knob } from './Knob.js';
import { ExciterPanel } from './ExciterPanel.js';
import { CenterPanel } from './CenterPanel.js';
import { MixerFXPanel } from './MixerFXPanel.js';
import { BottomRackPanel } from './BottomRackPanel.js';
import { PianoKeyboard, mountPianoKeyboard, updatePianoKeyboard } from './PianoKeyboard.js';

const SYNTH_WIDTH = 1100;

const POWER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/></svg>`;
const PLAY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="15" x="3" y="5" rx="1"/><polygon points="14 5 21 12 14 19"/></svg>`;
const CHEVRON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

const lfo1 = createLFO();
const lfo2 = createLFO();
const modEnvelope = createEnvelope();
const modCurve = createCurve();
let lastVelocity = 0.8;
let modWheel = 0;
let modFrameId = null;
let lastModTime = 0;

const state = {
  uiScale: 1,
  vw: SYNTH_WIDTH,
  activeFXTab: 'DIST',
  centerTab: 'modal',
  lfoTab: 'Curve',
  currentPreset: 'Glass Wave',
  activeNoteFreq: null,
  params: { ...DEFAULT_PARAMS },
  modMatrix: [...MOD_MATRIX_ROWS],
  engineStarted: false,
  micState: 'idle',
  inputLevel: 0,
};

let appContainer = null;
let contentEl = null;
let pianoMounted = false;

const audio = createAudioEngine(({ engineStarted, micState, inputLevel }) => {
  state.engineStarted = engineStarted;
  state.micState = micState;
  state.inputLevel = inputLevel;
  render();
});

function syncLFOParams() {
  const p = state.params;
  lfo1.configure({
    rate: 0.1 + p.lfo1Rate * 19.9,
    depth: p.lfo1Depth,
    waveform: p.lfo1Waveform ?? 'sine',
    stepped: p.lfo1Stepped ?? false,
    bipolar: p.lfo1Bipolar ?? false,
    oneshot: p.lfo1Oneshot ?? false,
    keySync: p.lfo1KeySync ?? true,
    global: p.lfo1Global ?? false,
  });
  lfo2.configure({
    rate: 0.1 + p.lfo2Rate * 9.9,
    depth: p.lfo2Depth,
    waveform: p.lfo2Waveform ?? 'square',
    stepped: p.lfo2Stepped ?? false,
    bipolar: p.lfo2Bipolar ?? false,
    oneshot: p.lfo2Oneshot ?? false,
    keySync: p.lfo2KeySync ?? true,
    global: p.lfo2Global ?? false,
  });
  modEnvelope.configure({
    attack: p.envAttack ?? 0.01,
    decay: p.envDecay ?? 0.3,
    sustain: p.envSustain ?? 0.5,
    release: p.envRelease ?? 0.5,
  });
}

function modTick(timestamp) {
  if (!state.engineStarted) { modFrameId = requestAnimationFrame(modTick); return; }
  const dt = lastModTime > 0 ? Math.min((timestamp - lastModTime) / 1000, 0.1) : 1 / 60;
  lastModTime = timestamp;
  const l1 = lfo1.tick(dt);
  const l2 = lfo2.tick(dt);
  const env = modEnvelope.tick(dt);
  const crv = modCurve.tick(dt);
  const sourceCtx = { velocity: lastVelocity, lfo1: l1, lfo2: l2, envelope: env, modWheel, curve: crv };
  const offsets = processModMatrix(state.modMatrix, sourceCtx);
  if (Object.keys(offsets).length > 0) {
    const modulated = applyModOffsets(state.params, offsets);
    if (offsets._lfo1Rate) lfo1.configure({ rate: Math.max(0.1, (0.1 + state.params.lfo1Rate * 19.9) + offsets._lfo1Rate * 10) });
    if (offsets._lfo2Rate) lfo2.configure({ rate: Math.max(0.1, (0.1 + state.params.lfo2Rate * 9.9) + offsets._lfo2Rate * 5) });
    audio.applyTuning(audio.currentPitchRef.current, modulated);
  }
  modFrameId = requestAnimationFrame(modTick);
}

function handleChange(e) {
  const { name, value } = e.target;
  const parsed = typeof value === 'boolean' ? value : typeof value === 'string' ? (isNaN(parseFloat(value)) ? value : parseFloat(value)) : value;
  state.params = { ...state.params, [name]: parsed };
  if (name.startsWith('lfo') || name.startsWith('env') || name.startsWith('curve')) syncLFOParams();
  if (name === 'routingMode' && state.engineStarted) audio.updateRouting(value);
  if (name === 'couplingMode' && state.engineStarted) audio.updateCoupling(value);
  if (state.engineStarted) audio.applyTuning(audio.currentPitchRef.current, state.params);
  render();
}

function loadPreset(e) {
  const name = e.target.value;
  state.currentPreset = name;
  state.params = { ...state.params, ...PRESETS[name] };
  syncLFOParams();
  if (state.engineStarted) {
    audio.applyTuning(audio.currentPitchRef.current, state.params);
    if (state.params.routingMode) audio.updateRouting(state.params.routingMode);
    if (state.params.couplingMode) audio.updateCoupling(state.params.couplingMode);
  }
  render();
}

function handleRandomize() {
  const updates = {};
  for (let i = 0; i < 8; i++) {
    const prefix = state.centerTab === 'modal' ? 'modal' : state.centerTab;
    updates[`${prefix}Freq${i}`] = parseFloat((Math.random() * 4 + 0.5).toFixed(2));
    updates[state.centerTab === 'modal' ? `modal${i}` : `${prefix}_${i}`] = parseFloat(Math.random().toFixed(2));
  }
  state.params = { ...state.params, ...updates };
  if (state.engineStarted) audio.applyTuning(audio.currentPitchRef.current, state.params);
  render();
}

function handleNoteOn(freq) {
  state.activeNoteFreq = freq;
  lastVelocity = 0.8;
  modEnvelope.trigger();
  modCurve.trigger();
  if (lfo1.keySync) lfo1.reset();
  if (lfo2.keySync) lfo2.reset();
  if (!state.engineStarted) {
    audio.initAudio(state.params).then(() => {
      syncLFOParams();
      if (!modFrameId) modFrameId = requestAnimationFrame(modTick);
      audio.triggerNote(freq, state.params);
    });
  } else {
    audio.triggerNote(freq, state.params);
  }
  updatePianoKeyboard({ activeFreq: freq });
}

function handleNoteOff() {
  state.activeNoteFreq = null;
  modEnvelope.noteOff();
  if (state.engineStarted) audio.releaseNote(state.params);
  updatePianoKeyboard({ activeFreq: null });
}

async function handleRequestMic() {
  if (!state.engineStarted) await audio.initAudio(state.params);
  await audio.requestMic(state.params);
}

function computeScale() {
  if (!contentEl) return;
  contentEl.style.transform = 'scale(1)';
  const naturalH = contentEl.scrollHeight;
  const scaleW = window.innerWidth / SYNTH_WIDTH;
  const scaleH = window.innerHeight / naturalH;
  const scale = Math.min(scaleW, scaleH, 1);
  state.uiScale = scale;
  state.vw = window.innerWidth;
  contentEl.style.transform = `scale(${scale})`;
  contentEl.style.left = `${Math.max(0, (state.vw - SYNTH_WIDTH * scale) / 2)}px`;
}

function render() {
  if (!appContainer) return;

  const { params, engineStarted, micState, inputLevel, activeFXTab, centerTab, lfoTab, currentPreset, uiScale, vw } = state;
  const p = params;

  const vdom = createElement('div', {
    style: 'position:fixed;inset:0;overflow:hidden;background-color:#0a0a0a;touch-action:none;',
  },
    createElement('div', {
      id: 'synth-content',
      style: `display:flex;flex-direction:column;align-items:center;position:absolute;width:${SYNTH_WIDTH}px;transform-origin:top left;transform:scale(${uiScale});left:${Math.max(0, (vw - SYNTH_WIDTH * uiScale) / 2)}px;top:0;`,
    },
      createElement('div', {
        style: `width:100%;border-radius:12px;display:flex;flex-direction:column;flex-shrink:0;background-color:${COLORS.chassis};box-shadow:0 40px 80px rgba(0,0,0,0.9),0 0 0 1px rgba(0,0,0,0.8);`,
      },
        createElement('div', {
          style: `height:60px;border-bottom:1px solid #a3a3a3;display:flex;align-items:center;justify-content:space-between;padding:0 20px;position:relative;z-index:20;flex-shrink:0;box-shadow:0 2px 5px rgba(0,0,0,0.05);`,
        },
          createElement('div', { style: 'display:flex;align-items:center;gap:24px;' },
            createElement('div', { style: 'display:flex;align-items:center;gap:10px;' },
              createElement('div', { style: 'width:36px;height:36px;display:flex;align-items:center;justify-content:center;' },
                createElement('svg', { viewBox: '0 0 100 100', style: 'width:100%;height:100%;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.4));' },
                  createElement('polygon', { points: '50,5 95,25 95,75 50,95 5,75 5,25', fill: '#444' }),
                  createElement('polygon', { points: '50,5 95,25 50,50', fill: '#666' }),
                  createElement('polygon', { points: '95,25 95,75 50,50', fill: '#555' }),
                  createElement('polygon', { points: '95,75 50,95 50,50', fill: '#333' }),
                  createElement('polygon', { points: '50,95 5,75 50,50', fill: '#222' }),
                  createElement('polygon', { points: '5,75 5,25 50,50', fill: '#555' }),
                  createElement('polygon', { points: '5,25 50,5 50,50', fill: '#777' }),
                )
              ),
              createElement('div', { style: 'display:flex;align-items:baseline;gap:8px;' },
                createElement('span', { style: 'font-size:26px;font-weight:900;color:#555;letter-spacing:-0.05em;line-height:1;' }, 'Objekt'),
                createElement('div', { style: 'display:flex;flex-direction:column;margin-top:4px;' },
                  createElement('span', { style: 'font-size:7px;font-weight:900;color:#888;text-transform:uppercase;letter-spacing:0.2em;line-height:1.2;' }, 'Modeling'),
                  createElement('span', { style: 'font-size:7px;font-weight:900;color:#888;text-transform:uppercase;letter-spacing:0.2em;line-height:1.2;' }, 'Synthesizer'),
                )
              )
            ),
            createElement('div', { style: 'display:flex;align-items:center;gap:8px;padding-left:20px;margin-left:4px;border-left:1px solid #c0c0c0;height:100%;padding-top:4px;padding-bottom:4px;' },
              createElement('span', { style: 'font-size:9px;font-weight:900;color:#777;transform:rotate(-90deg);text-transform:uppercase;margin-left:-12px;margin-right:4px;letter-spacing:0.2em;' }, 'EQ'),
              Knob({ label: 'Freq', value: 0.5, size: 22, labelPosition: 'top' }),
              Knob({ label: 'Reso', value: 0.3, size: 22, labelPosition: 'top' }),
              Knob({ label: 'Gain', value: 0.6, size: 22, labelPosition: 'top' }),
              createElement('div', { style: `width:32px;height:1.5px;background:#888;position:relative;margin-left:4px;opacity:0.6;` },
                createElement('div', { style: `position:absolute;right:0;top:-3px;width:8px;height:8px;border-radius:50%;border:1.5px solid #888;background-color:${COLORS.chassis};` })
              )
            )
          ),
          createElement('div', { style: 'display:flex;align-items:center;gap:16px;' },
            createElement('div', { style: `position:relative;padding:6px 12px;border-radius:3px;font-size:12px;font-weight:700;border:1px solid #333;display:flex;align-items:center;justify-content:space-between;width:220px;cursor:pointer;z-index:50;background:black;color:${COLORS.modYellow};box-shadow:inset 0 1px 3px rgba(0,0,0,0.8);` },
              createElement('select', {
                value: currentPreset,
                onchange: loadPreset,
                style: 'position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;z-index:50;',
              }, ...Object.keys(PRESETS).map(p => createElement('option', { value: p }, p))),
              createElement('span', { style: 'pointer-events:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;z-index:0;' }, currentPreset),
              createElement('div', { style: 'width:16px;height:16px;display:flex;align-items:center;justify-content:center;border-radius:2px;pointer-events:none;flex-shrink:0;z-index:0;background:#333;', innerHTML: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>` })
            ),
            createElement('div', { style: 'display:flex;gap:6px;' },
              createElement('div', { style: `width:24px;height:24px;border-radius:4px;border:1px solid #222;box-shadow:inset 0 0 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;cursor:pointer;background:#333;` },
                createElement('div', { style: `width:12px;height:12px;border-radius:2px;background-color:${COLORS.chassis};` })
              ),
              createElement('div', { style: `width:24px;height:24px;border-radius:4px;border:1px solid #222;box-shadow:inset 0 0 4px rgba(0,0,0,0.3);display:flex;flex-direction:column;justify-content:center;gap:2px;padding:0 5px;cursor:pointer;background:#333;` },
                ...[0,1,2].map(i => createElement('div', { key: i, style: `width:100%;height:1.5px;background-color:${COLORS.chassis};` }))
              )
            ),
            createElement('div', { style: 'display:flex;align-items:center;gap:4px;padding:4px;border-radius:4px;border:1px solid #999;background:#b0b0b0;margin-left:8px;' },
              createElement('div', { style: 'font-size:7.5px;font-weight:900;text-transform:uppercase;color:#555;padding:0 2px;transform:rotate(-90deg);line-height:1;' }, 'Tuner'),
              ...['Analyze', '--', 'Fix'].map(lbl =>
                createElement('div', { key: lbl, style: `padding:4px 10px;border-radius:2px;font-size:9px;font-weight:700;box-shadow:inset 0 0 4px rgba(0,0,0,0.4);cursor:pointer;background:black;color:${COLORS.modYellow};` }, lbl)
              )
            ),
            createElement('div', { style: 'border-left:1px solid #c0c0c0;padding-left:16px;margin-left:4px;display:flex;align-items:center;gap:12px;' },
              createElement('div', { style: 'display:flex;flex-direction:column;align-items:center;' },
                createElement('div', { style: `width:8px;height:8px;border-radius:50%;margin-bottom:4px;transition:all 0.5s;background-color:${engineStarted ? '#22c55e' : '#7f1d1d'};box-shadow:${engineStarted ? '0 0 6px #22c55e' : 'none'};` }),
                createElement('button', {
                  onclick: () => { if (!state.engineStarted) audio.initAudio(state.params); },
                  style: `width:40px;height:24px;border-radius:2px;border:1px solid ${engineStarted ? '#444' : 'white'};transition:all 0.2s;cursor:pointer;display:flex;align-items:center;justify-content:center;background-color:${engineStarted ? '#555' : COLORS.chassis};box-shadow:0 2px 4px rgba(0,0,0,0.3);`,
                  innerHTML: `<span style="color:${engineStarted ? '#4ade80' : '#666'};">${POWER_SVG}</span>`,
                })
              ),
              createElement('div', { style: 'display:flex;flex-direction:column;align-items:center;' },
                Knob({ value: typeof p.masterVolume === 'number' ? p.masterVolume : 0.8, name: 'masterVolume', onChange: handleChange, size: 30 }),
                createElement('span', { style: 'font-size:7.5px;font-weight:700;color:#666;margin-top:4px;' }, 'Volume'),
              ),
              createElement('div', { style: 'display:flex;flex-direction:column;align-items:center;' },
                createElement('div', { style: `width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:1px solid #c0c0c0;cursor:pointer;background-color:${COLORS.chassis};`, innerHTML: `<span style="color:#666">${PLAY_SVG}</span>` })
              )
            )
          )
        ),
        createElement('div', { style: 'display:flex;flex:1;border-bottom:4px solid #2c2e30;' },
          ExciterPanel({ params: p, onChange: handleChange, micState, inputLevel, onRequestMic: handleRequestMic, onReleaseMic: audio.releaseMic }),
          CenterPanel({ params: p, onChange: handleChange, centerTab, setCenterTab: (t) => { state.centerTab = t; render(); } }),
          MixerFXPanel({ params: p, onChange: handleChange, activeFXTab, setActiveFXTab: (t) => { state.activeFXTab = t; render(); }, centerTab, setCenterTab: (t) => { state.centerTab = t; render(); }, onRandomize: handleRandomize }),
        ),
        BottomRackPanel({ lfoTab, setLfoTab: (t) => { state.lfoTab = t; render(); }, params: p, onChange: handleChange }),
      ),
      createElement('div', { id: 'piano-mount', style: 'width:100%;' }),
      !engineStarted ? createElement('div', { style: 'margin-top:6px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:#444;text-align:center;user-select:none;flex-shrink:0;' },
        'Press a key or click the keyboard to start the audio engine'
      ) : null,
    )
  );

  applyDiff(appContainer, vdom);

  contentEl = document.getElementById('synth-content');

  const pianoMount = document.getElementById('piano-mount');
  if (pianoMount) {
    if (!pianoMounted) {
      mountPianoKeyboard(pianoMount, { onNoteOn: handleNoteOn, onNoteOff: handleNoteOff, activeFreq: state.activeNoteFreq });
      pianoMounted = true;
    } else {
      updatePianoKeyboard({ activeFreq: state.activeNoteFreq });
    }
  }
}

export function init() {
  appContainer = document.getElementById('app');
  if (!appContainer) { console.error('No #app element found'); return; }

  syncLFOParams();
  modFrameId = requestAnimationFrame(modTick);

  render();

  requestAnimationFrame(() => {
    computeScale();
    window.addEventListener('resize', () => { computeScale(); });
  });
}
