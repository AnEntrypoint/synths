import WebAudioEngine from 'web-audio-engine';
import { createAudioEngine } from './objekt/audio.js';
import { PRESETS, DEFAULT_PARAMS } from './objekt/constants.js';
import { importPatch, exportPatch } from './objekt/patches.js';
import fs from 'fs';
import path from 'path';

const { OfflineAudioContext, RenderingAudioContext } = WebAudioEngine;

const NOTES = {
  'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
};

function parseNote(str) {
  const upper = str.toUpperCase().replace(/\s/g, '');
  if (NOTES[upper]) return NOTES[upper];
  const freq = parseFloat(str);
  if (!isNaN(freq) && freq > 0) return freq;
  const match = upper.match(/^([A-G])(#|B)?(\d)$/);
  if (match) {
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    let semitone = base[match[1]];
    if (match[2] === '#') semitone++;
    if (match[2] === 'B') semitone--;
    const octave = parseInt(match[3]);
    return 440 * Math.pow(2, (semitone - 9 + (octave - 4) * 12) / 12);
  }
  return null;
}

function writeWav(buffer, sampleRate, numChannels, filePath) {
  const bitsPerSample = 16;
  const blockAlign = numChannels * bitsPerSample / 8;
  const byteRate = sampleRate * blockAlign;
  const dataLength = buffer[0].length * blockAlign;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;
  const out = Buffer.alloc(totalLength);

  out.write('RIFF', 0);
  out.writeUInt32LE(totalLength - 8, 4);
  out.write('WAVE', 8);
  out.write('fmt ', 12);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(numChannels, 22);
  out.writeUInt32LE(sampleRate, 24);
  out.writeUInt32LE(byteRate, 28);
  out.writeUInt16LE(blockAlign, 32);
  out.writeUInt16LE(bitsPerSample, 34);
  out.write('data', 36);
  out.writeUInt32LE(dataLength, 40);

  let peak = 0;
  for (let ch = 0; ch < numChannels; ch++) {
    for (let i = 0; i < buffer[ch].length; i++) {
      const v = Math.abs(buffer[ch][i]);
      if (isFinite(v)) peak = Math.max(peak, v);
      else buffer[ch][i] = 0;
    }
  }
  const normGain = peak > 1.0 ? 0.95 / peak : 1.0;

  let offset = 44;
  for (let i = 0; i < buffer[0].length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const raw = isFinite(buffer[ch][i]) ? buffer[ch][i] : 0;
      const sample = Math.max(-1, Math.min(1, raw * normGain));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      out.writeInt16LE(Math.round(intSample), offset);
      offset += 2;
    }
  }

  fs.writeFileSync(filePath, out);
}

function printUsage() {
  console.log(`
Objekt Modeling Synthesizer - CLI Renderer

Usage:
  node cli.js [options]

Options:
  --preset <name>       Use factory preset (default: "Glass Wave")
  --patch <file.json>   Load patch from JSON file
  --note <note>         Note to play (e.g. C4, A3, 440) (default: A3)
  --duration <sec>      Note duration in seconds (default: 1.0)
  --tail <sec>          Tail/release time after note (default: 2.0)
  --output <file.wav>   Output file path (default: output.wav)
  --samplerate <hz>     Sample rate (default: 44100)
  --list-presets        List all factory presets
  --export-patch <name> Export a factory preset as JSON patch file
  --help                Show this help

Examples:
  node cli.js --preset "Church Bell" --note C4 --duration 2
  node cli.js --patch my-sound.json --note A3 --output bell.wav
  node cli.js --preset "Nylon Guitar" --note E3 --duration 0.5 --tail 3
  node cli.js --list-presets
  node cli.js --export-patch "Tibetan Bowl"
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  if (args.includes('--list-presets')) {
    console.log('Factory Presets:');
    Object.keys(PRESETS).forEach(name => console.log(`  ${name}`));
    process.exit(0);
  }

  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
  };

  if (args.includes('--export-patch')) {
    const name = getArg('--export-patch');
    if (!name || !PRESETS[name]) {
      console.error(`Unknown preset: ${name}`);
      console.error('Use --list-presets to see available presets');
      process.exit(1);
    }
    const params = { ...DEFAULT_PARAMS, ...PRESETS[name] };
    const json = exportPatch(params, name);
    const outFile = name.toLowerCase().replace(/\s+/g, '-') + '.json';
    fs.writeFileSync(outFile, json);
    console.log(`Exported: ${outFile}`);
    process.exit(0);
  }

  let params = { ...DEFAULT_PARAMS };
  let presetName = 'Glass Wave';

  const patchFile = getArg('--patch');
  if (patchFile) {
    const json = fs.readFileSync(patchFile, 'utf-8');
    const patch = importPatch(json);
    params = patch.params;
    presetName = patch.name;
    console.log(`Loaded patch: ${presetName}`);
  } else {
    const preset = getArg('--preset') || 'Glass Wave';
    if (!PRESETS[preset]) {
      console.error(`Unknown preset: ${preset}`);
      console.error('Use --list-presets to see available presets');
      process.exit(1);
    }
    params = { ...DEFAULT_PARAMS, ...PRESETS[preset] };
    presetName = preset;
  }

  const noteStr = getArg('--note') || 'A3';
  const freq = parseNote(noteStr);
  if (!freq) {
    console.error(`Invalid note: ${noteStr}`);
    process.exit(1);
  }

  const duration = parseFloat(getArg('--duration') || '1.0');
  const tail = parseFloat(getArg('--tail') || '2.0');
  const sampleRate = parseInt(getArg('--samplerate') || '44100');
  const outputFile = getArg('--output') || 'output.wav';
  const totalDuration = duration + tail;
  const totalSamples = Math.ceil(totalDuration * sampleRate);

  console.log(`Preset: ${presetName}`);
  console.log(`Note: ${noteStr} (${freq.toFixed(2)} Hz)`);
  console.log(`Duration: ${duration}s + ${tail}s tail = ${totalDuration}s`);
  console.log(`Sample rate: ${sampleRate} Hz`);
  console.log(`Output: ${outputFile}`);
  console.log('');
  console.log('Rendering...');

  const startTime = Date.now();
  const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);
  const engine = createAudioEngine(() => {});
  await engine.initAudio(params, offlineCtx);

  engine.triggerNote(freq, params);

  const releaseSample = Math.floor(duration * sampleRate);
  if (releaseSample < totalSamples) {
    offlineCtx.suspend(duration).then(() => {
      engine.releaseNote(params);
      offlineCtx.resume();
    });
  }

  const audioBuffer = await offlineCtx.startRendering();
  const elapsed = Date.now() - startTime;

  const channels = [];
  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
    channels.push(audioBuffer.getChannelData(ch));
  }

  writeWav(channels, sampleRate, audioBuffer.numberOfChannels, outputFile);

  const fileSizeKB = Math.round(fs.statSync(outputFile).size / 1024);
  console.log(`Done in ${elapsed}ms`);
  console.log(`Written: ${outputFile} (${fileSizeKB} KB)`);

  let peak = 0;
  for (let ch = 0; ch < channels.length; ch++) {
    for (let i = 0; i < channels[ch].length; i++) {
      peak = Math.max(peak, Math.abs(channels[ch][i]));
    }
  }
  const normalized = peak > 1.0;
  const normGain = normalized ? 0.95 / peak : 1.0;
  console.log(`Peak level: ${(peak * 100).toFixed(1)}%${normalized ? ` → normalized to -0.5 dBFS (gain: ${(normGain).toFixed(3)})` : ` (${(20 * Math.log10(peak)).toFixed(1)} dBFS)`}`);
}

main().catch(err => {
  console.error('Render error:', err);
  process.exit(1);
});
