/**
 * Block / binding model for the portal rendering engine (#73, spec §5).
 *
 * A page is an ordered list of **blocks**; each block is a declarative
 * *pointer*, never baked data. The block names a widget intent (`type`,
 * authoring hint) and a `binding` describing WHAT to render (a list of entity
 * Z, the detail of row Y, an action form, …). Data is fetched at render time
 * by `resolveData(block)` (see `./resolve-data.ts`) and handed to the widget
 * the dispatcher selects (see `./dispatch.ts`). Keeping only the pointer is
 * what makes this a template, not a page.
 *
 * The ontology `portal_page` rows that emit these descriptors land in #79;
 * here the descriptors are SEEDED (same staged pattern #70/#72 used).
 */

/** The bounded, governed widget kinds (spec §5 catalog). */
export type WidgetKind =
  | "list"
  | "detail"
  | "form"
  | "map"
  | "calendar"
  | "kpi"
  | "content"
  // #517 (atelier) — a Metabase analytics embed. Presentational: the DS
  // `MetabaseEmbedWidget` renders an `<iframe>` from a HOST-resolved `props.src`
  // (the signed/proxy URL), so the DS stays presentation-only and carries no
  // metabase auth. Lets a dashboard/portal `Block[]` hold embeds uniformly
  // (resolved via `resolveWidget`, not a host special-case).
  | "embed"
  | "vote"
  | "status"
  | "forms"
  | "hero"
  | "lookup"
  // #105 Phase 1 (#308). A `feed` block pairs EntityList + MapView over one
  // entity feed and toggles between them via the URL (`?view=`); resolveData
  // resolves the ACTIVE view's underlying feed. A `filters` block renders the
  // declared facets of a feed and writes the active filter state to the URL —
  // the feed re-resolves server-side, so list + map share one filter channel.
  | "feed"
  | "filters"
  // #105 Phase 2 (#313). An `actions` block resolves a detail row's CITIZEN
  // ACTION availability — `/{app}/public/{entity}/{id}/actions` projects, per
  // citizen-write placement, whether the action is OPEN on this row (the same
  // `gate` criteria the submit enforces). SSR-resolved (no client fetch); the
  // ActionPanel widget joins it with the operator's declared CTAs to render
  // open links vs disabled+reason. Distinct from `detail` because it consumes
  // the availability projection, not the row.
  | "actions"
  // #105 Phase 4. An `aggregate` block reads the ROWS of a public aggregate
  // VIEW (`/{app}/public/{view}`, the #250 M3 public-view lane: self-gated by
  // `group_by tenant_id`, no entity ACL) as PRIMARY data — distinct from a
  // `filters` block reading a view as facet *options*. RankingBoard /
  // ResultsChart consume the `{label, value}` projection of the rows. The view
  // carries no per-type schema, so this never resolves a `/public/schema` path.
  | "aggregate"
  // #105 Phase 5. A `subscriptions` block reads the signed-in citizen's OWN
  // notification subscriptions through the AUTHED account proxy
  // (`/me/notifications/subscriptions`, require_auth + OWN-scoped) — NOT the
  // public `/bff` surface. NotificationPrefs renders them as a toggle list and
  // mutates them (POST/PATCH) through the same proxy. The first MUTATING widget
  // kind: it carries no schema and its data path is the account lane, so
  // resolveData handles it in a dedicated branch (never hits `bffPathForBinding`).
  | "subscriptions"
  // #105 Phase 5 slice 2. A `consent` block reads the signed-in citizen's OWN
  // RGPD state through the AUTHED account proxy (`/me/consent`, require_auth +
  // OWN-scoped): the tenant's active consent purposes joined with the caller's
  // consent records. ConsentManager renders the toggle list and acts on it —
  // GRANT reuses the public submit lane (the existing `grant_consent` action),
  // REVOKE/ERASE/EXPORT ride the same `/me/consent` proxy. Like `subscriptions`
  // it carries no schema; resolveData handles it in a dedicated branch.
  | "consent"
  // #252 Anexo 110 — a `deliveries` block reads the signed-in citizen's OWN
  // notification HISTORY through the AUTHED account proxy
  // (`/me/notifications/deliveries`, require_auth + OWN-scoped → recipient_user_id
  // = caller sub): the `notification_delivery` ledger rows written AFTER each
  // dispatch. Read-only (the citizen consults their history; nothing to mutate).
  // Like `subscriptions`/`consent` it carries no schema; resolveData handles it
  // in a dedicated branch.
  | "deliveries"
  // #105 — an `owned-list` block reads the signed-in citizen's OWN rows of an
  // entity through the AUTHED account proxy (`/me/owned/{entity}`, require_auth +
  // OWN-scoped). Unlike the my-reports public-list filter (which only works when
  // the owner field STORES the sub), this handles a USER-ENTITY-REL owner
  // (proposal.proponent) by resolving the caller's identity server-side. Reuses
  // EntityListWidget (the data is `{items}` like a list); resolveData fetches the
  // OWN lane + the public schema (for columns) in a dedicated branch. Auth-gated.
  | "owned-list"
  // #105 Phase 7 — the landing/content surface: presentational, marketing-grade
  // section widgets that render PURELY from their block props (copy + media are
  // tenant DATA). They have NO data path — resolveData short-circuits them all
  // through the shared PRESENTATIONAL_KINDS branch (like `hero`/`lookup`), so a
  // misconfigured one renders nothing rather than fetching. Each is its own
  // kind (the `hero` precedent) so the registry dispatches the right widget;
  // they drop into any vertical because they carry no entity/schema coupling.
  | "feature-grid"
  | "cta"
  | "media-text"
  | "steps"
  | "testimonial"
  | "faq"
  | "logo-strip"
  | "media-gallery";

