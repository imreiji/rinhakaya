# 賀陽燐羽実装待機 — design

Date: 2026-08-05
Status: approved

## Context

賀陽燐羽 (Kaya Rinha) is an announced but unreleased character in the mobile game
学園アイドルマスター. Fans expected her release to be announced at the live concert
学園アイドルマスター The 2nd Period, held 2026-06-06 and 2026-06-07. No announcement came.

This site counts the days since that concert began. It is a fan-made page, deadpan by
understatement: it states no grievance, and the number does all the work.

Reference for format and restraint: <https://ijigen-day-n.ham-san.net/>

## Scope

One static page served at rinhakaya.com. It displays a day count and nothing else.

## Page content

A single centered column, vertically centered in the viewport:

```
        賀陽燐羽実装待機

           Day 61

  学園アイドルマスター The 2nd Period
           2026.06.06
```

- `賀陽燐羽実装待機` — header, small, letter-spaced
- `Day N` — the only visually heavy element
- `学園アイドルマスター The 2nd Period` / `2026.06.06` — subtitle, small and muted

## Visual direction

Minimal monochrome. Near-white ground, near-black type, no accent color.

- Japanese system font stack (Hiragino Kaku Gothic ProN → Yu Gothic → Meiryo → sans-serif)
  so the header renders correctly on Japanese devices.
- The day number uses tabular figures so its width does not shift as the count grows.
- `prefers-color-scheme: dark` inverts to near-black ground with off-white type. Most
  visitors will open this on a phone, often at night.

## The day calculation

This is the only part of the system that can be meaningfully wrong.

```
anchor = 2026-06-05T15:00:00Z   // == 2026-06-06 00:00:00 JST
Day N  = floor((now - anchor) / 86_400_000) + 1
```

Both operands are absolute instants, and JST (UTC+9) observes no daylight saving time.
Therefore:

- Every viewer on Earth sees the same N at the same moment, regardless of local timezone.
- N increments at JST midnight, not at the viewer's local midnight.
- The concert's first day (2026-06-06 JST) is Day 1.

As of 2026-08-05 the page shows Day 61.

A timer re-evaluates the count once per minute so a page left open overnight rolls over
without a reload.

## Structure

No build step and no dependencies. GitHub Pages serves the repository root directly.

| File         | Purpose                                                    |
| ------------ | ---------------------------------------------------------- |
| `index.html` | Markup and inline CSS. Loads `day.js` and renders the count.|
| `day.js`     | The day calculation, as one exported pure function.         |
| `test.js`    | Assertions over `day.js`. Run with `node test.js`.          |
| `CNAME`      | Contains `rinhakaya.com` for the GitHub Pages custom domain.|

`day.js` exports a function taking the current instant as an argument rather than reading
the clock itself, so tests can pin time without mocking globals.

## Testing

`node test.js`, using only `node:assert`. Off-by-one and timezone errors are the only
realistic failure modes, so the tests cover exactly those boundaries:

- 2026-06-06 00:00:00 JST → Day 1
- 2026-06-06 23:59:59 JST → Day 1
- 2026-06-07 00:00:00 JST → Day 2
- 2026-08-05 12:00:00 JST → Day 61
- The same instant evaluated from a timezone behind UTC yields the same N, confirming the
  result depends on the absolute instant and not on local time.

## Accepted trade-off

With JavaScript disabled the number does not render; the header and date still do. There
is no build step in which to pre-render it. This was accepted in exchange for zero tooling.
If it later matters, the fix is a build step that bakes the number into `index.html` at
deploy time.

## Non-goals

Explicitly cut, and not to be added back without a decision:

- Share-to-X button
- OGP / Twitter card image
- Footer credit or source link
- Outbound link to the official Gakumas site
- Live hours/minutes/seconds — days only
- Any framework, bundler, or dependency
