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
