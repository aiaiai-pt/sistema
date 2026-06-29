import { describe, it, expect, vi } from "vitest";
import {
  bffPathForBinding,
  schemaPathForBinding,
  calendarWindow,
  resolveData,
  feedViews,
  activeFeedView,
  appendQuery,
  type FetchLike,
} from "../components/renderer/resolve-data";
import { createPublicDataProvider } from "../components/renderer/data-provider";
import type { Binding, Block } from "../components/renderer/types";

function block(binding: Binding, importance?: Block["importance"]): Block {
  return { type: "x", slot: "main", binding, importance };
}

function blockWithProps(
  binding: Binding,
  props: Record<string, unknown>,
): Block {
  return { type: "x", slot: "feed", binding, props };
}

/** A fetch fake that records the path and returns a canned response. */
function fakeFetch(resp: { ok: boolean; status: number; body?: unknown }): {
  fetchImpl: FetchLike;
  calls: string[];
} {
  const calls: string[] = [];
  const fetchImpl: FetchLike = async (path) => {
    calls.push(path);
    return {
      ok: resp.ok,
      status: resp.status,
      json: async () => resp.body ?? {},
    };
  };
  return { fetchImpl, calls };
}

/** A fetch fake that dispatches by path prefix — data vs schema endpoints —
 *  so we can give each its own response (and simulate a schema-only failure). */
function routedFetch(routes: {
  data: { ok: boolean; status: number; body?: unknown };
  schema?: { ok: boolean; status: number; body?: unknown } | "throw";
}): { fetchImpl: FetchLike; calls: string[] } {
  const calls: string[] = [];
  const fetchImpl: FetchLike = async (path) => {
    calls.push(path);
    const isSchema = path.includes("/public/schema/");
    if (isSchema) {
      if (routes.schema === "throw") throw new Error("network down");
      const s = routes.schema ?? { ok: false, status: 404 };
      return { ok: s.ok, status: s.status, json: async () => s.body ?? {} };
    }
    return {
      ok: routes.data.ok,
      status: routes.data.status,
      json: async () => routes.data.body ?? {},
    };
  };
  return { fetchImpl, calls };
}

describe("bffPathForBinding — pointer → BFF public path (#70 surface, app-first)", () => {
  it("list → /{app}/public/{entity}", () => {
    expect(
      bffPathForBinding({ kind: "list", entity: "occurrence" }, "occurrences"),
    ).toBe("/occurrences/public/occurrence");
  });

  it("list without an entity is unmappable → null (fail closed)", () => {
    expect(bffPathForBinding({ kind: "list" }, "occurrences")).toBeNull();
  });

  it("aggregate → /{app}/public/{view} (#105 Phase 4, the public-view lane)", () => {
    expect(
      bffPathForBinding(
        { kind: "aggregate", entity: "civic_voting_results" },
        "civic-participation",
      ),
    ).toBe("/civic-participation/public/civic_voting_results");
  });

  it("aggregate carries limit + order on the query string", () => {
    expect(
      bffPathForBinding(
        {
          kind: "aggregate",
          entity: "civic_voting_results",
          limit: 10,
          order: "-total_votes",
        },
        "civic-participation",
      ),
    ).toBe(
      "/civic-participation/public/civic_voting_results?limit=10&order_by=-total_votes",
    );
  });

  it("aggregate without an entity is unmappable → null (fail closed)", () => {
    expect(
      bffPathForBinding({ kind: "aggregate" }, "civic-participation"),
    ).toBeNull();
  });

  it("detail → /{app}/public/{entity}/{id} from binding.filter", () => {
    expect(
      bffPathForBinding(
        { kind: "detail", entity: "occurrence", filter: "abc-1" },
        "occurrences",
      ),
    ).toBe("/occurrences/public/occurrence/abc-1");
  });

  it("detail missing the selector → null", () => {
    expect(
      bffPathForBinding(
        { kind: "detail", entity: "occurrence" },
        "occurrences",
      ),
    ).toBeNull();
  });

  it("detail missing the entity → null", () => {
    expect(
      bffPathForBinding({ kind: "detail", filter: "abc-1" }, "occurrences"),
    ).toBeNull();
  });

  it("actions → /{app}/public/{entity}/{id}/actions (#313)", () => {
    expect(
      bffPathForBinding(
        { kind: "actions", entity: "occurrence", filter: "abc-1" },
        "occurrences",
      ),
    ).toBe("/occurrences/public/occurrence/abc-1/actions");
  });

  it("actions missing the entity or selector → null", () => {
    expect(
      bffPathForBinding(
        { kind: "actions", entity: "occurrence" },
        "occurrences",
      ),
    ).toBeNull();
    expect(
      bffPathForBinding({ kind: "actions", filter: "abc-1" }, "occurrences"),
    ).toBeNull();
  });

  it("status → /{app}/public/submission/{ref}", () => {
    expect(
      bffPathForBinding({ kind: "status", filter: "O311-1" }, "occurrences"),
    ).toBe("/occurrences/public/submission/O311-1");
  });

  it("status missing the ref → null", () => {
    expect(bffPathForBinding({ kind: "status" }, "occurrences")).toBeNull();
  });

  it("content → /{app}/public/content/{key}", () => {
    expect(
      bffPathForBinding({ kind: "content", filter: "privacy" }, "occurrences"),
    ).toBe("/occurrences/public/content/privacy");
  });

  it("content missing the key → null", () => {
    expect(bffPathForBinding({ kind: "content" }, "occurrences")).toBeNull();
  });

  it("map → /{app}/public/map (no selector needed)", () => {
    expect(bffPathForBinding({ kind: "map" }, "occurrences")).toBe(
      "/occurrences/public/map",
    );
  });

  it("calendar → /{app}/public/calendar", () => {
    expect(bffPathForBinding({ kind: "calendar" }, "occurrences")).toBe(
      "/occurrences/public/calendar",
    );
  });

  it("url-encodes entity and selector segments", () => {
    expect(
      bffPathForBinding(
        { kind: "detail", entity: "a b", filter: "x/y" },
        "occurrences",
      ),
    ).toBe("/occurrences/public/a%20b/x%2Fy");
  });

  it("derives the {app} segment from the passed app", () => {
    expect(bffPathForBinding({ kind: "map" }, "equipment")).toBe(
      "/equipment/public/map",
    );
  });

  it("form → /{app}/public/form/{placement_key} from binding.filter (73f)", () => {
    expect(
      bffPathForBinding(
        {
          kind: "form",
          action: "occurrence_create",
          filter: "public:occurrence:submit",
        },
        "occurrences",
      ),
    ).toBe("/occurrences/public/form/public%3Aoccurrence%3Asubmit");
  });

  it("form without a placement key → null (fail closed)", () => {
    expect(
      bffPathForBinding(
        { kind: "form", action: "occurrence_create" },
        "occurrences",
      ),
    ).toBeNull();
  });

  it("kinds not yet wired to a read endpoint (kpi/vote) → null", () => {
    expect(bffPathForBinding({ kind: "kpi" }, "occurrences")).toBeNull();
    expect(
      bffPathForBinding({ kind: "vote", entity: "poll" }, "occurrences"),
    ).toBeNull();
  });
});

