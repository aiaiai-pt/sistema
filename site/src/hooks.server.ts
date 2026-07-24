import type { Handle } from "@sveltejs/kit";

const VALID_THEMES = new Set(["aiaiai", "branded-example", "bespoke-example", "ubp"]);
const SCHEME_CAPABLE = new Set(["ubp"]);

export const handle: Handle = async ({ event, resolve }) => {
  const theme = event.cookies.get("theme") || "aiaiai";
  const safeTheme = VALID_THEMES.has(theme) ? theme : "aiaiai";

  // Scheme: only applied for scheme-capable themes to avoid polluting others.
  // "auto" is never written here — consumers resolve prefers-color-scheme before
  // paint and stamp the resolved value ("light" or "dark"), never "auto".
  const scheme = event.cookies.get("scheme");
  const safeScheme = scheme === "dark" && SCHEME_CAPABLE.has(safeTheme) ? "dark" : null;

  const schemeAttr = safeScheme ? ` data-scheme="${safeScheme}"` : "";

  return resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace(
        '<html lang="en">',
        `<html lang="en" data-theme="${safeTheme}"${schemeAttr}>`,
      );
    },
  });
};
