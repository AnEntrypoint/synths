export function scheduleNodeCleanup(burstGain, maxDuration) {
  setTimeout(() => {
    try { burstGain.disconnect(); } catch (_) {}
  }, (maxDuration + 0.2) * 1000);
}
