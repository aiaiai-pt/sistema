/**
 * Contract tests for @aiaiai-pt/widget-system/core registry and dispatch.
 *
 * These tests define the BEHAVIOR contract; they are deliberately written
 * before the implementation (S1.1 #56) so that a no-op/stub implementation
 * cannot satisfy them. S1.2 (#57) turns them green.
 *
 * Contract invariants:
 * 1. createRegistry() returns an isolated instance — two registries cannot
 *    observe each other's registrations.
 * 2. The entry with the highest tester score wins; first-registered wins ties.
 * 3. Duplicate key registration without override throws loudly.
 * 4. An explicit override succeeds silently.
 * 5. selectEntry returns null when no tester is applicable.
 * 6. decideRender fails closed (error) for structural slots; soft-empty for
 *    optional slots.
 * 7. A deliberate cross-instance registration fails to appear in the other
 *    registry.
 */

import { describe, it, expect } from "vitest";
import {
  createRegistry,
  NOT_APPLICABLE,
  selectEntry,
  decideRender,
  type RegistryEntry,
  type WidgetRenderRequest,
} from "../../src/core/index.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const stub = (label: string) => ({ label });
type StubPayload = { label: string };

function makeEntry(
  key: string,
  kind: string,
  score: number,
  payload: StubPayload = stub(key),
): RegistryEntry<StubPayload, WidgetRenderRequest & { kind?: string }> {
  return {
    key,
    payload,
    tester: (req) => (req.kind === kind ? score : NOT_APPLICABLE),
  };
}

const baseReq = (kind: string): WidgetRenderRequest & { kind: string } => ({
  data: null,
  props: {},
  kind,
});

// ---------------------------------------------------------------------------
// 1. Isolation — two registries are independent
// ---------------------------------------------------------------------------

describe("registry isolation", () => {
  it("two createRegistry() calls return independent instances", () => {
    const r1 = createRegistry<StubPayload, WidgetRenderRequest & { kind?: string }>();
    const r2 = createRegistry<StubPayload, WidgetRenderRequest & { kind?: string }>();

    r1.register(makeEntry("widget-a", "kpi", 10));

    // r2 must NOT see widget-a even though r1 registered it
    const match = r2.resolve(baseReq("kpi"));
    expect(match).toBeNull();
  });

  it("registering into r2 does not affect r1", () => {
    const r1 = createRegistry<StubPayload, WidgetRenderRequest & { kind?: string }>();
    const r2 = createRegistry<StubPayload, WidgetRenderRequest & { kind?: string }>();

    r1.register(makeEntry("widget-a", "kpi", 10));
    r2.register(makeEntry("widget-b", "kpi", 10));

    const m1 = r1.resolve(baseReq("kpi"));
    const m2 = r2.resolve(baseReq("kpi"));

    expect(m1?.key).toBe("widget-a");
    expect(m2?.key).toBe("widget-b");
  });
});

// ---------------------------------------------------------------------------
// 2. Dispatch — highest score wins; first-registered wins ties
// ---------------------------------------------------------------------------