describe("resolveData — the single data path (pointer in, normalised data out)", () => {
  it("fetches the resolved path through the /bff proxy and returns normalised data", async () => {
    const { fetchImpl, calls } = fakeFetch({
      ok: true,
      status: 200,
      body: { title: "Privacy" },
    });
    const res = await resolveData(
      block({ kind: "content", filter: "privacy" }),
      {
        provider: createPublicDataProvider("occurrences", fetchImpl),
      },
    );
    expect(calls).toEqual(["/bff/occurrences/public/content/privacy"]);
    expect(res).toEqual({
      ok: true,
      value: {
        data: { title: "Privacy" },
        schema: null,
        actionDef: null,
        dataPath: "/occurrences/public/content/privacy",
      },
    });
  });

  it("an unmappable binding never fetches and fails closed (status 0)", async () => {
    const { fetchImpl, calls } = fakeFetch({ ok: true, status: 200 });
    const res = await resolveData(block({ kind: "list" }), {
      provider: createPublicDataProvider("occurrences", fetchImpl),
    });
    expect(calls).toEqual([]); // no fetch attempted
    expect(res).toEqual({
      ok: false,
      status: 0,
      reason: "unresolvable binding",
    });
  });

  it("a non-OK upstream response fails closed with the upstream status", async () => {
    const { fetchImpl } = fakeFetch({ ok: false, status: 404 });
    const res = await resolveData(
      block({ kind: "content", filter: "missing" }),
      {
        provider: createPublicDataProvider("occurrences", fetchImpl),
      },
    );
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.status).toBe(404);
      expect(res.reason).toContain("404");
    }
  });

  it("does not parse the body of a failed response", async () => {
    const json = vi.fn(async () => ({}));
    const fetchImpl: FetchLike = async () => ({ ok: false, status: 502, json });
    await resolveData(block({ kind: "map" }), {
      provider: createPublicDataProvider("occurrences", fetchImpl),
    });
    expect(json).not.toHaveBeenCalled();
  });
});

describe("calendarWindow — the date window the /public/calendar fetch needs (73e)", () => {
  it("returns first-of-month → first-of-month+2 as YYYY-MM-DD (UTC)", () => {
    expect(calendarWindow(new Date("2026-06-15T12:30:00Z"))).toEqual({
      start: "2026-06-01",
      end: "2026-08-01",
    });
  });

  it("rolls the year over at the end of the year", () => {
    expect(calendarWindow(new Date("2026-12-10T00:00:00Z"))).toEqual({
      start: "2026-12-01",
      end: "2027-02-01",
    });
  });

  it("is computed in UTC (a late-UTC instant stays in its UTC month)", () => {
    // 2026-06-30T23:30Z is still June in UTC.
    expect(calendarWindow(new Date("2026-06-30T23:30:00Z")).start).toBe(
      "2026-06-01",
    );
  });
});

