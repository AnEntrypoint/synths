import { createElement } from 'webjsx';
import { COLORS } from './constants.js';

const dragState = new WeakMap();

export function Knob({ label, value, min = 0, max = 1, step = 0.01, onChange, name = '', size = 32, color = 'white', labelPosition = 'bottom', bipolar = false }) {
  const percent = (value - min) / (max - min);
  const angle = -135 + percent * 270;

  function onPointerDown(e) {
    dragState.set(e.currentTarget, { startY: e.clientY, startVal: value });
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  function onPointerMove(e) {
    const state = dragState.get(e.currentTarget);
    if (!state) return;
    const deltaY = state.startY - e.clientY;
    const range = max - min;
    const newVal = Math.max(min, Math.min(max, state.startVal + deltaY * 0.005 * range));
    if (onChange) onChange({ target: { name, value: step ? Math.round(newVal / step) * step : newVal } });
  }

  function onPointerUp(e) {
    dragState.delete(e.currentTarget);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function onDblClick() {
    if (onChange) onChange({ target: { name, value: bipolar ? (min + max) / 2 : (max - min) * 0.5 + min } });
  }

  const r = size / 2 - 2;
  const circ = 2 * Math.PI * r;

  const knob = createElement('div', {
    class: 'knob-body',
    role: 'slider',
    tabindex: 0,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuenow': Math.round(value * 100) / 100,
    'aria-label': label,
    style: `position:relative;border-radius:50%;cursor:ns-resize;touch-action:none;box-shadow:0 2px 4px rgba(0,0,0,0.4),inset 0 1px 2px rgba(255,255,255,0.1);flex-shrink:0;user-select:none;width:${size}px;height:${size}px;background-color:${COLORS.knobDark};border:1px solid ${COLORS.knobOutline};`,
    onpointerdown: onPointerDown,
    onpointermove: onPointerMove,
    onpointerup: onPointerUp,
    ondblclick: onDblClick,
  },
    createElement('svg', {
      style: `position:absolute;inset:0;pointer-events:none;width:${size}px;height:${size}px;`,
      viewBox: `0 0 ${size} ${size}`,
    },
      createElement('circle', {
        cx: size / 2, cy: size / 2, r,
        fill: 'none',
        stroke: 'rgba(255,255,255,0.04)',
        'stroke-width': 1.5,
        'stroke-dasharray': `${2.4 * r} ${circ}`,
        'stroke-dashoffset': -0.5 * r,
        'stroke-linecap': 'round',
        transform: `rotate(-45 ${size / 2} ${size / 2})`,
      })
    ),
    createElement('div', {
      style: `position:absolute;top:0;left:50%;width:2px;height:46%;transform:translateX(-50%) rotate(${angle}deg);transform-origin:50% 100%;background-color:${color};margin-top:1px;border-radius:9999px;pointer-events:none;`,
    }),
    createElement('div', {
      style: `position:absolute;top:18%;left:18%;width:64%;height:64%;border-radius:50%;background:radial-gradient(circle at 35% 35%, #3a3a3a, #0f0f0f);box-shadow:inset 0 1px 3px rgba(0,0,0,0.8);pointer-events:none;`,
    })
  );

  const children = [knob];
  if (label) {
    children.push(createElement('span', {
      style: `font-size:8.5px;font-weight:700;letter-spacing:-0.025em;line-height:1;text-align:center;white-space:nowrap;user-select:none;color:${labelPosition === 'top' ? '#999' : '#555'};`,
    }, label));
  }

  return createElement('div', {
    style: `display:flex;align-items:center;justify-content:center;gap:2px;min-width:${size}px;flex-shrink:0;flex-direction:${labelPosition === 'top' ? 'column-reverse' : 'column'};`,
  }, ...children);
}
