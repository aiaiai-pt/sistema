# Design System Sync — Figma Bridge + Token Change Communication

**Appetite:** Small
**Platform:** SvelteKit site + Claude Code to Figma
**Output:** Figma workflow docs + token change communication pattern + updated DFG process
**Date:** 2026-02-21

---

## Context

After researching Pencil MCP integration and then Playwright visual regression, we found both were solving the wrong problem:

- **Pencil sync** — maintaining a separate visual artifact creates a sync problem that doesn't need to exist. The SvelteKit site already IS the visual reference.
- **Visual regression on the docs site** — screenshots of the design system site just show you what you already changed. The real visual regression risk lives in consuming projects (Still Phone, Ontograph, client work), and that testing belongs in those repos.

What the design system repo actually needs: a way to communicate changes to consumers, a Figma bridge for collaborators, and clean documentation.

---

## Architecture Decision

```
tokens/*.css (SOURCE OF TRUTH)
    |
    |--→ SvelteKit site (consumes CSS directly — IS the visual reference)
    |--→ reference/*.md (for AI agent consumption)
    '--→ Figma (via Claude Code to Figma, on-demand snapshots)
```

No separate visual artifact to keep in sync. The code IS the design system.

Visual regression testing belongs in consuming projects, not here. This repo provides the communication layer so consumers know when to check.

---

## Jobs-to-be-Done

**Job statement:** When the design system's tokens change, consuming projects need to know what changed and whether it might affect them — and Figma-based collaborators need a way to get editable output without a sync target.

### Forces

| Force | Description |
|-------|-------------|
| **Push** | Token changes can cascade into consuming projects in non-obvious ways. Reading a CSS diff doesn't tell you the visual impact. Figma users need a visual reference. |
| **Pull** | Claude Code to Figma gives collaborators editable output on demand. A token changelog tells consumers exactly what to check. The site already serves as the living visual reference. |
| **Anxiety** | Changelog discipline can lapse. Need to make it low-friction. |
| **Habit** | The DFG workflow currently references Pencil for visual design and .pen as a deliverable. Need to update docs. |

---

## Design Principles

1. **The site is the design system** — No separate visual artifact. The SvelteKit site is both documentation and the canonical visual reference.

2. **Consumers own their regression** — Visual regression testing belongs in consuming projects, where the real layouts and real data live. The design system provides change communication, not screenshots.

3. **On-demand Figma** — Figma output is generated when needed (via Claude Code to Figma), not maintained continuously. It's a snapshot, not a sync target.

4. **Pencil for exploration** — Pencil MCP remains available for freeform AI-assisted design during DFG, but it doesn't mirror the token system or component library.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Figma capture workflow documented | Solutions doc exists with step-by-step guide |
| Token change communication pattern | Documented approach for flagging breaking vs non-breaking changes |
| DFG references updated | No references to .pen as a sync target |
| CLAUDE.md accurate | No .pen in project structure, Pencil section reflects exploration-only role |

---

## Scope

### 1. Claude Code to Figma Workflow Documentation

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

### 2. Token Change Communication

Document a pattern for communicating token changes to consuming projects in `dev_docs/solutions/token-changes.md`:

**Change categories:**
- **Safe** — Adding new tokens. No action needed by consumers.
- **Check** — Changing a semantic token's resolved value (e.g., `--space-md` goes from `1rem` to `1.25rem`). Consumers should visually check affected layouts.
- **Breaking** — Removing or renaming a token. Consumers' builds will break.

**Communication approach:**
- Commit messages flag the category: `[tokens:safe]`, `[tokens:check]`, `[tokens:breaking]`
- Breaking changes get a note in `CHANGELOG.md` with migration guidance
- The `reference/tokens.md` file always reflects the current state

**Visual regression guidance for consuming projects:**
- Recommended setup: Playwright screenshots of key pages at 1440px and 375px
- Run after pulling design system updates flagged as `[tokens:check]` or `[tokens:breaking]`
- Each consuming project owns its own baselines and thresholds

### 3. DFG Process Updates

Update the DFG workflow to reflect the new approach:
- Phase 4 setup: When using Pencil, use it for freeform design. Don't try to sync tokens — use the style guide system instead.
- Remove references to .pen file as a required deliverable

### 4. CLAUDE.md Updates

- Remove the `*.pen` entry from the project structure (no .pen file is a required artifact)
- Update the "By the Pencil MCP" section to clarify Pencil is for design exploration, not component library mirroring

---

## Rabbit Holes (Decided — Do Not Revisit)

- **Visual regression in this repo** — The docs site screenshots only tell you what you already changed. Visual regression belongs in consuming projects where real layouts live.
- **Maintaining .pen component library** — Abandoned. The site is the component reference.
- **Automated changelog generation** — Keep it manual via commit message prefixes. Automation adds tooling complexity for a low-frequency event (token changes are infrequent).

---

## Test Plan

### Figma Workflow Docs — 4 tests

| ID | Test | Tier | What's asserted |
|----|------|------|-----------------|
| T1-01 | File exists | 1 (Auto) | `figma-workflow.md` exists at `dev_docs/solutions/` |
| T1-02 | Required sections present | 1 (Auto) | Headings for when to use, how to capture, what transfers, limitations, decision guide |
| T1-03 | Decision guide is actionable | 2 (Semi) | Human confirms specific trigger conditions for code vs Pencil vs Figma |
| T1-04 | Limitations section is honest | 2 (Semi) | Explicitly mentions animations/interactions as non-transferrable |

### Token Change Communication — 3 tests

| ID | Test | Tier | What's asserted |
|----|------|------|-----------------|
| T2-01 | File exists | 1 (Auto) | `token-changes.md` exists at `dev_docs/solutions/` |
| T2-02 | Categories defined | 1 (Auto) | Document defines safe, check, and breaking categories with examples |
| T2-03 | Consumer guidance present | 1 (Auto) | Document includes visual regression setup guidance for consuming projects |

### DFG + CLAUDE.md Updates — 3 tests

| ID | Test | Tier | What's asserted |
|----|------|------|-----------------|
| T3-01 | No .pen sync references in DFG | 1 (Auto) | Grep for `.pen` sync/mirror/library in dfg.md returns 0 matches |
| T3-02 | CLAUDE.md no .pen in project structure | 1 (Auto) | `*.pen` line removed from project structure diagram |
| T3-03 | CLAUDE.md Pencil section updated | 1 (Auto) | "By the Pencil MCP" clarifies exploration-only use |

---

## Out of Scope

- Visual regression testing in this repo (belongs in consuming projects)
- Histoire / isolated component stories (separate spec: `histoire-component-stories-design.md`)
- Self-built Tokens Studio (future horizon — JSON tokens as source of truth with multi-platform output)
- Component authoring workflow (separate spec — how to add new components to the system)
- CI integration (not needed at current scale)

---

## Implementation Order

1. **Figma workflow documentation** — Write solutions doc
2. **Token change communication** — Write solutions doc
3. **DFG + CLAUDE.md updates** — Update references
4. **Verify** — Grep for stale .pen references

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

## Future: Component Authoring Workflow

How new components get added to the system — from design exploration through token definition, demo page creation, reference doc update, and consumer communication. Separate spec to be written.
