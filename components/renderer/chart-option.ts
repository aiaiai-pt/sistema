/**
 * Declarative chart → ECharts `option` builder (#176 follow-on) — PURE.
 *
 * The single place that turns a column-aligned `{ category, series[] }`
 * (`ChartData`, produced by `toSeriesData`) into an Apache ECharts `option`.
 * Extracted out of `EChart.svelte` so it is unit-testable with real inputs
 * (no mocking ECharts): feed it a `ChartData` + theme tokens and assert on the
 * produced option's structure.
 *
 * Theming is token-driven (the caller reads the live `--color-*` tokens off the
 * chart container and passes them in) — there is NO hardcoded colour list; the
 * per-series / per-slice palette is an ALPHA RAMP off the single `--color-accent`
 * so any number of series stays on-theme through dark / high-contrast schemes.
 *
 * The option CONTAINS DS-supplied formatter functions (locale number formatting,
 * tooltip composition). That is deliberate and does NOT violate the JSON-only
 * constraint — the constraint forbids OPERATOR-authored functions in the spec;
 * the behaviours here are the DS's own, chosen from the curated surface. The
 * returned object is handed straight to `chart.setOption` in-process; it is not
 * serialised.
 */

import type { ChartData, SeriesData } from "./aggregate";

/** Live semantic tokens read off the chart container. */
export interface ChartTokens {
  accent: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

export interface BuildChartOptionOpts {
  tokens: ChartTokens;
  /** BCP-47 locale for number formatting. */
  locale?: string;
  /** Render a legend (auto-on is the caller's decision). */
  legend?: boolean;
  /** Cartesian orientation; `vertical` (category on x) is the default. */
  orientation?: "horizontal" | "vertical";
  /** Enable a 2nd value axis for `axis: "secondary"` series. */
  ySecondary?: boolean;
  /** Pie/donut hole as a fraction of the outer radius (0 = full pie). */
  innerRadius?: number;
}

/** A localised number formatter (DS-supplied — never operator code). */
function makeFmt(locale: string): (value: number) => string {
  const nf = new Intl.NumberFormat(locale);
  return (value: number) => nf.format(value);
}

/**
 * Per-series / per-slice colour: an alpha ramp off the accent so N series stay
 * distinguishable AND on-theme without a hardcoded palette. `color-mix` keeps
 * it in the live colour space, so it re-themes with the tokens.
 */
export function seriesColor(accent: string, i: number): string {
  const alpha = Math.max(0.35, 1 - i * 0.15);
  return `color-mix(in srgb, ${accent} ${Math.round(alpha * 100)}%, transparent)`;
}

/** True when the chart should render as a pie/donut (single-measure mode). */
function isPie(series: ReadonlyArray<SeriesData>): boolean {
  return series.length > 0 && series[0].type === "pie";
}

function buildPieOption(
  data: ChartData,
  opts: BuildChartOptionOpts,
): Record<string, unknown> {
  const { tokens, innerRadius = 0 } = opts;
  const fmt = makeFmt(opts.locale || "en");
  const first = data.series[0];
  const inner = `${Math.round(Math.min(Math.max(innerRadius, 0), 0.9) * 100)}%`;
  const palette = data.category.map((_, i) => seriesColor(tokens.accent, i));

  return {
    animation: false,
    tooltip: {
      trigger: "item",
      formatter: (p: { name: string; value: number; percent: number }) =>
        `${p.name}: ${fmt(p.value)} (${p.percent}%)`,
    },
    ...(opts.legend
      ? { legend: { show: true, textStyle: { color: tokens.textPrimary } } }
      : {}),
    color: palette,
    series: [
      {
        type: "pie",
        radius: [inner, "72%"],
        data: data.category.map((name, i) => ({
          name,
          value: first?.data[i] ?? 0,
        })),
        label: { color: tokens.textPrimary },
        labelLine: { lineStyle: { color: tokens.border } },
      },
    ],
  };
}

/** Map one shaped series → its ECharts series object. */
function toEchartsSeries(
  s: SeriesData,
  i: number,
  opts: BuildChartOptionOpts,
): Record<string, unknown> {
  const { tokens, orientation, ySecondary } = opts;
  const horizontal = orientation === "horizontal";
  const color = seriesColor(tokens.accent, i);
  // The value dimension is y for vertical charts, x for horizontal.
  const axisKey = horizontal ? "xAxisIndex" : "yAxisIndex";
  const axisIndex = s.axis === "secondary" && ySecondary ? 1 : 0;
  const common: Record<string, unknown> = {
    name: s.name,
    [axisKey]: axisIndex,
    ...(s.stack ? { stack: s.stack } : {}),
  };

  if (s.type === "scatter") {
    return {
      ...common,
      type: "scatter",
      data: s.data,
      itemStyle: { color },
      symbolSize: 10,
    };
  }

  if (s.type === "line" || s.type === "area") {
    return {
      ...common,
      type: "line",
      data: s.data,
      itemStyle: { color },
      lineStyle: { color },
      symbolSize: 7,
      smooth: false,
      ...(s.type === "area" ? { areaStyle: { opacity: 0.25 } } : {}),
    };
  }

  // bar (default)
  return {
    ...common,
    type: "bar",
    data: s.data,
    itemStyle: {
      color,
      borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
    },
    barMaxWidth: 28,
  };
}

function buildCartesianOption(
  data: ChartData,
  opts: BuildChartOptionOpts,
): Record<string, unknown> {
  const { tokens, legend, orientation, ySecondary } = opts;
  const horizontal = orientation === "horizontal";
  const fmt = makeFmt(opts.locale || "en");

  // ECharts plots a category axis bottom-up; for a HORIZONTAL chart that puts
  // the first row at the bottom. Reverse category + every series' data together
  // so the first row reads at the top (matching ResultsChart's top-down order).
  let category = data.category;
  let series = data.series;
  if (horizontal) {
    category = [...data.category].reverse();
    series = data.series.map((s) => ({ ...s, data: [...s.data].reverse() }));
  }

  const categoryAxis = {
    type: "category" as const,
    data: category,
    axisLabel: { color: tokens.textPrimary },
    axisLine: { lineStyle: { color: tokens.border } },
    axisTick: { show: false },
  };

  const valueAxis = (secondary: boolean) => ({
    type: "value" as const,
    axisLabel: {
      color: tokens.textSecondary,
      formatter: (v: number) => fmt(v),
    },
    axisLine: { lineStyle: { color: tokens.border } },
    // Hide the 2nd axis' grid lines to avoid a double grid.
    splitLine: { show: !secondary, lineStyle: { color: tokens.border } },
  });

  const valueAxes = ySecondary
    ? [valueAxis(false), valueAxis(true)]
    : [valueAxis(false)];

  const echSeries = series.map((s, i) => toEchartsSeries(s, i, opts));

  return {
    animation: false,
    grid: {
      left: 8,
      right: 16,
      top: legend ? 32 : 8,
      bottom: 8,
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (
        ps: Array<{
          axisValueLabel?: string;
          name?: string;
          seriesName?: string;
          value: number;
        }>,
      ) => {
        const head = ps[0]?.axisValueLabel ?? ps[0]?.name ?? "";
        const lines = ps.map((p) => `${p.seriesName ?? ""}: ${fmt(p.value)}`);
        return [head, ...lines].join("<br/>");
      },
    },
    ...(legend
      ? {
          legend: {
            show: true,
            data: series.map((s) => s.name),
            textStyle: { color: tokens.textPrimary },
          },
        }
      : {}),
    xAxis: horizontal ? valueAxes : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxes,
    series: echSeries,
  };
}

/**
 * Build the ECharts `option` for a declarative chart. Pie (single-measure) and
 * cartesian (bar/line/area/scatter, optionally stacked / dual-axis) are the two
 * shapes; the first series' `type` selects pie vs cartesian.
 */
export function buildChartOption(
  data: ChartData,
  opts: BuildChartOptionOpts,
): Record<string, unknown> {
  if (!data || data.series.length === 0 || data.category.length === 0) {
    return {};
  }
  return isPie(data.series)
    ? buildPieOption(data, opts)
    : buildCartesianOption(data, opts);
}
