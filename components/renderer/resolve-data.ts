/**
 * `resolveData(block)` — the single data path between a block's pointer and a
 * widget (#73, spec §5). Reads the `binding`, fetches through the host-injected
 * `DataProvider` (#492 P0), and returns normalised `{ schema, data, actionDef }`.
 * The block stores ONLY the pointer — rows are never baked in.
 *
 * Pure + provider-injectable so the security-critical decisions (which paths are
 * reachable, fail-closed on misconfig/upstream error) are unit/mutation-
 * testable without SvelteKit. The route loader is a thin wrapper that passes a
 * `createPublicDataProvider` wrapping its server `fetch` (which carries the
 * tenant + graduated principal).
 *
 * Fail-closed (§14.8): an unmappable binding never fetches; a non-OK upstream
 * yields `{ ok: false }` and the caller renders per blast radius (see
 * `decideRender` in `./dispatch.ts`).
 */
import type {
  Binding,
  Block,
  FeedView,
  OntologySchema,
  WidgetKind,
} from "./types";
import type { DataProvider } from "./data-provider";
import { type Ballot, isClosed, toOptions, voteReadConfig } from "./vote";

/**
 * Presentational kinds (#75 M5 hero/lookup + #105 Phase 7 landing/content) that
 * render PURELY from their block props — no data path, no fetch. resolveData
 * short-circuits them with `{ data: null }`, which still satisfies decideRender's
 * "matched + dataOk" contract (the widget owns its own props). Keeping them in
 * one set means a new content section never accidentally tries to fetch.
 */
export const PRESENTATIONAL_KINDS: ReadonlySet<WidgetKind> =
  new Set<WidgetKind>([
    "hero",
    "lookup",
    // #517 — the Metabase embed renders from a host-resolved `props.src`; it has
    // no DS-fetched data path, so short-circuit it like the other content kinds.
    "embed",
    "feature-grid",
    "cta",
    "media-text",
    "steps",
    "testimonial",
    "faq",
    "logo-strip",
    "media-gallery",
  ]);

export interface ResolvedData {
  data: unknown;
  /** Ontology schema for the bound entity — wired in 73d. */
  schema: OntologySchema | null;
  /** Action definition for form bindings — wired in 73f. */
  actionDef: unknown | null;
  /** The BFF path the data came from (#75 M5 slice 4) — widgets that page
   *  (list "load more") re-fetch it client-side with `?after=`. */
  dataPath?: string;
}

export type ResolveDataResult =
  | { ok: true; value: ResolvedData }
  | { ok: false; status: number; reason: string };

/** The minimal fetch shape we depend on (injectable; SvelteKit `fetch` fits). */
export type FetchLike = (path: string) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

export interface ResolveDataDeps {
  /** Host-injected data transport seam (#492 P0). */
  provider: DataProvider;
  /**
   * "Now", injected by the route loader (`new Date()`), used to compute the
   * calendar's required `start`/`end` window (73e). Optional — only the
   * `calendar` kind reads it. Injected (not read here) so the path stays
   * deterministic in tests.
   */
  now?: Date;
  /**
   * The active feed view (`?view=` — #308), used only by the `feed` kind to
   * pick which underlying feed (list/map) to resolve. Absent → the block's
   * first configured view.
   */
  view?: string;
  /**
   * The URL's facet/search params (#308), forwarded to a feed read so the SSR
   * feed is server-FILTERED (and paging rides `dataPath`). The BFF drops any
   * param it doesn't declare (its security contract), so the whole set is safe
   * to pass. Reserved keys (`view`, `reference`) are stripped by the loader.
   */
  filterParams?: Record<string, string>;
}

function enc(value: string): string {
  return encodeURIComponent(value);
}

/** The feed sub-views a `feed` block may toggle between (#308). Bounds the
 *  operator-authored `props.views` to a known allowlist; an empty/invalid list
 *  falls back to `["list"]` (every browse surface has a list). */
const FEED_VIEW_ALLOWLIST: readonly FeedView[] = ["list", "map"];

export function feedViews(
  props: Record<string, unknown> | undefined,
): FeedView[] {
  const raw = props?.views;
  const parsed = Array.isArray(raw)
    ? raw.filter((v): v is FeedView =>
        (FEED_VIEW_ALLOWLIST as readonly string[]).includes(v as string),
      )
    : [];
  return parsed.length > 0 ? parsed : ["list"];
}

/** The active view = the requested one when it's an available view, else the
 *  default (first). Keeps `?view=` shareable + an unknown value harmless. */
