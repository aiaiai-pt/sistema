/**
 * Popover viewport-fit algorithm — calculatePopoverPosition().
 *
 * WHY. The original reposition() in Popover.svelte flipped to the other side
 * when the preferred side was too small, but had no cap when BOTH sides were
 * too small. A 40-item Menu with placement="top-start" at the bottom of an
 * 800px viewport (trigger y≈740) would flip below, land at y=764, and extend
 * to y=2264 — unreachable. Reported via a consumer (nomadriver sidebar footer).
 *
 * WHAT THIS GUARDS. Three positioning outcomes:
 *   1. preferred side fits → place there, no cap
 *   2. preferred doesn't fit but opposite does → flip, no cap
 *   3. neither fits → open on the side with more room, cap height, stay on screen
 *
 * Pure-function tests: no jsdom mounting, no rAF. The function is extracted
 * from Popover.svelte so it can be exercised in isolation; Popover.svelte
 * delegates to it.
 */

import { describe, expect, it } from "vitest";
import { calculatePopoverPosition } from "../components/popover-position.js";

// Shared anchor geometry: left=20, right=120, width=100
const ANCHOR_W = { left: 20, right: 120, width: 100 };

describe("calculatePopoverPosition — preferred side fits", () => {
  it("bottom-start: places below the anchor, no cap", () => {
    // anchor y=100..120, pop h=200, viewport=800 — 676px room below, fits
    const r = calculatePopoverPosition(
      { top: 100, bottom: 120, ...ANCHOR_W },
      { width: 100, height: 200 },
      800,
      800,
      "bottom-start",
      4,
    );
    expect(r.y).toBe(124); // 120 + 4 offset
    expect(r.maxHeight).toBeUndefined();
  });

  it("top-start: places above the anchor, no cap", () => {
    // anchor y=400..420, pop h=200, viewport=800 — 396px room above, fits
    const r = calculatePopoverPosition(
      { top: 400, bottom: 420, ...ANCHOR_W },
      { width: 100, height: 200 },
      800,
      800,
      "top-start",
      4,
    );
    expect(r.y).toBe(196); // 400 - 200 - 4
    expect(r.maxHeight).toBeUndefined();
  });
});

describe("calculatePopoverPosition — flip when preferred side does not fit", () => {
  it("bottom-start flips above when there is not enough room below", () => {
    // anchor y=700..720, pop h=200, viewport=800
    // roomBelow = 800-720-4 = 76 (<200, doesn't fit)
    // roomAbove = 700-4     = 696 (>=200, fits)
    const r = calculatePopoverPosition(
      { top: 700, bottom: 720, ...ANCHOR_W },
      { width: 100, height: 200 },
      800,
      800,
      "bottom-start",
      4,
    );
    expect(r.y).toBe(496); // 700 - 200 - 4
    expect(r.maxHeight).toBeUndefined();
    expect(r.y).toBeGreaterThanOrEqual(0);
    expect(r.y + 200).toBeLessThanOrEqual(800);
  });

  it("top-start flips below when there is not enough room above", () => {
    // anchor y=80..100, pop h=200, viewport=800
    // roomAbove = 80-4     = 76 (<200, doesn't fit)
    // roomBelow = 800-100-4 = 696 (>=200, fits)
    const r = calculatePopoverPosition(
      { top: 80, bottom: 100, ...ANCHOR_W },
      { width: 100, height: 200 },
      800,
      800,
      "top-start",
      4,
    );
    expect(r.y).toBe(104); // 100 + 4
    expect(r.maxHeight).toBeUndefined();
    expect(r.y).toBeGreaterThanOrEqual(0);
    expect(r.y + 200).toBeLessThanOrEqual(800);
  });
});

describe("calculatePopoverPosition — neither side fits → capped, on screen", () => {
  it("exact reproduction of the defect: top-start, 40-item menu, anchor near bottom", () => {
    // Real scenario: placement="top-start", anchor y≈740..760, pop h=1500,
    // viewport=800. Old code: y=764, bottom=2264 — unreachable.
    // Expected: y and maxHeight keep the popover fully inside the viewport.
    const r = calculatePopoverPosition(
      { top: 740, bottom: 760, ...ANCHOR_W },
      { width: 100, height: 1500 },
      800,
      800,
      "top-start",
      4,
    );
    // Must set a cap
    expect(r.maxHeight).toBeDefined();
    // Entire popover must be on screen
    expect(r.y).toBeGreaterThanOrEqual(0);
    expect(r.y + (r.maxHeight ?? 1500)).toBeLessThanOrEqual(800);
  });

  it("bottom-start, taller than viewport, anchor in the middle: caps on bigger side", () => {
    // anchor y=400..420, pop h=2000, viewport=800
    // roomBelow = 800-420-4 = 376, roomAbove = 400-4 = 396
    // Both < 2000. Bigger side: above (396 > 376) → cap above
    const r = calculatePopoverPosition(
      { top: 400, bottom: 420, ...ANCHOR_W },
      { width: 100, height: 2000 },
      800,
      800,
      "bottom-start",
      4,
    );
    expect(r.maxHeight).toBeDefined();
    expect(r.y).toBeGreaterThanOrEqual(0);
    expect(r.y + (r.maxHeight ?? 2000)).toBeLessThanOrEqual(800);
  });

  it("when capped below, y starts at anchorRect.bottom + offset", () => {
    // anchor y=200..220, pop h=2000, viewport=800
    // roomBelow = 800-220-4 = 576, roomAbove = 200-4 = 196
    // Bigger side: below (576 > 196) → caps below
    const r = calculatePopoverPosition(
      { top: 200, bottom: 220, ...ANCHOR_W },
      { width: 100, height: 2000 },
      800,
      800,
      "bottom-start",
      4,
    );
    expect(r.maxHeight).toBeDefined();
    expect(r.y).toBe(224); // 220 + 4 offset
    expect(r.y).toBeGreaterThanOrEqual(0);
    expect(r.y + (r.maxHeight ?? 2000)).toBeLessThanOrEqual(800);
  });
});
