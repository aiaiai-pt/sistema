# aiaiai Design System — Token Reference

Last updated: 2026-02-20

This is the canonical token table for the aiaiai design system. All tokens from `base.css`, `semantic.css`, and `components.css` are listed. Agents should reference this file when making any design or implementation decision involving token values.

## Token Architecture

| Layer | Prefix | Purpose | Used By |
|-------|--------|---------|---------|
| Primitive | `--raw-*` | Raw values, no semantic meaning | Semantic tokens only. NEVER use directly in components. |
| Semantic | `--color-*`, `--type-*`, `--space-*`, etc. | Role-based aliases. Themes override these. | Components and layouts. This is what you reference. |
| Component | `--button-*`, `--input-*`, `--card-*`, etc. | Scoped to specific components | Component implementations only. |

---

## Primitive Tokens (base.css)

### Color: Neutrals (warm undertone, hue ~55 OKLCH)

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-color-white` | `#faf9f7` | Warm white. NOT pure #fff. |
| `--raw-color-neutral-50` | `#f7f5f3` | |
| `--raw-color-neutral-100` | `#f0ece8` | |
| `--raw-color-neutral-200` | `#e8e2dc` | |
| `--raw-color-neutral-300` | `#e0d9d1` | |
| `--raw-color-neutral-400` | `#c4bbb0` | |
| `--raw-color-neutral-500` | `#a8a29e` | |
| `--raw-color-neutral-600` | `#78716c` | |
| `--raw-color-neutral-700` | `#57534e` | |
| `--raw-color-neutral-800` | `#3d3835` | |
| `--raw-color-neutral-900` | `#2c2825` | |
| `--raw-color-neutral-950` | `#1c1917` | |

### Color: Orange (accent — creation, focus)

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-color-orange-50` | `#fff7ed` | |
| `--raw-color-orange-100` | `#fff0e8` | |
| `--raw-color-orange-200` | `#fed7aa` | |
| `--raw-color-orange-300` | `#fdba74` | |
| `--raw-color-orange-400` | `#fb923c` | |
| `--raw-color-orange-500` | `#ff6b35` | Studio accent. Non-negotiable in default theme. |
| `--raw-color-orange-600` | `#e85a28` | |
| `--raw-color-orange-700` | `#c2410c` | |
| `--raw-color-orange-800` | `#9a3412` | |
| `--raw-color-orange-900` | `#7c2d12` | |

### Color: Red (destructive — danger, errors)

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-color-red-50` | `#fef2f2` | |
| `--raw-color-red-100` | `#fee2e2` | |
| `--raw-color-red-200` | `#fecaca` | |
| `--raw-color-red-300` | `#fca5a5` | |
| `--raw-color-red-400` | `#f87171` | |
| `--raw-color-red-500` | `#ef4444` | |
| `--raw-color-red-600` | `#dc2626` | Default destructive. |
| `--raw-color-red-700` | `#b91c1c` | |
| `--raw-color-red-800` | `#991b1b` | |
| `--raw-color-red-900` | `#7f1d1d` | |

### Color: Green (success — confirmation, positive)

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-color-green-50` | `#f0fdf4` | |
| `--raw-color-green-100` | `#dcfce7` | |
| `--raw-color-green-200` | `#bbf7d0` | |
| `--raw-color-green-300` | `#86efac` | |
| `--raw-color-green-400` | `#4ade80` | |
| `--raw-color-green-500` | `#22c55e` | |
| `--raw-color-green-600` | `#16a34a` | Default success. |
| `--raw-color-green-700` | `#15803d` | |
| `--raw-color-green-800` | `#166534` | |
| `--raw-color-green-900` | `#14532d` | |

### Color: Amber (warning — caution, attention)

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-color-amber-50` | `#fffbeb` | |
| `--raw-color-amber-100` | `#fef3c7` | |
| `--raw-color-amber-200` | `#fde68a` | |
| `--raw-color-amber-300` | `#fcd34d` | |
| `--raw-color-amber-400` | `#fbbf24` | |
| `--raw-color-amber-500` | `#f59e0b` | |
| `--raw-color-amber-600` | `#ca8a04` | Default warning. |
| `--raw-color-amber-700` | `#a16207` | |
| `--raw-color-amber-800` | `#854d0e` | |
| `--raw-color-amber-900` | `#713f12` | |

