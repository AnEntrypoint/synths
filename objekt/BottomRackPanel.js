import { createElement } from 'webjsx';
import { COLORS, MOD_MATRIX_ROWS, VOICE_MODES } from './constants.js';
import { Knob } from './Knob.js';

const LFO_TABS = ['LFO 1', 'LFO 2', 'Curve', 'Macro'];

const CHEVRON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

export function BottomRackPanel({ lfoTab, setLfoTab, params, onChange }) {
  const voiceMode = params.voiceMode || 'Poly 8';
  const pitchRange = typeof params.pitchRange === 'number' ? params.pitchRange : 2;

  const lfoPath = lfoTab === 'LFO 1'
    ? 'M0,20 Q10,0 20,20 Q30,40 40,20 Q50,0 60,20 Q70,40 80,20 Q90,0 100,20'
    : lfoTab === 'LFO 2'
    ? 'M0,20 L20,20 L20,5 L40,5 L40,35 L60,35 L60,5 L80,5 L80,35 L100,35'
    : lfoTab === 'Curve'
    ? 'M0,0 Q20,30 100,38'
    : 'M0,38 L25,30 L50,10 L75,25 L100,5';

  const lfoHz = lfoTab === 'Curve' ? '1.583Hz' : lfoTab === 'LFO 1' ? '2.00Hz' : lfoTab === 'LFO 2' ? '0.50Hz' : '--';

  return createElement('div', {
    style: `min-height:170px;flex-shrink:0;padding:16px;display:flex;gap:16px;border-top:1px solid #111;background-color:${COLORS.modDark};`,
  },
    createElement('div', { style: 'width:128px;border-right:1px solid #444;padding-right:16px;display:flex;flex-direction:column;gap:8px;flex-shrink:0;' },
      createElement('div', { style: `display:flex;justify-content:space-between;font-size:9px;font-weight:700;color:${COLORS.modYellow};` },
        createElement('div', { style: 'display:flex;flex-direction:column;align-items:center;' },
          createElement('div', { style: `padding:2px 6px;border-radius:2px;box-shadow:inset 0 0 4px rgba(0,0,0,0.4);margin-bottom:4px;display:flex;align-items:center;gap:4px;font-size:9px;cursor:pointer;background:black;color:${COLORS.modYellow};`, innerHTML: CHEVRON_SVG + ' Off' }),
          createElement('span', {}, 'Portamento'),
        ),
        createElement('div', { style: 'display:flex;flex-direction:column;align-items:center;' },
          Knob({ value: 0.5, size: 18, color: COLORS.modYellow }),
          createElement('span', {}, 'Rate'),
        )
      ),
      createElement('div', { style: `display:flex;justify-content:space-between;font-size:9px;font-weight:700;color:${COLORS.modYellow};` },
        createElement('div', { style: 'display:flex;flex-direction:column;align-items:center;width:100%;' },
          createElement('div', {
            style: `padding:2px 12px;border-radius:2px;box-shadow:inset 0 0 4px rgba(0,0,0,0.4);margin-bottom:4px;font-family:monospace;cursor:pointer;background:black;color:${COLORS.modYellow};`,
            onclick: () => {
              const next = pitchRange === 12 ? 2 : pitchRange + 2;
              onChange({ target: { name: 'pitchRange', value: next } });
            },
          }, pitchRange),
          createElement('span', {}, 'Range'),
        ),
        createElement('div', { style: 'display:flex;flex-direction:column;align-items:center;width:100%;position:relative;' },
          createElement('select', {
            value: voiceMode,
            onchange: (e) => onChange({ target: { name: 'voiceMode', value: e.target.value } }),
            style: `padding:2px 6px;border-radius:2px;box-shadow:inset 0 0 4px rgba(0,0,0,0.4);margin-bottom:4px;font-size:9px;font-weight:700;cursor:pointer;text-align:center;width:100%;background:black;color:${COLORS.modYellow};border:none;outline:none;appearance:none;`,
          }, ...VOICE_MODES.map(m => createElement('option', { value: m }, m))),
          createElement('span', {}, 'Key Mode'),
        )
      ),
      createElement('div', { style: 'flex:1;display:flex;gap:16px;justify-content:center;align-items:flex-end;padding-bottom:4px;margin-top:8px;' },
        ...['Pitch', 'Mod'].map((lbl, i) =>
          createElement('div', { key: lbl, style: 'display:flex;flex-direction:column;align-items:center;gap:4px;' },
            createElement('div', { style: 'width:16px;height:48px;border-radius:2px;border:1px solid #444;position:relative;background:black;box-shadow:inset 0 2px 5px rgba(0,0,0,0.8);' },
              createElement('div', { style: `width:100%;height:10px;border-radius:2px;border-top:1px solid #aaa;position:absolute;background:#888;${i === 0 ? 'top:50%;transform:translateY(-50%)' : 'bottom:0'};` })
            ),
            createElement('span', { style: 'font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#888;' }, lbl)
          )
        )
      )
    ),
    createElement('div', { style: 'flex:1;border-right:1px solid #444;padding-right:16px;display:flex;flex-direction:column;padding-left:4px;justify-content:space-between;min-width:0;' },
      createElement('div', { style: `display:grid;grid-template-columns:3fr 1fr 3fr 1fr 3fr 1fr;font-size:9px;font-weight:700;text-transform:uppercase;margin-bottom:4px;border-bottom:1px solid #444;padding-bottom:4px;letter-spacing:0.1em;color:${COLORS.modYellow};` },
        createElement('span', { style: 'padding-left:4px;' }, 'Source'),
        createElement('span', { style: 'text-align:center;' }, 'AMT'),
        createElement('span', { style: 'padding-left:4px;' }, 'Destination'),
        createElement('span', { style: 'text-align:center;' }, 'AMT2'),
        createElement('span', { style: 'padding-left:4px;' }, 'Destination 2'),
        createElement('span', { style: 'text-align:center;' }, 'Scale'),
      ),
      ...MOD_MATRIX_ROWS.map((row, i) =>
        createElement('div', { key: i, style: `display:grid;grid-template-columns:3fr 1fr 3fr 1fr 3fr 1fr;font-size:10px;font-family:monospace;padding:4px 0;border-bottom:1px solid rgba(68,68,68,0.5);align-items:center;color:${COLORS.modText};` },
          createElement('span', { style: 'padding:1px 6px;border-radius:2px;margin:0 4px;border:1px solid transparent;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:rgba(0,0,0,0.4);' }, row.s),
          createElement('span', { style: `text-align:center;color:${COLORS.modYellow};` }, row.a1),
          createElement('span', { style: 'padding:1px 6px;border-radius:2px;margin:0 4px;border:1px solid transparent;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:rgba(0,0,0,0.4);' }, row.d1),
          createElement('span', { style: 'text-align:center;color:white;' }, row.a2 !== 0 ? `↑ ${row.a2}` : '0'),
          createElement('span', { style: 'padding:1px 6px;border-radius:2px;margin:0 4px;border:1px solid transparent;cursor:pointer;color:#777;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:rgba(0,0,0,0.4);' }, row.d2),
          createElement('span', { style: 'padding:1px 6px;border-radius:2px;margin:0 4px;border:1px solid transparent;cursor:pointer;display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.4);' },
            createElement('span', { style: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;' }, row.sc),
            createElement('span', { style: `border:1px solid ${COLORS.modYellow};border-radius:50%;width:12px;height:12px;display:flex;align-items:center;justify-content:center;font-size:7px;flex-shrink:0;color:${COLORS.modYellow};` }, 'x')
          )
        )
      ),
      createElement('button', { style: 'margin-top:4px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;text-align:left;padding-left:4px;color:#666;cursor:pointer;background:none;border:none;' }, '+ Add Row'),
    ),
    createElement('div', { style: `width:200px;display:flex;flex-direction:column;gap:4px;padding:0 4px;justify-content:space-between;flex-shrink:0;color:${COLORS.modYellow};` },
      createElement('div', { style: 'display:flex;gap:12px;font-size:9px;font-weight:700;border-bottom:1px solid #444;padding-bottom:4px;letter-spacing:0.1em;' },
        ...LFO_TABS.map(t =>
          createElement('span', {
            key: t,
            onclick: () => setLfoTab(t),
            style: `cursor:pointer;transition:color 0.2s;color:${lfoTab === t ? COLORS.modYellow : '#666'};${lfoTab === t ? `border-bottom:2.5px solid ${COLORS.modYellow};padding-bottom:1px;` : ''}`,
          }, t)
        )
      ),
      createElement('div', { style: 'border-radius:3px;border:1px solid #444;height:65px;margin-top:4px;padding:4px;position:relative;box-shadow:inset 0 0 8px rgba(0,0,0,0.3);background:rgba(0,0,0,0.6);' },
        createElement('svg', { viewBox: '0 0 100 40', preserveAspectRatio: 'none', style: 'width:100%;height:100%;fill:none;', 'stroke-width': 2, stroke: COLORS.modYellow },
          createElement('path', { d: lfoPath })
        ),
        createElement('div', { style: `position:absolute;top:4px;left:4px;font-size:8px;padding:2px 6px;border-radius:2px;font-family:monospace;background:rgba(0,0,0,0.8);color:${COLORS.modYellow};` }, lfoHz)
      ),
      createElement('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;font-size:8px;font-weight:700;margin-top:4px;' },
        ...[ { label: 'Stepped', def: false }, { label: 'Beat Sync', def: false }, { label: 'Oneshot', def: true }, { label: 'Key Sync', def: true }, { label: 'Bipolar', def: false }, { label: 'Global', def: false } ].map(({ label, def }) =>
          createElement('label', { key: label, style: `display:flex;align-items:center;gap:6px;cursor:pointer;text-transform:uppercase;letter-spacing:0.1em;color:${COLORS.modYellow};` },
            createElement('input', { type: 'checkbox', defaultChecked: def, style: `width:10px;height:10px;accent-color:${COLORS.modYellow};` }),
            label
          )
        )
      ),
      createElement('div', { style: 'display:flex;align-items:center;justify-content:space-between;margin-top:auto;' },
        createElement('span', { style: 'font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#666;' }, 'Rate'),
        Knob({ value: 0.4, size: 22, color: COLORS.modYellow }),
        createElement('span', { style: 'font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#666;' }, 'Depth'),
        Knob({ value: 0.6, size: 22, color: COLORS.modYellow }),
      )
    )
  );
}
