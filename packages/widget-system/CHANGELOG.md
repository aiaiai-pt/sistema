# Changelog — `@aiaiai-pt/widget-system`

Separately versioned from `@aiaiai-pt/design-system`. SemVer: fix → PATCH,
feat → MINOR, breaking → MAJOR.

## [Unreleased]

### Added — the investigations card faces as widget kinds

Four registered, transport-neutral faces. Each is a FACE only: no arrangement,
no transport, no product vocabulary — so the same card renders on a board, a
profile and a painel, and only the arrangement differs. Bespoke per-surface
faces are what kill card travel, which is why these are registry kinds rather
than components in a product package.

| kind | key | law it enforces |
|---|---|---|
| `stream` | `entry-stream` | an undeclared entry kind throws rather than falling back — a machine line rendered as an utterance mis-attributes it |
| `indicator` | `indicator-card` | it never fetches; drill is a callback carrying the caller's opaque ref |
| `members` | `definition-members-card` | members are never a naked list — no provenance header, no render |
| `chart-mock` | `chart-tile-mock` | a mock never renders unmarked — an unearmarked placeholder is indistinguishable from data |

All four are string-free and vocabulary-free: kind codes, agent and status
terms, seal terms, and every visible word arrive as declared data or caller
copy, the same law the evidence seal follows. A standing guard fails the build
if any declared vocabulary literal appears in a face.

`entry-stream` carries `role="log"` with `aria-live="off"`, which is not
configurable: the host owns the single live region, and a second one here would
announce every entry twice.

**Note on the seal and status slots.** Both arrive as resolved DATA rather than
snippets, because registry dispatch hands a widget `{ data, props, locale }` and
cannot carry snippets — a "slot" that vanished on the dispatch path would be a
trap. `composer` (entry-stream) and `row` (definition-members-card) remain
snippets for direct composition only, and are documented as such.

### Added — cross-host placement fixtures (contract `1.1.0`)

A widget kind is proven by CROSS-HOST PLACEMENT: it must drop into slots opened
by any host. A kind that only ever renders on one board is unproven.

`CROSS_HOST_INDICATOR_SLOTS` carries two real host slot shapes — a workspace
board track and an admin `admin_page` extras band — and the new
`cross-host placement` contract case asserts the SAME registered entry answers
both. The two declarations are deliberately unlike each other (different
vocabulary, different data provenance, different callbacks), so a face that
absorbed anything host-shaped fails to project.

`projectMatchContext` encodes the SELECTION half of the spec-889 bridge (a
declared block projects separately to `WidgetMatchContext` for selection and
`WidgetRenderRequest` for render). A consumer's real adapter must agree with it
on these fixtures.

`CONTRACT_VERSION` → `1.3.0` (a case was added, then twice redefined; the
fixture schema is versioned independently of the package).

**Both selection axes are covered.** Authored blocks carry `type` (a widget-key
hint, e.g. `stat-grid`) alongside `binding.kind` (the data shape), and the two
are independent: `kind` is translated through the map, `type` is carried
through **untranslated**. The admin fixture declares both; the workspace one
declares no `type`, so the fixtures cover the specialised and the generic path.
The case asserts the consequence rather than just the value — in a registry that
also holds a `byTypeOnKind` entry, the admin's authored `type` wins while the
typeless workspace block still lands on the kind-generic face. An adapter that
drops or translates `type` silently disables every type-specialised
registration.

**The declared-kind map.** Hosts do not rename their declared vocabulary to suit
a widget package, and authored sheets must not churn to adopt a widget kind —
the admin has declared its indicator blocks `kpi` since long before these faces
existed. So the adapter owns an explicit `DeclaredKindMap` as visible data, and
`projectMatchContext(block, kindMap)` applies it. Identity is the default: a
declared kind with no row passes through unchanged, so the workspace's
`indicator` needs no entry and adding one host cannot disturb another.
`CROSS_HOST_KIND_MAP` (`{ kpi: "indicator" }`) is the pinned map both sides of
the bridge agree on.

The case also asserts the map is LOAD-BEARING rather than decorative: without
it, the admin's declared kind must NOT already match, and must fail closed at
the registry. That is what stops the fixture quietly agreeing with itself.

### Fixed — TS consumers could not compile against `0.2.1`