describe("schemaPathForBinding — entity schema path for list/detail (73d)", () => {
  it("list → /{app}/public/schema/{entity}", () => {
    expect(
      schemaPathForBinding(
        { kind: "list", entity: "occurrence" },
        "occurrences",
      ),
    ).toBe("/occurrences/public/schema/occurrence");
  });

  it("detail → /{app}/public/schema/{entity} (selector is the row id, not the schema)", () => {
    expect(
      schemaPathForBinding(
        { kind: "detail", entity: "occurrence", filter: "abc-1" },
        "occurrences",
      ),
    ).toBe("/occurrences/public/schema/occurrence");
  });

  it("url-encodes the entity segment", () => {
    expect(
      schemaPathForBinding({ kind: "list", entity: "a b" }, "occurrences"),
    ).toBe("/occurrences/public/schema/a%20b");
  });

  it("list/detail without an entity → null (no schema to fetch)", () => {
    expect(schemaPathForBinding({ kind: "list" }, "occurrences")).toBeNull();
    expect(
      schemaPathForBinding({ kind: "detail", filter: "x" }, "occurrences"),
    ).toBeNull();
  });

  it("kinds that don't render a schema (content/map/calendar/status/form/kpi/vote) → null", () => {
    for (const kind of [
      "content",
      "map",
      "calendar",
      "status",
      "form",
      "kpi",
      "vote",
    ] as Binding["kind"][]) {
      expect(
        schemaPathForBinding({ kind, entity: "x", filter: "y" }, "occurrences"),
      ).toBeNull();
    }
  });
});

describe("resolveData — schema is fetched alongside list/detail data (73d)", () => {
  const SCHEMA = {
    entity: "occurrence",
    display_name: "Occurrence",
    fields: [{ key: "title", type: "string", label: "Title" }],
  };

  it("list: fetches BOTH the data and the schema and merges them", async () => {
    const { fetchImpl, calls } = routedFetch({
      data: { ok: true, status: 200, body: { items: [{ id: "1" }] } },
      schema: { ok: true, status: 200, body: SCHEMA },
    });
    const res = await resolveData(
      block({ kind: "list", entity: "occurrence" }),
      { provider: createPublicDataProvider("occurrences", fetchImpl) },
    );
    expect(calls).toContain("/bff/occurrences/public/occurrence");
    expect(calls).toContain("/bff/occurrences/public/schema/occurrence");
    expect(res).toEqual({
      ok: true,
      value: {
        data: { items: [{ id: "1" }] },
        schema: SCHEMA,
        actionDef: null,
        dataPath: "/occurrences/public/occurrence",
      },
    });
  });

  it("detail: data id path and schema entity path are distinct fetches", async () => {
    const { fetchImpl, calls } = routedFetch({
      data: { ok: true, status: 200, body: { id: "row-9", title: "T" } },
      schema: { ok: true, status: 200, body: SCHEMA },
    });
    const res = await resolveData(
      block({ kind: "detail", entity: "occurrence", filter: "row-9" }),
      { provider: createPublicDataProvider("occurrences", fetchImpl) },
    );
    expect(calls).toContain("/bff/occurrences/public/occurrence/row-9");
    expect(calls).toContain("/bff/occurrences/public/schema/occurrence");
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.schema).toEqual(SCHEMA);
  });

  it("a schema MISS does not fail the block — data still renders, schema null (best-effort)", async () => {
    const { fetchImpl } = routedFetch({
      data: { ok: true, status: 200, body: { items: [] } },
      schema: { ok: false, status: 404 },
    });
    const res = await resolveData(
      block({ kind: "list", entity: "occurrence" }),
      { provider: createPublicDataProvider("occurrences", fetchImpl) },
    );
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.data).toEqual({ items: [] });
      expect(res.value.schema).toBeNull();
    }
  });

  it("a schema network error is swallowed — data still renders, schema null", async () => {
    const { fetchImpl } = routedFetch({
      data: { ok: true, status: 200, body: { items: [] } },
      schema: "throw",
    });
    const res = await resolveData(
      block({ kind: "list", entity: "occurrence" }),
      { provider: createPublicDataProvider("occurrences", fetchImpl) },
    );
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.schema).toBeNull();
  });

  it("a schema body that fails to parse is swallowed — data still renders, schema null", async () => {
    // ok:true but .json() throws (malformed body). The block must not fail: the
    // schema is best-effort, so a parse error yields schema null, not a reject.
    const fetchImpl: FetchLike = async (path) => {
      const isSchema = path.includes("/public/schema/");
      return {
        ok: true,
        status: 200,
        json: isSchema
          ? async () => {
              throw new SyntaxError("Unexpected token");
            }
          : async () => ({ items: [{ id: "1" }] }),
      };
    };
    const res = await resolveData(
      block({ kind: "list", entity: "occurrence" }),
      { provider: createPublicDataProvider("occurrences", fetchImpl) },
    );
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.data).toEqual({ items: [{ id: "1" }] });
      expect(res.value.schema).toBeNull();
    }
  });

  it("a DATA failure still fails the block closed even when schema would resolve", async () => {
    const { fetchImpl } = routedFetch({
      data: { ok: false, status: 404 },
      schema: { ok: true, status: 200, body: SCHEMA },
    });
    const res = await resolveData(
      block({ kind: "list", entity: "occurrence" }),
      { provider: createPublicDataProvider("occurrences", fetchImpl) },
    );
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(404);
  });

  it("a list without an entity never fetches a schema (unmappable data → fail closed, no schema call)", async () => {
    const { fetchImpl, calls } = routedFetch({
      data: { ok: true, status: 200 },
    });
    const res = await resolveData(block({ kind: "list" }), {
      provider: createPublicDataProvider("occurrences", fetchImpl),
    });
    expect(res.ok).toBe(false);
    expect(calls).toEqual([]); // neither data nor schema fetched
  });
});

