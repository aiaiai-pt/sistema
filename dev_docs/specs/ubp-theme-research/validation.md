# UBP Theme — Phase 6 Validation Report

**Date:** 2026-04-18
**Suite:** `site/tests/ubp/` — 76 tests total, 73 passed, 3 skipped (desktop-only), 0 failed
**Command:** `cd site && npm test`
**Baseline hash:** first capture — subsequent runs compare against `tests/ubp/visual.spec.ts-snapshots/`

## Scope

Validation covered three routes (`/themes/ubp`, `/themes/ubp/verticais`, `/themes/ubp/utilizadores`) against four viewports (1440 / 1024 / 768 / 375). Three concerns:

1. **Accessibility** — WCAG 2.1 AA via `@axe-core/playwright`, fail on `serious` or `critical` impact.
2. **Content stress** — behavioural assertions on the edge cases the content model was designed to exercise.
3. **Visual regression** — full-page screenshots per route per viewport, pixel-diff via Playwright's `toHaveScreenshot`.

## Accessibility (12 tests, 12 passed)

Every route passes WCAG 2.1 AA at 1440 / 1024 / 768 / 375.

### Violations fixed during Phase 6

| Element | Fg / bg | Before | After fix |
|--------|---------|--------|-----------|
| `--color-text-muted` on surfaces | `#6b7280` / `#161922` | 4.29:1 (fail) | `#9097a1` / `#161922` — 4.8:1 ✓ |
| Accent links ("Abrir →", breadcrumb, +N) | `#1b57fd` / `#161922` | 3.63:1 (fail) | `#3d7bff` / `#161922` — 5.0:1 ✓ |
| `.card-muted` nested chip text | `#595e68` (computed from opacity 0.55) | 2.52:1 (fail) | Replaced opacity-based muting with token-based muting (surface-secondary bg + secondary text) |
| `.row-muted` (Sofia Inactivo) | opacity-derived | under AA | Same fix as above — no opacity, token colors |
| Bloqueado chip text on destructive-subtle | `#ef4444` / `#311a1f` | 1.82:1 (fail) | `#f87171` (red-400) on `rgba(248,113,113,0.15)` — 5.7:1 ✓ |
| `+N` chip text on accent-subtle | `#3d7bff` / `#16233d` | 4.08:1 (fail) | `var(--color-text)` white on accent-subtle — 12:1+ ✓ |

### Accepted trade-offs

- **Accent brightness deviation from legacy.** Figma reference used `#1b57fd`; I bumped to `#3d7bff` for dark-surface AA compliance. The accent still reads as "electric blue" but is lighter/less saturated than the source. Documented in `tokens/themes/ubp.css` header. If the client prefers legacy-exact accent over AA compliance, they can override but axe will fail — the reversal must be conscious.
- **Status colors bumped to 400-shades** (`#f87171`, `#4ade80`, `#fbbf24` instead of 500-shades) so tinted-pill text passes AA on its own tinted bg. Preserves semantic-meaning (still reads as "danger", "positive", "caution") while gaining 2-3 contrast points.

### Not in scope (deferred)

- Automated keyboard-navigation path walk (Playwright supports but is high-effort; manual spot-check only)
- Screen-reader narration fidelity (requires human review — not covered by axe)

## Content Stress (13 tests × 1-4 viewports = 52 runs, 49 passed + 3 skipped)

All behavioural assertions on edge cases hold:

- Empty description (V-08 "Ruído Ambiente") renders `—` with `.empty` class
- Long name (V-03 "Estacionamento Público Rotativo", 34 chars) clamps to one line without overflowing
- Rascunho state (V-05 Trotinetes) shows warning chip
- Inactivo state (V-11 Rede de Águas) applies `.card-muted` and reads with reduced emphasis
- Category filter (click "Mobilidade") narrows the grid
- 5-group user (U-003 Maria) renders "+3" overflow chip
- "nunca" last-access (U-017 Diogo) renders literally without wrapping or "ago" formatter
- Bloqueado pill computed bg is `rgba(...)` tinted (alpha < 0.5), not solid fill — enforces parity rule
- Inactivo row (U-009 Sofia) has `.row-muted` class
- Row height at 1440 is exactly 56px (Figma target) — skipped at narrower viewports where responsive wrap applies
- Theme attribute lands on `<html>` (no shell leak)
- Sidebar width override is 288px (not default 240)
- Body font resolves to Hanken Grotesk

## Visual Regression (12 snapshots, all baselined)

Captured 12 full-page PNGs (`landing` / `verticais` / `utilizadores` × 4 viewports) in `site/tests/ubp/visual.spec.ts-snapshots/`. Diff tolerance: `maxDiffPixelRatio: 0.01` with `threshold: 0.2` — permissive enough for sub-pixel font hinting, tight enough to catch token drift.

Subsequent runs fail if:
- A token change produces > 1% differing pixels on any page
- A responsive breakpoint regresses
- Font loading changes layout

Unblocking a legitimate change: `npm run test:update`. The commit should declare what changed and why.

## Baselines are machine-specific

Snapshots are suffixed `-darwin` because font rendering differs between macOS / Linux / Windows. CI running on Linux will fail with the current baselines. Two options:

1. **Re-baseline per-OS** — regenerate on Linux and commit the `-linux` variants alongside.
2. **Docker-locked CI** — render tests in a fixed container so `-linux` is the canonical output.

Recommended: option 2 when CI lands, option 1 for interim local-only guarding. This is noted for whoever wires CI.

## Reproducing

```bash
cd site
npm run build        # theme needs production bundle (adapter-static + prerender)
npm test             # runs a11y + content + visual across 4 viewports
npm run test:update  # regenerate visual baselines (conscious acknowledgement)
```

Playwright auto-spawns `vite preview` on port 4173. Tests cannot run against `vite dev` — HMR CSS injection poisons visual baselines.

## Findings that led to code changes

1. **Opacity-based muting is incompatible with AA on dark.** `opacity: 0.55` compounds on top of text-muted tokens, dropping contrast to 2-3:1. Replaced with explicit bg/text token swaps. This is a pattern to propagate wherever aiaiai uses opacity for "deactivated" states.
2. **`--color-accent` cannot serve both fill AND text on dark.** The legacy `#1b57fd` is designed as an accent fill; as body/link text on a dark surface it fails AA. We brightened the whole accent for UBP dark. Future dark themes should run the same check.
3. **Tinted pills (chip on its own subtle bg) are a parity trap.** Red-500 text on red-500-alpha-15% bg = 1.8:1. Switching to red-400 family lifts every pill to AA without visual drama. Documented in `reference/theming.md` dark-mode addendum.

## Gates passed

- [x] `npm run lint:tokens` — zero violations
- [x] `npm run build` — adapter-static output, 3 UBP pages prerendered
- [x] `npm test` — 73 passed / 3 skipped / 0 failed
- [x] All three routes AA at four viewports
- [x] 12 visual baselines committed

Ready to ship as a design-system release.
