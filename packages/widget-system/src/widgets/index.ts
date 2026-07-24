/**
 * @aiaiai-pt/widget-system/widgets
 *
 * Pre-built Svelte widgets and the `registerBaseWidgets` preload helper.
 *
 * Consumers call `registerBaseWidgets(registry)` at host startup to populate
 * a registry created with `createRegistry()` from `/core`. The preload step
 * is explicit so hosts can extend, override, or skip individual registrations
 * without fighting a baked-in default set.
 *
 * This subpath is the ONLY place in widget-system that imports Svelte, ECharts,
 * or @aiaiai-pt/design-system. /core remains dependency-free by design.
 *
 * Widget extraction is planned for S1.3 (#58). Once StatGridWidget,
 * EChartWidget, ResultsChartWidget, and MetabaseEmbedWidget are moved from
 * components/renderer/ to this package, they will be registered here.
 */

import type { WidgetRegistry, WidgetMatchContext } from "../core/index.ts";

/**
 * Pre-populate `registry` with the standard widget set.
 *
 * Call once at host startup:
 * ```ts
 * import { createRegistry } from '@aiaiai-pt/widget-system/core';
 * import { registerBaseWidgets } from '@aiaiai-pt/widget-system/widgets';
 *
 * const registry = createRegistry();
 * registerBaseWidgets(registry);
 * ```
 *
 * Stub: widget extraction (S1.3 #58) will wire in StatGridWidget,
 * EChartWidget, ResultsChartWidget, and MetabaseEmbedWidget.
 */
export function registerBaseWidgets(
  _registry: WidgetRegistry<unknown, WidgetMatchContext>,
): void {
  // Populated in S1.3 (#58) when widgets are moved into this package.
}
