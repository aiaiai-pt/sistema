/**
 * Widget dispatcher — COMPATIBILITY ADAPTER over @aiaiai-pt/widget-system/core.
 *
 * @deprecated Import the generic dispatch from `@aiaiai-pt/widget-system/core`
 * instead. This module is the S2 (#60) compatibility shim: it preserves the
 * Atelier-shaped `@aiaiai-pt/design-system/renderer/dispatch` import surface for
 * one migration window while the ranking ALGORITHM lives in exactly one place —
 * `@aiaiai-pt/widget-system/core`. Scheduled for removal in the next MAJOR of
 * `@aiaiai-pt/design-system` (S3). See `docs/migration/widget-system.md`.
 *
 * Classification (#60 AC5): the tester/priority ranking loop is a GENERIC
 * widget-system API — it is delegated below and NOT reimplemented here. The
 * `(binding, schema, type)` tester SIGNATURE is ATELIER-COUPLED (it names
 * `Binding`/`OntologySchema`/`Block` from ./types) and stays here as a thin
 * adapter until consumers migrate to the ctx-shaped `WidgetMatchContext`.
 *
 * TH-08 (R-SEC-07) preserved end-to-end: `core.selectEntry` returns the matched
 * entry's known-good `key` literal — the operator's raw `binding.kind`/`type`
 * is never returned as the key, so it never reaches `class`/`data-*`/`style`.
 */
import {
  decideRender as coreDecideRender,
  NOT_APPLICABLE as CORE_NOT_APPLICABLE,
  selectEntry as coreSelectEntry,
  type Match as CoreMatch,
  type RenderDecision as CoreRenderDecision,
} from "@aiaiai-pt/widget-system/core";
import type { Binding, Block, OntologySchema } from "./types";

/**
 * Tester sentinel — "this widget does not apply to this binding".
 *
 * @deprecated Re-exported from `@aiaiai-pt/widget-system/core`. Import it from
 * there directly.
 */
export const NOT_APPLICABLE = CORE_NOT_APPLICABLE;

/**
 * A tester ranks a registry entry against a binding (+ optional schema and the
 * block's authoring `type` hint). JSONForms model: testers see the full
 * element, so a type-specific widget (e.g. `filter-bar`) can out-rank the
 * generic kind widget (`entity-list`) for the SAME `binding.kind` without
 * editing the kind entry. `type` is UNTRUSTED — it only influences ranking; the
 * resolved `key` still comes from the matched entry (TH-08), never from `type`.
 *
 * @deprecated ATELIER-COUPLED signature. The generic tester in
 * `@aiaiai-pt/widget-system/core` is `(ctx: WidgetMatchContext) => number`.
 * Migrate custom testers to read `ctx.kind`/`ctx.type` from a match context.
 */
export type WidgetTester = (
  binding: Binding,
  schema: OntologySchema | null,
  type?: string,
) => number;

/**
 * @deprecated ATELIER-COUPLED entry shape (its `tester` names `Binding`). The
 * generic entry lives in `@aiaiai-pt/widget-system/core` as
 * `RegistryEntry<P, Ctx>`.
 */
export interface RegistryEntry<P> {
  /** Known-good literal. Safe to render as `data-widget={key}` (TH-08). */
  key: string;
  payload: P;
  tester: WidgetTester;
}

/**
 * The matched entry. Structurally identical to
 * `@aiaiai-pt/widget-system/core`'s `Match<P>` — re-exported so consumers can
 * migrate the import without a type change.
 *
 * @deprecated Import `Match` from `@aiaiai-pt/widget-system/core`.
 */
export type Match<P> = CoreMatch<P>;

/**
 * The render decision. Structurally identical to
 * `@aiaiai-pt/widget-system/core`'s `RenderDecision`.
 *
 * @deprecated Import `RenderDecision` from `@aiaiai-pt/widget-system/core`.
 */
export type RenderDecision = CoreRenderDecision;

/**
 * Run every tester against the binding; the highest applicable score wins.
 * Ties resolve to the first-registered entry (stable, deterministic). Returns
 * `null` when no tester is applicable.
 *
 * DELEGATION (#60): the ranking loop is NOT implemented here. Each
 * Atelier-shaped entry is adapted into a `core.RegistryEntry` whose tester
 * closes over `(binding, schema, type)` — so the full `(binding, schema, type)`
 * tester contract (including `schema`, which the ctx model omits) is preserved
 * — and the loop itself runs in `@aiaiai-pt/widget-system/core.selectEntry`.
 * The `ctx` handed to core is a formality: core invokes `tester(ctx)` once per
 * entry, and our adapted tester ignores it in favour of the closed-over args.
 *
 * @deprecated Use `selectEntry(entries, ctx)` from
 * `@aiaiai-pt/widget-system/core` with `ctx: WidgetMatchContext`.
 */
export function selectEntry<P>(
  entries: ReadonlyArray<RegistryEntry<P>>,
  binding: Binding,
  schema: OntologySchema | null,
  type?: string,
): Match<P> | null {
  const ctx = { kind: binding.kind, type };
  const adapted = entries.map((entry) => ({
    key: entry.key,
    payload: entry.payload,
    // Close over the Atelier-shaped selection inputs; core supplies `ctx` but
    // this adapter reads the richer (binding, schema, type) triple instead.
    tester: () => entry.tester(binding, schema, type),
  }));
  return coreSelectEntry(adapted, ctx);
}

/**
 * Fail-closed per blast radius (§14.8). Given whether a widget matched AND
 * whether its data resolved, decide how the slot renders:
 *   - matched + data ok        → render the widget
 *   - failed, optional slot    → soft-empty (render nothing)
 *   - failed, structural slot  → visible error (MUST NOT silently vanish)
 *
 * DELEGATION (#60): the decision is `@aiaiai-pt/widget-system/core.decideRender`;
 * this adapter only projects the Atelier `Block.importance` field onto the
 * generic `importance` argument.
 *
 * @deprecated Use `decideRender(importance, matched, dataOk)` from
 * `@aiaiai-pt/widget-system/core`, passing `block.importance` directly.
 */
export function decideRender(
  block: Pick<Block, "importance">,
  matched: boolean,
  dataOk: boolean,
): RenderDecision {
  return coreDecideRender(block.importance, matched, dataOk);
}
