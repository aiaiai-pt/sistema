# aiaiai Design System — Theming Reference

Last updated: 2026-02-20

Guide for creating themes at Tier 1 (Branded) and Tier 2 (Bespoke) levels. Includes token override maps, examples, application method, and verification checklists.

---

## Theming Architecture Overview

| Aspect | Tier 1: Branded | Tier 2: Bespoke |
|--------|----------------|-----------------|
| Purpose | Client dashboards, whitelabel products | Client-facing consumer products with distinct identity |
| Override count | < 20 tokens | 40-80 tokens |
| Identity result | Feels like an aiaiai product with client colors | Does not look like aiaiai |
| Application | `data-theme` attribute | `data-theme` attribute |

### What Each Tier Changes

| Category | Tier 1 | Tier 2 |
|----------|--------|--------|
| Accent color | Yes | Yes |
| Surface tint | Yes (direction only) | Yes (full override) |
| Border colors | Yes | Yes |
| Text colors | Yes | Yes |
| Semantic colors (destructive, success, warning, info) | No | Yes |
| Typography (families) | No | Yes |
| Typography (sizes) | No | Yes |
| Spacing scale | No | No (8px grid is non-negotiable) |
| Grid structure | No | No |
| Elevation style | No | Yes (can switch borders to shadows) |
| Radius scale | No | Yes |
| Motion timing | No | Yes |
| Motion easing | No | Yes |
| Component tokens | No | Yes |
| Token naming convention | No | No |
| Accessibility minimums | No | No |

---

## Tier 1: Branded Theme

### Tokens to Override (14 typical)

| Token | What to Change | Constraint |
|-------|---------------|------------|
| `--color-accent` | Client's brand color | Must have >= 3:1 contrast on `--color-surface` |
| `--color-accent-hover` | Darker shade of accent | Darker than `--color-accent` |
| `--color-accent-subtle` | Light tint of accent | Barely visible tint |
| `--color-surface` | Tint direction (warm/cool) | Must have >= 4.5:1 contrast with `--color-text` |
| `--color-surface-secondary` | Follows surface tint | Distinguishable from `--color-surface` |
| `--color-surface-tertiary` | Follows surface tint | Distinguishable from `--color-surface-secondary` |
| `--color-border` | Follows surface tint | Visible on `--color-surface` |
| `--color-border-strong` | Follows surface tint | Clearly stronger than `--color-border` |
| `--color-text` | Follows surface tint | Never pure black. >= 4.5:1 on `--color-surface`. |
| `--color-text-secondary` | Follows surface tint | |
| `--color-text-muted` | Follows surface tint | |
| `--color-overlay` | Tint matches surface direction | |
| `--focus-ring-color` | `var(--color-accent)` | Must be visible on all surfaces |

### Tokens to NEVER Override in Tier 1

| Category | Tokens | Reason |
|----------|--------|--------|
| Typography | `--font-sans`, `--font-mono`, all `--type-*` | Typography IS the aiaiai identity |
| Spacing | All `--space-*` | 8px grid is non-negotiable |
| Grid | All `--grid-*`, `--content-width-*` | Structural foundation |
| Motion | All `--duration-*`, `--easing-*` | Motion personality stays consistent |
| Radius | All `--radius-*` | Sharp aesthetic is system identity |
| Elevation | All `--elevation-*` | Borders > shadows stays |
| Semantic states | `--color-destructive-*`, `--color-success-*`, `--color-warning-*`, `--color-info-*` | Semantic meaning must be universal |
| Component tokens | All `--button-*`, `--input-*`, etc. | Components inherit from semantic tokens automatically |
| Focus ring | `--focus-ring-width`, `--focus-ring-offset` | Accessibility non-negotiable |

### Tier 1 Example: "Verdant Finance" (Teal Accent, Cool Tint)

