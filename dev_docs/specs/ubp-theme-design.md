# UBP Theme — Design Spec

**Status:** Phase 7 shipped — theme file, popover fix, demo site, Playwright test suite (76 tests, 73 pass / 3 skipped desktop-only / 0 fail), AA at 4 viewports, dark-mode addendum in `reference/theming.md`, reusable playbook in `dev_docs/solutions/dark-theme-playbook.md`.
**Appetite:** Large (decisions D1-D4 locked; D4 added 2026-04-18 post-Phase-6)
**Phase 4 outcome:** 2 of 3 screens pass the 5-second test on first critique pass; 3/3 pass on v2 after structural fix (data-theme on `<html>`, surface hierarchy inversion). Token compliance clean (0 violations).
**Phase 6 outcome:** Accent + status palette bumped for AA (see D4). All three routes pass WCAG 2.1 AA at 1440/1024/768/375 via axe. Visual baselines archived in `site/tests/ubp/visual.spec.ts-snapshots/` (12 PNGs).

### D4 — Accent brightened for AA compliance (2026-04-18)

During Phase 6 axe scanning, `--color-accent: #1b57fd` as body/link text on dark surface resolved to 3.63:1 — below AA 4.5:1 for normal text. Options considered:

- (a) Accept the failure as documented "aesthetic exception" — client brand mandate wins
- (b) Bump accent to a brighter shade that passes AA as text — aesthetic drift, compliance wins
- (c) Introduce `--color-accent-text` as a separate token — more precision, more plumbing

**Decision: (b).** `--color-accent` shipped at `#3d7bff` (still reads "electric blue", passes 5.0:1 on surface). Legacy `#1b57fd` retained as reference in the theme file header. Same logic applied to status colors: 500-shades bumped to 400-shades so tinted-pill text passes AA on its own subtle bg. Rationale: first dark theme in the system sets precedent for every future dark theme — AA compliance is non-negotiable even if D2 (Rabbit Hole 4) declared the legacy hex "non-negotiable". D4 amends D2's hex value; intent (electric blue as primary accent) is preserved.

See `dev_docs/specs/ubp-theme-research/validation.md` for the full contrast audit.
**Platform:** Web (responsive — but legacy is desktop-first backoffice)
**Output:** `tokens/themes/ubp.css` + live demo via existing theme switcher in `site/`
**Tier:** 2 — Bespoke

---

## Context

UBP = "Urban Backoffice Platform" — a new backoffice product for urban management (gestão urbana). The legacy system referenced in Figma was designed for a different stack but its look-and-feel is exactly what the client wants. The task is to reproduce that look-and-feel **within the aiaiai design system**, touching only tokens (no core changes, no new components, no parallel CSS).

