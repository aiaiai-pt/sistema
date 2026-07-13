// #773 — echarts 6 render-compatibility guard for the DS chart option.
//
// `renderer-chart-option.test.ts` asserts the SHAPE of `buildChartOption`'s
// output; it never hands that option to echarts, so it can't catch an option
// key echarts 6 stopped accepting (or a render-time throw). The jsdom
// component test (`renderer-chart-components.test.ts`) mounts EChart but its
// canvas fail-soft swallows any echarts error — so neither existing test
// proves our option actually RENDERS on echarts 6.
//
// This does: it drives the REAL `buildChartOption` output for every chart type
// EChart.svelte can emit (bar / horizontal bar / line / area / scatter / pie /
// donut / stacked / dual-axis) through echarts 6's SSR renderer
// (`init(null, null, { ssr: true, renderer: 'svg' })` + `renderToSVGString`) —
// the same modular use()/init/setOption pipeline EChart mounts, minus the
// browser canvas. A throw in setOption (an option key echarts 6 rejects) or an
// empty SVG fails the test. The renderer is SVG here only because SSR needs no
// DOM; option compatibility (the migration risk) is renderer-independent.
//
// @vitest-environment node

import { describe, expect, it } from "vitest";
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart, ScatterChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import { LegacyGridContainLabel } from "echarts/features";
import { buildChartOption } from "../components/renderer/chart-option";
import type { ChartData, SeriesData } from "../components/renderer/aggregate";

// Mirror EChart.svelte's registration exactly (SVGRenderer replaces the
// browser CanvasRenderer for SSR — the only difference from the component).
// LegacyGridContainLabel is the echarts 6 opt-in that keeps `grid.containLabel`
// working (see EChart.svelte) — registering it here proves the component's
// registration is sufficient AND silences the "no use(LegacyGridContainLabel)"
// warning the bare echarts-6 core emits.
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  SVGRenderer,
  LegacyGridContainLabel,
]);

const TOKENS = {
  accent: "#2563eb",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
};

const opts = (extra: Record<string, unknown> = {}) =>
  ({ tokens: TOKENS, locale: "en", ...extra }) as Parameters<
    typeof buildChartOption
  >[1];

const CATEGORY = ["Open", "In progress", "Resolved"];
const series = (
  type: SeriesData["type"],
  extra: Partial<SeriesData> = {},
): SeriesData => ({
  name: `s-${type}`,
  type,
  data: [12, 5, 31],
  ...extra,
});

/** Render an option through echarts 6 (SSR/SVG) and return the SVG string.
 *  Throws exactly as the component's `chart.setOption` would if echarts 6
 *  rejects a key. */
function renderToSVG(option: Record<string, unknown>): string {
  const chart = echarts.init(null, null, {
    renderer: "svg",
    ssr: true,
    width: 480,
    height: 320,
  });
  try {
    chart.setOption(option);
    return chart.renderToSVGString();
  } finally {
    chart.dispose();
  }
}

/** Every chart shape EChart.svelte can produce from `buildChartOption`. */
const CASES: Array<{
  name: string;
  data: ChartData;
  opts: ReturnType<typeof opts>;
}> = [
  {
    name: "vertical bar",
    data: { category: CATEGORY, series: [series("bar")] },
    opts: opts(),
  },
  {
    name: "horizontal bar",
    data: { category: CATEGORY, series: [series("bar")] },
    opts: opts({ orientation: "horizontal" }),
  },
  {
    name: "line",
    data: { category: CATEGORY, series: [series("line")] },
    opts: opts(),
  },
  {
    name: "area",
    data: { category: CATEGORY, series: [series("area")] },
    opts: opts(),
  },
  {
    name: "scatter",
    data: { category: CATEGORY, series: [series("scatter")] },
    opts: opts(),
  },
  {
    name: "pie",
    data: { category: CATEGORY, series: [series("pie")] },
    opts: opts({ legend: true }),
  },
  {
    name: "donut",
    data: { category: CATEGORY, series: [series("pie")] },
    opts: opts({ innerRadius: 0.45 }),
  },
  {
    name: "stacked multi-series bar + legend",
    data: {
      category: CATEGORY,
      series: [
        series("bar", { stack: "t" }),
        series("bar", { name: "s2", stack: "t" }),
      ],
    },
    opts: opts({ legend: true }),
  },
  {
    name: "dual-axis bar + line",
    data: {
      category: CATEGORY,
      series: [
        series("bar"),
        series("line", { name: "s2", axis: "secondary" }),
      ],
    },
    opts: opts({ ySecondary: true, legend: true }),
  },
];

describe("echarts 6 renders every DS chart type from buildChartOption", () => {
  it.each(CASES)(
    "renders $name without throwing, producing an SVG",
    ({ data, opts }) => {
      const option = buildChartOption(data, opts);
      let svg = "";
      expect(() => {
        svg = renderToSVG(option);
      }).not.toThrow();
      // A real render emits an <svg> with drawn geometry (path/rect/circle),
      // not an empty shell — proves the option was accepted AND plotted.
      expect(svg).toMatch(/<svg[\s>]/);
      expect(svg).toMatch(/<(path|rect|circle|polyline)[\s>]/);
    },
  );

  it("emits no echarts warning during a cartesian render (containLabel is registered)", () => {
    // echarts 6 warns to console when `grid.containLabel` is used without
    // `use(LegacyGridContainLabel)`. Our registration includes it, so a
    // cartesian render must be warning-free — this guards a future drop of the
    // feature (which would silently clip axis labels, invisible to the option
    // shape test).
    const warns: string[] = [];
    const spy = (m?: unknown) => warns.push(String(m));
    const origWarn = console.warn;
    const origError = console.error;
    console.warn = spy;
    console.error = spy;
    try {
      renderToSVG(
        buildChartOption(
          { category: CATEGORY, series: [series("bar")] },
          opts({ legend: true }),
        ),
      );
    } finally {
      console.warn = origWarn;
      console.error = origError;
    }
    expect(warns.filter((w) => /containLabel/i.test(w))).toEqual([]);
  });

  it("reports the echarts major under test (guards the bump itself)", async () => {
    const { version } = await import("echarts");
    expect(Number(version.split(".")[0])).toBeGreaterThanOrEqual(6);
  });
});
