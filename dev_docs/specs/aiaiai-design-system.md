# aiaiai Studio Design System

**Appetite:** XL — Full foundations + core component set
**Platform:** Responsive web (CSS custom properties portable to any framework; token architecture supports future iOS/Android compilation)
**Output:** CSS custom properties + Pencil .pen file (visual reference + component library)

---

## Jobs-to-be-Done

**Job statement:** When aiaiai studio starts a new project or onboards a client, they need a unified design language that embodies the studio's DNA — computing with soul, earthy warmth, functional purity — while adapting to each project's specific context, so every product feels unmistakably aiaiai without being identical.

### Forces Diagram

**Push (away from current state):**
- Two projects (Still Phone, Ontograph) evolved overlapping-but-divergent tokens independently
- Text colors, motion timing, and type choices drift between projects
- No shared source of truth — each project reinvents the foundation
- Client work has no starting point — every engagement starts from scratch

**Pull (toward new solution):**
- One canonical token set that all projects inherit
- Tiered theming: studio DNA preserved, client brand layered on top
- New projects bootstrap in minutes, not days
- Design decisions compounding across projects instead of being relieves in each one

**Anxiety:**
- Over-systemizing could kill the organic, handmade feel the manifesto demands
- A rigid system might not flex enough for genuinely different products (toddler app vs. enterprise ontology editor)
- Theming might dilute the aiaiai identity until it's unrecognizable

**Habit:**
- Copy-paste tokens from the last project is fast enough in the moment
- Tailwind defaults are comfortable and well-documented
- "We'll unify later" — the classic deferred systemization

### Success Metrics

**User-outcome (designers/developers using the system):**
- New project reaches "looks like aiaiai" in < 1 hour of setup
- Client theme achievable by changing < 20 tokens (branded tier)
- Zero hardcoded color/spacing values in any project using the system

**Business:**
- Client projects ship with consistent quality without per-project design system work
- Design decisions made once, applied everywhere — compounding returns

---

## Design Principles (derived from the manifesto)

1. **Warmth over sterility.** Earth tones, aged paper, warm shadows. Never clinical white, never pure black. The screen should feel like a well-loved object, not a light source.

2. **Decisive color, not decorative color.** Orange means creation/focus. Red means destruction. Color carries meaning. If a color doesn't have a job, it doesn't appear.

3. **Breathing space is information.** Whitespace is not empty — it creates rhythm, hierarchy, and calm. Dense information is fine, but it needs room to breathe. Silence is as important as content.

4. **Every animation earns its place.** Motion serves orientation, feedback, or continuity. 150-300ms for UI transitions, longer for dramatic gestures (curtain, breathing). Never decorative motion.

5. **Precision typography, every character earns its place.** Monospace for data (numbers, code, time). Sans for interface. Display for brand moments. No font appears without a reason.

---

## Theming Architecture: Two Tiers

### Tier 1: Branded
- **What changes:** Accent color, secondary color, logo, surface tint direction (warm/cool)
- **What stays:** Typography, spacing scale, motion language, grid, elevation, radius scale, the foundational warmth
- **Use case:** Client dashboards, whitelabel products, internal tools with client branding
- **Token count to override:** < 20 tokens

### Tier 2: Bespoke
- **What changes:** Full color palette, typography pairing, surface materials (texture vs. flat), motion personality (snappy vs. slow), elevation style (shadows vs. borders), radius language
- **What stays:** Spacing scale (8px grid), grid structure, accessibility minimums, token naming convention
- **Use case:** Client-facing consumer products where aiaiai builds something that doesn't look like aiaiai
- **Token count to override:** 40-80 tokens

---

## Scope — What We're Building

### Foundations (must-have)
1. **Color system** — Semantic palette with warm/earthy defaults, full light theme, prepared for dark (not designing dark now)
2. **Typography system** — Distinctive sans + mono pairing, type scale, line heights, font weights, measure rules
3. **Spacing scale** — 8px base, named tokens (xs through 4xl), component-specific spacing tokens
4. **Grid** — Responsive grid with breakpoints, column system, content width constraints
5. **Elevation** — Warm shadow scale (never cold gray shadows), alternative border-based elevation
6. **Radius** — Scale from sharp to rounded, semantic tokens (input, card, pill, circle)
7. **Motion** — Duration scale, easing curves, choreography principles, breathing animation spec
8. **Theming architecture** — CSS custom property structure that enables Tier 1 and Tier 2 overrides

