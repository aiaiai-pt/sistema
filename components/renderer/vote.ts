/**
 * Voting-ballot helpers (#105) — pure read-path builders + ballot mapping + the
 * public-submit cast, kept OUT of the `.svelte` widget so (a) the HTTP verbs and
 * header literals aren't mangled by Wuchale's `.svelte` string extraction, and
 * (b) the shaping/cast is unit-testable without mounting a component.
 *
 * The ballot COMPOSES two existing PUBLIC reads (no new backend): the edition
 * row — its `current_phase` decides open/closed — and the votable-entity list
 * (the finalists, as radio options). The cast reuses the citizen public-submit
 * lane (the vote action's placement) — the SAME auth-optional `/bff` surface
 * `submit_proposal` uses, so the signed-in citizen's Bearer rides along and the
 * server stamps the one-vote pseudonym (anonymous is refused server-side).
 *
 * Vertical-agnostic: every entity / field / status / phase literal is block
 * DATA (the civic page supplies proposal / proposal_edition / in_voting /
 * voting / title), so the widget drops into any vertical with a vote action.
 */

/** Path-only read fetch (the resolve-data read shape). */
export type ReadFetch = (
  path: string,
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

/** Write fetch for the cast POST (the browser `fetch` fits). */
export type WriteFetch = (
  path: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<{ ok: boolean; status: number }>;

const JSON_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
};

function enc(value: string): string {
  return encodeURIComponent(value);
}

export interface VoteOption {
  id: string;
  label: string;
}

/** The resolved ballot a `vote` block hands the widget. */
export interface Ballot {
  options: VoteOption[];
  /** Voting is NOT open on this edition (current_phase ≠ the open phase). */
  closed: boolean;
  /** The edition id the cast writes back (carried so the widget needn't re-derive). */
  edition: string;
}

/**
 * How to SOURCE the ballot from the public surface — all DATA (the votable
 * entity type comes from the binding; the rest from props), so no civic literal
 * lives in code. Generic facet/field names default to the platform conventions.
 */
export interface VoteReadConfig {
  /** Votable entity type (binding.entity), e.g. `proposal`. */
  entity: string;
  /** Edition entity type, e.g. `proposal_edition`. */
  editionEntity: string;
  /** Status value marking a votable option, e.g. `in_voting`. */
  optionStatus: string;
  /** Facet param carrying the status filter (default `status`). */
  statusFacet: string;
  /** Facet param carrying the edition id (default `edition.id`). */
  editionFacet: string;
  /** Option label field on the entity row (default `title`). */
  labelField: string;
  /** Edition phase field (default `current_phase`). */
  phaseField: string;
  /** Phase value that means voting is OPEN, e.g. `voting`. */
  openPhase: string;
  /** Max options to fetch (default 50). */
  limit: number;
}

/** Where the cast POSTs — the placement + the vote entity's field names. DATA. */
export interface VoteCastConfig {
  app: string;
  /** Citizen public-submit placement key, e.g. `civic-cast-vote`. */
  placementKey: string;
  /** Envelope key = the created entity type, e.g. `proposal_vote`. */
  voteModel: string;
  /** Field on the vote entity pointing at the chosen option, e.g. `proposal`. */
  voteField: string;
  /** Field on the vote entity pointing at the edition, e.g. `edition`. */
  editionField: string;
}

function strProp(value: unknown): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

function strField(row: unknown, key: string): string | undefined {
  if (row === null || typeof row !== "object") return undefined;
  const v = (row as Record<string, unknown>)[key];
  return typeof v === "string" && v !== "" ? v : undefined;
}

/**
 * Build the read config from the block (entity on the binding, the rest in
 * props). Returns null when a REQUIRED knob is missing — resolveData then fails
 * the block closed rather than fetch a half-configured ballot.
 */
export function voteReadConfig(
  entity: string | null | undefined,
  props: Record<string, unknown> | undefined,
): VoteReadConfig | null {
  const p = props ?? {};
  const ent = strProp(entity);
  const editionEntity = strProp(p.edition_entity);
  const optionStatus = strProp(p.option_status);
  const openPhase = strProp(p.open_phase);
  if (!ent || !editionEntity || !optionStatus || !openPhase) return null;
  const limit =
    typeof p.limit === "number" && p.limit > 0 ? Math.floor(p.limit) : 50;
  return {
    entity: ent,
    editionEntity,
    optionStatus,
    statusFacet: strProp(p.status_facet) ?? "status",
    editionFacet: strProp(p.edition_facet) ?? "edition.id",
    labelField: strProp(p.label_field) ?? "title",
    phaseField: strProp(p.phase_field) ?? "current_phase",
    openPhase,
    limit,
  };
}

/** Build the cast config from props + the widget's app. Null if misconfigured. */
export function voteCastConfig(
  app: string | undefined,
  props: Record<string, unknown> | undefined,
): VoteCastConfig | null {
  const p = props ?? {};
  const a = strProp(app);
  const placementKey = strProp(p.placement_key);
  const voteModel = strProp(p.vote_model);
  const voteField = strProp(p.vote_field);
  const editionField = strProp(p.edition_field);
  if (!a || !placementKey || !voteModel || !voteField || !editionField) {
    return null;
  }
  return { app: a, placementKey, voteModel, voteField, editionField };
}

/** The edition read — its `current_phase` decides open/closed. */
export function editionReadPath(
  app: string,
  cfg: VoteReadConfig,
  editionId: string,
): string {
  return `/bff/${enc(app)}/public/${enc(cfg.editionEntity)}/${enc(editionId)}`;
}

/** The votable-options read — the finalists for this edition, by status facet. */
export function optionsReadPath(
  app: string,
  cfg: VoteReadConfig,
  editionId: string,
): string {
  const params = new URLSearchParams();
  params.set(cfg.statusFacet, cfg.optionStatus);
  params.set(cfg.editionFacet, editionId);
  params.set("limit", String(cfg.limit));
  return `/bff/${enc(app)}/public/${enc(cfg.entity)}?${params.toString()}`;
}

/** Rows out of a `{items: [...]}` list envelope (or a bare array). */
function rowsFrom(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const items = (value as { items?: unknown }).items;
    if (Array.isArray(items)) return items;
  }
  return [];
}

