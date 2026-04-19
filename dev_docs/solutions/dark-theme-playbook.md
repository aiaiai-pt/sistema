# Dark Theme Playbook

First encoded after shipping UBP — the system's first dark theme (`tokens/themes/ubp.css`, 2026-04). This document captures the non-obvious work so the **next** dark theme ships cheaper. The authoritative rules still live in `reference/theming.md` § "Dark Theme Considerations"; this file is the narrative companion.

## Order of operations (what to do, in sequence)

1. **Extract the reference palette first.** From Figma, a product screenshot, or a client style guide. Record primary surface, sidebar/deep surface, raised surface, text primary/secondary/muted, accent, destructive/success/warning/info. Resist starting with aiaiai's light palette and "inverting" — the legacy has its own hierarchy and inversion rarely matches.
2. **Lock surface hierarchy before anything else.** On dark, the default light-theme semantics invert:
   - `--color-surface-secondary` = DEEPEST (sidebar, wells)
   - `--color-surface` = mid (content canvas)
   - `--color-surface-tertiary` = LIGHTEST (raised cards, hover, chips)
   If `--card-bg` cascades from `--color-surface` (aiaiai default), cards will be invisible on the canvas — override `--card-bg` to `--color-surface-tertiary` **or** rely on border-only definition (Supabase pattern).
3. **Pick accent-as-text AND accent-as-fill separately, then verify contrast.** On light, one hex usually serves both roles. On dark, a saturated blue (`#1b57fd`) reads fine as a filled button but fails AA as body/link text. Decide which fidelity matters more:
   - (a) Keep the brand hex for both, accept axe failures (documented exception)
   - (b) Brighten the accent so one hex still serves both (UBP chose this — `#3d7bff`)
   - (c) Introduce a text-variant token — more precise, more plumbing
