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

## Svelte rendering (`/svelte`)

`WidgetRenderer` is the Svelte integration (S1.3). It receives its registry,
match context, and observable state **explicitly as props** — there is no
module-global registry or host state, so two renderers (two hosts, two SSR
requests, two tests) never observe each other.

```svelte
<script lang="ts">
  import { createRegistry } from '@aiaiai-pt/widget-system/core';
  import { registerBaseWidgets } from '@aiaiai-pt/widget-system/widgets';
  import { WidgetRenderer, type WidgetState } from '@aiaiai-pt/widget-system/svelte';

  const registry = createRegistry();
  registerBaseWidgets(registry);

  // The host resolves its own transport/policy and reports the OUTCOME as a
  // WidgetState. The widget-system never fetches, authorises, or times anything.
  let state: WidgetState = { status: 'ready', request: { data, props, locale } };
</script>

<WidgetRenderer
  {registry}
  context={{ kind: 'chart' }}
  {state}
  importance="structural"
  messages={{ loading: t('loading'), empty: t('empty'), error: t('error') }}
/>
```

### Observable states

`WidgetState` is a discriminated union of every state a slot can report:
`loading`, `ready`, `stale`, `empty`, `error`, `unauthorized`, `timeout`,
`unsupported`, `overflow`. `ready`/`stale` carry the `WidgetRenderRequest`; the
rest are terminal status states.

The renderer's decision is **fail-closed** (pure `resolveWidgetState`, unit-
testable without a DOM):

- `ready`/`stale` + a matched widget → render the widget (`stale` is flagged).
- `ready`/`stale` with **no** matching registration → corrected to `unsupported`
  (the registry, not the host, is the authority on whether a widget exists).
- `loading` is always shown (transient busy affordance).
- every terminal status is **visible on a `structural` slot** (it must not
  silently vanish) and **soft-empty on an `optional` slot** (it collapses to
  nothing) — the same posture as `decideRender`.

### Error isolation

An optional widget that throws at runtime is caught by a Svelte error boundary:
a `structural` slot surfaces a visible error, an `optional` slot fails soft to
nothing, and **the failure never propagates to the rest of the surface**.

### SSR

`WidgetRenderer` renders deterministically on the server and touches no
browser-only globals; the only client-only work lives inside the mounted
widgets' own effects (e.g. `NativeChartWidget` lazy-loads echarts in an effect).

### String-free (D9)

The package ships no translatable copy. Every user-visible label is caller-
supplied via `messages`; a status with no supplied message still carries its
ARIA role and `data-widget-state` token for assistive tech and tests.

## Generic widgets (`/widgets`)

`registerBaseWidgets(registry)` populates a registry with the two transport-
neutral widgets (S1.4). They register under **distinct kinds** with distinct
testers — there is no shared tester and **no heuristic fallback** between them:

| Key | Kind | Contract |
|-----|------|----------|
| `native-chart` | `chart` | Renders an **already-resolved** `{ category, series }` chart model over the Sistema `EChart` primitive, with its accessible data table. It reads no rows, view, BFF path, ontology schema, or tenant — the host resolves; the widget renders. |
| `embedded-analysis` | `embed` | Renders an `<iframe>` from an **already-authorized, sanitised, short-lived URL** the caller supplies as `props.src`. It knows no signer, grant, resource id, or tenant. `safeEmbedSrc` admits only http(s)/root-relative URLs as defence in depth; an absent or unsafe `src` renders the empty state, never a broken frame. |

The Atelier renderer's coupled `MetabaseEmbedWidget` is **not** moved or replaced
by `embedded-analysis` — it stays until the BFF-resolved trusted-embed seam
exists (BD-META-01, Atelier-owned).

Overflow is a host budget decision surfaced via `WidgetState.overflow`, not
inferred by the widgets: `native-chart` always renders every resolved
category/series into its accessible table (no silent truncation).

## TH-08: key provenance

The `type` field in `WidgetMatchContext` is **untrusted** (operator-authored).
It only influences tester scoring; the resolved `key` always comes from the
matched entry's literal `key` field — never from the `type` hint. This prevents
an operator from redirecting dispatch to an unregistered or arbitrary component.
