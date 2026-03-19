export function createAudioEngine(onChange) {
  let engineStarted = false;
  let micState = 'idle';
  let inputLevel = 0;

  const ctx = { current: null };
  const masterGain = { current: null };
  const exciterBus = { current: null };
  const modalBus = { current: null };
  const obj1Bus = { current: null };
  const obj2Bus = { current: null };
  const lowCutHPF = { current: null };
  const noiseBuffer = { current: null };
  const filterBank = { current: [] };
  const obj1Bank = { current: [] };
  const obj2Bank = { current: [] };
  const micFilterBank = { current: [] };
  const micObj1Bank = { current: [] };
  const micObj2Bank = { current: [] };
  const distShaper = { current: null };
  const currentPitchRef = { current: 220 };

  const micStream = { current: null };
  const micSource = { current: null };
  const micGain = { current: null };
  const micHPF = { current: null };
  const micHPF2 = { current: null };
  const micPreGain = { current: null };
  const micAnalyser = { current: null };
  const micExciterGain = { current: null };
  const vuFrameRef = { current: 0 };
  const envFrameRef = { current: 0 };
  const micEnvValueRef = { current: 0 };
  const micResonatorBus = { current: null };

  const compressor = { current: null };
  const dlyNode = { current: null };
  const dlyFeedbackGain = { current: null };
  const dlyWetGain = { current: null };
  const dlyDryGain = { current: null };
  const reverbConv = { current: null };
  const reverbWetGain = { current: null };
  const reverbDryGain = { current: null };
  const eqLowShelf = { current: null };
  const eqMidPeak = { current: null };
  const eqHighShelf = { current: null };

  const currentRevSize = { current: -1 };
  const currentRevDecay = { current: -1 };
  const routingMode = { current: 'Parallel' };
  const couplingMode = { current: 'Off' };
  const crossModalToObj1 = { current: null };
  const crossModalToObj2 = { current: null };
  const crossObj1ToObj2 = { current: null };
  const crossObj2ToObj1 = { current: null };
  const couplingGain = { current: null };
  const feedbackDelay = { current: null };
  const feedbackAllpass = { current: null };
  const feedbackGain = { current: null };
  const feedbackShaper = { current: null };
  const portaTarget = { current: null };
  const portaTimer = { current: null };
  const releaseTimer = { current: null };

  function notify() { onChange({ engineStarted, micState, inputLevel }); }

  function buildImpulse(audioCtx, duration, decay) {
    const sampleRate = audioCtx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = audioCtx.createBuffer(2, length, sampleRate);
    const preDelaySamples = Math.floor(sampleRate * 0.012);
    const earlyZone = Math.floor(sampleRate * 0.08);
    for (let ch = 0; ch < 2; ch++) {
      const channelData = impulse.getChannelData(ch);
      for (let i = 0; i < preDelaySamples && i < length; i++) channelData[i] = 0;
      const earlyReflections = [
        { time: 0.015, gain: 0.7 }, { time: 0.022, gain: 0.5 },
        { time: 0.031, gain: 0.4 }, { time: 0.043, gain: 0.35 },
        { time: 0.058, gain: 0.25 }, { time: 0.072, gain: 0.18 },
      ];
      for (const ref of earlyReflections) {
        const samplePos = Math.floor(sampleRate * (ref.time + (ch === 0 ? 0 : 0.003)));
        if (samplePos < length) {
          for (let j = 0; j < 64 && samplePos + j < length; j++) {
            channelData[samplePos + j] += (Math.random() * 2 - 1) * ref.gain * Math.exp(-j / 12);
          }
        }
      }
      for (let i = earlyZone; i < length; i++) {
        const t = i / length;
        const envLow = Math.pow(1 - t, decay * 0.8);
        const envHigh = Math.pow(1 - t, decay * 1.8);
        const noise = Math.random() * 2 - 1;
        const prev = i > 0 ? channelData[i - 1] : 0;
        const filtered = noise * 0.6 + prev * 0.4;
        channelData[i] += filtered * envLow * 0.5 + noise * envHigh * 0.15;
        channelData[i] *= (1 + Math.sin(i / sampleRate * 2 * Math.PI * 0.5) * 0.05);
      }
      let maxVal = 0;
      for (let i = 0; i < length; i++) maxVal = Math.max(maxVal, Math.abs(channelData[i]));
      if (maxVal > 0) {
        const norm = 0.8 / maxVal;
        for (let i = 0; i < length; i++) channelData[i] *= norm;
      }
    }
    return impulse;
  }

  function makeDistCurve(amount, drive, tone, distType) {
    const samples = 8192;
    const curve = new Float32Array(samples);
    const k = amount > 0.01 ? drive * 150 + 1 : 0;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      if (k < 0.01) { curve[i] = x; continue; }
      switch (distType) {
        case 'Tube': {
          const tube = Math.tanh(k * x * 0.8);
          const bias = 0.05 * k;
          const tapeIn = x + bias * x * x;
          const tape = Math.sign(tapeIn) * (1 - Math.exp(-Math.abs(k * tapeIn * 0.6)));
          const xk = x * k * 0.4;
          const poly = xk - (xk * xk * xk) / 3;
          const transistor = Math.max(-1, Math.min(1, poly * 1.5));
          let out;
          if (tone < 0.5) { out = tube * (1 - tone * 2) + tape * (tone * 2); }
          else { out = tape * (1 - (tone - 0.5) * 2) + transistor * ((tone - 0.5) * 2); }
          curve[i] = Math.abs(out) > 0.95 ? Math.sign(out) * (0.95 + 0.05 * Math.tanh((Math.abs(out) - 0.95) * 10)) : out;
          break;
        }
        case 'Sine': curve[i] = Math.sin(x * k * 0.5 * Math.PI); break;
        case 'Scream': { const preEmp = x * k * 0.6 + x * x * x * k * 0.3; curve[i] = Math.max(-1, Math.min(1, preEmp)); break; }
        case 'Dist': { const pos = x >= 0 ? Math.min(1, x * k * 0.4) : Math.max(-1, x * k * 0.35); const asym = pos - pos * pos * pos * 0.33 + (x < 0 ? 0.04 : 0); curve[i] = Math.max(-1, Math.min(1, asym * 1.8)); break; }
        case 'Ring': { const phase = x * k * 0.8; curve[i] = Math.tanh(Math.sin(phase * Math.PI * 2) * (1 + Math.abs(x))); break; }
        case 'S/H': { const steps = Math.max(2, Math.round(4 + (1 - amount) * 28)); curve[i] = Math.round(x * steps) / steps; break; }
        default: curve[i] = x;
      }
    }
    return curve;
  }

  function applyTuning(baseFreq, p) {
    if (!ctx.current || !masterGain.current || !exciterBus.current || !modalBus.current || !obj1Bus.current || !obj2Bus.current || !distShaper.current) return;
    const now = ctx.current.currentTime;
    const nyquist = ctx.current.sampleRate / 2;
    const T = 0.04;
    const pitchSemitones = ((p.pitch ?? 0.5) - 0.5) * 48;
    const pitchedBase = baseFreq * Math.pow(2, pitchSemitones / 12);
    masterGain.current.gain.setTargetAtTime(p.masterVolume, now, T);
    exciterBus.current.gain.setTargetAtTime(p.mixExciter, now, T);
    modalBus.current.gain.setTargetAtTime(p.mixModal, now, T);
    obj1Bus.current.gain.setTargetAtTime(p.mixObj1, now, T);
    obj2Bus.current.gain.setTargetAtTime(p.mixObj2, now, T);
    if (lowCutHPF.current) lowCutHPF.current.frequency.setTargetAtTime(20 + (p.lowCut ?? 0) * 800, now, T);
    distShaper.current.curve = makeDistCurve(p.distAmount, p.distDrive, p.distTone ?? 0.5, p.distType ?? 'Tube');
    if (micGain.current) micGain.current.gain.setTargetAtTime(Math.max(0.01, p.extGain) * 6.0, now, T);
    if (micHPF.current) {
      const hpfFreq = 20 + p.extHPF * 1200;
      micHPF.current.frequency.setTargetAtTime(hpfFreq, now, T);
      if (micHPF2.current) micHPF2.current.frequency.setTargetAtTime(hpfFreq, now, T);
    }
    if (micExciterGain.current) micExciterGain.current.gain.setTargetAtTime(Math.max(0.01, p.extInputMix) * 3.0, now, T);
    const newRevSize = p.revSize ?? 0.5;
    const newRevDecay = p.revDecay ?? 0.5;
    if (reverbConv.current && (Math.abs(newRevSize - currentRevSize.current) > 0.01 || Math.abs(newRevDecay - currentRevDecay.current) > 0.01)) {
      reverbConv.current.buffer = buildImpulse(ctx.current, 0.5 + newRevSize * 4.5, 0.5 + newRevDecay * 3.5);
      currentRevSize.current = newRevSize;
      currentRevDecay.current = newRevDecay;
    }
    const dampSlope = 0.5 + (p.dampingSlope ?? 0.5) * 2;
    const dampGainScale = 0.3 + (p.dampingGain ?? 0.5) * 1.7;
    const dispFilterScale = 1 + ((p.dispersionFilter ?? 0.5) - 0.5) * 0.06;
    filterBank.current.forEach((node, i) => {
      const mult = p[`modalFreq${i}`] ?? 1;
      const dispersionShift = 1 + p.dispersionFreq * dispFilterScale * 0.08 * i * (i + 0.5);
      const finalFreq = Math.min(pitchedBase * mult * dispersionShift, nyquist - 100);
      const freqRatio = finalFreq / pitchedBase;
      const freqHz = finalFreq;
      const lowDamp = freqHz < 500 ? (1 - freqHz / 500) * (p.dampingLow ?? 0.4) : 0;
      const midBand = Math.exp(-Math.pow(Math.log2(Math.max(20, freqHz) / 1000), 2) / 2);
      const midDamp = midBand * (p.dampingMid ?? 0.45);
      const hiDamp = Math.max(0, freqRatio - 1) * p.dampingHi;
      const totalDamp = 1 + (lowDamp + midDamp + hiDamp) * dampGainScale * dampSlope;
      const baseQ = 15 + p.decayTime * 350;
      const qVal = Math.max(5, baseQ / totalDamp);
      node.f1.frequency.setTargetAtTime(finalFreq, now, T);
      node.f2.frequency.setTargetAtTime(finalFreq, now, T);
      node.f1.Q.setTargetAtTime(qVal, now, T);
      node.f2.Q.setTargetAtTime(qVal * 0.85, now, T);
      const partialGain = p[`modal${i}`] ?? 1;
      node.g.gain.setTargetAtTime(partialGain * Math.pow(qVal, 0.35) * 0.015, now, T);
      const panSpread = (i % 2 === 0 ? 1 : -1) * (0.2 + i * 0.08) * p.panModal;
      node.panner.pan.setTargetAtTime(Math.max(-1, Math.min(1, panSpread)), now, T);
    });
    const baseDampCutoff = 800 + (1 - p.dampingHi) * 14000;
    const targetDecaySec = 0.3 + p.decayTime * 4.5;
    obj1Bank.current.forEach((node, i) => {
      const mult = p[`obj1Freq${i}`] ?? 1;
      const dispersionShift = 1 + p.dispersionFreq * dispFilterScale * 0.04 * i * (i + 0.3);
      const finalFreq = Math.max(20, Math.min(pitchedBase * mult * dispersionShift, nyquist - 100));
      node.delay.delayTime.setTargetAtTime(1.0 / finalFreq, now, T);
      const freqRatio = finalFreq / pitchedBase;
      const freqHz = finalFreq;
      const lowDamp = freqHz < 500 ? (1 - freqHz / 500) * (p.dampingLow ?? 0.4) : 0;
      const midBand = Math.exp(-Math.pow(Math.log2(Math.max(20, freqHz) / 1000), 2) / 2);
      const midDamp = midBand * (p.dampingMid ?? 0.45);
      const hiDamp = Math.max(0, freqRatio - 1) * p.dampingHi;
      const totalDampFactor = (lowDamp + midDamp + hiDamp) * dampGainScale * dampSlope;
      const dampCutoff = Math.max(150, baseDampCutoff / (1 + totalDampFactor * 0.3));
      node.damp.frequency.setTargetAtTime(dampCutoff, now, T);
      node.damp.Q.setTargetAtTime(0.5, now, T);
      const cyclesTotal = targetDecaySec * finalFreq;
      const rawFb = Math.pow(0.001, 1 / cyclesTotal);
      const fbLevel = Math.min(0.9985, rawFb * (1 - totalDampFactor * 0.002));
      node.fb.gain.setTargetAtTime(fbLevel, now, T);
      const partialGain = p[`obj1_${i}`] ?? 0.5;
      node.out.gain.setTargetAtTime(partialGain * 0.22, now, T);
      const panSpread = (i % 2 === 0 ? 1 : -1) * (0.15 + i * 0.06) * p.widthObj * p.panObj1;
      node.panner.pan.setTargetAtTime(Math.max(-1, Math.min(1, panSpread)), now, T);
    });
    obj2Bank.current.forEach((node, i) => {
      const mult = p[`obj2Freq${i}`] ?? 1;
      const dispersionShift = 1 + p.dispersionFreq * dispFilterScale * 0.05 * i * (i + 0.4);
      const finalFreq = Math.max(20, Math.min(pitchedBase * mult * dispersionShift, nyquist - 100));
      node.delay.delayTime.setTargetAtTime(1.0 / finalFreq, now, T);
      const freqRatio = finalFreq / pitchedBase;
      const freqHz = finalFreq;
      const lowDamp = freqHz < 500 ? (1 - freqHz / 500) * (p.dampingLow ?? 0.4) : 0;
      const midBand = Math.exp(-Math.pow(Math.log2(Math.max(20, freqHz) / 1000), 2) / 2);
      const midDamp = midBand * (p.dampingMid ?? 0.45);
      const hiDamp = Math.max(0, freqRatio - 1) * p.dampingHi;
      const totalDampFactor = (lowDamp + midDamp + hiDamp) * dampGainScale * dampSlope;
      const dampCutoff = Math.max(150, baseDampCutoff / (1 + totalDampFactor * 0.35));
      node.damp.frequency.setTargetAtTime(dampCutoff, now, T);
      node.damp.Q.setTargetAtTime(0.6, now, T);
      const cyclesTotal = targetDecaySec * finalFreq;
      const rawFb = Math.pow(0.001, 1 / cyclesTotal);
      const fbLevel = Math.min(0.9985, rawFb * (1 - totalDampFactor * 0.002));
      node.fb.gain.setTargetAtTime(fbLevel, now, T);
      const partialGain = p[`obj2_${i}`] ?? 0.5;
      node.out.gain.setTargetAtTime(partialGain * 0.22, now, T);
      const panSpread = (i % 2 === 0 ? -1 : 1) * (0.18 + i * 0.07) * p.widthObj * p.panObj2;
      node.panner.pan.setTargetAtTime(Math.max(-1, Math.min(1, panSpread)), now, T);
    });
    const micFbScale = 0.92;
    micFilterBank.current.forEach((node, i) => {
      const mult = p[`modalFreq${i}`] ?? 1;
      const dispersionShift = 1 + p.dispersionFreq * dispFilterScale * 0.08 * i * (i + 0.5);
      const finalFreq = Math.min(pitchedBase * mult * dispersionShift, nyquist - 100);
      const freqRatio = finalFreq / pitchedBase;
      const hiDampFactor = 1 + (freqRatio - 1) * p.dampingHi * 1.5;
      const baseQ = 15 + p.decayTime * 250;
      const qVal = Math.max(5, Math.min(120, baseQ / hiDampFactor));
      node.f1.frequency.setTargetAtTime(finalFreq, now, T);
      node.f2.frequency.setTargetAtTime(finalFreq, now, T);
      node.f1.Q.setTargetAtTime(qVal, now, T);
      node.f2.Q.setTargetAtTime(qVal * 0.85, now, T);
      const partialGain = p[`modal${i}`] ?? 1;
      node.g.gain.setTargetAtTime(partialGain * Math.pow(qVal, 0.35) * 0.012, now, T);
      const panSpread = (i % 2 === 0 ? 1 : -1) * (0.2 + i * 0.08) * p.panModal;
      node.panner.pan.setTargetAtTime(Math.max(-1, Math.min(1, panSpread)), now, T);
    });
    micObj1Bank.current.forEach((node, i) => {
      const mult = p[`obj1Freq${i}`] ?? 1;
      const dispersionShift = 1 + p.dispersionFreq * dispFilterScale * 0.04 * i * (i + 0.3);
      const finalFreq = Math.max(20, Math.min(pitchedBase * mult * dispersionShift, nyquist - 100));
      node.delay.delayTime.setTargetAtTime(1.0 / finalFreq, now, T);
      const freqRatio = finalFreq / pitchedBase;
      const dampCutoff = Math.max(150, baseDampCutoff / (1 + (freqRatio - 1) * 0.3));
      node.damp.frequency.setTargetAtTime(dampCutoff, now, T);
      node.damp.Q.setTargetAtTime(0.5, now, T);
      const cyclesTotal = targetDecaySec * finalFreq;
      const fbLevel = Math.min(0.95, Math.pow(0.001, 1 / cyclesTotal) * micFbScale);
      node.fb.gain.setTargetAtTime(fbLevel, now, T);
      node.out.gain.setTargetAtTime((p[`obj1_${i}`] ?? 0.5) * 0.22, now, T);
      const panSpread = (i % 2 === 0 ? 1 : -1) * (0.15 + i * 0.06) * p.widthObj * p.panObj1;
      node.panner.pan.setTargetAtTime(Math.max(-1, Math.min(1, panSpread)), now, T);
    });
    micObj2Bank.current.forEach((node, i) => {
      const mult = p[`obj2Freq${i}`] ?? 1;
      const dispersionShift = 1 + p.dispersionFreq * dispFilterScale * 0.05 * i * (i + 0.4);
      const finalFreq = Math.max(20, Math.min(pitchedBase * mult * dispersionShift, nyquist - 100));
      node.delay.delayTime.setTargetAtTime(1.0 / finalFreq, now, T);
      const freqRatio = finalFreq / pitchedBase;
      const dampCutoff = Math.max(150, baseDampCutoff / (1 + (freqRatio - 1) * 0.35));
      node.damp.frequency.setTargetAtTime(dampCutoff, now, T);
      node.damp.Q.setTargetAtTime(0.6, now, T);
      const cyclesTotal = targetDecaySec * finalFreq;
      const fbLevel = Math.min(0.95, Math.pow(0.001, 1 / cyclesTotal) * micFbScale);
      node.fb.gain.setTargetAtTime(fbLevel, now, T);
      node.out.gain.setTargetAtTime((p[`obj2_${i}`] ?? 0.5) * 0.22, now, T);
      const panSpread = (i % 2 === 0 ? -1 : 1) * (0.18 + i * 0.07) * p.widthObj * p.panObj2;
      node.panner.pan.setTargetAtTime(Math.max(-1, Math.min(1, panSpread)), now, T);
    });
    if (compressor.current) {
      compressor.current.threshold.setTargetAtTime(-60 + (p.compThresh ?? 0.5) * 55, now, T);
      compressor.current.ratio.setTargetAtTime(1 + (p.compRatio ?? 0.3) * 19, now, T);
      compressor.current.attack.setTargetAtTime(0.001 + (p.compAttack ?? 0.2) * 0.3, now, T);
      compressor.current.release.setTargetAtTime(0.05 + (p.compRelease ?? 0.5) * 0.95, now, T);
    }
    if (dlyNode.current) dlyNode.current.delayTime.setTargetAtTime(0.01 + (p.dlyTime ?? 0.3) * 1.5, now, T);
    if (dlyFeedbackGain.current) dlyFeedbackGain.current.gain.setTargetAtTime(Math.min(0.92, (p.dlyFeedback ?? 0.3)), now, T);
    if (dlyWetGain.current) dlyWetGain.current.gain.setTargetAtTime(p.dlyMix ?? 0.25, now, T);
    if (dlyDryGain.current) dlyDryGain.current.gain.setTargetAtTime(1 - (p.dlyMix ?? 0.25) * 0.5, now, T);
    if (reverbWetGain.current) reverbWetGain.current.gain.setTargetAtTime(p.revMix ?? 0.15, now, T);
    if (reverbDryGain.current) reverbDryGain.current.gain.setTargetAtTime(1 - (p.revMix ?? 0.15) * 0.5, now, T);
    if (eqLowShelf.current) eqLowShelf.current.gain.setTargetAtTime(((p.eqLow ?? 0.5) - 0.5) * 24, now, T);
    if (eqMidPeak.current) eqMidPeak.current.gain.setTargetAtTime(((p.eqMid ?? 0.5) - 0.5) * 18, now, T);
    if (eqHighShelf.current) eqHighShelf.current.gain.setTargetAtTime(((p.eqHigh ?? 0.5) - 0.5) * 24, now, T);
    if (feedbackGain.current) {
      const fbAmt = (p.feedbackAmount ?? 0) * 0.7;
      feedbackGain.current.gain.setTargetAtTime(fbAmt, now, T);
    }
    if (feedbackDelay.current) {
      const fbDly = 0.001 + (p.feedbackDelay ?? 0.3) * 0.049;
      feedbackDelay.current.delayTime.setTargetAtTime(fbDly, now, T);
    }
    if (feedbackAllpass.current) {
      const fbColor = 200 + (p.feedbackColor ?? 0.5) * 7800;
      feedbackAllpass.current.frequency.setTargetAtTime(fbColor, now, T);
    }
    if (feedbackShaper.current && ctx.current) {
      const timer = p.feedbackTimer ?? 0.2;
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * 2 - 1;
        const pw = 0.1 + timer * 0.9;
        curve[i] = Math.abs(x) < pw ? x : x * (1 - (Math.abs(x) - pw) * 2);
      }
      feedbackShaper.current.curve = curve;
    }
  }

  function startVUMeter() {
    if (!micAnalyser.current) return;
    const analyser = micAnalyser.current;
    const buf = new Float32Array(analyser.fftSize);
    let prevEnv = 0;
    const tick = () => {
      analyser.getFloatTimeDomainData(buf);
      let sumSq = 0;
      for (let i = 0; i < buf.length; i++) sumSq += buf[i] * buf[i];
      const rms = Math.sqrt(sumSq / buf.length);
      const coeff = rms > prevEnv ? 0.05 : 0.15;
      prevEnv = prevEnv + coeff * (rms - prevEnv);
      micEnvValueRef.current = prevEnv;
      inputLevel = Math.min(1, prevEnv * 14);
      notify();
      vuFrameRef.current = requestAnimationFrame(tick);
    };
    vuFrameRef.current = requestAnimationFrame(tick);
  }

  function stopVUMeter() {
    cancelAnimationFrame(vuFrameRef.current);
    cancelAnimationFrame(envFrameRef.current);
    inputLevel = 0;
    micEnvValueRef.current = 0;
    notify();
  }

  function connectMicToSynth(audioCtx, stream, params) {
    if (micSource.current) { try { micSource.current.disconnect(); } catch (e) {} }
    micStream.current = stream;
    const source = audioCtx.createMediaStreamSource(stream);
    micSource.current = source;
    const hpf1 = audioCtx.createBiquadFilter();
    hpf1.type = 'highpass';
    const hpfFreq = 20 + params.extHPF * 1200;
    hpf1.frequency.value = hpfFreq;
    hpf1.Q.value = 0.707;
    micHPF.current = hpf1;
    const hpf2 = audioCtx.createBiquadFilter();
    hpf2.type = 'highpass';
    hpf2.frequency.value = hpfFreq;
    hpf2.Q.value = 0.707;
    micHPF2.current = hpf2;
    const preGain = audioCtx.createGain();
    preGain.gain.value = 8.0;
    micPreGain.current = preGain;
    const gain = audioCtx.createGain();
    gain.gain.value = Math.max(0.01, params.extGain) * 6.0;
    micGain.current = gain;
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.5;
    micAnalyser.current = analyser;
    const exciterInject = audioCtx.createGain();
    exciterInject.gain.value = Math.max(0.01, params.extInputMix) * 3.0;
    micExciterGain.current = exciterInject;
    source.connect(hpf1);
    hpf1.connect(hpf2);
    hpf2.connect(preGain);
    preGain.connect(gain);
    gain.connect(analyser);
    analyser.connect(exciterInject);
    micFilterBank.current.forEach(f => exciterInject.connect(f.f1));
    micObj1Bank.current.forEach(f => exciterInject.connect(f.delay));
    micObj2Bank.current.forEach(f => exciterInject.connect(f.delay));
    startVUMeter();
  }

  async function requestMic(params) {
    if (micState === 'active') return;
    if (!ctx.current) return;
    micState = 'requesting';
    notify();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      connectMicToSynth(ctx.current, stream, params);
      micState = 'active';
      notify();
    } catch (err) {
      const isDenied = err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
      micState = isDenied ? 'denied' : 'error';
      notify();
    }
  }

  function releaseMic() {
    stopVUMeter();
    if (micSource.current) { try { micSource.current.disconnect(); } catch (e) {} micSource.current = null; }
    if (micStream.current) { micStream.current.getTracks().forEach(t => t.stop()); micStream.current = null; }
    micGain.current = null;
    micHPF.current = null;
    micHPF2.current = null;
    micPreGain.current = null;
    micAnalyser.current = null;
    micExciterGain.current = null;
    micEnvValueRef.current = 0;
    micState = 'idle';
    notify();
  }

  async function initAudio(params, externalCtx) {
    if (ctx.current) return;
    const audioCtx = externalCtx || new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive', sampleRate: 44100 });
    ctx.current = audioCtx;
    const b = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
    const data = b.getChannelData(0);
    for (let i = 0; i < b.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffer.current = b;
    masterGain.current = audioCtx.createGain();
    exciterBus.current = audioCtx.createGain();
    modalBus.current = audioCtx.createGain();
    obj1Bus.current = audioCtx.createGain();
    obj2Bus.current = audioCtx.createGain();
    const hpf = audioCtx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 20 + (params.lowCut ?? 0) * 800;
    hpf.Q.value = 0.5;
    lowCutHPF.current = hpf;
    distShaper.current = audioCtx.createWaveShaper();
    distShaper.current.oversample = '4x';
    const eqLow = audioCtx.createBiquadFilter();
    eqLow.type = 'lowshelf'; eqLow.frequency.value = 200;
    eqLowShelf.current = eqLow;
    const eqMid = audioCtx.createBiquadFilter();
    eqMid.type = 'peaking'; eqMid.frequency.value = 1200; eqMid.Q.value = 1.0;
    eqMidPeak.current = eqMid;
    const eqHigh = audioCtx.createBiquadFilter();
    eqHigh.type = 'highshelf'; eqHigh.frequency.value = 6000;
    eqHighShelf.current = eqHigh;
    const comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -24; comp.ratio.value = 4;
    comp.attack.value = 0.05; comp.release.value = 0.25;
    compressor.current = comp;
    const delay = audioCtx.createDelay(2.0);
    delay.delayTime.value = 0.25;
    dlyNode.current = delay;
    const dlyFb = audioCtx.createGain(); dlyFb.gain.value = 0.3;
    dlyFeedbackGain.current = dlyFb;
    const dlyWet = audioCtx.createGain(); dlyWet.gain.value = 0.2;
    dlyWetGain.current = dlyWet;
    const dlyDry = audioCtx.createGain(); dlyDry.gain.value = 0.85;
    dlyDryGain.current = dlyDry;
    delay.connect(dlyFb); dlyFb.connect(delay); delay.connect(dlyWet);
    const revSize = params.revSize ?? 0.5;
    const revDecay = params.revDecay ?? 0.5;
    const reverb = audioCtx.createConvolver();
    reverb.buffer = buildImpulse(audioCtx, 0.5 + revSize * 4.5, 0.5 + revDecay * 3.5);
    reverbConv.current = reverb;
    currentRevSize.current = revSize;
    currentRevDecay.current = revDecay;
    const revWet = audioCtx.createGain(); revWet.gain.value = 0.15;
    reverbWetGain.current = revWet;
    const revDry = audioCtx.createGain(); revDry.gain.value = 0.9;
    reverbDryGain.current = revDry;
    reverb.connect(revWet);
    const limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.value = -1.5; limiter.knee.value = 0;
    limiter.ratio.value = 20; limiter.attack.value = 0.0001; limiter.release.value = 0.1;
    exciterBus.current.connect(lowCutHPF.current);
    modalBus.current.connect(lowCutHPF.current);
    obj1Bus.current.connect(lowCutHPF.current);
    obj2Bus.current.connect(lowCutHPF.current);
    lowCutHPF.current.connect(distShaper.current);
    distShaper.current.connect(comp);
    comp.connect(dlyDry); dlyDry.connect(eqLow);
    comp.connect(delay); dlyWet.connect(eqLow);
    comp.connect(revDry); revDry.connect(eqLow);
    comp.connect(reverb); revWet.connect(eqLow);
    eqLow.connect(eqMid); eqMid.connect(eqHigh);
    eqHigh.connect(masterGain.current);
    masterGain.current.connect(limiter);
    limiter.connect(audioCtx.destination);
    const micResBus = audioCtx.createGain();
    micResBus.gain.value = 1.0;
    micResBus.connect(limiter);
    micResonatorBus.current = micResBus;
    filterBank.current = Array.from({ length: 8 }, () => {
      const f1 = audioCtx.createBiquadFilter(); f1.type = 'bandpass';
      const f2 = audioCtx.createBiquadFilter(); f2.type = 'bandpass';
      const g = audioCtx.createGain();
      const panner = audioCtx.createStereoPanner();
      f1.connect(f2); f2.connect(g); g.connect(panner); panner.connect(modalBus.current);
      return { f1, f2, g, panner };
    });
    const fbDly = audioCtx.createDelay(0.1);
    fbDly.delayTime.value = 0.001 + (params.feedbackDelay ?? 0.3) * 0.049;
    feedbackDelay.current = fbDly;
    const fbAp = audioCtx.createBiquadFilter();
    fbAp.type = 'allpass';
    fbAp.frequency.value = 200 + (params.feedbackColor ?? 0.5) * 7800;
    feedbackAllpass.current = fbAp;
    const fbG = audioCtx.createGain();
    fbG.gain.value = (params.feedbackAmount ?? 0) * 0.7;
    feedbackGain.current = fbG;
    const fbWs = audioCtx.createWaveShaper();
    fbWs.oversample = '2x';
    const timerVal = params.feedbackTimer ?? 0.2;
    const fbCurve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 255) * 2 - 1;
      const pw = 0.1 + timerVal * 0.9;
      fbCurve[i] = Math.abs(x) < pw ? x : x * (1 - (Math.abs(x) - pw) * 2);
    }
    fbWs.curve = fbCurve;
    feedbackShaper.current = fbWs;
    modalBus.current.connect(fbDly);
    fbDly.connect(fbAp);
    fbAp.connect(fbWs);
    fbWs.connect(fbG);
    filterBank.current.forEach(node => fbG.connect(node.f1));
    obj1Bank.current = Array.from({ length: 8 }, () => {
      const del = audioCtx.createDelay(1.0); del.delayTime.value = 0.01;
      const damp = audioCtx.createBiquadFilter(); damp.type = 'lowpass'; damp.frequency.value = 8000;
      const fb = audioCtx.createGain(); fb.gain.value = 0.5;
      const out = audioCtx.createGain(); out.gain.value = 0.1;
      const panner = audioCtx.createStereoPanner();
      del.connect(damp); damp.connect(fb); fb.connect(del);
      del.connect(out); out.connect(panner); panner.connect(obj1Bus.current);
      return { delay: del, damp, fb, out, panner };
    });
    obj2Bank.current = Array.from({ length: 8 }, () => {
      const del = audioCtx.createDelay(1.0); del.delayTime.value = 0.01;
      const damp = audioCtx.createBiquadFilter(); damp.type = 'lowpass'; damp.frequency.value = 8000;
      const fb = audioCtx.createGain(); fb.gain.value = 0.5;
      const out = audioCtx.createGain(); out.gain.value = 0.1;
      const panner = audioCtx.createStereoPanner();
      del.connect(damp); damp.connect(fb); fb.connect(del);
      del.connect(out); out.connect(panner); panner.connect(obj2Bus.current);
      return { delay: del, damp, fb, out, panner };
    });
    micFilterBank.current = Array.from({ length: 8 }, () => {
      const f1 = audioCtx.createBiquadFilter(); f1.type = 'bandpass';
      const f2 = audioCtx.createBiquadFilter(); f2.type = 'bandpass';
      const g = audioCtx.createGain();
      const panner = audioCtx.createStereoPanner();
      f1.connect(f2); f2.connect(g); g.connect(panner); panner.connect(micResBus);
      return { f1, f2, g, panner };
    });
    micObj1Bank.current = Array.from({ length: 8 }, () => {
      const del = audioCtx.createDelay(1.0); del.delayTime.value = 0.01;
      const damp = audioCtx.createBiquadFilter(); damp.type = 'lowpass'; damp.frequency.value = 8000;
      const fb = audioCtx.createGain(); fb.gain.value = 0.5;
      const out = audioCtx.createGain(); out.gain.value = 0.1;
      const panner = audioCtx.createStereoPanner();
      del.connect(damp); damp.connect(fb); fb.connect(del);
      del.connect(out); out.connect(panner); panner.connect(micResBus);
      return { delay: del, damp, fb, out, panner };
    });
    micObj2Bank.current = Array.from({ length: 8 }, () => {
      const del = audioCtx.createDelay(1.0); del.delayTime.value = 0.01;
      const damp = audioCtx.createBiquadFilter(); damp.type = 'lowpass'; damp.frequency.value = 8000;
      const fb = audioCtx.createGain(); fb.gain.value = 0.5;
      const out = audioCtx.createGain(); out.gain.value = 0.1;
      const panner = audioCtx.createStereoPanner();
      del.connect(damp); damp.connect(fb); fb.connect(del);
      del.connect(out); out.connect(panner); panner.connect(micResBus);
      return { delay: del, damp, fb, out, panner };
    });
    crossModalToObj1.current = audioCtx.createGain(); crossModalToObj1.current.gain.value = 0;
    crossModalToObj2.current = audioCtx.createGain(); crossModalToObj2.current.gain.value = 0;
    crossObj1ToObj2.current = audioCtx.createGain(); crossObj1ToObj2.current.gain.value = 0;
    crossObj2ToObj1.current = audioCtx.createGain(); crossObj2ToObj1.current.gain.value = 0;
    couplingGain.current = audioCtx.createGain(); couplingGain.current.gain.value = 0;
    modalBus.current.connect(crossModalToObj1.current);
    modalBus.current.connect(crossModalToObj2.current);
    obj1Bus.current.connect(crossObj1ToObj2.current);
    obj2Bus.current.connect(crossObj2ToObj1.current);
    obj1Bus.current.connect(couplingGain.current);
    obj2Bus.current.connect(couplingGain.current);
    crossModalToObj1.current.connect(lowCutHPF.current);
    crossModalToObj2.current.connect(lowCutHPF.current);
    crossObj1ToObj2.current.connect(lowCutHPF.current);
    crossObj2ToObj1.current.connect(lowCutHPF.current);
    couplingGain.current.connect(lowCutHPF.current);
    obj1Bank.current.forEach((n) => { crossModalToObj1.current.connect(n.delay); });
    obj2Bank.current.forEach((n) => { crossModalToObj2.current.connect(n.delay); });
    obj1Bank.current.forEach((n, i) => {
      if (obj2Bank.current[i]) crossObj1ToObj2.current.connect(obj2Bank.current[i].delay);
    });
    obj2Bank.current.forEach((n, i) => {
      if (obj1Bank.current[i]) crossObj2ToObj1.current.connect(obj1Bank.current[i].delay);
    });
    if (params.routingMode && params.routingMode !== 'Parallel') updateRouting(params.routingMode);
    if (params.couplingMode && params.couplingMode !== 'Off') updateCoupling(params.couplingMode);
    applyTuning(currentPitchRef.current, params);
    engineStarted = true;
    notify();
  }

  function releaseNote(params) {
    if (!ctx.current) return;
    const muteAmt = params.decayRelMute ?? 0;
    if (muteAmt < 0.01) return;
    if (releaseTimer.current) clearTimeout(releaseTimer.current);
    const now = ctx.current.currentTime;
    const muteTime = 0.005 + (1 - muteAmt) * 0.5;
    filterBank.current.forEach(node => {
      const curQ = node.f1.Q.value;
      node.f1.Q.setTargetAtTime(Math.max(1, curQ * (1 - muteAmt * 0.9)), now, muteTime);
      node.f2.Q.setTargetAtTime(Math.max(1, node.f2.Q.value * (1 - muteAmt * 0.9)), now, muteTime);
    });
    obj1Bank.current.forEach(node => {
      node.fb.gain.setTargetAtTime(node.fb.gain.value * (1 - muteAmt * 0.95), now, muteTime);
    });
    obj2Bank.current.forEach(node => {
      node.fb.gain.setTargetAtTime(node.fb.gain.value * (1 - muteAmt * 0.95), now, muteTime);
    });
    micFilterBank.current.forEach(node => {
      node.f1.Q.setTargetAtTime(Math.max(1, node.f1.Q.value * (1 - muteAmt * 0.85)), now, muteTime);
      node.f2.Q.setTargetAtTime(Math.max(1, node.f2.Q.value * (1 - muteAmt * 0.85)), now, muteTime);
    });
    micObj1Bank.current.forEach(node => {
      node.fb.gain.setTargetAtTime(node.fb.gain.value * (1 - muteAmt * 0.9), now, muteTime);
    });
    micObj2Bank.current.forEach(node => {
      node.fb.gain.setTargetAtTime(node.fb.gain.value * (1 - muteAmt * 0.9), now, muteTime);
    });
  }

  function updateRouting(mode) {
    if (!ctx.current || !crossModalToObj1.current) return;
    routingMode.current = mode;
    const serial12 = mode === 'Serial M→1→2';
    const serial21 = mode === 'Serial M→2→1';
    crossModalToObj1.current.gain.value = serial12 ? 0.35 : 0;
    crossModalToObj2.current.gain.value = serial21 ? 0.35 : 0;
    crossObj1ToObj2.current.gain.value = serial12 ? 0.25 : 0;
    crossObj2ToObj1.current.gain.value = serial21 ? 0.25 : 0;
  }

  function updateCoupling(mode) {
    if (!ctx.current || !couplingGain.current) return;
    couplingMode.current = mode;
    couplingGain.current.gain.value = mode === 'Off' ? 0 : mode === 'On' ? 0.15 : 0.25;
  }

  function triggerNote(freq, params) {
    if (!ctx.current) return;
    const prevFreq = currentPitchRef.current;
    const portaRate = params.portamentoRate ?? 0;
    if (portaRate > 0.01 && prevFreq && prevFreq !== freq) {
      if (portaTimer.current) clearInterval(portaTimer.current);
      const glideTime = portaRate * 500;
      const startFreq = prevFreq;
      const startTime = performance.now();
      portaTimer.current = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const t = Math.min(1, elapsed / glideTime);
        const curFreq = startFreq * Math.pow(freq / startFreq, t);
        currentPitchRef.current = curFreq;
        applyTuning(curFreq, params);
        if (t >= 1) { clearInterval(portaTimer.current); portaTimer.current = null; }
      }, 16);
    }
    currentPitchRef.current = freq;
    applyTuning(freq, params);
    const extIsActive = micSource.current !== null && params.extInputMix > 0.001;
    if (extIsActive) return;
    const now = ctx.current.currentTime;
    const diffuseMode = (params.diffuse ?? 0) > 0.5;
    const burstGain = ctx.current.createGain();
    burstGain.gain.setValueAtTime(1, now);
    filterBank.current.forEach(f => burstGain.connect(f.f1));
    obj1Bank.current.forEach(f => burstGain.connect(f.delay));
    obj2Bank.current.forEach(f => burstGain.connect(f.delay));
    burstGain.connect(exciterBus.current);
    if (params.impactLevel > 0) {
      const velScale = 0.3 + (params.impactVel ?? 0.5) * 0.7;
      const impLevel = params.impactLevel * velScale;
      const hardness = params.impactHardness;
      const impTime = Math.max(0.005, params.impactTime * 0.5);
      const trigPosMult = 1 + (params.trigPos ?? 0.5) * 2;
      if (diffuseMode) {
        const burstCount = 8;
        for (let bIdx = 0; bIdx < burstCount; bIdx++) {
          const bTime = now + bIdx * (impTime / burstCount);
          const bAmp = impLevel * Math.pow(1 - bIdx / burstCount, 1.5);
          const nSrc = ctx.current.createBufferSource();
          nSrc.buffer = noiseBuffer.current;
          const nFilt = ctx.current.createBiquadFilter();
          nFilt.type = 'bandpass';
          nFilt.frequency.value = 800 + hardness * 6000 + Math.random() * 2000;
          nFilt.Q.value = 2 + hardness * 4;
          const nEnv = ctx.current.createGain();
          nEnv.gain.setValueAtTime(0, bTime);
          nEnv.gain.linearRampToValueAtTime(bAmp, bTime + 0.001);
          nEnv.gain.exponentialRampToValueAtTime(0.0001, bTime + 0.015 + (1 - hardness) * 0.02);
          nSrc.connect(nFilt); nFilt.connect(nEnv); nEnv.connect(burstGain);
          nSrc.start(bTime); nSrc.stop(bTime + 0.05);
        }
      } else {
        const osc = ctx.current.createOscillator();
        osc.type = params.impactShape < 0.25 ? 'sine' : params.impactShape < 0.5 ? 'triangle' : params.impactShape < 0.75 ? 'sawtooth' : 'square';
        const startMult = 1 + params.impactFreq * 8 * trigPosMult + hardness * 4;
        osc.frequency.setValueAtTime(freq * startMult, now);
        osc.frequency.exponentialRampToValueAtTime(freq * (0.95 + Math.random() * 0.1), now + impTime);
        const impFilter = ctx.current.createBiquadFilter();
        impFilter.type = 'lowpass';
        impFilter.frequency.setValueAtTime(200 + hardness * 16000, now);
        impFilter.frequency.exponentialRampToValueAtTime(100 + hardness * 4000, now + impTime);
        impFilter.Q.value = 0.7 + hardness * 1.5;
        const impEnv = ctx.current.createGain();
        const attackTime = 0.0005 + (1 - hardness) * 0.002;
        impEnv.gain.setValueAtTime(0, now);
        impEnv.gain.linearRampToValueAtTime(impLevel * 2.0, now + attackTime);
        impEnv.gain.exponentialRampToValueAtTime(0.0001, now + impTime);
        osc.connect(impFilter); impFilter.connect(impEnv); impEnv.connect(burstGain);
        osc.start(now); osc.stop(now + impTime + 0.1);
        if (hardness > 0.3) {
          const subOsc = ctx.current.createOscillator();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(freq * 0.5, now);
          subOsc.frequency.exponentialRampToValueAtTime(freq * 0.25, now + impTime * 1.5);
          const subEnv = ctx.current.createGain();
          subEnv.gain.setValueAtTime(0, now);
          subEnv.gain.linearRampToValueAtTime(impLevel * 0.6 * hardness, now + 0.001);
          subEnv.gain.exponentialRampToValueAtTime(0.0001, now + impTime * 2);
          subOsc.connect(subEnv); subEnv.connect(burstGain);
          subOsc.start(now); subOsc.stop(now + impTime * 2 + 0.1);
        }
        if (params.impactClick > 0.1) {
          const clickSrc = ctx.current.createBufferSource();
          clickSrc.buffer = noiseBuffer.current;
          const clickFilter = ctx.current.createBiquadFilter();
          clickFilter.type = 'bandpass';
          clickFilter.frequency.value = 2000 + hardness * 8000;
          clickFilter.Q.value = 2 + hardness * 4;
          const clickEnv = ctx.current.createGain();
          clickEnv.gain.setValueAtTime(impLevel * params.impactClick * 1.5, now);
          clickEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.003 + (1 - hardness) * 0.01);
          clickSrc.connect(clickFilter); clickFilter.connect(clickEnv); clickEnv.connect(burstGain);
          clickSrc.start(now); clickSrc.stop(now + 0.05);
        }
      }
    }
    if (params.noiseLevel > 0) {
      const velScale = 0.3 + (params.noiseVel ?? 0.5) * 0.7;
      const noiseDelay = (params.noiseDelay ?? 0) * 0.2;
      const noiseStart = now + noiseDelay;
      const noiseSrc = ctx.current.createBufferSource();
      noiseSrc.buffer = noiseBuffer.current;
      noiseSrc.loop = true;
      const noiseLP = ctx.current.createBiquadFilter();
      noiseLP.type = 'lowpass';
      noiseLP.frequency.value = 400 + params.noiseRate * 12000;
      noiseLP.Q.value = 0.5 + params.noiseRate * 2;
      const noiseBP = ctx.current.createBiquadFilter();
      noiseBP.type = 'bandpass';
      noiseBP.frequency.value = freq * (1.5 + params.noiseRate * 3);
      noiseBP.Q.value = Math.max(0.5, params.noiseRate * 8);
      const noiseEnv = ctx.current.createGain();
      noiseEnv.gain.setValueAtTime(0, noiseStart);
      const a = Math.max(0.002, params.noiseA * 0.8);
      const d = Math.max(0.01, params.noiseD * 1.2);
      const s = Math.max(0.001, params.noiseS);
      const r = Math.max(0.01, (params.noiseR ?? 0.2) * 0.8);
      const peakLevel = params.noiseLevel * velScale * 1.2;
      noiseEnv.gain.linearRampToValueAtTime(peakLevel, noiseStart + a);
      noiseEnv.gain.setTargetAtTime(peakLevel * s, noiseStart + a, d * 0.5);
      noiseEnv.gain.setTargetAtTime(0.0001, noiseStart + a + d + 0.3, r);
      noiseSrc.connect(noiseLP); noiseLP.connect(noiseBP); noiseBP.connect(noiseEnv);
      noiseEnv.connect(burstGain);
      noiseSrc.start(noiseStart);
      noiseSrc.stop(noiseStart + a + d + 0.8 + r * 3);
    }
    if ((params.collisionAmount ?? 0) > 0.01) {
      const bounceCount = Math.floor(2 + (params.collisionBounce ?? 0.5) * 8);
      for (let b = 0; b < bounceCount; b++) {
        const bDelay = 0.02 + b * (0.015 + (1 - (params.collisionBounce ?? 0.5)) * 0.05);
        const bAmp = params.collisionAmount * Math.pow(0.5 + (params.collisionBounce ?? 0.5) * 0.3, b + 1);
        if (bAmp < 0.005) break;
        const bTime = now + bDelay;
        const bSrc = ctx.current.createBufferSource();
        bSrc.buffer = noiseBuffer.current;
        const bFilt = ctx.current.createBiquadFilter();
        bFilt.type = 'bandpass';
        bFilt.frequency.value = 600 + (params.impactHardness ?? 0.5) * 5000;
        bFilt.Q.value = 1.5 + (params.impactHardness ?? 0.5) * 3;
        const bEnv = ctx.current.createGain();
        bEnv.gain.setValueAtTime(0, bTime);
        bEnv.gain.linearRampToValueAtTime(bAmp * 1.5, bTime + 0.001);
        bEnv.gain.exponentialRampToValueAtTime(0.0001, bTime + 0.012);
        bSrc.connect(bFilt); bFilt.connect(bEnv); bEnv.connect(burstGain);
        bSrc.start(bTime); bSrc.stop(bTime + 0.04);
      }
    }
    if ((params.pitchModAmount ?? 0) > 0.01) {
      const modDepth = params.pitchModAmount;
      const modDecay = 0.05 + (1 - (params.pitchModFilter ?? 0.5)) * 0.4;
      filterBank.current.forEach((node, i) => {
        const curFreq = node.f1.frequency.value;
        const modFreq = curFreq * (1 + modDepth * 0.2 * (1 + i * 0.08));
        node.f1.frequency.setValueAtTime(modFreq, now);
        node.f1.frequency.setTargetAtTime(curFreq, now + 0.005, modDecay);
        node.f2.frequency.setValueAtTime(modFreq, now);
        node.f2.frequency.setTargetAtTime(curFreq, now + 0.005, modDecay);
      });
      obj1Bank.current.forEach((node, i) => {
        const curDelay = node.delay.delayTime.value;
        const modDelay = curDelay / (1 + modDepth * 0.15 * (1 + i * 0.06));
        node.delay.delayTime.setValueAtTime(modDelay, now);
        node.delay.delayTime.setTargetAtTime(curDelay, now + 0.005, modDecay);
      });
      obj2Bank.current.forEach((node, i) => {
        const curDelay = node.delay.delayTime.value;
        const modDelay = curDelay / (1 + modDepth * 0.12 * (1 + i * 0.05));
        node.delay.delayTime.setValueAtTime(modDelay, now);
        node.delay.delayTime.setTargetAtTime(curDelay, now + 0.005, modDecay);
      });
    }
  }

  return {
    get engineStarted() { return engineStarted; },
    get micState() { return micState; },
    get inputLevel() { return inputLevel; },
    currentPitchRef, ctx, initAudio, triggerNote, releaseNote, applyTuning,
    requestMic, releaseMic, updateRouting, updateCoupling,
    get compressor() { return compressor.current; },
  };
}
