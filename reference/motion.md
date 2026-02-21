# aiaiai Design System — Motion Reference

Last updated: 2026-02-20

Duration and easing specifications, choreography rules, performance constraints, and anti-patterns. Motion is functional and snappy. Every transition serves orientation, feedback, or continuity.

---

## Duration Scale

| Token | Value | Purpose | When to Use | Constraints |
|-------|-------|---------|-------------|-------------|
| `--duration-instant` | `100ms` | Immediate feedback | Hover states, color changes, opacity toggles, focus ring appearance | Never perceptible as an animation. User should not "wait" for it. |
| `--duration-fast` | `150ms` | Micro-interactions | Button press feedback, checkbox toggle, toggle switch, small icon transitions | Feels responsive. User sees the change but does not track it. |
| `--duration-normal` | `250ms` | Standard transitions | Panel open/close, dropdown expand, accordion, page element enter, tab switch | The workhorse duration. Most UI transitions use this. |
| `--duration-slow` | `400ms` | Larger movements | Modal enter/exit, sidebar collapse/expand, drawer slide, multi-element choreography | Reserved for movements that cover significant screen distance. |
| `--duration-dramatic` | `600ms` | Product-specific gestures | Page-level transitions, onboarding sequences, brand moments | NOT a system default. Use only for product-specific dramatic gestures. Must be explicitly justified. |

### Duration Selection Decision Tree

```
Is this a hover or focus state change?
├─ YES → --duration-instant (100ms)
└─ NO
   ├─ Is this a small control state change (button press, toggle, checkbox)?
   │  └─ YES → --duration-fast (150ms)
   └─ NO
      ├─ Is this a standard UI transition (panel, dropdown, accordion, tab)?
      │  └─ YES → --duration-normal (250ms)
      └─ NO
         ├─ Is this a large-scale movement (modal, sidebar, drawer)?
         │  └─ YES → --duration-slow (400ms)
         └─ Is this a dramatic product-specific moment?
            └─ YES → --duration-dramatic (600ms). Justify it.
```

---

## Easing Curves

