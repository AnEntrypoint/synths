import { PRESETS, DEFAULT_PARAMS } from './constants.js';

const PATCH_VERSION = 1;

export function exportPatch(params, name) {
  const patch = {
    version: PATCH_VERSION,
    name: name || 'Untitled',
    timestamp: Date.now(),
    params: { ...params },
  };
  return JSON.stringify(patch, null, 2);
}

export function importPatch(json) {
  let data;
  try {
    data = typeof json === 'string' ? JSON.parse(json) : json;
  } catch (e) {
    throw new Error('Invalid patch JSON');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Patch data must be an object');
  }

  if (!data.params || typeof data.params !== 'object') {
    throw new Error('Patch missing params');
  }

  const merged = { ...DEFAULT_PARAMS };
  for (const [key, val] of Object.entries(data.params)) {
    if (key in merged) {
      merged[key] = val;
    }
  }

  return {
    name: data.name || 'Imported',
    version: data.version || 0,
    params: merged,
  };
}

export function listFactoryPatches() {
  return Object.keys(PRESETS);
}
