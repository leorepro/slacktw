// ===== Pure utility functions (unit-testable) =====
function computeProgress(scrollTop, scrollHeight, clientHeight) {
  const max = scrollHeight - clientHeight;
  if (max <= 0) return 0;
  const pct = (scrollTop / max) * 100;
  return Math.min(100, Math.max(0, pct));
}

function easeOutQuad(t) {
  return t * (2 - t);
}

function formatCounterValue(value, prefix, suffix) {
  const rounded = Math.round(value);
  const formatted = rounded >= 1000 ? rounded.toLocaleString('en-US') : String(rounded);
  return `${prefix || ''}${formatted}${suffix || ''}`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeProgress, easeOutQuad, formatCounterValue };
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {});
}
