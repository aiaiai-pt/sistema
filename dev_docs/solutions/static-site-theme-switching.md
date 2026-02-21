# Static Site Theme Switching (SvelteKit + Prerender)

**Context:** Theme switcher on a statically prerendered SvelteKit site. Server hooks don't run at request time with `prerender = true`.

## Problem

With `@sveltejs/adapter-static` and `prerender = true`, the `handle` hook in `hooks.server.ts` runs once at build time (no cookies available). The generated HTML always has `data-theme="default"`. On subsequent visits, the server never runs again to read the cookie.

## Solution

Read the cookie client-side in `initTheme()` instead of relying on the server-injected `data-theme` attribute:

```ts
export function initTheme() {
  const match = document.cookie.match(/(?:^|;\s*)theme=([^;]+)/);
  const cookieTheme = match?.[1];
  if (cookieTheme && THEMES.includes(cookieTheme as Theme)) {
    current = cookieTheme as Theme;
    document.documentElement.setAttribute("data-theme", cookieTheme);
  } else {
    // Fall back to whatever the server hook set during prerender
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr && THEMES.includes(attr as Theme)) {
      current = attr as Theme;
    }
  }
}
```

### Trade-offs

- **Flash of default theme (FODT):** On first paint, the HTML has `data-theme="aiaiai"`. JavaScript swaps to the saved theme after hydration. This is a brief flash (~50-100ms).
- **Acceptable for docs sites.** For production apps, use a non-static adapter (Node, Cloudflare Workers) where the server hook runs on every request.
- **The server hook is still useful** for the build-time render and as documentation of the intended server-side approach.

### Cookie format

```
theme=bespoke-example;path=/;max-age=31536000;samesite=lax
```

Written by `setTheme()`, read by `initTheme()`. No httpOnly (needs JS access).
