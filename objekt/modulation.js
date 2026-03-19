const SOURCES = {
  'Velocity': (c) => c.velocity,
  'LFO 1': (c) => c.lfo1,
  'LFO 2': (c) => c.lfo2,
  'Envelope': (c) => c.envelope,
  'Mod Wheel': (c) => c.modWheel,
  'Curve': (c) => c.curve,
  'Aftertouch': (c) => c.aftertouch ?? 0,
  'Random': (c) => c.random ?? Math.random(),
};

const DEST_MAP = {
  'M:Level': 'mixModal',
  'M:Pitch': '_modalPitch',
  'M:Pan': 'panModal',
  '1:Level': 'mixObj1',
  '1:Pitch': '_obj1Pitch',
  '1:Pan': 'panObj1',
  '1:Decay': '_obj1Decay',
  '2:Level': 'mixObj2',
  '2:Pitch': '_obj2Pitch',
  '2:Pan': 'panObj2',
  '2:Decay': '_obj2Decay',
  'Noise Level': 'noiseLevel',
  'Noise Rate': 'noiseRate',
  'Imp Level': 'impactLevel',
  'Imp Freq': 'impactFreq',
  'Disp Freq': 'dispersionFreq',
  'Decay Time': 'decayTime',
  'Dist Amt': 'distAmount',
  'Dist Drive': 'distDrive',
  'Dly Mix': 'dlyMix',
  'Dly Time': 'dlyTime',
  'Rev Mix': 'revMix',
  'Low Cut': 'lowCut',
  'LFO 1 Rate': '_lfo1Rate',
  'LFO 2 Rate': '_lfo2Rate',
  'Master Vol': 'masterVolume',
  'Pitch': 'pitch',
  'Width': 'widthObj',
};

export const MOD_SOURCE_NAMES = Object.keys(SOURCES);
export const MOD_DEST_NAMES = Object.keys(DEST_MAP);

export function processModMatrix(rows, sourceCtx) {
  const offsets = {};
  for (const row of rows) {
    const srcFn = SOURCES[row.s];
    if (!srcFn) continue;
    const srcVal = srcFn(sourceCtx);
    const scaleFn = row.sc ? SOURCES[row.sc] : null;
    const scaleVal = scaleFn ? scaleFn(sourceCtx) : 1;
    if (row.d1 && row.a1 !== 0) {
      const param = DEST_MAP[row.d1];
      if (param) offsets[param] = (offsets[param] || 0) + (row.a1 / 100) * srcVal * scaleVal;
    }
    if (row.d2 && row.a2 !== 0) {
      const param = DEST_MAP[row.d2];
      if (param) offsets[param] = (offsets[param] || 0) + (row.a2 / 100) * srcVal;
    }
  }
  return offsets;
}

export function applyModOffsets(baseParams, offsets) {
  const out = { ...baseParams };
  for (const [key, offset] of Object.entries(offsets)) {
    if (key.startsWith('_')) continue;
    if (typeof out[key] === 'number') {
      out[key] = Math.max(0, Math.min(1, out[key] + offset));
    }
  }
  return out;
}
