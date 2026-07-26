# Changelog

All notable changes to `@aiaiai-pt/design-system` are recorded here. This
project follows [Semantic Versioning](https://semver.org): fix → PATCH,
feat → MINOR, breaking → MAJOR.

## [0.49.0] — 2026-07-26

### Added
- **Dependency floor:** `@aiaiai-pt/design-system` now depends on
  `@aiaiai-pt/widget-system` (`^0.1.0`). The renderer's generic dispatch is
  delegated to it; see below.

### Changed (compatibility — no behavioural change)
- **`renderer/dispatch.ts` now delegates to `@aiaiai-pt/widget-system/core`.**
  The tester/priority ranking loop (`selectEntry`) and the fail-closed
  `decideRender` decision are no longer implemented in Sistema — they run in
  `@aiaiai-pt/widget-system/core`. The `@aiaiai-pt/design-system/renderer/*`
  import surface is unchanged and every existing generic renderer fixture
  retains observable parity (385 pre-existing root tests green). This is the S2
  (#60) compatibility layer.

### Deprecated
- The generic dispatch/registry surface under `@aiaiai-pt/design-system/renderer`
  is **deprecated** and scheduled for removal in the **next MAJOR (1.0.0, S3)**:
  - `renderer/dispatch` — `selectEntry`, `decideRender`, `NOT_APPLICABLE`,
    `WidgetTester`, `RegistryEntry`, `Match`, `RenderDecision`.
    → Migrate to `@aiaiai-pt/widget-system/core` (ctx-shaped tester).
  - `renderer/registry` — `registerWidget`, `resolveWidget`, `byKind`,
    `byTypeOnKind`, `WidgetComponent`.
    → Migrate to `createRegistry()` (`@aiaiai-pt/widget-system/core`) +
    `registerBaseWidgets` (`@aiaiai-pt/widget-system/widgets`).

  See [`docs/migration/widget-system.md`](docs/migration/widget-system.md).

  Atelier-coupled renderer exports (`renderer/types`, `resolve-data`,
  `data-provider`, `vote`, `aggregate`, `display`, `grid`, `chart-option`,
  `chart-spec`, and the `*Widget.svelte` components) are **not** widget-system
  APIs and are **not** reclassified as such (#60 AC5). Their migration
  destination is the Atelier `@atelier/*` layer, documented in the migration
  guide; they are out of scope for the widget-system compatibility window.

### Removal (planned, S3 — not in this release)
- The deprecated `renderer/dispatch` and `renderer/registry` generic exports are
  removed in `1.0.0`. Removal is scheduled only once compatibility usage across
  verified consumers (Admin, workspace, Portal) reaches zero (#62).
