// @vitest-environment jsdom
/**
 * SidebarItem `abbr` / `label` props — collapsed abbreviation rendering.
 *
 * Uses SidebarAbbrHarness.svelte: a Sidebar with three SidebarItems:
 *   item-abbr:  abbr="C" label="Cases", no icon
 *   item-icon:  abbr="D" label="Dashboard", WITH icon
 *   item-empty: no abbr, no icon
 */
import { afterEach, describe, expect, it } from "vitest";
import { flushSync, mount, unmount } from "svelte";
import SidebarAbbrHarness from "./fixtures/SidebarAbbrHarness.svelte";

let target: HTMLElement | undefined;
let app: Record<string, unknown> | undefined;

afterEach(() => {
  if (app) unmount(app);
  target?.remove();
  app = undefined;
  target = undefined;
});

function render(collapsed: boolean) {
  target = document.createElement("div");
  document.body.appendChild(target);
  app = mount(SidebarAbbrHarness, {
    target,
    props: { collapsed },
  }) as Record<string, unknown>;
  flushSync();
  return target;
}

function item(el: HTMLElement, testId: string) {
  return el.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
}

describe("SidebarItem abbr — collapsed", () => {
  it("shows abbr text when collapsed, no icon", () => {
    const el = render(true);
    const abbr = item(el, "item-abbr");
    expect(abbr).not.toBeNull();
    // The abbr span should be visible
    const abbrSpan = abbr.querySelector(".nav-abbr");
    expect(abbrSpan).not.toBeNull();
    expect(abbrSpan!.textContent).toBe("C");
  });

  it("hides the label text when collapsed", () => {
    const el = render(true);
    const abbr = item(el, "item-abbr");
    const label = abbr.querySelector(".nav-item-label");
    expect(label).toBeNull();
  });

  it("sets aria-label and title from label prop when collapsed", () => {
    const el = render(true);
    const abbr = item(el, "item-abbr");
    expect(abbr.getAttribute("aria-label")).toBe("Cases");
    expect(abbr.getAttribute("title")).toBe("Cases");
  });

  it("icon item: renders icon, NOT abbr, when collapsed", () => {
    const el = render(true);
    const iconItem = item(el, "item-icon");
    // Icon should be present
    expect(iconItem.querySelector(".nav-icon-wrap")).not.toBeNull();
    expect(iconItem.querySelector("[data-testid='icon-svg']")).not.toBeNull();
    // Abbr should NOT be present (icon takes precedence)
    expect(iconItem.querySelector(".nav-abbr")).toBeNull();
  });

  it("no abbr + no icon: nothing rendered when collapsed (unchanged behaviour)", () => {
    const el = render(true);
    const empty = item(el, "item-empty");
    expect(empty.querySelector(".nav-icon-wrap")).toBeNull();
    expect(empty.querySelector(".nav-abbr")).toBeNull();
    expect(empty.querySelector(".nav-item-label")).toBeNull();
  });
});

describe("SidebarItem abbr — expanded", () => {
  it("shows children text, no abbr", () => {
    const el = render(false);
    const abbrItem = item(el, "item-abbr");
    // Label visible
    const label = abbrItem.querySelector(".nav-item-label");
    expect(label).not.toBeNull();
    expect(label!.textContent).toBe("Cases");
    // Abbr NOT shown when expanded
    expect(abbrItem.querySelector(".nav-abbr")).toBeNull();
  });

  it("no aria-label or title when expanded", () => {
    const el = render(false);
    const abbrItem = item(el, "item-abbr");
    expect(abbrItem.getAttribute("aria-label")).toBeNull();
    expect(abbrItem.getAttribute("title")).toBeNull();
  });
});
