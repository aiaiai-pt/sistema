// #176 follow-on — pure ECharts `option` builder. The contract: a column-aligned
// `{ category, series[] }` + theme tokens produces an ECharts option with the
// right axes, per-series geometry (bar/line/area/scatter/pie), stacking, and an
// optional 2nd value axis. Tested directly (no mocking ECharts) by asserting on
// the produced option's structure.

import { describe, expect, it } from "vitest";
import { buildChartOption } from "../components/renderer/chart-option";
import type { ChartData } from "../components/renderer/aggregate";

const TOKENS = {
  accent: "#2563eb",
  textPrimary: "#111",
  textSecondary: "#222",
  border: "#333",
};

const opts = (extra: Record<string, unknown> = {}) =>
  ({ tokens: TOKENS, locale: "en", ...extra }) as Parameters<
    typeof buildChartOption
  >[1];

const bars: ChartData = {
  category: ["Open", "In progress", "Resolved"],
  series: [
    { name: "Open", type: "bar", data: [12, 5, 0] },
    { name: "Resolved", type: "bar", data: [3, 7, 31] },
  ],
};

describe("buildChartOption", () => {
  it("returns an empty option for no data (soft-empty)", () => {
    expect(buildChartOption({ category: [], series: [] }, opts())).toEqual({});
    expect(buildChartOption({ category: ["A"], series: [] }, opts())).toEqual(
      {},
    );
  });

  it("puts the category on the x-axis and values on the y-axis (vertical default)", () => {
    const o = buildChartOption(bars, opts()) as any;
    expect(o.xAxis.type).toBe("category");
    expect(o.xAxis.data).toEqual(["Open", "In progress", "Resolved"]);
    expect(Array.isArray(o.yAxis)).toBe(true);
    expect(o.yAxis).toHaveLength(1);
    expect(o.yAxis[0].type).toBe("value");
  });

  it("maps each series to its ECharts geometry and keeps the data", () => {
    const o = buildChartOption(
      {
        category: ["A", "B"],
        series: [
          { name: "bar", type: "bar", data: [1, 2] },
          { name: "line", type: "line", data: [3, 4] },
          { name: "area", type: "area", data: [5, 6] },
          { name: "dots", type: "scatter", data: [7, 8] },
        ],
      },
      opts(),
    ) as any;
    expect(o.series.map((s: any) => s.type)).toEqual([
      "bar",
      "line",
      "line", // area is a line + areaStyle
      "scatter",
    ]);
    expect(o.series[2].areaStyle).toBeTruthy();
    expect(o.series[0].data).toEqual([1, 2]);
    expect(o.series[3].data).toEqual([7, 8]);
  });

  it("passes a stack id through to the bar series", () => {
    const o = buildChartOption(
      {
        category: ["A"],
        series: [
          { name: "x", type: "bar", data: [1], stack: "g" },
          { name: "y", type: "bar", data: [2], stack: "g" },
        ],
      },
      opts(),
    ) as any;
    expect(o.series[0].stack).toBe("g");
    expect(o.series[1].stack).toBe("g");
  });

  it("adds a 2nd value axis and pins the secondary series to it", () => {
    const o = buildChartOption(
      {
        category: ["A", "B"],
        series: [
          { name: "count", type: "bar", data: [1, 2] },
          { name: "avg", type: "line", data: [3, 4], axis: "secondary" },
        ],
      },
      opts({ ySecondary: true }),
    ) as any;
    expect(o.yAxis).toHaveLength(2);
    expect(o.series[0].yAxisIndex).toBe(0);
    expect(o.series[1].yAxisIndex).toBe(1);
  });

  it("swaps axes for horizontal orientation and reverses for top-down reading", () => {
    const o = buildChartOption(
      bars,
      opts({ orientation: "horizontal" }),
    ) as any;
    // value dimension is x; category is y, reversed so the first row reads top.
    expect(Array.isArray(o.xAxis)).toBe(true);
    expect(o.xAxis[0].type).toBe("value");
    expect(o.yAxis.type).toBe("category");
    expect(o.yAxis.data).toEqual(["Resolved", "In progress", "Open"]);
    expect(o.series[0].data).toEqual([0, 5, 12]); // reversed with the category
  });

  it("renders a pie when the first series type is pie (single-measure)", () => {
    const o = buildChartOption(
      {
        category: ["A", "B", "C"],
        series: [{ name: "votes", type: "pie", data: [10, 20, 30] }],
      },
      opts({ innerRadius: 0.5 }),
    ) as any;
    expect(o.series[0].type).toBe("pie");
    expect(o.series[0].data).toEqual([
      { name: "A", value: 10 },
      { name: "B", value: 20 },
      { name: "C", value: 30 },
    ]);
    expect(o.series[0].radius[0]).toBe("50%");
    expect(o.xAxis).toBeUndefined();
  });

  it("shows a legend only when asked", () => {
    expect((buildChartOption(bars, opts()) as any).legend).toBeUndefined();
    const o = buildChartOption(bars, opts({ legend: true })) as any;
    expect(o.legend.show).toBe(true);
    expect(o.legend.data).toEqual(["Open", "Resolved"]);
  });
});
