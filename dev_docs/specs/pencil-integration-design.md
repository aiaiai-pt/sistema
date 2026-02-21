# Design System Sync — Visual QA + Figma Bridge

**Appetite:** Medium
**Platform:** SvelteKit site + Playwright + Claude Code to Figma
**Output:** Visual regression testing + Figma workflow docs + updated DFG process
**Date:** 2026-02-21

---

## Context

After researching Pencil MCP integration (building custom CSS parsers, node tree constructors, and compliance tooling), we discovered the sync problem was self-inflicted: maintaining a separate visual artifact (.pen file) creates a sync problem that doesn't need to exist.

The SvelteKit site already IS the visual reference — it renders every component, every variant, every state, consuming tokens directly from CSS. It's always in sync because it IS the source of truth rendered live.

Meanwhile, Claude Code to Figma (launched Feb 17, 2026) captures live browser state and converts it to editable Figma frames — eliminating the need for a .pen intermediary for Figma users.

---

## Architecture Decision

```
tokens/*.css (SOURCE OF TRUTH)
    |
    |--→ SvelteKit site (consumes CSS directly — IS the visual reference)
    |--→ reference/*.md (for AI agent consumption)
    '--→ Figma (via Claude Code to Figma, on-demand snapshots)

Svelte component demos (SOURCE OF TRUTH for visual behavior)
    |
    |--→ Playwright screenshots (visual regression baselines)
    '--→ Figma frames (via Claude Code to Figma capture)
```

No separate visual artifact to keep in sync. The code IS the design system.

---

## Jobs-to-be-Done

**Job statement:** When the design system's tokens or components change, we need automated confidence that nothing visual broke, and we need Figma-compatible output for collaborators — without maintaining a separate sync target.

### Forces

| Force | Description |
|-------|-------------|
| **Push** | Manual visual QA is unreliable. Token changes can have cascading visual effects that are hard to catch by reading CSS diffs. Figma users need a visual reference. |
| **Pull** | Automated visual regression catches unintended changes. Claude Code to Figma gives collaborators editable Figma output without maintaining a separate file. The site already does 90% of this job. |
| **Anxiety** | Visual regression can be noisy (false positives from font rendering, anti-aliasing). Need to tune thresholds. |
| **Habit** | The DFG workflow currently references Pencil for visual design. Need to update docs to reflect the new approach. |

---

## Design Principles

1. **The site is the design system** — No separate visual artifact. The SvelteKit site is both documentation and the canonical visual reference.

2. **Screenshot truth** — Visual regression tests assert on rendered output, the most honest test of whether something looks right.

3. **On-demand Figma** — Figma output is generated when needed (via Claude Code to Figma), not maintained continuously. It's a snapshot, not a sync target.

4. **Pencil for exploration** — Pencil MCP remains available for freeform AI-assisted design during DFG, but it doesn't mirror the token system or component library.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Visual regression coverage | Every component page + foundation page has baseline screenshots |
| False positive rate | < 5% of visual regression runs flag non-issues |
| Figma capture workflow documented | Solutions doc exists with step-by-step guide |
| DFG references updated | No references to .pen as a sync target |

---

## Scope

### 1. Visual Regression Testing

Add Playwright-based visual regression screenshots for every component page.

**Setup:**
- Playwright test file that navigates to each component demo page
- Screenshots captured at 1440px (desktop) and 375px (mobile) widths
- Baseline images committed to the repo
- On each change: new screenshots compared against baselines
- Configurable threshold for pixel diff tolerance (anti-aliasing, font rendering)

**Pages to capture:**
- Each component page: button, card, data-display, feedback, input, navigation
- Each foundation page: color, typography, spacing, grid, radius, motion
- Homepage (as specimen)
- Each theme variant (switch theme before capture)

**Commands:**
- `npm run test:visual` — run visual regression, report diffs
- `npm run test:visual:update` — update baselines after intentional changes

**Integration with token compliance:**
- Visual regression catches cascading effects of token changes that grep-based checks miss
- Together with the raw-px sweep (Phase 5.5), provides full coverage: structural compliance (grep) + visual correctness (screenshots)

### 2. Claude Code to Figma Workflow Documentation

Add to `dev_docs/solutions/figma-workflow.md`:

**When to use Claude Code to Figma:**
- Sharing component reference with Figma-based collaborators
- Client presentations that need Figma deliverables
- Design exploration that starts from existing components

**How to capture:**
1. Run `npm run dev` to start the SvelteKit dev server
2. Navigate to the component/page to capture
3. Use Claude Code to Figma to capture the live browser state
4. The captured frame lands in Figma as editable nodes (not a flat image)

**What transfers:**
- Layout, colors, typography, spacing, component structure
- Theme-switched variants (capture each theme separately)

**What doesn't transfer:**
- Animations/transitions (static capture)
- Interactive states (hover, focus) — capture each state separately if needed
- Responsive behavior (capture at each breakpoint separately)

