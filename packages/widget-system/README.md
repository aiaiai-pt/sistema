# @aiaiai-pt/widget-system

Generic widget registry, dispatch, and transport-neutral widgets for aiaiai products.

## Subpath exports

| Import | Contents |
|--------|----------|
| `@aiaiai-pt/widget-system/core` | `WidgetMatchContext`, `WidgetRenderRequest`, registry factory, dispatch helpers. Zero runtime imports — safe for any environment. |
| `@aiaiai-pt/widget-system/svelte` | Svelte `WidgetRenderer` integration component (S1.3). |
| `@aiaiai-pt/widget-system/widgets` | Pre-built Svelte widgets + `registerBaseWidgets` preload helper. |

No root `"."` export. Always import from a subpath.

## Quick start

```ts
import { createRegistry } from '@aiaiai-pt/widget-system/core';
import { registerBaseWidgets } from '@aiaiai-pt/widget-system/widgets';

// Create an isolated registry and populate it at startup.
const registry = createRegistry();
registerBaseWidgets(registry);

// Selection: pass only kind/type — no data, no props.
const match = registry.resolve({ kind: 'kpi', type: 'stat-grid' });

// Render: the widget receives the data separately.
if (match) renderWidget(match.payload, { data, props, locale });
```

Selection and rendering use two separate objects (`WidgetMatchContext` and
`WidgetRenderRequest`). The registry dispatches on `{ kind, type }`; the
matched widget receives `{ data, props, locale }`. Neither object carries the
other's fields — this matches the JSONForms pattern: testers see the descriptor,
the control sees data.

## Optional peers

`svelte`, `echarts`, and `@aiaiai-pt/design-system` are declared as **optional**
peer dependencies. This means:

- A consumer importing only `/core` (e.g. a headless adapter or test suite) will
  **not** have svelte or echarts force-installed by pnpm's `autoInstallPeers`.
- A consumer importing `/widgets` must have all three available at runtime.
  They will not be auto-installed; if missing, you will get a runtime resolve
  error rather than an install-time warning.

Every real `/widgets` consumer is a Svelte host that already carries these
packages — the optional flag changes only the install-time behaviour, not the
runtime requirement.

## /core purity guarantee

Nothing reachable from `/core` imports svelte, echarts, or
`@aiaiai-pt/design-system` at runtime. This is enforced by a source-level
structural guard test (`tests/core/structural-guard.test.ts`). If you add a
new file under `src/core/`, the test will fail if it contains a forbidden
runtime import.

## TH-08: key provenance

The `type` field in `WidgetMatchContext` is **untrusted** (operator-authored).
It only influences tester scoring; the resolved `key` always comes from the
matched entry's literal `key` field — never from the `type` hint. This prevents
an operator from redirecting dispatch to an unregistered or arbitrary component.
