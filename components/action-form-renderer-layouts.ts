/**
 * Layout dispatcher for the action renderer (#27 / S7).
 *
 * `target_config.layout_key` selects which arrangement an
 * `ActionFormRenderer` uses to lay out its parameter rows. This module
 * is the single source of truth for the registry. Anything outside the
 * registry — null, undefined, empty string, "wizard", a typo, an
 * operator's free-text — falls back to `stacked-default`.
 *
 * Locked by spec rabbit hole #11:
 *   - Exactly three entries: stacked-default, inline-row, compact-mobile.
 *     Adding wizard / two-column is a separate epic.
 *   - Frontend-only, no ontology entity. Storage is `target_config.layout_key`.
 *
 * Locked by threat model TH-08 (R-SEC-07):
 *   - The operator can write any string into `target_config.layout_key`.
 *     The renderer MUST NOT interpolate that string into a `class=`,
 *     `data-*`, or `style` attribute. Instead, it consults this
 *     dispatcher and uses the registry's known-good `key` (one of three
 *     literals) when emitting the `data-layout` attribute. Unknown
 *     keys collapse to `stacked-default`, so a malicious or misspelled
 *     value never reaches the DOM.
 */
import type { Component } from "svelte";

import LayoutCompactMobile from "./LayoutCompactMobile.svelte";
import LayoutInlineRow from "./LayoutInlineRow.svelte";
import LayoutStackedDefault from "./LayoutStackedDefault.svelte";

/** Public string set. The output of `resolveLayout(...).key` is always
 *  one of these three values, regardless of input. Tests assert this. */
export type LayoutKey = "stacked-default" | "inline-row" | "compact-mobile";

export interface LayoutEntry {
  /** The known-good key. Safe to render as `data-layout={key}`. */
  key: LayoutKey;
  /** Svelte component the renderer mounts for this layout. */
  component: Component<LayoutComponentProps>;
}

export interface LayoutSection {
  name: string;
  items: Array<Record<string, unknown>>;
  /** #634 S3 — stable contract key (schema.sections[].key), when present. */
  key?: string;
  /** #634 S3 — declared section density (1|2). Layouts that arrange rows
   *  vertically render a two-column grid when 2; other layouts may ignore
   *  it (their arrangement is their own contract). Default 1. */
  columns?: number;
  /** #634 S4 — the section's optional `visible_when` predicate, carried
   *  from the contract for live show/hide (see action-form-visibility). */
  visibleWhen?: Record<string, unknown> | null;
}

import {
  FULL_WIDTH_WIDGET_KINDS,
  widgetKind,
} from "./action-form-renderer-widgets";

/**
 * #634 S3 — whether a parameter's cell spans the full row inside a
 * `columns: 2` section. An explicit `span: "full"` on the parameter wins;
 * wide WIDGET KINDS (map canvas, upload list, textarea, json editor —
 * resolved widget-first per #36, so both the field summary's `widget` and
 * a bare legacy `type` clamp) go full regardless; everything else flows
 * half-width (so a bare `columns: 2` declaration visibly two-columns its
 * fields). In a single-column section every cell is trivially full.
 * Mirrors the CRUD form-surface compilers' FULL_WIDTH_WIDGETS clamp.
 */
export function fieldSpansFull(
  parameter: Record<string, unknown>,
  columns: number | undefined,
): boolean {
  if ((columns ?? 1) < 2) return true;
  if (parameter.span === "full") return true;
  return FULL_WIDTH_WIDGET_KINDS.has(widgetKind(parameter));
}

import type { Snippet } from "svelte";

export interface LayoutComponentProps {
  sections: LayoutSection[];
  /** Snippet that renders one parameter's input control. The renderer
   *  passes this in so per-field rendering stays in one place — layouts
   *  decide arrangement, not control type. */
  field: Snippet<[Record<string, unknown>]>;
}

/** The registry. Order is the order shown to operators in the
 *  AddPlacementPanel select; the first entry is the default. */
const REGISTRY: Record<LayoutKey, Component<LayoutComponentProps>> = {
  "stacked-default":
    LayoutStackedDefault as unknown as Component<LayoutComponentProps>,
  "inline-row": LayoutInlineRow as unknown as Component<LayoutComponentProps>,
  "compact-mobile":
    LayoutCompactMobile as unknown as Component<LayoutComponentProps>,
};

const DEFAULT_KEY: LayoutKey = "stacked-default";

/** Type guard for known keys. Exported so consumers can branch on
 *  membership without re-implementing the literal set. */
export function isKnownLayoutKey(value: unknown): value is LayoutKey {
  return typeof value === "string" && value in REGISTRY;
}

/** Resolve any input to a registry entry. Unknown / null / undefined /
 *  non-string / typo'd values fall through to `stacked-default`. */
export function resolveLayout(key: unknown): LayoutEntry {
  if (isKnownLayoutKey(key)) {
    return { key, component: REGISTRY[key] };
  }
  return { key: DEFAULT_KEY, component: REGISTRY[DEFAULT_KEY] };
}

/** All known keys, in registry order. Useful for picker UIs. */
export const LAYOUT_KEYS: readonly LayoutKey[] = Object.keys(
  REGISTRY,
) as LayoutKey[];
