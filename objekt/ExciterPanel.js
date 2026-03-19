import { createElement } from 'webjsx';
import { COLORS } from './constants.js';
import { Knob } from './Knob.js';

function SectionHeader(title) {
  return createElement('div', {
    style: 'font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;text-align:center;margin-bottom:8px;border-bottom:1px solid rgba(0,0,0,0.12);padding-bottom:4px;color:rgba(0,0,0,0.5);',
  }, title);
}

function RoutingLine({ reverse = false }) {
  return createElement('div', { style: 'grid-column:span 2;display:flex;align-items:center;justify-content:center;padding-bottom:18px;' },
    createElement('div', { style: 'width:100%;height:1.5px;position:relative;background-color:rgba(0,0,0,0.15);' },
      createElement('div', { style: `position:absolute;top:50%;transform:translateY(-50%);width:6px;height:6px;border-radius:50%;background-color:rgba(0,0,0,0.4);${reverse ? 'left:0' : 'right:0'};` })
    )
  );
}

function VUMeter({ level, active }) {
  const SEGMENTS = 12;
  const segs = Array.from({ length: SEGMENTS }, (_, i) => {
    const threshold = i / SEGMENTS;
    const lit = active && level > threshold;
    let color = '#22c55e';
    if (i >= 9) color = '#ef4444';
    else if (i >= 7) color = '#f59e0b';
    return createElement('div', {
      key: i,
      style: `width:5px;height:4px;border-radius:1px;transition:background-color 75ms;background-color:${lit ? color : 'rgba(0,0,0,0.25)'};box-shadow:${lit ? `0 0 3px ${color}` : 'none'};`,
    });
  });
  return createElement('div', { id: 'vu-meter', style: 'display:flex;flex-direction:column-reverse;gap:1.5px;align-items:center;' }, ...segs);
}

