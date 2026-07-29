# Changelog — `@aiaiai-pt/widget-system`

Separately versioned from `@aiaiai-pt/design-system`. SemVer: fix → PATCH,
feat → MINOR, breaking → MAJOR.

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