### Core Components (starter set)
9. **Button** — Primary, secondary, ghost, destructive. All sizes. With Phosphor icon support.
10. **Input** — Text, select, toggle, checkbox. Labels, help text, error states.
11. **Card** — Surface container with variants (flat, elevated, bordered). Content-agnostic.
12. **Navigation** — Sidebar nav pattern (Ontograph-style) + bottom nav pattern (Still Phone-style).
13. **Data display** — Key-value pairs, badges, tags, status indicators.
14. **Feedback** — Toast/notification, empty state, loading skeleton, error state.

### Deliverables

**1. Token files** — `tokens/` (the canonical source of truth)
- `tokens/base.css` — Primitive values (raw colors, raw sizes)
- `tokens/semantic.css` — Semantic aliases (surface, text, accent roles)
- `tokens/components.css` — Component-scoped tokens (button-padding, card-radius)
- `tokens/themes/aiaiai.css` — Default aiaiai theme (imports base + semantic)
- `tokens/themes/branded-example.css` — Example Tier 1 branded override
- `tokens/themes/bespoke-example.css` — Example Tier 2 bespoke override

**2. Design reference** — Pencil .pen file
- All foundations visualized (color swatches, type scale, spacing, elevation, etc.)
- Component library with all states

**3. Docs site** — `site/` (SvelteKit, deployable to Cloudflare Pages)
A visual, browsable reference for designers AND a structured reference for AI design agents.
Dual audience: humans browse visually, agents read structured data.

- **Foundations pages**: Color palette rendered as swatches with names + values. Type scale rendered at real sizes. Spacing scale as visual blocks. Elevation as stacked cards. Motion as live animated examples.
- **Components pages**: Each component rendered live with all variants and states. Interactive — toggle between sizes, states, themes.
- **Principles page**: The manifesto-derived philosophy, visual examples of do/don't.
- **Theming page**: Live theme switcher showing Tier 1 and Tier 2 overrides applied to the same components. Shows designers exactly what changes at each tier.
- The site itself consumes the design system's own tokens — it IS a proof that the system works.
- Deployable to `design.aiaiai.pt` or similar.

