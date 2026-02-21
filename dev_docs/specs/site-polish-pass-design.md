# Design System Site — Polish Pass

**Appetite:** Large
**Platform:** Responsive web
**Output:** HTML+CSS (SvelteKit site) + design system token updates + reference doc corrections
**Accessibility target:** WCAG AA (with one documented exception)
**Date:** 2026-02-21

---

## Design DNA

This system descends from the Still Phone manifesto. Every fix in this pass must honor the DNA — not just "pass a checklist" but embody the identity that makes aiaiai distinct.

### The Four Spirits

| Spirit | Source | What It Means For This Pass |
|--------|--------|----------------------------|
| **Functional purity** | Dieter Rams | Every token, every CSS rule serves a purpose. If a fix introduces complexity that doesn't serve the user, it's wrong. "As little design as possible." |
| **Decisive color** | Teenage Engineering | Orange is creation. Red is destruction. Color is never decoration. TE uses white-on-orange — so do we. The visual identity takes precedence here. We document the contrast gap honestly rather than compromise the look. |
| **Quiet rebellion** | Basquiat | Earth tones as foundation. Confident but not aggressive. Choosing to keep white-on-orange despite the WCAG gap *is* a quiet rebellion — it says "we know the tradeoff and we're making it consciously, not out of ignorance." |
| **Organic texture** | Rick Rubin | Aged paper aesthetics. Breathing space. Reduced-motion isn't just a compliance checkbox — it's about respecting that some users need stillness. The system should feel calm even without animation. |

### Typography Identity: The Exposed Mechanism

The most distinctive choice in this system: **Berkeley Mono reveals structure**. Labels, data, navigation, buttons — all mono. This is the mechanism showing through the surface, like visible stitching on a leather good or exposed screws on a Teenage Engineering device.

When fixing the typography specimen's hardcoded `48px`, the replacement must honor this: the specimen is a showcase of the system's typographic voice, not a generic font sample page.

### The Warm Palette

```
Surfaces:  #f7f5f3 → #f0ece8 → #e8e2dc    (aged paper, not screens)
Text:      #2c2825 → #78716c → #a8a29e      (warm earth, never cold gray)
Accent:    #ff6b35                            (orange = creation, the only bright)
On-accent: #faf9f7                            (warm white on orange — the TE lineage)
Shadows:   rgba(44,40,37,...)                 (warm light, not computer rendering)
```

Nothing clinical. Nothing cold. Nothing that "feels like staring at a light source."

---

## Jobs-to-be-Done

**Job statement:** When I present this design system site to developers, designers, and AI agents, I need it to be an *honest* reference implementation — every page dogfoods the system correctly, documents its tradeoffs transparently, and *feels like aiaiai*, not like a generic docs site that happens to use our tokens.

### Forces

| Force | Description |
|-------|-------------|
| **Push** | Validation found real failures: animations ignore reduced-motion preferences, docs claim a wrong contrast ratio, hardcoded values bypass the token system. The site contradicts the system it documents. |
| **Pull** | A site that documents its tradeoffs honestly (including the button contrast exception) is more trustworthy than one that pretends everything passes. AI agents reading `reference/` get correct data. Developers get the real picture. |
| **Anxiety** | Documenting a known WCAG exception feels uncomfortable — like admitting a flaw. But the alternative (dark text on orange) looked wrong. An honest exception is better than a dishonest fix. |
| **Habit** | The instinct is to "fix everything" for a clean validation report. But design is about tradeoffs, and the system should model that. |

### Users

- **AI design agents** reading `reference/` docs during DFG workflows — need correct contrast ratios and honest documentation of exceptions
- **Developers** browsing the site for implementation guidance — need to know which components have accessibility caveats
- **Carlos** — needs the site to be honest about its tradeoffs while embodying the brand

---

## Design Principles (for this pass)

These are the system's existing principles applied to a polish pass:

1. **Warmth over sterility** — Fixes must preserve the aged-paper, earth-tone feel. White-on-orange buttons stay because they embody the visual identity.

2. **Decisive color** — The status dot shapes add a second channel (shape) to reinforce color meaning, not replace it. Color still carries the primary signal.

3. **Every animation earns its place** — `prefers-reduced-motion` isn't an afterthought — it's a first-class design principle. The system should be equally coherent with zero animation. Stillness is the default.

