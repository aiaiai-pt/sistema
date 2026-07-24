// @vitest-environment jsdom
//
// Rendered tests for NativeChartWidget (S1.4 #59). Mounts the real widget over
// the Sistema EChart primitive in jsdom and asserts the ACCESSIBLE TABLE — the
// a11y source of truth EChart always ships (the canvas is decorative and
// lazy-loads echarts in a client-only effect that jsdom cannot fully paint;
// the table renders synchronously and is what assistive tech reads).
//
// The widget consumes an ALREADY-RESOLVED { category, series } model — there is
// no row projection, no view/BFF/tenant vocabulary. Covered: real table output,
// multi-series, caller-supplied labels, overflow (all rows present — no silent
// truncation), and the empty case.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import NativeChartWidget from "../../src/widgets/NativeChartWidget.svelte";
import type { WidgetRenderRequest } from "../../src/core/index.ts";

let mounts: Array<Record<string, unknown>> = [];
let targets: HTMLElement[] = [];

afterEach(() => {
  for (const m of mounts) unmount(m);
  for (const t of targets) t.remove();
  mounts = [];
  targets = [];
});

function render(request: WidgetRenderRequest): HTMLElement {
  const target = document.createElement("div");
  document.body.appendChild(target);
  targets.push(target);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mounts.push(mount(NativeChartWidget as any, { target, props: request }) as Record<string, unknown>);
  flushSync();
  return target;
}

describe("NativeChartWidget — resolved model rendering", () => {
  it("renders the accessible table from the resolved category/series", () => {
    const el = render({
      data: {
        category: ["Open", "In progress", "Resolved"],
        series: [{ name: "Reports", type: "bar", data: [12, 5, 31] }],
      },
      props: { caption: "Reports by status", labelHeader: "Status" },
      locale: "en",
    });

    const table = el.querySelector("table");
    expect(table).not.toBeNull();
    // Caller-supplied header + the series name.
    const headers = [...el.querySelectorAll("thead th")].map((h) => h.textContent);
    expect(headers).toEqual(["Status", "Reports"]);
    // Category row headers.
    const rowHeaders = [...el.querySelectorAll("tbody th")].map((h) => h.textContent);
    expect(rowHeaders).toEqual(["Open", "In progress", "Resolved"]);
    // Values (formatted through EChart's Intl formatter for the locale).
    const cells = [...el.querySelectorAll("tbody td")].map((c) => c.textContent);
    expect(cells).toEqual(["12", "5", "31"]);
  });

  it("renders one value column per series for a multi-series model", () => {
    const el = render({
      data: {
        category: ["Q1", "Q2"],
        series: [
          { name: "Plan", type: "bar", data: [10, 20] },
          { name: "Actual", type: "line", data: [8, 24] },
        ],
      },
      props: { labelHeader: "Quarter" },
    });
    const headers = [...el.querySelectorAll("thead th")].map((h) => h.textContent);
    expect(headers).toEqual(["Quarter", "Plan", "Actual"]);
    // Two value columns on the first data row.
    const firstRowCells = [...el.querySelectorAll("tbody tr:first-child td")].map(
      (c) => c.textContent,
    );
    expect(firstRowCells).toEqual(["10", "8"]);
  });

  it("overflow: renders EVERY resolved category in the table (no silent truncation)", () => {
    const category = Array.from({ length: 60 }, (_, i) => `Cat ${i}`);
    const data = Array.from({ length: 60 }, (_, i) => i);
    const el = render({
      data: { category, series: [{ name: "N", type: "bar", data }] },
      props: { labelHeader: "Item" },
    });
    // All 60 category rows present — the accessible table never drops data.
    expect(el.querySelectorAll("tbody tr").length).toBe(60);
  });

  it("renders nothing when the model has no series (EChart soft-empty)", () => {
    const el = render({ data: { category: [], series: [] }, props: {} });
    expect(el.querySelector("table")).toBeNull();
    expect(el.textContent?.trim()).toBe("");
  });

  it("is defensive against a non-model data shape", () => {
    // A host passing a wrong/unresolved shape must not crash — soft-empty.
    const el = render({ data: { items: [{ label: "x", value: 1 }] }, props: {} });
    expect(el.querySelector("table")).toBeNull();
  });
});