### Color: Blue (info — information, links)

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-color-blue-50` | `#eff6ff` | |
| `--raw-color-blue-100` | `#dbeafe` | |
| `--raw-color-blue-200` | `#bfdbfe` | |
| `--raw-color-blue-300` | `#93c5fd` | |
| `--raw-color-blue-400` | `#60a5fa` | |
| `--raw-color-blue-500` | `#3b82f6` | |
| `--raw-color-blue-600` | `#2563eb` | Default info. |
| `--raw-color-blue-700` | `#1d4ed8` | |
| `--raw-color-blue-800` | `#1e40af` | |
| `--raw-color-blue-900` | `#1e3a8a` | |

### Typography: Font Families

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-font-sans` | `"Instrument Sans", sans-serif` | |
| `--raw-font-mono` | `"Berkeley Mono", "JetBrains Mono", ui-monospace, monospace` | Berkeley Mono is primary. Fallbacks for licensing. |

### Typography: Font Sizes

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-font-size-11` | `0.6875rem` (11px) | |
| `--raw-font-size-12` | `0.75rem` (12px) | |
| `--raw-font-size-13` | `0.8125rem` (13px) | |
| `--raw-font-size-14` | `0.875rem` (14px) | |
| `--raw-font-size-15` | `0.9375rem` (15px) | |
| `--raw-font-size-18` | `1.125rem` (18px) | |
| `--raw-font-size-24` | `1.5rem` (24px) | |
| `--raw-font-size-36` | `2.25rem` (36px) | |

### Typography: Font Weights

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-font-weight-regular` | `400` | |
| `--raw-font-weight-medium` | `500` | |
| `--raw-font-weight-semibold` | `600` | |

### Typography: Line Heights

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-line-height-tight` | `1.1` | |
| `--raw-line-height-snug` | `1.2` | |
| `--raw-line-height-heading` | `1.3` | |
| `--raw-line-height-relaxed` | `1.4` | |
| `--raw-line-height-body` | `1.5` | |

### Typography: Letter Spacing

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-tracking-tight` | `-0.02em` | |
| `--raw-tracking-snug` | `-0.01em` | |
| `--raw-tracking-normal` | `0` | |
| `--raw-tracking-wide` | `0.02em` | |
| `--raw-tracking-wider` | `0.04em` | |
| `--raw-tracking-micro` | `0.005em` | |

### Spacing

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-space-2` | `0.125rem` (2px) | Sub-grid spacing. Badge/tag vertical padding, focus ring dimensions. |
| `--raw-space-4` | `0.25rem` (4px) | Micro-spacing only. Exception to 8px grid. |
| `--raw-space-8` | `0.5rem` (8px) | |
| `--raw-space-16` | `1rem` (16px) | |
| `--raw-space-24` | `1.5rem` (24px) | |
| `--raw-space-32` | `2rem` (32px) | |
| `--raw-space-48` | `3rem` (48px) | |
| `--raw-space-64` | `4rem` (64px) | |
| `--raw-space-96` | `6rem` (96px) | |

### Border Width

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-border-width-1` | `1px` | Default structural border width. |
| `--raw-border-width-2` | `2px` | Focus rings, emphasis borders. |

### Radius

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-radius-2` | `2px` | |
| `--raw-radius-4` | `4px` | |
| `--raw-radius-8` | `8px` | |
| `--raw-radius-999` | `999px` | Pill shape. |
| `--raw-radius-circle` | `50%` | |

### Shadows (warm tint: rgba(44, 40, 37, ...))

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-shadow-sm` | `0 1px 3px rgba(44,40,37,0.08), 0 1px 2px rgba(44,40,37,0.06)` | Never cold gray. |
| `--raw-shadow-md` | `0 4px 16px rgba(44,40,37,0.12), 0 2px 4px rgba(44,40,37,0.08)` | Never cold gray. |

### Motion: Durations

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-duration-100` | `100ms` | |
| `--raw-duration-150` | `150ms` | |
| `--raw-duration-250` | `250ms` | |
| `--raw-duration-400` | `400ms` | |
| `--raw-duration-600` | `600ms` | |

### Motion: Easings

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-easing-default` | `cubic-bezier(0.2, 0, 0, 1)` | Snappy deceleration. |
| `--raw-easing-enter` | `cubic-bezier(0, 0, 0.2, 1)` | Decelerating enter. |
| `--raw-easing-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Accelerating exit. |
| `--raw-easing-linear` | `linear` | Progress bars only. |

