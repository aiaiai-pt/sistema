import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $ui: path.resolve(__dirname, "../components"),
      // The widget-system package renders over Sistema visual components via the
      // `@aiaiai-pt/design-system` peer. In-repo, the DS is the ROOT package (not
      // a workspace member), so it is not symlinked under node_modules by name —
      // alias its components subpath to the repo-root `components/` dir (same
      // posture as `$ui`). A real consumer installs the DS as a peer instead.
      "@aiaiai-pt/design-system/components": path.resolve(__dirname, "../components"),
    },
  },
});
