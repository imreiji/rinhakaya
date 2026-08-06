# 賀陽燐羽実装待機 Count-Up Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a single static page at rinhakaya.com showing the number of days since 2026-06-06 00:00 JST.

**Architecture:** Three source files served directly from the repository root by GitHub Pages. `day.js` holds the day calculation as one pure ES module function that takes the current instant as an argument. `index.html` imports it, renders the number, and re-renders once per minute. `test.js` runs the pure function against pinned instants using `node:assert`. There is no build step, no bundler, and no dependency of any kind.

**Tech Stack:** Plain HTML, CSS, and ES modules. Node.js (test runner only, via `node:assert` — not a runtime dependency of the site).

## Global Constraints

- **Zero dependencies.** No `package.json` with dependencies, no npm install, no bundler, no framework. `test.js` may import only from `node:` builtins.
- **No build step.** Files are served exactly as committed. GitHub Pages serves from the repository root.
- **Anchor instant:** `2026-06-05T15:00:00Z`, which is `2026-06-06 00:00:00 JST`. This exact value, never a local-time constructor.
- **Day numbering:** the concert's first day (2026-06-06 JST) is **Day 1**, not Day 0.
- **Copy is fixed.** Header `賀陽燐羽実装待機`. Subtitle lines `学園アイドルマスター The 2nd Period` and `2026.06.06`. Count rendered as `Day N`. Do not add, reword, or translate any of these.
- **Non-goals — do not add:** share button, OGP or Twitter card tags, footer credit, source link, outbound links, hours/minutes/seconds display, analytics.
- **Domain:** `rinhakaya.com`.

---

### Task 1: The day calculation

**Files:**
- Create: `day.js`
- Test: `test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `day.js` exports `ANCHOR_MS` (a `number`, the anchor instant in epoch milliseconds) and `dayNumber(nowMs)` which takes a `number` (epoch milliseconds) and returns a `number` (the 1-based day count). Task 2 imports both names from `./day.js`.

- [ ] **Step 1: Write the failing test**

Create `test.js`:

```javascript
import assert from 'node:assert/strict';
import { ANCHOR_MS, dayNumber } from './day.js';

// The anchor is an absolute instant: 2026-06-06 00:00:00 JST == 2026-06-05T15:00:00Z.
assert.equal(ANCHOR_MS, Date.parse('2026-06-05T15:00:00Z'), 'anchor instant');

// The first day of the concert is Day 1.
assert.equal(dayNumber(Date.parse('2026-06-05T15:00:00Z')), 1, 'Day 1 at JST midnight');

// The count holds for the whole JST day.
assert.equal(dayNumber(Date.parse('2026-06-06T14:59:59Z')), 1, 'Day 1 one second before rollover');

// It rolls over at JST midnight, not UTC midnight.
assert.equal(dayNumber(Date.parse('2026-06-06T15:00:00Z')), 2, 'Day 2 at next JST midnight');
assert.equal(dayNumber(Date.parse('2026-06-06T00:00:00Z')), 1, 'UTC midnight does not roll over');

// A date well into the count. 2026-08-05 12:00 JST is 60 days and 12 hours after the
// anchor, so it is Day 61.
assert.equal(dayNumber(Date.parse('2026-08-05T03:00:00Z')), 61, 'Day 61');

// The result depends only on the absolute instant, so a viewer in a timezone behind UTC
// sees the same number at the same moment. Both strings below denote one identical instant.
assert.equal(
  dayNumber(Date.parse('2026-08-05T03:00:00Z')),
  dayNumber(Date.parse('2026-08-04T23:00:00-04:00')),
  'same instant expressed in a western timezone yields the same day',
);

// Instants before the anchor produce zero or negative numbers rather than throwing.
assert.equal(dayNumber(Date.parse('2026-06-05T14:59:59Z')), 0, 'day before the anchor');

console.log('All tests passed.');
```

Also create `package.json` at the repository root so Node treats `.js` files as ES modules. It declares no dependencies:

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node test.js"
  }
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` — cannot find module `./day.js`.

- [ ] **Step 3: Write the minimal implementation**

Create `day.js`:

```javascript
// 2026-06-06 00:00:00 JST, the first day of 学園アイドルマスター The 2nd Period.
// Written as an absolute UTC instant: JST is UTC+9 and observes no daylight saving time,
// so this single constant is correct for every viewer regardless of their local timezone.
export const ANCHOR_MS = Date.UTC(2026, 5, 5, 15, 0, 0);

const MS_PER_DAY = 86_400_000;

/**
 * The 1-based count of JST days since the anchor.
 * The concert's first day is Day 1.
 *
 * @param {number} nowMs current instant, in epoch milliseconds
 * @returns {number}
 */
export function dayNumber(nowMs) {
  return Math.floor((nowMs - ANCHOR_MS) / MS_PER_DAY) + 1;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node test.js`

Expected: PASS — prints `All tests passed.` and exits 0.

- [ ] **Step 5: Commit**

