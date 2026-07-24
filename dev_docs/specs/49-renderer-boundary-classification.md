# Renderer boundary classification — S0.1 (#54)

> **Status**: accepted  
> **Author**: colivetree  
> **Depends on**: #49 (programme epic)  
> **Gate for**: #55 (contract ADR), #56 (package bootstrap), #57–#59 (extraction)

---

## Purpose

Assign every current `components/renderer/` export — and every top-level
`components/` export that is part of the renderer surface — to exactly one
destination layer: **Sistema**, **widget-system**, or **Atelier**. No item is
classified purely because of where it currently lives. Each blocking decision
is named and must be resolved before movement.

### Layer vocabulary

| Layer | Package | Rule |
|-------|---------|------|
| **Sistema** | `@aiaiai-pt/design-system` | Visual foundations: tokens, themes, accessible primitives, pure CSS layout helpers, ECharts/StatGrid naked components. No widget runtime. |
| **widget-system** | `@aiaiai-pt/widget-system` (new) | Generic registry/dispatch, render-state contracts, Svelte integration, transport-neutral widgets over Sistema components. No `@atelier/*` import, no BFF/tenant/auth/ontology/application vocabulary. |
| **Atelier** | `@atelier/*` | `Block`/`Binding` semantics, provider/action shapes, BFF paths, tenant/auth/ontology/public-staff policy, application behaviour. |

---

## `components/renderer/` — file-by-file

### `dispatch.ts`