| Token | Value | Purpose | When to Use | Character |
|-------|-------|---------|-------------|-----------|
| `--easing-default` | `cubic-bezier(0.2, 0, 0, 1)` | Snappy deceleration | Default for all UI motion. Elements that move and settle. | Starts fast, decelerates firmly. No bounce. |
| `--easing-enter` | `cubic-bezier(0, 0, 0.2, 1)` | Elements appearing | Elements entering the viewport: modals, toasts, dropdowns, new list items | Gentle start, confident arrival. |
| `--easing-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving | Elements exiting the viewport: closing modals, dismissed toasts, removed items | Quick departure. Does not linger. |
| `--easing-linear` | `linear` | Constant rate | Progress bars, loading indicators, continuous rotation | No personality. Pure utility. |

### Easing Selection

| Scenario | Easing |
|----------|--------|
| Element moves to a new position and stays | `--easing-default` |
| Element appears for the first time | `--easing-enter` |
| Element disappears/is removed | `--easing-exit` |
| Progress indicator or loader | `--easing-linear` |
| Hover/focus color change | `--easing-default` (or no easing needed at 100ms) |
| Skeleton shimmer | `--easing-linear` |

---

## Transition Shorthand Table

Common animation patterns with their exact token combination.

| Pattern | Duration | Easing | CSS Shorthand |
|---------|----------|--------|---------------|
| Hover state (button, link, card) | `--duration-instant` | `--easing-default` | `transition: all var(--duration-instant) var(--easing-default)` |
| Button press | `--duration-fast` | `--easing-default` | `transition: transform var(--duration-fast) var(--easing-default)` |
| Dropdown open | `--duration-normal` | `--easing-enter` | `transition: opacity var(--duration-normal) var(--easing-enter), transform var(--duration-normal) var(--easing-enter)` |
| Dropdown close | `--duration-fast` | `--easing-exit` | `transition: opacity var(--duration-fast) var(--easing-exit), transform var(--duration-fast) var(--easing-exit)` |
| Modal enter | `--duration-slow` | `--easing-enter` | `transition: opacity var(--duration-slow) var(--easing-enter), transform var(--duration-slow) var(--easing-enter)` |
| Modal exit | `--duration-normal` | `--easing-exit` | `transition: opacity var(--duration-normal) var(--easing-exit), transform var(--duration-normal) var(--easing-exit)` |
| Toast enter | `--duration-normal` | `--easing-enter` | slide in from edge + fade |
| Toast exit | `--duration-fast` | `--easing-exit` | fade + slide out |
| Sidebar collapse | `--duration-slow` | `--easing-default` | `transition: width var(--duration-slow) var(--easing-default)` |
| Skeleton shimmer | `--skeleton-duration` (1.5s) | `--easing-linear` | infinite loop, background-position |
| Toggle switch | `--duration-fast` | `--easing-default` | knob translate + background color |
| Checkbox check | `--duration-fast` | `--easing-default` | scale from 0 to 1 |
| Tab switch content | `--duration-normal` | `--easing-default` | opacity crossfade |
| Focus ring appear | `--duration-instant` | `--easing-default` | outline/box-shadow appearance |

---

## Choreography Rules

### 1. Spatial Consistency

**Rule:** Elements enter from the direction they will exit to.

| Element | Enter Direction | Exit Direction |
|---------|----------------|---------------|
| Sidebar | Slide in from left | Slide out to left |
| Right-side panel/drawer | Slide in from right | Slide out to right |
| Bottom sheet | Slide up from bottom | Slide down to bottom |
| Toast (desktop) | Slide in from right | Slide/fade out to right |
| Toast (mobile) | Slide up from bottom | Slide/fade down to bottom |
| Dropdown | Scale + fade from origin (trigger element) | Fade at origin |
| Modal | Scale up from center (0.95 to 1.0) + fade | Scale down (1.0 to 0.95) + fade |
| Tooltip | Fade in near trigger | Fade out |

### 2. Stagger Delays for Lists

**Rule:** When multiple items enter sequentially, stagger by 30ms between items, capping at 150ms total delay.

| Items | Stagger Delay per Item | Total Delay Before Last Item |
|-------|----------------------|----------------------------|
| 1 | 0ms | 0ms |
| 2 | 30ms | 30ms |
| 3 | 30ms | 60ms |
| 4 | 30ms | 90ms |
| 5 | 30ms | 120ms |
| 6+ | 0ms (all instant after 5th) | 150ms max |

**Rule:** After the 5th item, all remaining items appear instantly. Stagger is for visual polish, not for making users wait.

### 3. Enter/Exit Asymmetry

**Rule:** Exits are faster than enters. The user initiated the exit and wants the result, not a goodbye animation.

| Pattern | Enter Duration | Exit Duration |
|---------|---------------|--------------|
| Modal | `--duration-slow` (400ms) | `--duration-normal` (250ms) |
| Dropdown | `--duration-normal` (250ms) | `--duration-fast` (150ms) |
| Toast | `--duration-normal` (250ms) | `--duration-fast` (150ms) |
| Sidebar | `--duration-slow` (400ms) | `--duration-slow` (400ms) |

### 4. Overlay Backdrop

**Rule:** The backdrop (`--color-overlay`) fades independently. It always uses `--duration-normal` with `--easing-default`, regardless of the content transition speed.

---

## Performance Rules

### Animatable Properties

| Property | Allowed | Reason |
|----------|---------|--------|
| `transform` (translate, scale, rotate) | Yes | GPU-composited. No layout recalc. |
| `opacity` | Yes | GPU-composited. No layout recalc. |
| `background-color` | Cautious | Triggers paint but not layout. Acceptable for hover states. |
| `border-color` | Cautious | Triggers paint but not layout. Acceptable for focus states. |
| `box-shadow` | Cautious | Triggers paint. Use sparingly. Prefer opacity transition on a pseudo-element. |
| `color` | Cautious | Triggers paint. Acceptable for text color transitions on hover. |
| `width` | No | Triggers layout recalculation. Use `transform: scaleX()` instead. |
| `height` | No | Triggers layout recalculation. Use `transform: scaleY()` or `max-height` hack. |
| `top`, `left`, `right`, `bottom` | No | Triggers layout. Use `transform: translate()`. |
| `margin`, `padding` | No | Triggers layout. Restructure or use transform. |

### Implementation Guidance

```css
/* GOOD: transform + opacity only */
.modal-enter {
  opacity: 0;
  transform: scale(0.95);
  transition:
    opacity var(--duration-slow) var(--easing-enter),
    transform var(--duration-slow) var(--easing-enter);
}
.modal-enter-active {
  opacity: 1;
  transform: scale(1);
}