```bash
git add day.js test.js package.json
git commit -m "Add the JST day-count calculation"
```

---

### Task 2: The page

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: `dayNumber(nowMs)` from `./day.js` (Task 1).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Write the page**

Create `index.html`. The `<span id="count">` starts empty and is filled by the script; the header and subtitle are static markup so they survive with JavaScript disabled.

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>賀陽燐羽実装待機</title>
    <style>
      :root {
        --bg: #fafafa;
        --fg: #111111;
        --muted: #8a8a8a;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #0e0e0e;
          --fg: #f2f2f2;
          --muted: #767676;
        }
      }

      * {
        margin: 0;
        padding: 0;
      }

      html,
      body {
        height: 100%;
      }

      body {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg);
        color: var(--fg);
        font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic',
          'Meiryo', system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
        text-align: center;
        padding: 1.5rem;
      }

      .header {
        font-size: clamp(0.95rem, 3.5vw, 1.2rem);
        font-weight: 500;
        letter-spacing: 0.35em;
        /* letter-spacing adds trailing space after the last character; pull it back so
           the line stays optically centered. */
        text-indent: 0.35em;
      }

      .count {
        font-size: clamp(4rem, 22vw, 10rem);
        font-weight: 600;
        line-height: 1.05;
        letter-spacing: -0.02em;
        /* Tabular figures keep the number from shifting width as the count grows. */
        font-variant-numeric: tabular-nums;
        margin: 0.32em 0 0.38em;
      }

      .subtitle {
        font-size: clamp(0.75rem, 2.8vw, 0.875rem);
        line-height: 1.9;
        color: var(--muted);
      }
    </style>
  </head>
  <body>
    <main>
      <h1 class="header">賀陽燐羽実装待機</h1>
      <p class="count">Day <span id="count"></span></p>
      <p class="subtitle">
        学園アイドルマスター The 2nd Period<br />
        2026.06.06
      </p>
    </main>

    <script type="module">
      import { dayNumber } from './day.js';

      const el = document.getElementById('count');

      function render() {
        el.textContent = String(dayNumber(Date.now()));
      }

      render();
      // Re-check every minute so a page left open overnight rolls over on its own.
      setInterval(render, 60_000);
    </script>
  </body>
</html>
```

- [ ] **Step 2: Verify it renders**

ES modules are blocked by the browser's CORS policy over `file://`, so serve the
directory rather than opening the file directly:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`. Expected: the header `賀陽燐羽実装待機`, a large
`Day 61` (assuming the current date is 2026-08-05 JST; otherwise the day count for
today), and the two muted subtitle lines. Confirm the browser console is free of errors.

- [ ] **Step 3: Verify dark mode**

Toggle the operating system to dark appearance, or in Chrome DevTools open the Command
menu (Ctrl+Shift+P) and run "Emulate CSS prefers-color-scheme: dark".

Expected: near-black ground with off-white type. Stop the server with Ctrl+C when done.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Add the count-up page"
```

---

### Task 3: GitHub Pages custom domain

**Files:**
- Create: `CNAME`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Create the CNAME file**

Create `CNAME` containing exactly one line, with no scheme, no path, and no trailing
whitespace:

```
rinhakaya.com
```

- [ ] **Step 2: Commit and push**

```bash
git add CNAME
git commit -m "Add CNAME for rinhakaya.com"
git push -u origin main
```

- [ ] **Step 3: Enable GitHub Pages**

In the repository on GitHub: **Settings → Pages**. Under "Build and deployment" set
Source to "Deploy from a branch", branch `main`, folder `/ (root)`. Save.

The custom domain field should populate itself from the committed `CNAME` file. Wait for
the deployment to finish (Settings → Pages shows the live URL when ready), then tick
"Enforce HTTPS" once the certificate has been provisioned — this can take several minutes
and the checkbox stays disabled until then.

- [ ] **Step 4: Point DNS at GitHub Pages**

This step happens at the domain registrar, not in the repository. For the apex domain
`rinhakaya.com`, create four `A` records pointing to GitHub's Pages servers:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Verify propagation:

```bash
nslookup rinhakaya.com
```

Expected: the four addresses above. DNS propagation can take up to an hour.

- [ ] **Step 5: Verify the live site**

Open `https://rinhakaya.com`. Expected: the page renders as it did locally, over HTTPS,
with the correct day number.

---

## Notes for the implementer

- **Do not compute the anchor with a local-time constructor.** `new Date(2026, 5, 6)`
  builds the date in the *machine's* timezone, which would make the day number wrong for
  everyone outside JST. The anchor must be `Date.UTC(2026, 5, 5, 15, 0, 0)`. Note that
  the month argument is zero-based, so `5` is June.
- **`day.js` must not read the clock.** It takes `nowMs` as an argument. That is what
  makes the boundary tests possible without mocking globals.
- The site itself requires no Node.js at runtime. `package.json` exists only so `node`
  treats `.js` as ES modules when running the test, and declares no dependencies.