### Grid

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-grid-columns` | `12` | |
| `--raw-content-640` | `640px` | |
| `--raw-content-960` | `960px` | |
| `--raw-content-1200` | `1200px` | |
| `--raw-content-1440` | `1440px` | |

### Breakpoints

| Token | Value | Constraints |
|-------|-------|-------------|
| `--raw-breakpoint-sm` | `640px` | Use in `@media` queries. |
| `--raw-breakpoint-md` | `768px` | |
| `--raw-breakpoint-lg` | `1024px` | |
| `--raw-breakpoint-xl` | `1280px` | |

---

## Semantic Tokens (semantic.css)

### Color: Surfaces

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--color-surface` | `#f7f5f3` | Primary background | Yes (tint direction) | Yes (full override) | Must have WCAG AA contrast (4.5:1) with `--color-text` |
| `--color-surface-secondary` | `#f0ece8` | Secondary/recessed background | Yes (tint direction) | Yes | Must be distinguishable from `--color-surface` |
| `--color-surface-tertiary` | `#e8e2dc` | Tertiary/deeply nested | Yes (tint direction) | Yes | Must be distinguishable from `--color-surface-secondary` |
| `--color-overlay` | `rgba(44,40,37,0.5)` | Modal/drawer backdrop | Yes (tint) | Yes | Must be warm-tinted, never cold gray |

### Color: Borders

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--color-border` | `#e0d9d1` | Default structural border | Yes | Yes | Visible on `--color-surface` |
| `--color-border-strong` | `#c4bbb0` | Emphasized border | Yes | Yes | Clearly stronger than `--color-border` |

### Color: Text

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--color-text` | `#2c2825` | Primary text | Yes | Yes | Never pure black (#000). WCAG AA on `--color-surface`. Default: 11.3:1. |
| `--color-text-secondary` | `#78716c` | Descriptions, metadata | Yes | Yes | WCAG AA on `--color-surface` for body text |
| `--color-text-muted` | `#a8a29e` | Placeholders, disabled text | Yes | Yes | Not required to meet AA for body (decorative/non-essential) |
| `--color-text-on-accent` | `#faf9f7` | Text on accent backgrounds | No | Yes | Must meet 3:1 contrast on `--color-accent` for UI controls |

### Color: Accent

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--color-accent` | `#ff6b35` | Creation, focus, primary action | Yes | Yes | Must meet 3:1 contrast on `--color-surface` for UI components |
| `--color-accent-hover` | `#e85a28` | Accent hover state | Yes | Yes | Darker than `--color-accent` |
| `--color-accent-subtle` | `#fff0e8` | Accent background tint | Yes | Yes | Barely visible tint of accent |

### Color: Semantic States

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--color-destructive` | `#dc2626` | Danger, errors, deletion | No | Yes | Must read as "danger". WCAG AA on `--color-surface`. |
| `--color-destructive-hover` | `#b91c1c` | Destructive hover | No | Yes | Darker than `--color-destructive` |
| `--color-destructive-subtle` | `#fef2f2` | Destructive background tint | No | Yes | Barely visible red tint |
| `--color-success` | `#16a34a` | Confirmation, positive | No | Yes | Must read as "positive". WCAG AA on `--color-surface`. |
| `--color-success-subtle` | `#f0fdf4` | Success background tint | No | Yes | |
| `--color-warning` | `#ca8a04` | Caution, attention | No | Yes | Must read as "warning". |
| `--color-warning-subtle` | `#fffbeb` | Warning background tint | No | Yes | |
| `--color-info` | `#2563eb` | Information, links | No | Yes | WCAG AA on `--color-surface`. |
| `--color-info-subtle` | `#eff6ff` | Info background tint | No | Yes | |

