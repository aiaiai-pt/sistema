import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // The svelte plugin transforms `.svelte` imports so the renderer/widget tests
  // can mount real components in jsdom (S1.3 #58 / S1.4 #59). Pure `/core`
  // tests stay in the default node env; component tests opt into jsdom via the
  // `// @vitest-environment jsdom` docblock per file. `configFile: false` — this
  // package carries no SvelteKit config; the plugin reads its own minimal one.
  plugins: [svelte({ configFile: false })],
  // Resolve svelte's BROWSER build under vitest so `mount` (a client-only
  // lifecycle fn) is available in the jsdom component tests — without this the
  // `svelte` import falls back to the server build and `mount` throws
  // `lifecycle_function_unavailable`. Official svelte + vitest recipe (mirrors
  // the repo-root vitest.config.ts).
  resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