describe("resolveData — `owned-list` reads the citizen's OWN entity lane (#105)", () => {
  /** Route the OWN lane vs the public schema to separate responses. */
  function ownedFetch(routes: {
    owned: { ok: boolean; status: number; body?: unknown };
    schema?: { ok: boolean; status: number; body?: unknown };
  }): { fetchImpl: FetchLike; calls: string[] } {
    const calls: string[] = [];
    const fetchImpl: FetchLike = async (path) => {
      calls.push(path);
      const r = path.includes("/public/schema/")
        ? (routes.schema ?? { ok: false, status: 404 })
        : routes.owned;
      return { ok: r.ok, status: r.status, json: async () => r.body ?? {} };
    };
    return { fetchImpl, calls };
  }

  it("reads /me/owned/{entity} + the public schema, returns {items}+schema+dataPath", async () => {
    const { fetchImpl, calls } = ownedFetch({
      owned: {
        ok: true,
        status: 200,
        body: { items: [{ id: "p1", title: "X" }] },
      },
      schema: {
        ok: true,
        status: 200,
        body: { entity: "proposal", fields: [{ key: "title" }] },
      },
    });
    const res = await resolveData(
      block({ kind: "owned-list", entity: "proposal" }),
      {
        provider: createPublicDataProvider("civic-participation", fetchImpl),
      },
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.data).toEqual({ items: [{ id: "p1", title: "X" }] });
    expect(res.value.schema).toEqual({
      entity: "proposal",
      fields: [{ key: "title" }],
    });
    expect(res.value.dataPath).toBe("/me/owned/proposal");
    // The OWN lane is the authed /me proxy (NOT /bff); the schema is the public /bff.
    expect(calls).toContain("/me/owned/proposal");
    expect(calls).toContain("/bff/civic-participation/public/schema/proposal");
  });

  it("a schema miss still renders (best-effort) — data OK, schema null", async () => {
    const { fetchImpl } = ownedFetch({
      owned: { ok: true, status: 200, body: { items: [] } },
      schema: { ok: false, status: 404 },
    });
    const res = await resolveData(
      block({ kind: "owned-list", entity: "proposal" }),
      {
        provider: createPublicDataProvider("civic-participation", fetchImpl),
      },
    );
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.schema).toBeNull();
  });

  it("fails CLOSED when the OWN lane is non-OK (401 — anonymous/stale session)", async () => {
    const { fetchImpl } = ownedFetch({ owned: { ok: false, status: 401 } });
    const res = await resolveData(
      block({ kind: "owned-list", entity: "proposal" }),
      {
        provider: createPublicDataProvider("civic-participation", fetchImpl),
      },
    );
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(401);
  });

  it("fails CLOSED with no entity (never fetches)", async () => {
    const { fetchImpl, calls } = ownedFetch({
      owned: { ok: true, status: 200 },
    });
    const res = await resolveData(block({ kind: "owned-list" }), {
      provider: createPublicDataProvider("civic-participation", fetchImpl),
    });
    expect(res.ok).toBe(false);
    expect(calls).toEqual([]);
  });
});

describe("resolveData — map + calendar feeds (73e)", () => {
  it("map: fetches /public/map with no query and no schema — even when `now` is present (window is calendar-only)", async () => {
    const { fetchImpl, calls } = fakeFetch({
      ok: true,
      status: 200,
      body: [{ id: "1", lon: -9, lat: 38 }],
    });
    const res = await resolveData(block({ kind: "map" }), {
      provider: createPublicDataProvider("occurrences", fetchImpl),
      now: new Date("2026-06-15T00:00:00Z"), // must NOT leak a window onto a non-calendar path
    });
    expect(calls).toEqual(["/bff/occurrences/public/map"]);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.schema).toBeNull();
  });

  it("calendar: appends the start/end window from deps.now", async () => {
    const { fetchImpl, calls } = fakeFetch({ ok: true, status: 200, body: [] });
    const res = await resolveData(block({ kind: "calendar" }), {
      provider: createPublicDataProvider("occurrences", fetchImpl),
      now: new Date("2026-06-15T00:00:00Z"),
    });
    expect(calls).toEqual([
      "/bff/occurrences/public/calendar?start=2026-06-01&end=2026-08-01",
    ]);
    expect(res.ok).toBe(true);
  });

  it("calendar without a `now` fetches the bare path (endpoint will 422 → fail closed)", async () => {
    const { fetchImpl, calls } = fakeFetch({ ok: false, status: 422 });
    const res = await resolveData(block({ kind: "calendar" }), {
      provider: createPublicDataProvider("occurrences", fetchImpl),
    });
    expect(calls).toEqual(["/bff/occurrences/public/calendar"]);
    expect(res.ok).toBe(false);
  });
});