### Typography: Font Families

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--font-sans` | `"Instrument Sans", sans-serif` | Interface, prose, headings | No | Yes | |
| `--font-mono` | `"Berkeley Mono", "JetBrains Mono", ui-monospace, monospace` | Labels, data, code | No | Yes | |

### Typography: Type Scale

| Token | Properties | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|------------|------|--------------------|--------------------|-------------|
| `--type-display-*` | size: 36px, weight: 600, leading: 1.1, tracking: -0.02em, font: sans | Brand moments, hero sections | No | Yes (size) | Instrument Sans. Rare usage. |
| `--type-heading-lg-*` | size: 24px, weight: 500, leading: 1.2, tracking: -0.01em, font: sans | Page titles | No | Yes (size) | |
| `--type-heading-*` | size: 18px, weight: 500, leading: 1.3, tracking: -0.005em, font: sans | Section headings, card titles | No | Yes (size) | |
| `--type-heading-sm-*` | size: 15px, weight: 500, leading: 1.4, tracking: 0, font: sans | Subsection headings | No | Yes (size) | |
| `--type-body-*` | size: 15px, weight: 400, leading: 1.5, tracking: 0, font: sans | Default prose | No | Yes (size) | |
| `--type-body-sm-*` | size: 13px, weight: 400, leading: 1.5, tracking: 0.005em, font: sans | Secondary prose, help text | No | Yes (size) | |
| `--type-label-*` | size: 12px, weight: 400, leading: 1.3, tracking: 0.04em, font: mono | Control labels, nav, tags | No | Yes (size, font) | ALWAYS Berkeley Mono in default theme. |
| `--type-data-*` | size: 14px, weight: 400, leading: 1.4, tracking: 0, font: mono | Numbers, times, code, metrics | No | Yes (size) | ALWAYS Berkeley Mono in default theme. |
| `--type-caption-*` | size: 11px, weight: 400, leading: 1.4, tracking: 0.02em, font: sans | Footnotes, fine print | No | Yes (size) | Smallest text in the system. |

### Spacing

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--space-2xs` | `2px` (0.125rem) | Sub-grid: badge/tag vertical padding, focus ring dimensions | No | No | Smallest spacing token. |
| `--space-xs` | `4px` (0.25rem) | Micro-spacing: icon gaps, tight padding | No | No | Only exception to 8px grid. |
| `--space-sm` | `8px` (0.5rem) | Compact padding, icon-to-label gap | No | No | |
| `--space-md` | `16px` (1rem) | Standard padding, between related elements | No | No | |
| `--space-lg` | `24px` (1.5rem) | Between sections, card padding | No | No | |
| `--space-xl` | `32px` (2rem) | Major section breaks | No | No | |
| `--space-2xl` | `48px` (3rem) | Page-level spacing | No | No | |
| `--space-3xl` | `64px` (4rem) | Hero spacing, desktop page margins | No | No | |
| `--space-4xl` | `96px` (6rem) | Maximum breathing room | No | No | |

### Border Width

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--border-width` | `1px` | Default border width for structural borders | No | No | Used by `--elevation-border`. |
| `--border-width-thick` | `2px` | Focus rings, emphasis borders | No | No | Used by `--focus-ring-width`, `--focus-ring-offset`. |

### Grid

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--grid-columns` | `12` | Column count | No | No | |
| `--grid-gutter` | `16px` (mobile) / `24px` (desktop >= 1024px) | Column gaps | No | No | Responsive override at `--raw-breakpoint-lg` |
| `--grid-margin` | `16px` (mobile) / `48px` (desktop >= 1024px) | Page margins | No | No | Responsive override at `--raw-breakpoint-lg` |
| `--content-width-narrow` | `640px` | Prose, single-column | No | No | |
| `--content-width` | `960px` | Standard content | No | No | |
| `--content-width-wide` | `1200px` | Dashboard, multi-column | No | No | |
| `--content-width-full` | `1440px` | Maximum content width | No | No | |
| `--content-padding-x` | `16px` / `24px` (≥768) / `32px` (≥1024) | Content horizontal padding | No | No | Responsive: 3 breakpoints |
| `--content-padding-y` | `24px` / `32px` (≥768) / `48px` (≥1024) | Content vertical padding | No | No | Responsive: 3 breakpoints |

### Elevation

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--elevation-border` | `var(--border-width) solid #e0d9d1` | Default structural border | No | Yes | Borders > shadows for structure. Uses `--border-width`. |
| `--elevation-border-strong` | `var(--border-width) solid #c4bbb0` | Emphasized border | No | Yes | Uses `--border-width`. |
| `--elevation-raised` | `0 1px 3px rgba(44,40,37,0.08), 0 1px 2px rgba(44,40,37,0.06)` | Dropdowns, popovers | No | Yes | Warm shadows only. |
| `--elevation-overlay` | `0 4px 16px rgba(44,40,37,0.12), 0 2px 4px rgba(44,40,37,0.08)` | Modals, command palette | No | Yes | Warm shadows only. |