**4. Agent-readable reference** — `reference/`
Structured markdown files that AI design agents (design-spec-architect, DFG workflow, design-critic)
can read directly during design work:
- `reference/tokens.md` — Complete token table (name, value, role, tier-1-overridable, tier-2-overridable)
- `reference/principles.md` — Design principles as actionable rules (not prose — checkable criteria)
- `reference/components.md` — Component specs (variants, states, token usage, do/don't)
- `reference/theming.md` — Theme creation guide with token override maps
- `reference/typography.md` — Type scale, pairing rules, measure/leading specs
- `reference/color.md` — Full palette with semantic roles, contrast ratios, usage rules
- `reference/motion.md` — Duration/easing table, when to use each, choreography rules
These files are optimized for LLM consumption: structured, complete, no ambiguity.
AI agents working on any aiaiai project can `Read` these files to ground their design decisions.

**5. Developer docs** — `dev_docs/solutions/`
- Token reference tables (name, value, usage)
- Integration guide (how to import into a SvelteKit/Tailwind project)
- Theming guide (how to create Tier 1 and Tier 2 themes)

---

## Research Synthesis (Phase 2)

### Competitive Landscape

**Studied:** Linear, Vercel Geist, Teenage Engineering, Stripe, Arc Browser

| System | Key Insight for aiaiai |
|--------|----------------------|
| **Linear** | LCH color space for perceptually uniform scales. Theming via 3 variables (accent, gray, background) — proves Tier 1 <20 tokens is viable. |
| **Geist** (Vercel) | Categorical typography naming (heading/body/label/code) instead of linear scale (text-sm/md/lg). Step-number semantics (gray-100 through gray-1000). |
| **Teenage Engineering** | Orange as signal color (direct ancestor of #ff6b35). Univers typeface. Exposed mechanism aesthetic — controls look like what they do. |
| **Stripe** | CIELAB/OKLCH accessible color generation. Proves you can have warm, distinctive palettes while hitting WCAG AA programmatically. |
| **Arc Browser** | Never-black text (#2E1000 warm dark brown). Parchment surfaces (#F4EBE5). Proof that "warm computing" can feel premium at scale. |

**Takeaway:** OKLCH color space for generating scales. Categorical type naming. The "never-black, never-clinical-white" principle is validated by Arc and aligns perfectly with the manifesto.

### Existing Patterns — Token Convergence Map

Deep analysis of Still Phone and Ontograph codebases reveals:

| Token Area | Still Phone | Ontograph | Recommendation |
|------------|-------------|-----------|----------------|
| **Surface primary** | `#f7f5f3` | `#f7f5f3` | **Converged.** Use as-is. |
| **Accent** | `#ff6b35` | `#ff6b35` | **Converged.** Use as-is. |
| **Destructive** | `#dc2626` | `#dc2626` | **Converged.** Use as-is. |
| **Text primary** | `#78716c` (stone-dark) | `#2c2825` (warm brown) | **Use Ontograph's #2c2825.** Better contrast ratio (11.3:1 vs 4.7:1 on #f7f5f3). #78716c becomes `text-muted`. |
| **Text muted** | `#a8a29e` (stone-muted) | `#78716c` | **Use #a8a29e** for muted, #78716c for secondary. Three-tier text hierarchy. |
| **Surface secondary** | `#f1f0ef` (stone-medium) | `#f0ece8` (warmer) | **Use #f0ece8.** Warmer, aligns with manifesto. |
| **Typography** | `ui-monospace` + `system-ui` | `Inter` + `Berkeley Mono` | **Neither.** System fonts violate design conventions. Need distinctive pairing (see Typography section). |
| **Motion — micro** | 500ms (too slow for micro) | 150ms | **Use 150ms** for micro-interactions. |
| **Motion — standard** | 500ms | 300ms | **Use 300ms** for standard transitions. |
| **Motion — dramatic** | 2s (curtain), 4s (breathing) | — | **Keep.** These are signature Still Phone gestures, not system defaults. |
| **Spacing** | 8px base (implied) | 8px base (explicit) | **Converged.** 8px grid non-negotiable. |

### Typography Candidates

The manifesto demands: mono for data, sans for interface, display for brand moments. Never generic fonts.

**Mono (data/code/time):**
- **Berkeley Mono** — Already used in Ontograph. Distinctive, warm character. Excellent for tabular data.
- **JetBrains Mono** — Open source alternative. Good ligatures. Slightly colder.
- **iA Writer Mono** — Custom proportions, very readable. Warm personality.
- **Recommendation:** Berkeley Mono (already proven in the ecosystem).

**Sans (interface):**
- **Söhne** (Klim) — Akzidenz-Grotesk descendant. Warm without being soft. Used by OpenAI.
- **Untitled Sans** (Klim) — Neutral but never sterile. Great for UI at all sizes.
- **GT Walsheim** — Geometric with warmth. Friendly without being childish.
- **Instrument Sans** (Google) — Open source. Geometric, distinctive, good for UI.
- **Recommendation:** Needs user decision. Söhne if licensing allows, Instrument Sans if open source preferred.

**Display (brand moments):**
- Consider whether the sans does double duty at large sizes, or if a distinct display face is needed.
- The manifesto's "precision" ethos suggests the sans should work at display sizes rather than adding a third family.

### Content Model (Docs Site)

**Architecture:** SvelteKit + mdsvex + `@sveltejs/adapter-static` → Cloudflare Pages

**Page structure (15-18 pages):**
- Foundations: Color, Typography, Spacing, Grid, Elevation, Radius, Motion (7 pages)
- Components: Button, Input, Card, Navigation, Data Display, Feedback (6 pages)
- System: Principles, Theming, Getting Started (3 pages)

**Agent-readable reference format:**
Each `reference/*.md` file uses structured tables with a `Constraints` column for machine-parseable rules:
```
| Token | Value | Role | Tier 1 Override | Tier 2 Override | Constraints |
|-------|-------|------|-----------------|-----------------|-------------|
| --color-surface | #f7f5f3 | Primary background | tint direction only | full override | WCAG AA with --color-text |
```

**Theme switching:** `data-theme` attribute on `<html>`, switched via cookie + `hooks.server.ts` `transformPageChunk` to prevent FOUC. No client-side flash.

### Constraints & Feasibility

| Constraint | Status | Notes |
|------------|--------|-------|
| CSS custom properties for theming | **Validated** | `data-theme` attribute selectors for runtime switching. No file-swapping needed. |
| Tailwind v4 integration | **Validated** | `@theme inline` consumes external `--color-*` properties as utilities. Prefix `--color-{name}` generates `text-{name}`, `bg-{name}` automatically. |
| Token naming convention | **Decided** | Primitives: `--raw-{category}-{name}`. Semantic: `--{category}-{name}` (e.g., `--color-surface`, `--space-md`). Components: `--{component}-{property}`. |
| Performance at ~200 tokens | **No concern** | CSS custom properties have negligible runtime cost. Cascade resolution is O(1) per property. |
| Pencil MCP compatibility | **Validated** | `set_variables` accepts `--` prefixed names. Tokens defined in Pencil map 1:1 to CSS custom properties. |
| OKLCH color generation | **Validated** | Supported in all modern browsers. Fallback hex values in base.css for older browsers. |

### Hill Chart

| Scope | Position | Confidence |
|-------|----------|------------|
| Color system (palette + roles + OKLCH scales) | **Hilltop** | High — convergence map + OKLCH approach clear |
| Typography system (scale + pairing) | **Hilltop** | High — categorical naming decided, candidates identified, user picks pairing |
| Spacing scale | **Downhill** | 8px grid converged, just needs token names |
| Grid & breakpoints | **Hilltop** | Standard responsive approach, just needs documentation |
| Elevation (warm shadows) | **Hilltop** | Both projects use warm shadows, need unified scale |
| Radius scale | **Hilltop** | Straightforward — semantic names for existing patterns |
| Motion system | **Hilltop** | Three-tier timing reconciled (150/300/500+ms) |
| Theming architecture | **Hilltop** | `data-theme` + CSS custom properties validated |
| Core components (6) | **Hilltop** | Patterns exist in both projects, need unification |
| Docs site | **Hilltop** | SvelteKit + mdsvex + static adapter — proven stack |
| Agent-readable reference | **Hilltop** | Format designed, just needs content |
| Token files (CSS) | **Downhill** | Naming convention decided, values mostly converged |

**All scopes at Hilltop or Downhill. No Uphill blockers. Ready for Phase 3.**

### Design Inspiration

The aiaiai identity sits at an intersection not commonly found in design systems:
- **Teenage Engineering** warmth + tactility
- **Linear** precision + developer ergonomics
- **Arc Browser** warm-not-black text philosophy
- **Geist** systematic rigor + categorical thinking

The system should feel like a well-loved tool — warm wood grain, not cold steel. Surfaces should have the quality of aged paper, not clinical white. Color should feel decisive, like labels on a mixing board, not decorative.

---

## Architecture (Phase 3)

### Object Model (OOUX)

The design system's objects are not screens — they're the primitives that compose every screen.

| Object | Core Attributes | Relationships | Primary CTA |
|--------|----------------|---------------|-------------|
| **Token** | name, value, role, tier, category | belongs to Scale; overridden by Theme | Copy value |
| **Scale** | category (color/type/space/elevation/radius/motion), steps | contains Tokens; visualized on Reference Page | Browse steps |
| **Component** | name, variants, sizes, states | consumes Tokens; demonstrated on Reference Page | View states |
| **Theme** | name, tier (1 or 2), token overrides | overrides Tokens; applied to Components | Apply / switch |
| **Reference Page** | title, category, audience (human/agent/both) | renders Scales + Components; links to Token source | Read / copy |
| **Token File** | path, layer (base/semantic/component/theme) | contains Tokens; imported by projects | Import |

**Key relationships:**
- Token → Scale → Component (consumption chain)
- Theme → Token (override chain, scoped by tier)
- Reference Page → Scale + Component (documentation chain)
- Token File → Token (source-of-truth chain)

### Breadboard

**Places (what exists) → Affordances (what you can do) → Connections (where it leads)**

```
┌─────────────────────────────────────────────────────────────┐
│  DOCS SITE (design.aiaiai.pt)                               │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐   │
│  │ Getting      │    │ Foundations   │    │ Components    │   │
│  │ Started      │    │              │    │               │   │
│  │ • Install    │    │ • Color      │    │ • Button      │   │
│  │ • Configure  │    │ • Typography │    │ • Input       │   │
│  │ • First theme│    │ • Spacing    │    │ • Card        │   │
│  │              │    │ • Grid       │    │ • Navigation  │   │
│  └──────┬───────┘    │ • Elevation  │    │ • Data Display│   │
│         │            │ • Radius     │    │ • Feedback    │   │
│         │            │ • Motion     │    │               │   │
│         │            └──────┬───────┘    └──────┬────────┘   │
│         │                   │                   │            │
│         └───────────────────┼───────────────────┘            │
│                             │                                │
│  ┌──────────────┐    ┌──────┴───────┐    ┌───────────────┐   │
│  │ Principles    │    │ Theming      │    │ [Theme        │   │
│  │              │    │              │    │  Switcher]    │   │
│  │ • Warmth     │    │ • Tier 1 guide│   │               │   │
│  │ • Color roles│    │ • Tier 2 guide│   │ Persistent    │   │
│  │ • Space      │    │ • Token map  │    │ across all    │   │
│  │ • Motion     │    │ • Examples   │    │ pages         │   │
│  │ • Typography │    │              │    │               │   │
│  └──────────────┘    └──────────────┘    └───────────────┘   │
│                                                             │
│  AFFORDANCES per page:                                      │
│  • View rendered tokens (swatches, type specimens, spacing) │
│  • Copy token name / CSS value                              │
│  • Toggle theme (aiaiai / branded / bespoke)                │
│  • Toggle component state (default/hover/active/disabled)   │
│  • Toggle component size (sm/md/lg)                         │
│  • View contrast ratios on color page                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TOKEN FILES (tokens/)                                      │
│                                                             │
│  base.css ──→ semantic.css ──→ components.css               │
│     ↑              ↑                                        │
│     │              │                                        │
│  themes/aiaiai.css (default, imports base + assigns semantic)│
│  themes/branded-example.css (overrides <20 semantic tokens) │
│  themes/bespoke-example.css (overrides 40-80 tokens)        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  AGENT REFERENCE (reference/)                               │
│                                                             │
│  tokens.md ← full token table, machine-parseable            │
│  principles.md ← checkable rules (PASS/FAIL criteria)       │
│  components.md ← decision trees, not prose                  │
│  theming.md ← override maps per tier                        │
│  typography.md ← scale + pairing rules + constraints        │
│  color.md ← palette + roles + contrast ratios               │
│  motion.md ← duration/easing table + choreography           │
└─────────────────────────────────────────────────────────────┘
```

### State Inventory (Core Components)

Every component gets every applicable state. No exceptions.

| Component | States |
|-----------|--------|
| **Button** | default, hover, active/pressed, focused, disabled, loading (spinner), with-icon, icon-only |
| **Input (text)** | empty, placeholder, filled, focused, error, disabled, read-only, with-help-text, with-label, with-icon |
| **Input (select)** | closed, open/expanded, option-hover, selected, disabled, error |
| **Input (toggle)** | off, on, off-hover, on-hover, disabled-off, disabled-on |
| **Input (checkbox)** | unchecked, checked, indeterminate, unchecked-hover, checked-hover, disabled-unchecked, disabled-checked |
| **Card** | flat, elevated, bordered, interactive-hover, interactive-active, selected, loading (skeleton) |
| **Navigation (sidebar)** | expanded, collapsed, item-default, item-hover, item-active, item-with-badge, section-header |
| **Navigation (bottom)** | item-default, item-active, item-with-badge, item-disabled |
| **Data display (badge)** | neutral, info, success, warning, error, with-dot, with-icon |
| **Data display (tag)** | default, removable, removable-hover |
| **Data display (status)** | each status variant (active, inactive, pending, error) |
| **Data display (key-value)** | default, truncated-value, empty-value, stacked, inline |
| **Toast** | info, success, warning, error, with-action, auto-dismiss, persistent |
| **Empty state** | first-use, no-results, no-data, error-recovery, permission |
| **Loading skeleton** | text-line, text-block, card, avatar, button, table-row |
| **Error state** | page-level, inline, field-level, offline, timeout |

### Concept Exploration (3 Directions)

All three concepts share: `#ff6b35` accent, `#f7f5f3` surface, `#2c2825` text, Berkeley Mono for data, 8px grid, warm shadows. What differs is the **personality** — how the system feels to use.

---

#### Concept A: "Swiss Workshop"

**Typeface:** Söhne (Klim) + Berkeley Mono
**Visual tone:** Restrained precision. Every element placed with intention. Typography does most of the work — large type sizes, generous leading, mathematical spacing. Color is rare and purposeful.

**What it optimizes for:** Timelessness. This system would still look correct in 10 years.
**What it sacrifices:** Immediate distinctiveness — at a glance, it could be "another well-designed system."
**Principles embodied:** Precision typography, breathing space, decisive color.

```
Surface: #f7f5f3 (warm paper)
Text:    #2c2825 / #78716c / #a8a29e (three-tier hierarchy)
Accent:  #ff6b35 (orange — creation/focus)
Danger:  #dc2626 (red — destruction)

Elevation: Warm shadows only (hsl(30, 20%, 50%) based)
Radius:    Tight — 4px inputs, 8px cards, 999px pills
Motion:    Restrained — 150ms micro, 250ms standard, no dramatic gestures by default
Typography: Display sizes do the heavy lifting. Body is quiet.
```

**Character:** Like a beautifully typeset manual for a precision instrument.

---

#### Concept B: "Warm Analog"

**Typeface:** GT Walsheim + Berkeley Mono
**Visual tone:** Friendlier, rounder, more approachable. Slightly larger radius. Warmer surface tints. The system should feel like something you'd want to touch — soft edges, generous padding, surfaces that feel like they have depth.

**What it optimizes for:** Approachability without sacrificing professionalism. Works well for client-facing products.
**What it sacrifices:** The sharpness of a pure Swiss approach. Slightly less "designer's system," slightly more "user's system."
**Principles embodied:** Warmth over sterility, breathing space, earned animation.

```
Surface: #f7f5f3 primary, #f0ece8 secondary (warmer tint)
Text:    #2c2825 / #78716c / #a8a29e
Accent:  #ff6b35
Danger:  #dc2626

Elevation: Layered warm shadows (multiple shadow values for depth)
Radius:    Medium — 6px inputs, 12px cards, 999px pills
Motion:    Expressive — 150ms micro, 300ms standard, subtle spring easing
Typography: Balanced sizes. Body has presence, not just display.
```

**Character:** Like a well-designed notebook from a stationery company you love.

---

#### Concept C: "Exposed Mechanism"

**Typeface:** Instrument Sans + Berkeley Mono
**Visual tone:** Teenage Engineering aesthetic taken further. Structure is visible — borders over shadows, monospace labels, exposed grid. The system shows how it works. Interactive elements feel like controls on a mixing board.

**What it optimizes for:** Distinctiveness. Unmistakably aiaiai. Strong identity that carries through every project.
**What it sacrifices:** Universal palatability. Some clients might find it too opinionated for Tier 1 branded themes.
**Principles embodied:** Decisive color, precision typography, every element earns its place.

```
Surface: #f7f5f3 primary, #f0ece8 secondary
Text:    #2c2825 / #78716c / #a8a29e
Accent:  #ff6b35
Danger:  #dc2626

Elevation: Borders > shadows. 1px solid #e5e0db. Shadows reserved for modals/overlays only.
Radius:    Sharp — 2px inputs, 4px cards, 999px pills only for pills
Motion:    Functional — 100ms micro, 200ms standard, snappy easing (no spring)
Typography: Mono used liberally. Labels in mono. Data in mono. Sans only for prose.
```

**Character:** Like the interface on a Teenage Engineering OP-1 — playful precision, nothing hidden.

---

### Selected Direction: "Exposed Mechanism on Swiss Canvas" (C + A backdrop)

The interactive layer is Concept C — exposed structure, borders over shadows, mono-labeled, sharp controls. The compositional layer is Concept A — mathematical spacing, generous whitespace, typographic restraint. Teenage Engineering controls on an aged-paper desk.

### Design Foundation (LOCKED)

#### Typography

**Pairing:** Instrument Sans + Berkeley Mono

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| **Display** | Instrument Sans | 600 | Hero headings, brand moments. Rare. |
| **Heading** | Instrument Sans | 500 | Section headings, card titles, page titles |
| **Body** | Instrument Sans | 400 | Prose, descriptions, help text |
| **Label** | Berkeley Mono | 400 | Control labels, nav items, tags, status text |
| **Data** | Berkeley Mono | 400 | Numbers, timestamps, code, metrics, key-value pairs |
| **Caption** | Instrument Sans | 400 | Secondary info, footnotes, metadata |

**Scale (categorical, not linear):**

| Token | Size | Line Height | Letter Spacing | Usage |
|-------|------|-------------|----------------|-------|
| `--type-display` | 36px | 1.1 | -0.02em | Brand moments, hero sections |
| `--type-heading-lg` | 24px | 1.2 | -0.01em | Page titles |
| `--type-heading` | 18px | 1.3 | -0.005em | Section headings, card titles |
| `--type-heading-sm` | 15px | 1.4 | 0 | Subsection headings |
| `--type-body` | 15px | 1.5 | 0 | Default prose |
| `--type-body-sm` | 13px | 1.5 | 0.005em | Secondary prose, help text |
| `--type-label` | 12px | 1.3 | 0.04em | Mono. Control labels, nav, tags. Uppercase optional. |
| `--type-data` | 14px | 1.4 | 0 | Mono. Numbers, times, code, metrics |
| `--type-caption` | 11px | 1.4 | 0.02em | Footnotes, fine print |

**Key rule:** Labels and data are ALWAYS Berkeley Mono. This is the "exposed mechanism" — the interface shows its structure through monospace type. Instrument Sans is the quiet backdrop for prose.

#### Color System (OKLCH-generated, hex fallbacks)

**Palette:**

| Token | Value | OKLCH | Role |
|-------|-------|-------|------|
| `--color-surface` | `#f7f5f3` | `oklch(97% 0.005 60)` | Primary background. Aged paper. |
| `--color-surface-secondary` | `#f0ece8` | `oklch(94% 0.01 60)` | Secondary background. Warmer recessed areas. |
| `--color-surface-tertiary` | `#e8e2dc` | `oklch(91% 0.015 55)` | Tertiary. Deeper nesting, sidebar backgrounds. |
| `--color-border` | `#e0d9d1` | `oklch(88% 0.015 55)` | Default border. Visible structure. |
| `--color-border-strong` | `#c4bbb0` | `oklch(78% 0.02 55)` | Emphasized border. Active controls, focus rings. |
| `--color-text` | `#2c2825` | `oklch(22% 0.015 55)` | Primary text. Never pure black. |
| `--color-text-secondary` | `#78716c` | `oklch(52% 0.01 55)` | Secondary text. Descriptions, metadata. |
| `--color-text-muted` | `#a8a29e` | `oklch(70% 0.008 55)` | Muted text. Placeholders, disabled. |
| `--color-accent` | `#ff6b35` | `oklch(72% 0.19 45)` | Orange. Creation, focus, primary action. |
| `--color-accent-hover` | `#e85a28` | `oklch(65% 0.18 42)` | Accent hover state. |
| `--color-accent-subtle` | `#fff0e8` | `oklch(96% 0.03 55)` | Accent background tint. |
| `--color-destructive` | `#dc2626` | `oklch(55% 0.22 25)` | Red. Destruction, danger, errors. |
| `--color-destructive-hover` | `#b91c1c` | `oklch(48% 0.2 25)` | Destructive hover. |
| `--color-destructive-subtle` | `#fef2f2` | `oklch(97% 0.01 20)` | Destructive background tint. |
| `--color-success` | `#16a34a` | `oklch(62% 0.17 150)` | Green. Confirmation, positive. |
| `--color-success-subtle` | `#f0fdf4` | `oklch(98% 0.02 150)` | Success background tint. |
| `--color-warning` | `#ca8a04` | `oklch(68% 0.15 85)` | Amber. Caution, attention. |
| `--color-warning-subtle` | `#fefce8` | `oklch(98% 0.03 95)` | Warning background tint. |
| `--color-info` | `#2563eb` | `oklch(55% 0.2 260)` | Blue. Information, links. |
| `--color-info-subtle` | `#eff6ff` | `oklch(97% 0.01 260)` | Info background tint. |
| `--color-overlay` | `rgba(44, 40, 37, 0.5)` | — | Modal/drawer backdrop. Warm, not cold. |

**Rules:**
- Text on `--color-surface`: #2c2825 = 11.3:1 contrast (WCAG AAA)
- Text on `--color-accent`: white #fff = 3.2:1 (use `--color-text` on accent-subtle instead for body text)
- Accent-on-surface: #ff6b35 on #f7f5f3 = 3.5:1 (AA for large text / UI controls, not body text)
- Every semantic color has a `-subtle` variant for backgrounds
- No gray — all neutrals have warm undertone (hue ~55 in OKLCH)

#### Spacing Scale

8px base. Named tokens. No exceptions.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Inline icon gaps, tight internal padding |
| `--space-sm` | 8px | Default icon-to-label gap, compact padding |
| `--space-md` | 16px | Standard padding, between related elements |
| `--space-lg` | 24px | Between sections, card padding |
| `--space-xl` | 32px | Major section breaks |
| `--space-2xl` | 48px | Page-level spacing |
| `--space-3xl` | 64px | Hero spacing, page margins on desktop |
| `--space-4xl` | 96px | Maximum breathing room |

**Note:** `--space-xs` (4px) is the one exception to the 8px grid — used only for micro-spacing within tight component internals (icon gaps, badge padding). All layout spacing uses 8px multiples.

#### Grid

| Token | Value | Notes |
|-------|-------|-------|
| `--grid-columns` | 12 | Standard 12-column |
| `--grid-gutter` | 16px (mobile), 24px (desktop) | Uses `--space-md` / `--space-lg` |
| `--grid-margin` | 16px (mobile), 48px (desktop) | Uses `--space-md` / `--space-2xl` |
| `--content-width-narrow` | 640px | Prose, single-column content |
| `--content-width` | 960px | Standard content area |
| `--content-width-wide` | 1200px | Dashboard, multi-column layouts |
| `--content-width-full` | 1440px | Maximum content width |

**Breakpoints:**
| Token | Value | Description |
|-------|-------|-------------|
| `--breakpoint-sm` | 640px | Mobile landscape / large phone |
| `--breakpoint-md` | 768px | Tablet portrait |
| `--breakpoint-lg` | 1024px | Tablet landscape / small desktop |
| `--breakpoint-xl` | 1280px | Desktop |

#### Elevation (Borders > Shadows)

The exposed mechanism aesthetic means structure is visible through borders, not implied through shadows. Shadows are reserved for overlays that float above the page plane.

| Token | Value | Usage |
|-------|-------|-------|
| `--elevation-border` | `1px solid var(--color-border)` | Default structural separation. Cards, inputs, dividers. |
| `--elevation-border-strong` | `1px solid var(--color-border-strong)` | Emphasized. Active state, focus. |
| `--elevation-raised` | `0 1px 3px rgba(44,40,37,0.08), 0 1px 2px rgba(44,40,37,0.06)` | Dropdowns, popovers. Barely there. |
| `--elevation-overlay` | `0 4px 16px rgba(44,40,37,0.12), 0 2px 4px rgba(44,40,37,0.08)` | Modals, command palettes. Clearly floating. |
| `--elevation-none` | `none` | Flat. No separation needed. |

**Key rule:** If it's part of the page structure, use a border. If it floats above the page, use a shadow. Shadows are warm (`rgba(44,40,37,...)` — never cold gray).

#### Radius

Sharp by default. The mechanism is precise.

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 2px | Inputs, small controls, code blocks |
| `--radius-md` | 4px | Cards, containers, buttons |
| `--radius-lg` | 8px | Dialogs, large surfaces |
| `--radius-pill` | 999px | Tags, badges, toggles |
| `--radius-circle` | 50% | Avatars, status dots |

#### Motion

Functional and snappy. No spring physics, no decorative animation. Every transition serves orientation, feedback, or continuity.

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 100ms | Hover states, color changes, opacity toggles |
| `--duration-fast` | 150ms | Micro-interactions: button press, checkbox, toggle |
| `--duration-normal` | 250ms | Standard transitions: panel open, dropdown expand, page element enter |
| `--duration-slow` | 400ms | Larger movements: modal enter, sidebar collapse |
| `--duration-dramatic` | 600ms+ | Product-specific dramatic gestures (not system default) |
| `--easing-default` | `cubic-bezier(0.2, 0, 0, 1)` | Snappy deceleration. Default for all UI motion. |
| `--easing-enter` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering view. Decelerating. |
| `--easing-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving view. Accelerating. |
| `--easing-linear` | `linear` | Progress bars, continuous animations only. |

**Choreography rules:**
- Elements enter from the direction they'll exit to (spatial consistency)
- Stagger delay for lists: 30ms between items, max 150ms total (5 items, then instant)
- Never animate layout properties (width, height, top, left) — transform + opacity only
- Hover states: instant (100ms). Don't make the user wait for feedback.

### Hill Chart (Post-Architecture)

All scopes remain at Hilltop or Downhill. Design foundation is now locked. Ready for Phase 4.

---

## Rabbit Holes — Decisions Already Made

1. **No dark mode in this pass.** The manifesto is built on warm, light surfaces (aged paper). Dark mode is a future concern. The token architecture should SUPPORT it (semantic naming), but we don't design it now.
2. **No component code.** This is a design system, not a component library. The .pen file and CSS tokens are the deliverables. Svelte/React implementations come later.
3. **No icon system design.** We use Phosphor Icons (already decided in CLAUDE.md). The design system references Phosphor but doesn't design custom icons.
4. **8px base grid is non-negotiable.** Don't revisit whether 4px would be better. 8px. Done.
5. **Orange #ff6b35 is the accent.** Both projects converged on this. It comes from the Teenage Engineering influence. Don't explore other accent colors for the aiaiai default theme.

## Out of Scope — Future Work

- Dark mode theme
- Component code implementations (Svelte, React, vanilla JS)
- Animation library (Lottie templates, SVG animations)
- Illustration style guide
- Brand guidelines beyond the design system (logo usage, voice & tone, photography)
- iOS/Android native token compilation (token naming should support it, but no native output now)
- Story Canvas toddler-specific overrides (that's a Tier 2 bespoke theme for later)
