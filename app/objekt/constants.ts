export const COLORS = {
  chassis: '#e2e3dd',
  panelYellow: '#d5a126',
  panelYellowDark: '#bd8e20',
  panelYellowMid: '#cca13a',
  lcdBg: '#70805c',
  lcdBright: '#b1e457',
  lcdDark: '#364528',
  modDark: '#2c2e30',
  modText: '#c1c5c8',
  modYellow: '#dca628',
  knobDark: '#1a1b1c',
  knobOutline: '#3a3a3a',
} as const;

// Build partials helper: generates modalFreqN, modalN, obj1FreqN, obj1_N, obj2FreqN, obj2_N
function partials(
  modalFreqs: number[],
  modalGains: number[],
  obj1Freqs: number[],
  obj1Gains: number[],
  obj2Freqs: number[],
  obj2Gains: number[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (let i = 0; i < 8; i++) {
    out[`modal${i}`] = modalGains[i] ?? 0;
    out[`modalFreq${i}`] = modalFreqs[i] ?? 1;
    out[`obj1_${i}`] = obj1Gains[i] ?? 0;
    out[`obj1Freq${i}`] = obj1Freqs[i] ?? 1;
    out[`obj2_${i}`] = obj2Gains[i] ?? 0;
    out[`obj2Freq${i}`] = obj2Freqs[i] ?? 1;
  }
  return out;
}

// Default ext-in params included in every preset
const EXT_DEFAULTS = {
  extGain: 0.6,
  extInputMix: 0.0,
  extGate: 0.3,
  extHPF: 0.1,
};

// Default FX params
const FX_DEFAULTS = {
  compThresh: 0.45,
  compRatio: 0.25,
  compAttack: 0.15,
  compRelease: 0.5,
  dlyTime: 0.25,
  dlyFeedback: 0.3,
  dlyMix: 0.0,
  revSize: 0.5,
  revDecay: 0.5,
  revMix: 0.0,
  eqLow: 0.5,
  eqMid: 0.5,
  eqHigh: 0.5,
};

// ══════════════════════════════════════════════════════════════════════════════
// PRESETS
// Each preset defines:
// - Exciter settings (impact transient + noise texture)
// - Resonator partial ratios (based on real physical modal analysis)
// - Damping characteristics (frequency-dependent decay)
// - Mix levels and FX settings
//
// Partial ratios are derived from actual physical measurements where possible:
// - Strings: nearly harmonic (1, 2, 3, 4...)
// - Bars/marimba: f_n ∝ n² (1, 4, 9, 16... but tuned)
// - Circular plates: inharmonic Bessel zeros
// - Bells: f_n ∝ n² with specific ratios from campanology
// - Tubes: odd harmonics (1, 3, 5, 7...)
// ══════════════════════════════════════════════════════════════════════════════

export const PRESETS: Record<string, Record<string, number | string>> = {
  // ────────────────────────────────────────────────────────
  // 1. Glass Wave — resonant glass struck with soft mallet
  // Based on modal analysis of glass objects: highly inharmonic
  // Bessel function zeros give ratios like 1:2.295:3.598:4.903...
  // ────────────────────────────────────────────────────────
  'Glass Wave': {
    ...EXT_DEFAULTS, ...FX_DEFAULTS,
    impactLevel: 0.8, impactVel: 0.5, impactFreq: 0.5, impactClick: 0.4, impactShape: 0.1, impactHardness: 0.65, impactTime: 0.15,
    noiseLevel: 0.2, noiseVel: 0.4, noiseRate: 0.25, noiseDelay: 0, noiseA: 0.02, noiseD: 0.35, noiseS: 0.08, noiseR: 0.4,
    inputMix: 0.5, trigPos: 0.3, lowCut: 0.2, pitch: 0.5,
    collisionAmount: 0, collisionBounce: 0.5, pitchModAmount: 0, pitchModFilter: 0.5,
    dispersionFreq: 0.35, dispersionMod: 0, dispersionFilter: 0.5,
    dampingLow: 0.4, dampingMid: 0.45, dampingHi: 0.7, dampingGain: 0.5, dampingSlope: 0.5,
    decayTime: 0.78, decayRelMute: 0.12,
    mixExciter: 0.05, mixModal: 0.9, mixObj1: 0.35, mixObj2: 0.2,
    panExciter: 0.5, panModal: 0.4, panObj1: 0.3, panObj2: 0.7, widthObj: 0.75,
    distDrive: 0.2, distTone: 0.55, distAmount: 0.12,
    revMix: 0.22, dlyMix: 0.06,
    distType: 'Tube',
    // Glass partials — Bessel-derived inharmonicity
    ...partials(
      [1, 2.295, 3.598, 4.903, 6.208, 7.514, 8.821, 10.13],
      [1.0, 0.72, 0.48, 0.32, 0.2, 0.12, 0.07, 0.04],
      [1, 2.6, 4.8, 7.5, 10.8, 14.6, 19.0, 24.0],
      [0.65, 0.45, 0.3, 0.18, 0.1, 0.06, 0.035, 0.02],
      [1.5, 3.9, 7.2, 11.4, 16.5, 22.5, 29.4, 37.2],
      [0.5, 0.35, 0.22, 0.14, 0.08, 0.045, 0.025, 0.014],
    ),
  },

  // ────────────────────────────────────────────────────────
  // 2. Nylon Guitar — classical guitar with fingerstyle pluck
  // String partials are nearly harmonic with slight inharmonicity
  // from string stiffness (sharper higher partials)
  // ────────────────────────────────────────────────────────
  'Nylon Guitar': {
    ...EXT_DEFAULTS, ...FX_DEFAULTS,
    impactLevel: 0.92, impactVel: 0.75, impactFreq: 0.18, impactClick: 0.88, impactShape: 0.0, impactHardness: 0.48, impactTime: 0.025,
    noiseLevel: 0.04, noiseVel: 0.15, noiseRate: 0.05, noiseDelay: 0, noiseA: 0.003, noiseD: 0.08, noiseS: 0.0, noiseR: 0.06,
    inputMix: 0.2, trigPos: 0.8, lowCut: 0.35, pitch: 0.5,
    collisionAmount: 0, collisionBounce: 0.5, pitchModAmount: 0.02, pitchModFilter: 0.2,
    dispersionFreq: 0.01, dispersionMod: 0.02, dispersionFilter: 0.15,
    dampingLow: 0.1, dampingMid: 0.25, dampingHi: 0.85, dampingGain: 0.28, dampingSlope: 0.82,
    decayTime: 0.48, decayRelMute: 0.6,
    mixExciter: 0.12, mixModal: 0.55, mixObj1: 0.85, mixObj2: 0.15,
    panExciter: 0.5, panModal: 0.5, panObj1: 0.45, panObj2: 0.55, widthObj: 0.35,
    distDrive: 0.08, distTone: 0.35, distAmount: 0.04,
    distType: 'Tube',
    // String harmonics with slight stretch tuning
    ...partials(
      [1, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0],
      [1.0, 0.55, 0.32, 0.18, 0.1, 0.055, 0.03, 0.016],
      [1, 2, 3, 4, 5, 6, 7, 8],
      [1.0, 0.7, 0.45, 0.28, 0.16, 0.09, 0.05, 0.028],
      [1, 2, 3, 4, 5, 6, 7, 8],
      [0.4, 0.28, 0.18, 0.11, 0.065, 0.038, 0.022, 0.012],
    ),
  },

  // ────────────────────────────────────────────────────────
  // 3. Tibetan Bowl — singing bowl with rich inharmonic partials
  // Based on measured modes of brass singing bowls
  // ────────────────────────────────────────────────────────
  'Tibetan Bowl': {
    ...EXT_DEFAULTS, ...FX_DEFAULTS,
    impactLevel: 0.75, impactVel: 0.45, impactFreq: 0.25, impactClick: 0.2, impactShape: 0.15, impactHardness: 0.55, impactTime: 0.3,
    noiseLevel: 0.15, noiseVel: 0.35, noiseRate: 0.3, noiseDelay: 0.1, noiseA: 0.15, noiseD: 0.6, noiseS: 0.25, noiseR: 0.8,
    inputMix: 0.4, trigPos: 0.5, lowCut: 0.1, pitch: 0.4,
    collisionAmount: 0.1, collisionBounce: 0.75, pitchModAmount: 0.15, pitchModFilter: 0.55,
    dispersionFreq: 0.5, dispersionMod: 0.25, dispersionFilter: 0.6,
    dampingLow: 0.75, dampingMid: 0.55, dampingHi: 0.2, dampingGain: 0.72, dampingSlope: 0.3,
    decayTime: 0.95, decayRelMute: 0.05,
    mixExciter: 0.15, mixModal: 0.75, mixObj1: 0.68, mixObj2: 0.55,
    panExciter: 0.5, panModal: 0.5, panObj1: 0.15, panObj2: 0.85, widthObj: 0.92,
    distDrive: 0.35, distTone: 0.3, distAmount: 0.18,
    revMix: 0.4, dlyMix: 0.12,
    distType: 'Tube',
    // Singing bowl modes — characteristic beating partials
    ...partials(
      [1, 2.71, 5.15, 8.32, 12.2, 16.8, 22.1, 28.2],
      [1.0, 0.85, 0.62, 0.42, 0.28, 0.18, 0.11, 0.065],
      [1.02, 2.74, 5.2, 8.4, 12.35, 17.0, 22.4, 28.6],
      [0.9, 0.75, 0.55, 0.38, 0.25, 0.16, 0.095, 0.055],
      [0.98, 2.68, 5.1, 8.25, 12.05, 16.6, 21.8, 27.8],
      [0.7, 0.6, 0.44, 0.3, 0.2, 0.12, 0.072, 0.042],
    ),
  },

  // ────────────────────────────────────────────────────────
  // 4. Church Bell — large bronze bell with minor third partial
  // Proper bell partials: hum, prime, tierce, quint, nominal...
  // ────────────────────────────────────────────────────────
  'Church Bell': {
    ...EXT_DEFAULTS, ...FX_DEFAULTS,
    impactLevel: 0.95, impactVel: 0.6, impactFreq: 0.55, impactClick: 0.35, impactShape: 0.4, impactHardness: 0.82, impactTime: 0.06,
    noiseLevel: 0.08, noiseVel: 0.25, noiseRate: 0.22, noiseDelay: 0, noiseA: 0.008, noiseD: 0.2, noiseS: 0.0, noiseR: 0.15,
    inputMix: 0.3, trigPos: 0.5, lowCut: 0.25, pitch: 0.5,
    collisionAmount: 0.25, collisionBounce: 0.35, pitchModAmount: 0.03, pitchModFilter: 0.45,
    dispersionFreq: 0.55, dispersionMod: 0.15, dispersionFilter: 0.5,
    dampingLow: 0.35, dampingMid: 0.32, dampingHi: 0.45, dampingGain: 0.55, dampingSlope: 0.48,
    decayTime: 0.92, decayRelMute: 0.03,
    mixExciter: 0.06, mixModal: 0.82, mixObj1: 0.55, mixObj2: 0.4,
    panExciter: 0.5, panModal: 0.5, panObj1: 0.25, panObj2: 0.75, widthObj: 0.88,
    distDrive: 0.22, distTone: 0.5, distAmount: 0.14,
    revMix: 0.25, dlyMix: 0.04,
    distType: 'Sine',
    // Bell partials: hum(0.5), prime(1), tierce(1.2), quint(1.5), nominal(2)...
    ...partials(
      [0.5, 1, 1.183, 1.506, 2, 2.514, 3.011, 4.166],
      [0.65, 1.0, 0.55, 0.42, 0.85, 0.32, 0.22, 0.35],
      [0.5, 1, 1.2, 1.5, 2, 2.5, 3, 4],
      [0.55, 0.85, 0.45, 0.35, 0.7, 0.28, 0.18, 0.28],
      [0.52, 1.02, 1.22, 1.55, 2.06, 2.58, 3.1, 4.3],
      [0.4, 0.65, 0.35, 0.28, 0.55, 0.22, 0.14, 0.22],
    ),
  },

  // ────────────────────────────────────────────────────────
  // 5. Wood Block — percussive struck wood
  // Wood bars have partials following f_n ∝ (2n+1)² pattern
  // ────────────────────────────────────────────────────────
  'Wood Block': {
    ...EXT_DEFAULTS, ...FX_DEFAULTS,
    impactLevel: 1.0, impactVel: 0.88, impactFreq: 0.45, impactClick: 0.95, impactShape: 0.05, impactHardness: 0.52, impactTime: 0.015,
    noiseLevel: 0.06, noiseVel: 0.22, noiseRate: 0.04, noiseDelay: 0, noiseA: 0.001, noiseD: 0.04, noiseS: 0.0, noiseR: 0.03,
    inputMix: 0.1, trigPos: 0.88, lowCut: 0.45, pitch: 0.5,
    collisionAmount: 0, collisionBounce: 0.2, pitchModAmount: 0, pitchModFilter: 0.5,
    dispersionFreq: 0.08, dispersionMod: 0, dispersionFilter: 0.12,
    dampingLow: 0.08, dampingMid: 0.18, dampingHi: 0.95, dampingGain: 0.18, dampingSlope: 0.92,
    decayTime: 0.12, decayRelMute: 0.88,
    mixExciter: 0.2, mixModal: 0.92, mixObj1: 0.12, mixObj2: 0.06,
    panExciter: 0.5, panModal: 0.5, panObj1: 0.4, panObj2: 0.6, widthObj: 0.22,
    distDrive: 0.08, distTone: 0.48, distAmount: 0.04,
    distType: 'Tube',
    // Wood bar: (2n+1)² proportional ratios, highly damped highs
    ...partials(
      [1, 2.76, 5.4, 8.93, 13.34, 18.64, 24.82, 31.89],
      [1.0, 0.4, 0.15, 0.06, 0.025, 0.01, 0.004, 0.002],
      [1, 2.8, 5.5, 9.1, 13.6, 19.0, 25.3, 32.5],
      [0.3, 0.12, 0.045, 0.018, 0.007, 0.003, 0.001, 0.0005],
      [1, 2.7, 5.3, 8.8, 13.1, 18.3, 24.4, 31.4],
      [0.15, 0.06, 0.022, 0.009, 0.0035, 0.0014, 0.0006, 0.00025],
    ),
  },

  // ────────────────────────────────────────────────────────
  // 6. Marimba — rosewood bars over resonator tubes
  // Tuned bars with fundamental + octave emphasized
  // ────────────────────────────────────────────────────────
  'Marimba': {
    ...EXT_DEFAULTS, ...FX_DEFAULTS,
    impactLevel: 0.9, impactVel: 0.62, impactFreq: 0.22, impactClick: 0.65, impactShape: 0.0, impactHardness: 0.45, impactTime: 0.04,
    noiseLevel: 0.025, noiseVel: 0.15, noiseRate: 0.04, noiseDelay: 0, noiseA: 0.002, noiseD: 0.05, noiseS: 0.0, noiseR: 0.04,
    inputMix: 0.25, trigPos: 0.72, lowCut: 0.28, pitch: 0.5,
    collisionAmount: 0, collisionBounce: 0.35, pitchModAmount: 0.01, pitchModFilter: 0.25,
    dispersionFreq: 0.02, dispersionMod: 0.02, dispersionFilter: 0.18,
    dampingLow: 0.08, dampingMid: 0.22, dampingHi: 0.82, dampingGain: 0.3, dampingSlope: 0.78,
    decayTime: 0.42, decayRelMute: 0.52,
    mixExciter: 0.08, mixModal: 0.95, mixObj1: 0.18, mixObj2: 0.08,
    panExciter: 0.5, panModal: 0.5, panObj1: 0.38, panObj2: 0.62, widthObj: 0.32,
    distDrive: 0.06, distTone: 0.42, distAmount: 0.03,
    revMix: 0.12,
    distType: 'Tube',
    // Marimba: tuned 1:4 ratio (fundamental + 2 octaves up)
    ...partials(
      [1, 4, 9.93, 17.75, 28, 40.5, 55, 72],
      [1.0, 0.65, 0.15, 0.045, 0.012, 0.003, 0.001, 0.0003],
      [1, 4, 10, 18, 28.5, 41, 56, 73],
      [0.45, 0.28, 0.065, 0.02, 0.005, 0.0013, 0.0004, 0.0001],
      [1, 4, 10, 18, 28, 40, 54, 70],
      [0.22, 0.14, 0.032, 0.01, 0.0025, 0.0007, 0.0002, 0.00005],
    ),
  },

  // ────────────────────────────────────────────────────────
  // 7. Steel Pan — Caribbean steel drum with warm overtones
  // Tuned dished metal with characteristic harmonic structure
  // ────────────────────────────────────────────────────────
  'Steel Pan': {
    ...EXT_DEFAULTS, ...FX_DEFAULTS,
    impactLevel: 0.88, impactVel: 0.68, impactFreq: 0.4, impactClick: 0.55, impactShape: 0.25, impactHardness: 0.72, impactTime: 0.05,
    noiseLevel: 0.08, noiseVel: 0.28, noiseRate: 0.15, noiseDelay: 0, noiseA: 0.006, noiseD: 0.15, noiseS: 0.02, noiseR: 0.12,
    inputMix: 0.35, trigPos: 0.58, lowCut: 0.22, pitch: 0.5,
    collisionAmount: 0.1, collisionBounce: 0.42, pitchModAmount: 0.04, pitchModFilter: 0.4,
    dispersionFreq: 0.18, dispersionMod: 0.08, dispersionFilter: 0.35,
    dampingLow: 0.18, dampingMid: 0.35, dampingHi: 0.58, dampingGain: 0.45, dampingSlope: 0.55,
    decayTime: 0.58, decayRelMute: 0.28,
    mixExciter: 0.12, mixModal: 0.78, mixObj1: 0.52, mixObj2: 0.35,
    panExciter: 0.5, panModal: 0.5, panObj1: 0.28, panObj2: 0.72, widthObj: 0.68,
    distDrive: 0.28, distTone: 0.52, distAmount: 0.18,
    revMix: 0.18, dlyMix: 0.06,
    distType: 'Tube',
    // Steel pan: nearly harmonic with slight stretch
    ...partials(
      [1, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0],
      [1.0, 0.75, 0.52, 0.35, 0.22, 0.14, 0.085, 0.05],
      [1, 2, 3, 4, 5, 6, 7, 8],
      [0.8, 0.58, 0.4, 0.26, 0.16, 0.1, 0.06, 0.035],
      [1, 2, 3, 4, 5, 6, 7, 8],
      [0.55, 0.4, 0.28, 0.18, 0.11, 0.07, 0.042, 0.025],
    ),
  },

  // ────────────────────────────────────────────────────────
  // 8. Ethereal Pad — slow evolving drone texture
  // Uses detuned partials for rich beating/chorus effect
  // ────────────────────────────────────────────────────────
  'Ethereal Pad': {
    ...EXT_DEFAULTS, ...FX_DEFAULTS,
    impactLevel: 0.25, impactVel: 0.25, impactFreq: 0.15, impactClick: 0.1, impactShape: 0.2, impactHardness: 0.25, impactTime: 0.45,
    noiseLevel: 0.7, noiseVel: 0.55, noiseRate: 0.55, noiseDelay: 0.15, noiseA: 0.65, noiseD: 0.85, noiseS: 0.72, noiseR: 0.9,
    inputMix: 0.55, trigPos: 0.4, lowCut: 0.08, pitch: 0.5,
    collisionAmount: 0.04, collisionBounce: 0.88, pitchModAmount: 0.35, pitchModFilter: 0.65,
    dispersionFreq: 0.55, dispersionMod: 0.45, dispersionFilter: 0.75,
    dampingLow: 0.88, dampingMid: 0.68, dampingHi: 0.08, dampingGain: 0.85, dampingSlope: 0.12,
    decayTime: 0.98, decayRelMute: 0.02,
    mixExciter: 0.28, mixModal: 0.55, mixObj1: 0.72, mixObj2: 0.68,
    panExciter: 0.5, panModal: 0.5, panObj1: 0.08, panObj2: 0.92, widthObj: 1.0,
    distDrive: 0.35, distTone: 0.32, distAmount: 0.22,
    revMix: 0.58, dlyMix: 0.25, dlyTime: 0.52, dlyFeedback: 0.58,
    distType: 'Tube',
    // Detuned partials for beating/movement
    ...partials(
      [1, 1.002, 2.0, 2.003, 3.0, 4.0, 5.0, 6.0],
      [1.0, 0.95, 0.72, 0.68, 0.48, 0.32, 0.2, 0.12],
      [0.5, 0.502, 1.0, 1.003, 1.5, 2.0, 2.5, 3.0],
      [0.88, 0.85, 0.65, 0.62, 0.45, 0.3, 0.18, 0.11],
      [0.25, 0.252, 0.5, 0.502, 0.75, 1.0, 1.25, 1.5],
      [0.72, 0.7, 0.52, 0.5, 0.35, 0.22, 0.14, 0.085],
    ),
  },

  // ────────────────────────────────────────────────────────
  // 9. Cello — bowed string with rich body resonance
  // Harmonic string partials with body formants
  // ────────────────────────────────────────────────────────
  'Cello': {
    ...EXT_DEFAULTS, ...FX_DEFAULTS,
    impactLevel: 0.18, impactVel: 0.15, impactFreq: 0.08, impactClick: 0.08, impactShape: 0.0, impactHardness: 0.18, impactTime: 0.08,
    noiseLevel: 0.82, noiseVel: 0.65, noiseRate: 0.68, noiseDelay: 0.03, noiseA: 0.35, noiseD: 0.45, noiseS: 0.88, noiseR: 0.65,
    inputMix: 0.48, trigPos: 0.58, lowCut: 0.12, pitch: 0.5,
    collisionAmount: 0, collisionBounce: 0.55, pitchModAmount: 0.2, pitchModFilter: 0.5,
    dispersionFreq: 0.03, dispersionMod: 0.1, dispersionFilter: 0.35,
    dampingLow: 0.55, dampingMid: 0.48, dampingHi: 0.32, dampingGain: 0.6, dampingSlope: 0.42,
    decayTime: 0.82, decayRelMute: 0.22,
    mixExciter: 0.38, mixModal: 0.72, mixObj1: 0.55, mixObj2: 0.28,
    panExciter: 0.5, panModal: 0.5, panObj1: 0.42, panObj2: 0.58, widthObj: 0.55,
    distDrive: 0.2, distTone: 0.32, distAmount: 0.12,
    revMix: 0.28, dlyMix: 0.05,
    distType: 'Tube',
    // String harmonics with body resonance emphasis
    ...partials(
      [1, 2, 3, 4, 5, 6, 7, 8],
      [1.0, 0.58, 0.42, 0.28, 0.18, 0.11, 0.065, 0.038],
      [1, 2, 3, 4, 5, 6, 7, 8],
      [0.75, 0.48, 0.32, 0.2, 0.12, 0.075, 0.045, 0.026],
      [1, 2, 3, 4, 5, 6, 7, 8],
      [0.52, 0.35, 0.22, 0.14, 0.085, 0.052, 0.031, 0.018],
    ),
  },

  // ────────────────────────────────────────────────────────
  // 10. Kalimba — African thumb piano (metal tines)
  // Bright plucked metal with slight inharmonicity
  // ────────────────────────────────────────────────────────
  'Kalimba': {
    ...EXT_DEFAULTS, ...FX_DEFAULTS,
    impactLevel: 0.92, impactVel: 0.72, impactFreq: 0.55, impactClick: 0.78, impactShape: 0.12, impactHardness: 0.62, impactTime: 0.02,
    noiseLevel: 0.035, noiseVel: 0.18, noiseRate: 0.08, noiseDelay: 0, noiseA: 0.002, noiseD: 0.06, noiseS: 0.0, noiseR: 0.04,
    inputMix: 0.2, trigPos: 0.78, lowCut: 0.35, pitch: 0.5,
    collisionAmount: 0.02, collisionBounce: 0.4, pitchModAmount: 0.015, pitchModFilter: 0.3,
    dispersionFreq: 0.15, dispersionMod: 0.06, dispersionFilter: 0.28,
    dampingLow: 0.12, dampingMid: 0.28, dampingHi: 0.68, dampingGain: 0.35, dampingSlope: 0.72,
    decayTime: 0.65, decayRelMute: 0.38,
    mixExciter: 0.08, mixModal: 0.88, mixObj1: 0.32, mixObj2: 0.15,
    panExciter: 0.5, panModal: 0.5, panObj1: 0.35, panObj2: 0.65, widthObj: 0.48,
    distDrive: 0.12, distTone: 0.58, distAmount: 0.06,
    revMix: 0.15, dlyMix: 0.04,
    distType: 'Tube',
    // Metal tine: slight inharmonicity from stiffness
    ...partials(
      [1, 2.756, 5.404, 8.933, 13.34, 18.64, 24.8, 31.9],
      [1.0, 0.35, 0.12, 0.04, 0.014, 0.005, 0.0018, 0.0006],
      [1, 2.8, 5.5, 9.1, 13.6, 19.0, 25.3, 32.5],
      [0.55, 0.2, 0.068, 0.023, 0.008, 0.0028, 0.001, 0.00035],
      [1, 2.7, 5.3, 8.8, 13.2, 18.4, 24.5, 31.5],
      [0.32, 0.12, 0.04, 0.014, 0.005, 0.0017, 0.0006, 0.0002],
    ),
  },

  // ────────────────────────────────────────────────────────
  // 11. Pipe Organ — closed cylindrical pipe (odd harmonics)
  // Air column resonance in closed tube
  // ────────────────────────────────────────────────────────
  'Pipe Organ': {
    ...EXT_DEFAULTS, ...FX_DEFAULTS,
    impactLevel: 0.55, impactVel: 0.4, impactFreq: 0.15, impactClick: 0.28, impactShape: 0.18, impactHardness: 0.35, impactTime: 0.32,
    noiseLevel: 0.48, noiseVel: 0.48, noiseRate: 0.42, noiseDelay: 0.06, noiseA: 0.25, noiseD: 0.55, noiseS: 0.45, noiseR: 0.48,
    inputMix: 0.42, trigPos: 0.45, lowCut: 0.1, pitch: 0.42,
    collisionAmount: 0.06, collisionBounce: 0.68, pitchModAmount: 0.1, pitchModFilter: 0.48,
    dispersionFreq: 0.02, dispersionMod: 0.15, dispersionFilter: 0.5,
    dampingLow: 0.65, dampingMid: 0.48, dampingHi: 0.22, dampingGain: 0.65, dampingSlope: 0.35,
    decayTime: 0.88, decayRelMute: 0.08,
    mixExciter: 0.18, mixModal: 0.65, mixObj1: 0.68, mixObj2: 0.55,
    panExciter: 0.5, panModal: 0.5, panObj1: 0.15, panObj2: 0.85, widthObj: 0.85,
    distDrive: 0.45, distTone: 0.38, distAmount: 0.32,
    revMix: 0.35, dlyMix: 0.12, dlyTime: 0.35, dlyFeedback: 0.42,
    distType: 'Tube',
    // Closed pipe: odd harmonics only (1, 3, 5, 7...)
    ...partials(
      [1, 3, 5, 7, 9, 11, 13, 15],
      [1.0, 0.72, 0.48, 0.32, 0.2, 0.125, 0.078, 0.048],
      [1, 3, 5, 7, 9, 11, 13, 15],
      [0.85, 0.6, 0.4, 0.26, 0.165, 0.1, 0.062, 0.038],
      [1, 3, 5, 7, 9, 11, 13, 15],
      [0.68, 0.48, 0.32, 0.21, 0.13, 0.08, 0.05, 0.031],
    ),
  },

  // ────────────────────────────────────────────────────────
  // 12. Kick Drum — punchy electronic kick with sub weight
  // Membrane modes with pitch drop transient
  // ────────────────────────────────────────────────────────
  'Kick Drum': {
    ...EXT_DEFAULTS, ...FX_DEFAULTS,
    impactLevel: 1.0, impactVel: 0.95, impactFreq: 0.02, impactClick: 0.88, impactShape: 0.55, impactHardness: 0.92, impactTime: 0.08,
    noiseLevel: 0.32, noiseVel: 0.55, noiseRate: 0.06, noiseDelay: 0.005, noiseA: 0.002, noiseD: 0.18, noiseS: 0.06, noiseR: 0.22,
    inputMix: 0.28, trigPos: 0.92, lowCut: 0.02, pitch: 0.32,
    collisionAmount: 0.42, collisionBounce: 0.12, pitchModAmount: 0.32, pitchModFilter: 0.28,
    dispersionFreq: 0.38, dispersionMod: 0.25, dispersionFilter: 0.4,
    dampingLow: 0.32, dampingMid: 0.42, dampingHi: 0.78, dampingGain: 0.52, dampingSlope: 0.68,
    decayTime: 0.35, decayRelMute: 0.42,
    mixExciter: 0.45, mixModal: 0.52, mixObj1: 0.78, mixObj2: 0.58,
    panExciter: 0.5, panModal: 0.5, panObj1: 0.22, panObj2: 0.78, widthObj: 0.72,
    distDrive: 0.58, distTone: 0.48, distAmount: 0.52,
    revMix: 0.06, dlyMix: 0.02,
    distType: 'Tube',
    // Drum membrane modes (Bessel zeros)
    ...partials(
      [1, 1.593, 2.136, 2.653, 2.917, 3.5, 3.6, 4.06],
      [1.0, 0.65, 0.42, 0.28, 0.18, 0.11, 0.068, 0.042],
      [1, 1.6, 2.14, 2.66, 2.92, 3.52, 3.62, 4.08],
      [0.85, 0.55, 0.35, 0.23, 0.15, 0.092, 0.057, 0.035],
      [1, 1.59, 2.13, 2.65, 2.91, 3.49, 3.59, 4.05],
      [0.68, 0.44, 0.28, 0.18, 0.12, 0.074, 0.045, 0.028],
    ),
  },
};

export const DEFAULT_PARAMS: Record<string, number | string> = {
  // Master
  masterVolume: 0.8,
  pitch: 0.5,
  distType: 'Tube',
  // New Objekt features
  voiceMode: 'Poly 8',
  diffuse: 0, // 0 = off, 1 = on (smears impact into scratchy texture)
  pickupMode: 0, // 0 = off, 1 = on (electromagnetic pickup emulation for Modal)
  couplingMode: 'Off', // resonator coupling
  routingMode: 'Parallel', // exciter → resonator routing
  activePartials: 8, // how many of the 8 partials are active (1-8)
  keyTrack: 8, // how many partials track the keyboard (0-8)
  ...PRESETS['Glass Wave'],
};

export const PITCHES = [
  { note: 'C3', freq: 130.81, type: 'white' as const },
  { note: 'C#3', freq: 138.59, type: 'black' as const, offset: 1 },
  { note: 'D3', freq: 146.83, type: 'white' as const },
  { note: 'D#3', freq: 155.56, type: 'black' as const, offset: 2 },
  { note: 'E3', freq: 164.81, type: 'white' as const },
  { note: 'F3', freq: 174.61, type: 'white' as const },
  { note: 'F#3', freq: 185.00, type: 'black' as const, offset: 4 },
  { note: 'G3', freq: 196.00, type: 'white' as const },
  { note: 'G#3', freq: 207.65, type: 'black' as const, offset: 5 },
  { note: 'A3', freq: 220.00, type: 'white' as const },
  { note: 'A#3', freq: 233.08, type: 'black' as const, offset: 6 },
  { note: 'B3', freq: 246.94, type: 'white' as const },
  { note: 'C4', freq: 261.63, type: 'white' as const },
  { note: 'C#4', freq: 277.18, type: 'black' as const, offset: 8 },
  { note: 'D4', freq: 293.66, type: 'white' as const },
  { note: 'D#4', freq: 311.13, type: 'black' as const, offset: 9 },
  { note: 'E4', freq: 329.63, type: 'white' as const },
  { note: 'F4', freq: 349.23, type: 'white' as const },
  { note: 'F#4', freq: 369.99, type: 'black' as const, offset: 11 },
  { note: 'G4', freq: 392.00, type: 'white' as const },
  { note: 'G#4', freq: 415.30, type: 'black' as const, offset: 12 },
  { note: 'A4', freq: 440.00, type: 'white' as const },
  { note: 'A#4', freq: 466.16, type: 'black' as const, offset: 13 },
  { note: 'B4', freq: 493.88, type: 'white' as const },
  { note: 'C5', freq: 523.25, type: 'white' as const },
];

export const MOD_MATRIX_ROWS = [
  { s: 'Velocity', a1: 56, d1: 'M:Level', a2: -100, d2: '1:Decay', sc: '' },
  { s: 'LFO 2', a1: 66, d1: 'Noise Level', a2: 0, d2: '', sc: 'Envelope' },
  { s: 'Envelope', a1: 67, d1: 'LFO 2 Rate', a2: 0, d2: '', sc: '' },
  { s: 'Envelope', a1: 89, d1: '1:Pan', a2: -72, d2: 'Noise Rate', sc: '' },
  { s: 'LFO 1', a1: 5, d1: '2:Pitch', a2: 0, d2: '', sc: 'Curve' },
  { s: 'Mod Wheel', a1: 33, d1: 'Dist Amt', a2: 0, d2: '', sc: '' },
];

export const FX_TABS = ['DIST', 'COMP', 'DLY', 'REV', 'EQ'] as const;
export type FXTab = typeof FX_TABS[number];

export const CENTER_TABS = ['modal', 'obj1', 'obj2'] as const;
export type CenterTab = typeof CENTER_TABS[number];

// Voice modes as in real Objekt
export const VOICE_MODES = ['Poly 8', 'Poly 4', 'Mono', 'Legato', 'Auto Leg'] as const;
export type VoiceMode = typeof VOICE_MODES[number];

// Coupling modes for Object resonators
export const COUPLING_MODES = ['Off', 'On', 'X-Over'] as const;
export type CouplingMode = typeof COUPLING_MODES[number];

// Resonator routing modes
export const ROUTING_MODES = ['Parallel', 'Serial M→1→2', 'Serial M→2→1'] as const;
export type RoutingMode = typeof ROUTING_MODES[number];