### Radius

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--radius-sm` | `2px` | Inputs, small controls, code blocks | No | Yes | |
| `--radius-md` | `4px` | Cards, containers, buttons | No | Yes | |
| `--radius-lg` | `8px` | Dialogs, large surfaces | No | Yes | |
| `--radius-pill` | `999px` | Tags, badges, toggles | No | Yes | |
| `--radius-circle` | `50%` | Avatars, status dots | No | Yes | |

### Motion: Durations

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--duration-instant` | `100ms` | Hover states, color changes | No | Yes | |
| `--duration-fast` | `150ms` | Micro-interactions: button press, toggle | No | Yes | |
| `--duration-normal` | `250ms` | Standard transitions: panel, dropdown | No | Yes | |
| `--duration-slow` | `400ms` | Larger movements: modal enter, sidebar | No | Yes | |
| `--duration-dramatic` | `600ms` | Product-specific dramatic gestures | No | Yes | Not a system default. |

### Motion: Easings

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--easing-default` | `cubic-bezier(0.2, 0, 0, 1)` | All UI motion | No | Yes | |
| `--easing-enter` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering view | No | Yes | |
| `--easing-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving view | No | Yes | |
| `--easing-linear` | `linear` | Progress bars, continuous | No | Yes | |

---

## Component Tokens (components.css)

### Button

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--button-font` | `var(--type-label-font)` = Berkeley Mono | Button text font | No | Yes | Mono in default theme. |
| `--button-tracking` | `var(--type-label-tracking)` = 0.04em | Letter spacing | No | Yes | |
| `--button-radius` | `var(--radius-md)` = 4px | Corner radius | No | Yes | |
| `--button-transition` | `100ms cubic-bezier(0.2,0,0,1)` | Hover/active transition | No | Yes | |
| `--button-sm-height` | `28px` | Small button height | No | Yes | Min touch target on mobile: 44px. Use md/lg on touch. |
| `--button-sm-padding-x` | `8px` | Small horizontal padding | No | Yes | |
| `--button-sm-font-size` | `11px` (0.6875rem) | Small font size | No | Yes | |
| `--button-md-height` | `36px` | Medium button height | No | Yes | |
| `--button-md-padding-x` | `16px` | Medium horizontal padding | No | Yes | |
| `--button-md-font-size` | `12px` (0.75rem) | Medium font size | No | Yes | |
| `--button-lg-height` | `44px` | Large button height | No | Yes | Meets 44px touch target. |
| `--button-lg-padding-x` | `24px` | Large horizontal padding | No | Yes | |
| `--button-lg-font-size` | `13px` (0.8125rem) | Large font size | No | Yes | |
| `--button-primary-bg` | `#ff6b35` | Primary background | Follows `--color-accent` | Follows `--color-accent` | |
| `--button-primary-bg-hover` | `#e85a28` | Primary hover bg | Follows `--color-accent-hover` | Follows `--color-accent-hover` | |
| `--button-primary-text` | `#faf9f7` | Primary text | No | Yes | Must contrast on accent bg. |
| `--button-primary-border` | `none` | Primary border | No | Yes | |
| `--button-secondary-bg` | `transparent` | Secondary background | No | Yes | |
| `--button-secondary-bg-hover` | `#f0ece8` | Secondary hover bg | Follows `--color-surface-secondary` | Yes | |
| `--button-secondary-text` | `#2c2825` | Secondary text | Follows `--color-text` | Yes | |
| `--button-secondary-border` | `1px solid #e0d9d1` | Secondary border | No | Yes | |
| `--button-ghost-bg` | `transparent` | Ghost background | No | Yes | |
| `--button-ghost-bg-hover` | `#f0ece8` | Ghost hover bg | Follows `--color-surface-secondary` | Yes | |
| `--button-ghost-text` | `#78716c` | Ghost text | Follows `--color-text-secondary` | Yes | |
| `--button-ghost-border` | `none` | Ghost border | No | Yes | |
| `--button-destructive-bg` | `#dc2626` | Destructive background | No | Yes | |
| `--button-destructive-bg-hover` | `#b91c1c` | Destructive hover bg | No | Yes | |
| `--button-destructive-text` | `#faf9f7` | Destructive text | No | Yes | Must contrast on destructive bg. |
| `--button-destructive-border` | `none` | Destructive border | No | Yes | |

