// #176 follow-on — render-side chart-spec validation + whitelist. The contract:
// `props.chart_spec` is UNTRUSTED; `asChartSpec` re-validates on read and drops
// anything outside the curated whitelist (unknown series types, unknown option
// keys), returning a clean ChartSpec or null (→ legacy fallback). This is the
// closed-render constraint (TH-08): no operator string becomes behaviour.

import { describe, expect, it } from "vitest";
import { asChartSpec } from "../components/renderer/chart-spec";

describe("asChartSpec", () => {
  it("accepts a well-formed multi-series spec and keeps the whitelisted fields", () => {
    const spec = asChartSpec({
      view_code: "c2_by_status",
      category: { column: "status" },
      series: [
        { column: "open_count", type: "bar", stack: "counts", name: "Open" },
        { column: "avg_db", type: "line", axis: "secondary" },
      ],
      options: { legend: true, orientation: "horizontal", y_secondary: true },
      limit: 10,
      order_by: "-open_count",
    });
    expect(spec).toEqual({
      view_code: "c2_by_status",
      category: { column: "status" },
      series: [
        { column: "open_count", type: "bar", stack: "counts", name: "Open" },
        { column: "avg_db", type: "line", axis: "secondary" },
      ],
      options: { legend: true, orientation: "horizontal", y_secondary: true },
      limit: 10,
      order_by: "-open_count",
    });
  });

  it("drops series whose type is not whitelisted, keeps the valid ones", () => {
    const spec = asChartSpec({
      category: { column: "status" },
      series: [
        { column: "a", type: "bar" },
        { column: "b", type: "radar" }, // unknown → dropped
        { column: "c", type: "pie" },
      ],
    });
    expect(spec?.series.map((s) => s.column)).toEqual(["a", "c"]);
  });

  it("drops a series missing its column", () => {
    const spec = asChartSpec({
      category: { column: "status" },
      series: [{ type: "bar" }, { column: "ok", type: "line" }],
    });
    expect(spec?.series.map((s) => s.column)).toEqual(["ok"]);
  });

  it("drops unknown option keys and clamps inner_radius to [0, 0.9]", () => {
    const spec = asChartSpec({
      category: { column: "status" },
      series: [{ column: "a", type: "pie" }],
      options: {
        legend: true,
        orientation: "diagonal", // invalid → dropped
        inner_radius: 5, // clamped → 0.9
        formatter: "() => evil()", // unknown key → dropped
      },
    });
    expect(spec?.options).toEqual({ legend: true, inner_radius: 0.9 });
  });

  it("returns null when the category column is missing", () => {
    expect(asChartSpec({ series: [{ column: "a", type: "bar" }] })).toBeNull();
    expect(
      asChartSpec({ category: {}, series: [{ column: "a", type: "bar" }] }),
    ).toBeNull();
  });

  it("returns null when no valid series survive", () => {
    expect(
      asChartSpec({
        category: { column: "status" },
        series: [{ column: "a", type: "radar" }],
      }),
    ).toBeNull();
    expect(
      asChartSpec({ category: { column: "status" }, series: [] }),
    ).toBeNull();
  });

  it("returns null for non-object / absent input (legacy block)", () => {
    expect(asChartSpec(undefined)).toBeNull();
    expect(asChartSpec(null)).toBeNull();
    expect(asChartSpec("nope")).toBeNull();
  });
});