/* BAD: animating layout properties */
.modal-enter {
  width: 0;
  height: 0;
  margin-top: 100px;
}
```

### Reduced Motion

**Rule:** All animations must respect `prefers-reduced-motion: reduce`. Replace motion with instant state changes.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | What to Do Instead |
|-------------|-------------|-------------------|
| Decorative shimmer/glow effects | Motion without purpose. Violates "every animation earns its place." | Remove. If something needs attention, use color or position. |
| Spring physics / elastic bounce | Too playful for the default "exposed mechanism" aesthetic. (Allowed in Tier 2 bespoke only.) | Use `--easing-default` (snappy deceleration, no overshoot). |
| Animations > 600ms for standard UI | Makes the interface feel sluggish. Users wait for the animation. | Use `--duration-normal` (250ms) or `--duration-slow` (400ms) max. |
| Animating layout properties | Causes layout thrashing, jank on low-end devices. | Use `transform` and `opacity` exclusively. |
| Continuous looping animations (except loading) | Distracting. Draws attention where none is needed. | Only skeleton shimmer and loading spinners may loop. |
| Auto-playing entrance animations on page load | Delays time-to-interactive. User wants content, not a show. | Elements should be in their final position on paint. Animate only on user interaction or lazy-load entrance. |
| Hover animation > 100ms | Creates perceptible lag between user action and visual feedback. | Use `--duration-instant` (100ms) for all hover states. |
| Different enter and exit directions | Breaks spatial consistency. Confusing. | Enter from the direction you will exit to. |
| Stagger > 150ms total | User perceives the UI as slow/broken. | Cap stagger at 5 items (150ms). Everything after appears instantly. |
| Animation without reduced-motion fallback | Accessibility violation. Can cause vestibular issues. | Always implement `prefers-reduced-motion: reduce`. |

---

## PASS/FAIL Tests

| Test | PASS | FAIL |
|------|------|------|
| Hover state duration | Uses `--duration-instant` (100ms) | Uses 250ms+ for hover |
| Animation purpose | Can state: "this serves [orientation/feedback/continuity]" | Cannot justify why the animation exists |
| Animated properties | Uses only transform, opacity | Animates width, height, top, left, margin, padding |
| Easing on UI motion | Uses system easings from tokens | Uses custom cubic-bezier not in the token set |
| Spring/elastic easing | Only in Tier 2 bespoke themes | Spring easing in default theme |
| Stagger delay | 30ms per item, max 150ms (5 items) | 50ms+ per item or > 150ms total |
| Exit speed | Exit is same or faster than enter | Exit is slower than enter |
| Reduced motion | `prefers-reduced-motion: reduce` handled | No reduced motion handling |
| Continuous animation | Only loading indicators and skeleton shimmer | Decorative pulsing, floating, or bouncing |
| Modal enter/exit | Enter: scale(0.95)+fade, 400ms. Exit: 250ms. | Slide from edge, or 600ms+ duration |
