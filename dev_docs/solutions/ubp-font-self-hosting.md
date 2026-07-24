# UBP Theme — Inter Variable Font Self-Hosting Guide

DS-H0 #66 | Updated: 2026-07-23

---

## Chosen typeface: Inter Variable

| Property | Value |
|----------|-------|
| Family | Inter Variable |
| Weights | 400 (regular) · 500 (medium) · 600 (semibold) |
| License | SIL Open Font License 1.1 — self-hosting permitted, no attribution required in UI |
| Fallback chain | `system-ui, -apple-system, BlinkMacSystemFont, sans-serif` |
| Source | <https://rsms.me/inter/> · GitHub: `rsms/inter` |
| npm | `@fontsource-variable/inter` |

Inter Variable is the typeface for the UBP theme. It is optimised for screen
readability at small sizes — critical for map labels, data tables, and
chart annotations. The full variable axis (wght 100–900) is available in a
single woff2 file (`InterVariable.woff2`), eliminating multiple weight requests.

**No Google Fonts runtime dependency is permitted.** The theme file
(`tokens/themes/ubp.css`) only sets `--font-sans: "Inter", system-ui, ...`.
Font-face declarations belong in the consumer host, not the design system.

---

## Why self-hosting

The workspace operates in environments that may have no external network access
(air-gapped tenants, controlled government networks). A runtime `fonts.googleapis.com`
dependency would silently fail in those environments and cause user-visible layout
shift. Self-hosting via the npm package avoids this.

---

## Self-hosting options

### Option A: npm package (recommended)

```bash
npm install @fontsource-variable/inter
# or
pnpm add @fontsource-variable/inter
```

```css
/* In your host's global stylesheet, BEFORE importing the DS token files */
@import "@fontsource-variable/inter";

/* Then import DS tokens */
@import "@aiaiai-pt/design-system/tokens/base.css";
@import "@aiaiai-pt/design-system/tokens/semantic.css";
@import "@aiaiai-pt/design-system/tokens/components.css";
@import "@aiaiai-pt/design-system/tokens/themes/ubp.css";
```

The `@fontsource-variable/inter` package provides a `woff2` file colocated with
the CSS import — no CDN request, no external dependency.

### Option B: manually downloaded woff2

Download `InterVariable.woff2` from <https://github.com/rsms/inter/releases>.
Place it in your `public/fonts/` directory and declare:

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/InterVariable.woff2") format("woff2");
  font-weight: 100 900; /* full axis */
  font-style: normal;
  font-display: swap;   /* show fallback immediately, swap when ready */
}
```

---

## Preventing layout shift (CLS)

The declared fallback chain (`system-ui, -apple-system, BlinkMacSystemFont,
sans-serif`) resolves to San Francisco (macOS/iOS), Segoe UI (Windows), and
Roboto (Android) — all near-metric-compatible with Inter.

To eliminate residual shift on initial load, add `size-adjust` in the
`@font-face` fallback. Measure the offset with <https://screenspan.net/fallback>
or the `Font Style Matcher` tool. A typical Inter→system-ui adjustment is
`size-adjust: 100%` (no change) because the metrics are already close.

Use `font-display: swap` (or `optional` for non-critical text) so layout is
never blocked waiting for the web font.

---

## SvelteKit server-side resolution (no FOUC)

Apply the theme and scheme before first paint using `hooks.server.ts`:

```typescript
// src/hooks.server.ts
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const theme = event.cookies.get("theme") ?? "ubp";
  const scheme = event.cookies.get("scheme") ?? "dark"; // UBP default

  return resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace(
        '<html lang="pt">',
        `<html lang="pt" data-theme="${theme}" data-scheme="${scheme}">`,
      ),
  });
};
```

This eliminates the flash of unstyled content (FOUC) on initial navigation.
Never write `data-scheme="auto"` — resolve `prefers-color-scheme` on the server
and stamp the result (`"light"` or `"dark"`).

---

## Verification checklist

Before shipping a UBP-themed host:

- [ ] `ubp.css` is imported after the DS token stack (base → semantic → components → ubp)
- [ ] `@font-face` for Inter is declared before `ubp.css` (or loaded via the npm package)
- [ ] No `fonts.googleapis.com` or `fonts.gstatic.com` URL in the host's CSS
- [ ] `font-display: swap` (or `optional`) is set in `@font-face`
- [ ] The server hook stamps both `data-theme` and `data-scheme` before paint
- [ ] Contrast verified: `--color-text-secondary` on `--color-surface` ≥4.5:1 in all combinations
- [ ] `@aiaiai-pt/design-system` version pinned to the DS-H0 release
