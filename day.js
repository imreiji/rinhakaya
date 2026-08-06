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
