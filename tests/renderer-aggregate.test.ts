// #105 Phase 4 — aggregate-view row shaping (pure logic behind RankingBoard /
// ResultsChart widgets). The contract: a public aggregate VIEW's rows are mapped
// to `{ label, value }` via configurable column names, sorted by value desc
// (stable on ties), optionally capped, with fail-soft coercion (blank label →
// dropped by default; non-numeric value → 0) so a stray row never throws.

import { describe, expect, it } from "vitest";
import { toRankedItems } from "../components/renderer/aggregate";

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
