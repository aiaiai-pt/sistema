import { describe, it, expect } from "vitest";
import {
  NOT_APPLICABLE,
  selectEntry,
  decideRender,
  type RegistryEntry,
} from "../components/renderer/dispatch";
import type { Binding } from "../components/renderer/types";

// Component-free payloads — the ranking core is generic so it's testable
// without importing Svelte. The real registry substitutes Components.
type P = string;

function entry(
  key: string,
  payload: P,
  score: (b: Binding) => number,
): RegistryEntry<P> {
  return { key, payload, tester: (b) => score(b) };
}

const listBinding: Binding = { kind: "list", entity: "occurrence" };

describe("selectEntry — tester/priority dispatch (D4, JSONForms model)", () => {
  it("returns the single applicable entry", () => {
    const entries = [
      entry("entity-list", "EntityList", (b) =>
        b.kind === "list" ? 10 : NOT_APPLICABLE,
      ),
    ];
    expect(selectEntry(entries, listBinding, null)).toEqual({
      key: "entity-list",
      payload: "EntityList",
    });
  });

  it("a more specific tester outranks the generic one (open/closed override)", () => {
    const entries = [
      entry("entity-list", "EntityList", (b) =>
        b.kind === "list" ? 10 : NOT_APPLICABLE,
      ),
      entry("occurrence-list", "OccurrenceList", (b) =>
        b.kind === "list" && b.entity === "occurrence" ? 20 : NOT_APPLICABLE,
      ),
    ];
    expect(selectEntry(entries, listBinding, null)?.key).toBe(
      "occurrence-list",
    );
  });

  it("the generic entry still wins for a different entity (specific tester N/A)", () => {
    const entries = [
      entry("entity-list", "EntityList", (b) =>
        b.kind === "list" ? 10 : NOT_APPLICABLE,
      ),
      entry("occurrence-list", "OccurrenceList", (b) =>
        b.kind === "list" && b.entity === "occurrence" ? 20 : NOT_APPLICABLE,
      ),
    ];
    expect(
      selectEntry(entries, { kind: "list", entity: "equipment" }, null)?.key,
    ).toBe("entity-list");
  });

  it("returns null when no tester is applicable (caller fails closed)", () => {
    const entries = [
      entry("entity-list", "EntityList", (b) =>
        b.kind === "list" ? 10 : NOT_APPLICABLE,
      ),
    ];
    expect(selectEntry(entries, { kind: "map" }, null)).toBeNull();
  });

  it("returns null for an empty registry", () => {
    expect(selectEntry([], listBinding, null)).toBeNull();
  });

  it("accepts a score of 0 as applicable (lowest priority, still a match)", () => {
    const entries = [entry("fallback", "Fallback", () => 0)];
    expect(selectEntry(entries, listBinding, null)?.key).toBe("fallback");
  });

  it("ties resolve to the first-registered entry (stable, deterministic)", () => {
    const entries = [
      entry("first", "First", () => 10),
      entry("second", "Second", () => 10),
    ];
    expect(selectEntry(entries, listBinding, null)?.key).toBe("first");
  });

  it("TH-08: the resolved key is the registry literal, never the binding's kind/entity", () => {
    // A malicious-looking binding must never have its strings surface as the key.
    const nasty: Binding = {
      kind: "list",
      entity: '"><script>alert(1)</script>',
    };
    const entries = [
      entry("entity-list", "EntityList", (b) =>
        b.kind === "list" ? 10 : NOT_APPLICABLE,
      ),
    ];
    const m = selectEntry(entries, nasty, null);
    expect(m?.key).toBe("entity-list");
    expect(m?.key).not.toContain("script");
  });
});

describe("decideRender — fail-closed per blast radius (§14.8)", () => {
  it("renders the widget when matched and data resolved", () => {
    expect(decideRender({ importance: "optional" }, true, true)).toEqual({
      render: "widget",
    });
  });

  it("optional widget that fails to match → soft-empty", () => {
    expect(decideRender({ importance: "optional" }, false, true)).toEqual({
      render: "empty",
    });
  });

  it("optional widget whose data fails → soft-empty", () => {
    expect(decideRender({ importance: "optional" }, true, false)).toEqual({
      render: "empty",
    });
  });

  it("structural slot that fails to match → visible error (must NOT silently vanish)", () => {
    expect(decideRender({ importance: "structural" }, false, true)).toEqual({
      render: "error",
    });
  });

  it("structural slot whose data fails → visible error", () => {
    expect(decideRender({ importance: "structural" }, true, false)).toEqual({
      render: "error",
    });
  });

  it("structural slot renders the widget when fully resolved", () => {
    expect(decideRender({ importance: "structural" }, true, true)).toEqual({
      render: "widget",
    });
  });

  it("defaults to optional (soft-empty) when importance is unset", () => {
    expect(decideRender({}, false, false)).toEqual({ render: "empty" });
  });
});

describe("selectEntry — type-aware ranking (#74, JSONForms-style)", () => {
  it("a type-specific tester out-ranks the generic kind tester for the same kind", () => {
    const entries: RegistryEntry<P>[] = [
      {
        key: "entity-list",
        payload: "EntityList",
        tester: (b) => (b.kind === "list" ? 10 : NOT_APPLICABLE),
      },
      {
        key: "filter-bar",
        payload: "FilterBar",
        tester: (b, _s, type) =>
          b.kind === "list" && type === "filter-bar" ? 20 : NOT_APPLICABLE,
      },
    ];
    // Same binding kind; the block `type` decides which widget wins.
    expect(selectEntry(entries, listBinding, null, "filter-bar")?.key).toBe(
      "filter-bar",
    );
    expect(selectEntry(entries, listBinding, null, "entity-list")?.key).toBe(
      "entity-list",
    );
    // No type → only the generic kind widget applies.
    expect(selectEntry(entries, listBinding, null)?.key).toBe("entity-list");
  });
});
