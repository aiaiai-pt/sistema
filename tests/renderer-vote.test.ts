import { describe, it, expect } from "vitest";
import {
  voteReadConfig,
  voteCastConfig,
  editionReadPath,
  optionsReadPath,
  toOptions,
  isClosed,
  castBody,
  castVote,
  type VoteReadConfig,
  type VoteCastConfig,
  type WriteFetch,
} from "../components/renderer/vote";
import {
  resolveData,
  type FetchLike,
} from "../components/renderer/resolve-data";
import { createPublicDataProvider } from "../components/renderer/data-provider";
import type { Block } from "../components/renderer/types";

// The civic ballot config, as the /edicoes/:id/votar page override supplies it.
const PROPS = {
  edition_entity: "proposal_edition",
  option_status: "in_voting",
  open_phase: "voting",
  label_field: "title",
  placement_key: "civic-cast-vote",
  vote_model: "proposal_vote",
  vote_field: "proposal",
  edition_field: "edition",
};

const READ_CFG: VoteReadConfig = voteReadConfig("proposal", PROPS)!;
const CAST_CFG: VoteCastConfig = voteCastConfig("civic-participation", PROPS)!;

describe("voteReadConfig — block DATA → read config (vertical-agnostic)", () => {
  it("reads the votable entity from the binding and the rest from props", () => {
    const cfg = voteReadConfig("proposal", PROPS);
    expect(cfg).toMatchObject({
      entity: "proposal",
      editionEntity: "proposal_edition",
      optionStatus: "in_voting",
      openPhase: "voting",
      labelField: "title",
    });
  });

  it("defaults the generic facet/field names + limit", () => {
    const cfg = voteReadConfig("proposal", PROPS)!;
    expect(cfg.statusFacet).toBe("status");
    expect(cfg.editionFacet).toBe("edition.id");
    expect(cfg.phaseField).toBe("current_phase");
    expect(cfg.limit).toBe(50);
  });

  it("honours an explicit limit + custom facet names", () => {
    const cfg = voteReadConfig("poll", {
      ...PROPS,
      limit: 10,
      status_facet: "state",
      edition_facet: "cycle.id",
      phase_field: "phase",
    })!;
    expect(cfg.limit).toBe(10);
    expect(cfg.statusFacet).toBe("state");
    expect(cfg.editionFacet).toBe("cycle.id");
    expect(cfg.phaseField).toBe("phase");
  });

  it.each([
    ["missing entity", null, PROPS],
    ["missing edition_entity", "proposal", { ...PROPS, edition_entity: "" }],
    ["missing option_status", "proposal", { ...PROPS, option_status: "" }],
    ["missing open_phase", "proposal", { ...PROPS, open_phase: "" }],
  ])(
    "returns null when a required knob is absent (%s)",
    (_n, entity, props) => {
      expect(voteReadConfig(entity as string | null, props)).toBeNull();
    },
  );
});

describe("voteCastConfig — block DATA → cast config", () => {
  it("builds from the app + placement/field props", () => {
    expect(voteCastConfig("civic-participation", PROPS)).toEqual({
      app: "civic-participation",
      placementKey: "civic-cast-vote",
      voteModel: "proposal_vote",
      voteField: "proposal",
      editionField: "edition",
    });
  });

  it.each([
    ["missing app", undefined, PROPS],
    ["missing placement_key", "civic", { ...PROPS, placement_key: "" }],
    ["missing vote_model", "civic", { ...PROPS, vote_model: "" }],
    ["missing vote_field", "civic", { ...PROPS, vote_field: "" }],
    ["missing edition_field", "civic", { ...PROPS, edition_field: "" }],
  ])("returns null when a required knob is absent (%s)", (_n, app, props) => {
    expect(voteCastConfig(app as string | undefined, props)).toBeNull();
  });
});

describe("read paths — facet params carry the status + edition filters", () => {
  it("editionReadPath targets the edition entity by id under /bff", () => {
    expect(editionReadPath("civic-participation", READ_CFG, "ed-1")).toBe(
      "/bff/civic-participation/public/proposal_edition/ed-1",
    );
  });

  it("optionsReadPath filters the votable entity by status + edition facet", () => {
    const path = optionsReadPath("civic-participation", READ_CFG, "ed-1");
    expect(path.startsWith("/bff/civic-participation/public/proposal?")).toBe(
      true,
    );
    const qs = new URLSearchParams(path.split("?")[1]);
    expect(qs.get("status")).toBe("in_voting");
    expect(qs.get("edition.id")).toBe("ed-1");
    expect(qs.get("limit")).toBe("50");
  });

  it("encodes a hostile edition id (no path injection)", () => {
    const path = editionReadPath("app", READ_CFG, "a/b?x=1");
    expect(path).toBe("/bff/app/public/proposal_edition/a%2Fb%3Fx%3D1");
  });
});

