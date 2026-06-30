/**
 * Render-side chart-spec validation + whitelist (#176 follow-on) — PURE.
 *
 * `props.chart_spec` reaches the widget as UNTRUSTED `unknown` (block props are
 * operator-authored). Even though the backend validates the spec on write, the
 * renderer re-validates on read and enforces the CURATED WHITELIST here — the
 * third load-bearing constraint: every `type` / option is an enum / number /
 * boolean drawn from a fixed set; anything unknown is DROPPED, never passed
 * through to ECharts. This keeps the render path closed (TH-08): no operator
 * string ever becomes behaviour.
 *
 * Returns a clean `ChartSpec` or `null` (block is legacy / spec unusable). Pure
 * and dependency-free so it unit-tests trivially.
 */

import type {
  ChartOptions,
  ChartSeriesSpec,
  ChartSeriesType,
  ChartSpec,
} from "./aggregate";

const SERIES_TYPES: ReadonlySet<ChartSeriesType> = new Set([
  "bar",
  "line",
  "area",
  "scatter",
  "pie",
]);

const ORIENTATIONS = new Set(["horizontal", "vertical"]);

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function nonEmptyStr(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "";
}

/** Whitelist one series; null if its column or type is missing/unknown. */
function parseSeries(raw: unknown): ChartSeriesSpec | null {
  if (!isObj(raw)) return null;
  if (!nonEmptyStr(raw.column)) return null;
  if (
    typeof raw.type !== "string" ||
    !SERIES_TYPES.has(raw.type as ChartSeriesType)
  ) {
    return null;
  }
  const out: ChartSeriesSpec = {
    column: raw.column,
    type: raw.type as ChartSeriesType,
  };
  if (nonEmptyStr(raw.name)) out.name = raw.name;
  if (nonEmptyStr(raw.stack)) out.stack = raw.stack;
  if (raw.axis === "primary" || raw.axis === "secondary") out.axis = raw.axis;
  return out;
}

/** Whitelist the chart-level options; unknown keys are dropped. */
function parseOptions(raw: unknown): ChartOptions {
  if (!isObj(raw)) return {};
  const out: ChartOptions = {};
  if (typeof raw.legend === "boolean") out.legend = raw.legend;
  if (
    typeof raw.orientation === "string" &&
    ORIENTATIONS.has(raw.orientation)
  ) {
    out.orientation = raw.orientation as "horizontal" | "vertical";
  }
  if (typeof raw.y_secondary === "boolean") out.y_secondary = raw.y_secondary;
  if (
    typeof raw.inner_radius === "number" &&
    Number.isFinite(raw.inner_radius)
  ) {
    out.inner_radius = Math.min(Math.max(raw.inner_radius, 0), 0.9);
  }
  return out;
}

/**
 * Validate + whitelist a raw `chart_spec`. Returns null when it is absent or
 * unusable (no category column, or no valid series survive the whitelist) — the
 * caller then falls back to the legacy single-series path.
 */
export function asChartSpec(raw: unknown): ChartSpec | null {
  if (!isObj(raw)) return null;
  const category = raw.category;
  if (!isObj(category) || !nonEmptyStr(category.column)) return null;

  const rawSeries = Array.isArray(raw.series) ? raw.series : [];
  const series = rawSeries
    .map(parseSeries)
    .filter((s): s is ChartSeriesSpec => s !== null);
  if (series.length === 0) return null;

  const spec: ChartSpec = {
    category: { column: category.column },
    series,
    options: parseOptions(raw.options),
  };
  if (nonEmptyStr(raw.view_code)) spec.view_code = raw.view_code;
  if (typeof raw.limit === "number" && raw.limit > 0) {
    spec.limit = Math.floor(raw.limit);
  }
  if (nonEmptyStr(raw.order_by)) spec.order_by = raw.order_by;
  return spec;
}
