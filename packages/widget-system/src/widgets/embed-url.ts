/**
 * Presentation-layer URL sanitisation for the embedded-analysis widget
 * (S1.4 #59).
 *
 * The embedded-analysis widget accepts an ALREADY-authorized, short-lived URL
 * (the caller signs/proxies it — the widget knows no signer, grant, resource
 * id, or tenant). This helper is the widget's own last-line defence: it admits
 * only an http(s) absolute URL or a root-relative path, so a malformed or
 * hostile `props.src` (`javascript:`, `data:`, `vbscript:`, a protocol-relative
 * `//host`) can never reach the iframe `src`. It performs NO authorisation —
 * that is the host's job and explicitly out of this package's scope.
 *
 * Pure and framework-neutral.
 */

/**
 * Return `url` when it is a safe embed source, else `null`.
 *
 * Accepted:
 *  - absolute `http:` / `https:` URLs (e.g. a signed Metabase embed URL);
 *  - root-relative paths (`/internal/…`) — same-origin host proxy routes.
 *
 * Rejected: everything else, including `javascript:`/`data:`/`blob:`/`file:`
 * schemes, protocol-relative `//host` (scheme-inheriting), non-strings, and
 * empty/whitespace values.
 */
export function safeEmbedSrc(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (trimmed === "") return null;

  // Root-relative path (same-origin proxy route). Reject protocol-relative
  // `//host` — it inherits the page scheme and points off-origin.
  if (trimmed.startsWith("/")) {
    return trimmed.startsWith("//") ? null : trimmed;
  }

  // Absolute URL — admit only http/https. `new URL` parses the scheme robustly
  // (handles case, whitespace-in-scheme, and embedded control characters that a
  // naive `startsWith` check would miss).
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? trimmed
      : null;
  } catch {
    return null;
  }
}
