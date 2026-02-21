# aiaiai Design System — Color Reference

Last updated: 2026-02-20

Complete color palette with semantic roles, OKLCH values, contrast ratios, and usage rules. Every color has a job. If a color does not communicate meaning, it does not appear.

---

## Semantic Palette

### Surfaces

| Token | Hex | OKLCH (approximate) | Role | Constraints |
|-------|-----|---------------------|------|-------------|
| `--color-surface` | `#f7f5f3` | `oklch(97% 0.005 60)` | Primary background. Aged paper. | WCAG AA (4.5:1) with `--color-text`. Never clinical #fff. |
| `--color-surface-secondary` | `#f0ece8` | `oklch(94% 0.01 60)` | Secondary/recessed areas. Sidebar backgrounds. | Visually distinguishable from `--color-surface`. |
| `--color-surface-tertiary` | `#e8e2dc` | `oklch(91% 0.015 55)` | Tertiary nesting. Toggle off-state. | Visually distinguishable from `--color-surface-secondary`. |
| `--color-overlay` | `rgba(44,40,37,0.5)` | -- | Modal/drawer backdrop | Warm-tinted. Never cold gray. |

### Borders

| Token | Hex | OKLCH (approximate) | Role | Constraints |
|-------|-----|---------------------|------|-------------|
| `--color-border` | `#e0d9d1` | `oklch(88% 0.015 55)` | Default structural borders. Cards, inputs, dividers. | Visible on `--color-surface`. |
| `--color-border-strong` | `#c4bbb0` | `oklch(78% 0.02 55)` | Emphasized borders. Active controls, focus. | Clearly stronger than `--color-border`. |

### Text

