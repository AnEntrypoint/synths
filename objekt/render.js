import { createAudioEngine } from './audio.js';
import { DEFAULT_PARAMS } from './constants.js';

export async function renderNote(params, freq, duration, sampleRate = 44100) {
  const mergedParams = { ...DEFAULT_PARAMS, ...params };
  const totalDuration = duration + 2;
  const length = Math.ceil(totalDuration * sampleRate);
  const offlineCtx = new OfflineAudioContext(2, length, sampleRate);
  const engine = createAudioEngine(() => {});
  await engine.initAudio(mergedParams, offlineCtx);
  engine.triggerNote(freq, mergedParams);
  setTimeout(() => engine.releaseNote(mergedParams), duration * 1000);
  const buffer = await offlineCtx.startRendering();
  return buffer;
}

export function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitsPerSample = 16;
  const blockAlign = numChannels * bitsPerSample / 8;
  const byteRate = sampleRate * blockAlign;
  const dataLength = buffer.length * blockAlign;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;
  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  const channels = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export async function renderPatch(params, notes, sampleRate = 44100) {
  const mergedParams = { ...DEFAULT_PARAMS, ...params };
  const lastNote = notes.reduce((max, n) => {
    const end = n.time + n.duration;
    return end > max ? end : max;
  }, 0);
  const totalDuration = lastNote + 3;
  const length = Math.ceil(totalDuration * sampleRate);
  const offlineCtx = new OfflineAudioContext(2, length, sampleRate);
  const engine = createAudioEngine(() => {});
  await engine.initAudio(mergedParams, offlineCtx);

  for (const note of notes) {
    const startSample = Math.floor(note.time * sampleRate);
    const endSample = Math.floor((note.time + note.duration) * sampleRate);
    offlineCtx.suspend(note.time).then(() => {
      engine.triggerNote(note.freq, mergedParams);
      offlineCtx.resume();
    });
    offlineCtx.suspend(note.time + note.duration).then(() => {
      engine.releaseNote(mergedParams);
      offlineCtx.resume();
    });
  }

  const buffer = await offlineCtx.startRendering();
  return audioBufferToWav(buffer);
}