### Input

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--input-font` | `var(--type-data-font)` = Berkeley Mono | Input text font | No | Yes | Mono for data entry. |
| `--input-font-size` | `14px` (0.875rem) | Input text size | No | Yes | |
| `--input-radius` | `var(--radius-sm)` = 2px | Corner radius | No | Yes | |
| `--input-border` | `1px solid #e0d9d1` | Default border | No | Yes | |
| `--input-border-focus` | `1px solid #c4bbb0` | Focus border | No | Yes | |
| `--input-bg` | `#f7f5f3` | Background | Follows `--color-surface` | Yes | |
| `--input-text` | `#2c2825` | Input text color | Follows `--color-text` | Yes | |
| `--input-placeholder` | `#a8a29e` | Placeholder color | Follows `--color-text-muted` | Yes | |
| `--input-transition` | `100ms cubic-bezier(0.2,0,0,1)` | State transition | No | Yes | |
| `--input-sm-height` | `28px` | Small height | No | Yes | |
| `--input-sm-padding-x` | `8px` | Small padding | No | Yes | |
| `--input-md-height` | `36px` | Medium height | No | Yes | |
| `--input-md-padding-x` | `8px` | Medium padding | No | Yes | |
| `--input-lg-height` | `44px` | Large height | No | Yes | |
| `--input-lg-padding-x` | `16px` | Large padding | No | Yes | |
| `--input-label-font` | Berkeley Mono | Label font | No | Yes | ALWAYS mono. |
| `--input-label-size` | `12px` | Label size | No | Yes | |
| `--input-label-tracking` | `0.04em` | Label tracking | No | Yes | |
| `--input-label-color` | `#78716c` | Label color | Follows `--color-text-secondary` | Yes | |
| `--input-label-gap` | `4px` | Space below label | No | No | |
| `--input-help-font` | Instrument Sans | Help text font | No | Yes | |
| `--input-help-size` | `13px` | Help text size | No | Yes | |
| `--input-help-color` | `#a8a29e` | Help text color | Follows `--color-text-muted` | Yes | |
| `--input-help-gap` | `4px` | Space above help text | No | No | |
| `--input-error-border-color` | `#dc2626` | Error border | No | Yes | |
| `--input-error-text` | `#dc2626` | Error message color | No | Yes | |

### Input: Toggle

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--toggle-width` | `36px` | Track width | No | Yes | |
| `--toggle-height` | `20px` | Track height | No | Yes | |
| `--toggle-radius` | `999px` | Track radius (pill) | No | Yes | |
| `--toggle-bg-off` | `#e8e2dc` | Off background | Follows `--color-surface-tertiary` | Yes | |
| `--toggle-bg-on` | `#ff6b35` | On background | Follows `--color-accent` | Follows `--color-accent` | |
| `--toggle-knob-size` | `16px` | Knob diameter | No | Yes | |
| `--toggle-knob-color` | `#f7f5f3` | Knob color | Follows `--color-surface` | Yes | |

### Input: Checkbox

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--checkbox-size` | `16px` | Box size | No | Yes | |
| `--checkbox-radius` | `2px` | Corner radius | No | Yes | |
| `--checkbox-border` | `1px solid #c4bbb0` | Border | No | Yes | |
| `--checkbox-bg-checked` | `#ff6b35` | Checked background | Follows `--color-accent` | Follows `--color-accent` | |
| `--checkbox-check-color` | `#faf9f7` | Checkmark color | No | Yes | Must contrast on checked bg. |

### Card

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--card-radius` | `4px` | Corner radius | No | Yes | |
| `--card-padding` | `24px` | Internal padding | No | Yes | |
| `--card-bg` | `#f7f5f3` | Background | Follows `--color-surface` | Yes | |
| `--card-transition` | `100ms cubic-bezier(0.2,0,0,1)` | State transition | No | Yes | |
| `--card-flat-border` | `none` | Flat variant border | No | Yes | |
| `--card-flat-shadow` | `none` | Flat variant shadow | No | Yes | |
| `--card-bordered-border` | `1px solid #e0d9d1` | Bordered variant border | No | Yes | Default variant. "Exposed mechanism." |
| `--card-bordered-shadow` | `none` | Bordered variant shadow | No | Yes | |
| `--card-elevated-border` | `none` | Elevated variant border | No | Yes | |
| `--card-elevated-shadow` | `var(--elevation-raised)` | Elevated variant shadow | No | Yes | |
| `--card-interactive-hover-border` | `1px solid #c4bbb0` | Interactive hover | No | Yes | |
| `--card-interactive-active-bg` | `#f0ece8` | Interactive pressed bg | Follows `--color-surface-secondary` | Yes | |
| `--card-selected-border-color` | `#ff6b35` | Selected state border | Follows `--color-accent` | Follows `--color-accent` | |

