/**
 * DS renderer registry — base entries + `registerWidget` extension hook (#492).
 *
 * The Svelte component imports in `registry.ts` are mocked with string stubs so
 * this test runs in a pure Node environment (no Svelte compiler needed). The
 * test verifies:
 *   1. The base registry ships exactly the two DS-owned widgets.
 *   2. `registerWidget` appends host entries that `resolveWidget` can dispatch.
 *   3. `byKind` / `byTypeOnKind` produce the correct tester behaviour.
 *   4. TH-08: `resolveWidget` always returns a known-good key literal, never the
 *      operator's raw `type` or `binding.kind`.
 */
import { describe, it, expect, vi } from "vitest";

// Mock the Svelte widget files BEFORE importing registry.ts so that when
// registry.ts initialises its module-level `_entries` array the stubs are
// already in place (vi.mock is hoisted by vitest's AST transform).
vi.mock("../components/renderer/StatGridWidget.svelte", () => ({
  default: "StatGridWidget-stub",
}));
vi.mock("../components/renderer/ResultsChartWidget.svelte", () => ({
  default: "ResultsChartWidget-stub",
}));
vi.mock("../components/renderer/EChartWidget.svelte", () => ({
  default: "EChartWidget-stub",
}));

import {
  resolveWidget,
  registerWidget,
  byKind,
  byTypeOnKind,
} from "../components/renderer/registry";
import { NOT_APPLICABLE, selectEntry } from "../components/renderer/dispatch";
import type { Block, WidgetKind } from "../components/renderer/types";

function block(kind: WidgetKind, extra: Partial<Block["binding"]> = {}): Block {
  return { type: "x", slot: "main", binding: { kind, ...extra } };
}

