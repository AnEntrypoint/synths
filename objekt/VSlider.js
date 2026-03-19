import { createElement } from 'webjsx';
import { COLORS } from './constants.js';

export function VSlider({ value, min = 0, max = 1, step = 0.01, onChange, name, height = 70, type = 'lcd' }) {
  const percent = (value - min) / (max - min);
  const h = typeof height === 'number' ? `${height}px` : height;
  const hNum = typeof height === 'number' ? height : 70;

  const trackStyle = type === 'lcd'
    ? `position:absolute;bottom:0;width:10px;height:100%;border-radius:9999px;border:1px solid #364528;box-shadow:inset 0 0 4px rgba(0,0,0,0.4);pointer-events:none;background-color:${COLORS.lcdDark}80;`
    : `position:absolute;bottom:0;width:10px;height:100%;border-radius:9999px;border:1px solid rgba(0,0,0,0.2);box-shadow:inset 0 0 4px rgba(0,0,0,0.4);pointer-events:none;background:rgba(0,0,0,0.1);`;

  const thumbStyle = type === 'lcd'
    ? `position:absolute;width:14px;height:10px;border-radius:2px;box-shadow:0 2px 3px rgba(0,0,0,0.5);border:1px solid ${COLORS.lcdBright};pointer-events:none;z-index:10;margin-left:-0.5px;bottom:calc(${percent * 100}% - 5px);background-color:${COLORS.lcdBright};`
    : `position:absolute;width:14px;height:10px;border-radius:2px;box-shadow:0 2px 3px rgba(0,0,0,0.5);border:1px solid #444;pointer-events:none;z-index:10;margin-left:-0.5px;bottom:calc(${percent * 100}% - 5px);background-color:#777;`;

  return createElement('div', {
    style: `position:relative;display:flex;justify-content:center;width:16px;flex-shrink:0;height:${h};`,
  },
    createElement('input', {
      type: 'range',
      min, max, step,
      name,
      value,
      oninput: onChange,
      style: `position:absolute;opacity:0;cursor:ns-resize;z-index:20;width:${hNum}px;height:100%;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-90deg);`,
      'aria-label': name,
    }),
    createElement('div', { style: trackStyle },
      type === 'lcd' ? createElement('div', {
        style: `position:absolute;bottom:0;width:100%;border-radius:9999px;height:${percent * 100}%;background-color:${COLORS.lcdBright}80;`,
      }) : null
    ),
    createElement('div', { style: thumbStyle },
      createElement('div', { style: 'width:100%;height:1px;background:rgba(255,255,255,0.3);position:absolute;top:50%;transform:translateY(-50%);' })
    )
  );
}
