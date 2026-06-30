/**
 * Aggregate-view row shaping (#105 Phase 4) — PURE, vertical-agnostic.
 *
 * Turns the rows of a public aggregate VIEW (served by the BFF public-view lane,
 * #250 M3 — `{ items: [{ <label_field>, <value_field>, … }] }`) into the
 * `{ label, value }` shape the DS `RankingBoard` / `ResultsChart` render, sorted
 * by value descending and optionally capped. Nothing here is civic-specific:
 * the label/value columns are config (`label_field` / `value_field`), so any
 * `group_by + count/sum` view (votes per proposal, reports per category,
 * consumption per meter) becomes a chart/board from config alone.
 *
 * Coercion is deliberate and fail-soft: a missing/blank label falls back to the
 * empty string (the widget decides whether to drop it), a non-numeric value
 * coerces to 0 — an aggregate read never throws on a stray row.
 */

export interface RankedItem {
  label: string;
  value: number;
}

export interface ToRankedOptions {
  /** Key in each row holding the category label. Default `label`. */
  labelField?: string;
  /** Key holding the numeric aggregate. Default `value`. */
  valueField?: string;
  /** Cap the result to the top-N after sorting. 0/absent → no cap. */
  limit?: number;
  /** Drop rows whose label coerces to empty. Default true. */
  dropBlankLabels?: boolean;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/**
 * Map raw view rows → sorted `{ label, value }`. Stable sort by value desc
 * (ties keep input order); rows are never mutated.
 */
export function toRankedItems(
  rows: ReadonlyArray<Record<string, unknown>>,
  opts: ToRankedOptions = {},
): RankedItem[] {
  const labelField = opts.labelField || "label";
  const valueField = opts.valueField || "value";
  const dropBlank = opts.dropBlankLabels !== false;

  const mapped = rows.map((row) => ({
    label: row[labelField] == null ? "" : String(row[labelField]),
    value: toNumber(row[valueField]),
  }));

  const kept = dropBlank ? mapped.filter((it) => it.label !== "") : mapped;

  // Stable desc sort: decorate with the original index so equal values keep
  // their input order (Array.prototype.sort is spec-stable, but the index tie-
  // break documents the intent and is robust to value-equality edge cases).
  const sorted = kept
    .map((it, i) => ({ it, i }))
    .sort((a, b) => b.it.value - a.it.value || a.i - b.i)
    .map(({ it }) => it);

  return opts.limit && opts.limit > 0
    ? sorted.slice(0, Math.floor(opts.limit))
    : sorted;
}

/*
 * ────────────────────────────────────────────────────────────────────────────
 * Declarative multi-series chart spec (#176 follow-on) — PURE, JSON-only.
 *
 * The single-series `{label,value}` projection above is the degenerate "one
 * series" case. The declarative model binds a chart block to a public aggregate
 * VIEW and a set of OUTPUT COLUMNS: one `category` column (the x / pie-angle
 * axis) and ≥1 `series`, each naming a value column + a render `type`. Multi-
 * series is then just "≥2 series", not a bespoke feature.
 *
 * Three load-bearing constraints (see dev_docs/specs/176-declarative-chart-
 * authoring.md): (1) JSON-ONLY — no operator-authored functions ever reach the
 * runtime (TH-08); the DS supplies all behaviours. (2) BIND COLUMNS, not data —
 * a series references a view output column, resolved at render via the existing
 * DataProvider. (3) CURATED WHITELIST — every `type`/`option` is an enum/number/
 * boolean; unknown keys are ignored, never passed through.
 *
 * `toSeriesData` is the multi-series analogue of `toRankedItems`: it maps the
 * resolved VIEW rows into the column-aligned `{ category, series[] }` the DS
 * `EChart` renders. Row ORDER and the row CAP are the binding's job (forwarded
 * to the BFF as `?order_by=` / `?limit=`, applied server-side); this shaper is a
 * pure column projection over the rows it is handed — it never re-sorts. A
 * `limit` here is honoured only as a defensive client-side cap.
 */

/** The curated series render kinds (whitelist; unknown → dropped upstream). */
export type ChartSeriesType = "bar" | "line" | "area" | "scatter" | "pie";

/** One series: a view value column rendered as `type`. */
export interface ChartSeriesSpec {
  /** View output (value) column this series plots. */
  column: string;
  /** Render geometry for this series. */
  type: ChartSeriesType;
  /** Legend / table header label. Defaults to `column`. */
  name?: string;
  /** Bars/areas sharing a `stack` id are stacked together. */
  stack?: string;
  /** `secondary` pins the series to the 2nd value axis (dual-axis). */
  axis?: "primary" | "secondary";
}

/** Chart-level enumerated options (no strings that become code). */
export interface ChartOptions {
  /** Render a legend (needed once there are ≥2 series). */
  legend?: boolean;
  /** Cartesian orientation: `vertical` = category on x (default). */
  orientation?: "horizontal" | "vertical";
  /** Enable a 2nd value axis for `axis: "secondary"` series. */
  y_secondary?: boolean;
  /** Pie/donut hole as a fraction of the outer radius (0 = full pie). */
  inner_radius?: number;
}

/** The declarative chart spec carried on a chart block's props. */
export interface ChartSpec {
  /** Aggregate VIEW code (also lives on the block binding/entity). */
  view_code?: string;
  /** The category (x / pie-angle) column. */
  category: { column: string };
  /** ≥1 series; ≥2 = multi-series. */
  series: ChartSeriesSpec[];
  options?: ChartOptions;
  /** Defensive client-side row cap (server `?limit=` is authoritative). */
  limit?: number;
  /** Echoes the binding order term (for reference; ordering is server-side). */
  order_by?: string;
}

/** A column-aligned series ready for the renderer. */
export interface SeriesData {
  name: string;
  type: ChartSeriesType;
  data: number[];
  stack?: string;
  axis?: "primary" | "secondary";
}

/** The shape `EChart` / `ResultsChart` render: aligned category + series. */
export interface ChartData {
  category: string[];
  series: SeriesData[];
}

/**
 * Project resolved VIEW rows → `{ category, series[] }` per a `ChartSpec`.
 * Pure: rows are never mutated and never re-sorted (order is the binding's
 * job). Blank-category rows are dropped (they have no axis tick) — dropping a
 * row removes that index from EVERY series so the columns stay aligned. A
 * non-numeric cell coerces to 0 (fail-soft, same as `toRankedItems`).
 */
export function toSeriesData(
  rows: ReadonlyArray<Record<string, unknown>>,
  spec: ChartSpec,
): ChartData {
  const categoryCol = spec.category?.column;
  const series = Array.isArray(spec.series) ? spec.series : [];
  if (!categoryCol || series.length === 0) {
    return { category: [], series: [] };
  }

  // Drop blank-category rows first so every series stays index-aligned.
  const kept = rows.filter((row) => {
    const c = row[categoryCol];
    return c != null && String(c) !== "";
  });

  const capped =
    spec.limit && spec.limit > 0 ? kept.slice(0, Math.floor(spec.limit)) : kept;

  const category = capped.map((row) => String(row[categoryCol]));

  const shaped: SeriesData[] = series.map((s) => ({
    name: s.name && s.name.trim() ? s.name : s.column,
    type: s.type,
    data: capped.map((row) => toNumber(row[s.column])),
    ...(s.stack ? { stack: s.stack } : {}),
    ...(s.axis ? { axis: s.axis } : {}),
  }));

  return { category, series: shaped };
}