| Token | Hex | OKLCH (approximate) | Role | Constraints |
|-------|-----|---------------------|------|-------------|
| `--color-text` | `#2c2825` | `oklch(22% 0.015 55)` | Primary text. Headings, body. | Never pure black (#000). 11.3:1 on `--color-surface`. |
| `--color-text-secondary` | `#78716c` | `oklch(52% 0.01 55)` | Descriptions, metadata, secondary info. | ~5:1 on `--color-surface`. AA compliant. |
| `--color-text-muted` | `#a8a29e` | `oklch(70% 0.008 55)` | Placeholders, disabled text, non-essential. | ~3:1 on `--color-surface`. NOT for essential body text. |
| `--color-text-on-accent` | `#faf9f7` | `oklch(97% 0.005 60)` | Text on accent-colored backgrounds. | 3.2:1 on `--color-accent`. AA for UI components. |

### Accent (Orange -- Creation, Focus, Primary Action)

| Token | Hex | OKLCH (approximate) | Role | Constraints |
|-------|-----|---------------------|------|-------------|
| `--color-accent` | `#ff6b35` | `oklch(72% 0.19 45)` | Primary action. CTAs. Toggles. Focus. | 3.5:1 on `--color-surface` (AA for large text/UI). |
| `--color-accent-hover` | `#e85a28` | `oklch(65% 0.18 42)` | Hover state of accent. | Must be darker than `--color-accent`. |
| `--color-accent-subtle` | `#fff0e8` | `oklch(96% 0.03 55)` | Accent background tint. Selected states. | Barely visible tint. |

### Destructive (Red -- Danger, Errors, Deletion)

| Token | Hex | OKLCH (approximate) | Role | Constraints |
|-------|-----|---------------------|------|-------------|
| `--color-destructive` | `#dc2626` | `oklch(55% 0.22 25)` | Delete buttons, error states, danger alerts. | Must universally read as "danger". |
| `--color-destructive-hover` | `#b91c1c` | `oklch(48% 0.2 25)` | Hover state. | Darker than `--color-destructive`. |
| `--color-destructive-subtle` | `#fef2f2` | `oklch(97% 0.01 20)` | Error background tint. Error toasts. | Barely visible red tint. |

### Success (Green -- Confirmation, Positive)

| Token | Hex | OKLCH (approximate) | Role | Constraints |
|-------|-----|---------------------|------|-------------|
| `--color-success` | `#16a34a` | `oklch(62% 0.17 150)` | Confirmation messages, positive status. | Must universally read as "positive". |
| `--color-success-subtle` | `#f0fdf4` | `oklch(98% 0.02 150)` | Success background tint. | |

### Warning (Amber -- Caution, Attention)

| Token | Hex | OKLCH (approximate) | Role | Constraints |
|-------|-----|---------------------|------|-------------|
| `--color-warning` | `#ca8a04` | `oklch(68% 0.15 85)` | Warning messages, caution indicators. | Must universally read as "caution". |
| `--color-warning-subtle` | `#fffbeb` | `oklch(98% 0.03 95)` | Warning background tint. | |

### Info (Blue -- Information, Links)

| Token | Hex | OKLCH (approximate) | Role | Constraints |
|-------|-----|---------------------|------|-------------|
| `--color-info` | `#2563eb` | `oklch(55% 0.2 260)` | Information callouts, text links. | AA on `--color-surface`. |
| `--color-info-subtle` | `#eff6ff` | `oklch(97% 0.01 260)` | Info background tint. | |

---

## Primitive Palette (base.css)

Full color ramps for reference. These are building blocks -- never used directly in components.

### Neutrals

| Step | Token | Hex | Usage in Semantic Layer |
|------|-------|-----|------------------------|
| white | `--raw-color-white` | `#faf9f7` | `--color-text-on-accent` |
| 50 | `--raw-color-neutral-50` | `#f7f5f3` | `--color-surface` |
| 100 | `--raw-color-neutral-100` | `#f0ece8` | `--color-surface-secondary` |
| 200 | `--raw-color-neutral-200` | `#e8e2dc` | `--color-surface-tertiary` |
| 300 | `--raw-color-neutral-300` | `#e0d9d1` | `--color-border` |
| 400 | `--raw-color-neutral-400` | `#c4bbb0` | `--color-border-strong` |
| 500 | `--raw-color-neutral-500` | `#a8a29e` | `--color-text-muted` |
| 600 | `--raw-color-neutral-600` | `#78716c` | `--color-text-secondary` |
| 700 | `--raw-color-neutral-700` | `#57534e` | (available, not assigned) |
| 800 | `--raw-color-neutral-800` | `#3d3835` | (available, not assigned) |
| 900 | `--raw-color-neutral-900` | `#2c2825` | `--color-text` |
| 950 | `--raw-color-neutral-950` | `#1c1917` | (available for dark mode) |

### Orange

| Step | Token | Hex |
|------|-------|-----|
| 50 | `--raw-color-orange-50` | `#fff7ed` |
| 100 | `--raw-color-orange-100` | `#fff0e8` |
| 200 | `--raw-color-orange-200` | `#fed7aa` |
| 300 | `--raw-color-orange-300` | `#fdba74` |
| 400 | `--raw-color-orange-400` | `#fb923c` |
| 500 | `--raw-color-orange-500` | `#ff6b35` |
| 600 | `--raw-color-orange-600` | `#e85a28` |
| 700 | `--raw-color-orange-700` | `#c2410c` |
| 800 | `--raw-color-orange-800` | `#9a3412` |
| 900 | `--raw-color-orange-900` | `#7c2d12` |

### Red

| Step | Token | Hex |
|------|-------|-----|
| 50 | `--raw-color-red-50` | `#fef2f2` |
| 100 | `--raw-color-red-100` | `#fee2e2` |
| 200 | `--raw-color-red-200` | `#fecaca` |
| 300 | `--raw-color-red-300` | `#fca5a5` |
| 400 | `--raw-color-red-400` | `#f87171` |
| 500 | `--raw-color-red-500` | `#ef4444` |
| 600 | `--raw-color-red-600` | `#dc2626` |
| 700 | `--raw-color-red-700` | `#b91c1c` |
| 800 | `--raw-color-red-800` | `#991b1b` |
| 900 | `--raw-color-red-900` | `#7f1d1d` |

### Green

| Step | Token | Hex |
|------|-------|-----|
| 50 | `--raw-color-green-50` | `#f0fdf4` |
| 100 | `--raw-color-green-100` | `#dcfce7` |
| 200 | `--raw-color-green-200` | `#bbf7d0` |
| 300 | `--raw-color-green-300` | `#86efac` |
| 400 | `--raw-color-green-400` | `#4ade80` |
| 500 | `--raw-color-green-500` | `#22c55e` |
| 600 | `--raw-color-green-600` | `#16a34a` |
| 700 | `--raw-color-green-700` | `#15803d` |
| 800 | `--raw-color-green-800` | `#166534` |
| 900 | `--raw-color-green-900` | `#14532d` |

### Amber

| Step | Token | Hex |
|------|-------|-----|
| 50 | `--raw-color-amber-50` | `#fffbeb` |
| 100 | `--raw-color-amber-100` | `#fef3c7` |
| 200 | `--raw-color-amber-200` | `#fde68a` |
| 300 | `--raw-color-amber-300` | `#fcd34d` |
| 400 | `--raw-color-amber-400` | `#fbbf24` |
| 500 | `--raw-color-amber-500` | `#f59e0b` |
| 600 | `--raw-color-amber-600` | `#ca8a04` |
| 700 | `--raw-color-amber-700` | `#a16207` |
| 800 | `--raw-color-amber-800` | `#854d0e` |
| 900 | `--raw-color-amber-900` | `#713f12` |

### Blue

| Step | Token | Hex |
|------|-------|-----|
| 50 | `--raw-color-blue-50` | `#eff6ff` |
| 100 | `--raw-color-blue-100` | `#dbeafe` |
| 200 | `--raw-color-blue-200` | `#bfdbfe` |
| 300 | `--raw-color-blue-300` | `#93c5fd` |
| 400 | `--raw-color-blue-400` | `#60a5fa` |
| 500 | `--raw-color-blue-500` | `#3b82f6` |
| 600 | `--raw-color-blue-600` | `#2563eb` |
| 700 | `--raw-color-blue-700` | `#1d4ed8` |
| 800 | `--raw-color-blue-800` | `#1e40af` |
| 900 | `--raw-color-blue-900` | `#1e3a8a` |

---

## Contrast Ratios (Key Pairings)

Computed contrast ratios for the default aiaiai theme.

### Text on Surfaces

| Foreground | Background | Ratio | WCAG Level | Verdict |
|-----------|-----------|-------|------------|---------|
| `--color-text` (#2c2825) | `--color-surface` (#f7f5f3) | 11.3:1 | AAA | PASS for all text |
| `--color-text` (#2c2825) | `--color-surface-secondary` (#f0ece8) | ~9.8:1 | AAA | PASS for all text |
| `--color-text` (#2c2825) | `--color-surface-tertiary` (#e8e2dc) | ~8.2:1 | AAA | PASS for all text |
| `--color-text-secondary` (#78716c) | `--color-surface` (#f7f5f3) | ~5.0:1 | AA | PASS for body text |
| `--color-text-secondary` (#78716c) | `--color-surface-secondary` (#f0ece8) | ~4.3:1 | AA (borderline) | PASS for body text, test at 13px+ |
| `--color-text-muted` (#a8a29e) | `--color-surface` (#f7f5f3) | ~3.0:1 | AA Large only | NOT for essential body text. Placeholders/disabled only. |

### Accent on Surfaces

| Foreground | Background | Ratio | WCAG Level | Verdict |
|-----------|-----------|-------|------------|---------|
| `--color-accent` (#ff6b35) | `--color-surface` (#f7f5f3) | ~3.5:1 | AA Large / UI | PASS for large text (18px+) and UI components |
| `--color-accent` (#ff6b35) | `--color-surface` (#f7f5f3) | ~3.5:1 | -- | FAIL for normal body text (needs 4.5:1) |
| `--color-text-on-accent` (#faf9f7) | `--color-accent` (#ff6b35) | ~3.2:1 | AA UI | PASS for UI components (buttons) |

### Semantic Colors on Surfaces

| Foreground | Background | Ratio | WCAG Level | Verdict |
|-----------|-----------|-------|------------|---------|
| `--color-destructive` (#dc2626) | `--color-surface` (#f7f5f3) | ~4.8:1 | AA | PASS for body text |
| `--color-success` (#16a34a) | `--color-surface` (#f7f5f3) | ~4.0:1 | AA Large / UI | PASS for UI. Use text for body context. |
| `--color-warning` (#ca8a04) | `--color-surface` (#f7f5f3) | ~3.8:1 | AA Large / UI | PASS for UI. NOT for body text alone. |
| `--color-info` (#2563eb) | `--color-surface` (#f7f5f3) | ~4.7:1 | AA | PASS for body text |

### Semantic Colors on Their Subtle Backgrounds

| Foreground | Background | Ratio | Verdict |
|-----------|-----------|-------|---------|
| `--color-destructive` (#dc2626) | `--color-destructive-subtle` (#fef2f2) | ~4.6:1 | PASS AA |
| `--color-success` (#16a34a) | `--color-success-subtle` (#f0fdf4) | ~3.9:1 | PASS AA Large |
| `--color-warning` (#ca8a04) | `--color-warning-subtle` (#fffbeb) | ~3.7:1 | PASS AA Large |
| `--color-info` (#2563eb) | `--color-info-subtle` (#eff6ff) | ~4.5:1 | PASS AA |

---

## Usage Rules

### Color-to-Job Mapping

| Color | Job | Example Usage |
|-------|-----|---------------|
| Orange (accent) | Creation, focus, primary action | Primary button, active toggle, active tab, focus ring, selected card border |
| Red (destructive) | Destruction, danger, errors | Delete button, error border, error toast, error badge |
| Green (success) | Confirmation, positive outcome | Success toast, success badge, active status dot |
| Amber (warning) | Caution, requires attention | Warning toast, warning badge, pending status dot |
| Blue (info) | Information, links | Info toast, text links, info badge |
| Neutral (warm grays) | Structure, hierarchy, content | Surfaces, text, borders, disabled states |

### Rules

1. **Warm undertone on all neutrals.** Every neutral color maintains hue ~55 in OKLCH. No pure grays. No cool grays. This is the "aged paper" feel.

2. **Never pure black, never pure white.** Primary text is `#2c2825` (warm dark brown), not `#000000`. Primary surface is `#f7f5f3` (warm off-white), not `#ffffff`. Even `--color-text-on-accent` uses `#faf9f7`.

3. **Color = meaning.** If orange appears, it means "primary action" or "creation." If red appears, it means "danger" or "destruction." A color appearing without communicating meaning is a design defect.

4. **Every semantic color has a `-subtle` variant.** Use `-subtle` for backgrounds (toast backgrounds, badge backgrounds, input error backgrounds). Use the full-strength color for text and icons.

5. **Do not use accent color for body text.** The accent (#ff6b35) is 3.5:1 on surface -- this passes for large text and UI components but FAILS for normal body text. Use `--color-text` or `--color-text-secondary` for body text.

6. **Do not use `--color-text-muted` for essential content.** At ~3:1 contrast, it is only suitable for placeholders, disabled text, and non-essential decorative text. Essential information must use `--color-text` or `--color-text-secondary`.

7. **Shadows are warm.** All shadow values use `rgba(44,40,37,...)` as the base color. Never `rgba(0,0,0,...)`. This ensures shadows feel like natural light, not a computer rendering.

---

## PASS/FAIL Tests

| Test | PASS | FAIL |
|------|------|------|
| Background color | Uses `--color-surface` (#f7f5f3) or variants | Uses #fff, #ffffff, or any pure white |
| Primary text color | Uses `--color-text` (#2c2825) | Uses #000, #000000, or any pure black |
| Accent usage | Orange used for primary action, creation, focus | Orange used "to add visual interest" |
| Red usage | Red used for destructive/error/danger only | Red used for positive or neutral elements |
| Color carries meaning | Removing the color would lose information | Color is purely decorative |
| Neutral warmth | All grays have visible warm undertone | Any neutral reads as cool/blue/pure gray |
| Body text contrast | Body text is `--color-text` or `--color-text-secondary` | Body text is `--color-accent` or `--color-text-muted` |
| Shadow warmth | Shadow uses `rgba(44,40,37,...)` | Shadow uses `rgba(0,0,0,...)` |
