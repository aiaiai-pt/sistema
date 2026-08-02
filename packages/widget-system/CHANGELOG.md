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

### Changed

- `registerBaseWidgets` now registers six widgets rather than two. The base-set
  test is pinned deliberately, so adding to it is always an explicit act.

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