```css
[data-theme="verdant-finance"] {
  /* Accent: teal */
  --color-accent: #0d9488;
  --color-accent-hover: #0f766e;
  --color-accent-subtle: #f0fdfa;

  /* Surfaces: cool tint direction */
  --color-surface: #f8faf9;
  --color-surface-secondary: #f0f4f2;
  --color-surface-tertiary: #e4ebe7;

  /* Borders: cooler */
  --color-border: #d4ddd8;
  --color-border-strong: #a8b8b0;

  /* Text: cooled but still warm enough */
  --color-text: #1a2c25;
  --color-text-secondary: #4a6358;
  --color-text-muted: #7a9488;

  /* Overlay: cool-tinted */
  --color-overlay: rgba(26, 44, 37, 0.5);

  /* Focus ring follows accent */
  --focus-ring-color: var(--color-accent);

  /* Total: 14 tokens. Typography, spacing, motion, radius, elevation unchanged. */
}
```

---

## Tier 2: Bespoke Theme

### Full Override Map

Tier 2 themes may override ALL of the following categories. Items marked "FIXED" cannot be changed even in Tier 2.

#### Color (20+ tokens)

| Token | Overridable | Constraint |
|-------|-------------|------------|
| `--color-surface` | Yes | WCAG AA with `--color-text` |
| `--color-surface-secondary` | Yes | Distinguishable from surface |
| `--color-surface-tertiary` | Yes | Distinguishable from secondary |
| `--color-overlay` | Yes | |
| `--color-border` | Yes | |
| `--color-border-strong` | Yes | |
| `--color-text` | Yes | Never pure #000 |
| `--color-text-secondary` | Yes | |
| `--color-text-muted` | Yes | |
| `--color-text-on-accent` | Yes | Must contrast on accent bg |
| `--color-accent` | Yes | >= 3:1 on surface |
| `--color-accent-hover` | Yes | Darker than accent |
| `--color-accent-subtle` | Yes | |
| `--color-destructive` | Yes | Must read as "danger" |
| `--color-destructive-hover` | Yes | |
| `--color-destructive-subtle` | Yes | |
| `--color-success` | Yes | Must read as "positive" |
| `--color-success-subtle` | Yes | |
| `--color-warning` | Yes | Must read as "caution" |
| `--color-warning-subtle` | Yes | |
| `--color-info` | Yes | |
| `--color-info-subtle` | Yes | |

#### Typography (10+ tokens)

| Token | Overridable | Constraint |
|-------|-------------|------------|
| `--font-sans` | Yes | Must be legible at 13px+ |
| `--font-mono` | Yes | Must be fixed-width |
| `--type-display-size` | Yes | |
| `--type-heading-lg-size` | Yes | |
| `--type-heading-size` | Yes | |
| `--type-heading-sm-size` | Yes | |
| `--type-body-size` | Yes | Minimum 13px for readability |
| `--type-body-sm-size` | Yes | Minimum 11px |
| `--type-label-size` | Yes | |
| `--type-label-font` | Yes | Can switch from mono to sans |
| `--type-label-tracking` | Yes | |
| `--type-data-size` | Yes | |

#### Elevation (4 tokens)

| Token | Overridable | Constraint |
|-------|-------------|------------|
| `--elevation-border` | Yes | Can be set to `none` to switch to shadows |
| `--elevation-border-strong` | Yes | |
| `--elevation-raised` | Yes | Warm shadows preferred |
| `--elevation-overlay` | Yes | |

#### Radius (5 tokens)

| Token | Overridable | Constraint |
|-------|-------------|------------|
| `--radius-sm` | Yes | |
| `--radius-md` | Yes | |
| `--radius-lg` | Yes | |
| `--radius-pill` | Yes | Keep 999px for pill shape |
| `--radius-circle` | Yes | Keep 50% for circles |

#### Motion (9 tokens)

