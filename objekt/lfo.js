export function createLFO() {
  let phase = 0;
  let rate = 2;
  let depth = 0.5;
  let waveform = 'sine';
  let bipolar = false;
  let oneshot = false;
  let keySync = true;
  let stepped = false;
  let globalMode = false;
  let lastSH = 0;
  let prevIntPhase = 0;

  function tick(dt) {
    phase += rate * dt;
    if (oneshot && phase >= 1) phase = 1;
    else if (!oneshot) phase %= 100000;
    return getValue();
  }

  function getValue() {
    const p = (phase % 1 + 1) % 1;
    let v;
    switch (waveform) {
      case 'sine': v = Math.sin(p * 2 * Math.PI); break;
      case 'square': v = p < 0.5 ? 1 : -1; break;
      case 'saw': v = 2 * p - 1; break;
      case 'triangle': v = p < 0.5 ? 4 * p - 1 : 3 - 4 * p; break;
      case 'sh': {
        const intPhase = Math.floor(phase);
        if (intPhase !== prevIntPhase) { lastSH = Math.random() * 2 - 1; prevIntPhase = intPhase; }
        v = lastSH; break;
      }
      default: v = Math.sin(p * 2 * Math.PI);
    }
    if (stepped) v = Math.round(v * 4) / 4;
    return bipolar ? v * depth : ((v + 1) / 2) * depth;
  }

  function reset() { phase = 0; prevIntPhase = 0; }

  function configure(p) {
    if (p.rate !== undefined) rate = p.rate;
    if (p.depth !== undefined) depth = p.depth;
    if (p.waveform !== undefined) waveform = p.waveform;
    if (p.bipolar !== undefined) bipolar = p.bipolar;
    if (p.oneshot !== undefined) oneshot = p.oneshot;
    if (p.keySync !== undefined) keySync = p.keySync;
    if (p.stepped !== undefined) stepped = p.stepped;
    if (p.global !== undefined) globalMode = p.global;
  }

  return {
    tick, getValue, reset, configure,
    get phase() { return phase; },
    get keySync() { return keySync; },
    get globalMode() { return globalMode; },
    get rate() { return rate; },
    get depth() { return depth; },
  };
}

export function createEnvelope() {
  let value = 0;
  let stage = 'idle';
  let stageTime = 0;
  let attack = 0.01;
  let decay = 0.3;
  let sustain = 0.5;
  let release = 0.5;
  let peakVal = 0;

  function trigger() { stage = 'attack'; stageTime = 0; }

  function noteOff() {
    if (stage !== 'idle') { stage = 'release'; stageTime = 0; peakVal = value; }
  }

  function tick(dt) {
    stageTime += dt;
    switch (stage) {
      case 'attack':
        value = Math.min(1, stageTime / Math.max(0.001, attack));
        if (value >= 1) { stage = 'decay'; stageTime = 0; }
        break;
      case 'decay':
        value = sustain + (1 - sustain) * Math.exp(-stageTime / Math.max(0.01, decay * 0.5));
        if (Math.abs(value - sustain) < 0.001) stage = 'sustain';
        break;
      case 'sustain':
        value = sustain;
        break;
      case 'release':
        value = peakVal * Math.exp(-stageTime / Math.max(0.01, release));
        if (value < 0.001) { value = 0; stage = 'idle'; }
        break;
      default: value = 0;
    }
    return value;
  }

  function configure(p) {
    if (p.attack !== undefined) attack = p.attack;
    if (p.decay !== undefined) decay = p.decay;
    if (p.sustain !== undefined) sustain = p.sustain;
    if (p.release !== undefined) release = p.release;
  }

  return { trigger, noteOff, tick, configure, get value() { return value; }, get stage() { return stage; } };
}

export function createCurve() {
  let value = 0;
  let phase = 0;
  let duration = 1.0;
  let shape = 'exponential';
  let active = false;

  function trigger() { phase = 0; active = true; }

  function tick(dt) {
    if (!active) return 0;
    phase += dt / Math.max(0.01, duration);
    if (phase >= 1) { phase = 1; active = false; }
    switch (shape) {
      case 'exponential': value = 1 - Math.exp(-phase * 4); break;
      case 'linear': value = phase; break;
      case 'logarithmic': value = Math.log(1 + phase * 9) / Math.log(10); break;
      default: value = phase;
    }
    return value;
  }

  function configure(p) {
    if (p.duration !== undefined) duration = p.duration;
    if (p.shape !== undefined) shape = p.shape;
  }

  return { trigger, tick, configure, get value() { return value; } };
}
