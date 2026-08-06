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