4. **Precision typography** — No hardcoded font sizes. The type scale is the law (11, 12, 13, 14, 15, 18, 24, 36). The `48px` in the typography specimen is a violation.

5. **Dogfood first** — Every fix that touches visual behavior must land in the token layer (`tokens/`) or reference docs (`reference/`) before the site layer (`site/`). The site consumes the system; it never works around it.

6. **Honest documentation** — The system documents its tradeoffs, not just its strengths. A known exception with rationale is better than a silent failure or a compromised fix.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| `/design-validate` findings | 0 Must Fix (excluding documented exception), 0 Should Fix |
| `/design-critique` severity | Clean or Minor only |
| WCAG AA contrast | All text passes except the documented button-primary exception |
| Token compliance | 0 hardcoded color, font-size, or spacing values in site code |
| `prefers-reduced-motion` | All animations respect the preference — the site is fully coherent without motion |
| Manifesto alignment | Status dots feel mechanical (exposed mechanism), not decorative. The site feels like aiaiai. Tradeoffs are documented, not hidden. |

---

## Scope: All Items

### Must Fix (Accessibility / Correctness)

| # | Item | Manifesto Connection | Fix |
|---|------|---------------------|-----|
| 1 | **Correct contrast ratio docs** | *Honest documentation*: The reference docs are the system's source of truth for AI agents. Wrong numbers = wrong designs downstream. | Correct `reference/color.md`: text-on-accent is 2.69:1, not 3.2:1. Document this as a known exception: white-on-orange buttons are a conscious brand decision, tested and accepted despite failing WCAG AA text contrast. Include the rationale. |
| 2 | **`prefers-reduced-motion`** | *Every animation earns its place*: An animation without a reduced-motion alternative violates the principle. The system must be coherent at rest. | Add `@media (prefers-reduced-motion: reduce)` for: skeleton shimmer, status-dot pulse, motion page demos. |
| 3 | **Heading hierarchy** | *Functional purity*: Semantic HTML structure is not optional. Screen readers navigate by headings. | Change `<h4>` to `<h3>` in feedback page error state section (skipped heading level). |

### Should Fix (Craft / System Compliance)

| # | Item | Manifesto Connection | Fix |
|---|------|---------------------|-----|
| 4 | **Status dot shapes** | *Exposed mechanism*: Shape makes the system's status semantics visible structurally, like Berkeley Mono makes type structure visible. *Decisive color* reinforced by shape, not replaced. | CSS shapes at 8px: circle (success), triangle-up (warning), diamond (error), hollow ring (inactive). Progressive enhancement — color remains primary. |
| 5 | **Typography specimen hardcoded 48px** | *Precision typography*: The type scale is law. A typography page that breaks its own rules is a lie. | Replace inline `font-size: 48px` with `var(--type-display-size)` (36px). The display size is 36px — the specimen should show the actual system, not a fantasy. |
| 6 | **Hero "sidebar" language** | *Functional purity*: Interface text should match the user's reality. On mobile, there is no sidebar — there's a menu. | Change "Switch themes in the sidebar" to device-agnostic language: "Switch themes using the menu." |
| 7 | **Metric value overflow** | *Breathing space*: Even with extreme data, the layout should hold its structure. | Add `text-overflow: ellipsis; overflow: hidden; white-space: nowrap` on `.metric-value`. |
| 8 | **`all: unset` focus rings** | *Accessibility*: Focus rings are non-negotiable. `all: unset` strips them — they must be explicitly restored. | Add `:focus-visible` outline restoration to all buttons using `all: unset` (homepage, feedback, data-display). |

### Should Fix (Dogfooding — Token System Gaps)

| # | Item | Manifesto Connection | Fix |
|---|------|---------------------|-----|
| 9 | **Sub-grid spacing tokens** | *Dogfood first + Precision*: The system already uses raw `2px` values in 4+ component tokens and the site uses `1px`/`2px` gaps throughout. Research confirms 5/8 major design systems (Carbon, Atlassian, Polaris, Primer, Tailwind) tokenize 2px. aiaiai should too. | Add `--space-2xs` (2px) to the spacing scale. Add `--border-width` (1px) and `--border-width-thick` (2px) as a separate border-width category. Refactor existing raw values in `components.css` and site code. Do NOT add 1px as a spacing token — 1px is a border concern per industry consensus. |

### Nice to Have (Polish)