describe("dispatch priority", () => {
  it("the entry with the highest score wins", () => {
    const r = createRegistry<StubPayload, WidgetRenderRequest & { kind?: string }>();
    r.register(makeEntry("generic", "list", 10));
    r.register(makeEntry("specific", "list", 20));

    const match = r.resolve(baseReq("list"));
    expect(match?.key).toBe("specific");
  });

  it("first-registered wins when scores are equal", () => {
    const r = createRegistry<StubPayload, WidgetRenderRequest & { kind?: string }>();
    r.register(makeEntry("first", "list", 10));
    r.register(makeEntry("second", "list", 10));

    const match = r.resolve(baseReq("list"));
    expect(match?.key).toBe("first");
  });

  it("returns null when no entry is applicable", () => {
    const r = createRegistry<StubPayload, WidgetRenderRequest & { kind?: string }>();
    r.register(makeEntry("kpi-widget", "kpi", 10));

    const match = r.resolve(baseReq("list")); // no list entry
    expect(match).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 3. Duplicate key policy
// ---------------------------------------------------------------------------

describe("duplicate key policy", () => {
  it("registering the same key twice without override throws", () => {
    const r = createRegistry<StubPayload, WidgetRenderRequest & { kind?: string }>();
    r.register(makeEntry("widget-a", "kpi", 10));

    expect(() => r.register(makeEntry("widget-a", "kpi", 10))).toThrow();
  });

  it("registering the same key with override: true succeeds", () => {
    const r = createRegistry<StubPayload, WidgetRenderRequest & { kind?: string }>();
    const original = makeEntry("widget-a", "kpi", 10, stub("original"));
    const replacement = makeEntry("widget-a", "kpi", 10, stub("replacement"));

    r.register(original);
    r.register(replacement, { override: true });

    const match = r.resolve(baseReq("kpi"));
    expect(match?.payload.label).toBe("replacement");
  });
});

// ---------------------------------------------------------------------------
// 4. selectEntry — standalone (without a registry)
// ---------------------------------------------------------------------------

describe("selectEntry", () => {
  it("picks the highest-score applicable entry", () => {
    const entries: RegistryEntry<StubPayload, WidgetRenderRequest & { kind?: string }>[] = [
      makeEntry("low", "list", 5),
      makeEntry("high", "list", 15),
      makeEntry("kpi", "kpi", 30), // different kind — not applicable for list
    ];
    const result = selectEntry(entries, baseReq("list"));
    expect(result?.key).toBe("high");
  });

  it("returns null when no entry is applicable", () => {
    const entries: RegistryEntry<StubPayload, WidgetRenderRequest & { kind?: string }>[] = [
      makeEntry("kpi", "kpi", 10),
    ];
    const result = selectEntry(entries, baseReq("list"));
    expect(result).toBeNull();
  });

  it("the returned key is from the entry, never from the request", () => {
    const entries: RegistryEntry<StubPayload, WidgetRenderRequest & { kind?: string }>[] = [
      makeEntry("safe-key", "list", 10),
    ];
    const req = { data: null, props: {}, kind: "list", type: "malicious-type" };
    const result = selectEntry(entries, req);
    expect(result?.key).toBe("safe-key");
  });
});

// ---------------------------------------------------------------------------
// 5. decideRender — fail-closed
// ---------------------------------------------------------------------------

describe("decideRender", () => {
  it("matched + dataOk → widget", () => {
    expect(decideRender("optional", true, true)).toEqual({ render: "widget" });
    expect(decideRender("structural", true, true)).toEqual({ render: "widget" });
    expect(decideRender(undefined, true, true)).toEqual({ render: "widget" });
  });

  it("structural slot with no match → error", () => {
    expect(decideRender("structural", false, false)).toEqual({ render: "error" });
    expect(decideRender("structural", true, false)).toEqual({ render: "error" });
    expect(decideRender("structural", false, true)).toEqual({ render: "error" });
  });

  it("optional slot with no match → empty", () => {
    expect(decideRender("optional", false, false)).toEqual({ render: "empty" });
    expect(decideRender(undefined, false, false)).toEqual({ render: "empty" });
  });
});

// ---------------------------------------------------------------------------
// 6. Base entries are preloaded and cannot be mutated across instances
// ---------------------------------------------------------------------------

describe("base entries isolation", () => {
  it("base entries list is not shared between two registries", () => {
    const r1 = createRegistry<StubPayload, WidgetRenderRequest & { kind?: string }>();
    const r2 = createRegistry<StubPayload, WidgetRenderRequest & { kind?: string }>();

    // If entries were shared, mutating r1 would affect r2.entries.length
    r1.register(makeEntry("extra", "embed", 10));

    expect(r2.entries.length).toBeLessThan(r1.entries.length);
  });
});
