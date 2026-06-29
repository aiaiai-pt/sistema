/**
 * Grid layout helpers (#176 Tier 1 / ADR 0003).
 */
import { describe, expect, it } from "vitest";
import {
  GRID_COLUMNS,
  gridStyleFor,
  hasGridLayout,
  normalizeLayout,
} from "../components/renderer/grid";
import type { Block } from "../components/renderer/types";

const block = (layout?: Block["layout"]): Block => ({
  type: "x",
  slot: "main",
  binding: { kind: "aggregate", entity: "v" },
  ...(layout ? { layout } : {}),
});

describe("gridStyleFor", () => {
  it("maps a 0-based layout to 1-based grid lines + spans", () => {
    expect(gridStyleFor(block({ x: 0, y: 0, w: 6, h: 1 }))).toBe(
      "grid-column:1 / span 6;grid-row:1 / span 1;",
    );
    expect(gridStyleFor(block({ x: 6, y: 2, w: 6, h: 2 }))).toBe(
      "grid-column:7 / span 6;grid-row:3 / span 2;",
    );
  });

  it("returns null for a block without layout (source-order fallback)", () => {
    expect(gridStyleFor(block())).toBeNull();
  });
});

describe("normalizeLayout — defensive clamping", () => {
  it("clamps width to 1..12", () => {
    expect(normalizeLayout({ x: 0, y: 0, w: 99, h: 1 }).w).toBe(GRID_COLUMNS);
    expect(normalizeLayout({ x: 0, y: 0, w: 0, h: 1 }).w).toBe(1);
  });

  it("keeps the span on-track (x + w <= 12)", () => {
    const l = normalizeLayout({ x: 10, y: 0, w: 6, h: 1 });
    expect(l.x + l.w).toBeLessThanOrEqual(GRID_COLUMNS);
  });

  it("floors negative / fractional coords", () => {
    expect(normalizeLayout({ x: -3, y: -1, w: 2.6, h: 0 })).toEqual({
      x: 0,
      y: 0,
      w: 3,
      h: 1,
    });
  });
});

describe("hasGridLayout", () => {
  it("is true iff any block carries a layout", () => {
    expect(hasGridLayout([block(), block()])).toBe(false);
    expect(hasGridLayout([block(), block({ x: 0, y: 0, w: 4, h: 1 })])).toBe(
      true,
    );
  });
});