**Decision guide: When to use what:**
- **Code-based prototyping** — Default for DFG workflows. Full fidelity, always in sync.
- **Pencil** — Freeform AI-assisted design exploration. Use when you need a visual canvas to iterate quickly. Don't try to mirror the token system.
- **Figma** — Client deliverables, cross-team collaboration. Generate via Claude Code to Figma from the live site.

### 3. DFG Process Updates

Update the DFG workflow to reflect the new approach:
- Phase 4 setup: When using Pencil, use it for freeform design. Don't try to sync tokens — use the style guide system instead.
- Phase 5 critique: Visual regression screenshots as an additional critique input
- Phase 6 validate: Add visual regression check alongside the existing checks
- Remove references to .pen file as a required deliverable

### 4. CLAUDE.md Updates

- Remove the `*.pen` entry from the project structure (no .pen file is a required artifact)
- Update the "By the Pencil MCP" section to clarify Pencil is for design exploration, not component library mirroring
- Add visual regression testing to the key decisions section

---

## Rabbit Holes (Decided — Do Not Revisit)

- **Pixel-perfect thresholds** — Anti-aliasing and font rendering differ across platforms. Use a percentage-based threshold (e.g., 0.1% pixel diff), not pixel-perfect matching.
- **Capturing every state** — Don't try to screenshot every hover/focus/active state. Capture the resting state + explicitly designed states (error, loading, disabled). Interactive states are tested in code.
- **Maintaining .pen component library** — Abandoned. The site is the component reference.

---

## Test Plan

### Visual Regression Setup — 8 tests

| ID | Test | Tier | What's asserted |
|----|------|------|-----------------|
| T1-01 | Playwright config exists | 1 (Auto) | `playwright.config.ts` exists with visual comparison settings |
| T1-02 | Desktop baselines captured | 1 (Auto) | Baseline screenshots exist for all pages at 1440px width |
| T1-03 | Mobile baselines captured | 1 (Auto) | Baseline screenshots exist for all pages at 375px width |
| T1-04 | Theme variant baselines | 1 (Auto) | Baselines exist for branded-example and bespoke-example themes |
| T1-05 | Diff detection works | 1 (Auto) | Intentional CSS change triggers a visual diff |
| T1-06 | Threshold filters noise | 1 (Auto) | Sub-threshold anti-aliasing differences do not trigger failures |
| T1-07 | `test:visual` command works | 1 (Auto) | `npm run test:visual` runs and produces a report |
| T1-08 | `test:visual:update` command works | 1 (Auto) | `npm run test:visual:update` regenerates baselines |

### Figma Workflow Docs — 4 tests

| ID | Test | Tier | What's asserted |
|----|------|------|-----------------|
| T2-01 | File exists | 1 (Auto) | `figma-workflow.md` exists at `dev_docs/solutions/` |
| T2-02 | Required sections present | 1 (Auto) | Headings for when to use, how to capture, what transfers, limitations, decision guide |
| T2-03 | Decision guide is actionable | 2 (Semi) | Human confirms specific trigger conditions for code vs Pencil vs Figma |
| T2-04 | Limitations section is honest | 2 (Semi) | Explicitly mentions animations/interactions as non-transferrable |

### DFG + CLAUDE.md Updates — 4 tests

| ID | Test | Tier | What's asserted |
|----|------|------|-----------------|
| T3-01 | No .pen sync references in DFG | 1 (Auto) | Grep for `.pen` sync/mirror/library in dfg.md returns 0 matches |
| T3-02 | Visual regression in DFG Phase 6 | 1 (Auto) | dfg.md mentions visual regression as a validation step |
| T3-03 | CLAUDE.md no .pen in project structure | 1 (Auto) | `*.pen` line removed from project structure diagram |
| T3-04 | CLAUDE.md Pencil section updated | 1 (Auto) | "By the Pencil MCP" clarifies exploration-only use |

---

## Out of Scope

- Histoire / isolated component stories (separate spec: `histoire-component-stories-design.md`)
- Self-built Tokens Studio (future horizon — JSON tokens as source of truth with multi-platform output)
- Dark mode visual regression (dark mode not implemented yet)
- CI integration for visual regression (local-first, CI later)

---

## Implementation Order

1. **Playwright visual regression setup** — Install Playwright, write test file, capture baselines
2. **Figma workflow documentation** — Write solutions doc
3. **DFG process updates** — Update dfg.md and CLAUDE.md
4. **Run and verify** — Ensure baselines look correct, no false positives

---

## Future: Self-Built Tokens Studio

The eventual goal is to build our own token pipeline:

```
tokens.json (W3C DTCG format — new source of truth)
    |
    |--→ CSS custom properties (generated, not hand-authored)
    |--→ Figma variables (bidirectional sync via custom MCP)
    |--→ iOS/Android tokens (future)
    '--→ reference/*.md (generated)
```

This replaces the current hand-authored CSS with generated output. Scoped as a separate spec when the need arises (multi-platform output, Figma-first design workflows, or scaling to more consuming projects).
