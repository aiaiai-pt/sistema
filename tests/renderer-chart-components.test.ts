// @vitest-environment jsdom
//
// #176 regression guard for commit f8ab70c — chart series `{#each}` keyed by
// INDEX, not by `s.name`. Two series sharing a name/column (e.g. two series
// bound to the only value column of a single-measure view) used to produce a
// duplicate Svelte keyed-each key in the EChart / ResultsChart a11y tables,
// throwing `each_key_duplicate` at mount and crashing the whole render.
//
// This is a COMPONENT-RENDER test (the repo's first): it `mount`s the real
// components into a jsdom DOM via the svelte vite plugin (see vitest.config.ts).
// A pure-function test can't catch this — the crash is in Svelte's keyed-each
// reconciler, which only runs on a real client mount. Reinstating the old
// `(s.name)` key makes these tests fail with `each_key_duplicate`.

import { mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import EChart from "../components/EChart.svelte";
import ResultsChart from "../components/ResultsChart.svelte";
import type { SeriesData } from "../components/renderer/aggregate";

// Two series that share the SAME name — the exact shape that triggered the
// duplicate keyed-each key before the fix.
const DUP_NAME_SERIES: SeriesData[] = [
  { name: "n", type: "bar", data: [1, 2] },
  { name: "n", type: "bar", data: [3, 4] },
];
const CATEGORY = ["A", "B"];

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;

afterEach(() => {
  if (component) {
    unmount(component);
    component = undefined;
  }
  target?.remove();
  target = undefined;
});

function render(
  Component: typeof ResultsChart | typeof EChart,
  props: Record<string, unknown>,
) {
  target = document.createElement("div");
  document.body.appendChild(target);
  // mount THROWS synchronously with `each_key_duplicate` if the keyed-each
  // key collides (the pre-f8ab70c behaviour), so a clean mount is the guard.
  component = mount(Component, { target, props }) as Record<string, unknown>;
  return target;
}

/** The header cells (label column + one per series). */
function headerCells(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll("thead th")).map((th) =>
    (th.textContent ?? "").trim(),
  );
}

/** The numeric value cells of the data rows, row by row. */
function bodyValueRows(root: HTMLElement): string[][] {
  return Array.from(root.querySelectorAll("tbody tr")).map((tr) =>
    Array.from(tr.querySelectorAll("td")).map((td) =>
      (td.textContent ?? "").trim(),
    ),
  );
}

describe("ResultsChart — two same-name series (dup-name regression)", () => {
  it("mounts without throwing and renders one value column per series", () => {
    const root = render(ResultsChart, {
      caption: "Dup",
      labelHeader: "Item",
      category: CATEGORY,
      series: DUP_NAME_SERIES,
      locale: "en",
    });

    const headers = headerCells(root);
    expect(headers).toHaveLength(3); // label + 2 series, both named "n"
    expect(headers).toEqual(["Item", "n", "n"]);

    // Every header is a real column header.
    expect(root.querySelectorAll('thead th[scope="col"]')).toHaveLength(3);

    // Index-aligned cell values: row A → [1, 3], row B → [2, 4].
    expect(bodyValueRows(root)).toEqual([
      ["1", "3"],
      ["2", "4"],
    ]);
  });
});

describe("EChart — two same-name series (dup-name regression)", () => {
  // EChart lazy-loads ECharts inside a client-only mount effect; the canvas is
  // decorative (`aria-hidden`) and may not initialise in jsdom (caught + logged
  // by the component, never throws). The a11y <table> — the source of truth and
  // the thing that crashed — renders synchronously at mount, which is what we
  // assert on here.
  it("mounts without throwing and renders one value column per series", () => {
    const root = render(EChart, {
      caption: "Dup",
      labelHeader: "Item",
      category: CATEGORY,
      series: DUP_NAME_SERIES,
      legend: true,
      locale: "en",
    });

    const headers = headerCells(root);
    expect(headers).toHaveLength(3);
    expect(headers).toEqual(["Item", "n", "n"]);
    expect(root.querySelectorAll('thead th[scope="col"]')).toHaveLength(3);

    expect(bodyValueRows(root)).toEqual([
      ["1", "3"],
      ["2", "4"],
    ]);
  });
});