const MIC_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`;
const MIC_OFF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`;
const ALERT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;
const RADIO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/></svg>`;
const CHEVRON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

export function ExciterPanel({ params, onChange, micState, inputLevel, onRequestMic, onReleaseMic }) {
  const p = params;
  const micIsActive = micState === 'active';
  const micIsBusy = micState === 'requesting';
  const micStatusColor = micState === 'active' ? '#22c55e' : micState === 'denied' ? '#ef4444' : micState === 'error' ? '#f59e0b' : 'rgba(0,0,0,0.35)';
  const micStatusLabel = micState === 'idle' ? 'Off' : micState === 'requesting' ? '...' : micState === 'active' ? 'Live' : micState === 'denied' ? 'Denied' : 'Error';

  return createElement('div', {
    style: `width:260px;flex-shrink:0;border-right:1px solid #c0c0c0;padding:12px;display:flex;flex-direction:column;gap:12px;position:relative;box-shadow:2px 0 5px rgba(0,0,0,0.05);z-index:10;background-color:${COLORS.panelYellow};`,
  },
    createElement('div', {
      style: `border-radius:4px;padding:8px;box-shadow:inset 0 1px 3px rgba(0,0,0,0.12);border:1px solid #b88c29;background-color:${COLORS.panelYellowMid};`,
    },
      SectionHeader('Exciter · Impact'),
      createElement('div', { style: 'display:grid;grid-template-columns:repeat(4,1fr);gap:4px 4px;align-items:end;' },
        Knob({ label: 'Level', name: 'impactLevel', value: p.impactLevel, onChange, size: 30 }),
        RoutingLine({}),
        Knob({ label: 'Vel', name: 'impactVel', value: p.impactVel, onChange, size: 30 }),
        Knob({ label: 'Freq', name: 'impactFreq', value: p.impactFreq, onChange, size: 30 }),
        Knob({ label: 'Click', name: 'impactClick', value: p.impactClick, onChange, size: 30 }),
        Knob({ label: 'Shape', name: 'impactShape', value: p.impactShape, onChange, size: 30 }),
        createElement('div', { style: 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding-bottom:8px;' },
          createElement('button', {
            onclick: () => onChange({ target: { name: 'diffuse', value: p.diffuse ? 0 : 1 } }),
            style: `width:14px;height:14px;border-radius:50%;border:1px solid rgba(0,0,0,0.6);margin-bottom:4px;cursor:pointer;transition:all 0.2s;background-color:${p.diffuse ? '#22c55e' : '#444'};box-shadow:${p.diffuse ? '0 0 8px rgba(34,197,94,0.8),inset 0 1px 2px rgba(255,255,255,0.3)' : 'inset 0 1px 3px rgba(0,0,0,0.5)'};`,
          }),
          createElement('span', { style: `font-size:7.5px;font-weight:700;text-transform:uppercase;color:${p.diffuse ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)'};` }, 'Diffuse')
        ),
        Knob({ label: 'Hardness', name: 'impactHardness', value: p.impactHardness, onChange, size: 30 }),
        RoutingLine({ reverse: true }),
        Knob({ label: 'Time', name: 'impactTime', value: p.impactTime, onChange, size: 30 }),
      )
    ),
    createElement('div', {
      style: `border-radius:4px;padding:8px;box-shadow:inset 0 1px 3px rgba(0,0,0,0.12);border:1px solid #b88c29;background-color:${COLORS.panelYellowMid};`,
    },
      SectionHeader('Exciter · Noise'),
      createElement('div', { style: 'display:grid;grid-template-columns:repeat(4,1fr);gap:12px 4px;align-items:end;' },
        Knob({ label: 'Level', name: 'noiseLevel', value: p.noiseLevel, onChange, size: 30 }),
        RoutingLine({}),
        Knob({ label: 'Rate', name: 'noiseRate', value: p.noiseRate, onChange, size: 30 }),
        createElement('div', {
          style: 'grid-column:span 4;border-radius:2px;border:1px solid rgba(0,0,0,0.18);padding:4px;text-align:center;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:4px;cursor:pointer;background:rgba(0,0,0,0.18);color:rgba(0,0,0,0.75);margin:4px 0;',
          innerHTML: CHEVRON_SVG + ' LP Noise',
        }),
        Knob({ label: 'Delay', name: 'noiseDelay', value: p.noiseDelay, onChange, size: 26 }),
        Knob({ label: 'A', name: 'noiseA', value: p.noiseA, onChange, size: 26 }),
        Knob({ label: 'D', name: 'noiseD', value: p.noiseD, onChange, size: 26 }),
        Knob({ label: 'S', name: 'noiseS', value: p.noiseS, onChange, size: 26 }),
        createElement('div', { style: 'grid-column-start:4;' },
          Knob({ label: 'R', name: 'noiseR', value: p.noiseR, onChange, size: 26 })
        ),
      )
    ),
    createElement('div', {
      style: `border-radius:4px;border:1px solid #b88c29;display:flex;flex-direction:column;overflow:hidden;background-color:${COLORS.panelYellowMid};box-shadow:inset 0 1px 3px rgba(0,0,0,0.12);`,
    },
      createElement('div', {
        style: 'display:flex;align-items:center;justify-content:space-between;padding:6px 10px;border-bottom:1px solid rgba(0,0,0,0.12);background:rgba(0,0,0,0.08);',
      },
        createElement('div', { style: 'display:flex;align-items:center;gap:6px;' },
          createElement('div', { style: `width:8px;height:8px;border-radius:50%;border:1px solid rgba(0,0,0,0.4);transition:all 0.3s;background-color:${micStatusColor};box-shadow:${micIsActive ? `0 0 6px ${micStatusColor}` : 'none'};` }),
          createElement('span', { style: 'font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:rgba(0,0,0,0.6);' }, 'Ext · Input'),
          createElement('span', { style: `font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;padding:2px 4px;border-radius:2px;background-color:${micIsActive ? 'rgba(34,197,94,0.2)' : 'rgba(0,0,0,0.12)'};color:${micStatusColor};` }, micStatusLabel),
        ),
        createElement('button', {
          onclick: micIsActive ? onReleaseMic : onRequestMic,
          disabled: micIsBusy,
          style: `display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:3px;border:1px solid ${micIsActive ? '#991b1b' : '#3a3a3a'};font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;cursor:pointer;transition:all 0.2s;background-color:${micIsActive ? '#dc2626' : '#1a1b1c'};color:${micIsActive ? 'white' : COLORS.modYellow};box-shadow:${micIsActive ? '0 0 8px rgba(220,38,38,0.4)' : '0 1px 3px rgba(0,0,0,0.5)'};opacity:${micIsBusy ? 0.5 : 1};`,
          innerHTML: (micIsActive ? MIC_OFF_SVG : MIC_SVG) + ' ' + (micIsBusy ? 'Wait' : micIsActive ? 'Stop' : 'Enable'),
        })
      ),
      (micState === 'denied' || micState === 'error') ? createElement('div', {
        style: 'display:flex;align-items:center;gap:6px;padding:6px 10px;border-bottom:1px solid rgba(0,0,0,0.1);background:rgba(220,38,38,0.12);',
        innerHTML: ALERT_SVG + ` <span style="font-size:8.5px;font-weight:700;color:rgba(0,0,0,0.65);">${micState === 'denied' ? 'Microphone permission denied. Check browser settings.' : 'Could not access microphone.'}</span>`,
      }) : null,
      createElement('div', { style: 'display:flex;gap:8px;padding:10px;align-items:flex-start;' },
        createElement('div', { style: 'display:flex;flex-direction:column;align-items:center;gap:4px;padding-top:2px;' },
          VUMeter({ level: inputLevel, active: micIsActive }),
          createElement('span', { id: 'vu-label', style: 'font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;color:rgba(0,0,0,0.4);' }, micIsActive ? `${Math.round(inputLevel * 100)}%` : 'IN'),
        ),
        createElement('div', { style: 'width:1px;align-self:stretch;background:rgba(0,0,0,0.1);' }),
        createElement('div', { style: 'display:flex;flex-direction:column;gap:8px;flex:1;' },
          createElement('div', { style: 'display:flex;gap:12px;align-items:flex-end;' },
            Knob({ label: 'Gain', name: 'extGain', value: p.extGain ?? 0.6, onChange, size: 28 }),
            Knob({ label: 'Excite', name: 'extInputMix', value: p.extInputMix ?? 0, onChange, size: 28 }),
          ),
          createElement('div', { style: 'display:flex;gap:12px;align-items:flex-end;' },
            Knob({ label: 'Gate', name: 'extGate', value: p.extGate ?? 0.3, onChange, size: 24 }),
            Knob({ label: 'HPF', name: 'extHPF', value: p.extHPF ?? 0.1, onChange, size: 24 }),
          ),
          createElement('div', { style: 'display:flex;flex-direction:column;gap:2px;margin-top:4px;' },
            createElement('div', { style: 'display:flex;align-items:center;gap:4px;flex-wrap:wrap;' },
              createElement('div', { style: `padding:2px 6px;border-radius:2px;font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;border:1px solid ${micIsActive ? 'rgba(34,197,94,0.4)' : 'rgba(0,0,0,0.15)'};background:${micIsActive ? 'rgba(34,197,94,0.18)' : 'rgba(0,0,0,0.12)'};color:${micIsActive ? '#14532d' : 'rgba(0,0,0,0.4)'};display:flex;align-items:center;gap:2px;`, innerHTML: RADIO_SVG + ' Mic' }),
              createElement('span', { style: 'font-size:8px;color:rgba(0,0,0,0.3);' }, '→'),
              createElement('div', { style: `padding:2px 6px;border-radius:2px;font-size:7px;font-weight:900;text-transform:uppercase;border:1px solid ${micIsActive ? 'rgba(220,166,40,0.4)' : 'rgba(0,0,0,0.15)'};background:${micIsActive ? 'rgba(220,166,40,0.18)' : 'rgba(0,0,0,0.12)'};color:${micIsActive ? '#78350f' : 'rgba(0,0,0,0.4)'};` }, 'Env'),
              createElement('span', { style: 'font-size:8px;color:rgba(0,0,0,0.3);' }, '→'),
              createElement('div', { style: `padding:2px 6px;border-radius:2px;font-size:7px;font-weight:900;text-transform:uppercase;border:1px solid ${micIsActive ? 'rgba(34,197,94,0.4)' : 'rgba(0,0,0,0.15)'};background:${micIsActive ? 'rgba(34,197,94,0.18)' : 'rgba(0,0,0,0.12)'};color:${micIsActive ? '#14532d' : 'rgba(0,0,0,0.4)'};` }, 'Res.'),
            ),
            createElement('div', { style: 'font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;color:rgba(0,0,0,0.35);' }, 'No direct output · Exciter only'),
          ),
        )
      ),
      micIsActive ? createElement('div', {
        style: 'padding:6px 10px;border-top:1px solid rgba(0,0,0,0.1);display:flex;align-items:center;justify-content:space-between;',
      },
        createElement('div', { style: 'display:flex;gap:8px;' },
          ...[ { label: 'EC', value: 'OFF', ok: true }, { label: 'AGC', value: 'OFF', ok: true }, { label: 'NS', value: 'OFF', ok: true } ].map(({ label, value, ok }) =>
            createElement('div', { style: 'display:flex;align-items:center;gap:2px;' },
              createElement('span', { style: 'font-size:7px;font-weight:900;text-transform:uppercase;color:rgba(0,0,0,0.35);' }, label),
              createElement('span', { style: `font-size:7px;font-weight:900;text-transform:uppercase;padding:1px 4px;border-radius:2px;background:${ok ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'};color:${ok ? '#166534' : '#991b1b'};` }, value),
            )
          )
        ),
        createElement('span', { style: 'font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;color:rgba(0,0,0,0.3);' }, 'HPF ×2 · Pre+6dB'),
      ) : null,
    )
  );
}