describe("#75 M5 — forms directory, hero, list scope", () => {
  it("forms → /{app}/public/forms (the service directory)", () => {
    expect(bffPathForBinding({ kind: "forms" }, "occurrences")).toBe(
      "/occurrences/public/forms",
    );
  });

  it("forms is app-first — a participation portal rides it unchanged", () => {
    expect(bffPathForBinding({ kind: "forms" }, "participation")).toBe(
      "/participation/public/forms",
    );
  });

  it("forms has no schema path", () => {
    expect(schemaPathForBinding({ kind: "forms" }, "occurrences")).toBeNull();
  });

  it("list carries binding.limit + binding.order as query params", () => {
    expect(
      bffPathForBinding(
        { kind: "list", entity: "occurrence", limit: 6, order: "-created_at" },
        "occurrences",
      ),
    ).toBe("/occurrences/public/occurrence?limit=6&order_by=-created_at");
  });

  it("list with only order omits limit (and vice versa)", () => {
    expect(
      bffPathForBinding(
        { kind: "list", entity: "occurrence", order: "-created_at" },
        "occurrences",
      ),
    ).toBe("/occurrences/public/occurrence?order_by=-created_at");
    expect(
      bffPathForBinding(
        { kind: "list", entity: "occurrence", limit: 6 },
        "occurrences",
      ),
    ).toBe("/occurrences/public/occurrence?limit=6");
  });

  it("list ignores a non-positive or non-numeric limit", () => {
    expect(
      bffPathForBinding(
        { kind: "list", entity: "occurrence", limit: 0 },
        "occurrences",
      ),
    ).toBe("/occurrences/public/occurrence");
    expect(
      bffPathForBinding(
        {
          kind: "list",
          entity: "occurrence",
          limit: "6" as unknown as number,
        },
        "occurrences",
      ),
    ).toBe("/occurrences/public/occurrence");
  });

  it("list URL-encodes the order value (hostile order never reaches raw)", () => {
    expect(
      bffPathForBinding(
        { kind: "list", entity: "occurrence", order: "a&b=c" },
        "occurrences",
      ),
    ).toBe("/occurrences/public/occurrence?order_by=a%26b%3Dc");
  });

  it("hero resolves OK with null data and NO fetch (presentational kind)", async () => {
    const { fetchImpl, calls } = fakeFetch({ ok: true, status: 200 });
    const res = await resolveData(block({ kind: "hero" }), {
      provider: createPublicDataProvider("occurrences", fetchImpl),
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.data).toBeNull();
      expect(res.value.schema).toBeNull();
    }
    expect(calls).toEqual([]);
  });

  it("every #105 Phase 7 landing kind short-circuits with null data and NO fetch", async () => {
    const presentational = [
      "feature-grid",
      "cta",
      "media-text",
      "steps",
      "testimonial",
      "faq",
      "logo-strip",
      "media-gallery",
    ] as const;
    for (const kind of presentational) {
      const { fetchImpl, calls } = fakeFetch({ ok: true, status: 200 });
      const res = await resolveData(block({ kind }), {
        provider: createPublicDataProvider("civic-participation", fetchImpl),
      });
      expect(res.ok, kind).toBe(true);
      if (res.ok) expect(res.value.data, kind).toBeNull();
      expect(calls, kind).toEqual([]);
    }
  });

  it("forms resolveData fetches the directory through /bff", async () => {
    const { fetchImpl, calls } = fakeFetch({
      ok: true,
      status: 200,
      body: { items: [{ key: "k", label: "L" }] },
    });
    const res = await resolveData(block({ kind: "forms" }), {
      provider: createPublicDataProvider("occurrences", fetchImpl),
    });
    expect(res.ok).toBe(true);
    expect(calls).toEqual(["/bff/occurrences/public/forms"]);
  });

  it("forms upstream failure fails the block closed (502 → not ok)", async () => {
    const { fetchImpl } = fakeFetch({ ok: false, status: 502 });
    const res = await resolveData(block({ kind: "forms" }), {
      provider: createPublicDataProvider("occurrences", fetchImpl),
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(502);
  });
});

describe("#308 — feedViews / activeFeedView (URL-driven view switch)", () => {
  it("parses props.views to the known allowlist", () => {
    expect(feedViews({ views: ["list", "map"] })).toEqual(["list", "map"]);
  });

  it("drops unknown view kinds, keeping order", () => {
    expect(feedViews({ views: ["map", "bogus", "list"] })).toEqual([
      "map",
      "list",
    ]);
  });

  it("defaults to ['list'] when views is missing/empty/invalid", () => {
    expect(feedViews(undefined)).toEqual(["list"]);
    expect(feedViews({})).toEqual(["list"]);
    expect(feedViews({ views: [] })).toEqual(["list"]);
    expect(feedViews({ views: ["nope"] })).toEqual(["list"]);
    expect(feedViews({ views: "map" })).toEqual(["list"]); // non-array
  });

  it("active view = requested when available, else the first (default)", () => {
    const views = feedViews({ views: ["list", "map"] });
    expect(activeFeedView(views, "map")).toBe("map");
    expect(activeFeedView(views, "list")).toBe("list");
    expect(activeFeedView(views, undefined)).toBe("list");
    expect(activeFeedView(views, "calendar")).toBe("list"); // unavailable → default
  });

  it("first configured view wins as default (map-first surface)", () => {
    const views = feedViews({ views: ["map", "list"] });
    expect(activeFeedView(views, undefined)).toBe("map");
  });
});

describe("#308 — appendQuery (forward URL facet params to a feed read)", () => {
  it("merges params onto a path with no query", () => {
    expect(
      appendQuery("/occurrences/public/occurrence", { status: "open" }),
    ).toBe("/occurrences/public/occurrence?status=open");
  });

  it("merges params onto a path that already has a query (& separator)", () => {
    expect(
      appendQuery("/occurrences/public/occurrence?limit=20", {
        status: "open",
      }),
    ).toBe("/occurrences/public/occurrence?limit=20&status=open");
  });

  it("drops empty values and returns the path unchanged for an empty set", () => {
    expect(appendQuery("/x", {})).toBe("/x");
    expect(appendQuery("/x", undefined)).toBe("/x");
    expect(appendQuery("/x", { a: "", b: "1" })).toBe("/x?b=1");
  });

  it("URL-encodes param values", () => {
    expect(appendQuery("/x", { q: "a b&c" })).toBe("/x?q=a+b%26c");
  });
});

describe("#308 — resolveData feed kind (active view → underlying feed)", () => {
  const SCHEMA = {
    entity: "occurrence",
    fields: [{ key: "status", type: "string", label: "Status" }],
  };

  it("feed with no ?view resolves the FIRST configured view (list) + its schema", async () => {
    const { fetchImpl, calls } = routedFetch({
      data: { ok: true, status: 200, body: { items: [{ id: "1" }] } },
      schema: { ok: true, status: 200, body: SCHEMA },
    });
    const res = await resolveData(
      blockWithProps(
        { kind: "feed", entity: "occurrence" },
        { views: ["list", "map"] },
      ),
      { provider: createPublicDataProvider("occurrences", fetchImpl) },
    );
    expect(calls).toContain("/bff/occurrences/public/occurrence");
    expect(calls).toContain("/bff/occurrences/public/schema/occurrence");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.dataPath).toBe("/occurrences/public/occurrence");
      expect(res.value.schema).toEqual(SCHEMA);
    }
  });

  it("feed with ?view=map resolves the MAP feed (entity ignored), no schema", async () => {
    const { fetchImpl, calls } = fakeFetch({
      ok: true,
      status: 200,
      body: { markers: [], filterable_fields: ["status"], searchable: false },
    });
    const res = await resolveData(
      blockWithProps(
        { kind: "feed", entity: "occurrence" },
        { views: ["list", "map"] },
      ),
      {
        provider: createPublicDataProvider("occurrences", fetchImpl),
        view: "map",
      },
    );
    expect(calls).toEqual(["/bff/occurrences/public/map"]);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.dataPath).toBe("/occurrences/public/map");
      expect(res.value.schema).toBeNull();
    }
  });

  it("an unavailable ?view falls back to the default view (list)", async () => {
    const { fetchImpl, calls } = routedFetch({
      data: { ok: true, status: 200, body: { items: [] } },
      schema: { ok: true, status: 200, body: SCHEMA },
    });
    await resolveData(
      blockWithProps(
        { kind: "feed", entity: "occurrence" },
        { views: ["list", "map"] },
      ),
      {
        provider: createPublicDataProvider("occurrences", fetchImpl),
        view: "calendar",
      },
    );
    expect(calls).toContain("/bff/occurrences/public/occurrence");
  });

  it("forwards URL facet params to the feed read (server-filtered SSR)", async () => {
    const { fetchImpl, calls } = routedFetch({
      data: { ok: true, status: 200, body: { items: [] } },
      schema: { ok: true, status: 200, body: SCHEMA },
    });
    const res = await resolveData(
      blockWithProps(
        { kind: "feed", entity: "occurrence", limit: 20 },
        { views: ["list", "map"] },
      ),
      {
        provider: createPublicDataProvider("occurrences", fetchImpl),
        filterParams: { status: "open" },
      },
    );
    expect(calls).toContain(
      "/bff/occurrences/public/occurrence?limit=20&status=open",
    );
    // dataPath carries the filter so paging (?after=) stays on the filtered set
    if (res.ok) {
      expect(res.value.dataPath).toBe(
        "/occurrences/public/occurrence?limit=20&status=open",
      );
    }
  });

  it("forwards facet params to the map feed too (list + map share the channel)", async () => {
    const { fetchImpl, calls } = fakeFetch({ ok: true, status: 200, body: {} });
    await resolveData(
      blockWithProps(
        { kind: "feed", entity: "occurrence" },
        { views: ["map"] },
      ),
      {
        provider: createPublicDataProvider("occurrences", fetchImpl),
        view: "map",
        filterParams: { freguesia: "uuid-1" },
      },
    );
    expect(calls).toEqual(["/bff/occurrences/public/map?freguesia=uuid-1"]);
  });
});

