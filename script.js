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

function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach((item) => observer.observe(item));
}

function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate = (el) => {
    const target = Number(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    if (prefersReduced) {
      el.textContent = formatCounterValue(target, prefix, suffix);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const elapsed = Math.min(1, (now - start) / duration);
      const eased = easeOutQuad(elapsed);
      el.textContent = formatCounterValue(target * eased, prefix, suffix);
      if (elapsed < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach((el) => observer.observe(el));
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initProgressBar();
    initNav();
    initScrollReveal();
    initCounters();
  });
}
