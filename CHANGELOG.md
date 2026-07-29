# Changelog

All notable changes to `@aiaiai-pt/design-system` are recorded here. This
project follows [Semantic Versioning](https://semver.org): fix → PATCH,
feat → MINOR, breaking → MAJOR.

## [0.50.0] — 2026-07-29

### Added
- **Evidence seal primitives (H1 Slice 2, westeuropeco/atelier-urban-workspace#57).**
  `SealChip` (value + evidence state as one phrase; sr-only text adjacent to the
  value so the seal survives quotation), `KpiRegister` (StatCard-variant register;
  measured out-ranks projected; unconditional throw when a projected value arrives
  without a seal — the boundary guard for the seal rule), and `CaminhoStateChip`
  (the four worded verification states). Rendered tests are red-first for the
  sr-text, the boundary throw, and the worded states.
- **Evidence semantic tokens.** `--seal-{measured,inferred,projected,stale}-{text,bg}`
  in `tokens/components.css`, with UBP-theme overrides meeting WCAG AA in the light
  scheme and AAA in dark (composited-alpha contrast tests included). The DS owns the
  `measured|inferred|projected` vocabulary per the operator's Fork B ruling.

### Notes
- Pairs with `@aiaiai-pt/widget-system@0.2.1` (`assignSeal` — the only seal source).
- No breaking changes; MINOR per feat.

## [0.49.0] — 2026-07-26

### Added
- **Dependency floor:** `@aiaiai-pt/design-system` now depends on
  `@aiaiai-pt/widget-system` (`^0.1.0`). The renderer's generic dispatch is
  delegated to it; see below.

> **Publish order (blocking).** `@aiaiai-pt/design-system@0.49.0` must be
> published **only after** `@aiaiai-pt/widget-system` ships the widened optional
> peer on design-system (`^0.47.0` → `>=0.47.0 <1`, aiaiai-pt/sistema#94). The
> old range is 0.47.x-only, so a consumer installing this release alongside the
> peer-fixed widget-system otherwise hits an unsatisfiable optional peer (strict
> npm ERESOLVE; pnpm warns). The peer fix ships in **widget-system 0.2.0**
> (prepared under #61); these two releases are a **paired publish** — widget-system
> 0.2.0 first, then design-system 0.49.0.

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
