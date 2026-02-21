# Docs Site as Living Proof

**Context:** Design system documentation that describes the system vs. documentation that demonstrates it.

## Pattern

The docs site should BE the proof the system works, not describe that it works.

### Homepage as Specimen

Instead of a directory page ("here are links to Color, Typography, Components..."), the homepage is a **live instrument panel** — a mini-app composition that uses every foundation:

- Metric cards with mono data values and trend indicators
- Interactive controls (input, toggle, buttons) with all states
- Activity table with hover states and timestamps
- Surface hierarchy demonstration (primary, secondary, tertiary, accent)
- Full type scale specimen
- Live clock proving motion/data font rendering

When the theme switcher is toggled, the entire composition transforms — proving the token architecture works without any code changes.

### Every Page Demonstrates Its Topic

- Color page: live swatches rendered with `background: var(--color-*)`, not screenshots
- Typography page: actual text rendered at each scale step, not a table of sizes
- Button page: real interactive buttons in every state, not static mockups
- Theming page: the page itself changes when you switch themes

### Shared Components for Consistency

Extract repeated patterns into shared Svelte components:
- `PageHeader` — title + description (eliminates drift in header styling)
- `Callout` — accent-bordered callout box
- `TokenRef` — token reference block with component name and token list
- `DemoGrid` — responsive grid for state demonstrations
- `StateCard` — labeled card for individual state demos

### Theme Switcher as Primary Feature

The sidebar theme switcher is the most important interactive element. It proves the system's theming architecture works:
- Cookie-persisted selection
- Every page responds immediately
- No code changes needed between themes
