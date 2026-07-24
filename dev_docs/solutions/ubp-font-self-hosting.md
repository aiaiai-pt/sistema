# UBP Theme — Font Pairing Decision Record

**Issue:** DS-H0 #66 — UBP theme implementation
**Decision gate:** DS-H0 #68 (font pair, weights, license, fallback, self-hosting contract)
**Recorded:** 2026-07-24
**Status:** DECIDED — option (a) inherit DS pairing

---

## Decision

The UBP theme **inherits Sistema's own type pairing unchanged.**
No `--font-sans` or `--font-mono` override appears in `tokens/themes/ubp.css`.
Font role-tokens (`--type-label-font`, `--type-data-font`, `--button-font`, …)
resolve through `semantic.css` inheritance to the DS defaults.

The `tokens/themes/ubp.css` theme block sets zero font tokens.
The contrast test (`tests/ubp-theme-contrast.test.ts`) asserts
`ubpTokens.has("--font-sans") === false` to lock this decision in.

---

## Sans role — Instrument Sans

| Field | Value |
|-------|-------|
| Family | Instrument Sans |
| Source | `@fontsource/instrument-sans` (npm, no CDN required) |
| Weights shipped by DS site | 400 · 500 · 600 |
| License | **SIL Open Font License 1.1** — permissive, free to self-host, redistribute, embed |
| Fallback chain | `"Instrument Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` (declared in `base.css --raw-font-sans`) |
| Self-hosting pattern | Import weight files from `@fontsource/instrument-sans` before the DS token layers; no `@font-face` in the theme CSS (host responsibility) |
| CLS prevention | `font-display: swap` (fontsource default); declare before first paint via `<link rel="preload">` or SvelteKit `load` |

**Roles using sans:** display, heading, body, caption, overline, label, button labels.

---

## Mono role — JetBrains Mono (shipped) / Berkeley Mono (licensed separately)

| Field | Value |
|-------|-------|
| Token stack | `"Berkeley Mono", "JetBrains Mono", ui-monospace, monospace` (from `base.css --raw-font-mono`) |
| **Shipped face** | **JetBrains Mono** — the only face installed via npm (`@fontsource/jetbrains-mono`) |
| Berkeley Mono status | Named first in the token stack as the preferred premium face; **no `@font-face` ships in this repo** — commercial license required, no npm package available. The DS site itself renders JetBrains Mono. See sistema #82 for the DS-level Berkeley decision. |
| JetBrains Mono license | **SIL Open Font License 1.1** — free to self-host and embed |
| Weights shipped by DS site | 400 |
| Fallback chain | `"Berkeley Mono", "JetBrains Mono", ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace` |
| Self-hosting pattern | Import from `@fontsource/jetbrains-mono` before DS token layers |

**Roles using mono:** `--type-data-font` (numbers, metrics, times, code),
`--type-overline-font`. All DataTable values, StatCard values, Input values,
breadcrumb references, and timestamps in the specimen page render in this face.

---

## Fallback behaviour on the DS docs site

The site imports both faces via fontsource in `site/src/app.css`:

```css
@import "@fontsource/instrument-sans/400.css";
@import "@fontsource/instrument-sans/500.css";
@import "@fontsource/instrument-sans/600.css";
@import "@fontsource/jetbrains-mono/400.css";
```

Berkeley Mono is not imported. Consumers who hold a Berkeley Mono license may
add it ahead of JetBrains Mono in their own `@font-face` declarations; the token
stack will prefer it automatically.

---

## Self-hosting pattern for consumers

No font-face declarations belong in the theme CSS. The host imports the npm
packages and optionally adds Berkeley Mono if licensed:

```css
/* Host global stylesheet — before DS token imports */
@import "@fontsource/instrument-sans/400.css";
@import "@fontsource/instrument-sans/500.css";
@import "@fontsource/instrument-sans/600.css";
@import "@fontsource/jetbrains-mono/400.css";
/* Optional: if you hold a Berkeley Mono license: */
/* @font-face { font-family: "Berkeley Mono"; src: url("/fonts/BerkeleyMono.woff2") format("woff2"); font-weight: 400; font-display: swap; } */

@import "@aiaiai-pt/design-system/tokens/base.css";
@import "@aiaiai-pt/design-system/tokens/semantic.css";
@import "@aiaiai-pt/design-system/tokens/components.css";
@import "@aiaiai-pt/design-system/tokens/themes/ubp.css";
```

---

## SvelteKit pre-paint (no FOUC)

Stamp both `data-theme` and `data-scheme` before first paint in `hooks.server.ts`:

```typescript
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const theme = event.cookies.get("theme") ?? "ubp";
  const scheme = event.cookies.get("scheme") ?? "dark"; // UBP workspace default

  return resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace(
        '<html lang="pt">',
        `<html lang="pt" data-theme="${theme}" data-scheme="${scheme}">`,
      ),
  });
};
```

Never write `data-scheme="auto"` — resolve `prefers-color-scheme` on the server
and stamp the explicit result (`"light"` or `"dark"`).

---

## What was ruled out

| Option | Reason ruled out |
|--------|-----------------|
| Inter Variable (previous direction) | Operator decision 2026-07-24: UBP inherits DS pairing. Inter would diverge from the DS font system and require a separate license/self-hosting setup in every consumer host. |
| Custom mono for UBP | Not needed — JetBrains Mono reads as an instrument face; distinguishing UBP from aiaiai studio is the colour/surface story, not the typeface. |
| Google Fonts runtime CDN | Prohibited by DS convention; no `fonts.googleapis.com` reference anywhere in the token layer. |

---

## Scaffold-face rule (resolved)

The DS-H0 brief required the "scaffold face" decision to be explicit rather than
silently final. This record satisfies that requirement: the scaffold face
(Instrument Sans) is deliberately kept as the UBP display/body face via
inheritance, not by omission.
