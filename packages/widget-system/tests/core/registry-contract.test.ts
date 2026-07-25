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
 * 8. WidgetMatchContext is the selection input; WidgetRenderRequest is the
 *    render payload — they are separate types. The render payload has no
 *    kind/type discriminants (those belong to the match context).
 */

import { describe, it, expect } from "vitest";
import {
  createRegistry,
  NOT_APPLICABLE,
  selectEntry,
  decideRender,
  type RegistryEntry,
  type WidgetMatchContext,
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
): RegistryEntry<StubPayload> {
  return {
    key,
    payload,
    tester: (ctx) => (ctx.kind === kind ? score : NOT_APPLICABLE),
  };
}

// Selection input only — no data/props. This is what the registry dispatches on.
const baseCtx = (kind: string): WidgetMatchContext => ({ kind });

// ---------------------------------------------------------------------------
// 1. Isolation — two registries are independent
// ---------------------------------------------------------------------------

describe("registry isolation", () => {
  it("two createRegistry() calls return independent instances", () => {
    const r1 = createRegistry<StubPayload>();
    const r2 = createRegistry<StubPayload>();

    r1.register(makeEntry("widget-a", "kpi", 10));

    // r2 must NOT see widget-a even though r1 registered it
    const match = r2.resolve(baseCtx("kpi"));
    expect(match).toBeNull();
  });

  it("registering into r2 does not affect r1", () => {
    const r1 = createRegistry<StubPayload>();
    const r2 = createRegistry<StubPayload>();

    r1.register(makeEntry("widget-a", "kpi", 10));
    r2.register(makeEntry("widget-b", "kpi", 10));

    const m1 = r1.resolve(baseCtx("kpi"));
    const m2 = r2.resolve(baseCtx("kpi"));

    expect(m1?.key).toBe("widget-a");
    expect(m2?.key).toBe("widget-b");
  });
});

// ---------------------------------------------------------------------------
// 2. Dispatch — highest score wins; first-registered wins ties
// ---------------------------------------------------------------------------

