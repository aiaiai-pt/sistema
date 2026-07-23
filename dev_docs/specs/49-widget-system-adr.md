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
| `@aiaiai-pt/widget-system/core` | `RegistryEntry`, `WidgetTester`, `Match`, `RenderDecision`, `NOT_APPLICABLE`, `selectEntry`, `decideRender`, `createRegistry`, `WidgetRenderRequest`, `byKind`, `byTypeOnKind`, all display transforms, aggregate/chart-spec/chart-option utilities |
| `@aiaiai-pt/widget-system/svelte` | Svelte `WidgetRenderer` integration component (S1.3 #58) |
| `@aiaiai-pt/widget-system/widgets` | `EChartWidget`, `MetabaseEmbedWidget`, `ResultsChartWidget`, `StatGridWidget` |

No `"."` root export. Consumers must use a subpath — this prevents accidental
import of the entire package and makes the boundary explicit and auditable.

### D3 — Semantic versioning policy

| Signal | Version bump |
|--------|-------------|
| New export added to a subpath | MINOR |
| Breaking change to any exported type or function | MAJOR |
| Bug fix, internal refactor, compat re-export update | PATCH |
| Compat re-export removed (after consumer migration) | MAJOR |

The package starts at `0.1.0` (pre-stable). A `1.0.0` release marks the
first production consumer migration completing S2 (#60–#62). The major version
is bumped in S3 (#63–#64) when DS compat re-exports are removed and the package
is considered stable.

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

### D5 — `WidgetRenderRequest` — the generic widget contract

```ts
/**
 * The generic per-widget data contract. Every widget in widget-system/widgets
 * receives this shape. No Atelier vocabulary; no BFF paths.
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

**Invalid extension** (would fail the dependency boundary check):

```ts
// INVALID — this belongs in Atelier, not widget-system
export interface WidgetRenderRequest {
  data: unknown;
  props: Record<string, unknown>;
  schema: OntologySchema | null;   // ← Atelier ontology type
  app?: string;                    // ← Atelier vertical app segment
  dataPath?: string;               // ← Atelier BFF pagination path
}
```

Atelier hosts pass `ownsH1`, `schema`, `dataPath`, etc. through their own
extension type and spread them as additional Svelte component props. The
widgets in the package must not declare or read these fields.

### D6 — Isolated registry factory (resolves BD-REG-01)

```ts
/** Opaque registry handle — never expose the internal entry array. */
export interface WidgetRegistry {
  register(entry: RegistryEntry<WidgetComponent>): void;
  resolve(request: WidgetRenderRequest, type?: string): Match<WidgetComponent> | null;
}

/**
 * Create an isolated registry preloaded with the base DS widgets.
 * Two calls produce two independent instances that cannot observe
 * each other's registrations.
 */
export function createRegistry(): WidgetRegistry;
```

**What a deliberate cross-instance leak test looks like** (fails if the
registry is a singleton):

```ts
const r1 = createRegistry();
const r2 = createRegistry();
r1.register(byKind("custom", "kpi", FakeWidget));
// r2 must NOT see "custom"
expect(r2.resolve({ data: null, props: {} }, "custom")).toBeNull();
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
  `0.x.y` and treated as pre-stable. The `1.0.0` stable gate is S2 completion.

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
- [x] `WidgetRenderRequest`, registry, dispatch, state, and extension
  contracts are specified with invalid examples.
- [x] Compatibility and major-removal gates name every known consumer.
