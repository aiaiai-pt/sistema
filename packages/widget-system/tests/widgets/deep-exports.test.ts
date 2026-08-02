// Per-widget deep exports — taking ONE face without the barrel.
//
// `@aiaiai-pt/widget-system/widgets` imports every widget, so a consumer that
// binds a single face through the barrel also drags in NativeChartWidget and
// therefore ECharts and the design system's EChart. Because the design system
// is an OPTIONAL peer, that failure does not surface at install — it surfaces at
// the CONSUMER'S BUILD, as an unresolved import for a component they never asked
// for. A coupling nobody chose, discovered at the worst moment.
//
// The deep exports (`…/widgets/IndicatorCardWidget`) resolve straight to the
// component file, so a consumer takes one face and nothing else. The barrel
// stays for registry consumers who genuinely want the whole set.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const PKG = join(import.meta.dirname, "../..");
const pkg = JSON.parse(readFileSync(join(PKG, "package.json"), "utf-8")) as {
  exports: Record<string, Record<string, string>>;
  peerDependencies: Record<string, string>;
};

/** Every face that `registerBaseWidgets` puts in a host's registry. */
const REGISTERED_WIDGETS = [
  "NativeChartWidget",
  "EmbeddedAnalysisWidget",
  "EntryStreamWidget",
  "IndicatorCardWidget",
  "DefinitionMembersCardWidget",
  "ChartTileMockWidget",
];

describe("per-widget deep exports", () => {
  it("the barrel is still exported for registry consumers", () => {
    expect(pkg.exports["./widgets"]).toBeDefined();
  });

  for (const widget of REGISTERED_WIDGETS) {
    it(`${widget} has a deep export`, () => {
      const entry = pkg.exports[`./widgets/${widget}`];
      expect(
        entry,
        `A registered widget with no deep export forces consumers through the ` +
          `barrel, which drags in every other widget.`,
      ).toBeDefined();
      expect(entry.svelte).toBe(`./src/widgets/${widget}.svelte`);
      // The `svelte` condition matters: without it a bundler takes `default`
      // and may skip the svelte plugin for this path.
      expect(entry.types).toBe(entry.svelte);
    });
  }

  it("no deep export points at a file that does not exist", () => {
    const missing: string[] = [];
    for (const [name, entry] of Object.entries(pkg.exports)) {
      if (!name.startsWith("./widgets/")) continue;
      const target = entry.default;
      try {
        readFileSync(join(PKG, target), "utf-8");
      } catch {
        missing.push(`${name} → ${target}`);
      }
    }
    expect(missing).toEqual([]);
  });
});

describe("a deep-imported face carries no chart stack", () => {
  // The whole point of the deep export: taking one face must not reach the
  // chart widget, ECharts, or the design system's EChart. Read the actual
  // import graph rather than trusting the export map.
  function importsOf(file: string): string[] {
    const text = readFileSync(join(PKG, "src/widgets", file), "utf-8");
    return [...text.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
  }

  const CHART_MARKERS = ["echarts", "EChart", "NativeChart"];

  for (const widget of [
    "IndicatorCardWidget",
    "EntryStreamWidget",
    "DefinitionMembersCardWidget",
    "ChartTileMockWidget",
  ]) {
    it(`${widget} reaches nothing chart-related`, () => {
      const offenders = importsOf(`${widget}.svelte`).filter((spec) =>
        CHART_MARKERS.some((marker) => spec.includes(marker)),
      );
      expect(
        offenders,
        `${widget} imports ${offenders.join(", ")} — a consumer taking this ` +
          "one face would inherit the chart stack.",
      ).toEqual([]);
    });
  }

  it("none of them import the barrel (which would re-couple everything)", () => {
    for (const widget of REGISTERED_WIDGETS) {
      const specs = importsOf(`${widget}.svelte`);
      expect(
        specs.filter((s) => s === "./index" || s.endsWith("/widgets/index")),
        `${widget} imports the widgets barrel`,
      ).toEqual([]);
    }
  });

  it("the chart widget is the one that legitimately does", () => {
    // A control: if this ever comes back empty, the marker list has gone stale
    // and the assertions above are proving nothing.
    const specs = importsOf("NativeChartWidget.svelte");
    expect(
      specs.some((s) => CHART_MARKERS.some((m) => s.includes(m))),
      "NativeChartWidget should still import the chart stack",
    ).toBe(true);
  });
});

describe("the design-system peer floor", () => {
  it("excludes the versions whose SealChip predates the vocabulary rework", () => {
    // Published 0.50.0 ships a SealChip that takes a vocabulary STRING and has
    // no guard. These widgets pass a resolved TERM, so against 0.50.0 the seal
    // renders silently wrong rather than failing. An install-time refusal is
    // the only place that can be caught.
    const floor = pkg.peerDependencies["@aiaiai-pt/design-system"];
    expect(floor).not.toContain("0.47");
    expect(floor).toMatch(/>=0\.51\.0/);
  });
});
