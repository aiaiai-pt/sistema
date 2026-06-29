/**
 * Grid layout helpers (#176 Tier 1 / ADR 0003).
 *
 * A page is still a flat `Block[]`; a block may carry an optional `layout`
 * placing it on a 12-column grid. These pure helpers turn that descriptor field
 * into CSS, shared by BOTH host apps (admin dashboard + portal page) so the
 * arrangement is identical and DRY. Presentation-only: no editing concern lives
 * here — the editor merely writes the same `layout` coords the renderer reads.
 *
 * Back-compatible: a block without `layout` falls back to source order, and a
 * page with NO laid-out blocks renders as the shipped stacked list.
 */
import type { Block, BlockLayout } from "./types";

export const GRID_COLUMNS = 12;

/** Clamp a layout to valid 12-col track bounds (defensive against operator /
 *  drag input). `w` is 1..12; `x` keeps the span on-track; `y`/`h` are >=0/>=1. */
export function normalizeLayout(layout: BlockLayout): BlockLayout {
  const w = clampInt(layout.w, 1, GRID_COLUMNS, 1);
  const x = clampInt(layout.x, 0, GRID_COLUMNS - w, 0);
  const h = clampInt(layout.h, 1, Number.MAX_SAFE_INTEGER, 1);
  const y = clampInt(layout.y, 0, Number.MAX_SAFE_INTEGER, 0);
  return { x, y, w, h };
}

/**
 * CSS `grid-column` / `grid-row` placement for a block's layout, or `null` when
 * the block has none (the caller renders it in source order). Grid lines are
 * 1-based, so a 0-based `x`/`y` maps to line `x+1`/`y+1`.
 */
export function gridStyleFor(block: Pick<Block, "layout">): string | null {
  if (!block.layout) return null;
  const { x, y, w, h } = normalizeLayout(block.layout);
  return `grid-column:${x + 1} / span ${w};grid-row:${y + 1} / span ${h};`;
}

/** True when ANY block carries a `layout` — the page should render as a grid
 *  (12-col track) rather than the stacked list. */
export function hasGridLayout(
  blocks: ReadonlyArray<Pick<Block, "layout">>,
): boolean {
  return blocks.some((b) => b.layout != null);
}

function clampInt(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  const n =
    typeof value === "number" && Number.isFinite(value)
      ? Math.round(value)
      : fallback;
  return Math.max(min, Math.min(max, n));
}