Figma references:
- [Módulos / Gestão de Verticais](https://www.figma.com/design/HEnz3YhvYzfcKkyoJMtcD7/M%C3%B3dulos-do-Backoffice-da-UBP?node-id=0-1) — main shell, vertical cards listing, multi-step form
- [Módulos / Gestão de Utilizadores](https://www.figma.com/design/HEnz3YhvYzfcKkyoJMtcD7/M%C3%B3dulos-do-Backoffice-da-UBP?node-id=954-103197) — users table, groups, access tokens

## Jobs-to-be-Done

**Job:** When the client sees the aiaiai-powered backoffice, help them recognize it as "their" product so adoption isn't blocked by the perception that we changed their established visual language.

| Force | Summary |
|-------|---------|
| **Push (away from legacy stack)** | Old stack is a maintenance burden; aiaiai gives component quality + agentic tooling. |
| **Pull (toward new)** | Same look-and-feel the team already approved, now with better foundations. |
| **Anxiety** | "It will feel different" → users reject it. |
| **Habit** | Team already has mental model of the Figma designs; training cost must be zero. |

## Success Metrics

**User-outcome:**
- Side-by-side test: the project lead reviews 3 Figma screens (sidebar `357:88377`, verticals listing `357:88357`, users table `1688:41254`) against the themed implementation at 100% zoom. Score = tells-spotted-in-5s per screen. Pass = ≤1 tell per screen, and no tell is a color/type/sidebar issue.
- Zero reports of "this looks like a different product" in first stakeholder review.

**System-outcome:**
- Theme ships as a single `tokens/themes/ubp.css` file. No core file modified. No parallel components.
- Token compliance sweep passes (no raw px/rem in consuming code).
- Theme switcher shows `UBP` alongside `aiaiai`, `branded-example`, `bespoke-example` — selectable live.

## Design Principles (derived from JTBD)

1. **Fidelity over originality** — every deviation from the Figma reference must be traceable to an aiaiai non-negotiable (8px grid, focus ring, contrast minimums). No "improvements" that drift.
2. **Dark-first, role-preserving, doctrine-exception-documented** — override surface tokens to dark values; keep role semantics intact. This theme consciously overrides aiaiai's "warm shadows only" and "warm-tinted overlay" doctrine (documented in `reference/color.md` and `reference/theming.md`) because cool-tinted shadows read correctly on dark surfaces while warm shadows vanish. Every such exception is enumerated in this spec.
3. **Tokens or document** — if a thing can't be expressed as a token override, it's documented as a known gap and a decision is requested. No "almost-tokens" (inline overrides) in consumer projects.
4. **Blue carries meaning** — the legacy brand blue (`#1b57fd`) is the accent, full stop. Never decoration, always action/focus/active-state.
5. **Type density within grid** — the legacy is list-heavy. We match the 14px body/label size exactly. Row heights in the reference are actually 8px-grid-compatible (table rows = 56px, table header = 40px, sidebar items = 36px) so the compromise is smaller than initially feared. The 6px/14px paddings inside controls still round to 8px multiples, but at row-height scale the fidelity is intact.

## Security Considerations

The backoffice handles: user management (PII: name, email, municipality), role/permission assignment, audit trails, access tokens. Theme work itself does not touch auth — but any demo in `site/` using sample user data must use fake data (no real names/emails).

Trust boundaries are at the app level, not the theme level — theming cannot change that. Flag only if the theme creates visual ambiguity between privileged and unprivileged states (e.g., if destructive color contrast drops below 3:1, Ativo/Bloqueado chips become confusable).

---

## Legacy DNA — Extracted from Figma

### Visual identity
- **Dark theme** backoffice (no light variant visible in referenced pages). Very dark navy/charcoal surfaces.
- **Brand accent:** `#1b57fd` (saturated electric blue). Used on active nav item text, primary buttons, focus, stepper active node.
- **Status colors:** green `Activo`, red `Bloqueado`, amber `Rascunho`.
- Information-dense, list-heavy, form-heavy UI. Data-first aesthetic.

### Typography
- **Hanken Grotesk** across the whole interface (no monospace). Weights 400 / 500 / 600.
- Default size **14px** with **18px** line-height. Labels stay at 14px (not smaller).
- Section headers SemiBold, body Regular, interactive labels Medium.

### Spacing observed (Figma vars)
`1, 2, 4, 6, 8, 12, 14, 16, 24` — **includes 6px and 14px which break aiaiai's 8px grid.**

### Radius
- `corner-x-small` = **4px**, `corner-small` = **6px**. Slightly softer than aiaiai's 2/4/8.

### Shadows / Elevation
- Layered inner+outer shadows on small controls (e.g., ⌘K keybind pill) — sophisticated.
- Structural borders remain 1px with subtle tint.

### Sidebar (the signature element)
- Width **288px**. Dark surface, light text.
- Grouped navigation with top-border separators between groups.
- Section headers in Hanken SemiBold 14px (not uppercase mono, as aiaiai default does).
- Active item: subtle alpha-white background, text in brand blue.
- Search bar with ⌘K keybind hint (inner+outer shadow on the pill).
- Logo + "Plataforma Municipal" at top.

### List / Cards / Table patterns
- Vertical cards: icon + title + category label + description + `Activo` pill + inline `Editar`/`Duplicar`/`…` at bottom.
- Users table: very compact rows (~40px), avatar circles, email on second line, status chips, group chips, action icons right-aligned.
- Segmented top tabs (`Todos`, `Mobilidade`, `Micro Mobilidade`, etc.) for filtering.
- Breadcrumbs at the top of the content area, always visible.

---

## Token Mapping — Legacy → aiaiai Tier 2

| Category | Legacy value | aiaiai token | Strategy |
|----------|--------------|--------------|----------|
| Surface primary | `#1a1d24` (approx, dark navy) | `--color-surface` | Override |
| Surface secondary | `#14171e` (sidebar, slightly darker) | `--color-surface-secondary` | Override |
| Surface tertiary | `#22252d` | `--color-surface-tertiary` | Override |
| Text primary | `#ebecef` (warm-off-white, not pure) | `--color-text` | Override |
| Text secondary | `#a8adb8` | `--color-text-secondary` | Override |
| Text muted | `#6b7280` | `--color-text-muted` | Override |
| Text on accent | `#ffffff` (on blue) | `--color-text-on-accent` | Override |
| Border | `#2a2d36` | `--color-border` | Override |
| Border strong | `#3a3d48` | `--color-border-strong` | Override |
| Overlay | `rgba(5, 8, 14, 0.6)` | `--color-overlay` | Override (cool-tinted, not warm) |
| Accent | `#1b57fd` | `--color-accent` | **Legacy mandatory** |
| Accent hover | `#1447d6` | `--color-accent-hover` | Darker shade |
| Accent subtle | `rgba(27, 87, 253, 0.12)` | `--color-accent-subtle` | Alpha tint, dark-surface-safe |
| Destructive | `#ef4444` | `--color-destructive` | Tier 2 override (red for Bloqueado) |
| Success | `#22c55e` | `--color-success` | Tier 2 override (green for Ativo) |
| Warning | `#f59e0b` | `--color-warning` | Tier 2 override (amber for Rascunho) |
| Info | `#3b82f6` | `--color-info` | Tier 2 override |
| Sans font | Hanken Grotesk | `--font-sans` | Override |
| Mono font | Hanken Grotesk (used as sans) | `--font-mono` | Override to same (no mono context in legacy) |
| Label font | Hanken, not mono | `--type-label-font` | Override to `var(--font-sans)` |
| Label tracking | 0 | `--type-label-tracking` | Override from 0.04em to 0 |
| Body size | 14px | `--type-body-size` | Override from 15px → 14px |
| Body sm size | 13px | `--type-body-sm-size` | Keep 13px |
| Label size | 14px | `--type-label-size` | Override from 12px → 14px |
| Data size | 14px | `--type-data-size` | Keep 14px |
| Radius sm | 4px | `--radius-sm` | Override from 2px → 4px |
| Radius md | 6px | `--radius-md` | Override from 4px → 6px |
| Radius lg | 8px | `--radius-lg` | Keep 8px |
| Elevation raised | Cool-tinted shadow | `--elevation-raised` | Override (cool, not warm, on dark) |
| Elevation overlay | Cool-tinted shadow | `--elevation-overlay` | Override |
| Focus ring color | brand blue | `--focus-ring-color` | `var(--color-accent)` |
| Sidebar width | 288px | `--nav-sidebar-width` | Override from 240px → 288px |
| Sidebar bg | `#14171e` | `--nav-sidebar-bg` | Follows surface-secondary |
| Sidebar section font | Hanken SemiBold 14px | `--nav-section-font` + size + weight | Override (from Instrument Sans 11px) |
| Nav item active bg | `rgba(255,255,255,0.05)` | `--nav-item-bg-active` | Override |
| Nav item active color | accent blue | `--nav-item-color-active` | Override to `var(--color-accent)` |
| Button radius | 6px | `--button-radius` | Override via `--radius-md` |
| Button font | Hanken Medium | `--button-font` | Override to `var(--font-sans)` |
| Button tracking | 0 | `--button-tracking` | Override from 0.04em → 0 |
| Input radius | 4px | `--input-radius` | Override via `--radius-sm` |
| Input font | Hanken | `--input-font` | Override |
| Badge radius | pill | `--badge-radius` | Keep 999px |
| Tag radius | 4px | `--tag-radius` | Already 2px, overridable |
| Card default variant | fill + shadow (not border) | `--card-bordered-border` | Override to `none` |
| Card default variant | subtle shadow | `--card-bordered-shadow` | Override to `var(--elevation-raised)` |
| Card bg | dark surface | `--card-bg` | Cascades from `--color-surface` ✓ |
| Card interactive hover border | darker border visible | `--card-interactive-hover-border` | Override to `var(--color-border-strong)` |
| Toast bg | cascades | `--toast-bg` | Cascades from `--color-surface` ✓ |
| Toast border | cascades | `--toast-border` | Cascades from `--elevation-border` ✓ |
| Modal bg | cascades | `--modal-bg` | Cascades from `--color-surface` ✓ |
| Modal backdrop | cascades | `--modal-backdrop` | Cascades from `--color-overlay` ✓ |
| Palette bg | cascades | `--palette-bg` | Cascades from `--color-surface` ✓ |
| Palette shortcut bg | cascades | `--palette-shortcut-bg` | Cascades from `--color-surface-secondary` ✓ |
| Skeleton bg | cascades | `--skeleton-bg` | Cascades from `--color-surface-tertiary` ✓ |

**Count:** ~62 token overrides (legacy mapping) + ~5 cascade-verified tokens. Within Tier 2 budget (40-80).

---

## Rabbit Holes — Decided, Do Not Revisit

1. **Spacing scale stays 8px grid.** Legacy uses 6px and 14px in some paddings; we round to 8px / 16px. Fidelity loss is measured in 1-4px on row heights and is accepted. Changing the 8px grid requires touching `base.css` and contradicts the user's core constraint.
2. **Dark-only theme for v1.** Legacy shows no light variant; we do not speculatively design one. If needed later, ship as `ubp-light` separate theme file.
3. **No new components.** The legacy's ⌘K search pill, multi-step stepper, and breadcrumbs are achievable by token-theming existing components (Input, Badge, Navigation). If the composition doesn't exist in aiaiai, it's a consumer-project concern, not a theme concern.
4. **Brand blue `#1b57fd` is non-negotiable.** Client mandate.
5. **Hanken Grotesk is non-negotiable.** Client mandate. Font must be self-hosted (license TBD by client); theme file references family name only.
6. **Monospace identity is intentionally sacrificed (D2 decision).** `--font-mono` is aliased to Hanken Grotesk system-wide. Berkeley Mono is NOT preserved even for `<code>` contexts. Rationale: legacy has no mono anywhere; preserving it for edge cases creates a hybrid that doesn't exist in the reference.
7. **Popover hardcode is patched in core (D1 decision).** One-line change to `tokens/components.css:479`: `--popover-bg: var(--raw-color-white)` → `var(--color-surface)`. Framed as a system-health bug fix, not UBP-specific. This change lands in the same PR as the UBP theme file and unblocks any future dark theme.
8. **Appetite is Large (D3 decision).** Scope includes: theme file, core popover fix, card/modal/toast/palette cascade verification, dark-mode checklist appended to `reference/theming.md`, `site/` demo via theme switcher, accent-subtle visibility stress-test on dark surface.

## Out of Scope (Future Work)

- Light variant of UBP theme
- UBP-specific Svelte components (stepper, breadcrumb, ⌘K palette) — consumer-project level
- Phosphor-icon ↔ legacy-icon mapping exercise (legacy uses its own set; we substitute with Phosphor as aiaiai mandates)
- Actual consuming project wiring

---

## Phase 2 Research Synthesis (2026-04-17)

### Existing patterns to reuse

- **Theme file conventions** — follow `tokens/themes/bespoke-example.css` structure: `[data-theme="ubp"]` selector, section dividers with equals-sign banners, groupings ordered COLOR → TYPOGRAPHY → ELEVATION → RADIUS → MOTION → COMPONENTS.
- **Theme registration wiring** (confirmed file:line by pattern-miner):
  - `site/src/lib/theme.svelte.ts:1` — append `"ubp"` to `THEMES` tuple
  - `site/src/lib/theme.svelte.ts:4-8` — add `ubp: "UBP (Bespoke)"` to `THEME_LABELS`
  - `site/src/app.css` — add `@import "../../tokens/themes/ubp.css";` after the `bespoke-example` import
  - `site/src/routes/+layout.svelte:60-73` — theme buttons render dynamically from `getThemes()`; no manual edit
- **Popover core fix** — `tokens/components.css:479` change `var(--raw-color-white)` → `var(--color-surface)`. No other hardcodes in `components.css`, `semantic.css`, `base.css` break on dark beyond this and `--color-overlay` (which is already in our override map).

### Content model

Full stress-content saved at `dev_docs/specs/ubp-theme-research/content-model.md` — 15 verticals, 9 PT municipalities, 17 users, 9 groups, 6 API tokens. Edge cases explicitly included (31-char vertical name, empty description, user with 5 groups to stress chip overflow, "nunca" último-acesso, etc.). Phase 4 demo pages consume this file verbatim — no lorem ipsum.

### Constraints validated

- **Hanken Grotesk:** OFL licensed, variable font, served by Google Fonts at weights 100-900. Phase 4 uses `@fontsource-variable/hanken-grotesk` npm package (self-hosted via Vite, matches SvelteKit idiom). Brief's earlier "license TBD" note is closed — font is free for any use.
- **Shadow-tone calibration:** benchmark agents (Supabase, Vercel Geist) publish elevation taxonomy but not rgba values. Supabase uses border-first on true-dark (no panel shadows), Vercel publishes 4-step taxonomy without rgba. **Decision:** start with heuristic `0 1px 2px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.35)` and calibrate against Figma `357:88357` in the Phase 4 inner loop. Do not advertise as benchmark-matched.
- **FOUC pre-existing:** `site/` uses `@sveltejs/adapter-static` with `prerender=true`. `hooks.server.ts` runs at build time only — theme switching is client-side via `initTheme()` on mount. First paint of any non-default theme briefly shows aiaiai defaults. Known issue, not UBP-caused. Optional inline-script mitigation deferred (not UBP scope).
- **Badge on dark — new risk from pattern-miner.** `--badge-neutral-bg` cascades from `--color-surface-tertiary` and `--badge-neutral-text` from `--color-text-secondary`. On UBP values (`#22252d` bg / `#a8adb8` text) contrast is ~6:1 which passes AA, but bg is too close to table-row bg — badges may visually blend. Phase 4 mitigation: override `--badge-neutral-bg` to a slightly-raised tone (e.g., `#2a2d36`) so neutral badges remain distinguishable on dense lists.

### Exact legacy dimensions (from Figma metadata)

From frame `1688:41254`:
- Sidebar: **288px wide**, 64px header, 60px search region, menu items at 36px height, bottom header 64px
- Top bar: **64px height**, breadcrumb left, actions right
- Content area: 1632px wide at 1920px viewport
- Table header: **40px**, table rows: **56px** — 8px-grid-clean
- Filter/toolbar row: 60px height, 380px search input, 36px button heights
- Bulk-actions footer: 64px

These confirm the theme can be built within aiaiai's existing component token system without resizing primitives.

### Hill Chart

| Scope | Position | Why |
|-------|----------|-----|
| Theme file (`tokens/themes/ubp.css`, ~65 overrides) | **Downhill** | bespoke-example.css is a proven template; every override maps to a documented Tier 2 slot. |
| Popover core fix (`components.css:479`) | **Downhill** | Single-line change, framed as system-health bug fix. D1 decided. |
| Card/Modal/Palette/Toast cascade verification | **Hilltop** | Pattern-miner confirmed all cascade correctly via `--color-surface`/`--elevation-*`. Only need a smoke-test render in Phase 4. |
| Badge neutral variant override | **Hilltop** | Single extra token override (`--badge-neutral-bg`) resolves the dark-blend risk. |
| Accent-subtle visibility on dark | **Hilltop** | Calibrate alpha 0.12→0.18-0.20 against a rendered card/hover state. No structural unknowns. |
| Shadow rgba calibration | **Hilltop** | Starting heuristic documented. Tune to Figma in inner loop. Not benchmark-matched. |
| Sidebar composition in `site/` demo | **Hilltop** | Theme delivers tokens; demo page composes logo + product name + search + grouped nav. Composition pattern exists in legacy reference. |
| Dark-mode addendum to `reference/theming.md` | **Downhill** | Phase 4 writes a "Dark theme considerations" section — no structural unknowns, just documentation of decisions already made here. |
| Theme switcher wiring | **Downhill** | 3 file edits, line numbers known. |
| Demo pages (verticals list, users table) consuming content model | **Hilltop** | Content data is ready. Composition stays inside existing aiaiai component API. |

All scopes are **Hilltop or Downhill**. No Uphill remains — Phase 4 is ready to start.

### Design Inspiration (narrow — we have a concrete reference)

Only one deliberate inspiration borrow: **Supabase's border-first elevation on dark surfaces**. We lean on 1px `--color-border-strong` tint for card/panel definition instead of relying solely on shadows (which recede on dark). Shadows remain for floating elements (popover, modal, palette, toast) where the surface genuinely detaches.

---

## Gaps & Risks — Noted (non-blocking)

1. **Icon set.** Legacy uses custom/Remix-style icons; aiaiai mandates Phosphor. We substitute 1:1 by semantic name. Occasional visual drift where Remix has a pictogram Phosphor lacks.
2. **Sidebar header composition.** Legacy has logo + product name + search stacked. aiaiai sidebar has no such composition slot. Theme delivers the style; composition is a consumer-project concern.
3. **Accent-subtle visibility on dark.** `rgba(27,87,253,0.12)` on `#1a1d24` resolves to ~`#1d2434`. Stress-test in Phase 4 — may need to bump alpha to 0.18-0.20 for visible hover/subtle-fill distinction.
4. **Dark-mode verification checklist.** `reference/theming.md:362-380` has no dark-mode entries. Phase 4 deliverable: append a "Dark theme considerations" section covering text contrast on dark, accent-subtle visibility, overlay exception to warmth doctrine, shadow-color tinting.