// ---------------------------------------------------------------------------
// Base registry — the two DS-owned widgets
// ---------------------------------------------------------------------------
describe("DS base registry — shipped widgets (#492)", () => {
  it("routes kpi → stat-grid (StatGridWidget)", () => {
    const m = resolveWidget(block("kpi"));
    expect(m?.key).toBe("stat-grid");
    expect(m?.payload).toBe("StatGridWidget-stub");
  });

  it("routes aggregate (default) → ranking-board is NOT in the DS base; kpi → stat-grid", () => {
    // The DS base does NOT ship ranking-board; aggregate with no type hint
    // has no match in the base registry.
    const m = resolveWidget(block("aggregate", { entity: "results" }));
    // results-chart is type-ranked (score 20) — without the matching type hint
    // it does NOT fire. stat-grid is kpi-ranked. Nothing matches aggregate with
    // no type hint → null.
    expect(m).toBeNull();
  });

  it("routes aggregate + type:'results-chart' → results-chart (ResultsChartWidget)", () => {
    const m = resolveWidget({
      type: "results-chart",
      slot: "charts",
      binding: { kind: "aggregate", entity: "civic_voting_results" },
    });
    expect(m?.key).toBe("results-chart");
    expect(m?.payload).toBe("ResultsChartWidget-stub");
  });

  it("routes aggregate + type:'chart' → chart (EChartWidget, #498)", () => {
    const m = resolveWidget({
      type: "chart",
      slot: "charts",
      binding: { kind: "aggregate", entity: "civic_voting_results" },
    });
    expect(m?.key).toBe("chart");
    expect(m?.payload).toBe("EChartWidget-stub");
  });

  it("the two aggregate type-widgets do not collide: 'chart' and 'results-chart' resolve independently", () => {
    const echart = resolveWidget({
      type: "chart",
      slot: "c",
      binding: { kind: "aggregate", entity: "x" },
    });
    const css = resolveWidget({
      type: "results-chart",
      slot: "c",
      binding: { kind: "aggregate", entity: "x" },
    });
    expect(echart?.key).toBe("chart");
    expect(css?.key).toBe("results-chart");
    // An aggregate block with neither type hint still matches nothing in the base.
    expect(resolveWidget(block("aggregate", { entity: "x" }))).toBeNull();
  });

  it("retires the per-kind line-chart / donut-chart keys (#176 follow-on)", () => {
    // The kind is now PER-SERIES; one `chart` (EChartWidget) renders any spec,
    // so the kind-specific keys no longer resolve in the base registry.
    expect(
      resolveWidget({
        type: "line-chart",
        slot: "charts",
        binding: { kind: "aggregate", entity: "x" },
      }),
    ).toBeNull();
    expect(
      resolveWidget({
        type: "donut-chart",
        slot: "charts",
        binding: { kind: "aggregate", entity: "x" },
      }),
    ).toBeNull();
    // The single ECharts key still resolves and renders every series shape.
    expect(
      resolveWidget({
        type: "chart",
        slot: "c",
        binding: { kind: "aggregate", entity: "x" },
      })?.key,
    ).toBe("chart");
  });

  it("an unknown kind returns null (no dangling import, fail closed)", () => {
    expect(resolveWidget(block("list", { entity: "occurrence" }))).toBeNull();
    expect(
      resolveWidget(block("detail", { entity: "x", filter: "1" })),
    ).toBeNull();
    expect(resolveWidget(block("map"))).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// `registerWidget` — host-extensible hook
// ---------------------------------------------------------------------------
describe("registerWidget — host apps append their own widgets", () => {
  // Registrations persist within this file's module scope (module singleton).
  // Tests in this block intentionally build on each other's registrations.

  it("a registered byKind widget is discoverable by resolveWidget", () => {
    registerWidget(byKind("entity-list", "list", "EntityListWidget-stub"));
    const m = resolveWidget(block("list", { entity: "occurrence" }));
    expect(m?.key).toBe("entity-list");
    expect(m?.payload).toBe("EntityListWidget-stub");
  });

  it("a registered byTypeOnKind widget out-ranks the generic kind match", () => {
    // `byKind("entity-list", "list", ...)` was registered in the test above.
    registerWidget(
      byTypeOnKind("occurrence-list", "list", "OccurrenceList-stub"),
    );
    // Same kind, matching type hint → score 20 beats score 10.
    const specific = resolveWidget({
      type: "occurrence-list",
      slot: "main",
      binding: { kind: "list", entity: "occurrence" },
    });
    expect(specific?.key).toBe("occurrence-list");

    // No type hint → generic entity-list still wins.
    const generic = resolveWidget(block("list", { entity: "occurrence" }));
    expect(generic?.key).toBe("entity-list");
  });

  it("a host widget does not shadow the DS base entries (base wins ties by registration order)", () => {
    // Even after host registration, the base kpi → stat-grid entry still works.
    const m = resolveWidget(block("kpi"));
    expect(m?.key).toBe("stat-grid");
  });

  it("registering the SAME key twice keeps both (last-registered loses ties; first wins)", () => {
    registerWidget(byKind("dupe-key", "forms", "First-stub"));
    registerWidget(byKind("dupe-key", "forms", "Second-stub"));
    // Both score 10; first registered wins ties.
    const m = resolveWidget(block("forms"));
    expect(m?.key).toBe("dupe-key");
    expect(m?.payload).toBe("First-stub");
  });
});

// ---------------------------------------------------------------------------
// byKind / byTypeOnKind — pure helper behaviour
// ---------------------------------------------------------------------------
describe("byKind helper — generic kind tester (score 10)", () => {
  it("fires with score 10 when binding.kind matches, NOT_APPLICABLE otherwise", () => {
    const entry = byKind("test-widget", "list", "stub");
    expect(entry.tester({ kind: "list" }, null)).toBe(10);
    expect(entry.tester({ kind: "map" }, null)).toBe(NOT_APPLICABLE);
  });

  it("key and payload are forwarded unchanged", () => {
    const entry = byKind("my-key", "kpi", "MyComponent");
    expect(entry.key).toBe("my-key");
    expect(entry.payload).toBe("MyComponent");
  });
});

describe("byTypeOnKind helper — type-specific tester (score 20)", () => {
  it("fires with score 20 when BOTH kind AND type match, NOT_APPLICABLE otherwise", () => {
    const entry = byTypeOnKind("results-chart", "aggregate", "stub");
    expect(entry.tester({ kind: "aggregate" }, null, "results-chart")).toBe(20);
    // Right kind, wrong type.
    expect(entry.tester({ kind: "aggregate" }, null, "other-type")).toBe(
      NOT_APPLICABLE,
    );
    // Right type, wrong kind.
    expect(entry.tester({ kind: "list" }, null, "results-chart")).toBe(
      NOT_APPLICABLE,
    );
    // No type hint at all.
    expect(entry.tester({ kind: "aggregate" }, null, undefined)).toBe(
      NOT_APPLICABLE,
    );
  });

  it("score 20 out-ranks a byKind score 10 on the same kind", () => {
    // Use selectEntry directly with local entries — independent of registry state.
    const entries = [
      byKind("generic", "aggregate", "Generic"),
      byTypeOnKind("specific", "aggregate", "Specific"),
    ];
    // With matching type hint: specific wins (score 20 > 10).
    expect(
      selectEntry(entries, { kind: "aggregate" }, null, "specific")?.key,
    ).toBe("specific");
    // Without type hint: generic wins (specific tester returns NOT_APPLICABLE).
    expect(selectEntry(entries, { kind: "aggregate" }, null)?.key).toBe(
      "generic",
    );
  });
});

// ---------------------------------------------------------------------------
// TH-08 — the key is always a registry literal, never the binding value
// ---------------------------------------------------------------------------
describe("TH-08 — resolveWidget returns registry key literals, never operator input", () => {
  it("a hostile type hint does not affect the resolved key", () => {
    const m = resolveWidget({
      type: '"><script>alert(1)</script>',
      slot: "main",
      binding: { kind: "kpi" },
    });
    // kpi → stat-grid (from the DS base); the type hint has no entry so
    // byKind score 10 still wins; the key is the registry literal.
    expect(m?.key).toBe("stat-grid");
    expect(m?.key).not.toContain("script");
  });

  it("a hostile entity in the binding never surfaces in the key", () => {
    // A prior test registered entity-list for list; either way the key returned
    // must be the registry literal, never the hostile entity string.
    const m = resolveWidget(block("list", { entity: '"><img onerror="x"/>' }));
    if (m !== null) {
      expect(m.key).toMatch(/^[a-z][a-z-]*$/); // kebab registry literal only
      expect(m.key).not.toContain("img");
      expect(m.key).not.toContain("onerror");
    }
    // A kind with NO registration anywhere in this file fails closed → null.
    const noMatch = resolveWidget(block("map"));
    expect(noMatch).toBeNull();
  });
});
