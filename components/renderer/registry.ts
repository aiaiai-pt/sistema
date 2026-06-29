/**
 * DS renderer widget registry — the extensible dispatcher layer (#492).
 *
 * Ships a BASE registry with the two clean DS widgets (stat-grid + results-chart)
 * and exposes a `registerWidget` hook so host apps (the portal, the admin) can
 * append their own coupled widgets at startup without modifying this module
 * (open/closed principle, JSONForms model).
 *
 * `dispatch.ts` (the tester/priority core) is the single dispatcher both the DS
 * base registry and host-extended registries share; the registry is generic over
 * the payload so `selectEntry` stays component-free and unit-testable.
 *
 * TH-08 preserved: `resolveWidget` returns the matched entry's known-good `key`
 * literal — the operator's raw block `type`/`binding.kind` is never the key.
 */
import type { Component } from "svelte";
import {
  NOT_APPLICABLE,
  selectEntry,
  type Match,
  type RegistryEntry,
} from "./dispatch";
import type { Block, OntologySchema, WidgetKind, WidgetProps } from "./types";

import ResultsChartWidget from "./ResultsChartWidget.svelte";
import StatGridWidget from "./StatGridWidget.svelte";

export type WidgetComponent = Component<WidgetProps>;

/**
 * A TYPE-specific widget over a shared kind (JSONForms model): the authoring
 * `type` hint ranks it ABOVE the kind-generic widget (score 20 > 10) for the
 * same binding. `type` is UNTRUSTED — it only influences ranking; the resolved
 * key is the entry literal (TH-08).
 */
export function byTypeOnKind(
  key: string,
  kind: WidgetKind,
  component: unknown,
): RegistryEntry<WidgetComponent> {
  return {
    key,
    payload: component as WidgetComponent,
    tester: (binding, _schema, type) =>
      binding.kind === kind && type === key ? 20 : NOT_APPLICABLE,
  };
}

/** A widget whose tester is the generic "binding.kind === K" check (score 10). */
export function byKind(
  key: string,
  kind: WidgetKind,
  component: unknown,
): RegistryEntry<WidgetComponent> {
  return {
    key,
    payload: component as WidgetComponent,
    tester: (binding) => (binding.kind === kind ? 10 : NOT_APPLICABLE),
  };
}

/**
 * Mutable internal registry — base DS entries first, host-registered entries
 * appended in call order. Exported (readonly view) for introspection / testing.
 */
const _entries: RegistryEntry<WidgetComponent>[] = [
  // DS base: the two clean widgets shipped by this package.
  byKind("stat-grid", "kpi", StatGridWidget),
  byTypeOnKind("results-chart", "aggregate", ResultsChartWidget),
];

/**
 * Register a widget in the host-extensible registry. Call at app startup
 * (before any `resolveWidget` calls) to append host-specific widgets. Each
 * entry is appended in call order; ties within the same score resolve to the
 * first-registered entry (stable, deterministic — base entries win ties).
 *
 * Signature mirrors `byKind` / `byTypeOnKind` so the caller writes:
 *   `registerWidget(byKind("entity-list", "list", EntityListWidget))`
 *
 * @param entry - A registry entry built with `byKind`, `byTypeOnKind`, or a
 *   hand-crafted `{ key, payload, tester }` for a custom tester.
 */
export function registerWidget(entry: RegistryEntry<WidgetComponent>): void {
  _entries.push(entry);
}

/**
 * Resolve a block to its widget via the tester/priority dispatcher. Searches
 * the full registry (base DS entries + host-registered). Returns `null` when
 * no widget applies — the caller renders per blast radius (`decideRender`),
 * never interpolating the block's raw `type`/`kind`.
 */
export function resolveWidget(
  block: Block,
  schema: OntologySchema | null = null,
): Match<WidgetComponent> | null {
  return selectEntry(_entries, block.binding, schema, block.type);
}
