import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const theme = event.cookies.get("theme") || "aiaiai";

  return resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace(
        '<html lang="en">',
        `<html lang="en" data-theme="${theme}">`,
      );
    },
  });
};
