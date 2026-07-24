/**
 * @aiaiai-pt/widget-system/widgets
 *
 * Pre-built, transport-neutral Svelte widgets and the `registerBaseWidgets`
 * preload helper.
 *
 * Consumers call `registerBaseWidgets(registry)` at host startup to populate a
 * registry created with `createRegistry()` from `/core`. The preload step is
 * explicit so hosts can extend, override, or skip individual registrations
 * without fighting a baked-in default set (D6).
 *
 * This subpath is the ONLY place in widget-system that imports Svelte, ECharts,
 * or @aiaiai-pt/design-system. /core remains dependency-free by design (enforced
 * by the /core structural guard).
 *
 * S1.4 (#59) ships the first two generic widgets:
 *  - NativeChartWidget      — an already-resolved chart model over Sistema EChart.
 *  - EmbeddedAnalysisWidget — an already-authorized, sanitised short-lived URL.
 *
 * They register under DISTINCT kinds (`chart` / `embed`) with distinct testers.
 * There is no shared tester and no heuristic fallback between them: a `chart`
 * context never resolves to the embed widget, and vice versa.
 *
 * The Atelier renderer's coupled MetabaseEmbedWidget (components/renderer/) is
 * intentionally NOT moved or replaced here — it stays until the BFF-resolved
 * trusted-embed seam exists (BD-META-01, Atelier-owned).
 */

import type { Component } from "svelte";
import {
  byKind,
  type WidgetMatchContext,
  type WidgetRegistry,
  type WidgetRenderRequest,
} from "../core/index.ts";
import NativeChartWidget from "./NativeChartWidget.svelte";
import EmbeddedAnalysisWidget from "./EmbeddedAnalysisWidget.svelte";

/** The registry shape a Svelte host uses — payloads are widget components. */
export type WidgetComponent = Component<WidgetRenderRequest>;

/** The registry key each base widget resolves to (known-good literals, TH-08). */
export const NATIVE_CHART_KEY = "native-chart";
export const EMBEDDED_ANALYSIS_KEY = "embedded-analysis";

/** The coarse match-context kind each base widget answers for. */
export const NATIVE_CHART_KIND = "chart";
export const EMBEDDED_ANALYSIS_KIND = "embed";

/**
 * Pre-populate `registry` with the standard generic widget set.
 *
 * Call once at host startup:
 * ```ts
 * import { createRegistry } from '@aiaiai-pt/widget-system/core';
 * import { registerBaseWidgets } from '@aiaiai-pt/widget-system/widgets';
 *
 * const registry = createRegistry();
 * registerBaseWidgets(registry);
 *
 * registry.resolve({ kind: 'chart' }); // → native-chart
 * registry.resolve({ kind: 'embed' }); // → embedded-analysis
 * ```
 *
 * Each entry is a kind-generic registration (score 10). A host may register a
 * more-specific type-ranked widget over the same kind, or override a base entry
 * with `{ override: true }`.
 */
export function registerBaseWidgets(
  registry: WidgetRegistry<WidgetComponent, WidgetMatchContext>,
): void {
  registry.register(
    byKind(NATIVE_CHART_KEY, NATIVE_CHART_KIND, NativeChartWidget as WidgetComponent),
  );
  registry.register(
    byKind(
      EMBEDDED_ANALYSIS_KEY,
      EMBEDDED_ANALYSIS_KIND,
      EmbeddedAnalysisWidget as WidgetComponent,
    ),
  );
}

export { default as NativeChartWidget } from "./NativeChartWidget.svelte";
export { default as EmbeddedAnalysisWidget } from "./EmbeddedAnalysisWidget.svelte";
export { safeEmbedSrc } from "./embed-url.ts";