export function activeFeedView(
  views: FeedView[],
  requested: string | undefined,
): FeedView {
  return requested && (views as string[]).includes(requested)
    ? (requested as FeedView)
    : views[0];
}

/** Merge facet/search params into a BFF path (handles an existing `?`). Empty
 *  values drop; an empty param set returns the path unchanged. */
export function appendQuery(
  path: string,
  params: Record<string, string> | undefined,
): string {
  if (!params) return path;
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (entries.length === 0) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${new URLSearchParams(entries).toString()}`;
}

/**
 * Pure mapping: pointer → BFF public path (#70 surface, app-first). Returns
 * `null` for any binding that doesn't map to a wired read endpoint — the
 * caller fails closed (no fetch, no DOM). `binding.filter` carries the
 * per-route selector (ref/key/id) for the single-resource kinds.
 */
export function bffPathForBinding(
  binding: Binding,
  app: string,
): string | null {
  switch (binding.kind) {
    case "list": {
      if (!binding.entity) return null;
      // Optional list scope (#75 M5): cap + ordering ride the query string.
      // The BFF shape-sanitises `order_by` (drops malformed values whole)
      // and clamps `limit`; both are plain passthrough params here.
      const params = new URLSearchParams();
      if (typeof binding.limit === "number" && binding.limit > 0) {
        params.set("limit", String(Math.floor(binding.limit)));
      }
      if (typeof binding.order === "string" && binding.order) {
        params.set("order_by", binding.order);
      }
      const qs = params.toString();
      return `/${app}/public/${enc(binding.entity)}${qs ? `?${qs}` : ""}`;
    }
    case "aggregate": {
      // #105 Phase 4 — a public aggregate VIEW's rows as primary data. Same
      // public-list URL as a `list` (the BFF routes to the view lane off the
      // surface row's `source_kind: view`, #250 M3), but a distinct kind so the
      // registry dispatches RankingBoard/ResultsChart (which read `{label,
      // value}` rows) instead of EntityList (which needs a per-type schema a
      // view doesn't have). `limit`/`order` ride the query string; the view's
      // sortable columns ARE its output columns, so the BFF drops undeclared
      // order terms.
      if (!binding.entity) return null;
      const params = new URLSearchParams();
      if (typeof binding.limit === "number" && binding.limit > 0) {
        params.set("limit", String(Math.floor(binding.limit)));
      }
      if (typeof binding.order === "string" && binding.order) {
        params.set("order_by", binding.order);
      }
      const qs = params.toString();
      return `/${app}/public/${enc(binding.entity)}${qs ? `?${qs}` : ""}`;
    }
    case "forms":
      // The service directory (#75 M5) — citizen-startable write placements.
      return `/${app}/public/forms`;
    case "detail": {
      if (!binding.entity || !binding.filter) return null;
      const base = `/${app}/public/${enc(binding.entity)}/${enc(binding.filter)}`;
      const names = (binding.expand ?? []).filter(
        (n): n is string =>
          typeof n === "string" && /^[a-z][a-z0-9_]*$/.test(n),
      );
      return names.length > 0 ? `${base}?expand=${enc(names.join(","))}` : base;
    }
    case "actions": {
      // #313 — citizen action availability for a detail row. Needs the entity
      // type + row id (carried like `detail`); the BFF projects which
      // citizen-write actions are OPEN on this row. No expand.
      if (!binding.entity || !binding.filter) return null;
      return `/${app}/public/${enc(binding.entity)}/${enc(binding.filter)}/actions`;
    }
    case "status":
      return binding.filter
        ? `/${app}/public/submission/${enc(binding.filter)}`
        : null;
    case "content":
      return binding.filter
        ? `/${app}/public/content/${enc(binding.filter)}`
        : null;
    case "map":
      return `/${app}/public/map`;
    case "calendar":
      return `/${app}/public/calendar`;
    case "form":
      // The action FORM contract, keyed by the citizen-write PLACEMENT key
      // (carried in `filter`). 73f — the converged renderer mounts this.
      return binding.filter
        ? `/${app}/public/form/${enc(binding.filter)}`
        : null;
    // kpi: no wired read endpoint yet. `vote` is handled in a dedicated
    // resolveData branch (two reads composed into a ballot), never here. Fail
    // closed for anything unmapped.
    default:
      return null;
  }
}

/**
 * Pure mapping: pointer → BFF public *schema* path (#73 / 73d). Only the
 * schema-driven kinds (`list`, `detail`) have one; the entity's field shape
 * (key/type/label) lets EntityList/DetailView render columns/fields without a
 * hardcoded entity-type union (§14.6). Returns `null` for every other kind, and
 * for list/detail without an entity. `binding.filter` (the detail row id) is
 * NOT part of the schema path — the schema is per *type*, not per row.
 */
