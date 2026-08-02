// @vitest-environment jsdom
//
// Producer self-verification of the published consumer contract fixtures
// (S2.2 #61). Wires the REAL widget-system implementation (core + widgets) into
// the exported `runContract` harness and asserts every case passes — proving
// the producer honours the contract it ships to consumers. The same harness is
// what Admin/workspace/Portal run against the version THEY install (the
// cross-repo consumer proof lives in an atelier package test).
//
// jsdom + the svelte plugin so `registerBaseWidgets` can import the real
// `.svelte` widgets; the fixtures module itself is pure (core types only).
import { describe, it, expect } from "vitest";
import {
  createRegistry,
  byKind,
  byTypeOnKind,
  selectEntry,
  resolveWidgetState,
  NOT_APPLICABLE,
} from "../../src/core/index.ts";
import {
  registerBaseWidgets,
  NATIVE_CHART_KIND,
  NATIVE_CHART_KEY,
  EMBEDDED_ANALYSIS_KIND,
  EMBEDDED_ANALYSIS_KEY,
  INDICATOR_CARD_KIND,
  INDICATOR_CARD_KEY,
  safeEmbedSrc,
} from "../../src/widgets/index.ts";
import {
  runContract,
  CONTRACT_CASES,
  CONTRACT_VERSION,
  type WidgetSystemContract,
} from "../../src/fixtures/index.ts";

const impl: WidgetSystemContract = {
  createRegistry,
  byKind,
  byTypeOnKind,
  selectEntry,
  resolveWidgetState,
  NOT_APPLICABLE,
  registerBaseWidgets,
  NATIVE_CHART_KIND,
  NATIVE_CHART_KEY,
  EMBEDDED_ANALYSIS_KIND,
  EMBEDDED_ANALYSIS_KEY,
  INDICATOR_CARD_KIND,
  INDICATOR_CARD_KEY,
  safeEmbedSrc,
};

describe("widget-system consumer contract fixtures — producer self-verification (#61)", () => {
  it(`runs contract v${CONTRACT_VERSION} with every case passing (no skips when the widget layer is wired)`, () => {
    const assert = (cond: boolean, msg: string) => expect(cond, msg).toBe(true);
    const result = runContract(impl, assert);

    expect(result.version).toBe(CONTRACT_VERSION);
    expect(result.cases).toHaveLength(CONTRACT_CASES.length);
    // With the full widget layer injected, nothing is skipped.
    expect(result.cases.every((c) => c.outcome === "passed")).toBe(true);
  });

  it("widget-layer cases are SKIPPED for a core-only consumer", () => {
    // A consumer that has not wired /widgets still runs the generic contract;
    // the widget-layer cases report skipped rather than failing.
    const coreOnly: WidgetSystemContract = {
      createRegistry,
      byKind,
      byTypeOnKind,
      selectEntry,
      resolveWidgetState,
      NOT_APPLICABLE,
    };
    const assert = (cond: boolean, msg: string) => expect(cond, msg).toBe(true);
    const result = runContract(coreOnly, assert);

    const byName = Object.fromEntries(result.cases.map((c) => [c.name, c.outcome]));
    const skipped = result.cases.filter((c) => c.outcome === "skipped");
    // Three cases need the /widgets layer: the two base widgets, plus
    // cross-host placement (which resolves a registered card face).
    expect(skipped).toHaveLength(3);
    expect(byName[CONTRACT_CASES[2].name]).toBe("skipped"); // native chart
    expect(byName[CONTRACT_CASES[3].name]).toBe("skipped"); // embedded analysis
    expect(byName[CONTRACT_CASES[6].name]).toBe("skipped"); // cross-host placement
    // The generic cases still pass.
    expect(byName[CONTRACT_CASES[0].name]).toBe("passed"); // isolation
    expect(byName[CONTRACT_CASES[5].name]).toBe("passed"); // SSR determinism
  });
});