/** The feed sub-views a `feed`/`filters` binding may toggle/scope (#308). */
export type FeedView = "list" | "map";

/** Declarative pointer — "I render <kind> of <entity|action>, scoped by filter". */
export interface Binding {
  kind: WidgetKind;
  /** Ontology entity type (list/detail/vote). */
  entity?: string | null;
  /** Ontology action type (form). */
  action?: string | null;
  /**
   * Render-time selector / scope. For the single-resource kinds
   * (detail/status/content) this is the captured route segment (id/ref/key).
   * For list/map/calendar it is the (future) scope expression. Real
   * `{{tenant.scope}}` expression evaluation lands with the ontology
   * descriptors (#79); today it is a literal.
   */
  filter?: string | null;
  /**
   * `list` only (#75 M5): page-size cap + ordering, forwarded as
   * `?limit=` / `?order_by=` (the BFF shape-sanitises order terms and drops
   * anything malformed). The landing's recent-feed sets `limit: 6,
   * order: "-created_at"`.
   */
  limit?: number | null;
  order?: string | null;
  /**
   * `detail` only (#75 M5 slice 3): child collections to embed, forwarded as
   * `?expand=` (the BFF resolves each through its own disclosure policy row
   * — an undisclosed child is silently absent). Each aside block requests
   * only what it renders (gallery → ["images"]).
   */
  expand?: string[] | null;
}

/**
 * Fail-closed blast radius (§14.8). A `structural` slot must NOT silently
 * vanish on misconfig (it surfaces a visible error); an `optional` widget
 * fails soft to empty. The page template (#74) sets this from the slot
 * definition; until then a block declares its own, defaulting to `optional`.
 */
export type BlockImportance = "optional" | "structural";

/** Per-block structural lock override (#74 §2.1, Gutenberg per-block lock). */
export interface BlockLock {
  move?: boolean;
  remove?: boolean;
}

