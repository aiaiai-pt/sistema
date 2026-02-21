# aiaiai Design System

## What This Is

The canonical design system for aiaiai studio (aiaiai.pt). All studio projects (Still Phone, Ontograph, Story Canvas, client work) inherit from this system.

## Project Structure

```
aiaiai-design-system/
├── tokens/                  # CSS custom properties (the source of truth)
│   ├── base.css             # Primitive values (raw colors, sizes, weights)
│   ├── semantic.css         # Semantic aliases (surface, text, accent roles)
│   ├── components.css       # Component-scoped tokens
│   └── themes/
│       ├── aiaiai.css       # Default studio theme
│       ├── branded-example.css   # Tier 1 override example
│       └── bespoke-example.css   # Tier 2 override example
├── reference/               # Agent-readable structured docs (for AI design agents)
│   ├── tokens.md            # Complete token table with roles and override tiers
│   ├── principles.md        # Design principles as checkable criteria
│   ├── components.md        # Component specs (variants, states, do/don't)
│   ├── theming.md           # Theme creation guide
│   ├── typography.md        # Type scale, pairing, measure/leading
│   ├── color.md             # Palette, roles, contrast ratios
│   └── motion.md            # Duration/easing table, choreography
├── site/                    # Visual docs site (SvelteKit → Cloudflare Pages)
├── dev_docs/                # Internal specs, solutions, ADLs
│   ├── specs/               # Design specs
│   └── solutions/           # Reusable pattern docs
├── *.pen                    # Pencil design files
└── CLAUDE.md                # This file
```

## How This System Gets Used

### By human designers
Browse `site/` (deployed to design.aiaiai.pt) — visual reference with live components, theme switcher, rendered foundations.

### By AI design agents
`Read` files from `reference/` during DFG workflows. These are structured, unambiguous markdown optimized for LLM consumption. When an agent runs `/dfg` or `/design-research` on any aiaiai project, it reads these files to ground decisions in the system.

### By developers
Import `tokens/*.css` into their project. Read `dev_docs/solutions/` for integration guides.

### By the Pencil MCP
Open the `.pen` file to access the component library and visual reference during design work.

## Design Philosophy

Derived from the Still Phone manifesto:
1. **Warmth over sterility** — Earth tones, aged paper, warm shadows
2. **Decisive color** — Color carries meaning, never decoration
3. **Breathing space** — Whitespace creates rhythm and calm
4. **Earned animation** — Motion serves function (orientation, feedback, continuity)
5. **Precision typography** — Mono for data, sans for interface, display for brand

## Token Architecture

Three-tier token structure:
- **Primitive** (`--raw-*`): Raw values with no semantic meaning
- **Semantic** (`--*`): Role-based aliases that themes override
- **Component** (`--component-*`): Scoped to specific components

## Theming

Two tiers:
- **Tier 1 (Branded):** Override < 20 semantic tokens (accent, surface tint). Typography, spacing, motion stay.
- **Tier 2 (Bespoke):** Override 40-80 tokens (full personality shift). Only grid and token naming convention stay.

## Consuming This System

Projects import the token files:
```css
@import 'aiaiai-design-system/tokens/semantic.css';
@import 'aiaiai-design-system/tokens/themes/aiaiai.css';
```

Or for Tailwind projects, reference the tokens in `@theme` configuration.

## Key Decisions

- 8px base grid, non-negotiable
- Phosphor Icons, no custom icons
- Orange `#ff6b35` is the studio accent
- No dark mode yet (architecture supports it via semantic naming)
- Warm shadows only (never cold gray)
- Never pure black text, never clinical white backgrounds
- `#faf9f7` on `#ff6b35` (2.69:1) is a documented WCAG exception — see `reference/color.md`
- `all: unset` buttons MUST have explicit `:focus-visible` in the same Svelte `<style>` block — global rules can't cascade through scoped `all: unset`
- Every looping CSS animation needs a `prefers-reduced-motion: reduce` guard
- Zero raw px/rem in spacing, borders, font-size, border-radius — see `dev_docs/solutions/token-compliance.md`
- 1px is a border concern (`--border-width`), not a spacing token. 2px is both (`--space-2xs` or `--border-width-thick` depending on context)