| # | Item | Manifesto Connection | Fix |
|---|------|---------------------|-----|
| 10 | **Backdrop keyboard dismissal** | *Respectful technology*: A trap without an exit is hostile. Escape should always work. | Research confirmed: the backdrop `onkeydown` handler is dead code (div is not focusable, has `role="presentation"`). Replace with `<svelte:window>` keydown handler. |
| 11 | **Additional polish** | *As little design as possible*: Anything noticed during implementation that violates a system principle. | Issues found during implementation. |

---

## Known Exception: Button Primary Text Contrast

**What:** `--color-text-on-accent` (`#faf9f7`) on `--color-accent` (`#ff6b35`) has a contrast ratio of 2.69:1. This fails WCAG AA for normal text (needs 4.5:1) and for large text (needs 3:1).

**Why we're keeping it:** Dark text on orange was tested visually and doesn't work — it undermines the bold, decisive feel that is core to the brand's Teenage Engineering lineage. The available alternatives (darker orange background, dark text) all compromise the visual identity more than they improve accessibility.

**What we tried:**
- `#2c2825` dark text on `#ff6b35` orange → 5.15:1 contrast, passes AA, but visually reads as muted and cautious. Rejected after live testing.
- Darker orange (`#c2410c`) with light text → passes AA, but changes the brand orange significantly. Not pursued.

**Mitigations:**
- Button labels are always uppercase Berkeley Mono with wide tracking, which improves perceptual legibility even at lower contrast ratios
- Buttons are interactive controls with clear affordances (shape, padding, cursor) — they don't rely solely on text contrast for recognition
- This exception applies only to primary button text. All other text in the system meets WCAG AA.

**Status:** Accepted as a conscious design tradeoff. Will revisit if we find an orange that preserves the TE feel while meeting 3:1. This is documented in `reference/color.md`.

---

## Rabbit Holes (Decided — Do Not Revisit)

- **Brand accent stays `#ff6b35`** — The orange is non-negotiable.
- **Button primary text stays `#faf9f7`** — Tested dark text, it doesn't work visually. This is a documented WCAG exception.
- **`--color-text-on-accent` stays `#faf9f7`** — No token changes for this pass.
- **Destructive button text stays light** — The warm-shifted red with `#faf9f7` has ~4.5:1. Sufficient.
- **Status dots are already WCAG compliant** — Text labels are always present. Shapes are progressive enhancement, not a compliance requirement.
- **No new color or font primitives** — Only new primitives are `--raw-space-2` (2px) for sub-grid spacing and border-width tokens, based on industry research.

## Implementation Notes (post-pass)

**Completed:** All 11 scope items implemented. Critique: Minor severity. Validation: PASS (0 Must Fix from this pass).

**Additional work discovered during implementation:**
- `--accent-stripe-width: 3px` token added for toast accent + rule-card borders (recurring pattern had no token)
- Focus ring `var()` fallback values removed across 5 files (fallbacks defeat theming)
- Toggle knob insets tokenized (`top/left: 2px` → `var(--space-2xs)`)
- 30+ scattered raw px values tokenized across foundations and component pages
- Motion page hover transforms got `prefers-reduced-motion` guard (missed in initial implementation)
- Spinner border in button page: `2px` → `var(--border-width-thick)`
- Radius demo border: `2px` → `var(--border-width-thick)`

**Flagged for separate follow-up (not in this pass's scope):**
- `--color-text-secondary` (#78716c) contrast ~3.93:1 — needs darkening to meet 4.5:1
- `--color-text-muted` (#a8a29e) contrast ~2.30:1 — needs darkening for caption text
- Input page static toggle/checkbox demos have misplaced ARIA attributes
- `.badge` `gap: 6px` → changed to `var(--space-xs)` (4px) — 6px was off-grid with no token
- Nav badge `min-width/height: 18px` remains off-grid — needs a component token

**Process improvement:** Phase 5.5 (Token Compliance Sweep) added to DFG workflow.

## Out of Scope

- Dark mode
- New components or pages
- Responsive layout changes (completed in previous pass)
- Performance optimization
- Phosphor Icons integration (status dots use CSS shapes, not icons — 8px is too small for icon glyphs)
- Button contrast "fix" — documented as known exception, revisit separately
- `--color-text-secondary` / `--color-text-muted` contrast fixes — systemic token change, separate pass
