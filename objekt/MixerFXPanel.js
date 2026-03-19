import { createElement } from 'webjsx';
import { COLORS, FX_TABS, CENTER_TABS } from './constants.js';
import { Knob } from './Knob.js';
import { VSlider } from './VSlider.js';

const DIST_TYPE_LIST = ['Ring', 'S/H', 'Sine', 'Tube', 'Scream', 'Dist'];

const MIX_CHANNELS = [
  { lbl: 'Exciter', val: 'mixExciter', color: COLORS.modYellow, pan: 'panExciter', hasWidth: false },
  { lbl: 'Modal', val: 'mixModal', color: '#a3e635', pan: 'panModal', hasWidth: false },
  { lbl: 'Obj 1', val: 'mixObj1', color: '#a3e635', pan: 'panObj1', hasWidth: true },
  { lbl: 'Obj 2', val: 'mixObj2', color: '#a3e635', pan: 'panObj2', hasWidth: true },
];

const DICE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>`;

function FXKnobRow({ items }) {
  return createElement('div', { style: 'display:flex;align-items:flex-end;justify-content:center;gap:16px;flex-wrap:wrap;padding:0 8px;' },
    ...items.map(item => Knob({ label: item.label, name: item.name, value: item.value, onChange: item.onChange, size: item.size ?? 28, bipolar: item.bipolar }))
  );
}

export function MixerFXPanel({ params, onChange, activeFXTab, setActiveFXTab, centerTab, setCenterTab, onRandomize }) {
  const p = params;
  const currentDistIndex = DIST_TYPE_LIST.indexOf(params.distType);
  const distPercent = currentDistIndex >= 0 ? currentDistIndex / (DIST_TYPE_LIST.length - 1) : 0.5;

  const fxOn = {
    DIST: (p.distAmount ?? 0) > 0.02,
    COMP: (p.compRatio ?? 0) > 0.1,
    DLY: (p.dlyMix ?? 0) > 0.01,
    REV: (p.revMix ?? 0) > 0.01,
    EQ: p.eqLow !== 0.5 || p.eqMid !== 0.5 || p.eqHigh !== 0.5,
  };

  const eqPoints = [
    `0,${16 - ((p.eqLow ?? 0.5) - 0.5) * 28}`,
    `25,${16 - ((p.eqLow ?? 0.5) - 0.5) * 28}`,
    `50,${16 - ((p.eqMid ?? 0.5) - 0.5) * 28}`,
    `75,${16 - ((p.eqHigh ?? 0.5) - 0.5) * 28}`,
    `100,${16 - ((p.eqHigh ?? 0.5) - 0.5) * 28}`,
  ].join(' ');

  return createElement('div', { style: 'width:240px;flex-shrink:0;padding:12px;display:flex;flex-direction:column;gap:12px;position:relative;z-index:10;' },
    createElement('div', { style: 'border-radius:4px;padding:8px;border:1px solid #a3a3a3;display:flex;flex-direction:column;position:relative;background:#c8c8c8;box-shadow:inset 0 1px 3px rgba(0,0,0,0.1);' },
      createElement('div', { style: 'display:flex;justify-content:flex-end;gap:8px;align-items:center;margin-bottom:8px;margin-top:4px;margin-right:4px;border-bottom:1px solid #a3a3a3;padding-bottom:8px;' },
        createElement('div', { style: 'display:flex;flex-direction:column;gap:6px;' },
          createElement('div', { style: `width:10px;height:10px;border-radius:50%;border:1px solid #222;box-shadow:inset 0 1px 2px rgba(0,0,0,0.5);background-color:${COLORS.lcdDark};` }),
          createElement('div', { style: `width:10px;height:10px;border-radius:50%;border:1px solid #222;box-shadow:inset 0 1px 2px rgba(0,0,0,0.5);background-color:${COLORS.lcdDark};` }),
        ),
        Knob({ size: 24, color: '#444', label: 'Output', labelPosition: 'top', value: p.masterVolume ?? 0.8, name: 'masterVolume', onChange }),
      ),
      createElement('div', { style: 'display:flex;justify-content:space-between;padding:0 8px;margin-bottom:4px;' },
        ...MIX_CHANNELS.map(ch =>
          createElement('div', { key: ch.val, style: 'display:flex;flex-direction:column;align-items:center;' },
            createElement('div', { style: `width:8px;height:8px;border-radius:50%;margin-bottom:6px;box-shadow:0 1px 2px rgba(0,0,0,0.3);background-color:${ch.color};` }),
            createElement('span', { style: 'font-size:8.5px;font-weight:700;color:#666;text-transform:uppercase;line-height:1.2;text-align:center;margin-bottom:8px;height:24px;', innerHTML: ch.lbl.replace(' ', '<br>') }),
            VSlider({ name: ch.val, value: p[ch.val], onChange: (e) => onChange({ target: { name: ch.val, value: parseFloat(e.target.value) } }), height: 80, type: 'mixer' }),
            createElement('div', { style: 'margin-top:12px;' }, Knob({ name: ch.pan, value: p[ch.pan], onChange, size: 18, bipolar: true })),
            ch.hasWidth ? createElement('div', { style: 'margin-top:6px;' }, Knob({ value: p.widthObj ?? 0.5, name: 'widthObj', onChange, size: 18 })) : null,
          )
        )
      ),
      createElement('div', { style: 'display:flex;justify-content:flex-end;padding-right:18px;gap:16px;font-size:8px;font-weight:700;color:#888;text-transform:uppercase;margin:4px 0;' },
        createElement('span', {}, 'Pan'),
        createElement('span', {}, 'Width'),
      )
    ),
    createElement('div', { style: `border-radius:4px;padding:8px;display:flex;flex-direction:column;gap:8px;border:1px solid #222;background-color:${COLORS.modDark};box-shadow:inset 0 2px 10px rgba(0,0,0,0.5);` },
      createElement('div', { style: 'display:flex;gap:6px;' },
        createElement('button', {
          onclick: onRandomize,
          style: `flex:1;color:black;font-size:10px;font-weight:900;letter-spacing:0.1em;padding:6px;border-radius:2px;box-shadow:0 1px 2px rgba(0,0,0,0.2);border:1px solid #a87f1d;display:flex;justify-content:center;align-items:center;gap:4px;cursor:pointer;background-color:${COLORS.modYellow};`,
          innerHTML: DICE_SVG + ' Randomize',
        }),
        createElement('button', { style: 'width:32px;color:#ccc;font-size:10px;font-weight:700;border-radius:2px;box-shadow:inset 0 0 4px rgba(0,0,0,0.4);border:1px solid #333;cursor:pointer;background:#555;' }, 'X'),
        createElement('button', { style: 'width:32px;color:#ccc;font-size:10px;font-weight:700;border-radius:2px;box-shadow:inset 0 0 4px rgba(0,0,0,0.4);border:1px solid #333;cursor:pointer;background:#555;' }, 'OK'),
      ),
      createElement('div', { style: 'display:flex;justify-content:space-between;padding:0 12px;font-size:9px;font-weight:700;text-transform:uppercase;margin-top:2px;color:#aaa;' },
        ...CENTER_TABS.map(t =>
          createElement('label', { key: t, style: 'display:flex;align-items:center;gap:6px;cursor:pointer;' },
            createElement('input', {
              type: 'radio',
              checked: centerTab === t,
              onchange: () => setCenterTab(t),
              style: `width:10px;height:10px;accent-color:${COLORS.modYellow};`,
            }),
            t === 'modal' ? 'Modal' : t === 'obj1' ? 'Obj 1' : 'Obj 2',
          )
        )
      )
    ),
    createElement('div', { style: `border-radius:4px;flex:1;padding:8px;border:1px solid ${COLORS.panelYellowDark};display:flex;flex-direction:column;position:relative;background-color:${COLORS.panelYellow};box-shadow:inset 0 1px 3px rgba(0,0,0,0.1);` },
      createElement('div', { style: 'display:flex;font-size:10px;font-weight:900;letter-spacing:-0.025em;justify-content:space-between;margin-bottom:2px;padding:0 4px;color:rgba(0,0,0,0.5);' },
        ...FX_TABS.map(t =>
          createElement('span', { key: t, onclick: () => setActiveFXTab(t), style: `cursor:pointer;user-select:none;transition:color 0.2s;color:${activeFXTab === t ? 'black' : 'rgba(0,0,0,0.5)'};` }, t)
        )
      ),
      createElement('div', { style: 'display:flex;font-size:8.5px;font-weight:700;justify-content:space-between;margin-bottom:8px;padding:0 4px;' },
        ...FX_TABS.map(t =>
          createElement('button', { key: t, onclick: () => setActiveFXTab(t), style: `cursor:pointer;transition:color 0.2s;color:${fxOn[t] ? '#dc2626' : 'rgba(0,0,0,0.28)'};background:none;border:none;padding:0;font-size:8.5px;font-weight:700;` }, fxOn[t] ? 'ON' : 'OFF')
        )
      ),
      createElement('div', { style: 'text-align:center;font-size:11px;font-weight:900;text-transform:uppercase;margin-bottom:12px;border-bottom:1px solid rgba(0,0,0,0.1);padding-bottom:4px;margin-left:8px;margin-right:8px;color:rgba(0,0,0,0.65);' },
        activeFXTab === 'DIST' ? 'Distortion' : activeFXTab === 'COMP' ? 'Compressor' : activeFXTab === 'DLY' ? 'Delay' : activeFXTab === 'REV' ? 'Reverb' : 'Equalizer'
      ),
      activeFXTab === 'DIST' ? createElement('div', { style: 'flex:1;display:flex;align-items:center;justify-content:space-between;padding:0 8px;' },
        createElement('div', { style: 'display:flex;gap:6px;position:relative;height:90px;' },
          createElement('div', { style: 'width:6px;border-radius:9999px;height:100%;position:relative;border:1px solid rgba(0,0,0,0.2);background:rgba(0,0,0,0.1);' },
            createElement('div', { style: `position:absolute;width:10px;height:10px;border-radius:50%;left:50%;transform:translateX(-50%);box-shadow:0 1px 2px rgba(0,0,0,0.3);border:1px solid #222;background:#444;bottom:calc(${distPercent * 100}% - 5px);` })
          ),
          createElement('div', { style: 'display:flex;flex-direction:column;justify-content:space-between;font-size:8px;font-weight:700;height:100%;padding:1px 0;line-height:1;color:rgba(0,0,0,0.55);' },
            ...DIST_TYPE_LIST.map(t =>
              createElement('span', { key: t, onclick: () => onChange({ target: { name: 'distType', value: t } }), style: `cursor:pointer;transition:color 0.2s;color:${params.distType === t ? 'black' : 'rgba(0,0,0,0.55)'};font-weight:${params.distType === t ? 900 : 700};` }, t)
            )
          )
        ),
        createElement('div', { style: 'display:flex;flex-direction:column;justify-content:space-between;align-items:center;height:100%;padding-bottom:4px;gap:12px;' },
          Knob({ label: 'Drive', name: 'distDrive', value: p.distDrive, onChange, size: 32 }),
          createElement('div', { style: 'display:flex;gap:12px;' },
            Knob({ label: 'Tone', name: 'distTone', value: p.distTone ?? 0.5, onChange, size: 24 }),
            Knob({ label: 'Amt', name: 'distAmount', value: p.distAmount, onChange, size: 24 }),
          )
        )
      ) : null,
      activeFXTab === 'COMP' ? createElement('div', { style: 'flex:1;display:flex;flex-direction:column;gap:12px;padding:0 8px;justify-content:center;' },
        FXKnobRow({ items: [
          { label: 'Thresh', name: 'compThresh', value: p.compThresh ?? 0.45, onChange },
          { label: 'Ratio', name: 'compRatio', value: p.compRatio ?? 0.25, onChange },
        ]}),
        FXKnobRow({ items: [
          { label: 'Attack', name: 'compAttack', value: p.compAttack ?? 0.15, onChange },
          { label: 'Release', name: 'compRelease', value: p.compRelease ?? 0.5, onChange },
        ]}),
        createElement('div', { style: 'display:flex;align-items:center;gap:6px;padding:0 4px;' },
          createElement('span', { style: 'font-size:7.5px;font-weight:900;text-transform:uppercase;color:rgba(0,0,0,0.4);' }, 'GR'),
          createElement('div', { style: 'flex:1;height:6px;border-radius:9999px;overflow:hidden;background:rgba(0,0,0,0.15);' },
            createElement('div', { style: `height:100%;border-radius:9999px;transition:width 0.2s;width:${(p.compRatio ?? 0) * 60}%;background-color:${COLORS.modYellow};` })
          )
        )
      ) : null,
      activeFXTab === 'DLY' ? createElement('div', { style: 'flex:1;display:flex;flex-direction:column;gap:12px;padding:0 8px;justify-content:center;' },
        FXKnobRow({ items: [
          { label: 'Time', name: 'dlyTime', value: p.dlyTime ?? 0.25, onChange },
          { label: 'Fdbk', name: 'dlyFeedback', value: p.dlyFeedback ?? 0.3, onChange },
        ]}),
        FXKnobRow({ items: [{ label: 'Mix', name: 'dlyMix', value: p.dlyMix ?? 0, onChange }] }),
        createElement('div', { style: 'display:flex;justify-content:center;gap:8px;margin-top:4px;' },
          ...['Sync', 'Ping', 'Free'].map(lbl =>
            createElement('div', { key: lbl, style: `padding:2px 8px;border-radius:2px;font-size:7.5px;font-weight:900;text-transform:uppercase;border:1px solid rgba(0,0,0,0.15);cursor:pointer;background:${lbl === 'Free' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)'};color:rgba(0,0,0,0.6);` }, lbl)
          )
        )
      ) : null,
      activeFXTab === 'REV' ? createElement('div', { style: 'flex:1;display:flex;flex-direction:column;gap:12px;padding:0 8px;justify-content:center;' },
        FXKnobRow({ items: [
          { label: 'Size', name: 'revSize', value: p.revSize ?? 0.5, onChange },
          { label: 'Decay', name: 'revDecay', value: p.revDecay ?? 0.5, onChange },
        ]}),
        FXKnobRow({ items: [{ label: 'Mix', name: 'revMix', value: p.revMix ?? 0, onChange }] }),
        createElement('div', { style: 'display:flex;justify-content:center;gap:6px;margin-top:4px;' },
          ...['Hall', 'Room', 'Plate', 'Spring'].map(lbl =>
            createElement('div', { key: lbl, style: 'padding:2px 6px;border-radius:2px;font-size:7px;font-weight:900;text-transform:uppercase;border:1px solid rgba(0,0,0,0.15);cursor:pointer;background:rgba(0,0,0,0.08);color:rgba(0,0,0,0.6);' }, lbl)
          )
        )
      ) : null,
      activeFXTab === 'EQ' ? createElement('div', { style: 'flex:1;display:flex;flex-direction:column;gap:12px;padding:0 8px;justify-content:center;' },
        FXKnobRow({ items: [
          { label: 'Low', name: 'eqLow', value: p.eqLow ?? 0.5, onChange, size: 28, bipolar: true },
          { label: 'Mid', name: 'eqMid', value: p.eqMid ?? 0.5, onChange, size: 28, bipolar: true },
          { label: 'High', name: 'eqHigh', value: p.eqHigh ?? 0.5, onChange, size: 28, bipolar: true },
        ]}),
        createElement('div', { style: 'margin:0 4px;height:32px;border-radius:2px;overflow:hidden;border:1px solid rgba(0,0,0,0.15);background:rgba(0,0,0,0.12);' },
          createElement('svg', { viewBox: '0 0 100 32', style: 'width:100%;height:100%;', preserveAspectRatio: 'none' },
            createElement('line', { x1: 0, y1: 16, x2: 100, y2: 16, stroke: 'rgba(0,0,0,0.2)', 'stroke-width': 0.5, 'stroke-dasharray': '2,2' }),
            createElement('polyline', { points: eqPoints, fill: 'none', stroke: COLORS.modYellow, 'stroke-width': 1.5, 'stroke-linejoin': 'round' })
          )
        )
      ) : null,
    )
  );
}
