// @vitest-environment jsdom
//
// #34 — MultiSelectCombobox: the multi-value picking WIDGET (removable Tag
// chips + search-to-add Combobox; the Carbon MultiSelect / Polaris
// tag-combobox pattern). Presentation-only: the parent owns `selected` and
// `items`; the widget's internal draft never holds a selection, so a
// single-pick replace of a multi-value field is impossible by construction.
// Relationship SEMANTICS (cardinality, hydration, ID-list value bags) are
// renderer-level — see action-form-renderer-relationships.test.ts.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import MultiSelectCombobox from "../components/MultiSelectCombobox.svelte";

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;

afterEach(() => {
  if (component) {
    unmount(component);
    component = undefined;
  }
  target?.remove();
  target = undefined;
  vi.useRealTimers();
});

function render(props: Record<string, unknown>) {
  target = document.createElement("div");
  document.body.appendChild(target);
  component = mount(MultiSelectCombobox, { target, props });
  flushSync();
  return target;
}

function comboboxInput(): HTMLInputElement {
  const el = target!.querySelector("input[role='combobox']");
  expect(el).not.toBeNull();
  return el as HTMLInputElement;
}

async function openAndPick(label: string) {
  const input = comboboxInput();
  input.focus();
  input.value = "x";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  flushSync();
  await vi.advanceTimersByTimeAsync(300);
  flushSync();
  const option = [...document.querySelectorAll("li.combobox-item")].find((o) =>
    o.textContent?.includes(label),
  ) as HTMLElement;
  expect(option).not.toBeNull();
  option.dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
  );
  flushSync();
}

describe("MultiSelectCombobox", () => {
  it("renders the selection as removable chips with labels", () => {
    const t = render({
      label: "INSPECTORS",
      selected: [
        { value: "u-1", label: "Ana Silva" },
        { value: "u-2", label: "Rui Costa" },
      ],
    });
    const chips = [...t.querySelectorAll(".tag")].map((c) =>
      c.textContent?.trim(),
    );
    expect(chips).toEqual(["Ana Silva", "Rui Costa"]);
    const removes = t.querySelectorAll("button[aria-label='Remove tag']");
    expect(removes).toHaveLength(2);
    // Inside a host <form>, a typeless button would submit on chip removal.
    expect((removes[0] as HTMLButtonElement).type).toBe("button");
  });

  it("chip removal fires onremove with the chip's value", () => {
    const onremove = vi.fn();
    const t = render({
      selected: [
        { value: "u-1", label: "Ana Silva" },
        { value: "u-2", label: "Rui Costa" },
      ],
      onremove,
    });
    const removes = [
      ...t.querySelectorAll("button[aria-label='Remove tag']"),
    ] as HTMLButtonElement[];
    removes[1].click();
    expect(onremove).toHaveBeenCalledWith("u-2");
  });

  it("picking a result fires onadd and clears the draft input", async () => {
    vi.useFakeTimers();
    const onadd = vi.fn();
    const onsearch = vi.fn();
    render({
      selected: [],
      items: [{ value: "u-3", label: "Marta Reis" }],
      onadd,
      onsearch,
    });
    await openAndPick("Marta Reis");
    expect(onadd).toHaveBeenCalledWith("u-3");
    expect(comboboxInput().value).toBe("");
  });

  it("already-selected values never offer in the dropdown", async () => {
    vi.useFakeTimers();
    render({
      selected: [{ value: "u-1", label: "Ana Silva" }],
      items: [
        { value: "u-1", label: "Ana Silva" },
        { value: "u-3", label: "Marta Reis" },
      ],
      onsearch: vi.fn(),
    });
    const input = comboboxInput();
    input.focus();
    input.value = "a";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    await vi.advanceTimersByTimeAsync(300);
    flushSync();
    const options = [...document.querySelectorAll("li.combobox-item")].map(
      (o) => o.textContent ?? "",
    );
    expect(options.join(" ")).toContain("Marta Reis");
    expect(options.join(" ")).not.toContain("Ana Silva");
  });

  it("disabled makes chips non-removable and the search inert", () => {
    const t = render({
      selected: [{ value: "u-1", label: "Ana Silva" }],
      disabled: true,
    });
    expect(t.querySelectorAll("button[aria-label='Remove tag']")).toHaveLength(
      0,
    );
    expect(comboboxInput().disabled).toBe(true);
  });

  it("threads error and required through the field chrome", () => {
    const t = render({
      label: "INSPECTORS",
      required: true,
      selected: [],
      error: "Pick at least one",
    });
    expect(t.textContent).toContain("INSPECTORS (required)");
    expect(comboboxInput().getAttribute("aria-invalid")).toBe("true");
    expect(t.textContent).toContain("Pick at least one");
  });
});
