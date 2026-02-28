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
  },
};

export default config;