Relative imports inside `src/` carried explicit `.ts` extensions
(`export * from "./seal.ts"`). The package ships TypeScript SOURCE — `exports`
points straight at `src/**/index.ts` with no build step — so those imports are
part of the public contract, and any consumer without
`allowImportingTsExtensions` failed with **TS5097**. This shipped in the
published `0.2.1` and forced consumers to enable the flag just to install us.

Extensions dropped throughout `src/` and `tests/`, and
`allowImportingTsExtensions` removed from this package's own `tsconfig.json` —
it was what let the defect typecheck here while breaking everyone else.

Since CI runs `npm test` rather than `tsc`, removing the flag does not by itself
prevent a regression, so `tests/core/consumer-resolution.test.ts` polices both
the import graph and the flag's absence.

Verified against a real consumer: a standalone `tsc` project with
`moduleResolution: bundler` and no flag reports TS5097 before and compiles clean
after.

### Added — per-widget deep exports

`@aiaiai-pt/widget-system/widgets` imports every widget, so a consumer binding a
single face also drags in `NativeChartWidget`, ECharts, and the design system's
`EChart`. Because the design system is an **optional** peer, that does not fail
at install — it fails at the *consumer's build*, as an unresolved import for a
component they never asked for.

Each widget now has a deep export resolving straight to its component:

```ts
import IndicatorCardWidget from "@aiaiai-pt/widget-system/widgets/IndicatorCardWidget";
```

The barrel stays for registry consumers who want the whole set. Tests read the
real import graph rather than trusting the export map, and include a control
case so the marker list cannot go stale and quietly prove nothing.

### Changed — design-system peer floor `>=0.47.0` → `>=0.51.0`

Published `design-system@0.50.0` **does** contain `SealChip` and `EChart`, but
its `SealChip` predates the vocabulary rework: it takes a vocabulary **string**
and carries no guard. These widgets pass a resolved **term**, so against 0.50.0
the seal renders silently wrong rather than failing — the worst available
outcome. Raising the floor makes the bad combination an install-time refusal.

> The reworked design system publishes as **`0.51.0`** (ruled 2026-08-02, same
> reasoning as widget-system `0.3.0`: 0.x, and no code consumer of the seal
> components exists, so the API break lands on nobody). The two are **not
> independently releasable** — publishing widget-system against an earlier
> design system is the silent-breakage case above, so they publish together.

### Changed

- `registerBaseWidgets` now registers six widgets rather than two. The base-set
  test is pinned deliberately, so adding to it is always an explicit act.
- A core-only consumer now skips three cases rather than two — the third is
  cross-host placement, which needs a registered card face.

## [0.2.1] — 2026-07-29

### Added
- **`assignSeal(value, now)` in `/core`** — the ONLY evidence-seal source: pure,
  transport-neutral assignment of `measured|inferred|projected` (+ `stale`) from a
  value's freshness/provenance metadata, per the PRD five-answers table. The
  `probability` axis is typed `never` (no H1 data source; non-breaking future
  extension). 17 unit tests over the state boundaries.

### Notes
- Pairs with `@aiaiai-pt/design-system@0.50.0` (the seal chips consume this).
- Known type-level papercuts for strict consumers remain tracked in #96
  (`.ts`-extension imports; `WidgetLayerContract.registerBaseWidgets` variance) —
  scheduled for the next PATCH, workarounds documented in westeuropeco/atelier#973.

## [0.2.0] — 2026-07-26

### Added
- **`@aiaiai-pt/widget-system/fixtures`** — a published, dependency-injected
  **consumer contract** (S2.2 #61). Consumers (Admin, workspace, Portal) run
  `runContract(impl, assert)` against the version they installed to prove the
  package behaves as specified, and attach the per-case outcome as parity
  evidence. Coverage: registry isolation, dispatch order, native chart,
  embedded analysis, complete states, SSR determinism. The fixtures module is
  pure (core types only), so a core-only consumer can run the generic cases
  without a svelte/echarts peer; the widget-layer cases report `skipped` when
  `/widgets` is not wired. Fixture schema `CONTRACT_VERSION` is versioned
  independently of the package.

### Fixed
- **Optional peer on `@aiaiai-pt/design-system` widened** from `^0.47.0`
  (0.47.x only) to `>=0.47.0 <1` (aiaiai-pt/sistema#94). The old range excluded
  design-system 0.48.0+, so installing widget-system alongside the current
  design-system hard-failed under strict npm (ERESOLVE) and warned under pnpm.
  Now resolves cleanly across the design-system 0.x line, including the 0.49.0
  compatibility release that depends on widget-system.
