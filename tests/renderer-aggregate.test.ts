// #105 Phase 4 — aggregate-view row shaping (pure logic behind RankingBoard /
// ResultsChart widgets). The contract: a public aggregate VIEW's rows are mapped
// to `{ label, value }` via configurable column names, sorted by value desc
// (stable on ties), optionally capped, with fail-soft coercion (blank label →
// dropped by default; non-numeric value → 0) so a stray row never throws.

import { describe, expect, it } from "vitest";
import {
  toRankedItems,
  toSeriesData,
  type ChartSpec,
} from "../components/renderer/aggregate";

const ROWS = [
  { proposal_title: "Parque", total_votes: 5 },
  { proposal_title: "Ciclovia", total_votes: 8 },
  { proposal_title: "Hortas", total_votes: 1 },
  { proposal_title: "Iluminação", total_votes: 3 },
];

describe("toRankedItems", () => {
  it("maps configured label/value columns and sorts by value descending", () => {
    const out = toRankedItems(ROWS, {
      labelField: "proposal_title",
      valueField: "total_votes",
    });
    expect(out).toEqual([
      { label: "Ciclovia", value: 8 },
      { label: "Parque", value: 5 },
      { label: "Iluminação", value: 3 },
      { label: "Hortas", value: 1 },
    ]);
  });

  it("caps to the top-N when a limit is given", () => {
    const out = toRankedItems(ROWS, {
      labelField: "proposal_title",
      valueField: "total_votes",
      limit: 2,
    });
    expect(out.map((i) => i.label)).toEqual(["Ciclovia", "Parque"]);
  });

  it("defaults to the `label`/`value` columns", () => {
    expect(
      toRankedItems([
        { label: "A", value: 2 },
        { label: "B", value: 9 },
      ]),
    ).toEqual([
      { label: "B", value: 9 },
      { label: "A", value: 2 },
    ]);
  });

  it("coerces a non-numeric/missing value to 0 (never throws)", () => {
    const out = toRankedItems(
      [
        { label: "good", value: 4 },
        { label: "stringy", value: "7" },
        { label: "junk", value: "n/a" },
        { label: "missing" },
      ],
      {},
    );
    expect(out).toEqual([
      { label: "stringy", value: 7 },
      { label: "good", value: 4 },
      { label: "junk", value: 0 },
      { label: "missing", value: 0 },
    ]);
  });

  it("drops blank-label rows by default, keeps them when asked", () => {
    const rows = [
      { label: "", value: 99 },
      { label: "real", value: 1 },
    ];
    expect(toRankedItems(rows, {}).map((i) => i.label)).toEqual(["real"]);
    expect(
      toRankedItems(rows, { dropBlankLabels: false }).map((i) => i.label),
    ).toEqual(["", "real"]);
  });

  it("is a stable sort — equal values keep input order", () => {
    const out = toRankedItems(
      [
        { label: "first", value: 5 },
        { label: "second", value: 5 },
        { label: "third", value: 5 },
      ],
      {},
    );
    expect(out.map((i) => i.label)).toEqual(["first", "second", "third"]);
  });

  it("returns an empty array for no rows (soft-empty upstream)", () => {
    expect(toRankedItems([], {})).toEqual([]);
  });
});

// #176 follow-on — multi-series projection. The contract: a public aggregate
// VIEW's rows are projected to column-aligned `{ category, series[] }` per a
// ChartSpec. Order/cap are the binding's job (server-side); this shaper is a
// pure column projection that never re-sorts. Blank-category rows are dropped
// from EVERY series (columns stay aligned); non-numeric cells coerce to 0.

const STATUS_ROWS = [
  { status: "Open", open_count: 12, resolved_count: 3, avg_db: 41 },
  { status: "In progress", open_count: 5, resolved_count: 7, avg_db: 38 },
  { status: "Resolved", open_count: 0, resolved_count: 31, avg_db: 44 },
];

describe("toSeriesData", () => {
  it("projects one category column + multiple value columns, index-aligned", () => {
    const spec: ChartSpec = {
      category: { column: "status" },
      series: [
        { column: "open_count", type: "bar", name: "Open" },
        { column: "resolved_count", type: "bar", name: "Resolved" },
      ],
    };
    const out = toSeriesData(STATUS_ROWS, spec);
    expect(out.category).toEqual(["Open", "In progress", "Resolved"]);
    expect(out.series).toEqual([
      { name: "Open", type: "bar", data: [12, 5, 0] },
      { name: "Resolved", type: "bar", data: [3, 7, 31] },
    ]);
  });

  it("carries stack + axis through and defaults series name to the column", () => {
    const spec: ChartSpec = {
      category: { column: "status" },
      series: [
        { column: "open_count", type: "bar", stack: "counts" },
        { column: "avg_db", type: "line", axis: "secondary" },
      ],
    };
    const out = toSeriesData(STATUS_ROWS, spec);
    expect(out.series[0]).toEqual({
      name: "open_count",
      type: "bar",
      data: [12, 5, 0],
      stack: "counts",
    });
    expect(out.series[1]).toEqual({
      name: "avg_db",
      type: "line",
      data: [41, 38, 44],
      axis: "secondary",
    });
  });

  it("drops blank-category rows from every series so columns stay aligned", () => {
    const rows = [
      { status: "Open", open_count: 12, resolved_count: 3 },
      { status: "", open_count: 99, resolved_count: 99 },
      { status: "Resolved", open_count: 0, resolved_count: 31 },
    ];
    const out = toSeriesData(rows, {
      category: { column: "status" },
      series: [
        { column: "open_count", type: "bar" },
        { column: "resolved_count", type: "bar" },
      ],
    });
    expect(out.category).toEqual(["Open", "Resolved"]);
    expect(out.series[0].data).toEqual([12, 0]);
    expect(out.series[1].data).toEqual([3, 31]);
  });

  it("coerces non-numeric / missing cells to 0 (never throws)", () => {
    const rows = [
      { status: "A", n: 4 },
      { status: "B", n: "7" },
      { status: "C", n: "n/a" },
      { status: "D" },
    ];
    const out = toSeriesData(rows, {
      category: { column: "status" },
      series: [{ column: "n", type: "bar" }],
    });
    expect(out.series[0].data).toEqual([4, 7, 0, 0]);
  });

  it("honours a defensive client-side limit cap", () => {
    const out = toSeriesData(STATUS_ROWS, {
      category: { column: "status" },
      series: [{ column: "open_count", type: "bar" }],
      limit: 2,
    });
    expect(out.category).toEqual(["Open", "In progress"]);
    expect(out.series[0].data).toEqual([12, 5]);
  });

  it("returns empty when there is no category column or no series", () => {
    expect(
      toSeriesData(STATUS_ROWS, {
        category: { column: "" },
        series: [{ column: "open_count", type: "bar" }],
      }),
    ).toEqual({ category: [], series: [] });
    expect(
      toSeriesData(STATUS_ROWS, { category: { column: "status" }, series: [] }),
    ).toEqual({ category: [], series: [] });
  });
});