### Navigation: Sidebar

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--nav-sidebar-width` | `240px` | Expanded width | No | Yes | |
| `--nav-sidebar-width-collapsed` | `48px` | Collapsed width | No | Yes | |
| `--nav-sidebar-bg` | `#f0ece8` | Background | Follows `--color-surface-secondary` | Yes | |
| `--nav-sidebar-border` | `1px solid #e0d9d1` | Right border | No | Yes | |
| `--nav-sidebar-padding` | `8px` | Internal padding | No | Yes | |
| `--nav-item-height` | `32px` | Item height | No | Yes | |
| `--nav-item-padding-x` | `8px` | Item horizontal padding | No | Yes | |
| `--nav-item-radius` | `2px` | Item corner radius | No | Yes | |
| `--nav-item-font` | Berkeley Mono | Item font | No | Yes | Mono labels. |
| `--nav-item-font-size` | `12px` | Item font size | No | Yes | |
| `--nav-item-tracking` | `0.04em` | Item letter spacing | No | Yes | |
| `--nav-item-color` | `#78716c` | Item default color | Follows `--color-text-secondary` | Yes | |
| `--nav-item-color-hover` | `#2c2825` | Item hover color | Follows `--color-text` | Yes | |
| `--nav-item-color-active` | `#2c2825` | Item active color | Follows `--color-text` | Yes | |
| `--nav-item-bg-hover` | `#e8e2dc` | Item hover bg | Follows `--color-surface-tertiary` | Yes | |
| `--nav-item-bg-active` | `#f7f5f3` | Item active bg | Follows `--color-surface` | Yes | |
| `--nav-item-transition` | `100ms cubic-bezier(0.2,0,0,1)` | Item transition | No | Yes | |
| `--nav-section-font` | Instrument Sans | Section header font | No | Yes | |
| `--nav-section-size` | `11px` | Section header size | No | Yes | |
| `--nav-section-tracking` | `0.02em` | Section header tracking | No | Yes | |
| `--nav-section-color` | `#a8a29e` | Section header color | Follows `--color-text-muted` | Yes | |
| `--nav-section-margin-top` | `16px` | Space above section | No | No | |

### Navigation: Mobile Header

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--nav-mobile-header-height` | `48px` | Mobile header bar height | No | Yes | Must accommodate touch targets. |
| `--nav-mobile-header-bg` | `#f0ece8` | Background | Follows `--color-surface-secondary` | Yes | |
| `--nav-mobile-header-border` | `1px solid #e0d9d1` | Bottom border | No | Yes | |
| `--nav-sidebar-drawer-z` | `30` | Sidebar drawer z-index | No | No | |
| `--nav-sidebar-backdrop-z` | `25` | Drawer backdrop z-index | No | No | |

### Navigation: Bottom Bar

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--nav-bottom-height` | `56px` | Bar height | No | Yes | Must accommodate touch targets. |
| `--nav-bottom-bg` | `#f7f5f3` | Background | Follows `--color-surface` | Yes | |
| `--nav-bottom-border-top` | `1px solid #e0d9d1` | Top border | No | Yes | |
| `--nav-bottom-item-color` | `#a8a29e` | Item default color | Follows `--color-text-muted` | Yes | |
| `--nav-bottom-item-color-active` | `#ff6b35` | Item active color | Follows `--color-accent` | Follows `--color-accent` | |
| `--nav-bottom-item-font` | Instrument Sans | Item font | No | Yes | |
| `--nav-bottom-item-size` | `11px` | Item font size | No | Yes | |

### Data Display: Badge

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--badge-font` | Berkeley Mono | Badge font | No | Yes | |
| `--badge-size` | `12px` | Font size | No | Yes | |
| `--badge-tracking` | `0.04em` | Letter spacing | No | Yes | |
| `--badge-radius` | `999px` | Pill shape | No | Yes | |
| `--badge-padding-x` | `8px` | Horizontal padding | No | Yes | |
| `--badge-padding-y` | `var(--space-2xs)` = 2px | Vertical padding | No | Yes | Uses `--space-2xs`. |
| `--badge-neutral-bg` | `#e8e2dc` | Neutral badge bg | Follows `--color-surface-tertiary` | Yes | |
| `--badge-neutral-text` | `#78716c` | Neutral badge text | Follows `--color-text-secondary` | Yes | |