| Token | Overridable | Constraint |
|-------|-------------|------------|
| `--duration-instant` | Yes | Keep under 200ms |
| `--duration-fast` | Yes | Keep under 300ms |
| `--duration-normal` | Yes | Keep under 500ms |
| `--duration-slow` | Yes | Keep under 800ms |
| `--duration-dramatic` | Yes | |
| `--easing-default` | Yes | Spring easing allowed in Tier 2 |
| `--easing-enter` | Yes | |
| `--easing-exit` | Yes | |
| `--easing-linear` | Yes | |

#### Component Tokens (10+ tokens)

| Token | Overridable | Constraint |
|-------|-------------|------------|
| `--button-font` | Yes | |
| `--button-tracking` | Yes | |
| `--button-radius` | Yes | |
| `--button-sm-height` | Yes | Min 28px |
| `--button-md-height` | Yes | Min 36px |
| `--button-lg-height` | Yes | Min 44px (touch target) |
| `--input-radius` | Yes | |
| `--card-radius` | Yes | |
| `--card-bordered-border` | Yes | Can be `none` if using shadows |
| `--card-bordered-shadow` | Yes | |

### What Stays FIXED in Tier 2

| Category | Tokens | Reason |
|----------|--------|--------|
| Spacing scale | All `--space-*` | 8px grid is the structural DNA |
| Grid structure | All `--grid-*`, `--content-width-*`, breakpoints | Layout foundation |
| Token naming | `--{category}-{role}` pattern | Tooling and automation depends on this |
| Accessibility | `--focus-ring-width` (2px), `--focus-ring-offset` (2px) | Non-negotiable |
| Contrast ratios | WCAG AA minimums | Non-negotiable |
| Semantic color roles | Accent = primary action, destructive = danger, etc. | Meaning must be preserved |

### Tier 2 Example: "Sprout" (Children's Learning App)

```css
[data-theme="sprout"] {
  /* COLOR — Full palette override */
  --color-surface: #fffdf7;
  --color-surface-secondary: #fef9ec;
  --color-surface-tertiary: #fdf0d5;
  --color-overlay: rgba(60, 40, 10, 0.4);
  --color-border: #f0e4c8;
  --color-border-strong: #dbc89a;
  --color-text: #2d2006;
  --color-text-secondary: #6b5c3e;
  --color-text-muted: #a09070;
  --color-text-on-accent: #ffffff;
  --color-accent: #7c3aed;
  --color-accent-hover: #6d28d9;
  --color-accent-subtle: #f5f3ff;
  --color-destructive: #e11d48;
  --color-destructive-hover: #be123c;
  --color-destructive-subtle: #fff1f2;
  --color-success: #059669;
  --color-success-subtle: #ecfdf5;
  --color-warning: #d97706;
  --color-warning-subtle: #fffbeb;
  --color-info: #2563eb;
  --color-info-subtle: #eff6ff;

  /* TYPOGRAPHY — Different families, larger sizes */
  --font-sans: "Nunito", "Quicksand", sans-serif;
  --font-mono: "Space Mono", ui-monospace, monospace;
  --type-body-size: var(--raw-font-size-18);
  --type-body-sm-size: var(--raw-font-size-15);
  --type-label-size: var(--raw-font-size-13);
  --type-data-size: var(--raw-font-size-15);
  --type-heading-size: var(--raw-font-size-24);
  --type-heading-lg-size: var(--raw-font-size-36);
  --type-label-font: var(--font-sans);
  --type-label-tracking: 0.01em;

  /* ELEVATION — Shadows instead of borders */
  --elevation-border: none;
  --elevation-border-strong: none;
  --elevation-raised: 0 2px 8px rgba(60, 40, 10, 0.1), 0 1px 3px rgba(60, 40, 10, 0.08);
  --elevation-overlay: 0 8px 32px rgba(60, 40, 10, 0.15), 0 4px 8px rgba(60, 40, 10, 0.1);

  /* RADIUS — Rounded, friendly */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  /* MOTION — Bouncier, more playful */
  --duration-instant: 120ms;
  --duration-fast: 200ms;
  --duration-normal: 350ms;
  --duration-slow: 500ms;
  --easing-default: cubic-bezier(0.34, 1.56, 0.64, 1);
  --easing-enter: cubic-bezier(0.22, 1.2, 0.36, 1);

  /* COMPONENTS — Adjusted for personality */
  --button-font: var(--font-sans);
  --button-tracking: 0;
  --button-radius: var(--radius-md);
  --button-sm-height: 32px;
  --button-md-height: 44px;
  --button-lg-height: 52px;
  --input-radius: var(--radius-sm);
  --card-bordered-border: none;
  --card-bordered-shadow: var(--elevation-raised);
  --card-radius: var(--radius-md);

  /* Total: ~54 tokens. Spacing, grid, accessibility unchanged. */
}
```

