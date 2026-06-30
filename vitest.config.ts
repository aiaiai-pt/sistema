import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // The svelte plugin transforms `.svelte` imports so component-render tests
  // (e.g. tests/renderer-chart-components.test.ts) can `mount` a component in a
  // jsdom env. Pure-function tests stay in the default `node` env (this repo's
  // SvelteKit `svelte.config.js` carries only a `kit.files.lib` alias, which is
  // irrelevant here, so the plugin reads its own minimal config).
  plugins: [svelte({ configFile: false })],
  // Resolve svelte's BROWSER build under vitest so `mount` (a client-only
  // lifecycle fn) is available in the jsdom component tests — without this the
  // `svelte` import falls back to the server build and `mount` throws
  // `lifecycle_function_unavailable`. Official svelte+vitest recipe.
  resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
  test: {
    include: ["tests/**/*.test.ts"],
    // Default env is node; component tests opt into jsdom per-file via the
    // `// @vitest-environment jsdom` docblock so they get a real DOM to render
    // into without forcing the whole suite into a browser-like env.
    environment: "node",
  },
});
