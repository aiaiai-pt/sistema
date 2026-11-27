// Regression guard for ECharts 6 hover (emphasis) colour parsing.
//
// ECharts / ZRender computes hover-state fills in JS via `color.lift()`.
// `color-mix(in srgb, ...)` draws fine at rest (Canvas 2D passes it to the
// browser), but `zrender/lib/tool/color.parse()` returns `undefined` for
// `color-mix(...)` — making `lift()` return `undefined` and turning the
// hovered bar / slice / point invisible.
//
// @vitest-environment node

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart, ScatterChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  TooltipComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import { LegacyGridContainLabel } from "echarts/features";
import { lift as zrLift, parse as zrParse } from "zrender/lib/tool/color.js";
import {
  buildChartOption,
  mutedColor,
  seriesColor,
  withAlpha,
} from "../components/renderer/chart-option";
import type { ChartData } from "../components/renderer/aggregate";

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkAreaComponent,
  SVGRenderer,
  LegacyGridContainLabel,
]);

const TOKENS = {
  accent: "#2e7d32",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  surface: "#ffffff",
};

function assertZRenderSafe(color: string, label: string) {
  expect(color, `${label} must not emit CSS color-mix()`).not.toContain("color-mix");
  expect(zrParse(color), `${label} (${color}) must parse in ZRender`).toBeDefined();
  const lifted = zrLift(color, -0.1);
  expect(typeof lifted, `${label} (${color}) must lift cleanly on emphasis`).toBe("string");
  expect(lifted, `${label} (${color}) lift must not be empty`).toBeTruthy();
}

describe("withAlpha — ZRender-safe CSS colour formatting", () => {
  it("converts #hex, rgb(), rgba(), and space-separated rgb() into ZRender-safe strings", () => {
    expect(withAlpha("#2e7d32", 1)).toBe("rgb(46, 125, 50)");
    expect(withAlpha("#2e7d32", 0.85)).toBe("rgba(46, 125, 50, 0.85)");
    expect(withAlpha("#0f0", 0.5)).toBe("rgba(0, 255, 0, 0.5)");
    expect(withAlpha("#2e7d3280", 0.5)).toBe("rgba(46, 125, 50, 0.251)");
    expect(withAlpha("rgb(46, 125, 50)", 0.35)).toBe("rgba(46, 125, 50, 0.35)");
    expect(withAlpha("rgba(46, 125, 50, 0.5)", 0.5)).toBe("rgba(46, 125, 50, 0.25)");
    expect(withAlpha("rgb(46 125 50 / 50%)", 0.5)).toBe("rgba(46, 125, 50, 0.25)");
  });

  it("never emits color-mix() for seriesColor or mutedColor", () => {
    for (let i = 0; i < 6; i++) {
      assertZRenderSafe(seriesColor(TOKENS.accent, i), `seriesColor(${i})`);
    }
    assertZRenderSafe(mutedColor(TOKENS.textSecondary), "mutedColor");
  });
});

describe("buildChartOption — every emitted colour survives ZRender emphasis", () => {
  it("emits ZRender-liftable colours across bar, line, area, scatter, muted, band, and axisPointer", () => {
    const data: ChartData = {
      category: ["critical", "high", "medium"],
      series: [
        { name: "Cases", type: "bar", data: [2, 4, 6] },
        { name: "Trend", type: "line", data: [1, 3, 5] },
        { name: "Area", type: "area", data: [2, 2, 4] },
        { name: "Dots", type: "scatter", data: [3, 4, 2] },
        { name: "Baseline", type: "bar", tone: "muted", data: [1, 1, 1] },
      ],
    };
    const opt = buildChartOption(data, {
      tokens: TOKENS,
      band: { from: "high", to: "medium", label: "Focus" },
    }) as any;

    for (const s of opt.series) {
      assertZRenderSafe(s.itemStyle.color, `${s.name}.itemStyle.color`);
      if (s.lineStyle?.color) {
        assertZRenderSafe(s.lineStyle.color, `${s.name}.lineStyle.color`);
      }
    }
    assertZRenderSafe(opt.series[0].markArea.itemStyle.color, "markArea.itemStyle.color");
    assertZRenderSafe(
      opt.tooltip.axisPointer.shadowStyle.color,
      "tooltip.axisPointer.shadowStyle.color",
    );
  });

  it("emits ZRender-liftable palette colours for pie/donut charts", () => {
    const opt = buildChartOption(
      {
        category: ["open", "closed", "referred"],
        series: [{ name: "Status", type: "pie", data: [10, 8, 5] }],
      },
      { tokens: TOKENS, innerRadius: 0.45 },
    ) as any;

    expect(opt.color).toHaveLength(3);
    opt.color.forEach((c: string, i: number) => assertZRenderSafe(c, `pie.color[${i}]`));
  });

  it("keeps a highlighted bar visibly filled in ECharts 6 when emphasis activates", () => {
    const opt = buildChartOption(
      {
        category: ["critical", "high", "medium"],
        series: [{ name: "Pessoas em risco elevado", type: "bar", data: [2, 4, 6] }],
      },
      { tokens: TOKENS },
    );
    const chart = echarts.init(null, null, {
      renderer: "svg",
      ssr: true,
      width: 480,
      height: 320,
    });
    try {
      chart.setOption(opt);
      chart.dispatchAction({ type: "highlight", seriesIndex: 0, dataIndex: 2 });
      const svg = chart.renderToSVGString();
      // Every bar path must carry a concrete fill (never `fill="none"` or `undefined`).
      expect(svg).not.toContain("color-mix");
      expect(svg).not.toContain('fill="undefined"');
      // At least 3 non-empty filled bar shapes (2 rest bars + 1 lifted emphasis bar).
      const filledPaths = svg.match(/<path[^>]*fill="(?:rgb|rgba|#)[^"]+"[^>]*>/g) ?? [];
      expect(filledPaths.length).toBeGreaterThanOrEqual(3);
    } finally {
      chart.dispose();
    }
  });
});

describe("EChart.svelte accessible table styles", () => {
  it("aligns numeric column headers to end and uses the live --color-text token", () => {
    const source = readFileSync("components/EChart.svelte", "utf8");
    expect(source).toContain(".echart-table thead th:not(:first-child)");
    expect(source).toContain("text-align: end;");
    // The stale nonexistent --color-text-primary must not appear in the style block.
    const styleBlock = source.slice(source.indexOf("<style>"));
    expect(styleBlock).not.toContain("--color-text-primary");
    expect(styleBlock).toContain("color: var(--color-text);");
  });
});
