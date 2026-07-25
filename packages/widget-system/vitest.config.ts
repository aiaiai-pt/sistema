import { resolve } from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

// The Sistema design system is this monorepo's ROOT package
// (@aiaiai-pt/design-system) — it is not a workspace MEMBER, so npm does not
// symlink it under node_modules by name. A real consumer installs it as a peer
// and resolves it normally; here in-repo the test harness aliases the
// components subpath to the repo-root `components/` dir (the same posture the
// docs site uses with its `$ui` alias). The published widget SOURCE keeps the
// clean `@aiaiai-pt/design-system/components/…` import — only this test tooling
// needs the alias.
const DS_COMPONENTS = resolve(__dirname, "../../components");

export default defineConfig({
  // The svelte plugin transforms `.svelte` imports so the renderer/widget tests
  // can mount real components in jsdom (S1.3 #58 / S1.4 #59). Pure `/core`
  // tests stay in the default node env; component tests opt into jsdom via the
  // `// @vitest-environment jsdom` docblock per file. `configFile: false` — this
  // package carries no SvelteKit config; the plugin reads its own minimal one.
  plugins: [svelte({ configFile: false })],
  resolve: {
    alias: {
      "@aiaiai-pt/design-system/components": DS_COMPONENTS,
    },
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
