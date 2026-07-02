import adapter from "@sveltejs/adapter-static";
import { mdsvex } from "mdsvex";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ".svx"],
  preprocess: [mdsvex()],
  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: undefined,
      precompress: true,
      strict: true,
    }),
    alias: {
      $ui: path.resolve(__dirname, "../components"),
    },
    prerender: {
      // Component demo pages render nav/link components with REALISTIC hrefs
      // (/ocorrencias, /participacao/…) that are demo DATA, not site routes —
      // the crawler must not fail the build on them. Scoped to demo-page
      // referrers so a genuinely broken link in the docs still fails loudly.
      handleHttpError: ({ status, referrer, message }) => {
        if (status === 404 && referrer?.startsWith("/components/")) return;
        throw new Error(message);
      },
      // Same posture for in-page anchors: demo markup ships fragment hrefs
      // (#brand …) that are illustrative, not a demo-page table of contents.
      handleMissingId: ({ path, message }) => {
        if (path.startsWith("/components/")) return;
        throw new Error(message);
      },
    },
  },
};

export default config;