export interface Block {
  /**
   * Operator-authored widget hint. UNTRUSTED — it is NEVER interpolated into
   * the DOM (TH-08). The dispatcher resolves a known-good registry `key` from
   * the `binding` (+ a tester that MAY rank on this `type`); that literal is the
   * only widget identifier that reaches `class`/`data-*`.
   */
  type: string;
  /** Placement into the page-template slot (#74). */
  slot: string;
  /**
   * Stable identifier within the slot (#74 §2.2). The override-map key — a
   * `portal_page` (#79) addresses this block by `slot.name → block.name`.
   * Stamped from the template's default-block `name`.
   */
  name?: string;
  binding: Binding;
  props?: Record<string, unknown>;
  importance?: BlockImportance;
  /**
   * Single-H1 ownership (ARTE #2). Stamped from the owning slot — the widget
   * renders the page's only `<h1>` here; every other heading is `<h2>`+.
   */
  ownsH1?: boolean;
  /** Reserved error-summary slot (ARTE #5). Stamped from the slot. */
  errorSummary?: boolean;
  /** Per-block structural lock override (#74 §2.1). */
  lock?: BlockLock;
  /**
   * Full-bleed band (#105 Phase 7 composition). A `bleed` block is an
   * edge-to-edge, self-padding coloured band (a Hero / accent CallToAction). It
   * keeps the template's vertical RHYTHM gap to/from a CONTENT band; the gap
   * only collapses BETWEEN two adjacent bleed bands, so consecutive colour
   * fields butt instead of leaving an awkward sliver. A template-author concern
   * (set on the default block), not tenant content.
   */
  bleed?: boolean;
  /**
   * #176 Tier 1 (ADR 0003) — 2D grid placement on a 12-column track. A block
   * WITH `layout` is positioned by the renderer's grid (col `x`, span `w`; row
   * `y`, span `h`); a block WITHOUT it falls back to source order (the shipped
   * ordered-list behaviour — fully back-compatible). This is a DESCRIPTOR field
   * consumed by BOTH render (places the block) and authoring (drag/resize writes
   * the coords); the DS never learns it is being edited. `x`/`y` are 0-based;
   * `w`/`h` are 1-based spans (w clamped to 1..12).
   */
  layout?: BlockLayout;
  /**
   * #176 Tier 1 — child blocks for a future grid-IN-grid container. Reserved
   * (single-level page grids use `layout` on flat blocks); nesting is deferred
   * until a concrete need (ADR 0003 build-order note).
   */
  children?: Block[];
}

/** 12-column grid placement (#176 Tier 1). All fields in grid track units. */
export interface BlockLayout {
  /** 0-based start column (0..11). */
  x: number;
  /** 0-based start row. */
  y: number;
  /** Column span (1..12). */
  w: number;
  /** Row span (>=1). */
  h: number;
}

export interface PageDescriptor {
  blocks: Block[];
}

/**
 * Minimal ontology schema shape a tester / widget may consult. Widened in 73d
 * when EntityList/DetailView read fields from the schema (no hardcoded
 * entity-type unions — §14.6).
 */
export interface OntologySchema {
  entity: string;
  fields: Array<{ key: string; type?: string; [extra: string]: unknown }>;
  [extra: string]: unknown;
}

/**
 * The uniform prop contract every catalog widget receives. `resolveData`
 * produces `{ data, schema, actionDef }`; the page passes the block's `props`
 * through verbatim (operator config — columns, labels, …). This single shape
 * is what lets one dispatcher mount any widget, and what each DS-backed widget
 * wrapper adapts to its component's props.
 */
export interface WidgetProps {
  data: unknown;
  schema: OntologySchema | null;
  actionDef: unknown | null;
  props: Record<string, unknown>;
  /**
   * The vertical app segment (`occurrences`, …), threaded from the loader so a
   * widget that POSTs back to the public surface (ActionForm → /{app}/public/
   * submit, 73f) can build its path. Optional — read-only widgets ignore it.
   */
  app?: string;
  /**
   * Single-H1 ownership (ARTE #2), stamped from the owning slot via the
   * block. A heading-rendering widget emits the page's `<h1>` only when this
   * is true — otherwise `<h2>` — so composed pages (landing: hero + recent
   * list) keep exactly one H1. Hardcoded routes that mount a widget
   * standalone (my-reports) pass it explicitly.
   */
  ownsH1?: boolean;
  /**
   * The request's resolved locale (prefs cookie → portal default) — drives
   * value FORMATTING only (dates). Copy localisation happens upstream
   * (wuchale for code strings, $loc for page-row props).
   */
  locale?: string;
  /**
   * BFF path the block's data came from (#75 M5 slice 4) — paging widgets
   * re-fetch it client-side with `?after={next_cursor}` through the same
   * /bff proxy (graduated principal rides along for free).
   */
  dataPath?: string;
  /**
   * The request "now" as an ISO string, stamped once by the route loader
   * (`new Date()`) — the SAME clock that feeds `resolveData` (calendar window).
   * Threaded so time-relative widgets (PhaseTimeline open/closed/upcoming) are
   * computed SSR-side and hydrate stable, instead of reading the browser clock
   * (which would drift from SSR and corrupt hydration). Generic, not
   * vertical-specific.
   */
  now?: string;
}
