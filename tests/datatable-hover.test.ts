// @vitest-environment jsdom
//
// #2668 P3b — hover highlight is gated to clickable rows only.
// A row without on_row_click must NOT have the clickable class that
// drives the hover background change.

import { mount, unmount, flushSync } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import DataTable from "../components/DataTable.svelte";

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;
afterEach(() => {
  if (component) unmount(component);
  target?.remove();
  component = undefined;
  target = undefined;
});

const COLS = [{ key: "name", label: "Name" }];
const ROWS = [
  { id: "1", name: "Alpha" },
  { id: "2", name: "Beta" },
];

function render(props: Record<string, unknown>) {
  target = document.createElement("div");
  document.body.appendChild(target);
  component = mount(DataTable, {
    target,
    props: { columns: COLS, rows: ROWS, ...props },
  }) as Record<string, unknown>;
  flushSync();
  return [...target.querySelectorAll("tr.table-row")];
}

describe("DataTable hover highlight (#2668 P3b)", () => {
  it("rows WITHOUT on_row_click do not have the clickable class", () => {
    const rows = render({});
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.classList.contains("table-row-clickable")).toBe(false);
    }
  });

  it("rows WITH on_row_click have the clickable class", () => {
    const rows = render({ on_row_click: vi.fn() });
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.classList.contains("table-row-clickable")).toBe(true);
    }
  });

  it("selectable rows WITHOUT on_row_click do not have the clickable class", () => {
    const rows = render({ selectable: true });
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.classList.contains("table-row-clickable")).toBe(false);
    }
    // But they still have checkboxes for selection
    const checkboxes = target!.querySelectorAll("input[type='checkbox']");
    expect(checkboxes.length).toBeGreaterThan(0);
  });
});