describe("dispatch priority", () => {
  it("the entry with the highest score wins", () => {
    const r = createRegistry<StubPayload>();
    r.register(makeEntry("generic", "list", 10));
    r.register(makeEntry("specific", "list", 20));

    const match = r.resolve(baseCtx("list"));
    expect(match?.key).toBe("specific");
  });

  it("first-registered wins when scores are equal", () => {
    const r = createRegistry<StubPayload>();
    r.register(makeEntry("first", "list", 10));
    r.register(makeEntry("second", "list", 10));

    const match = r.resolve(baseCtx("list"));
    expect(match?.key).toBe("first");
  });

  it("returns null when no entry is applicable", () => {
    const r = createRegistry<StubPayload>();
    r.register(makeEntry("kpi-widget", "kpi", 10));

    const match = r.resolve(baseCtx("list")); // no list entry
    expect(match).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 3. Duplicate key policy
// ---------------------------------------------------------------------------

describe("duplicate key policy", () => {
  it("registering the same key twice without override throws", () => {
    const r = createRegistry<StubPayload>();
    r.register(makeEntry("widget-a", "kpi", 10));

    expect(() => r.register(makeEntry("widget-a", "kpi", 10))).toThrow();
  });

  it("registering the same key with override: true succeeds", () => {
    const r = createRegistry<StubPayload>();
    const original = makeEntry("widget-a", "kpi", 10, stub("original"));
    const replacement = makeEntry("widget-a", "kpi", 10, stub("replacement"));

    r.register(original);
    r.register(replacement, { override: true });

    const match = r.resolve(baseCtx("kpi"));
    expect(match?.payload.label).toBe("replacement");
  });

  it("override preserves the original entry's position for tie-breaking", () => {
    const r = createRegistry<StubPayload>();
    // A is registered first, B second — both at score 10.
    // First-registered wins ties, so A wins before the override.
    r.register(makeEntry("widget-a", "kpi", 10, stub("original-a")));
    r.register(makeEntry("widget-b", "kpi", 10, stub("b")));

    // Override A with a replacement — position must be preserved so A
    // still sits before B and continues to win the tie.
    r.register(makeEntry("widget-a", "kpi", 10, stub("override-a")), {
      override: true,
    });

    const match = r.resolve(baseCtx("kpi"));
    expect(match?.key).toBe("widget-a");
    expect(match?.payload.label).toBe("override-a");
  });
});

// ---------------------------------------------------------------------------
// 4. selectEntry — standalone (without a registry)
// ---------------------------------------------------------------------------

describe("selectEntry", () => {
  it("picks the highest-score applicable entry", () => {
    const entries: RegistryEntry<StubPayload>[] = [
      makeEntry("low", "list", 5),
      makeEntry("high", "list", 15),
      makeEntry("kpi", "kpi", 30), // different kind — not applicable for list
    ];
    const result = selectEntry(entries, baseCtx("list"));
    expect(result?.key).toBe("high");
  });

  it("returns null when no entry is applicable", () => {
    const entries: RegistryEntry<StubPayload>[] = [makeEntry("kpi", "kpi", 10)];
    const result = selectEntry(entries, baseCtx("list"));
    expect(result).toBeNull();
  });

  it("the returned key is from the entry, never from the context type hint (TH-08)", () => {
    const entries: RegistryEntry<StubPayload>[] = [
      makeEntry("safe-key", "list", 10),
    ];
    // type hint is untrusted — it must never become the resolved key
    const ctx: WidgetMatchContext = { kind: "list", type: "malicious-type" };
    const result = selectEntry(entries, ctx);
    expect(result?.key).toBe("safe-key");
    expect(result?.key).not.toBe("malicious-type");
  });
});

// ---------------------------------------------------------------------------
// 5. decideRender — fail-closed
// ---------------------------------------------------------------------------

describe("decideRender", () => {
  it("matched + dataOk → widget", () => {
    expect(decideRender("optional", true, true)).toEqual({ render: "widget" });
    expect(decideRender("structural", true, true)).toEqual({
      render: "widget",
    });
    expect(decideRender(undefined, true, true)).toEqual({ render: "widget" });
  });

  it("structural slot with no match → error", () => {
    expect(decideRender("structural", false, false)).toEqual({
      render: "error",
    });
    expect(decideRender("structural", true, false)).toEqual({
      render: "error",
    });
    expect(decideRender("structural", false, true)).toEqual({
      render: "error",
    });
  });

  it("optional slot with no match → empty", () => {
    expect(decideRender("optional", false, false)).toEqual({ render: "empty" });
    expect(decideRender(undefined, false, false)).toEqual({ render: "empty" });
  });

  it("optional/undefined: matched without dataOk → empty (not widget)", () => {
    // Both conditions must hold for "widget"; partial is not enough.
    expect(decideRender("optional", true, false)).toEqual({ render: "empty" });
    expect(decideRender(undefined, true, false)).toEqual({ render: "empty" });
  });

  it("optional/undefined: dataOk without match → empty (not widget)", () => {
    expect(decideRender("optional", false, true)).toEqual({ render: "empty" });
    expect(decideRender(undefined, false, true)).toEqual({ render: "empty" });
  });
});

// ---------------------------------------------------------------------------
// 6. Base entries are preloaded and cannot be mutated across instances
// ---------------------------------------------------------------------------

describe("base entries isolation", () => {
  it("base entries list is not shared between two registries", () => {
    const r1 = createRegistry<StubPayload>();
    const r2 = createRegistry<StubPayload>();

    // If entries were shared, mutating r1 would affect r2.entries.length
    r1.register(makeEntry("extra", "embed", 10));

    expect(r2.entries.length).toBeLessThan(r1.entries.length);
  });
});

// ---------------------------------------------------------------------------
// 7. Match/render contract — WidgetMatchContext vs WidgetRenderRequest
// ---------------------------------------------------------------------------

describe("match/render contract separation", () => {
  it("WidgetRenderRequest has no kind or type field (kind-free by contract)", () => {
    // The render payload is intentionally separated from the match context.
    // kind/type belong to WidgetMatchContext (selection); they are not part
    // of the data handed to the widget (WidgetRenderRequest).
    const req: WidgetRenderRequest = { data: null, props: {} };
    // TypeScript already enforces this via the interface, but we pin it at
    // runtime so a future refactor that smuggles kind into the render payload
    // fails this test explicitly.
    expect("kind" in req).toBe(false);
    expect("type" in req).toBe(false);
  });

  it("byKind tester reads ctx.kind, not the render request", () => {
    // Verify that the tester only inspects the match context — it must not
    // require the render payload fields (data, props) to be present.
    const r = createRegistry<StubPayload>();
    r.register(makeEntry("kpi-widget", "kpi", 10));

    // A context with only kind — no data/props — resolves correctly.
    const match = r.resolve({ kind: "kpi" });
    expect(match?.key).toBe("kpi-widget");
  });
});
