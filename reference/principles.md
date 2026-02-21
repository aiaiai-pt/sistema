# aiaiai Design System — Design Principles

Last updated: 2026-02-20

Design principles derived from the Still Phone manifesto, expressed as testable criteria. Use these to evaluate any design decision in an aiaiai project.

---

## Principle: Warmth Over Sterility

**Rule:** Every surface, shadow, and neutral color must carry warm undertones. The screen should feel like a well-loved object, not a light source.

**PASS criteria:**
- [ ] Background surfaces use warm whites (e.g., `#f7f5f3`), never clinical `#ffffff`
- [ ] Text uses warm dark tones (e.g., `#2c2825`), never pure `#000000`
- [ ] Shadows use warm RGBA base (e.g., `rgba(44,40,37,...)`) not cold gray (`rgba(0,0,0,...)`)
- [ ] All neutral colors maintain hue ~55 in OKLCH (warm undertone)
- [ ] Overlay/backdrop colors use warm tint, not neutral gray

**FAIL indicators:**
- Pure black `#000` or `#000000` used for text
- Clinical white `#fff` or `#ffffff` used for backgrounds
- Cold gray shadows: `rgba(0,0,0,...)` or `#ccc`/`#ddd`/`#eee` borders
- Any neutral color with 0 chroma in OKLCH (pure gray)
- Surfaces that "feel like staring at a light source"

---

## Principle: Decisive Color, Not Decorative

**Rule:** Every color in the interface has a specific semantic job. If a color does not communicate meaning, it does not appear.

**PASS criteria:**
- [ ] Orange (`--color-accent`) is used exclusively for creation, focus, and primary action
- [ ] Red (`--color-destructive`) is used exclusively for danger, errors, and deletion
- [ ] Green (`--color-success`) is used exclusively for confirmation and positive outcomes
- [ ] Amber (`--color-warning`) is used exclusively for caution and attention
- [ ] Blue (`--color-info`) is used exclusively for information and links
- [ ] No color appears without a defined semantic role
- [ ] Accent color is never used "for visual interest" or "to add a pop of color"

**FAIL indicators:**
- Colors used purely for decoration (colored borders, gradient backgrounds with no meaning)
- Multiple accent colors in a single view without distinct semantic roles
- Red used for something that is not destructive/dangerous
- Orange used for something that is not a primary action or creation-related
- A colored element where removing the color loses no information

---

## Principle: Breathing Space Is Information

**Rule:** Whitespace creates rhythm, hierarchy, and calm. Dense information needs room to breathe. Silence is as important as content.

**PASS criteria:**
- [ ] All spacing uses the 8px grid tokens (`--space-sm` through `--space-4xl`)
- [ ] No spacing values below 4px except borders/outlines
- [ ] Related elements are grouped with smaller spacing; unrelated elements separated with larger spacing
- [ ] Cards and containers use at minimum `--space-lg` (24px) padding
- [ ] Sections within a page are separated by at least `--space-xl` (32px)
- [ ] Text content respects max line lengths (`--content-width-narrow` = 640px for prose)
- [ ] The layout has visible breathing room — not every pixel is occupied

**FAIL indicators:**
- Hardcoded pixel values instead of spacing tokens
- Spacing values not on the 8px grid (except 4px for micro-spacing)
- Wall-to-wall content with no margin
- Cards with less than 16px padding
- Adjacent sections with identical spacing (no visual hierarchy)
- Line lengths exceeding 80 characters for body text without constraint

---

## Principle: Every Animation Earns Its Place

**Rule:** Motion serves exactly one of three purposes: orientation (where am I?), feedback (did that work?), or continuity (what changed?). If an animation serves none of these, remove it.

**PASS criteria:**
- [ ] Every animation can be categorized as orientation, feedback, or continuity
- [ ] Hover states use `--duration-instant` (100ms) — no delay for feedback
- [ ] Standard UI transitions use `--duration-normal` (250ms) or below
- [ ] Only `transform` and `opacity` are animated (never layout properties)
- [ ] All animations use system easings (`--easing-default`, `--easing-enter`, `--easing-exit`)
- [ ] Stagger delays in lists are 30ms between items, max 150ms total
- [ ] Elements enter from the direction they will exit to

**FAIL indicators:**
- Decorative animation (shimmer effects, bouncing icons, floating elements with no trigger)
- Spring physics or elastic easing in standard UI (reserved for bespoke themes only)
- Animations exceeding 400ms for standard UI (modals can use `--duration-slow`)
- Animating `width`, `height`, `top`, `left`, `margin`, or `padding`
- Animations without a corresponding reduced-motion alternative via `prefers-reduced-motion`
- Any animation where the user must wait for it to finish before interacting

---

## Principle: Precision Typography

**Rule:** Every character earns its place. Monospace for data (numbers, code, time). Sans-serif for interface (prose, headings). Display for brand moments (rare). No font appears without a reason.