describe("toOptions — votable rows → {id,label}", () => {
  it("maps the label field, from a list envelope", () => {
    const body = {
      items: [
        { id: "p1", title: "Ciclovia" },
        { id: "p2", title: "Hortas" },
      ],
    };
    expect(toOptions(body, READ_CFG)).toEqual([
      { id: "p1", label: "Ciclovia" },
      { id: "p2", label: "Hortas" },
    ]);
  });

  it("accepts a bare array too", () => {
    expect(toOptions([{ id: "p1", title: "X" }], READ_CFG)).toEqual([
      { id: "p1", label: "X" },
    ]);
  });

  it("falls back label → public_ref → id when the label field is absent", () => {
    const body = {
      items: [{ id: "p1" }, { id: "p2", public_ref: "OP-2" }],
    };
    expect(toOptions(body, READ_CFG)).toEqual([
      { id: "p1", label: "p1" },
      { id: "p2", label: "OP-2" },
    ]);
  });

  it("drops rows without an id (can't be voted for)", () => {
    expect(
      toOptions({ items: [{ title: "X" }, { id: "p1" }] }, READ_CFG),
    ).toEqual([{ id: "p1", label: "p1" }]);
  });

  it("a malformed body yields no options (never throws)", () => {
    expect(toOptions(null, READ_CFG)).toEqual([]);
    expect(toOptions("nope", READ_CFG)).toEqual([]);
  });
});

describe("isClosed — the edition's phase gates the window (fail-closed)", () => {
  it("open when the phase equals the configured open phase", () => {
    expect(isClosed({ current_phase: "voting" }, READ_CFG)).toBe(false);
  });

  it("closed for any other phase", () => {
    expect(isClosed({ current_phase: "execution" }, READ_CFG)).toBe(true);
  });

  it("closed when the phase is absent/null (fail-closed)", () => {
    expect(isClosed({}, READ_CFG)).toBe(true);
    expect(isClosed({ current_phase: null }, READ_CFG)).toBe(true);
    expect(isClosed(null, READ_CFG)).toBe(true);
  });
});

describe("castBody — the nested vote envelope from the field names", () => {
  it("nests choice + edition under the vote model key", () => {
    expect(castBody(CAST_CFG, "p1", "ed-1")).toEqual({
      proposal_vote: { proposal: "p1", edition: "ed-1" },
    });
  });
});

/** A write fetch that records the call and returns a canned response. */
function writeFetch(resp: { ok: boolean; status: number } | "throw"): {
  fetchImpl: WriteFetch;
  calls: Array<{ path: string; method: string; body: string }>;
} {
  const calls: Array<{ path: string; method: string; body: string }> = [];
  const fetchImpl: WriteFetch = async (path, init) => {
    calls.push({ path, method: init.method, body: init.body });
    if (resp === "throw") throw new Error("network down");
    return resp;
  };
  return { fetchImpl, calls };
}

describe("castVote — POST the vote through the citizen submit lane", () => {
  it("POSTs the nested envelope to the placement submit path", async () => {
    const { fetchImpl, calls } = writeFetch({ ok: true, status: 202 });
    const out = await castVote(fetchImpl, CAST_CFG, "p1", "ed-1");
    expect(out).toEqual({ kind: "ok" });
    expect(calls[0].path).toBe(
      "/bff/civic-participation/public/submit?placement_key=civic-cast-vote",
    );
    expect(calls[0].method).toBe("POST");
    expect(JSON.parse(calls[0].body)).toEqual({
      proposal_vote: { proposal: "p1", edition: "ed-1" },
    });
  });

  it("maps 409 → conflict (one-vote-per-edition already used)", async () => {
    const { fetchImpl } = writeFetch({ ok: false, status: 409 });
    expect(await castVote(fetchImpl, CAST_CFG, "p1", "ed-1")).toEqual({
      kind: "conflict",
    });
  });

  it.each([401, 403])("maps %s → auth (identity needed)", async (status) => {
    const { fetchImpl } = writeFetch({ ok: false, status });
    expect(await castVote(fetchImpl, CAST_CFG, "p1", "ed-1")).toEqual({
      kind: "auth",
    });
  });

  it("maps any other non-OK → error with the status", async () => {
    const { fetchImpl } = writeFetch({ ok: false, status: 503 });
    expect(await castVote(fetchImpl, CAST_CFG, "p1", "ed-1")).toEqual({
      kind: "error",
      status: 503,
    });
  });

  it("a network throw → error (never rejects)", async () => {
    const { fetchImpl } = writeFetch("throw");
    expect(await castVote(fetchImpl, CAST_CFG, "p1", "ed-1")).toEqual({
      kind: "error",
      status: 0,
    });
  });
});

