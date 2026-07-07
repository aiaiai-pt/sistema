// @vitest-environment jsdom
//
// #35 (atelier#669 V1) — MoneyInput: number-semantics input with a currency
// affordance. The WIRE value is always a raw number (never a formatted
// string); locale-aware formatting/grouping appears on blur only; empty and
// 0 are distinct states. The contract already emits widget:"currency" for
// the 14 sheet-authored money fields (legal refinement of number).

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import MoneyInput from "../components/MoneyInput.svelte";
import ActionFormRenderer from "../components/ActionFormRenderer.svelte";

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

function render(Component: unknown, props: Record<string, unknown>) {
  target = document.createElement("div");
  document.body.appendChild(target);
  component = mount(Component as never, { target, props });
  flushSync();
  return target;
}

function field(): HTMLInputElement {
  const el = target!.querySelector("input");
  expect(el).not.toBeNull();
  return el as HTMLInputElement;
}

describe("MoneyInput (widget)", () => {
  it("typing emits a NUMBER; blur formats the display locale-aware; refocus edits raw", () => {
    const onchange = vi.fn();
    render(MoneyInput, { label: "BUDGET", locale: "pt-PT", onchange });
    const input = field();

    input.focus();
    input.dispatchEvent(new Event("focus", { bubbles: true }));
    flushSync();
    input.value = "1234.5";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    expect(onchange).toHaveBeenLastCalledWith(1234.5);

    input.dispatchEvent(new Event("blur", { bubbles: true }));
    flushSync();
    const expected = new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(1234.5);
    expect(input.value).toBe(expected);

    input.dispatchEvent(new Event("focus", { bubbles: true }));
    flushSync();
    expect(input.value).toBe("1234.5");
  });

  it("accepts a comma decimal and still emits a number", () => {
    const onchange = vi.fn();
    render(MoneyInput, { locale: "pt-PT", onchange });
    const input = field();
    input.dispatchEvent(new Event("focus", { bubbles: true }));
    input.value = "12,75";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(onchange).toHaveBeenLastCalledWith(12.75);
  });

  it("distinguishes empty (null) from 0", () => {
    const onchange = vi.fn();
    render(MoneyInput, { locale: "pt-PT", value: 0, onchange });
    const input = field();
    // 0 formats as currency on the unfocused display…
    expect(input.value).toBe(
      new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
      }).format(0),
    );
    // …and clearing the field emits null, displaying EMPTY after blur (not €0).
    input.dispatchEvent(new Event("focus", { bubbles: true }));
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(onchange).toHaveBeenLastCalledWith(null);
    input.dispatchEvent(new Event("blur", { bubbles: true }));
    flushSync();
    expect(input.value).toBe("");
  });

  it("respects a non-default currency affordance", () => {
    render(MoneyInput, { locale: "en-US", currency: "USD", value: 5 });
    expect(field().value).toBe(
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(5),
    );
  });

  it("threads error/disabled/readonly like every DS input", () => {
    const t = render(MoneyInput, {
      label: "BUDGET",
      error: "Must be positive",
      disabled: true,
    });
    expect(field().disabled).toBe(true);
    expect(field().getAttribute("aria-invalid")).toBe("true");
    expect(t.textContent).toContain("Must be positive");
  });
});

describe("currency widget (renderer dispatch)", () => {
  it("widget:'currency' renders MoneyInput and the bag carries a raw number", () => {
    const seen: Record<string, unknown>[] = [];
    const t = render(ActionFormRenderer, {
      action: { key: "__update", label: "Edit" },
      mode: "admin-execute",
      parameters: [
        {
          key: "budget",
          label: "Budget",
          type: "number",
          widget: "currency",
          default_value: 100,
        },
      ],
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    expect(t.querySelector(".money-input")).not.toBeNull();
    const last = seen[seen.length - 1] as {
      form?: { raw_values?: Record<string, unknown> };
    };
    expect(last?.form?.raw_values?.budget).toBe(100);

    const input = t.querySelector(".money-input input") as HTMLInputElement;
    input.dispatchEvent(new Event("focus", { bubbles: true }));
    input.value = "250.75";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    const after = seen[seen.length - 1] as {
      form?: { raw_values?: Record<string, unknown> };
    };
    expect(after?.form?.raw_values?.budget).toBe(250.75);
  });
});