/** Map the votable-entity list into ballot options (id + a non-empty label). */
export function toOptions(
  proposalsBody: unknown,
  cfg: VoteReadConfig,
): VoteOption[] {
  const out: VoteOption[] = [];
  for (const row of rowsFrom(proposalsBody)) {
    const id = strField(row, "id");
    if (!id) continue;
    const label =
      strField(row, cfg.labelField) ?? strField(row, "public_ref") ?? id;
    out.push({ id, label });
  }
  return out;
}

/** Voting is closed unless the edition's phase equals the configured open phase
 *  (an absent/null phase reads as CLOSED — fail-closed, matching the gate). */
export function isClosed(editionRow: unknown, cfg: VoteReadConfig): boolean {
  return strField(editionRow, cfg.phaseField) !== cfg.openPhase;
}

/** The cast body: `{ <voteModel>: { <voteField>: choice, <editionField>: edition } }`. */
export function castBody(
  cfg: VoteCastConfig,
  choiceId: string,
  editionId: string,
): Record<string, unknown> {
  return {
    [cfg.voteModel]: {
      [cfg.voteField]: choiceId,
      [cfg.editionField]: editionId,
    },
  };
}

export type CastOutcome =
  | { kind: "ok" }
  /** One-vote-per-edition already used (409) — a settled state, not an error. */
  | { kind: "conflict" }
  /** Identity missing/insufficient (401/403) — the cast needs a signed-in citizen. */
  | { kind: "auth" }
  | { kind: "error"; status: number };

/**
 * Cast the vote through the citizen public-submit lane. The signed-in citizen's
 * Bearer is forwarded by the same-origin `/bff` proxy, so the server stamps the
 * pseudonym and enforces the one-vote constraint. Maps the response to a settled
 * outcome the widget renders (never throws on a non-OK — a 409 is expected).
 */
export async function castVote(
  fetchImpl: WriteFetch,
  cfg: VoteCastConfig,
  choiceId: string,
  editionId: string,
): Promise<CastOutcome> {
  let resp: { ok: boolean; status: number };
  try {
    resp = await fetchImpl(
      `/bff/${enc(cfg.app)}/public/submit?placement_key=${enc(cfg.placementKey)}`,
      {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(castBody(cfg, choiceId, editionId)),
      },
    );
  } catch {
    return { kind: "error", status: 0 };
  }
  if (resp.ok) return { kind: "ok" };
  if (resp.status === 409) return { kind: "conflict" };
  if (resp.status === 401 || resp.status === 403) return { kind: "auth" };
  return { kind: "error", status: resp.status };
}