---

## How to Apply a Theme

### Method: `data-theme` Attribute

```html
<html data-theme="verdant-finance">
```

### Server-Side (prevent FOUC)

For SvelteKit projects, use `hooks.server.ts` with `transformPageChunk`:

```typescript
// src/hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
  const theme = event.cookies.get('theme') || 'aiaiai';
  return resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace('<html', `<html data-theme="${theme}"`)
  });
};
```

### Client-Side Switching

```javascript
document.documentElement.setAttribute('data-theme', 'verdant-finance');
```

### CSS Loading

```css
/* Always load base + semantic + components */
@import 'aiaiai-design-system/tokens/base.css';
@import 'aiaiai-design-system/tokens/semantic.css';
@import 'aiaiai-design-system/tokens/components.css';

/* Load theme overrides (only tokens that change) */
@import 'aiaiai-design-system/tokens/themes/branded-example.css';
```

---

## Theme Verification Checklist

Run this checklist after creating any new theme.

### Tier 1 Verification

- [ ] Total overrides < 20 tokens
- [ ] Typography unchanged (Instrument Sans + Berkeley Mono)
- [ ] Spacing scale unchanged (8px grid)
- [ ] Motion timing and easing unchanged
- [ ] Radius scale unchanged
- [ ] Elevation style unchanged (borders > shadows)
- [ ] Semantic state colors unchanged (destructive, success, warning, info)
- [ ] `--color-text` on `--color-surface` >= 4.5:1 contrast
- [ ] `--color-text-secondary` on `--color-surface` >= 4.5:1 contrast
- [ ] `--color-accent` on `--color-surface` >= 3:1 contrast
- [ ] Focus ring visible on all surfaces
- [ ] Overlay is warm-tinted, not cold gray
- [ ] No pure black (#000) or pure white (#fff) in overrides
- [ ] All components render correctly without additional changes

### Tier 2 Verification

- [ ] Spacing scale unchanged (8px grid): `--space-xs` through `--space-4xl`
- [ ] Grid structure unchanged: columns, gutters, content widths
- [ ] Token naming convention followed
- [ ] `--color-text` on `--color-surface` >= 4.5:1 contrast
- [ ] `--color-text-secondary` on `--color-surface` >= 4.5:1 for body text
- [ ] `--color-accent` on `--color-surface` >= 3:1 contrast
- [ ] `--color-text-on-accent` on `--color-accent` >= 3:1 contrast
- [ ] `--color-destructive` reads as "danger" (red family preferred)
- [ ] `--color-success` reads as "positive" (green family preferred)
- [ ] `--color-warning` reads as "caution" (amber/yellow family preferred)
- [ ] Focus ring width 2px, offset 2px (unchanged)
- [ ] Touch targets >= 44px on mobile (`--button-lg-height`)
- [ ] All font sizes >= 11px
- [ ] Body text font size >= 13px
- [ ] Mono font (if overridden) is actually fixed-width
- [ ] All 6 core components render correctly with the theme
- [ ] Skeleton loading shimmer is visible against skeleton background
- [ ] Toast is visible (not lost against background)
- [ ] Button text is legible on all button variant backgrounds