4. **Bump status colors to 400-shades for dark.** Light-theme 500s (`#dc2626`, `#16a34a`, `#ca8a04`) fail AA as text on their own tinted-alpha backgrounds. 400-shades (`#f87171`, `#4ade80`, `#fbbf24`) lift every pill to AA while keeping semantic meaning.
5. **Typography: alias `--type-*-font` explicitly if the theme uses a non-default font.** Some `--type-*-font` tokens resolve via a cascade that can surprise you (display pulled into a serif fallback when Hanken didn't load). Restate each `--type-*-font: var(--font-sans)` in the theme file to close the cascade.
6. **Patch the popover cascade bug.** `tokens/components.css` used to hardcode `--popover-bg: var(--raw-color-white)`. That was fixed with UBP (now `var(--color-surface)`), but verify no new component-level tokens bypass the semantic layer when you add this theme. `grep 'raw-color-white' tokens/components.css` should return zero.

## Gotchas we paid for (avoid these)

1. **Opacity-based muting breaks AA on dark.** A `.card-muted { opacity: 0.55 }` wrapper drops every nested token (text, chip, border) below AA contrast through multiplicative darkening. Replace opacity with **token swaps** — muted card = `--color-surface-secondary` bg + `--color-text-secondary` title + `--color-text-muted` desc. Same for muted rows.
2. **Tinted pill text on tinted bg is a contrast trap.** Chip uses `color: var(--color-destructive)` + `background: var(--color-destructive-subtle)`. On dark, this composites to red-on-dark-red, often 1.8:1. Fixed by moving all status colors to 400-shades where text is bright enough to read on its own subtle bg.
3. **`data-theme` on a wrapper `<div>` does NOT theme a sibling layout's sidebar.** Scoped theming only covers descendants. If your route lives inside a parent layout with its own sidebar/header, use `onMount` to push `data-theme` onto `document.documentElement` and restore on unmount. Confirmed with UBP's `+layout.svelte` in `site/src/routes/themes/ubp/`.
4. **Prerendered static output freezes `data-theme`.** With `@sveltejs/adapter-static` + `prerender = true`, every HTML file ships with the build-time default theme baked in. First-paint flashes the default theme before JS hydrates and swaps. Mitigation: inline a tiny `<script>` in `app.html` that reads cookie + URL pattern **before** the first paint. See `site/src/app.html` for the ~10-line pattern.
5. **Warm shadows vanish on dark surfaces.** aiaiai's default `--elevation-raised` uses `rgba(44, 40, 37, ...)` (brown tint) — invisible over `#161922`. Override to `rgba(0, 0, 0, 0.35-0.5)` for overlay shadows. For flat-ish elevation (cards), prefer border-first (Supabase pattern): a 1px `--color-border-strong` edge gives more definition than any shadow.
6. **Overlay token must also cool-tint.** `--color-overlay` has the same warm-on-dark-invisibility issue. Override to `rgba(5, 8, 14, 0.65)` so the backdrop actually darkens.
7. **Design-critic on thumbnail screenshots can misread tinted pills as solid fills.** Happened twice during UBP inner loop. Before reacting to "MAJOR: solid red fill" findings, **verify via computed styles** — a 5-line Playwright eval is much cheaper than an unnecessary iteration. Script template is in `site/tools/inspect.mjs`.

## Minimum viable dark theme — token checklist

Copy-paste starting point. Every `var(...)` reference must either cascade correctly from aiaiai defaults or be explicitly overridden here. Dark exceptions flagged `⚠`.

```css
[data-theme="mytheme-dark"] {
  /* Surfaces — hierarchy inversion */
  --color-surface: #...;              /* canvas */
  --color-surface-secondary: #...;    /* ⚠ DEEPER than surface */
  --color-surface-tertiary: #...;     /* raised (lighter than surface) */
  --color-overlay: rgba(...); /* ⚠ cool tint */

  /* Borders — visible but not loud on dark */
  --color-border: #...;
  --color-border-strong: #...;

  /* Text — never pure white; cream/off-white for warmth */
  --color-text: #...;
  --color-text-secondary: #...;       /* must be >= 4.5:1 on surface */
  --color-text-muted: #...;           /* >= 4.5:1 OR restrict to non-essential */
  --color-text-on-accent: #ffffff;    /* ⚠ pure white OK on saturated accent */

  /* Accent — single hex serving both fill and text OR split */
  --color-accent: #...;               /* ⚠ must be >= 4.5:1 on surface if used as text */
  --color-accent-hover: #...;
  --color-accent-subtle: rgba(...);

  /* Status — 400-family for dark-surface pill text legibility */
  --color-destructive: #f87171;
  --color-destructive-hover: #ef4444;
  --color-destructive-subtle: rgba(248, 113, 113, 0.15);
  --color-success: #4ade80;
  --color-success-subtle: rgba(74, 222, 128, 0.15);
  --color-warning: #fbbf24;
  --color-warning-subtle: rgba(251, 191, 36, 0.15);
  --color-info: #60a5fa;
  --color-info-subtle: rgba(96, 165, 250, 0.15);

  /* Typography — restate font tokens to close cascade */
  --font-sans: "YourFont Variable", "YourFont", sans-serif;
  --font-mono: "YourFont Variable", "YourFont", sans-serif;
  --type-display-font: var(--font-sans);
  --type-heading-lg-font: var(--font-sans);
  --type-heading-font: var(--font-sans);
  --type-heading-sm-font: var(--font-sans);
  --type-body-font: var(--font-sans);
  --type-body-sm-font: var(--font-sans);
  --type-caption-font: var(--font-sans);

  /* Elevation — cool shadows, borders for crisp edges */
  --elevation-border: var(--border-width) solid var(--color-border);
  --elevation-border-strong: var(--border-width) solid var(--color-border-strong);
  --elevation-raised: 0 1px 2px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.35);
  --elevation-overlay: 0 4px 16px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.4);

  /* Cards — raised hierarchy */
  --card-bg: var(--color-surface-tertiary);

  /* Badge neutral — explicit override so it doesn't blend with card bg */
  --badge-neutral-bg: #...; /* slightly elevated from surface-tertiary */

  /* Nav section title case — uppercase is aiaiai default; some voices
     (municipal, editorial) want Title Case. Override to "none" to keep
     the Hanken SemiBold section headers in their natural case. */
  --nav-section-transform: none;
}
```

## Verification gates

After writing the theme:

1. **`npm run lint:tokens`** — zero violations. No raw px/rem in theme-consuming CSS.
2. **`npm test -- tests/<theme>/a11y.spec.ts`** — axe scan at 1440 viewport, fail on serious+.
3. **Visual baselines** — `npm run test:update` once, then future runs protect the theme.
4. **Manual dark checklist** in `reference/theming.md` § "Dark-specific verification additions".

## Meta-lesson

The first dark theme costs more than subsequent ones because it discovers latent system-level assumptions. UBP found:
- Popover hardcoded to `--raw-color-white` (patched forward for all themes)
- Warm shadow primitives that don't cascade through elevation tokens
- aiaiai's `--color-accent` serving dual fill+text roles on light, which breaks on dark
- Opacity-based muting pattern that breaks WCAG on any dark surface

Every future dark theme inherits these fixes. If you hit a NEW system-level assumption during your theme, patch it at the component-token or base layer (not the theme) and add a line to this playbook.
