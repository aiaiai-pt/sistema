// @vitest-environment jsdom
//
// #629 PR1b — Panel `modeless` mode (spec contract #2): fixed slide-over with
// no backdrop, no aria-modal, a labelled region whose heading takes initial
// focus (moved, NOT trapped), Escape closing only while focus is inside, and
// focus restored to the invoker on close. Plus parity guards proving the
// existing dialog and persistent modes are untouched.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import Panel from "../components/Panel.svelte";

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;

afterEach(() => {
  if (component) {
    unmount(component);
    component = undefined;
  }
  target?.remove();
  target = undefined;
  document.body.innerHTML = "";
});

function render(props: Record<string, unknown>) {
  target = document.createElement("div");
  document.body.appendChild(target);
  component = mount(Panel, {
    target,
    props: { open: true, title: "Execute", onclose: () => {}, ...props },
  });
  flushSync();
  return target;
}

function panel(): HTMLElement {
  const el = document.querySelector("aside.panel");
  expect(el).not.toBeNull();
  return el as HTMLElement;
}

describe("Panel modeless mode", () => {
  it("renders a fixed slide-over region: no backdrop, no aria-modal, role=region", () => {
    render({ modeless: true });
    expect(document.querySelector(".panel-backdrop")).toBeNull();
    const el = panel();
    expect(el.getAttribute("role")).toBe("region");
    expect(el.getAttribute("aria-modal")).toBeNull();
    // Fixed slide-over, NOT the persistent inline variant.
    expect(el.classList.contains("panel-persistent")).toBe(false);
  });

  it("is labelled and moves initial focus to the heading (announced, not trapped)", () => {
    render({ modeless: true, title: "Execute" });
    const el = panel();
    expect(el.getAttribute("aria-label")).toBe("Execute");
    const heading = el.querySelector(".panel-heading-focus") as HTMLElement;
    expect(heading).not.toBeNull();
    expect(heading.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(heading);
  });

  it("Escape closes only while focus is INSIDE the panel", () => {
    const onclose = vi.fn();
    render({ modeless: true, onclose });

    // Focus outside (the page behind is interactive in modeless mode).
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    outside.focus();
    outside.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(onclose).not.toHaveBeenCalled();

    // Focus inside → Escape closes.
    const heading = panel().querySelector(
      ".panel-heading-focus",
    ) as HTMLElement;
    heading.focus();
    heading.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(onclose).toHaveBeenCalledOnce();
  });

  it("does not trap Tab (no document-level keydown interception)", () => {
    render({ modeless: true });
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    outside.focus();
    // In dialog mode the trap would preventDefault + wrap focus back into the
    // panel; modeless must leave a Tab outside the panel completely alone.
    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    outside.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(outside);
  });

  it("restores focus to the invoker on close", async () => {
    const invoker = document.createElement("button");
    document.body.appendChild(invoker);
    invoker.focus();

    target = document.createElement("div");
    document.body.appendChild(target);
    component = mount(Panel, {
      target,
      props: {
        open: true,
        modeless: true,
        title: "Execute",
        onclose: () => {},
      },
    });
    flushSync();
    expect(document.activeElement).not.toBe(invoker);

    unmount(component);
    component = undefined;
    flushSync();
    expect(document.activeElement).toBe(invoker);
  });

  it("persistent wins over modeless (existing inline consumers unaffected)", () => {
    render({ modeless: true, persistent: true });
    const el = panel();
    expect(el.getAttribute("role")).toBe("complementary");
    expect(el.classList.contains("panel-persistent")).toBe(true);
    // Persistent mode owns no close button.
    expect(el.querySelector(".panel-close")).toBeNull();
  });
});

describe("Panel existing modes — parity", () => {
  it("default (dialog) mode is untouched: backdrop + aria-modal + focus on first focusable", () => {
    render({});
    expect(document.querySelector(".panel-backdrop")).not.toBeNull();
    const el = panel();
    expect(el.getAttribute("role")).toBe("dialog");
    expect(el.getAttribute("aria-modal")).toBe("true");
    // Dialog focuses the first focusable (the close button), NOT the heading.
    expect(document.activeElement).toBe(el.querySelector(".panel-close"));
  });

  it("dialog mode still closes on Escape regardless of focus position", () => {
    const onclose = vi.fn();
    render({ onclose });
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    outside.focus();
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(onclose).toHaveBeenCalledOnce();
  });

  it("persistent mode is untouched: inline complementary, no backdrop, no close button", () => {
    render({ persistent: true });
    expect(document.querySelector(".panel-backdrop")).toBeNull();
    const el = panel();
    expect(el.getAttribute("role")).toBe("complementary");
    expect(el.getAttribute("aria-modal")).toBeNull();
    expect(el.querySelector(".panel-close")).toBeNull();
  });
});
