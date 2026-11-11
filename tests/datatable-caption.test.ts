// @vitest-environment jsdom
//
// A table needs an accessible name of its own. Attributes spread onto
// DataTable land on its wrapper div, so `caption` names the <table> itself
// (the same prop EChart uses for its data table).

import { mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import DataTable from "../components/DataTable.svelte";

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;
afterEach(() => { if (component) unmount(component); target?.remove(); component = undefined; target = undefined; });

const render = (props: Record<string, unknown>) => {
  target = document.createElement("div");
  document.body.appendChild(target);
  component = mount(DataTable, { target, props: { columns: [{ key: "name", label: "Place" }], rows: [{ id: "1", name: "Sydney" }], ...props } }) as Record<string, unknown>;
  return target.querySelector("table")!;
};

describe("DataTable caption", () => {
  it("should_name_the_table_with_its_caption", () => {
    expect(render({ caption: "Usual weather by place" }).getAttribute("aria-label")).toBe("Usual weather by place");
  });

  it("should_leave_the_table_unnamed_without_a_caption", () => {
    expect(render({}).hasAttribute("aria-label")).toBe(false);
  });
});
