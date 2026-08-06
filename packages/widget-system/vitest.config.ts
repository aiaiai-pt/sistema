import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

// NO design-system alias here, deliberately. The widgets import
// `@aiaiai-pt/design-system/components/…` by NAME and resolve it the same way a
// consumer does, via the `file:../..` devDependency npm links at the repo root.
//
// An alias used to stand in for that link. It made these tests pass while any
// LINKED consumer — the atelier lanes, every worktree override — failed to
// resolve the design system at all, because the alias exists only in this
// config. Test tooling that papers over a resolution gap hides exactly the
// defect it should surface, so the link is real now and the alias is gone.

export default defineConfig({
  // The svelte plugin transforms `.svelte` imports so the renderer/widget tests
  // can mount real components in jsdom (S1.3 #58 / S1.4 #59). Pure `/core`
  // tests stay in the default node env; component tests opt into jsdom via the
  // `// @vitest-environment jsdom` docblock per file. `configFile: false` — this
  // package carries no SvelteKit config; the plugin reads its own minimal one.
  plugins: [svelte({ configFile: false })],
  resolve: {
    // Resolve svelte's BROWSER build under vitest so `mount` (a client-only
    // lifecycle fn) is available in the jsdom component tests — without this the
    // `svelte` import falls back to the server build and `mount` throws
    // `lifecycle_function_unavailable`. Official svelte + vitest recipe (mirrors
    // the repo-root vitest.config.ts).
    conditions: process.env.VITEST ? ["browser"] : [],
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
