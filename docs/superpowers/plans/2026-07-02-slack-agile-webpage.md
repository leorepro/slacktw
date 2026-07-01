# 迎戰變局 Slack 敏捷簡報網頁 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page static website (`index.html` + `style.css` + `script.js`) that presents the content of the PDF deck《迎戰變局：用敏捷思維與 Slack，打造高適應力企業》as a scrollable, mobile-optimized page with micro-animations, plus the GitHub Actions workflow to auto-deploy it to GitHub Pages under the custom domain `slack.tw`.

**Architecture:** Pure static site, no build step, no framework. One `index.html` with semantic `<section>` blocks per content group, one `style.css` with a small design-token + component system, one `script.js` with a handful of pure (unit-testable) utility functions plus DOM wiring for nav highlighting, a scroll progress bar, scroll-reveal animation, and number count-up animation. Deployment is a static-file GitHub Actions workflow (`actions/upload-pages-artifact` + `actions/deploy-pages`), triggered on push to `main`.

**Tech Stack:** HTML5, CSS3 (custom properties, `clamp()`, CSS Grid, `IntersectionObserver`-driven classes), vanilla JavaScript (no libraries), Google Fonts (Noto Sans TC, ZCOOL KuaiLe), GitHub Actions, GitHub Pages.

## Global Constraints

- No build tools, bundlers, or frontend frameworks — plain HTML/CSS/JS only, per design spec §6.
- All content is Traditional Chinese (zh-Hant); mixed CJK/English text must not break mid-word (`overflow-wrap: break-word`, `line-break: strict`), per design spec §3.
- Brand colors are fixed: 茄紫 `#4A154B`, 藍 `#36C5F0`, 綠 `#2EB67D`, 紅 `#E01E5A`, 黃 `#ECB22E`, per design spec §2.
- Headline font: Google Fonts `ZCOOL KuaiLe`; body font: `Noto Sans TC`, per design spec §2.
- All animations (scroll reveal, counters, divider gradient) must respect `prefers-reduced-motion: reduce`, per design spec §5.
- Repo is already a git repo with remote `origin → https://github.com/leorepro/slacktw.git` (branch `main`). **Do not run `git push` or any other remote/GitHub operation** — commits stay local, per design spec §7.
- Two-column/multi-column grids must collapse to a single column at `max-width: 720px`; nav links collapse to a compact dot indicator at `max-width: 640px`, per design spec §3.
- Custom apex domain is `slack.tw` — a `CNAME` file containing exactly `slack.tw` must exist at the repo root, per design spec §7.

---

### Task 1: Project scaffold, design tokens, base layout

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `script.js`
- Create: `CNAME`

**Interfaces:**
- Produces: HTML skeleton with element IDs `progressBar`, `siteNav`, `navDot`, and `<section>` ids `hero`, `overview`, `part1`, `part2`, `part3`, `part4`, each containing a unique HTML comment anchor (`<!-- HERO_CONTENT -->`, `<!-- OVERVIEW_CONTENT -->`, `<!-- PART1_CONTENT -->`, `<!-- PART2_CONTENT -->`, `<!-- PART3_CONTENT -->`, `<!-- PART4_CONTENT -->`, `<!-- FOOTER_CONTENT -->`) that later tasks replace.
- Produces: CSS custom properties `--aubergine`, `--aubergine-deep`, `--blue`, `--green`, `--red`, `--yellow`, `--ink`, `--paper`, `--surface`, `--muted`; base classes `.section`, `.hero`, `.divider`, `.part`, `.kicker`, `.progress-bar`, `.site-nav`, `.nav-inner`, `.nav-brand`, `.nav-links`, `.nav-progress-dot`; base `h1`–`h4`, `p`, `li` typography.
- Produces: `script.js` with an empty `DOMContentLoaded` listener that later tasks extend.

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>迎戰變局：用敏捷思維與 Slack，打造高適應力企業</title>
  <meta name="description" content="從一家瀕臨破產的遊戲公司故事出發，看敏捷思維與 Slack 如何打造高適應力企業。">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=ZCOOL+KuaiLe&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="progress-bar" id="progressBar"></div>
  <header class="site-nav" id="siteNav">
    <div class="nav-inner">
      <span class="nav-brand">迎戰變局</span>
      <nav class="nav-links" aria-label="章節導覽">
        <a href="#part1">01 破冰開場</a>
        <a href="#part2">02 為什麼要敏捷</a>
        <a href="#part3">03 敏捷看 Slack</a>
        <a href="#part4">04 結語交棒</a>
      </nav>
      <div class="nav-progress-dot" id="navDot" aria-hidden="true"></div>
    </div>
  </header>
  <main>
    <section id="hero" class="hero">
      <!-- HERO_CONTENT -->
    </section>
    <section id="overview" class="section">
      <!-- OVERVIEW_CONTENT -->
    </section>
    <section id="part1" class="part">
      <!-- PART1_CONTENT -->
    </section>
    <section id="part2" class="part">
      <!-- PART2_CONTENT -->
    </section>
    <section id="part3" class="part">
      <!-- PART3_CONTENT -->
    </section>
    <section id="part4" class="part">
      <!-- PART4_CONTENT -->
    </section>
  </main>
  <footer class="site-footer">
    <!-- FOOTER_CONTENT -->
  </footer>
  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `style.css`**

```css
/* ===== Reset & Base ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, 'PingFang TC', 'Microsoft JhengHei', sans-serif;
  color: var(--ink);
  background: var(--paper);
  line-height: 1.75;
  overflow-wrap: break-word;
  line-break: strict;
  word-break: normal;
}
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
ul { list-style: none; }

/* ===== Design Tokens ===== */
:root {
  --aubergine: #4A154B;
  --aubergine-deep: #2a0c2c;
  --blue: #36C5F0;
  --green: #2EB67D;
  --red: #E01E5A;
  --yellow: #ECB22E;
  --ink: #1d1c1d;
  --paper: #ffffff;
  --surface: #faf8fb;
  --muted: #6b6b6b;
}

/* ===== Typography ===== */
h1, h2, h3 {
  font-family: 'ZCOOL KuaiLe', 'Noto Sans TC', sans-serif;
  font-weight: 400;
  color: var(--aubergine);
  line-height: 1.3;
}
h1 { font-size: clamp(2.2rem, 7vw, 4rem); }
h2 { font-size: clamp(1.8rem, 5.5vw, 3rem); }
h3 { font-size: clamp(1.3rem, 3.5vw, 1.9rem); margin-bottom: 1rem; }
h4 {
  font-family: 'Noto Sans TC', sans-serif;
  font-weight: 700;
  color: var(--aubergine);
  font-size: clamp(1.05rem, 2.5vw, 1.3rem);
  margin-bottom: 0.5rem;
}
p { font-size: clamp(1rem, 2.2vw, 1.15rem); color: #2b2b2b; margin-bottom: 0.75rem; }
li { font-size: clamp(1rem, 2.2vw, 1.15rem); color: #2b2b2b; margin-bottom: 0.6rem; }
.kicker {
  display: inline-block;
  font-size: 0.85rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--red);
  font-weight: 700;
  margin-bottom: 1rem;
}

/* ===== Layout ===== */
.section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 5rem 6vw;
}
.hero, .divider {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8vh 8vw;
  color: #fff;
  position: relative;
  overflow: hidden;
  background-size: 200% 200%;
}
.hero { min-height: 100vh; }
.part { display: block; }

/* ===== Sticky Nav & Progress Bar ===== */
.progress-bar {
  position: fixed;
  top: 0; left: 0;
  height: 3px;
  width: 0%;
  background: linear-gradient(90deg, var(--blue), var(--green), var(--yellow), var(--red));
  z-index: 60;
  transition: width 0.1s linear;
}
.site-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #ececec;
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 6vw;
  max-width: 1200px;
  margin: 0 auto;
}
.nav-brand {
  font-family: 'ZCOOL KuaiLe', sans-serif;
  color: var(--aubergine);
  font-size: 1.1rem;
}
.nav-links {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  font-weight: 700;
}
.nav-links a {
  color: var(--muted);
  padding: 0.25rem 0;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
}
.nav-links a[aria-current="true"] {
  color: var(--aubergine);
  border-bottom-color: var(--red);
}
.nav-progress-dot {
  display: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--red);
}
@media (max-width: 640px) {
  .nav-links { display: none; }
  .nav-progress-dot { display: block; }
}
```

