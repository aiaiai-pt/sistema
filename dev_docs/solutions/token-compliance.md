# Token Compliance Guide

## The Rule

Zero raw `px`/`rem` values in site code for: spacing, borders, font-size, border-radius. Token coverage must be 100% for these properties.

## What Has Tokens

| CSS Property | Token Pattern | Examples |
|---|---|---|
| `gap`, `padding`, `margin` | `var(--space-*)` | `--space-2xs` (2px), `--space-xs` (4px), `--space-sm` (8px), `--space-md` (16px), `--space-lg` (24px) |
| `border-width`, `border` shorthand | `var(--border-width)` / `var(--border-width-thick)` | 1px, 2px |
| `font-size` | `var(--type-*-size)` | `--type-caption-size` (11px) through `--type-display-size` (36px) |
| `border-radius` | `var(--radius-*)` | `--radius-sm` (2px), `--radius-md` (4px), `--radius-lg` (8px), `--radius-pill`, `--radius-circle` |
| Accent stripe width | `var(--accent-stripe-width)` | 3px (toast accent, rule-card borders) |
| Focus ring | `var(--focus-ring-width)` / `var(--focus-ring-offset)` | Both resolve to `var(--border-width-thick)` |

## What Is Acceptable as Raw Values

- **Icon/element dimensions**: `width: 6px; height: 6px` for decorative dots, icon sizes
- **Media queries**: `@media (min-width: 768px)` — breakpoints
- **WCAG minimums**: `min-height: 44px` for touch targets
- **Position nudges**: `top: -2px; right: -4px` for badge positioning
- **SVG attributes**: `viewBox`, `stroke-width`
- **Documentation text**: px values rendered as content inside `<code>` tags
- **DON'T demos**: Intentionally off-system values in anti-pattern illustrations
- **Layout constraints**: `min-width: 480px` on demo panels

## `all: unset` and Focus Rings

`all: unset` in Svelte scoped styles has higher specificity than global `:focus-visible`. Every element using `all: unset` MUST have an explicit `:focus-visible` rule in the same `<style>` block:

```css
.my-button {
    all: unset;
    /* ... */
}

.my-button:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-accent);
    outline-offset: var(--focus-ring-offset);
}
```

Do NOT use fallback values like `var(--focus-ring-width, 2px)` — if the token exists, the fallback defeats theming.

## `prefers-reduced-motion` Guards

Every `@keyframes` animation that loops continuously must have a guard:

```css
@media (prefers-reduced-motion: reduce) {
    .animated-element {
        animation: none;
    }
}
```

CSS transitions on hover/active are user-initiated and do not need guards. However, `transform` animations on hover (like `scale(1.05)`) should be disabled:

```css
@media (prefers-reduced-motion: reduce) {
    .button:hover,
    .button:active {
        transform: none;
    }
}
```

## Border Width Categories

Per industry research (Carbon, Atlassian, Polaris, Primer, Tailwind):
- **1px** is a border concern → `var(--border-width)`. Never a spacing token.
- **2px** is dual-purpose: spacing (`var(--space-2xs)`) or border (`var(--border-width-thick)`). Use context to decide:
  - `gap: var(--space-2xs)` — sub-grid spacing
  - `border: var(--border-width-thick) solid` — thick borders
  - `--focus-ring-width: var(--border-width-thick)` — focus rings
