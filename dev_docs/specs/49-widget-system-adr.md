# ADR: `@aiaiai-pt/widget-system` — repository, API, dependency, and versioning contract

> **Status**: accepted  
> **Authors**: colivetree  
> **Date**: 2026-07-23  
> **Implements**: #55 (S0.2)  
> **Depends on**: #54 (boundary classification)  
> **Gate for**: #56 (package bootstrap), #57–#59 (extraction), #60–#62 (S2 compat/migration)

---

## Context

`@aiaiai-pt/design-system` (the `sistema` repo) currently ships a mixed
renderer that bundles generic widget runtime behaviour (registry, dispatch,
display transforms, chart utilities) with Atelier application semantics (Block/
Binding, BFF paths, tenant/auth policy). The boundary classification (#54)
assigned every current export to one of four layers; this ADR records the
decisions needed before moving any code.

---

## Decisions

### D1 — Repository ownership

The `@aiaiai-pt/widget-system` package lives in the **`aiaiai-pt/sistema`
repository** as a workspace package under `packages/widget-system/`. Reasons:

1. The initial consumers are tightly coupled to the Sistema renderer; keeping
   them co-located prevents a circular-dependency tangle during the migration
   period.
2. A separate repository is the S3 exit target once zero known consumers use
   the DS compat re-exports (#63–#64). It is a deliberate non-goal of S1–S2.
3. The `aiaiai-pt` organisation is the natural owner; a separate org move is a
   later governance decision.

**Maintainers**: same as `@aiaiai-pt/design-system` until the package has its
own codeowners file.

### D2 — Package name and subpath exports

Package: `@aiaiai-pt/widget-system`

Three **explicit** subpath exports (no barrel `"."`):

| Subpath | Contents |
|---------|----------|
| `@aiaiai-pt/widget-system/core` | `WidgetMatchContext`, `WidgetRenderRequest`, `WidgetTester`, `RegistryEntry`, `Match`, `RenderDecision`, `NOT_APPLICABLE`, `selectEntry`, `decideRender`, `createRegistry`, `byKind`, `byTypeOnKind`, all display transforms, aggregate/chart-spec/chart-option utilities. Zero runtime imports — dependency-free by design. |
| `@aiaiai-pt/widget-system/svelte` | Svelte `WidgetRenderer` integration component (S1.3 #58) |
| `@aiaiai-pt/widget-system/widgets` | `EChartWidget`, `MetabaseEmbedWidget`, `ResultsChartWidget`, `StatGridWidget`; `registerBaseWidgets(registry)` preload helper |

No `"."` root export. Consumers must use a subpath — this prevents accidental
import of the entire package and makes the boundary explicit and auditable.

### D3 — Semantic versioning and compatibility policy

| Signal | Version bump |
|--------|-------------|
| New export added to a subpath | MINOR |
| Bug fix, internal refactor | PATCH |
| Breaking change to any exported type or function | MINOR (0.x era) / MAJOR (post-1.0) |
| Compat re-export removed (after consumer migration) | MAJOR |

The package starts at `0.1.0` (pre-stable).

**0.x managed policy.** During the 0.x era (S1–S2), breaking changes to
exported types or function signatures are allowed in MINOR releases provided:
- the breaking change is logged in CHANGELOG.md under a `### Breaking` heading
- affected consumers are identified before the release
- a migration note describes the before/after call site

This avoids inflating the major version prematurely while the API stabilises.
It does NOT mean breaking changes are made casually — every one is weighed
against consumer burden.

**1.0.0 gate.** The `1.0.0` release is gated on evidence, not a phase label:
- At least one production consumer (Atelier portal or admin) is importing from
  `@aiaiai-pt/widget-system` directly (S2 #60–#62 complete)
- The exported API has been stable (no breaking changes) for ≥ 2 sprint cycles
- A consumer inventory confirms no remaining `@aiaiai-pt/design-system/renderer/*`
  compat re-export imports

**Compat-removal gate (MAJOR).** DS compat re-exports (`@aiaiai-pt/design-system/
renderer/dispatch`, `/renderer/registry`, etc.) may only be removed after:
1. Every consumer in the D7 table has a merged PR importing from
   `@aiaiai-pt/widget-system` directly
2. A CI check confirms zero compat import paths remain across all consumers
3. Release notes, migration guide, and rollback guidance are published
4. A `@aiaiai-pt/design-system` MAJOR version ships the removal

### D4 — Dependency rules (non-negotiable)

The package `dependencies` / `peerDependencies` must **never** contain:

- Any `@atelier/*` package
- Any import path containing: `bff`, `tenant`, `auth`, `grant`, `ontology`,
  `entity`, `action`, `public`, `staff`, `submission`, `consent`,
  `subscription`, `owned-list`
- Any process-global singleton registry (enforced by the isolated factory test
  in S1.2 #57)

Permitted dependencies:
- `svelte` — peer (for `svelte` subpath only)
- `echarts` — peer (for widgets subpath; EChartWidget renders over ECharts)
- `@aiaiai-pt/design-system` — peer (widgets render over DS visual components)

The package itself is **dependency-free** in `core` (pure TypeScript, zero
runtime imports). The `svelte` and `widgets` subpaths may import peer deps.

CI enforces a **dependency-boundary check** that fails if any `core` import
resolves to a peer-dep or to a path that matches the forbidden list above.

### D5 — Match/render contract

Selection and rendering use **two separate objects**. This matches the JSONForms
lineage (the system our registry cites directly): the tester sees the
descriptor (schema + uischema); the matched control receives data separately.
Zero systems reviewed feed runtime data into the matcher.

#### `WidgetMatchContext` — the selection input

```ts
/** Selection input — what the registry dispatches on. No data, no props. */
export interface WidgetMatchContext {
  /** Coarse discriminant — matches the kind-generic widget for this bucket. */
  kind: string;
  /**
   * UNTRUSTED variant hint — ranking only; never becomes the resolved key
   * (TH-08). Caller passes this to get a more-specific widget than the
   * kind-generic default.
   */
  type?: string;
}
```

#### `WidgetRenderRequest` — the generic widget data contract

```ts
/**
 * What the matched widget receives. No Atelier vocabulary; no BFF paths;
 * no ontology schema; no kind/type discriminants.
 */
export interface WidgetRenderRequest {
  /** The resolved data handed to the widget (schema-free). */
  data: unknown;
  /** Operator-authored config (column defs, labels, limits, chart spec). */
  props: Record<string, unknown>;
  /** BCP-47 locale for value formatting only. */
  locale?: string;
}
```

#### Render flow

```ts
const m = registry.resolve({ kind, type });  // WidgetMatchContext — selection
if (m) renderWidget(m.payload, { data, props, locale });  // WidgetRenderRequest — render
```

#### Why the split is correct

Folding `kind`/`type` into the render request (Design B) contaminated the
generic payload every widget receives with an Atelier discriminator — the exact
ownership error #49 exists to remove. The boundary classification puts
`WidgetKind` in Atelier; D5's "invalid extension" explicitly rejects
ontology/author fields on the request.

**Invalid extension** (would fail the dependency boundary check):

```ts
// INVALID — Atelier vocabulary in the generic payload
export interface WidgetRenderRequest {
  data: unknown;
  props: Record<string, unknown>;
  kind: string;         // ← belongs to WidgetMatchContext, not the render payload
  schema: OntologySchema | null;   // ← Atelier ontology type
  dataPath?: string;               // ← Atelier BFF pagination path
}
```

Atelier hosts build two pure projections from one Block:
- `Block → WidgetMatchContext` for `registry.resolve`
- `Block → WidgetRenderRequest` for the widget renderer

`kind`/`type` stay in Atelier and never enter the widget payload.

### D6 — Isolated registry factory and preload pattern (resolves BD-REG-01)

```ts
/** Opaque registry handle — never expose the internal entry array. */
export interface WidgetRegistry<P = unknown, Ctx = WidgetMatchContext> {
  register(entry: RegistryEntry<P, Ctx>, opts?: { override?: boolean }): void;
  resolve(ctx: Ctx): Match<P> | null;
  readonly entries: ReadonlyArray<RegistryEntry<P, Ctx>>;
}

/**
 * Create an isolated, EMPTY registry. Two calls produce two independent
 * instances that cannot observe each other's registrations.
 */
export function createRegistry<P = unknown, Ctx = WidgetMatchContext>(): WidgetRegistry<P, Ctx>;
```

`createRegistry()` returns an **empty** registry. Base widget registration is
explicit via `registerBaseWidgets(registry)` exported from
`@aiaiai-pt/widget-system/widgets`. This removes the hidden coupling of a
baked-in default set and keeps `/core` free of Svelte/ECharts imports.

**Host startup pattern:**

```ts
import { createRegistry } from '@aiaiai-pt/widget-system/core';
import { registerBaseWidgets } from '@aiaiai-pt/widget-system/widgets';

const registry = createRegistry();
registerBaseWidgets(registry);  // populates StatGridWidget, EChartWidget, …

// Selection only — no data/props in the match context.
const m = registry.resolve({ kind: 'kpi', type: 'stat-grid' });
if (m) renderWidget(m.payload, { data, props, locale });
```

**What a deliberate cross-instance leak test looks like** (fails if the
registry is a singleton):

```ts
const r1 = createRegistry();
const r2 = createRegistry();
r1.register(byKind("custom", "kpi", FakeWidget));
// r2 must NOT see "custom"
expect(r2.resolve({ kind: "kpi" })).toBeNull();
```

### D7 — Compatibility and major-removal gates

The DS re-exports `@aiaiai-pt/design-system/renderer/dispatch`,
`@aiaiai-pt/design-system/renderer/registry`, etc. that re-delegate to
widget-system for one release cycle.

**Known consumers** (must migrate before DS major removes compat exports):

| Consumer | Import paths | Migration owner | Gate |
|----------|-------------|-----------------|------|
| `westeuropeco/atelier` portal | `@aiaiai-pt/design-system/renderer/*` | Atelier team | Atelier #884 + S2 #60 |
| `westeuropeco/atelier` admin | `@aiaiai-pt/design-system/renderer/*` | Atelier team | S2 #61 |
| `westeuropeco/portal` (if separate) | same | Atelier team | S2 #62 |

Removal of compat exports requires:
1. Every consumer in the table above has a merged PR consuming `@aiaiai-pt/widget-system` directly.
2. A `@aiaiai-pt/design-system` MAJOR version is published with the compat exports absent.
3. Release notes, migration guide, and rollback guidance are published.

### D8 — Release provenance and rollback

- Releases published to the `aiaiai-pt` npm organisation (scoped, `public`).
- Every release: CHANGELOG entry, provenance attestation via `npm publish
  --provenance`, consumer matrix (which consumers have been tested against this
  version), migration notes, rollback guidance (pin the prior version).
- No pre-release (`alpha`/`beta`) tagging in S1; releases are labelled
  `0.x.y` and treated as pre-stable. The `1.0.0` stable gate is the evidence
  gate in D3.

### D9 — Internationalisation contract (string-free)

Widget-system exports must not contain translatable UI strings. All label copy
must be caller-supplied.

**Why Wuchale cannot reach widget-system strings.** Both the admin and portal
hosts use Wuchale's default extraction scope (`src/**/*.svelte`, `src/**/*.ts`).
Widget-system is a dependency installed in `node_modules`; it is never under
any host's `src/**`, so Wuchale's extractor and Vite transform never see it
regardless of string shape. Extending a host's `wuchale.config.js` `files`
glob to reach `node_modules` would cause the generic package to accumulate a
hard coupling to each host's i18n tool — a violation of the generic→specific
dependency direction.

**The rule.** Every label, caption, column header, and boolean display value
that appears in the browser must come from the caller as a prop. A widget may
keep a bare English development fallback (e.g. `props.title ?? "—"`) for
unset props in dev, but it must never ship a capitalized string that would pass
Wuchale's extraction heuristic as if it were host-managed copy.

Concretely: `title`, `label_header`, `value_header` in chart/stat widgets are
already props. The `"Yes"/"No"` pair in `display.ts` (booleanDisplay `"yes-no"`)
is a string constant that must be replaced with a caller-supplied pair before
the widget moves into this package.

**Enforcement.** The D4 structural guard (CI dependency-boundary check) does
not cover string constants. A separate lint rule or ADR amendment must gate the
presence of user-visible English strings in the package's source before S1.3
(#58) lands the first real widget.

### D10 — Peer dependencies (optional-peer contract)

```jsonc
// @aiaiai-pt/widget-system/package.json
{
  "peerDependencies": {
    "svelte": "^5.0.0",
    "echarts": "^5.0.0",
    "@aiaiai-pt/design-system": "^0.47.0"
  },
  "peerDependenciesMeta": {
    "svelte": { "optional": true },
    "echarts": { "optional": true },
    "@aiaiai-pt/design-system": { "optional": true }
  }
}
```

All three peers are **optional** so a consumer importing only `/core` does not
get svelte, echarts, or the design system force-installed by pnpm's
`autoInstallPeers: true` (the default in pnpm ≥ 10). Under pnpm 10.33.2 (the
workspace lockfile version in this repo), non-optional peers are auto-installed
regardless of which subpath the consumer actually imports.

**Hard rule to keep the split clean:** `/core`'s entrypoint must never
transitively import a `.svelte` file or `echarts` at runtime. The structural
guard test in `tests/core/structural-guard.test.ts` enforces this at the
source level.

**Runtime caveat for `/widgets` consumers.** Making svelte/echarts optional
shifts the "install before rendering" burden to the consumer — a host that
forgets to install them will get a runtime resolve error rather than an
install-time warning. This is acceptable because every real `/widgets` consumer
is a Svelte host that carries these packages already. Documented in the package
README under "Optional peers".

**One package, not two.** A second published package (`@aiaiai-pt/widget-core`)
was evaluated and rejected: the only plausible core-only consumer in H0/H1 is
the `widget-adapters` package in `frontend-platform/`, which already has svelte
installed. The version-coordination cost of a second package outweighs the
install-time benefit for H0/H1. Revisit post-H1 if a genuinely svelte-less
consumer (Python BFF, pure-node resolver) materialises.

---

## Rejected alternatives

### Alt A — Keep everything in `@aiaiai-pt/design-system`

Rejected: the ownership error (widget runtime in a design system) makes it
impossible to use the registry in contexts that do not use DS visual components
(e.g. a headless data pipeline asserting render dispatch). The global singleton
also blocks parallel SSR and test isolation. Extraction is the stated goal of #49.

### Alt B — Move immediately to a separate `aiaiai-pt/widget-system` GitHub repo

Rejected for S1–S2: the migration complexity is too high while consumers still
import from DS. Co-locating in the same npm workspace lets us guarantee the compat
re-exports always point to the same tree and the CI runs together. D1 records this
as a post-S3 option.

### Alt C — One flat `"."` export with everything

Rejected: hides the boundary and makes it trivially easy to import Atelier
vocabulary into a context that should be widget-system-only. Three explicit
subpath exports are auditable; an import of `@aiaiai-pt/widget-system/core`
is guaranteed to be Atelier-free by the dependency-boundary check (D4).

---

## Acceptance checklist (#55)

- [x] ADR chooses repository ownership, maintainers, package name, SemVer
  policy, release provenance, and deprecation window.
- [x] Initial single-package API uses explicit `core`, `svelte`, and `widgets`
  subpath exports.
- [x] Dependency rules forbid `@atelier/*`, BFF/tenant/auth/ontology/
  application vocabulary, and process-global registration.
- [x] `WidgetMatchContext` (selection input) and `WidgetRenderRequest` (render
  payload) are specified as separate types with invalid-extension examples.
- [x] Compatibility and major-removal gates name every known consumer.
- [x] Managed 0.x SemVer policy with evidence-gated 1.0.0 (D3).
- [x] I18N: string-free contract documented; Wuchale scope boundary confirmed (D9).
- [x] Peer deps marked optional with /core purity rule and runtime caveat (D10).
- [x] Preload pattern: empty `createRegistry()` + explicit `registerBaseWidgets` (D6).
