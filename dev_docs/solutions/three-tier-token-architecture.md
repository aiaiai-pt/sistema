# Three-Tier Token Architecture

**Context:** Building a design system that supports tiered theming (brand swap vs. full personality shift) while maintaining token chain integrity.

## Pattern

```
Primitive (--raw-*)  -->  Semantic (--{role})  -->  Component (--{component}-{property})
   base.css                semantic.css              components.css
```

### Tier Rules

| Layer | Names | References | Overridden by themes? |
|-------|-------|------------|----------------------|
| Primitive | `--raw-color-*`, `--raw-font-size-*`, `--raw-space-*` | Raw values only | Never |
| Semantic | `--color-surface`, `--type-body-size`, `--space-md` | Primitives only | Yes (this is the theme surface) |
| Component | `--button-primary-bg`, `--input-radius` | Semantic tokens only | Yes (Tier 2 only) |

### Enforcement

The chain `primitive -> semantic -> component` must never be broken. Violations found in practice:

- **Component referencing primitive directly** (`--button-sm-font-size: var(--raw-font-size-11)`) — breaks when a bespoke theme overrides the semantic type scale but the component ignores it.
- **Theme introducing raw values** (`--type-label-tracking: 0.01em`) — bypasses the primitive vocabulary, making the system unpredictable.
- **Semantic using hardcoded values** (`--color-overlay: rgba(44, 40, 37, 0.5)`) — acceptable only when no primitive can express the concept (alpha channels). Document these as known gaps.

### Tiered Theming

**Tier 1 (Branded):** Override <20 semantic tokens. Accent color, surface tint, border/text follow. Typography, spacing, motion, radius stay. Result still feels like the base system.

**Tier 2 (Bespoke):** Override 40-80 tokens across semantic + component layers. Full personality shift. Only 8px grid, breakpoints, and token naming convention are preserved.

Scope with `[data-theme="name"]` selector on `<html>`. Import theme file after semantic.css.

## Key Decisions

1. **No dark mode token split** — semantic names are role-based (`--color-surface`, not `--color-light-bg`), so dark mode is just another theme override. Architecture supports it without restructuring.
2. **Warm shadows hardcoded in primitives** — `rgba(44, 40, 37, ...)` cannot be composed from hex primitives. Accept this as a known gap; themes override the full shadow value.
3. **Overlay colors are theme-level concerns** — No primitive for "neutral-900 at 50% opacity". Each theme defines its own `--color-overlay`.

## Anti-Patterns

- Using `--raw-*` tokens directly in component CSS or page styles
- Introducing magic numbers in theme files that don't exist in base.css primitives
- Skipping the semantic layer (component -> primitive directly)
