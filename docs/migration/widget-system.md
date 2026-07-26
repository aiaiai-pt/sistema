# Migrating off the deprecated Sistema renderer onto `@aiaiai-pt/widget-system`

> Status: S2 (#60) compatibility window. The deprecated import surface below
> keeps working through `@aiaiai-pt/design-system@0.x`. It is removed in the
> next MAJOR (`1.0.0`, S3), only after compatibility usage across verified
> consumers (Admin, workspace, Portal) reaches zero (#62).

## Why

The generic tester/priority dispatch and the isolated widget registry were
extracted from the Sistema renderer into a separately versioned package,
`@aiaiai-pt/widget-system` (S1, #49). Sistema now **delegates** the ranking
algorithm to that package instead of shipping a second implementation. The old
`@aiaiai-pt/design-system/renderer/*` imports still resolve for one migration
window so consumers can move deliberately, file by file.

## Classification — read this before you migrate

Not everything under `renderer/` is a widget-system API. Migrate only the
**GENERIC** exports to widget-system. The **ATELIER-COUPLED** exports move to the
Atelier `@atelier/*` layer on a different track (they are not part of this
window and must not be re-pointed at widget-system).

| Renderer export | Class | Destination |
|---|---|---|
| `renderer/dispatch`: `selectEntry`, `decideRender`, `NOT_APPLICABLE`, `WidgetTester`, `RegistryEntry`, `Match`, `RenderDecision` | **GENERIC** | `@aiaiai-pt/widget-system/core` |
| `renderer/registry`: `registerWidget`, `resolveWidget`, `byKind`, `byTypeOnKind` | **GENERIC** (registry machinery) | `@aiaiai-pt/widget-system/core` + `/widgets` |
| `renderer/registry`: `WidgetComponent` (`= Component<WidgetProps>`) | **ATELIER-COUPLED** | Atelier host. The registry *machinery* is generic, but this type alias is not: `WidgetProps` carries Atelier vocabulary (`schema`, `actionDef`, `app`, …) and is structurally incompatible with widget-system's `WidgetComponent = Component<WidgetRenderRequest>`. A migrated host uses the widget-system type for generic widgets and keeps `Component<WidgetProps>` only for Atelier-coupled widgets. |
| `renderer/types`: `Block`, `Binding`, `OntologySchema`, `WidgetKind`, `WidgetProps`, `BlockImportance` | **ATELIER-COUPLED** | `@atelier/*` (Block/Binding/SurfaceTemplate semantics) — stays in Sistema during the window |
| `renderer/resolve-data`, `data-provider`, `vote`, `aggregate`, `display`, `grid`, `chart-option`, `chart-spec` | **ATELIER-COUPLED** (data pipeline) | `@atelier/*` — not widget-system |
| `renderer/StatGridWidget`, `ResultsChartWidget`, `EChartWidget`, `MetabaseEmbedWidget` (`.svelte`) | **ATELIER-COUPLED** widgets | Atelier host. `MetabaseEmbedWidget` stays until the BFF-resolved trusted-embed seam exists (BD-META-01, Atelier-owned). |
| generic chart / embed | GENERIC | `@aiaiai-pt/widget-system/widgets`: `NativeChartWidget`, `EmbeddedAnalysisWidget` |

## Import map (GENERIC exports)

### Dispatch

```ts
// BEFORE — deprecated
import {
  selectEntry, decideRender, NOT_APPLICABLE,
  type WidgetTester, type RegistryEntry, type Match, type RenderDecision,
} from "@aiaiai-pt/design-system/renderer/dispatch";

// AFTER
import {
  selectEntry, decideRender, NOT_APPLICABLE,
  type WidgetTester, type RegistryEntry, type Match, type RenderDecision,
  type WidgetMatchContext,
} from "@aiaiai-pt/widget-system/core";
```

**Signature change — this is not a drop-in rename.** The Sistema tester is
Atelier-shaped: `(binding, schema, type) => number`. The widget-system tester is
ctx-shaped: `(ctx: WidgetMatchContext) => number`, where
`WidgetMatchContext = { kind: string; type?: string }`.

```ts
// BEFORE — tester reads a Binding (+ schema + type)
const t: WidgetTester = (binding, _schema, type) =>
  binding.kind === "kpi" && type === "stat-grid" ? 20 : NOT_APPLICABLE;

// AFTER — tester reads a match context
const t: WidgetTester = (ctx) =>
  ctx.kind === "kpi" && ctx.type === "stat-grid" ? 20 : NOT_APPLICABLE;
```

At the call boundary, build the ctx from your Atelier block:
`const ctx = { kind: block.binding.kind, type: block.type }`.

> `schema` has no place in the generic ctx model. If a custom tester genuinely
> needs the ontology schema to rank, that ranking is Atelier policy — keep it in
> the Atelier layer and pass a pre-computed discriminant into `ctx.type`, rather
> than widening the generic contract.

`decideRender` takes the importance directly instead of a `Block`:

```ts
// BEFORE
decideRender(block, matched, dataOk);
// AFTER
decideRender(block.importance, matched, dataOk);
```

### Registry

The Sistema base registry is a module-global singleton preloaded with the DS
widgets. widget-system replaces it with an **isolated** factory the host owns,
so two hosts (or an SSR pass and a client pass) never share registration state.

```ts
// BEFORE — deprecated module-global
import { registerWidget, resolveWidget, byKind, byTypeOnKind }
  from "@aiaiai-pt/design-system/renderer/registry";
registerWidget(byKind("entity-list", "list", EntityListWidget));
const match = resolveWidget(block, schema);

// AFTER — host-owned isolated registry
import { createRegistry, byKind, byTypeOnKind }
  from "@aiaiai-pt/widget-system/core";
import { registerBaseWidgets } from "@aiaiai-pt/widget-system/widgets";

const registry = createRegistry();      // isolated — not a singleton
registerBaseWidgets(registry);          // opt-in preload of the generic set
registry.register(byKind("entity-list", "list", EntityListWidget));

const match = registry.resolve({ kind: block.binding.kind, type: block.type });
```

Note `registerBaseWidgets` preloads only the **generic** widgets
(`native-chart`, `embedded-analysis`). The Atelier-specific base widgets
(`stat-grid`, `results-chart`, `chart`, `metabase-embed`) are registered by the
Atelier host, not by widget-system.

## Measuring compatibility usage (gate to S3)

Removal (#62 / S3) is scheduled only when this count reaches zero across each
verified consumer:

```bash
# deprecated generic renderer imports still in use
rg -n "@aiaiai-pt/design-system/renderer/(dispatch|registry)" src/
```

Atelier-coupled renderer imports (`renderer/types`, `resolve-data`, …) are
**expected to remain** during the window and are tracked separately on the
Atelier `@atelier/*` extraction track — they are not part of this count.
