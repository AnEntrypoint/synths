import { createElement } from 'webjsx';
import { COLORS, CENTER_TABS } from './constants.js';
import { Knob } from './Knob.js';
import { VSlider } from './VSlider.js';

const CHEVRON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

const TAB_LABELS = [
  { label: 'Modal', value: 'modal' },
  { label: 'Object 1', value: 'obj1' },
  { label: 'Object 2', value: 'obj2' },
];

export function CenterPanel({ params, onChange, centerTab, setCenterTab }) {
  const p = params;
  const getFreqKey = (i) => `${centerTab === 'modal' ? 'modal' : centerTab}Freq${i}`;
  const getGainKey = (i) => centerTab === 'modal' ? `modal${i}` : `${centerTab}_${i}`;

  const partialStrips = Array.from({ length: 8 }, (_, i) => {
    const freqKey = getFreqKey(i);
    const gainKey = getGainKey(i);
    return createElement('div', {
      key: i,
      style: 'display:flex;flex-direction:column;align-items:center;height:100%;width:38px;',
    },
      createElement('div', { style: `width:10px;height:10px;border-radius:50%;border:1px solid ${COLORS.lcdDark};box-shadow:inset 0 1px 3px rgba(0,0,0,0.5);margin-bottom:8px;cursor:pointer;background-color:${COLORS.lcdBright};` }),
      createElement('div', { style: `width:10px;height:10px;border-radius:50%;border:1px solid ${COLORS.lcdDark};box-shadow:inset 0 1px 3px rgba(0,0,0,0.5);margin-bottom:8px;cursor:pointer;background-color:${COLORS.lcdBright};` }),
      createElement('input', {
        type: 'number',
        step: '0.01',
        style: `font-size:11px;font-family:monospace;width:38px;text-align:center;border-radius:2px;margin-bottom:10px;outline:none;box-shadow:inset 0 0 4px rgba(0,0,0,0.4);border:none;background-color:${COLORS.lcdDark};color:${COLORS.lcdBright};`,
        value: typeof p[freqKey] === 'number' ? p[freqKey].toFixed(2) : '0.00',
        oninput: (e) => onChange({ target: { name: freqKey, value: parseFloat(e.target.value) || 0 } }),
        'aria-label': `Partial ${i + 1} frequency`,
      }),
      createElement('div', { style: `width:100%;height:2px;margin-bottom:10px;background-color:${COLORS.lcdDark}50;` }),
      createElement('div', { style: 'flex:1;width:100%;display:flex;justify-content:center;padding-bottom:4px;' },
        VSlider({
          name: gainKey,
          value: p[gainKey] ?? 0,
          onChange: (e) => onChange({ target: { name: gainKey, value: parseFloat(e.target.value) } }),
          height: '100%',
          type: 'lcd',
        })
      )
    );
  });

  return createElement('div', {
    style: 'flex:1;padding:16px;display:flex;flex-direction:column;gap:16px;position:relative;z-index:0;border-right:1px solid #c0c0c0;min-width:0;',
  },
    createElement('div', { style: 'display:flex;justify-content:space-between;align-items:flex-end;padding:0 8px;gap:8px;' },
      Knob({ label: 'Input Mix', name: 'inputMix', value: p.inputMix, onChange, size: 32 }),
      createElement('div', { style: 'display:flex;flex-direction:column;align-items:center;flex:1;margin:0 12px;min-width:0;' },
        createElement('div', { style: 'display:flex;align-items:center;justify-content:space-between;width:100%;padding:0 12%;position:relative;height:20px;margin-bottom:4px;' },
          createElement('div', { style: 'width:100%;height:1.5px;position:absolute;top:50%;left:0;background:#aaa;' }),
          ...['ON','ON','ON'].map((label, i) =>
            createElement('div', { key: i, style: 'position:relative;display:flex;flex-direction:column;align-items:center;z-index:10;' },
              createElement('span', { style: 'font-size:7px;font-weight:900;color:#666;position:absolute;bottom:100%;margin-bottom:2px;' }, label),
              createElement('div', { style: `width:12px;height:12px;border-radius:50%;border:1.5px solid #666;background-color:${COLORS.chassis};` })
            )
          )
        ),
        createElement('div', { style: 'display:flex;width:100%;padding:3px;border-radius:8px 8px 0 0;border:1px solid #a3a3a3;border-bottom:none;margin-bottom:-6px;z-index:10;background:#c8c8c8;padding-bottom:8px;' },
          ...TAB_LABELS.map(({ label, value }) =>
            createElement('button', {
              key: value,
              onclick: () => setCenterTab(value),
              style: `flex:1;padding:6px 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;border-radius:3px;border:1px solid ${centerTab === value ? '#74875a' : 'transparent'};cursor:pointer;transition:all 0.2s;background-color:${centerTab === value ? '#98a87d' : '#dfdfd9'};color:${centerTab === value ? '#2c3322' : '#777'};box-shadow:${centerTab === value ? '0 -2px 4px rgba(0,0,0,0.1)' : 'inset 0 0 4px rgba(0,0,0,0.05)'};`,
            }, label)
          )
        )
      ),
      createElement('div', { style: 'display:flex;gap:12px;align-items:flex-end;flex-shrink:0;' },
        Knob({ label: 'TrigPos', name: 'trigPos', value: p.trigPos, onChange, size: 36 }),
        createElement('div', { style: 'display:flex;align-items:center;gap:8px;padding:6px;border-radius:4px;border:1px solid #b0b0b0;height:48px;background:#c8c8c8;box-shadow:inset 0 1px 3px rgba(0,0,0,0.1);' },
          createElement('div', { style: `padding:4px 10px;border-radius:2px;font-size:14px;font-family:monospace;font-weight:700;box-shadow:inset 0 0 4px rgba(0,0,0,0.4);background:black;color:${COLORS.modYellow};` }, '0'),
          createElement('div', { style: 'display:flex;flex-direction:column;text-align:center;justify-content:center;' },
            createElement('div', { style: `padding:2px 8px;border-radius:2px;font-size:9px;font-weight:700;border:1px solid #333;display:flex;align-items:center;gap:4px;cursor:pointer;background:black;color:${COLORS.modYellow};`, innerHTML: CHEVRON_SVG + ' Select' }),
            createElement('span', { style: 'font-size:8px;font-weight:700;text-transform:uppercase;color:#666;margin-top:4px;' }, 'Template'),
          )
        ),
        Knob({ label: 'Low Cut', name: 'lowCut', value: p.lowCut, onChange, size: 32 }),
      )
    ),
    createElement('div', {
      style: `border-radius:12px;border:6px solid ${COLORS.lcdDark};box-shadow:inset 0 10px 25px rgba(0,0,0,0.45);flex:1;padding:12px;display:flex;position:relative;z-index:0;overflow:hidden;background-color:${COLORS.lcdBg};min-height:220px;`,
    },
      createElement('div', { style: 'position:absolute;inset:0;opacity:0.03;pointer-events:none;background-image:linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px);background-size:3px 3px;' }),
      createElement('div', {
        style: `display:flex;flex-direction:column;justify-content:space-between;width:40px;font-size:9px;font-weight:900;font-family:monospace;line-height:1;padding:4px 0;position:absolute;left:12px;top:8px;bottom:12px;z-index:10;user-select:none;color:${COLORS.lcdDark};`,
      },
        createElement('span', {}, 'ON'),
        createElement('span', {}, 'KBD'),
        createElement('span', {}, 'FREQ'),
        createElement('span', { style: 'line-height:1.1;letter-spacing:-0.05em;' }, 'POLA-\nRITY'),
        createElement('span', { style: 'font-size:11px;' }, 'GAIN'),
      ),
      createElement('div', { style: 'flex:1;display:flex;justify-content:space-between;margin-left:56px;margin-right:80px;height:100%;position:relative;z-index:10;padding-top:4px;' },
        ...partialStrips
      ),
      createElement('div', { style: `position:absolute;inset:0;display:flex;justify-content:space-between;padding:0 70px 24px 95px;pointer-events:none;opacity:0.07;font-weight:900;font-size:76px;align-items:center;user-select:none;color:${COLORS.lcdDark};` },
        createElement('span', {}, '1'),
        createElement('span', {}),
        createElement('span', {}),
        createElement('span', {}),
        createElement('span', {}),
        createElement('span', {}),
        createElement('span', {}),
        createElement('span', {}, '8'),
      ),
      createElement('div', {
        style: `width:70px;border-left:1px solid ${COLORS.lcdDark}50;padding-left:12px;display:flex;flex-direction:column;font-size:9px;font-family:monospace;font-weight:700;position:absolute;right:12px;top:8px;bottom:12px;z-index:10;user-select:none;color:${COLORS.lcdDark};`,
      },
        createElement('div', { style: 'text-align:right;width:100%;margin-bottom:6px;line-height:1;' }, '257\n', createElement('span', { style: 'font-size:8px;' }, 'TUNING')),
        createElement('div', { style: 'text-align:right;width:100%;margin-bottom:8px;line-height:1;' }, '0\n', createElement('span', { style: 'font-size:8px;' }, 'KEY TRACK+')),
        createElement('div', { style: 'text-align:right;width:100%;margin-bottom:4px;font-size:8px;letter-spacing:-0.05em;' }, 'COUPLING'),
        createElement('div', { style: 'display:flex;flex-direction:column;gap:3px;align-items:flex-end;width:100%;margin-bottom:8px;font-size:8px;' },
          ...[ { label: 'OFF', val: 'Off' }, { label: 'ON', val: 'On' }, { label: 'X-OVER', val: 'X-Over' } ].map(({ label, val }) =>
            createElement('span', {
              style: 'display:flex;align-items:center;gap:6px;cursor:pointer;',
              onclick: () => onChange({ target: { name: 'couplingMode', value: val } }),
            },
              createElement('div', { style: `width:8px;height:8px;border-radius:50%;border:1px solid ${COLORS.lcdDark};background-color:${(p.couplingMode ?? 'Off') === val ? COLORS.lcdBright : COLORS.lcdDark};` }),
              label
            )
          )
        ),
        createElement('div', { style: `margin-top:auto;display:flex;flex-direction:column;align-items:center;border:1px solid ${COLORS.lcdDark}50;border-radius:4px;padding:6px;width:100%;` },
          createElement('div', { style: `width:24px;height:24px;border-radius:50%;border:2px solid ${COLORS.lcdDark};display:flex;align-items:center;justify-content:center;position:relative;` },
            createElement('div', { style: `position:absolute;top:2px;width:2px;height:10px;background-color:${COLORS.lcdDark};transform:rotate(45deg);transform-origin:center bottom;` })
          ),
          createElement('span', { style: 'margin-top:4px;font-size:8px;' }, 'FREQ'),
        )
      )
    ),
    createElement('div', { style: 'display:flex;justify-content:space-between;border-top:1px solid #b0b0b0;padding-top:12px;padding-bottom:4px;margin-top:auto;' },
      createElement('div', { style: 'display:flex;flex-direction:column;align-items:center;gap:8px;padding:0 2%;width:18%;flex-shrink:0;' },
        createElement('span', { style: 'font-size:10px;font-weight:700;color:#777;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #c8c8c8;width:100%;text-align:center;padding-bottom:4px;margin-bottom:4px;' }, 'Collision'),
        createElement('div', { style: 'display:flex;gap:8px;justify-content:center;width:100%;' },
          Knob({ label: 'Amount', name: 'collisionAmount', value: p.collisionAmount, onChange, size: 28 }),
          Knob({ label: 'Bounce', name: 'collisionBounce', value: p.collisionBounce, onChange, size: 28 }),
        )
      ),
      createElement('div', { style: 'display:flex;flex-direction:column;align-items:center;gap:8px;padding:0 2%;width:18%;flex-shrink:0;' },
        createElement('span', { style: 'font-size:10px;font-weight:700;color:#777;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #c8c8c8;width:100%;text-align:center;padding-bottom:4px;margin-bottom:4px;' }, 'Pitch Mod'),
        createElement('div', { style: 'display:flex;gap:8px;justify-content:center;width:100%;' },
          Knob({ label: 'Amount', name: 'pitchModAmount', value: p.pitchModAmount, onChange, size: 28 }),
          Knob({ label: 'Filter', name: 'pitchModFilter', value: p.pitchModFilter, onChange, size: 28 }),
        )
      ),
      createElement('div', { style: 'display:flex;flex-direction:column;align-items:center;gap:8px;padding:0 2%;width:22%;flex-shrink:0;' },
        createElement('span', { style: 'font-size:10px;font-weight:700;color:#777;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #c8c8c8;width:100%;text-align:center;padding-bottom:4px;margin-bottom:4px;' }, 'Dispersion'),
        createElement('div', { style: 'display:flex;gap:6px;align-items:flex-end;justify-content:center;width:100%;' },
          Knob({ label: 'Freq', name: 'dispersionFreq', value: p.dispersionFreq, onChange, size: 28 }),
          Knob({ label: 'Mod', name: 'dispersionMod', value: p.dispersionMod, onChange, size: 22 }),
          Knob({ label: 'Filter', name: 'dispersionFilter', value: p.dispersionFilter, onChange, size: 22 }),
        )
      ),
      createElement('div', { style: 'display:flex;flex-direction:column;align-items:center;gap:8px;padding:0 2%;width:25%;flex-shrink:0;' },
        createElement('span', { style: 'font-size:10px;font-weight:700;color:#777;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #c8c8c8;width:100%;text-align:center;padding-bottom:4px;margin-bottom:4px;' }, 'Damping'),
        createElement('div', { style: 'display:flex;gap:4px;justify-content:center;width:100%;align-items:flex-end;' },
          createElement('div', { style: 'display:flex;flex-direction:column;gap:4px;align-items:center;' },
            Knob({ label: 'Low', name: 'dampingLow', value: p.dampingLow, onChange, size: 18 }),
            Knob({ label: 'Gain', name: 'dampingGain', value: p.dampingGain, onChange, size: 24 }),
          ),
          createElement('div', { style: 'display:flex;flex-direction:column;gap:4px;align-items:center;' },
            Knob({ label: 'Mid', name: 'dampingMid', value: p.dampingMid, onChange, size: 18 }),
            Knob({ label: 'Slope', name: 'dampingSlope', value: p.dampingSlope, onChange, size: 24 }),
          ),
          Knob({ label: 'Hi', name: 'dampingHi', value: p.dampingHi, onChange, size: 18 }),
        )
      ),
      createElement('div', { style: 'display:flex;flex-direction:column;align-items:center;gap:8px;padding-left:2%;width:17%;flex-shrink:0;' },
        createElement('span', { style: 'font-size:10px;font-weight:700;color:#777;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #c8c8c8;width:100%;text-align:center;padding-bottom:4px;margin-bottom:4px;' }, 'Decay'),
        createElement('div', { style: 'display:flex;gap:8px;align-items:flex-end;justify-content:center;width:100%;' },
          Knob({ label: 'Time', name: 'decayTime', value: p.decayTime, onChange, size: 34 }),
          Knob({ label: 'RelMute', name: 'decayRelMute', value: p.decayRelMute, onChange, size: 22 }),
        )
      ),
    )
  );
}