**PASS criteria:**
- [ ] Labels on controls use Berkeley Mono (`--type-label-font`)
- [ ] Numbers, timestamps, code, and metrics use Berkeley Mono (`--type-data-font`)
- [ ] Prose and descriptions use Instrument Sans (`--type-body-font` / `--font-sans`)
- [ ] Headings use Instrument Sans with appropriate weight (`--type-heading-*`)
- [ ] Display type (36px) appears only for brand/hero moments, not regular content
- [ ] Font sizes come from the type scale tokens — no arbitrary sizes
- [ ] Line heights and tracking match the scale definitions
- [ ] No generic system fonts (system-ui, sans-serif) used alone

**FAIL indicators:**
- Numbers displayed in sans-serif instead of mono
- Labels on form fields or navigation in sans-serif instead of mono
- Prose or paragraphs displayed in monospace
- Font sizes outside the defined scale (11, 12, 13, 14, 15, 18, 24, 36 px)
- Missing letter spacing on labels (labels require `--type-label-tracking` = 0.04em)
- Display type (36px) used for section headings (use `--type-heading-lg` at 24px instead)

---

## System Rule: 8px Grid

**Rule:** All spacing and sizing aligns to an 8px grid. The sole exception is 4px (`--space-xs`) for micro-spacing within tight component internals.

**PASS criteria:**
- [ ] All layout spacing uses 8px multiples: 8, 16, 24, 32, 48, 64, 96
- [ ] Only icon gaps, badge padding, and internal component micro-spacing use 4px
- [ ] Component heights are 8px multiples: 28, 32, 36, 44, 48, 56
- [ ] No spacing value exists that is not 4px or an 8px multiple

**FAIL indicators:**
- Spacing values like 5px, 6px, 10px, 12px, 14px, 18px, 20px (not on grid)
- 4px used for layout spacing (should be 8px minimum)
- Components with heights not on the 8px grid
- Padding or margin values that don't match spacing tokens

---

## System Rule: Phosphor Icons

**Rule:** The icon system is Phosphor Icons. No custom icons. No other icon libraries.

**PASS criteria:**
- [ ] All icons are from the Phosphor Icons set
- [ ] Icon size matches the context: 16px in compact UI, 20px standard, 24px prominent
- [ ] Icons use `currentColor` for fill/stroke (inherits text color)
- [ ] Icon-only buttons have aria-label for accessibility

**FAIL indicators:**
- Icons from Material Icons, Heroicons, Lucide, Font Awesome, or any other library
- Custom SVG icons that are not from Phosphor
- Icons with hardcoded colors instead of `currentColor`
- Decorative icons that add no information (see: "Decisive color" principle)

---

## System Rule: Borders Over Shadows

**Rule:** Structure is visible through borders, not implied through shadows. Shadows are reserved for elements that float above the page plane (overlays, dropdowns, modals).

**PASS criteria:**
- [ ] Cards use `--elevation-border` (1px solid border), not shadows, by default
- [ ] Inputs use `--elevation-border`, not shadows
- [ ] Dividers and structural separations use borders
- [ ] Only dropdowns, popovers use `--elevation-raised` (subtle shadow)
- [ ] Only modals, command palettes, toasts use `--elevation-overlay` (prominent shadow)
- [ ] All shadows are warm-tinted (`rgba(44,40,37,...)`)

**FAIL indicators:**
- Cards with box-shadow instead of border in the default theme
- Inputs with box-shadow for depth
- Shadows used to create visual hierarchy between same-plane elements
- Cold gray shadows (`rgba(0,0,0,...)`)
- More than 2 shadow levels in a single view

---

## System Rule: Accessibility Minimums

**Rule:** All interactive elements meet WCAG 2.1 AA requirements. This is non-negotiable and preserved across all theme tiers.

**PASS criteria:**
- [ ] Primary text on primary surface: >= 4.5:1 contrast ratio
- [ ] Large text (18px+ or 14px+ bold) on primary surface: >= 3:1 contrast ratio
- [ ] UI components and graphical objects against background: >= 3:1 contrast ratio
- [ ] Focus ring visible on all interactive elements (2px width, 2px offset, accent color)
- [ ] Touch targets are at minimum 44x44px on touch devices (use `--button-lg-height`)
- [ ] Interactive elements are keyboard-navigable
- [ ] ARIA labels on icon-only buttons and non-text controls

**FAIL indicators:**
- `--color-text-muted` used for essential body text (it does not meet AA)
- Missing focus ring on interactive elements
- Touch targets smaller than 44x44px on mobile
- Color as the only means of conveying information (needs text or icon too)
- Missing ARIA attributes on custom controls

---

## Quick Reference: Token Naming Convention

| Layer | Pattern | Example |
|-------|---------|---------|
| Primitive | `--raw-{category}-{name}` | `--raw-color-orange-500` |
| Semantic | `--{category}-{role}` | `--color-accent` |
| Component | `--{component}-{property}` | `--button-radius` |

**Rule:** Components reference semantic tokens. Semantic tokens reference primitives. Never skip a layer.
