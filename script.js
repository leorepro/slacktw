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

function initProgressBar() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;
  const update = () => {
    const pct = computeProgress(
      window.scrollY,
      document.documentElement.scrollHeight,
      window.innerHeight
    );
    bar.style.width = pct + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initNav() {
  const sections = document.querySelectorAll('main section[id]');
  const links = document.querySelectorAll('.nav-links a');
  if (!sections.length || !links.length) return;
  const linkFor = (id) => document.querySelector('.nav-links a[href="#' + id + '"]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => link.removeAttribute('aria-current'));
      const link = linkFor(entry.target.id);
      if (link) link.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  sections.forEach((section) => observer.observe(section));
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initProgressBar();
    initNav();
  });
}
