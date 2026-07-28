# DS-H0.5 acceptance evidence — @aiaiai-pt/design-system@0.49.0

Evidence readback for #69, prepared 2026-07-28 for operator ratification.
Every claim below is **confirmed** (command or artifact named inline) unless
marked otherwise. The companion proposal lives in the #69 issue comment of the
same date; this file is the durable evidence record it points to.

## 1 · Release coordinate and provenance

- **Package:** `@aiaiai-pt/design-system@0.49.0`, public npm registry,
  published 2026-07-28T13:15Z. `dist.shasum
  82586267f6a3865c18da0e234ef928b52d5f1099` (npm view, 2026-07-28).
- **Source attribution:** npm `gitHead = f9e726c27752c0ccc0d6d8ede43cda7c3a2d0fe8`
  — exactly sistema `main` (PR #95 merge). `@aiaiai-pt/widget-system@0.2.0`
  carries the **same** gitHead: both halves of the paired publish came from one
  commit.
- **Publish order honored:** widget-system 0.2.0 at 13:14Z, design-system
  0.49.0 at 13:15Z — the #94 peer-range ordering (`>=0.47.0 <1`) the 0.49.0
  changelog declares blocking.
- **Rollback coordinate:** `@aiaiai-pt/design-system@0.48.0` remains on the
  registry (npm view versions: …0.47.0, 0.48.0, 0.49.0). Rollback is a
  package/catalog rollback; no data or infrastructure involved.
- **Independently readable:** all of the above read back from the public
  registry with no repo access.

## 2 · Packed-artifact audit (tarball, 288 files)

`npm pack @aiaiai-pt/design-system@0.49.0` → `tar tzf`, 2026-07-28:

| #69 required content | In 0.49.0 tarball | Note |
|---|---|---|
| `tokens/themes/ubp.css` | **YES** | plus base.css, components.css, schemes |
| Generated types | **YES** | `.d.ts` beside every component |
| Public map utilities | **YES** | `components/map-utils.js` + `.d.ts`; subpath import requires the `.js` extension (exports pattern maps `*` verbatim); **not** re-exported from the root index |
| Map component family | **YES** | MapCluster/MapDisplay/MapHeatmap/MapPicker/MapPopup — the Slice-1 primitives |
| Pagination | **PRESENT, uncorrected** | navigation correction is #67 (OPEN) |
| Tree | **PRESENT, uncorrected** | roving-keyboard completion is #70 (OPEN) |
| Slider | **ABSENT** | #70 (OPEN) |
| `.type-overline` | **ABSENT** | #67 (OPEN); zero matches in packaged CSS |

Packed-consumer resolution smoke (scratch npm project installing the tarball):
root export, `tokens/base.css`, `tokens/themes/ubp.css`,
`components/MapDisplay.svelte`, `components/Badge.svelte`,
`components/StatCard.svelte` all resolve.

## 3 · Test evidence

- **Repo suite at the published commit** (`main @ f9e726c`, run 2026-07-28):
  **392 passed / 0 failed** across 29 files (`npx vitest run`).
- **Contrast evidence** (`tests/ubp-theme-contrast.test.ts`, 28 assertions):
  parses the shipped CSS custom-property chains, **composites alpha colors
  (Porter-Duff src-over)** against declared backgrounds, and carries the
  explicit **historical 3.0:1 subtitle regression** case
  (`--color-text-muted`/`--color-text-secondary` floor). Re-run in isolation:
  28/28.
- **Honest gap:** the repo suite runs against **source, not the packed
  artifact** — no packed-artifact harness exists in sistema (`test: vitest run`).
  Mitigations that DO exercise the published artifact: the §2 resolution smoke
  and the §4 consumer gates.

## 4 · Consumer readback (against the published npm artifacts)

- **atelier PR #975** (open): repins every atelier consumer to 0.49.0 through
  the catalog (admin had bypassed it with a direct `^0.47.0`, so admin ran
  0.47.0 and the host 0.48.0 — nobody consumed the paired publish until now).
  Proof on the branch: admin svelte-check **0 errors** (4,460 files), admin
  vitest **777 passed** — including the widget-system contract fixtures
  (#957/#969) running the real `/core` + `/widgets` implementation — admin vite
  build green; ubp-ai-workspace check **0 errors/0 warnings**, vitest **11
  passed**. PR CI additionally build-proves both host images.
- **Workspace acceptance manifest** (westeuropeco/atelier-urban-workspace#31):
  widgetSystem baseline `recorded` on 0.2.0 (PR #59, merged); the sistema
  baseline flip to `recorded` cites this document once #69's disposition is
  ratified.
- **Known consumer papercuts, tracked:** #96 — `.ts`-extension source imports
  force `allowImportingTsExtensions` on strict consumers, and
  `WidgetLayerContract.registerBaseWidgets` variance requires a cast
  (both type-level; runtime contract green; 0.2.1 PATCH).

## 5 · Declared matrix — what is and is not evidenced

Shipped evidence: the 28 automated contrast assertions (§3), the #66/#76
instrument specimen page with responsive drawer and a11y pass, and the DS font
pairing decision record (#68). **Not re-executed for 0.49.0:** the full
declared matrix — high contrast, text sizes 100/120/140/160%, link
highlighting, keyboard, screen reader, overflow, long Portuguese content,
reduced motion — owned by the open QA children **#78** (long-PT/160%/link/
reduced-motion visual QA), **#79** (chart + map demo verification), **#80**
(muted/status/control-border contrast raises).

## 6 · Changelog and migration

`CHANGELOG.md` carries a dated 0.49.0 entry: the widget-system dependency
floor, the renderer dispatch delegation to `@aiaiai-pt/widget-system/core`
(compatibility, no behavioral change), and the blocking paired-publish order.
Font/self-hosting posture is documented in
`dev_docs/solutions/ubp-font-self-hosting.md`; the Berkeley Mono shipping
contract remains open as #82.

## 7 · Gap register (what a YES ratification accepts as tracked)

| Gap | Tracker | Needed by | H1 Slice 1/2 impact |
|---|---|---|---|
| Slider + Tree roving keyboard | #70 | H2 instruments (workspace #17), staff navigation | none |
| `.type-overline` + Pagination correction + map-utils on root index | #67 | H2 tables/typography; KpiRegister typography if its spec calls for overline | none for Slice 1; **Slice 2 chips PR must add `.type-overline` if the KpiRegister spec requires it** |
| Full declared a11y/visual matrix re-run | #78/#79/#80 | before operational dependence (WS-OPS, H2) | none — Slice 2 adds its own chip contrast assertions |
| Packed-artifact test harness | proposed follow-up (this doc) | DS release hygiene | mitigated by consumer gates |
| 0.2.0 strict-typing papercuts | #96 (0.2.1) | every strict consumer | worked around in atelier #973/#974 |
