// @vitest-environment jsdom
//
// Menu walks every WAI-ARIA menu item role, not only role="menuitem".
// A Menu of sort options built from menuitemradio items was unreachable by
// keyboard: ArrowDown/Up/Home/End and typeahead only saw plain menuitems, and
// Enter/Space only activated them. Disabled items (aria-disabled or native
// :disabled) are skipped. MenuItem takes `role` and `checked`; aria-checked is
// rendered only for the radio/checkbox roles.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MenuItem from "../components/MenuItem.svelte";
import MenuRadioHarness from "./fixtures/MenuRadioHarness.svelte";

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
});

afterEach(() => {
  if (component) {
    unmount(component);
    component = undefined;
  }
  target?.remove();
  target = undefined;
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function renderMenu(props: Record<string, unknown> = {}) {
  const anchor = document.createElement("button");
  document.body.appendChild(anchor);
  target = document.createElement("div");
  document.body.appendChild(target);
  component = mount(MenuRadioHarness, { target, props: { anchor, ...props } });
  flushSync();
  const menu = document.querySelector<HTMLElement>(".menu");
  expect(menu).not.toBeNull();
  return menu as HTMLElement;
}

function item(label: string): HTMLElement {
  const el = Array.from(
    document.querySelectorAll<HTMLElement>(".menu button"),
  ).find((b) => b.textContent?.trim() === label);
  expect(el, label).toBeDefined();
  return el as HTMLElement;
}

function press(menu: HTMLElement, key: string) {
  const ev = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  (document.activeElement ?? menu).dispatchEvent(ev);
  flushSync();
  return ev;
}

const focused = () => document.activeElement?.textContent?.trim();

describe("Menu item roles", () => {
  it("ArrowDown visits radio and checkbox items and skips disabled ones", () => {
    const menu = renderMenu();
    item("Edit").focus();
    const seen = [focused()];
    for (let i = 0; i < 4; i++) {
      press(menu, "ArrowDown");
      seen.push(focused());
    }
    expect(seen).toEqual([
      "Edit",
      "Name",
      "Date",
      "Show hidden",
      "Edit",
    ]);
  });

  it("ArrowUp walks back over radio items and skips disabled ones", () => {
    const menu = renderMenu();
    item("Show hidden").focus();
    press(menu, "ArrowUp");
    expect(focused()).toBe("Date");
    press(menu, "ArrowUp");
    expect(focused()).toBe("Name");
  });

  it("Home and End land on the first and last enabled items of any role", () => {
    const menu = renderMenu();
    item("Name").focus();
    press(menu, "End");
    expect(focused()).toBe("Show hidden");
    press(menu, "Home");
    expect(focused()).toBe("Edit");
  });

  it("typeahead reaches radio items and never a disabled one", () => {
    vi.useFakeTimers();
    const menu = renderMenu();
    item("Edit").focus();
    press(menu, "d");
    expect(focused()).toBe("Date");
    vi.advanceTimersByTime(600);
    press(menu, "n");
    expect(focused()).toBe("Name");
    vi.advanceTimersByTime(600);
    // "Kind" is natively disabled: "k" matches nothing, focus stays put.
    press(menu, "k");
    expect(focused()).toBe("Name");
    vi.advanceTimersByTime(600);
    // "Size" is aria-disabled: "s" lands on the next enabled match, and "si"
    // matches nothing, so focus never reaches "Size".
    press(menu, "s");
    expect(focused()).toBe("Show hidden");
    press(menu, "i");
    expect(focused()).toBe("Show hidden");
  });

  it("Enter and Space activate radio and checkbox items", () => {
    const menu = renderMenu();
    const radio = item("Date");
    const checkbox = item("Show hidden");
    const radioClick = vi.fn();
    const checkboxClick = vi.fn();
    radio.addEventListener("click", radioClick);
    checkbox.addEventListener("click", checkboxClick);

    radio.focus();
    press(menu, "Enter");
    checkbox.focus();
    press(menu, " ");

    expect(radioClick).toHaveBeenCalledTimes(1);
    expect(checkboxClick).toHaveBeenCalledTimes(1);
  });

  it("renders the item role and aria-checked for radio items", () => {
    renderMenu({ sort: "date" });
    expect(item("Name").getAttribute("role")).toBe("menuitemradio");
    expect(item("Name").getAttribute("aria-checked")).toBe("false");
    expect(item("Date").getAttribute("aria-checked")).toBe("true");
    expect(item("Show hidden").getAttribute("role")).toBe("menuitemcheckbox");
    expect(item("Show hidden").getAttribute("aria-checked")).toBe("true");
  });

  it("keeps role=menuitem by default and never renders aria-checked on it", () => {
    target = document.createElement("div");
    document.body.appendChild(target);
    component = mount(MenuItem, { target, props: { checked: true } });
    flushSync();
    const btn = target.querySelector("button")!;
    expect(btn.getAttribute("role")).toBe("menuitem");
    expect(btn.hasAttribute("aria-checked")).toBe(false);
  });
});
