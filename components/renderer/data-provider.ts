/**
 * DataProvider — the host-injected data transport seam (#492 P0).
 *
 * Each host (portal, admin) owns its own DataProvider. The portal constructs a
 * `createPublicDataProvider` that routes through the auth-optional `/bff` proxy.
 * A future admin host constructs its own provider over the RLS-authenticated
 * entity-proxy lane. `resolveData` depends only on this interface, never on
 * the proxy prefix or the tenant/app segment directly.
 */

import type { Binding } from "./types";
import type { FetchLike } from "./resolve-data";
import type { VoteReadConfig } from "./vote";
import {
  bffPathForBinding,
  schemaPathForBinding,
  appendQuery,
} from "./resolve-data";
import { editionReadPath, optionsReadPath } from "./vote";

export interface DataUrlOpts {
  /** Calendar window injected from `now` (73e) — applied only for the `calendar` kind. */
  calendarWindow?: { start: string; end: string };
  /** URL facet/search params forwarded from the page URL (#308) — applied for `list`/`map`. */
  filterParams?: Record<string, string>;
}

/**
 * SECURITY INVARIANT (never remove this comment):
 * Each host owns its own DataProvider and its own security boundary. The
 * portal's DataProvider routes through the public /bff proxy (auth-optional,
 * SSRF-pinned to /{app}/public/). A future admin DataProvider routes through
 * the RLS-authenticated entity-proxy lane. NEVER share one transport across
 * both hosts. NEVER let a public widget read through an authed token, nor
 * expose the authed lane through the public proxy. A "simplification" that
 * collapses the two providers is a tenant/RLS leak.
 */
export interface DataProvider {
  /**
   * The raw data path for the binding, with calendar window and filter params
   * applied. Returns `null` for unmappable bindings (caller fails closed).
   * The path is the PAGEABLE surface: widgets re-fetch it client-side with
   * `?after=` for "load more". It does NOT include the proxy prefix — the
   * provider's `fetch` adds the prefix on the outbound call.
   */
  dataUrl(binding: Binding, opts?: DataUrlOpts): string | null;

  /**
   * The entity schema path for the binding. Returns `null` for kinds that
   * carry no schema (content, map, calendar, …). The path does NOT include
   * the proxy prefix.
   */
  schemaUrl(binding: Binding): string | null;

  /**
   * The authed account lane URL for the given path segment.
   * Returns `/me/{segment}` — NO `/bff` prefix. This is a different security
   * boundary (require_auth + OWN-scoped) from the public `/bff` surface.
   */
  accountUrl(segment: string): string;

  /**
   * The option-view read URL (for subscription scope dropdowns, #252).
   * Returns the FULL URL including the proxy prefix.
   */
  optionViewUrl(view: string, limit: number): string;

  /** Edition read path for the `vote` ballot composer. Full URL. */
  voteEditionUrl(cfg: VoteReadConfig, editionId: string): string;

  /** Options read path for the `vote` ballot composer. Full URL. */
  voteOptionsUrl(cfg: VoteReadConfig, editionId: string): string;

  /** The fetch transport. Accepts any URL returned by the methods above. */
  fetch: FetchLike;
}

function enc(value: string): string {
  return encodeURIComponent(value);
}

/**
 * Construct the portal's public DataProvider.
 *
 * Reproduces today's `resolveData` URL behavior byte-for-byte:
 *   - `dataUrl` / `schemaUrl` return the raw `/{app}/public/...` path (no
 *     `/bff` prefix). The provider's `fetch` adds `/bff` on the outbound call
 *     so the raw path is also the pageable `dataPath` the widgets store.
 *   - `accountUrl` returns `/me/{segment}` — the authed lane, never proxied
 *     through `/bff`. The provider's `fetch` passes `/me/...` through as-is.
 *   - `optionViewUrl`, `voteEditionUrl`, `voteOptionsUrl` return the full URL
 *     already including `/bff`. The provider's `fetch` passes them through.
 *
 * The `fetch` wrapper decides by prefix: `/bff/` and `/me/` are passed
 * through unchanged; anything else (raw `/{app}/public/...` paths) gets
 * `/bff` prepended. This keeps the `fetch` self-contained in the provider —
 * `resolveData` never sees or constructs a proxy prefix.
 */
export function createPublicDataProvider(
  app: string,
  fetchImpl: FetchLike,
): DataProvider {
  /**
   * Portal fetch transport. Paths that already carry their proxy prefix
   * (`/bff/...` for the public lane, `/me/...` for the authed account lane)
   * are forwarded unchanged. Raw `/{app}/public/...` paths (returned by
   * `dataUrl` and `schemaUrl`) are proxied through `/bff`.
   */
  const fetch: FetchLike = (url: string) => {
    if (url.startsWith("/bff/") || url.startsWith("/me/")) {
      return fetchImpl(url);
    }
    return fetchImpl(`/bff${url}`);
  };

  return {
    dataUrl(binding: Binding, opts?: DataUrlOpts): string | null {
      const path = bffPathForBinding(binding, app);
      if (path === null) return null;
      let url = path;
      // Calendar requires start/end (73e); the window is pre-computed in
      // resolveData from `now` and passed in via opts.
      if (binding.kind === "calendar" && opts?.calendarWindow) {
        const { start, end } = opts.calendarWindow;
        url = `${path}?start=${start}&end=${end}`;
      }
      // Forward URL facet/search params (#308) for list + map feeds so the
      // SSR result is server-FILTERED. The BFF drops undeclared params.
      if (
        (binding.kind === "list" || binding.kind === "map") &&
        opts?.filterParams
      ) {
        url = appendQuery(url, opts.filterParams);
      }
      return url;
    },

    schemaUrl(binding: Binding): string | null {
      return schemaPathForBinding(binding, app);
    },

    accountUrl(segment: string): string {
      return `/me/${segment}`;
    },

    optionViewUrl(view: string, limit: number): string {
      return `/bff/${enc(app)}/public/${enc(view)}?limit=${limit}`;
    },

    voteEditionUrl(cfg: VoteReadConfig, editionId: string): string {
      // Delegates to the unchanged vote.ts helper — guarantees byte-identical
      // vote URLs (vote.ts must NOT be modified, spec §P0).
      return editionReadPath(app, cfg, editionId);
    },

    voteOptionsUrl(cfg: VoteReadConfig, editionId: string): string {
      return optionsReadPath(app, cfg, editionId);
    },

    fetch,
  };
}