// --- the resolveData vote branch composes the two reads into a Ballot ---

function voteBlock(
  binding: Partial<{ entity: string | null; filter: string | null }>,
  props: Record<string, unknown> = PROPS,
): Block {
  return {
    type: "voting",
    slot: "main",
    binding: { kind: "vote", entity: "proposal", filter: "ed-1", ...binding },
    props,
  };
}

/** Route the edition read vs the options list read to separate responses. */
function votingFetch(routes: {
  edition: { ok: boolean; status: number; body?: unknown };
  options: { ok: boolean; status: number; body?: unknown };
}): { fetchImpl: FetchLike; calls: string[] } {
  const calls: string[] = [];
  const fetchImpl: FetchLike = async (path) => {
    calls.push(path);
    const r = path.includes("/public/proposal_edition/")
      ? routes.edition
      : routes.options;
    return { ok: r.ok, status: r.status, json: async () => r.body ?? {} };
  };
  return { fetchImpl, calls };
}

describe("resolveData — `vote` composes a Ballot from two public reads", () => {
  it("returns options + open state + edition id when both reads succeed", async () => {
    const { fetchImpl, calls } = votingFetch({
      edition: { ok: true, status: 200, body: { current_phase: "voting" } },
      options: {
        ok: true,
        status: 200,
        body: { items: [{ id: "p1", title: "Ciclovia" }] },
      },
    });
    const res = await resolveData(voteBlock({}), {
      provider: createPublicDataProvider("civic-participation", fetchImpl),
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.data).toEqual({
      options: [{ id: "p1", label: "Ciclovia" }],
      closed: false,
      edition: "ed-1",
    });
    // Two reads, both under /bff (edition + options).
    expect(calls).toHaveLength(2);
    expect(calls.every((c) => c.startsWith("/bff/civic-participation/"))).toBe(
      true,
    );
  });

  it("marks the ballot closed when the edition is not in the voting phase", async () => {
    const { fetchImpl } = votingFetch({
      edition: { ok: true, status: 200, body: { current_phase: "execution" } },
      options: { ok: true, status: 200, body: { items: [] } },
    });
    const res = await resolveData(voteBlock({}), {
      provider: createPublicDataProvider("civic-participation", fetchImpl),
    });
    expect(res.ok).toBe(true);
    if (res.ok)
      expect((res.value.data as { closed: boolean }).closed).toBe(true);
  });

  it("fails CLOSED when the edition id (binding.filter) is absent", async () => {
    const { fetchImpl, calls } = votingFetch({
      edition: { ok: true, status: 200 },
      options: { ok: true, status: 200 },
    });
    const res = await resolveData(voteBlock({ filter: null }), {
      provider: createPublicDataProvider("civic-participation", fetchImpl),
    });
    expect(res.ok).toBe(false);
    expect(calls).toHaveLength(0); // never fetched a half-configured ballot
  });

  it("fails CLOSED when the block is half-configured (props missing)", async () => {
    const { fetchImpl, calls } = votingFetch({
      edition: { ok: true, status: 200 },
      options: { ok: true, status: 200 },
    });
    const res = await resolveData(voteBlock({}, { open_phase: "voting" }), {
      provider: createPublicDataProvider("civic-participation", fetchImpl),
    });
    expect(res.ok).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it("fails CLOSED when the edition read is non-OK (404)", async () => {
    const { fetchImpl } = votingFetch({
      edition: { ok: false, status: 404 },
      options: { ok: true, status: 200, body: { items: [] } },
    });
    const res = await resolveData(voteBlock({}), {
      provider: createPublicDataProvider("civic-participation", fetchImpl),
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(404);
  });

  it("fails CLOSED when the options read is non-OK (502)", async () => {
    const { fetchImpl } = votingFetch({
      edition: { ok: true, status: 200, body: { current_phase: "voting" } },
      options: { ok: false, status: 502 },
    });
    const res = await resolveData(voteBlock({}), {
      provider: createPublicDataProvider("civic-participation", fetchImpl),
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(502);
  });
});