export function schemaPathForBinding(
  binding: Binding,
  app: string,
): string | null {
  switch (binding.kind) {
    case "list":
    case "detail":
      return binding.entity
        ? `/${app}/public/schema/${enc(binding.entity)}`
        : null;
    default:
      return null;
  }
}

/**
 * The date window the `/public/calendar` fetch requires (73e). The endpoint
 * 422s without `start`/`end`, so the calendar block fetches a window computed
 * from the injected "now": the current month through two months out (covering
 * the default month view plus a buffer for next-month navigation). Pure given
 * `now`, computed in UTC so it doesn't drift with the server timezone.
 */
export function calendarWindow(now: Date): { start: string; end: string } {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 2, 1));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export async function resolveData(
  block: Block,
  deps: ResolveDataDeps,
): Promise<ResolveDataResult> {
  // Presentational kinds (#75 M5 hero/lookup + #105 Phase 7 landing/content):
  // they render purely from block props — no data path, no fetch. Resolving OK
  // with null data keeps decideRender's "matched + dataOk" contract without a
  // network round-trip.
  if (PRESENTATIONAL_KINDS.has(block.binding.kind)) {
    return {
      ok: true,
      value: { data: null, schema: null, actionDef: null },
    };
  }

  // #105 Phase 5 — the `subscriptions` block reads the signed-in citizen's OWN
  // notification subscriptions through the AUTHED account proxy
  // (`/me/notifications/subscriptions`), NOT the public `/bff` surface: the lane
  // is `require_auth` + OWN-scoped, so anonymous/unresolved-tenant calls 401/400
  // at the proxy. The page is auth-gated upstream (the loader redirects an
  // anonymous caller to login), so a non-OK here is a real upstream failure →
  // fail the block CLOSED (the widget owns its own busy/empty UI once data
  // loads). `dataPath` carries the lane so the widget mutates the same surface.
  if (block.binding.kind === "subscriptions") {
    const accountPath = deps.provider.accountUrl("notifications/subscriptions");
    const resp = await deps.provider.fetch(accountPath);
    if (!resp.ok) {
      return {
        ok: false,
        status: resp.status,
        reason: `upstream ${resp.status}`,
      };
    }
    const envelope = (await resp.json()) as Record<string, unknown>;

    // #252 Anexo 110 — per edition/category/freguesia toggles. Each declared
    // scope names a PUBLIC option-view + its value/label fields (DATA, no
    // civic literal here); we read each view and shape `{value,label}` options.
    // Soft per-dimension: a missing/failed view drops that section, never the
    // whole panel. The backend already matches a subscription's single-key
    // `filters` against the dispatch payload (#241), so enabling a toggle =
    // creating `{filters:{<key>:<value>}}`.
    const scopeDefs = Array.isArray(
      (block.props as { scopes?: unknown })?.scopes,
    )
      ? ((block.props as { scopes: unknown[] }).scopes as Record<
          string,
          unknown
        >[])
      : [];
    const sp = (o: Record<string, unknown>, k: string): string =>
      typeof o[k] === "string" ? (o[k] as string) : "";
    const scopes: {
      key: string;
      group: string;
      options: { value: string; label: string }[];
    }[] = [];
    for (const s of scopeDefs) {
      const key = sp(s, "key");
      const group = sp(s, "group");
      const view = sp(s, "view");
      const vf = sp(s, "value_field");
      const lf = sp(s, "label_field");
      if (!key || !group || !view || !vf || !lf) continue;
      try {
        const r = await deps.provider.fetch(
          deps.provider.optionViewUrl(view, 200),
        );
        if (!r.ok) continue;
        const rows = ((await r.json()) as { items?: Record<string, unknown>[] })
          .items;
        if (!Array.isArray(rows)) continue;
        const options = rows
          .map((row) => ({
            value: row[vf] == null ? "" : String(row[vf]),
            label: row[lf] == null ? String(row[vf] ?? "") : String(row[lf]),
          }))
          .filter((o) => o.value);
        if (options.length) scopes.push({ key, group, options });
      } catch {
        /* soft-empty this dimension */
      }
    }

    return {
      ok: true,
      value: {
        data: { ...envelope, scopes },
        schema: null,
        actionDef: null,
        dataPath: accountPath,
      },
    };
  }

  // #105 Phase 5 slice 2 — a `consent` block reads the signed-in citizen's OWN
  // RGPD state (`/me/consent`: the tenant's active consent purposes joined with
  // the caller's consent records) through the AUTHED account proxy, NOT the
  // public `/bff` surface. Same auth-gated, fail-closed posture as
  // `subscriptions` (the page loader redirects an anonymous caller to login).
  // `dataPath` carries the lane so the widget revokes/erases/exports against it.
  if (block.binding.kind === "consent") {
    const accountPath = deps.provider.accountUrl("consent");
    const resp = await deps.provider.fetch(accountPath);
    if (!resp.ok) {
      return {
        ok: false,
        status: resp.status,
        reason: `upstream ${resp.status}`,
      };
    }
    return {
      ok: true,
      value: {
        data: await resp.json(),
        schema: null,
        actionDef: null,
        dataPath: accountPath,
      },
    };
  }

  // #252 Anexo 110 — a `deliveries` block reads the signed-in citizen's OWN
  // notification HISTORY (`/me/notifications/deliveries`: require_auth +
  // OWN-scoped on recipient_user_id) through the AUTHED account proxy. The
  // `notification_delivery` ledger rows, written AFTER each dispatch. Read-only
  // (no mutation). Same auth-gated, fail-CLOSED posture as `subscriptions` /
  // `consent` — the page loader redirects an anonymous caller to login, so a
  // non-OK here is a real upstream failure (the block soft-empties only when
  // it is optional, per decideRender).
  if (block.binding.kind === "deliveries") {
    const accountPath = deps.provider.accountUrl("notifications/deliveries");
    const resp = await deps.provider.fetch(accountPath);
    if (!resp.ok) {
      return {
        ok: false,
        status: resp.status,
        reason: `upstream ${resp.status}`,
      };
    }
    return {
      ok: true,
      value: {
        data: await resp.json(),
        schema: null,
        actionDef: null,
        dataPath: accountPath,
      },
    };
  }

  // #105 — a `vote` block COMPOSES two existing PUBLIC reads into a ballot (no
  // backend): the edition row (its `current_phase` decides open/closed) and the
  // votable-entity list (the finalists, as radio options). Both go through the
  // auth-optional `/bff` proxy (a signed-in citizen's Bearer rides along for the
  // cast, but the reads are public). The votable entity is on the binding; the
  // edition entity / status / phase / label config is DATA in the block props,
  // so this stays vertical-agnostic. Fail CLOSED on a missing edition id, a
  // half-configured block, or a non-OK upstream — the page is auth-gated and a
  // ballot that can't enumerate its options must not render an empty radio group.
  if (block.binding.kind === "vote") {
    const editionId = block.binding.filter;
    const cfg = voteReadConfig(block.binding.entity, block.props);
    if (!editionId || cfg === null) {
      return { ok: false, status: 0, reason: "vote binding misconfigured" };
    }
    const [edResp, opResp] = await Promise.all([
      deps.provider.fetch(deps.provider.voteEditionUrl(cfg, editionId)),
      deps.provider.fetch(deps.provider.voteOptionsUrl(cfg, editionId)),
    ]);
    if (!edResp.ok) {
      return {
        ok: false,
        status: edResp.status,
        reason: `edition ${edResp.status}`,
      };
    }
    if (!opResp.ok) {
      return {
        ok: false,
        status: opResp.status,
        reason: `options ${opResp.status}`,
      };
    }
    const editionRow = await edResp.json();
    const proposalsBody = await opResp.json();
    const ballot: Ballot = {
      options: toOptions(proposalsBody, cfg),
      closed: isClosed(editionRow, cfg),
      edition: editionId,
    };
    return {
      ok: true,
      value: { data: ballot, schema: null, actionDef: null },
    };
  }

  // #105 — an `owned-list` block reads the signed-in citizen's OWN rows of an
  // entity through the AUTHED account proxy (`/me/owned/{entity}`: require_auth +
  // OWN-scoped, resolves a user-entity-rel owner the public list can't). Fetches
  // the public SCHEMA alongside (best-effort, like list/detail) so EntityList
  // renders schema-driven columns; a schema miss falls back to row introspection.
  // Same auth-gated, fail-closed posture as `subscriptions`/`consent`.
  if (block.binding.kind === "owned-list") {
    if (!block.binding.entity) {
      return { ok: false, status: 0, reason: "owned-list missing entity" };
    }
    const ownedPath = deps.provider.accountUrl(
      `owned/${enc(block.binding.entity)}`,
    );
    // The schema path uses the `list` kind convention (same schema endpoint
    // as a public list — owned-list reads the OWN rows but schema is per-type).
    const schemaUrl = deps.provider.schemaUrl({
      kind: "list",
      entity: block.binding.entity,
    });
    const schemaPromise =
      schemaUrl !== null
        ? deps.provider.fetch(schemaUrl).then(
            (r) => r,
            () => null,
          )
        : null;
    const resp = await deps.provider.fetch(ownedPath);
    if (!resp.ok) {
      return {
        ok: false,
        status: resp.status,
        reason: `upstream ${resp.status}`,
      };
    }
    const data = await resp.json();
    let schema: OntologySchema | null = null;
    const sresp = schemaPromise !== null ? await schemaPromise : null;
    if (sresp !== null && sresp.ok) {
      schema = (await sresp.json().catch(() => null)) as OntologySchema | null;
    }
    return {
      ok: true,
      value: { data, schema, actionDef: null, dataPath: ownedPath },
    };
  }

  // #308 — a `filters` block renders the declared facets of ITS feed; its DATA
  // is the entity schema (filterable_fields / searchable / fields). No entity →
  // nothing to filter, soft-empty (the FilterBar renders nothing). The facet
  // OPTIONS are resolved client-side by the widget (row-derived or via a
  // relation `optionsSource`), the same machinery the inline bars used.
  if (block.binding.kind === "filters") {
    // The schema path uses the `list` kind convention (same schema endpoint
    // as a feed's underlying list surface).
    const schemaUrl = block.binding.entity
      ? deps.provider.schemaUrl({ kind: "list", entity: block.binding.entity })
      : null;
    if (schemaUrl === null) {
      return { ok: true, value: { data: null, schema: null, actionDef: null } };
    }
    const r = await deps.provider.fetch(schemaUrl);
    if (!r.ok) {
      // Optional slot → soft-empty (the FilterBar renders nothing). The schema
      // is the canonical declared-facet source; a 404 means the surface has no
      // browse placement, which is a provisioning gap to fix at the surface,
      // not to paper over here.
      return { ok: true, value: { data: null, schema: null, actionDef: null } };
    }
    return {
      ok: true,
      value: {
        data: await r.json(),
        schema: null,
        actionDef: null,
        dataPath: schemaUrl,
      },
    };
  }

  // #308 — a `feed` block resolves the ACTIVE view's underlying feed. The view
  // comes from the URL (`?view=`, default = first configured view); the
  // synthetic binding lets the existing list/map path + schema logic run
  // unchanged. `dataPath` then carries that view's feed — so the FeedView
  // widget pages / re-derives the right surface.
  const effective: Binding =
    block.binding.kind === "feed"
      ? {
          ...block.binding,
          kind: activeFeedView(feedViews(block.props), deps.view),
        }
      : block.binding;

  // Compute the calendar window from `now` (if present) and pass it to the
  // provider so resolveData stays URL-logic-free (§14.8 / #492 P0).
  const calWin = deps.now !== undefined ? calendarWindow(deps.now) : undefined;

  const dataUrl = deps.provider.dataUrl(effective, {
    calendarWindow: calWin,
    filterParams: deps.filterParams,
  });
  if (dataUrl === null) {
    return { ok: false, status: 0, reason: "unresolvable binding" };
  }

  // Fire the data fetch and the (best-effort) schema fetch in parallel. Data is
  // the security boundary — a non-OK data response fails the block CLOSED.
  // Schema is an enhancement: the widgets fall back to `props.columns` /
  // row-key introspection, so a schema miss or network error never blocks
  // rendering — it just yields `schema: null`. The `.then(ok, err)` neutralises
  // a schema network rejection so it can't surface as an unhandled rejection
  // when the data path returns early.
  const schemaUrl = deps.provider.schemaUrl(effective);
  const schemaPromise =
    schemaUrl !== null
      ? deps.provider.fetch(schemaUrl).then(
          (r) => r,
          () => null,
        )
      : null;

  const resp = await deps.provider.fetch(dataUrl);
  if (!resp.ok) {
    return {
      ok: false,
      status: resp.status,
      reason: `upstream ${resp.status}`,
    };
  }
  const data = await resp.json();

  let schema: OntologySchema | null = null;
  // Stryker disable next-line ConditionalExpression: awaiting `null` is harmless
  // — when schemaPromise is null the inner `sresp !== null` guard skips anyway,
  // so flipping this guard to `true` yields the identical result (equivalent).
  if (schemaPromise !== null) {
    const sresp = await schemaPromise;
    if (sresp !== null && sresp.ok) {
      // A malformed schema body must not fail the block — best-effort. `.catch`
      // keeps the parse failure local (schema stays null) instead of rejecting
      // the whole resolve.
      schema = (await sresp.json().catch(() => null)) as OntologySchema | null;
    }
  }

  return {
    ok: true,
    value: { data, schema, actionDef: null, dataPath: dataUrl },
  };
}
