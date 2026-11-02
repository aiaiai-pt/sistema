// @vitest-environment jsdom
//
// Popover keeps its viewport cap while its own content scrolls. The scroll
// listener is a capture listener, so scrolling inside a capped popover calls
// reposition() again. Measuring the popover's rendered box at that point reads
// the CAPPED height, which "fits", so the cap was dropped and the popover grew
// back past the viewport (found as martha admin's tenant picker, 40 tenants in
// the sidebar footer). reposition() must measure the natural content height.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Popover from "../components/Popover.svelte";

const VIEWPORT_H = 800;
const NATURAL_H = 1280;
/** Natural content height of the popover in the current case. */
let natural = NATURAL_H;
const ANCHOR = {
  top: 760,
  bottom: 790,
  left: 16,
  right: 196,
  width: 180,
  height: 30,
};

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;

/** Rendered height of the popover: its natural height, clipped by max-height. */
function renderedHeight(el: HTMLElement): number {
  const cap = parseFloat(el.style.maxHeight);
  return Number.isNaN(cap) ? natural : Math.min(natural, cap);
}

beforeEach(() => {
  natural = NATURAL_H;
  vi.stubGlobal("innerHeight", VIEWPORT_H);
  vi.stubGlobal("innerWidth", 1280);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      if (this.classList.contains("popover")) {
        const h = renderedHeight(this);
        return {
          top: 0,
          bottom: h,
          left: 0,
          right: 180,
          width: 180,
          height: h,
          x: 0,
          y: 0,
          toJSON() {},
        } as DOMRect;
      }
      return {
        ...ANCHOR,
        x: ANCHOR.left,
        y: ANCHOR.top,
        toJSON() {},
      } as DOMRect;
    },
  );
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(
    function (this: HTMLElement) {
      return this.classList.contains("popover") ? natural : 0;
    },
  );
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(
    function (this: HTMLElement) {
      return this.classList.contains("popover") ? renderedHeight(this) : 0;
    },
  );
});

afterEach(() => {
  if (component) {
    unmount(component);
    component = undefined;
  }
  target?.remove();
  target = undefined;
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function openAboveFooterTrigger(): HTMLElement {
  const anchor = document.createElement("button");
  document.body.appendChild(anchor);
  target = document.createElement("div");
  document.body.appendChild(target);
  component = mount(Popover, {
    target,
    props: { open: true, anchor, placement: "top-start" },
  });
  flushSync();
  const el = document.querySelector<HTMLElement>(".popover");
  expect(el).not.toBeNull();
  return el as HTMLElement;
}

describe("Popover viewport cap", () => {
  it("opens above the trigger, capped to the room above it", () => {
    const popover = openAboveFooterTrigger();
    const room = ANCHOR.top - 4;
    expect(popover.style.maxHeight).toBe(`${room}px`);
    expect(popover.style.overflowY).toBe("auto");
    expect(popover.style.top).toBe("0px");
  });

  it("keeps the cap when its own content scrolls", () => {
    const popover = openAboveFooterTrigger();
    const room = ANCHOR.top - 4;

    popover.dispatchEvent(new Event("scroll"));
    flushSync();

    expect(popover.style.maxHeight).toBe(`${room}px`);
    expect(popover.style.overflowY).toBe("auto");
    expect(popover.style.top).toBe("0px");
  });

  it("uncaps once the content fits again", () => {
    const popover = openAboveFooterTrigger();
    natural = 200;

    window.dispatchEvent(new Event("resize"));
    flushSync();

    expect(popover.style.maxHeight).toBe("");
    expect(popover.style.top).toBe(`${ANCHOR.top - 200 - 4}px`);
  });
});