describe("#308 — resolveData filters kind (data = entity schema)", () => {
  const SCHEMA = {
    entity: "occurrence",
    filterable_fields: ["status", "occurrence_type.id"],
    searchable: true,
    fields: [{ key: "status", label: "Status" }],
  };

  it("resolves the entity schema as its data (declared facets)", async () => {
    const { fetchImpl, calls } = fakeFetch({
      ok: true,
      status: 200,
      body: SCHEMA,
    });
    const res = await resolveData(
      block({ kind: "filters", entity: "occurrence" }),
      { provider: createPublicDataProvider("occurrences", fetchImpl) },
    );
    expect(calls).toEqual(["/bff/occurrences/public/schema/occurrence"]);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.data).toEqual(SCHEMA);
      expect(res.value.dataPath).toBe("/occurrences/public/schema/occurrence");
    }
  });

  it("filters without an entity soft-empties (ok, null) — never a fetch", async () => {
    const { fetchImpl, calls } = fakeFetch({ ok: true, status: 200 });
    const res = await resolveData(block({ kind: "filters" }), {
      provider: createPublicDataProvider("occurrences", fetchImpl),
    });
    expect(calls).toEqual([]);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.data).toBeNull();
  });

  it("a schema 404 soft-empties the optional filters slot (no false loud-fail; fix the surface's browse placement)", async () => {
    const { fetchImpl } = fakeFetch({ ok: false, status: 404 });
    const res = await resolveData(
      block({ kind: "filters", entity: "proposal" }),
      { provider: createPublicDataProvider("civic-participation", fetchImpl) },
    );
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.data).toBeNull();
  });
});

