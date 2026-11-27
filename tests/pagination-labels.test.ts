// @vitest-environment jsdom
//
// atelier#2674 (run-2 review R49) — Pagination speaks the host's language.
// A Portuguese console showed "1 total" under its lists: the summary and the
// navigation's accessible names were English literals with no prop to replace
// them. They now come from props, defaulting to today's English text.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import Pagination from "../components/Pagination.svelte";

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;

afterEach(() => {
  if (component) unmount(component);
  target?.remove();
  component = undefined;
  target = undefined;
});

function render(props: Record<string, unknown>): HTMLElement {
  target = document.createElement("div");
  document.body.append(target);
  component = mount(Pagination, { target, props });
  flushSync();
  return target;
}

describe("Pagination labels (atelier#2674 R49)", () => {
  it("keeps the English summary by default", () => {
    expect(render({ mode: "cursor", total_items: 1 }).textContent).toContain("1 total");
  });

  it("prints the host's summary in cursor mode", () => {
    const el = render({
      mode: "cursor",
      total_items: 1,
      totalLabel: (n: string) => `${n} no total`,
    });
    expect(el.textContent).toContain("1 no total");
    expect(el.textContent).not.toContain("1 total");
  });

  it("prints the host's range in offset mode", () => {
    const el = render({
      mode: "offset",
      current_page: 1,
      total_pages: 2,
      total_items: 30,
      page_size: 25,
      rangeLabel: (start: string, end: string, total: string) => `${start}–${end} de ${total}`,
    });
    expect(el.textContent).toContain("1–25 de 30");
  });

  it("names the navigation in the host's language", () => {
    const el = render({
      mode: "cursor",
      has_next: true,
      has_prev: true,
      previousPageLabel: "Página anterior",
      nextPageLabel: "Página seguinte",
    });
    const names = [...el.querySelectorAll("button")].map((b) => b.getAttribute("aria-label"));
    expect(names).toContain("Página anterior");
    expect(names).toContain("Página seguinte");
  });
});