- [ ] **Step 3: Create `script.js`**

```js
document.addEventListener('DOMContentLoaded', () => {});
```

- [ ] **Step 4: Create `CNAME`**

```
slack.tw
```

- [ ] **Step 5: Verify the scaffold serves correctly**

Run:
```bash
cd /Users/leochiang/slacktw
python3 -m http.server 8931 &
sleep 1
curl -s http://localhost:8931/index.html | grep -c 'id="hero"'
curl -s http://localhost:8931/index.html | grep -c 'id="part4"'
curl -s http://localhost:8931/style.css | grep -c -- '--aubergine: #4A154B;'
cat CNAME
kill %1
```
Expected: first two `grep -c` calls print `1`, third prints `1`, `cat CNAME` prints `slack.tw`.

- [ ] **Step 6: Commit**

```bash
git add index.html style.css script.js CNAME
git commit -m "Scaffold static site: base HTML skeleton, design tokens, CNAME"
```

---

### Task 2: Shared component CSS + JS pure utilities with unit tests

**Files:**
- Modify: `style.css` (append)
- Modify: `script.js` (insert utility functions before the `DOMContentLoaded` listener)
- Create: `script.test.js`

**Interfaces:**
- Consumes: CSS custom properties and base classes from Task 1.
- Produces CSS classes used by every later content task: `.hero-sub`, `.reveal`/`.is-visible`, `.divider--purple`, `.divider--teal`, `.divider__num`, `.dots`/`.d1`–`.d4`, `.hl`, `.hl-green`, `.hl-yellow`, `.quote-block`/`.quote-en`, `.num`, `.stat-grid`/`.stat-block`/`.label`, `.source-line`, `.compare-grid`/`.compare-card`/`.compare-card--highlight`, `.pain-value-grid`/`.card`/`.card--value`, `.pill`/`.pill--pain`/`.pill--value`, `.tag-pills`/`.tag-pill`, `.bullet-grid`, `.statement-banner`/`--green`/`--pink`/`--purple-dark`, `.case-study`/`--teal`, `.trio-grid`/`.trio-card`/`.trio-card--highlight`, `.agenda-grid`/`.agenda-step`/`.t`, `.site-footer`/`.footer-grid`.
- Produces JS pure functions (importable from `script.js` in Node, available globally in the browser): `computeProgress(scrollTop, scrollHeight, clientHeight) -> number`, `easeOutQuad(t) -> number`, `formatCounterValue(value, prefix, suffix) -> string`.

- [ ] **Step 1: Write the failing unit test file `script.test.js`**

```js
const assert = require('assert');
const { computeProgress, easeOutQuad, formatCounterValue } = require('./script.js');

// computeProgress
assert.strictEqual(computeProgress(0, 1000, 500), 0);
assert.strictEqual(computeProgress(500, 1000, 500), 100);
assert.strictEqual(computeProgress(250, 1000, 500), 50);
assert.strictEqual(computeProgress(-50, 1000, 500), 0, 'clamps below 0');
assert.strictEqual(computeProgress(9999, 1000, 500), 100, 'clamps above 100');
assert.strictEqual(computeProgress(100, 500, 500), 0, 'no scrollable area returns 0');

// easeOutQuad
assert.strictEqual(easeOutQuad(0), 0);
assert.strictEqual(easeOutQuad(1), 1);
assert.ok(Math.abs(easeOutQuad(0.5) - 0.75) < 1e-9);

// formatCounterValue
assert.strictEqual(formatCounterValue(32, '-', '%'), '-32%');
assert.strictEqual(formatCounterValue(1200, '~', ''), '~1,200');
assert.strictEqual(formatCounterValue(4, '', 'x'), '4x');
assert.strictEqual(formatCounterValue(90, '70–', '%'), '70–90%');

console.log('All script.js unit tests passed.');
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node script.test.js`
Expected: `Error: Cannot find module './script.js'` style failure, or a `TypeError` because `computeProgress` is `undefined` (since `script.js` does not export anything yet).

- [ ] **Step 3: Insert the pure utility functions into `script.js`**

Modify `script.js` — replace the entire file content with:

```js
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

document.addEventListener('DOMContentLoaded', () => {});
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node script.test.js`
Expected: prints `All script.js unit tests passed.` and exits with status `0`. (The `document.addEventListener` line only runs in a browser; Node never reaches it because the script exports before that line executes without error — `document` is undefined in Node, so also run the following sanity check to confirm the module load itself doesn't throw: `node -e "require('./script.js')"` should fail with `document is not defined`, which is expected and harmless because the test file only calls the three exported functions, not `DOMContentLoaded`. This is fine as-is since `require()` in the test still executes top-to-bottom and hits `document.addEventListener` — to avoid that crash, guard it.)

Re-edit `script.js`'s last line to guard against non-browser environments:

```js
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {});
}
```

Run again: `node script.test.js`
Expected: prints `All script.js unit tests passed.` and exits with status `0`.

- [ ] **Step 5: Append the shared component CSS to `style.css`**

Modify `style.css` — append at the end of the file:

```css

/* ===== Hero ===== */
.hero-sub {
  font-size: clamp(1.1rem, 3vw, 1.6rem);
  color: #e9d5ec;
  margin-top: 0.5rem;
  max-width: 50ch;
}

/* ===== Reveal & Reduced Motion ===== */
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}
.reveal.is-visible {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .reveal { transition: none; opacity: 1; transform: none; }
  .hero, .divider { animation: none !important; }
}

/* ===== Divider Variants ===== */
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.hero, .divider {
  animation: gradientShift 18s ease infinite;
}
.divider--purple, .hero {
  background-image: linear-gradient(135deg, var(--aubergine) 0%, #611f69 45%, var(--aubergine-deep) 100%);
}
.divider--teal {
  background-image: linear-gradient(135deg, var(--green) 0%, var(--blue) 100%);
}
.divider__num {
  position: absolute;
  right: 4vw;
  top: 4vh;
  font-size: clamp(6rem, 20vw, 13rem);
  font-weight: 900;
  color: rgba(255, 255, 255, 0.12);
  font-family: 'Noto Sans TC', sans-serif;
  line-height: 1;
  pointer-events: none;
}
.divider .kicker { color: var(--yellow); }
.divider h2, .divider h3 { color: #fff; }
.divider p { color: #f1e4f2; }
.dots { display: flex; gap: 0.7rem; margin-bottom: 1.5rem; }
.dots span { width: 16px; height: 16px; border-radius: 50%; }
.dots .d1 { background: var(--blue); }
.dots .d2 { background: var(--green); }
.dots .d3 { background: var(--red); }
.dots .d4 { background: var(--yellow); }

/* ===== Text Highlights ===== */
.hl { color: var(--red); font-weight: 700; }
.hl-green { color: var(--green); font-weight: 700; }
.hl-yellow { color: var(--yellow); font-weight: 700; }

/* ===== Quote Block ===== */
.quote-block {
  background: var(--aubergine);
  color: #fff;
  border-left: 8px solid var(--yellow);
  border-radius: 16px;
  padding: 2.5rem clamp(1.5rem, 4vw, 3rem);
  margin: 2rem auto;
  max-width: 1100px;
}
.quote-block h3 { color: #fff; }
.quote-block .quote-en { color: #d9b8e0; font-size: 1rem; margin: 0.75rem 0; }
.quote-block p { color: #f1e4f2; }

/* ===== Numbers & Stat Grid ===== */
.num {
  font-size: clamp(2.2rem, 6vw, 3.6rem);
  font-weight: 900;
  line-height: 1;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 2rem;
  margin: 1.5rem 0;
}
.stat-block .num { color: var(--green); }
.stat-block .label { color: var(--muted); font-size: 0.95rem; margin-top: 0.5rem; }
.source-line { color: #b3b3b3; font-size: 0.8rem; margin-top: 1rem; }

/* ===== Compare Grid ===== */
.compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin: 1.5rem 0;
}
.compare-card {
  border: 2px solid #ececec;
  border-radius: 16px;
  padding: 1.75rem;
  background: var(--surface);
}
.compare-card--highlight {
  background: var(--aubergine);
  color: #fff;
  border: none;
}
.compare-card--highlight h4 { color: #fff; }
.compare-card--highlight .kicker { color: var(--yellow); }
.compare-card--highlight p { color: #f1e4f2; }

/* ===== Pain / Value Grid ===== */
.pain-value-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin: 1.5rem 0;
}
.pain-value-grid .card {
  border: 2px solid #ececec;
  border-radius: 16px;
  padding: 1.75rem;
  background: var(--surface);
}
.pain-value-grid .card--value {
  background: #eafaf3;
  border-color: #cdeee1;
}
.pill {
  display: inline-block;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
}
.pill--pain { background: var(--red); color: #fff; }
.pill--value { background: var(--green); color: #fff; }

/* ===== Tag Pills / Bullet Grid ===== */
.tag-pills { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
.tag-pill {
  background: var(--surface);
  border: 1px solid #ececec;
  border-radius: 999px;
  padding: 0.5rem 1.1rem;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--aubergine);
}
.bullet-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 3rem;
  margin-top: 1.5rem;
}
.bullet-grid li { padding-left: 1.2rem; position: relative; }
.bullet-grid li::before {
  content: '';
  position: absolute;
  left: 0; top: 0.6em;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--blue);
}

/* ===== Statement Banner ===== */
.statement-banner {
  padding: 4rem 6vw;
}
.statement-banner h3, .statement-banner .num, .statement-banner p {
  color: #fff;
}
.statement-banner--green { background: var(--green); }
.statement-banner--pink { background: var(--red); }
.statement-banner--purple-dark { background: var(--aubergine-deep); }
.statement-banner--purple-dark .num { color: var(--yellow); }

/* ===== Case Study Callout ===== */
.case-study {
  background: var(--surface);
  border-radius: 16px;
  padding: 2rem clamp(1.5rem, 4vw, 2.5rem);
  margin-top: 2rem;
}
.case-study--teal {
  background: linear-gradient(135deg, var(--green), var(--blue));
  color: #fff;
}
.case-study--teal h4, .case-study--teal p { color: #fff; }
.case-study--teal .kicker { color: #fff; opacity: 0.85; }

/* ===== Trio Grid (soul/nerve/brain) ===== */
.trio-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 1.5rem;
}
.trio-card {
  background: var(--surface);
  border-radius: 16px;
  padding: 1.75rem;
}
.trio-card:nth-child(2) h4 { color: var(--green); }
.trio-card--highlight {
  background: var(--aubergine);
  color: #fff;
}
.trio-card--highlight h4 { color: #fff; }
.trio-card--highlight .kicker { color: var(--yellow); }
.trio-card--highlight p { color: #f1e4f2; }

/* ===== Agenda Grid ===== */
.agenda-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
}
.agenda-step {
  display: block;
  border-top: 5px solid var(--aubergine);
  padding-top: 1rem;
  color: inherit;
}
.agenda-step:nth-child(1) { border-top-color: var(--blue); }
.agenda-step:nth-child(2) { border-top-color: var(--green); }
.agenda-step:nth-child(3) { border-top-color: var(--red); }
.agenda-step:nth-child(4) { border-top-color: var(--yellow); }
.agenda-step .t { font-size: 0.85rem; color: var(--red); font-weight: 700; margin-bottom: 0; }
.agenda-step h4 { margin: 0.4rem 0; }

/* ===== Footer ===== */
.site-footer {
  background: var(--surface);
  padding: 4rem 6vw;
  color: var(--muted);
}
.footer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem 3rem;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

/* ===== Responsive Collapse (must stay last so it wins the cascade) ===== */
@media (max-width: 720px) {
  .compare-grid,
  .pain-value-grid,
  .bullet-grid,
  .trio-grid,
  .agenda-grid,
  .footer-grid,
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Verify the new classes are present**

Run:
```bash
cd /Users/leochiang/slacktw
grep -c '\.reveal {' style.css
grep -c '\.stat-grid {' style.css
grep -c '\.pain-value-grid {' style.css
grep -c '@media (max-width: 720px)' style.css
```
Expected: each command prints `1`.

- [ ] **Step 7: Commit**

```bash
git add style.css script.js script.test.js
git commit -m "Add shared component CSS system and unit-tested JS utilities"
```

---

### Task 3: Hero + Overview content

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `.hero-sub`, `.dots`/`.d1`–`.d4`, `.kicker`, `.agenda-grid`/`.agenda-step`/`.t`, `.reveal` from Task 2.
- Produces: filled `#hero` and `#overview` sections; the four `.agenda-step` links anchor to `#part1`–`#part4` (consumed visually by Task 8's nav highlighting, no code dependency).

- [ ] **Step 1: Replace the hero anchor**

Modify `index.html` — find:
```html
    <section id="hero" class="hero">
      <!-- HERO_CONTENT -->
    </section>
```
Replace with:
```html
    <section id="hero" class="hero">
      <div class="dots"><span class="d1"></span><span class="d2"></span><span class="d3"></span><span class="d4"></span></div>
      <p class="kicker">敏捷思維 × SLACK 導入分享</p>
      <h1>迎戰變局</h1>
      <p class="hero-sub">用敏捷思維與 Slack，打造高適應力企業</p>
    </section>
```

- [ ] **Step 2: Replace the overview anchor**

Modify `index.html` — find:
```html
    <section id="overview" class="section">
      <!-- OVERVIEW_CONTENT -->
    </section>
```
Replace with:
```html
    <section id="overview" class="section">
      <p class="kicker reveal">今天的 45 分鐘</p>
      <h2 class="reveal">四段旅程，一個結論</h2>
      <p class="reveal">從一家瀕臨破產的遊戲公司故事出發，理解為什麼「敏捷」已是企業的生存戰略，再看 Slack 如何成為敏捷的數位神經系統。</p>
      <div class="agenda-grid reveal">
        <a class="agenda-step" href="#part1">
          <p class="t">PART 1・約 5 分鐘</p>
          <h4>破冰開場</h4>
          <p>Slack 本身就是敏捷最佳代言人</p>
        </a>
        <a class="agenda-step" href="#part2">
          <p class="t">PART 2・約 12 分鐘</p>
          <h4>為什麼要敏捷</h4>
          <p>傳統管理模式的困境</p>
        </a>
        <a class="agenda-step" href="#part3">
          <p class="t">PART 3・約 20 分鐘</p>
          <h4>敏捷看 Slack</h4>
          <p>導入 Slack 的四大必要性</p>
        </a>
        <a class="agenda-step" href="#part4">
          <p class="t">PART 4・約 8 分鐘</p>
          <h4>結語交棒</h4>
          <p>從敏捷基底走向 AI 賦能</p>
        </a>
      </div>
    </section>
```

- [ ] **Step 3: Verify content is present**

Run:
```bash
cd /Users/leochiang/slacktw
grep -c '迎戰變局</h1>' index.html
grep -c '四段旅程，一個結論' index.html
grep -c 'href="#part4"' index.html
```
Expected: each prints `1`.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Add hero and overview sections"
```

---

### Task 4: Part 1 content (破冰開場)

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `.divider`/`.divider--purple`/`.divider__num`, `.hl`/`.hl-green`/`.hl-yellow`, `.compare-grid`/`.compare-card`/`.compare-card--highlight`, `.stat-grid`/`.stat-block`, `.source-line`, `.quote-block`/`.quote-en`, `.reveal` from Task 2.

- [ ] **Step 1: Replace the Part 1 anchor**

Modify `index.html` — find:
```html
    <section id="part1" class="part">
      <!-- PART1_CONTENT -->
    </section>
```
Replace with:
```html
    <section id="part1" class="part">
      <div class="divider divider--purple">
        <span class="divider__num">01</span>
        <p class="kicker">PART 1 · 破冰開場</p>
        <h2>Slack 本身，就是一場敏捷轉向</h2>
      </div>
      <div class="section">
        <h3 class="reveal">你每天在用的工具，出身一家快倒閉的公司</h3>
        <p class="reveal">Slack 並不是一開始就叫 Slack——它誕生於一家<span class="hl">押錯賭注的遊戲公司</span>。</p>
      </div>
      <div class="section">
        <p class="kicker reveal">PART 1 · 2011–2012</p>
        <h3 class="reveal">Glitch：一場押錯平台的豪賭</h3>
        <ul class="reveal">
          <li>Tiny Speck 推出線上遊戲 Glitch，技術押注在 Adobe Flash 上。</li>
          <li>使用者大舉轉向手機，Flash 走入歷史。</li>
          <li>2012 年，遊戲正式<span class="hl">關閉</span>。</li>
        </ul>
      </div>
      <div class="section">
        <p class="kicker reveal">PART 1 · 關鍵的一步</p>
        <h3 class="reveal">關鍵的一步：轉向 (Pivot)</h3>
        <div class="compare-grid reveal">
          <div class="compare-card">
            <p class="kicker">原本</p>
            <h4>一款失敗的遊戲</h4>
            <p>工程師為了協作，自建了一套內部即時通訊工具。</p>
          </div>
          <div class="compare-card compare-card--highlight">
            <p class="kicker">轉向之後</p>
            <h4>公司改名為 Slack</h4>
            <p>把「附屬品」變成主角——盤點資產時，看見了它真正的價值。</p>
          </div>
        </div>
        <p class="reveal">他們沒有死守原計畫，而是跟著現實快速調整方向——<span class="hl-green">這，就是敏捷。</span></p>
      </div>
      <div class="section">
        <p class="kicker reveal">PART 1 · 轉向的回報</p>
        <h3 class="reveal">史上最快的獨角獸之一</h3>
        <div class="stat-grid reveal">
          <div class="stat-block">
            <p class="num">15K→1.1M</p>
            <p class="label">日活躍用戶（2013 上線 → 2015/6）</p>
          </div>
          <div class="stat-block">
            <p class="num">$27.7B</p>
            <p class="label">2020 年被 Salesforce 收購</p>
          </div>
          <div class="stat-block">
            <p class="num">最快</p>
            <p class="label">達成十億美元估值的獨角獸之一</p>
          </div>
        </div>
        <p class="source-line">來源：TechCrunch、Building Slack、Startup Archive、SitePoint</p>
      </div>
      <div class="quote-block reveal">
        <h3>計畫去適應，否則就是計畫失敗。</h3>
        <p class="quote-en">Plan to adapt — because if you don't plan to adapt, you do plan to fail.</p>
        <p>在充滿變數的環境中，生存的關鍵不是一份完美的長期計畫，而是<span class="hl-yellow">隨時適應變化的能力</span>。</p>
      </div>
    </section>
```

- [ ] **Step 2: Verify content is present**

Run:
```bash
cd /Users/leochiang/slacktw
grep -c 'Slack 本身，就是一場敏捷轉向' index.html
grep -c 'Glitch：一場押錯平台的豪賭' index.html
grep -c '計畫去適應，否則就是計畫失敗。' index.html
```
Expected: each prints `1`.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add Part 1 content: 破冰開場"
```

---

### Task 5: Part 2 content (為什麼要敏捷)

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `.divider`/`.divider--purple`, `.tag-pills`/`.tag-pill`, `.bullet-grid`, `.statement-banner`/`--green`/`--pink`, `.num`, `.quote-block`, `.compare-grid`/`.compare-card`/`.compare-card--highlight`, `.hl`/`.hl-green`/`.hl-yellow`, `.reveal` from Task 2.
- Produces: a `.counter` element with `data-target="90"`, `data-prefix="70–"`, `data-suffix="%"` inside `#part2` — this is the first `.counter` element in the page; Task 9's `initCounters()` will animate it.

- [ ] **Step 1: Replace the Part 2 anchor**

Modify `index.html` — find:
```html
    <section id="part2" class="part">
      <!-- PART2_CONTENT -->
    </section>
```
Replace with:
```html
    <section id="part2" class="part">
      <div class="divider divider--purple">
        <span class="divider__num">02</span>
        <p class="kicker">PART 2 · 為什麼要敏捷</p>
        <h2>傳統管理模式，正在拖慢你的組織</h2>
      </div>
      <div class="section">
        <p class="kicker reveal">PART 2 · 環境</p>
        <h3 class="reveal">我們活在「黑天鵝」常態化的世界</h3>
        <p class="reveal">過去罕見的「黑天鵝事件」，現在感覺像<span class="hl">永無止境的日常</span>。</p>
        <div class="tag-pills reveal">
          <span class="tag-pill">疫情衝擊</span>
          <span class="tag-pill">供應鏈中斷</span>
          <span class="tag-pill">金融震盪</span>
          <span class="tag-pill">AI 顛覆</span>
        </div>
      </div>
      <div class="section">
        <p class="kicker reveal">PART 2 · 環境</p>
        <h3 class="reveal">不確定性，是新的營運背景</h3>
        <ul class="bullet-grid reveal">
          <li>企業面對的是<strong>持續性危機</strong>與高度變動的環境。</li>
          <li>不確定性<strong>不再是例外</strong>，而是預設的背景。</li>
          <li>長期計畫的<strong>有效期</strong>，正在快速縮短。</li>
          <li>反應速度，成為新的<strong>競爭門檻</strong>。</li>
        </ul>
      </div>
      <div class="statement-banner statement-banner--green reveal">
        <h3>能存活的，不是最強或最大的企業——而是最能適應的企業。</h3>
      </div>
      <div class="quote-block reveal">
        <h3>為什麼我們非得一年做一次預算和績效考核？只因為地球繞太陽一圈要一年嗎？</h3>
        <p>客戶的需求與市場的變化，<span class="hl-yellow">絕不會乖乖配合企業的年度週期</span>。</p>
      </div>
      <div class="section">
        <p class="kicker reveal">PART 2 · 傳統管理的困境</p>
        <h3 class="reveal">「命令與控制」的致命假設</h3>
        <p class="reveal">傳統管理試圖在專案最初期，就完美預測客戶 <span class="hl">1～2 年後</span>的需求。在今天，這幾乎<span class="hl">不可能</span>。</p>
      </div>
      <div class="statement-banner statement-banner--pink reveal">
        <p class="kicker">PART 2 · 一個殘酷的數字</p>
        <p class="num"><span class="counter" data-target="90" data-prefix="70–" data-suffix="%">70–0%</span></p>
        <p>的商業創新最終失敗——大多因為過度依賴專案最初的那一份預測。</p>
      </div>
      <div class="section">
        <p class="kicker reveal">PART 2 · 敏捷的主張</p>
        <h3 class="reveal">與其賭一個大預測——不如小步快跑</h3>
        <div class="compare-grid reveal">
          <div class="compare-card">
            <p class="kicker">傳統</p>
            <h4>一次性大計畫</h4>
            <p>前期定死範圍，一路執行到底，發現錯誤時往往為時已晚。</p>
          </div>
          <div class="compare-card compare-card--highlight">
            <p class="kicker">敏捷</p>
            <h4>小步快跑・頻繁交付・持續修正</h4>
            <p>用一次次真實回饋取代猜測，讓方向在過程中被校正。</p>
          </div>
        </div>
      </div>
      <div class="section">
        <p class="kicker reveal">PART 2 · 小結二</p>
        <h3 class="reveal">企業需要兩種能力</h3>
        <div class="compare-grid reveal">
          <div class="compare-card">
            <h4>維持營運</h4>
            <p>降低變異、追求效率與穩定。這是必要的，但<span class="hl">不足以應對變局</span>。</p>
          </div>
          <div class="compare-card compare-card--highlight">
            <h4>改變企業</h4>
            <p>創新與適應——快速實驗、快速學習、快速調整。這正是<span class="hl-yellow">敏捷的核心</span>。</p>
          </div>
        </div>
        <p class="reveal">問題是：組織要靠什麼，讓「改變企業」的能力真正<span class="hl-green">流動起來</span>？</p>
      </div>
    </section>
```

- [ ] **Step 2: Verify content is present**

Run:
```bash
cd /Users/leochiang/slacktw
grep -c '傳統管理模式，正在拖慢你的組織' index.html
grep -c 'data-target="90"' index.html
grep -c '企業需要兩種能力' index.html
```
Expected: each prints `1`.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add Part 2 content: 為什麼要敏捷"
```

---

### Task 6: Part 3 content (敏捷看 Slack)

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `.divider`/`.divider--purple`/`.divider--teal`/`.divider__num`, `.agenda-grid`/`.agenda-step`, `.pain-value-grid`/`.card`/`.card--value`/`.pill--pain`/`.pill--value`, `.stat-grid`, `.source-line`, `.case-study`/`--teal`, `.hl-green`, `.reveal` from Task 2.
- Produces: `<section id="solution-1">`–`<section id="solution-4">` anchors, each with a `.counter` element for its numeric stats — consumed visually by Task 9's `initCounters()`.

- [ ] **Step 1: Replace the Part 3 anchor**

Modify `index.html` — find:
```html
    <section id="part3" class="part">
      <!-- PART3_CONTENT -->
    </section>
```
Replace with:
```html
    <section id="part3" class="part">
      <div class="divider divider--teal">
        <p class="kicker">PART 3 · 敏捷看 SLACK</p>
        <h2>Slack = 敏捷的數位神經系統</h2>
        <p>接下來，把敏捷的四大痛點，對應到 Slack 的四種解法。</p>
      </div>
      <div class="divider divider--purple">
        <span class="divider__num">03</span>
        <p class="kicker">PART 3 · 敏捷看 SLACK</p>
        <h2>四大痛點，對應四種解法</h2>
      </div>
      <div class="section">
        <p class="kicker reveal">PART 3 · 地圖</p>
        <h3 class="reveal">一個痛點，一種解法</h3>
        <div class="agenda-grid reveal">
          <a class="agenda-step" href="#solution-1"><p class="t">01</p><h4>跨部門協作</h4><p>打破穀倉，資訊透明</p></a>
          <a class="agenda-step" href="#solution-2"><p class="t">02</p><h4>消除切換成本</h4><p>整合工具，專注目標</p></a>
          <a class="agenda-step" href="#solution-3"><p class="t">03</p><h4>賦能團隊</h4><p>從微觀管理到排除障礙</p></a>
          <a class="agenda-step" href="#solution-4"><p class="t">04</p><h4>以客戶為中心</h4><p>零時差的回饋循環</p></a>
        </div>
      </div>
      <div class="section" id="solution-1">
        <p class="kicker reveal">01 解法一 · 跨部門協作</p>
        <h3 class="reveal">打破穀倉，實現跨部門協作</h3>
        <div class="pain-value-grid reveal">
          <div class="card">
            <span class="pill pill--pain">敏捷痛點</span>
            <p>敏捷團隊必須跨職能，把不同部門的人聚在一起。但 Email 把資訊鎖在個人收件匣裡。</p>
          </div>
          <div class="card card--value">
            <span class="pill pill--value">Slack 價值</span>
            <p><strong>頻道 Channels</strong> 打破資訊孤島，跨部門專案完全透明，所有人都在<strong>同一個語境</strong>下協作。</p>
          </div>
        </div>
        <div class="stat-grid reveal">
          <div class="stat-block">
            <p class="num"><span class="counter" data-target="32" data-prefix="-" data-suffix="%">-0%</span></p>
            <p class="label">導入後內部 Email 量平均下降</p>
          </div>
          <div class="stat-block">
            <p class="num"><span class="counter" data-target="33" data-prefix="+" data-suffix="%">+0%</span></p>
            <p class="label">團隊一致性提升</p>
          </div>
        </div>
        <p class="source-line">來源：Slack 官方數據</p>
        <div class="case-study reveal">
          <p class="kicker">解法一 · 案例</p>
          <h4>IBM：把整條交付流程搬進頻道</h4>
          <ul>
            <li>PR、建置、部署告警集中在公開頻道。</li>
            <li>出事時立刻開事件專屬頻道，即時協作。</li>
            <li>全程留下完整稽核軌跡，事後可回溯。</li>
          </ul>
          <p class="source-line">來源：IBM 客戶案例（slack.com/customer-stories）</p>
        </div>
      </div>
      <div class="section" id="solution-2">
        <p class="kicker reveal">02 解法二 · 消除切換成本</p>
        <h3 class="reveal">消除切換成本，專注於重要目標</h3>
        <div class="pain-value-grid reveal">
          <div class="card">
            <span class="pill pill--pain">敏捷痛點</span>
            <p><strong>多工會讓人變笨</strong>。員工在多個專案與工具間切換，大量時間浪費在「切換成本」上。</p>
          </div>
          <div class="card card--value">
            <span class="pill pill--value">Slack 價值</span>
            <p>整合 <strong>Google Drive、Jira、Salesforce</strong>，通知與操作都在 Slack 完成，不必在十幾個視窗間跳來跳去。</p>
          </div>
        </div>
        <div class="stat-grid reveal">
          <div class="stat-block">
            <p class="num">~1,200</p>
            <p class="label">數位工作者每天切換 App 的次數</p>
          </div>
          <div class="stat-block">
            <p class="num"><span class="counter" data-target="23" data-prefix="" data-suffix="分">0分</span></p>
            <p class="label">被打斷後重新專注所需的平均時間</p>
          </div>
          <div class="stat-block">
            <p class="num"><span class="counter" data-target="47" data-prefix="+" data-suffix="%">+0%</span></p>
            <p class="label">導入 Slack 後的生產力提升</p>
          </div>
        </div>
        <p class="source-line">來源：Slack 生產力研究；context switching 統計（Moveworks、Speakwise 等）</p>
      </div>
      <div class="section" id="solution-3">
        <p class="kicker reveal">03 解法三 · 賦能團隊</p>
        <h3 class="reveal">主管從「微觀管理」轉為「排除障礙」</h3>
        <div class="pain-value-grid reveal">
          <div class="card">
            <span class="pill pill--pain">敏捷痛點</span>
            <p>傳統主管把大量時間花在<strong>微觀管理</strong>——開會、審查進度。敏捷領導者該做的，是為團隊排除障礙。</p>
          </div>
          <div class="card card--value">
            <span class="pill pill--value">Slack 價值</span>
            <p>頻道透明讓主管能隨時<strong>掌握</strong>進度而不必<strong>干預</strong>。團隊遇阻立刻在群組呼叫支援，主管迅速介入。</p>
          </div>
        </div>
        <div class="stat-grid reveal">
          <div class="stat-block">
            <p class="num"><span class="counter" data-target="27" data-prefix="-" data-suffix="%">-0%</span></p>
            <p class="label">會議時間減少</p>
          </div>
          <div class="stat-block">
            <p class="num"><span class="counter" data-target="23" data-prefix="+" data-suffix="%">+0%</span></p>
            <p class="label">決策速度加快</p>
          </div>
        </div>
        <p class="reveal">掌握，不等於干預。<span class="hl-green">透明，讓信任與授權成為可能。</span></p>
      </div>
      <div class="section" id="solution-4">
        <p class="kicker reveal">04 解法四 · 以客戶為中心</p>
        <h3 class="reveal">從「以老闆為中心」到「以客戶為中心」</h3>
        <div class="pain-value-grid reveal">
          <div class="card">
            <span class="pill pill--pain">敏捷痛點</span>
            <p>敏捷需要頻繁把原型交給客戶、取得回饋，而不是只為了<strong>取悅老闆</strong>。</p>
          </div>
          <div class="card card--value">
            <span class="pill pill--value">Slack 價值</span>
            <p><strong>Slack Connect</strong> 把客戶與合作夥伴拉進專屬頻道，實現最即時、<strong>零時差</strong>的回饋循環。</p>
          </div>
        </div>
        <div class="stat-grid reveal">
          <div class="stat-block">
            <p class="num"><span class="counter" data-target="2" data-prefix="" data-suffix="x">0x</span></p>
            <p class="label">創意審查與核准的周轉速度</p>
          </div>
          <div class="stat-block">
            <p class="num"><span class="counter" data-target="4" data-prefix="" data-suffix="x">0x</span></p>
            <p class="label">與客戶協作的成交周期加速</p>
          </div>
        </div>
        <p class="source-line">來源：Slack Connect 官方案例（slack.com/connect）</p>
        <div class="case-study case-study--teal reveal">
          <p class="kicker">解法四 · 亮點</p>
          <h4>Slack 用 Slack Connect，與客戶「共同打造」Slack Connect。</h4>
          <p>這正是敏捷「與客戶共創」最好的示範——把回饋循環，內建進產品開發本身。</p>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Verify content is present**

Run:
```bash
cd /Users/leochiang/slacktw
grep -c '四大痛點，對應四種解法' index.html
grep -c 'id="solution-4"' index.html
grep -c 'IBM：把整條交付流程搬進頻道' index.html
grep -c 'class="counter"' index.html
```
Expected: first three print `1`; the fourth (total `.counter` elements across Parts 2–3 so far) prints `9`.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add Part 3 content: 敏捷看 Slack"
```

---

### Task 7: Part 4 content + footer (結語交棒)

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `.divider`/`.divider--purple`/`.divider--teal`, `.statement-banner--purple-dark`, `.stat-grid`, `.trio-grid`/`.trio-card`/`.trio-card--highlight`, `.dots`, `.site-footer`/`.footer-grid`, `.reveal` from Task 2.
- Produces: 4 more `.counter` elements (total 13 across the page) consumed by Task 9's `initCounters()`.

- [ ] **Step 1: Replace the Part 4 anchor**

Modify `index.html` — find:
```html
    <section id="part4" class="part">
      <!-- PART4_CONTENT -->
    </section>
```
Replace with:
```html
    <section id="part4" class="part">
      <div class="divider divider--purple">
        <span class="divider__num">04</span>
        <p class="kicker">PART 4 · 結語交棒</p>
        <h2>從敏捷基底，走向 AI 賦能</h2>
      </div>
      <div class="section">
        <h3 class="reveal">導入 Slack，不是換一套聊天軟體</h3>
        <p class="reveal">而是為企業植入「<span class="hl-green">敏捷、透明、快速適應</span>」的文化 DNA。它把原本要花幾個月的決策週期，縮短到幾天、甚至幾小時。</p>
      </div>
      <div class="statement-banner statement-banner--purple-dark reveal">
        <p class="kicker">四個數字，收攏全場</p>
        <div class="stat-grid">
          <div class="stat-block">
            <p class="num"><span class="counter" data-target="47" data-prefix="+" data-suffix="%">+0%</span></p>
            <p class="label">生產力</p>
          </div>
          <div class="stat-block">
            <p class="num"><span class="counter" data-target="32" data-prefix="-" data-suffix="%">-0%</span></p>
            <p class="label">Email 量</p>
          </div>
          <div class="stat-block">
            <p class="num"><span class="counter" data-target="27" data-prefix="-" data-suffix="%">-0%</span></p>
            <p class="label">會議時間</p>
          </div>
          <div class="stat-block">
            <p class="num"><span class="counter" data-target="23" data-prefix="+" data-suffix="%">+0%</span></p>
            <p class="label">決策速度</p>
          </div>
        </div>
      </div>
      <div class="section">
        <p class="kicker reveal">PART 4 · 完整的圖像</p>
        <div class="trio-grid reveal">
          <div class="trio-card">
            <p class="kicker">靈魂</p>
            <h4>敏捷思維</h4>
            <p>企業應對變局的價值觀與方法。</p>
          </div>
          <div class="trio-card">
            <p class="kicker">神經系統</p>
            <h4>Slack</h4>
            <p>讓資訊在組織裡快速流動。</p>
          </div>
          <div class="trio-card trio-card--highlight">
            <p class="kicker">大腦</p>
            <h4>AI</h4>
            <p>自動思考、預測、處理繁雜事務。</p>
          </div>
        </div>
      </div>
      <div class="divider divider--teal">
        <p class="kicker">PART 4 · 完美交棒</p>
        <h2>當神經系統，裝上會思考的大腦</h2>
        <p>接下來，交給 Slack 原廠專家，展示當 Slack 結合最前瞻的 AI，如何解放員工時間、自動化工作流程，帶領企業進入下一個世代的<strong>極致敏捷</strong>。</p>
      </div>
      <div class="divider divider--purple">
        <p class="kicker">THANK YOU</p>
        <h2>謝謝聆聽</h2>
        <p>敏捷是靈魂，Slack 是神經系統，AI 是大腦。接下來，交給原廠——</p>
        <div class="dots"><span class="d1"></span><span class="d2"></span><span class="d3"></span><span class="d4"></span></div>
      </div>
    </section>
```

- [ ] **Step 2: Replace the footer anchor**

Modify `index.html` — find:
```html
  <footer class="site-footer">
    <!-- FOOTER_CONTENT -->
  </footer>
```
Replace with:
```html
  <footer class="site-footer">
    <p class="kicker">APPENDIX</p>
    <h3>資料來源</h3>
    <div class="footer-grid">
      <div>
        <p>Slack 起源與轉向：TechCrunch、Building Slack、Startup Archive、SitePoint</p>
        <p>切換成本統計：Moveworks、Speakwise 等研究</p>
        <p>敏捷觀點：《Doing Agile Right》《打造敏捷企業》</p>
      </div>
      <div>
        <p>生產力與協作數據：Slack 官方研究、slack.com/customer-stories</p>
        <p>Slack Connect 成效：slack.com/connect 官方案例</p>
      </div>
    </div>
    <p class="source-line">本頁面內容整理自「迎戰變局：用敏捷思維與 Slack，打造高適應力企業」簡報。</p>
  </footer>
```

- [ ] **Step 3: Verify content is present**

Run:
```bash
cd /Users/leochiang/slacktw
grep -c '從敏捷基底，走向 AI 賦能' index.html
grep -c '謝謝聆聽' index.html
grep -c '資料來源' index.html
grep -c 'class="counter"' index.html
```
Expected: first three print `1`; the fourth prints `13`.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Add Part 4 content and footer: 結語交棒"
```

---

### Task 8: Nav highlighting + scroll progress bar behavior

**Files:**
- Modify: `script.js`

**Interfaces:**
- Consumes: `computeProgress` from Task 2; DOM elements `#progressBar`, `.nav-links a[href]`, `main section[id]` from Tasks 1–7.
- Produces: `initProgressBar()`, `initNav()`, both called from `DOMContentLoaded`.

- [ ] **Step 1: Add `initProgressBar` and `initNav`, wire them into `DOMContentLoaded`**

Modify `script.js` — find:
```js
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {});
}
```
Replace with:
```js
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
```

- [ ] **Step 2: Verify the unit tests still pass (regression check)**

Run: `node script.test.js`
Expected: prints `All script.js unit tests passed.` and exits with status `0`.

- [ ] **Step 3: Verify in a real browser**

Run:
```bash
cd /Users/leochiang/slacktw
python3 -m http.server 8931 &
sleep 1
```
Open `http://localhost:8931/` in a browser (use the session's browser automation tool if available; otherwise open manually). Scroll down the page and confirm:
- The thin gradient bar at the very top grows from 0% to 100% width as you scroll from top to bottom.
- The nav link for the section currently in view (Part 1–4) is highlighted (aubergine color + red underline) as you scroll past each section.

Then stop the server:
```bash
kill %1
```

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "Wire up scroll progress bar and nav section highlighting"
```

---

### Task 9: Scroll-reveal + number count-up animations

**Files:**
- Modify: `script.js`

**Interfaces:**
- Consumes: `easeOutQuad`, `formatCounterValue` from Task 2; `.reveal` elements and `.counter` elements (with `data-target`/`data-prefix`/`data-suffix`) from Tasks 3–7.
- Produces: `initScrollReveal()`, `initCounters()`, both called from `DOMContentLoaded`.

- [ ] **Step 1: Add `initScrollReveal` and `initCounters`, wire them into `DOMContentLoaded`**

Modify `script.js` — find:
```js
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initProgressBar();
    initNav();
  });
}
```
Replace with:
```js
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
```

- [ ] **Step 2: Verify the unit tests still pass (regression check)**

Run: `node script.test.js`
Expected: prints `All script.js unit tests passed.` and exits with status `0`.

- [ ] **Step 3: Verify in a real browser**

Run:
```bash
cd /Users/leochiang/slacktw
python3 -m http.server 8931 &
sleep 1
```
Open `http://localhost:8931/` and confirm:
- Headings/cards fade in and shift up slightly as you scroll each section into view (not all at once on page load).
- Each stat number (e.g. `-32%`, `~1,200`, `70–90%`, `2x`) counts up from 0 to its final value over about a second when it enters the viewport, then stops exactly at the printed value in the spec.
- The purple/teal divider backgrounds slowly shift/drift (from Task 2's `gradientShift` animation).
- In your browser's dev tools, enable "prefers-reduced-motion: reduce" (Chrome DevTools → Rendering tab → Emulate CSS media feature) and reload: content should appear immediately with no fade/slide, counters should show final values immediately, and dividers should not animate.

Then stop the server:
```bash
kill %1
```

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "Add scroll-reveal and number count-up animations"
```

---

### Task 10: Mobile / responsive / CJK typography QA pass

**Files:**
- Modify: `style.css` (only if issues are found)

**Interfaces:**
- Consumes: entire page from Tasks 1–9.

- [ ] **Step 1: Automated breakpoint and typography audit**

Run:
```bash
cd /Users/leochiang/slacktw
grep -c 'clamp(' style.css
grep -c 'overflow-wrap: break-word;' style.css
grep -c 'line-break: strict;' style.css
grep -c '@media (max-width: 720px)' style.css
grep -c '@media (max-width: 640px)' style.css
grep -cE 'font-size: [0-9]+px' style.css
```
Expected: the `clamp(` count is well above `10` (headings + hero-sub + divider__num + num), `overflow-wrap`/`line-break` each print `1`, both `@media` counts print `1`, and the last command (fixed-px headline font sizes, which would defeat responsive scaling) prints `0`.

- [ ] **Step 2: Visual verification at mobile/tablet/desktop widths**

Run:
```bash
cd /Users/leochiang/slacktw
python3 -m http.server 8931 &
sleep 1
```
If a browser automation tool is available in this session (search for it via ToolSearch with a query like `select:mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__resize_window,mcp__claude-in-chrome__computer`), use it to open `http://localhost:8931/` and resize the window to each of: 375px (iPhone SE), 390px (iPhone standard), 768px (tablet), 1280px (desktop). At each width, confirm:
- No horizontal scrollbar/overflow on any section.
- `.compare-grid`, `.pain-value-grid`, `.stat-grid`, `.trio-grid`, `.agenda-grid`, `.bullet-grid`, `.footer-grid` are single-column below 720px and multi-column at 768px+.
- `.nav-links` is hidden and `.nav-progress-dot` is visible below 640px.
- No heading text is broken mid-word (e.g. "Sla-ck" or "敏-捷"); no punctuation (，。」) sits alone at the start of a line.
- Tap targets (`.agenda-step`, nav links) are at least 44×44px on the 375px viewport (use the browser tool's element inspection, or estimate from padding: `.agenda-step` has `padding-top: 1rem` plus its text content, which is acceptable since it is a block-level link spanning the grid cell width).

If no browser automation tool is available in this session, note this step as "manual verification pending" and instruct the user to open `http://localhost:8931/` in their own browser's responsive design mode before publishing.

Then stop the server:
```bash
kill %1
```

- [ ] **Step 3: Fix any issues found, then re-run Steps 1–2**

If Step 2 finds a real problem (e.g. a grid not collapsing, an element overflowing), fix it in `style.css` and re-run both verification steps until they pass. If no problems are found, skip this step.

- [ ] **Step 4: Commit** (only if Step 3 made changes)

```bash
git add style.css
git commit -m "Fix responsive/mobile layout issues found in QA pass"
```

---

### Task 11: GitHub Actions deploy workflow + README

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `README.md`

**Interfaces:**
- Consumes: `CNAME` from Task 1.

- [ ] **Step 1: Create the workflow directory and file**

Run:
```bash
cd /Users/leochiang/slacktw
mkdir -p .github/workflows
```

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Verify the workflow file is well-formed**

Run:
```bash
cd /Users/leochiang/slacktw
grep -q 'branches: \["main"\]' .github/workflows/deploy.yml && \
grep -q 'actions/upload-pages-artifact@v3' .github/workflows/deploy.yml && \
grep -q 'actions/deploy-pages@v4' .github/workflows/deploy.yml && \
python3 -c "
import re
content = open('.github/workflows/deploy.yml').read()
assert content.count('jobs:') == 1
assert content.count('steps:') == 1
print('OK: workflow structure looks sane')
"
```
Expected: prints `OK: workflow structure looks sane` with no errors.

- [ ] **Step 3: Create `README.md`**

```markdown
# slack.tw — 迎戰變局簡報網頁

單頁靜態網站，內容改編自簡報《迎戰變局：用敏捷思維與 Slack，打造高適應力企業》。

## 本機預覽

    python3 -m http.server 8000

開啟 http://localhost:8000

## 執行單元測試

    node script.test.js

## 部署

push 到 `main` 分支後，GitHub Actions（`.github/workflows/deploy.yml`）會自動部署到 GitHub Pages。

首次啟用需要在 repo 的 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。

## 自訂網域 slack.tw 設定

1. Repo 根目錄已包含 `CNAME` 檔案（內容為 `slack.tw`）。
2. 到網域註冊商後台，將 `slack.tw` 設定 4 筆 A 記錄指向：
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
3. 等待 DNS 生效後，於 repo 的 **Settings → Pages** 頁面填入自訂網域並啟用 HTTPS。
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "Add GitHub Pages deploy workflow and README"
```

---

### Task 12: Final integration walkthrough

**Files:**
- None (verification only, unless issues are found)

**Interfaces:**
- Consumes: the complete site from Tasks 1–11.

- [ ] **Step 1: Re-run the full unit test suite**

Run: `node script.test.js`
Expected: prints `All script.js unit tests passed.` and exits with status `0`.

- [ ] **Step 2: Confirm every major heading from the design spec's IA table is present, in order**

Run:
```bash
cd /Users/leochiang/slacktw
for phrase in \
  "迎戰變局</h1>" \
  "四段旅程，一個結論" \
  "Slack 本身，就是一場敏捷轉向" \
  "傳統管理模式，正在拖慢你的組織" \
  "Slack = 敏捷的數位神經系統" \
  "四大痛點，對應四種解法" \
  "從敏捷基底，走向 AI 賦能" \
  "謝謝聆聽" \
  "資料來源"; do
  count=$(grep -c "$phrase" index.html)
  echo "$count : $phrase"
done
```
Expected: every line prints `1 : <phrase>`.

- [ ] **Step 3: Confirm all 13 counters and CNAME are correct**

Run:
```bash
cd /Users/leochiang/slacktw
grep -c 'class="counter"' index.html
cat CNAME
```
Expected: `13`, then `slack.tw`.

- [ ] **Step 4: Full-page browser walkthrough**

Run:
```bash
cd /Users/leochiang/slacktw
python3 -m http.server 8931 &
sleep 1
```
Open `http://localhost:8931/` and scroll from top to bottom once, confirming:
- Hero → Overview → Part 1 → Part 2 → Part 3 (including the 4 solution sub-sections) → Part 4 → footer appear in that order with no missing/duplicated sections.
- Clicking each nav link jumps smoothly to the right section.
- No layout breaks, no raw HTML comment anchors left visible (i.e. `grep -c '<!-- .*_CONTENT -->' index.html` prints `0`).

Then stop the server:
```bash
kill %1
grep -c '<!-- .*_CONTENT -->' index.html
```
Expected: the final `grep` prints `0`.

- [ ] **Step 5: Commit final state** (only if Step 4 required fixes)

```bash
git add -A
git commit -m "Final QA pass: verify full content walkthrough"
```

- [ ] **Step 6: Report to the user**

Summarize to the user that:
- All commits are local only (no `git push` has been performed).
- Before the site goes live, they still need to (a) `git push` to `origin main` themselves, (b) set the repo's Settings → Pages source to "GitHub Actions", and (c) configure the 4 DNS `A` records for `slack.tw` as documented in `README.md`.