describe("#105 Phase 5 — resolveData subscriptions kind (authed account lane)", () => {
  it("reads /me/notifications/subscriptions (NOT the /bff public surface)", async () => {
    const ENVELOPE = { items: [{ id: "s1", filters: null, is_active: true }] };
    const { fetchImpl, calls } = fakeFetch({
      ok: true,
      status: 200,
      body: ENVELOPE,
    });
    const res = await resolveData(block({ kind: "subscriptions" }), {
      provider: createPublicDataProvider("civic-participation", fetchImpl),
    });
    // The account lane — never a /bff/{app}/public path.
    expect(calls).toEqual(["/me/notifications/subscriptions"]);
    expect(res.ok).toBe(true);
    if (res.ok) {
      // #252 Anexo 110 — the envelope is augmented with the resolved scope
      // option-views; with no `scopes` declared on the block, that is [].
      expect(res.value.data).toEqual({ ...ENVELOPE, scopes: [] });
      expect(res.value.dataPath).toBe("/me/notifications/subscriptions");
      expect(res.value.schema).toBeNull();
    }
  });

  it("scopes: reads each declared option-view and shapes {value,label} options (#252 Anexo 110)", async () => {
    const calls: string[] = [];
    const fetchImpl = async (path: string) => {
      calls.push(path);
      const body = path.includes("civic_proposal_editions")
        ? { items: [{ edition_id: "e1", edition_name: "OP Jovem 2026" }] }
        : { items: [] };
      return { ok: true, status: 200, json: async () => body };
    };
    const res = await resolveData(
      blockWithProps(
        { kind: "subscriptions" },
        {
          scopes: [
            {
              key: "edition",
              group: "Edição",
              view: "civic_proposal_editions",
              value_field: "edition_id",
              label_field: "edition_name",
            },
          ],
        },
      ),
      { provider: createPublicDataProvider("civic-participation", fetchImpl) },
    );
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect((res.value.data as { scopes: unknown }).scopes).toEqual([
        {
          key: "edition",
          group: "Edição",
          options: [{ value: "e1", label: "OP Jovem 2026" }],
        },
      ]);
      // sourced from the PUBLIC option-view, not the account lane.
      expect(calls).toContain(
        "/bff/civic-participation/public/civic_proposal_editions?limit=200",
      );
    }
  });

  it("fails the block CLOSED on a non-OK account lane (401/upstream) — the page is auth-gated upstream", async () => {
    const { fetchImpl } = fakeFetch({ ok: false, status: 401 });
    const res = await resolveData(block({ kind: "subscriptions" }), {
      provider: createPublicDataProvider("civic-participation", fetchImpl),
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(401);
  });
});

describe("#105 Phase 5 slice 2 — resolveData consent kind (authed account lane)", () => {
  it("reads /me/consent (NOT the /bff public surface)", async () => {
    const ENVELOPE = {
      purposes: [{ code: "analytics", label: "Analytics" }],
      records: [{ id: "r1", purpose: "analytics", state: "active" }],
    };
    const { fetchImpl, calls } = fakeFetch({
      ok: true,
      status: 200,
      body: ENVELOPE,
    });
    const res = await resolveData(block({ kind: "consent" }), {
      provider: createPublicDataProvider("civic-participation", fetchImpl),
    });
    expect(calls).toEqual(["/me/consent"]);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.data).toEqual(ENVELOPE);
      expect(res.value.dataPath).toBe("/me/consent");
      expect(res.value.schema).toBeNull();
    }
  });

  it("fails the block CLOSED on a non-OK account lane (the page is auth-gated upstream)", async () => {
    const { fetchImpl } = fakeFetch({ ok: false, status: 401 });
    const res = await resolveData(block({ kind: "consent" }), {
      provider: createPublicDataProvider("civic-participation", fetchImpl),
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(401);
  });
});

describe("#75 M5 slice 3 — detail expand + lookup", () => {
  it("detail carries sanitized binding.expand as ?expand=", () => {
    expect(
      bffPathForBinding(
        {
          kind: "detail",
          entity: "occurrence",
          filter: "id-1",
          expand: ["images", "comments"],
        },
        "occurrences",
      ),
    ).toBe("/occurrences/public/occurrence/id-1?expand=images%2Ccomments");
  });

  it("junk expand names are dropped; none left → bare path", () => {
    expect(
      bffPathForBinding(
        {
          kind: "detail",
          entity: "occurrence",
          filter: "id-1",
          expand: ["Evil;Drop", "../x", ""],
        },
        "occurrences",
      ),
    ).toBe("/occurrences/public/occurrence/id-1");
  });

  it("lookup resolves OK with null data and NO fetch (presentational)", async () => {
    const { fetchImpl, calls } = fakeFetch({ ok: true, status: 200 });
    const res = await resolveData(block({ kind: "lookup" }), {
      provider: createPublicDataProvider("occurrences", fetchImpl),
    });
    expect(res.ok).toBe(true);
    expect(calls).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// DataProvider seam — createPublicDataProvider byte-identical to today
// ---------------------------------------------------------------------------

describe("DataProvider seam — createPublicDataProvider byte-identical to today", () => {
  const noop: FetchLike = async () => ({
    ok: true,
    status: 200,
    json: async () => ({}),
  });

  it("dataUrl list → raw /{app}/public/{entity} path (no /bff prefix)", () => {
    const p = createPublicDataProvider("occurrences", noop);
    expect(p.dataUrl({ kind: "list", entity: "occurrence" })).toBe(
      "/occurrences/public/occurrence",
    );
  });

  it("dataUrl calendar with calendarWindow → /{app}/public/calendar?start=&end=", () => {
    const p = createPublicDataProvider("occurrences", noop);
    expect(
      p.dataUrl(
        { kind: "calendar" },
        { calendarWindow: { start: "2026-06-01", end: "2026-08-01" } },
      ),
    ).toBe("/occurrences/public/calendar?start=2026-06-01&end=2026-08-01");
  });

  it("dataUrl list with filterParams → raw path with params appended", () => {
    const p = createPublicDataProvider("occurrences", noop);
    expect(
      p.dataUrl(
        { kind: "list", entity: "occurrence" },
        { filterParams: { status: "open" } },
      ),
    ).toBe("/occurrences/public/occurrence?status=open");
  });

  it("dataUrl unmappable binding → null (fail-closed)", () => {
    const p = createPublicDataProvider("occurrences", noop);
    expect(p.dataUrl({ kind: "list" })).toBeNull(); // no entity
  });

  it("schemaUrl list → raw /{app}/public/schema/{entity} path (no /bff prefix)", () => {
    const p = createPublicDataProvider("occurrences", noop);
    expect(p.schemaUrl({ kind: "list", entity: "occurrence" })).toBe(
      "/occurrences/public/schema/occurrence",
    );
  });

  it("schemaUrl content → null (content has no schema endpoint)", () => {
    const p = createPublicDataProvider("occurrences", noop);
    expect(p.schemaUrl({ kind: "content", filter: "privacy" })).toBeNull();
  });

  it("accountUrl notifications/subscriptions → /me/notifications/subscriptions (no /bff)", () => {
    const p = createPublicDataProvider("occurrences", noop);
    expect(p.accountUrl("notifications/subscriptions")).toBe(
      "/me/notifications/subscriptions",
    );
  });

  it("accountUrl consent → /me/consent (no /bff)", () => {
    const p = createPublicDataProvider("occurrences", noop);
    expect(p.accountUrl("consent")).toBe("/me/consent");
  });

  it("optionViewUrl → /bff/{app}/public/{view}?limit={n}", () => {
    const p = createPublicDataProvider("civic-participation", noop);
    expect(p.optionViewUrl("civic_proposal_editions", 200)).toBe(
      "/bff/civic-participation/public/civic_proposal_editions?limit=200",
    );
  });
});