| Export | Current consumers | Target | Compat export | Removal gate |
|--------|------------------|--------|--------------|-------------|
| `NOT_APPLICABLE` | registry.ts, tests | **widget-system/core** | `@aiaiai-pt/design-system/renderer/dispatch` re-exports from widget-system | After S2 consumer migration (#60–#62) |
| `WidgetTester` | registry.ts, tests | **widget-system/core** | same | same |
| `RegistryEntry<P>` | registry.ts, tests | **widget-system/core** | same | same |
| `Match<P>` | registry.ts, tests | **widget-system/core** | same | same |
| `selectEntry<P>` | registry.ts, tests | **widget-system/core** | same | same |
| `RenderDecision` | (future callers) | **widget-system/core** | same | same |
| `decideRender` | resolve-data callers | **widget-system/core** | same | same |

**Atelier identification**: none. `dispatch.ts` is entirely generic over
payload `P` and takes `Binding` only through the tester signature; it
carries no URL, entity, action, tenant, grant, or application vocabulary.

**Classification confidence**: HIGH. The generic tester/priority core was
already written to be component-free and unit-testable without SvelteKit.

---

### `registry.ts`

| Export | Current consumers | Target | Compat export | Removal gate |
|--------|------------------|--------|--------------|-------------|
| `byKind` | hosts at startup | **widget-system/core** | DS re-export | S2 |
| `byTypeOnKind` | hosts at startup | **widget-system/core** | DS re-export | S2 |
| `registerWidget` | hosts at startup | **BLOCKING** — see below | — | — |
| `resolveWidget` | Atelier page renderer | **BLOCKING** — see below | — | — |
| `_entries` (readonly) | tests | **widget-system/core** | dropped in major | S3 |
| `WidgetComponent` | hosts | **widget-system/svelte** | DS re-export | S2 |

**Atelier identification**: `resolveWidget(block, schema)` takes `Block` and
`OntologySchema` — both Atelier types. The current `registerWidget` pushes to a
**process-global mutable singleton** that leaks across hosts, SSR requests, and
parallel tests.

**Blocking decision BD-REG-01**: `registerWidget` and `resolveWidget` cannot
move as-is. The new package must expose a **factory** that returns an isolated
registry instance. `resolveWidget` in widget-system takes a `WidgetRenderRequest`
(see BD-PROPS-01 below), not `Block`. Atelier constructs a `Block`→
`WidgetRenderRequest` adapter and passes it to the widget-system registry.
The DS compat re-export wraps the factory with the current global-singleton
behaviour for one release cycle, then removes it.

---

### `types.ts`

| Export | Current consumers | Target | Compat export | Removal gate |
|--------|------------------|--------|--------------|-------------|
| `Block` | resolve-data, registry, grid, tests, Atelier hosts | **Atelier** | — | N/A (never in DS public API) |
| `Binding` | dispatch, registry, resolve-data, data-provider, tests | **Atelier** | — | N/A |
| `WidgetKind` | types, resolve-data, registry, tests | **Atelier** | — | N/A |
| `FeedView` | resolve-data | **Atelier** | — | N/A |
| `BlockImportance` | types | **Atelier** | — | N/A |
| `BlockLock` | types | **Atelier** | — | N/A |
| `PageDescriptor` | (Atelier hosts) | **Atelier** | — | N/A |
| `OntologySchema` | types, registry, resolve-data, data-provider | **Atelier** | — | N/A |
| `BlockLayout` | grid.ts | **Sistema** — move to `grid.ts` itself | — | N/A |
| `WidgetProps` | widget Svelte files, tests | **BLOCKING** — see BD-PROPS-01 | — | — |

**Atelier identification**: `WidgetKind` enumerates Atelier portal kinds
(`list`, `detail`, `form`, `subscriptions`, `consent`, `owned-list`, …) that
reference BFF paths, tenant policy, and public/staff surfaces. `Binding` carries
`entity`, `action`, `filter`, `limit`, `order`, `expand` — all BFF/ontology
vocabulary. `OntologySchema` is ontology-specific.

**Blocking decision BD-PROPS-01**: `WidgetProps` is a single type that mixes
generic widget data with Atelier concerns:
- Generic (widget-system): `data: unknown`, `props: Record<string, unknown>`,
  `locale?: string`
- Atelier: `schema: OntologySchema | null`, `actionDef: unknown | null`,
  `app?: string`, `ownsH1?: boolean`, `dataPath?: string`, `now?: string`

Resolution: widget-system defines `WidgetRenderRequest { data: unknown; props:
Record<string, unknown>; locale?: string }`. Atelier extends it with its own
`AtlierWidgetProps`. The Svelte widget files in widget-system use
`WidgetRenderRequest` only; Atelier spreads its additional props and the widgets
ignore unknown props.

---

### `registry.ts` — Svelte widget imports

The base DS entries in `_entries` import four Svelte components:

| Import | Target |
|--------|--------|
| `EChartWidget.svelte` | **widget-system/widgets** |
| `MetabaseEmbedWidget.svelte` | **widget-system/widgets** |
| `ResultsChartWidget.svelte` | **widget-system/widgets** |
| `StatGridWidget.svelte` | **widget-system/widgets** |

These move with the registry; the base entry list migrates to the new package.

---

### `display.ts`

| Export | Current consumers | Target | Compat export | Removal gate |
|--------|------------------|--------|--------------|-------------|
| `formatScalar` | admin, portal display cells | **widget-system/core** | DS re-export | S2 |
| `isIsoTimestamp` | display cells | **widget-system/core** | DS re-export | S2 |
| `formatTimestamp` | display cells | **widget-system/core** | DS re-export | S2 |
| `formatDateTime` | display cells | **widget-system/core** | DS re-export | S2 |
| `displayCell` | admin, portal display cells | **widget-system/core** | DS re-export | S2 |
| `statusLabel` | status widgets | **widget-system/core** | DS re-export | S2 |
| `statusVariant` | status widgets | **widget-system/core** | DS re-export | S2 |
| `resolveStatusBadge` | status widgets | **widget-system/core** | DS re-export | S2 |
| `geoPoint` | map widgets | **widget-system/core** | DS re-export | S2 |
| `ObjectFallback` | display cells | **widget-system/core** | DS re-export | S2 |
| `BooleanDisplay` | display cells | **widget-system/core** | DS re-export | S2 |

**Atelier identification**: none. `display.ts` is explicitly documented as
"PURE and dependency-free". It has no BFF path, no ontology type, no auth
or tenant reference. The `objectFallback: "redact" | "json"` host fork is a
plain parameter, not an Atelier dependency.

**Classification confidence**: HIGH. Both the portal (public, redact default)
and admin (json dump) already consume the same module with different option
values — exactly the shared-utility pattern.

---

### `grid.ts`

| Export | Current consumers | Target | Compat export | Removal gate |
|--------|------------------|--------|--------------|-------------|
| `GRID_COLUMNS` | grid.ts, tests | **Sistema** | — | N/A |
| `normalizeLayout` | gridStyleFor | **Sistema** | — | N/A |
| `gridStyleFor` | portal/admin page renderers | **Sistema** | — | N/A |
| `hasGridLayout` | portal/admin page renderers | **Sistema** | — | N/A |
| `BlockLayout` | (exported via types.ts today) | **Sistema** — move into grid.ts | DS re-export from types.ts → grid.ts | S3 |

**Atelier identification**: `gridStyleFor` and `hasGridLayout` currently accept
`Pick<Block, "layout">` from Atelier's `Block` type. The pure CSS math has no
BFF/tenant/auth knowledge; the `Block` dependency is a type-import artefact.

**Resolution**: define a local `HasLayout` interface in `grid.ts`
(`{ layout?: BlockLayout }`). `BlockLayout` moves from `types.ts` into
`grid.ts` so the grid module has zero Atelier imports. Atelier's `Block` remains
structurally compatible without change.

---

### `aggregate.ts`

| Export | Current consumers | Target | Compat export | Removal gate |
|--------|------------------|--------|--------------|-------------|
| `RankedItem` | ResultsChartWidget, tests | **widget-system/core** | DS re-export | S2 |
| `ToRankedOptions` | tests | **widget-system/core** | DS re-export | S2 |
| `toRankedItems` | ResultsChartWidget, EChartWidget, tests | **widget-system/core** | DS re-export | S2 |
| `ChartSeriesType` | chart-spec.ts, EChartWidget | **widget-system/core** | DS re-export | S2 |
| `ChartSeriesSpec` | chart-spec.ts, aggregate.ts | **widget-system/core** | DS re-export | S2 |
| `ChartOptions` | chart-spec.ts | **widget-system/core** | DS re-export | S2 |
| `ChartSpec` | EChartWidget, chart-spec.ts, chart-option.ts | **widget-system/core** | DS re-export | S2 |
| `SeriesData` | chart-option.ts, tests | **widget-system/core** | DS re-export | S2 |
| `ChartData` | chart-option.ts, EChartWidget, tests | **widget-system/core** | DS re-export | S2 |
| `toSeriesData` | EChartWidget, tests | **widget-system/core** | DS re-export | S2 |

**Atelier identification**: none. `aggregate.ts` is pure column-projection math
(`toRankedItems`, `toSeriesData`) over `Record<string, unknown>` rows.
Vertical-agnostic — the comments explicitly note "any group_by + count/sum view
becomes a chart from config alone."

---

### `chart-spec.ts`

| Export | Current consumers | Target | Compat export | Removal gate |
|--------|------------------|--------|--------------|-------------|
| `asChartSpec` | EChartWidget, tests | **widget-system/core** | DS re-export | S2 |

**Atelier identification**: none. Pure whitelist validation over `unknown` input;
returns `ChartSpec | null`. No BFF/ontology reference.

---

### `chart-option.ts`

| Export | Current consumers | Target | Compat export | Removal gate |
|--------|------------------|--------|--------------|-------------|
| `ChartTokens` | EChartWidget | **widget-system/core** | DS re-export | S2 |
| `BuildChartOptionOpts` | EChartWidget, tests | **widget-system/core** | DS re-export | S2 |
| `buildChartOption` | EChartWidget, tests | **widget-system/core** | DS re-export | S2 |
| `seriesColor` | tests | **widget-system/core** | DS re-export | S2 |

**Atelier identification**: none. Pure ECharts `option` builder; DS token-driven
through `ChartTokens` parameters, never hardcoded. Documented: "DS-supplied
formatter functions … NOT operator-authored functions."

---

### `resolve-data.ts`

| Export | Current consumers | Target | Compat export | Removal gate |
|--------|------------------|--------|--------------|-------------|
| `PRESENTATIONAL_KINDS` | resolve-data callers | **Atelier** | — | N/A |
| `resolveData` | portal/admin route loaders | **Atelier** | — | N/A |
| `bffPathForBinding` | data-provider | **Atelier** | — | N/A |
| `schemaPathForBinding` | data-provider | **Atelier** | — | N/A |
| `appendQuery` | data-provider, vote | **Atelier** | — | N/A |
| `FetchLike` | data-provider, vote | **Atelier** | — | N/A |
| `ResolvedData` | callers | **Atelier** | — | N/A |

**Atelier identification** (explicit): BFF path construction for `list`, `detail`,
`form`, `map`, `calendar`, `kpi`, `aggregate`, `subscriptions`, `consent`,
`deliveries`, `owned-list` kinds; account proxy paths (`/me/notifications/…`,
`/me/consent`); public schema paths; vote edition/options paths. Security
invariant comment: "a non-OK upstream yields `{ ok: false }` … caller renders
per blast radius." Knows `/{app}/public/` prefix, `filter_params`, `calendarWindow`.

---

### `data-provider.ts`

| Export | Current consumers | Target | Compat export | Removal gate |
|--------|------------------|--------|--------------|-------------|
| `DataProvider` | resolve-data, hosts | **Atelier** | — | N/A |
| `DataUrlOpts` | DataProvider | **Atelier** | — | N/A |
| `createPublicDataProvider` | portal route loaders, tests | **Atelier** | — | N/A |

**Atelier identification** (explicit): the inline SECURITY INVARIANT comment
reads "NEVER share one transport across both hosts. NEVER let a public widget
read through an authed token… A 'simplification' that collapses the two
providers is a tenant/RLS leak." Knows BFF path construction, tenant/auth
security boundary, `/{app}/public/` prefix.

---

### `vote.ts`

| Export | Current consumers | Target | Compat export | Removal gate |
|--------|------------------|--------|--------------|-------------|
| All exports | `VotingWidget.svelte`, resolve-data, tests | **Atelier** | — | N/A |

**Atelier identification**: constructs BFF paths for civic vote edition reads
(`editionReadPath`, `optionsReadPath`) and the citizen public-submit cast.
References `/bff`, bearer auth, civic entity vocabulary (edition, options, ballot,
pseudonym). Explicitly documented: "vertical-agnostic: every entity / field /
status / phase literal is block DATA" — but the TRANSPORT and auth semantics
(WritesFetch + bearer) are Atelier.

---

### `EChartWidget.svelte`

**Target**: **widget-system/widgets**

Current imports: `../EChart.svelte` (Sistema), `./types` (Atelier via
`WidgetProps`), `./aggregate`, `./chart-spec`. Post-extraction: imports
`@aiaiai-pt/design-system` for `EChart`, `@aiaiai-pt/widget-system/core` for
`aggregate`/`chart-spec`, and uses `WidgetRenderRequest` (BD-PROPS-01).

---

### `MetabaseEmbedWidget.svelte`

**Target**: **widget-system/widgets**

Presentational: renders an `<iframe>` from `props.src` (a host-resolved
signed/proxy URL). Carries no Metabase auth, no signing, no resource ID, no
grant. The `src` is already sanitized by the host before reaching the widget.
Uses `WidgetProps` today → migrates to `WidgetRenderRequest`.

---

### `ResultsChartWidget.svelte`

**Target**: **widget-system/widgets**

Renders a pure-CSS accessible bar chart (the a11y fallback for EChart). Pure
presentation over `{ items }` data. Uses `WidgetProps` → migrates to
`WidgetRenderRequest`.

---

### `StatGridWidget.svelte`

**Target**: **widget-system/widgets**

Renders DS `StatGrid` + `StatCard` over `data.stats` / `props.stats`. Uses
`WidgetProps` → migrates to `WidgetRenderRequest`.

---

## `components/` — top-level exports that are part of the renderer surface

| File | Export | Target |
|------|--------|--------|
| `ActionFormRenderer.svelte` | `ActionFormRenderer` | **Atelier** — action execution runtime (action shape, BFF submit lane) |
| `action-form-renderer-widgets.ts` | `widgetKind`, `FULL_WIDTH_WIDGET_KINDS`, `dateOnlyToDate`, etc. | **Atelier** — dispatch vocabulary tightly coupled to Atelier action-form surface |
| `action-form-renderer-layouts.ts` | `resolveLayout`, layout components | **Atelier** — ActionFormRenderer layout dispatch (TH-08 re-apply for action params) |
| `action-form-renderer-payload.ts` | `buildNormalizedPayload`, `RendererMode` | **Atelier** — action payload shape, BFF submission contract |
| `action-form-renderer-relationships.ts` | `relationshipMeta`, `RelationshipMeta`, etc. | **Atelier** — relationship meta from ontology `ui_schema.relationship`, cardinality |
| `action-form-visibility.ts` | `evaluateVisibleWhen`, `sectionVisible`, `isBlankFormValue` | **Atelier** — `visible_when` evaluation for action sections; ActionPrecondition vocabulary |
| `VotingWidget.svelte` | `VotingWidget` | **Atelier** — civic vote submission, BFF bearer, edition/ballot semantics |
| `WidgetGrid.svelte` | `WidgetGrid` | **Sistema** — pure CSS column layout primitive; no widget runtime semantics |

---

## Summary: blocking decisions

### BD-PROPS-01 — `WidgetProps` split

`WidgetProps` mixes generic widget contract (`data`, `props`, `locale`) with
Atelier concerns (`schema`, `actionDef`, `app`, `ownsH1`, `dataPath`, `now`).

**Resolution** (to be recorded in the S0.2 ADR):
- widget-system defines `WidgetRenderRequest { data: unknown; props:
  Record<string, unknown>; locale?: string }`.
- The four DS-base widget Svelte files use only `WidgetRenderRequest`.
  (`ownsH1` is used only by `EChartWidget`; it remains as an optional prop
  extension on that component's local interface, not the shared contract.)
- Atelier defines its own `AtlierWidgetProps` extension for the additional
  fields it threads from route loaders.
- Compat: DS re-exports `WidgetProps` as an alias of `WidgetRenderRequest` for
  one release cycle (structural compatibility is preserved since the Svelte
  components no longer read the Atelier-only fields).

### BD-REG-01 — global singleton registry

`registry.ts` uses a process-global `_entries` array that leaks across SSR
requests, parallel tests, and multiple hosts.

**Resolution** (recorded in S0.2 ADR / implemented in S1.2 #57):
- widget-system exposes `createRegistry()` returning an isolated
  `WidgetRegistry` instance.
- DS compat re-exports `registerWidget` / `resolveWidget` wrapping a
  module-singleton registry for one release cycle.
- Two parallel test suites calling `createRegistry()` independently cannot
  observe each other's extensions.

### BD-GRID-01 — `BlockLayout` in `types.ts` / `Block` import in `grid.ts`

`BlockLayout` (a pure CSS coordinate type) lives in `types.ts` alongside
Atelier types. `grid.ts` imports `Block` from the same file to type its
`Pick<Block, "layout">` parameters.

**Resolution**:
- Move `BlockLayout` into `grid.ts` itself.
- Replace `Pick<Block, "layout">` with a local `HasLayout` structural interface.
- `types.ts` re-exports `BlockLayout` from `grid.ts` for one release cycle
  (existing consumers see no change).
- After S2: `types.ts` drops the re-export in the major.

---

## Destination summary

| Destination | Files / exports |
|-------------|----------------|
| **widget-system/core** | `dispatch.ts`, `display.ts`, `aggregate.ts`, `chart-spec.ts`, `chart-option.ts`; `byKind`, `byTypeOnKind`, `createRegistry` (refactored from `registry.ts`); new `WidgetRenderRequest` type |
| **widget-system/svelte** | `WidgetRenderer.svelte` (new Svelte integration component — S1.3 #58) |
| **widget-system/widgets** | `EChartWidget.svelte`, `MetabaseEmbedWidget.svelte`, `ResultsChartWidget.svelte`, `StatGridWidget.svelte` |
| **Sistema** | `grid.ts` (with `BlockLayout` absorbed + `HasLayout` local interface); `WidgetGrid.svelte`; all visual components |
| **Atelier** | `types.ts` (minus `BlockLayout`), `resolve-data.ts`, `data-provider.ts`, `vote.ts`, `ActionFormRenderer.svelte`, all `action-form-renderer-*`, `action-form-visibility.ts`, `VotingWidget.svelte` |

## Acceptance checklist

- [x] Inventory covers types, registry, dispatch, data/resolve providers,
  layout, charts, Metabase, action form, vote, consent, subscriptions, owned
  lists, and display policy.
- [x] Each row records current consumers/dependencies, target, compatibility
  export, release, and removal gate.
- [x] Atelier URL, entity/action, tenant, public/staff, grant, and
  application-code knowledge is explicitly identified.
- [x] No item is classified solely because it currently lives under
  `components/renderer/`.
- [x] Unknowns block movement (BD-PROPS-01, BD-REG-01, BD-GRID-01) rather than
  defaulting into a generic package.
