/**
 * Widget dispatcher — tester/priority, not a flat map (D4, JSONForms model).
 *
 * Generalises the admin app's XSS-hardened layout registry
 * (`admin/src/lib/renderer-layouts/resolve.ts`) from form-row LayoutKeys to
 * widget `kind`s. Each entry carries a `tester(binding, schema) → score`; the
 * highest score wins. A more specific tester (e.g. "list of `occurrence`")
 * outranks the generic "any list" and overrides one widget for one entity
 * WITHOUT editing the catalog (open/closed).
 *
 * The ranking core here is generic over the payload `P` so it stays
 * component-free and fully unit/mutation-testable; the real registry (73b)
 * instantiates it with Svelte `Component`s.
 *
 * TH-08 (R-SEC-07) preserved: the resolved `key` is a known-good literal from
 * the matched entry — the operator's raw `binding.kind`/`entity`/block `type`
 * is NEVER returned as the key, so it never reaches `class`/`data-*`/`style`.
 */
import type { Binding, Block, OntologySchema } from "./types";

/** Tester sentinel — "this widget does not apply to this binding". */
export const NOT_APPLICABLE = -1;

/**
 * A tester ranks a registry entry against a binding (+ optional schema and the
 * block's authoring `type` hint). JSONForms model: testers see the full
 * element, so a type-specific widget (e.g. `filter-bar`) can out-rank the
 * generic kind widget (`entity-list`) for the SAME `binding.kind` without
 * editing the kind entry. `type` is UNTRUSTED — it only influences ranking; the
 * resolved `key` still comes from the matched entry (TH-08), never from `type`.
 */
export type WidgetTester = (
  binding: Binding,
  schema: OntologySchema | null,
  type?: string,
) => number;

export interface RegistryEntry<P> {
  /** Known-good literal. Safe to render as `data-widget={key}` (TH-08). */
  key: string;
  payload: P;
  tester: WidgetTester;
}

export interface Match<P> {
  key: string;
  payload: P;
}

/**
 * Run every tester against the binding; the highest applicable score wins.
 * Ties resolve to the first-registered entry (stable, deterministic). Returns
 * `null` when no tester is applicable — the caller fails closed per blast
 * radius; nothing about the binding is interpolated.
 */
export function selectEntry<P>(
  entries: ReadonlyArray<RegistryEntry<P>>,
  binding: Binding,
  schema: OntologySchema | null,
  type?: string,
): Match<P> | null {
  let best: RegistryEntry<P> | null = null;
  let bestScore: number = NOT_APPLICABLE;
  for (const entry of entries) {
    const score = entry.tester(binding, schema, type);
    // Strictly greater → first registered wins ties.
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  if (best === null) return null;
  // TH-08: key from the matched entry, never from the binding/block.
  return { key: best.key, payload: best.payload };
}

export type RenderDecision =
  | { render: "widget" }
  | { render: "empty" }
  | { render: "error" };

/**
 * Fail-closed per blast radius (§14.8). Given whether a widget matched AND
 * whether its data resolved, decide how the slot renders:
 *   - matched + data ok        → render the widget
 *   - failed, optional slot    → soft-empty (render nothing)
 *   - failed, structural slot  → visible error (MUST NOT silently vanish)
 * The operator's raw `type`/`kind` is never interpolated in any branch.
 */
export function decideRender(
  block: Pick<Block, "importance">,
  matched: boolean,
  dataOk: boolean,
): RenderDecision {
  if (matched && dataOk) return { render: "widget" };
  return block.importance === "structural"
    ? { render: "error" }
    : { render: "empty" };
}