### Data Display: Tag

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--tag-font` | Berkeley Mono | Tag font | No | Yes | |
| `--tag-size` | `12px` | Font size | No | Yes | |
| `--tag-radius` | `2px` | Corner radius | No | Yes | |
| `--tag-padding-x` | `8px` | Horizontal padding | No | Yes | |
| `--tag-padding-y` | `var(--space-2xs)` = 2px | Vertical padding | No | Yes | Uses `--space-2xs`. |
| `--tag-border` | `1px solid #e0d9d1` | Border | No | Yes | |
| `--tag-bg` | `#f7f5f3` | Background | Follows `--color-surface` | Yes | |
| `--tag-text` | `#78716c` | Text color | Follows `--color-text-secondary` | Yes | |

### Data Display: Key-Value Pair

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--kv-key-font` | Berkeley Mono | Key font | No | Yes | |
| `--kv-key-size` | `12px` | Key font size | No | Yes | |
| `--kv-key-color` | `#a8a29e` | Key color | Follows `--color-text-muted` | Yes | |
| `--kv-value-font` | Berkeley Mono | Value font | No | Yes | |
| `--kv-value-size` | `14px` | Value font size | No | Yes | |
| `--kv-value-color` | `#2c2825` | Value color | Follows `--color-text` | Yes | |
| `--kv-gap` | `4px` | Gap between key and value | No | No | |

### Data Display: Status Indicator

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--status-dot-size` | `8px` | Dot diameter | No | Yes | |
| `--status-font` | Berkeley Mono | Status font | No | Yes | |
| `--status-size` | `12px` | Font size | No | Yes | |
| `--status-gap` | `4px` | Gap between dot and text | No | No | |

### Feedback: Toast

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--toast-radius` | `4px` | Corner radius | No | Yes | |
| `--toast-padding` | `16px` | Internal padding | No | Yes | |
| `--toast-shadow` | `var(--elevation-overlay)` | Shadow | No | Yes | |
| `--toast-bg` | `#f7f5f3` | Background | Follows `--color-surface` | Yes | |
| `--toast-border` | `1px solid #e0d9d1` | Border | No | Yes | |
| `--toast-font` | Instrument Sans | Text font | No | Yes | |
| `--toast-font-size` | `13px` | Text size | No | Yes | |
| `--toast-max-width` | `360px` | Maximum width | No | Yes | |

### Feedback: Empty State

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--empty-icon-size` | `48px` | Icon size | No | Yes | |
| `--empty-icon-color` | `#a8a29e` | Icon color | Follows `--color-text-muted` | Yes | |
| `--empty-heading-font` | Instrument Sans | Heading font | No | Yes | |
| `--empty-heading-size` | `18px` | Heading size | No | Yes | |
| `--empty-body-font` | Instrument Sans | Body font | No | Yes | |
| `--empty-body-size` | `13px` | Body size | No | Yes | |
| `--empty-body-color` | `#78716c` | Body color | Follows `--color-text-secondary` | Yes | |
| `--empty-gap` | `16px` | Spacing between elements | No | No | |

### Feedback: Skeleton

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--skeleton-bg` | `#e8e2dc` | Base color | Follows `--color-surface-tertiary` | Yes | |
| `--skeleton-shine` | `#f0ece8` | Shimmer color | Follows `--color-surface-secondary` | Yes | |
| `--skeleton-radius` | `2px` | Corner radius | No | Yes | |
| `--skeleton-duration` | `1.5s` | Animation cycle | No | Yes | |

### Focus Ring (Global)

| Token | Value (resolves to) | Role | Tier 1 Overridable | Tier 2 Overridable | Constraints |
|-------|---------------------|------|--------------------|--------------------|-------------|
| `--focus-ring-width` | `var(--border-width-thick)` = 2px | Ring width | No | No | Non-negotiable for accessibility. Uses `--border-width-thick`. |
| `--focus-ring-offset` | `var(--border-width-thick)` = 2px | Ring offset | No | No | Non-negotiable for accessibility. Uses `--border-width-thick`. |
| `--focus-ring-color` | `#ff6b35` | Ring color | Yes (follows accent) | Yes | Must be visible on all surfaces. |
