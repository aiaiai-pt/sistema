// @vitest-environment jsdom
//
// Popover focuses its first ENABLED focusable child on open. It used to take
// the first match of its focusable selector, so a popover whose first button
// was disabled (natively or via aria-disabled) put focus on a control the user
// cannot use. With no enabled control it leaves focus alone and does not throw.

import { createRawSnippet, flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Popover from "../components/Popover.svelte";

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
  vi.unstubAllGlobals();
});

function open(html: string): HTMLElement {
  const anchor = document.createElement("button");
  anchor.textContent = "anchor";
  document.body.appendChild(anchor);
  anchor.focus();
  target = document.createElement("div");
  document.body.appendChild(target);
  const children = createRawSnippet(() => ({ render: () => `<div>${html}</div>` }));
  component = mount(Popover, { target, props: { open: true, anchor, children } });
  flushSync();
  return anchor;
}

const focused = () => document.activeElement?.textContent?.trim();

describe("Popover focus on open", () => {
  it("skips a natively disabled first button", () => {
    open(`<button disabled>First</button><button>Second</button>`);
    expect(focused()).toBe("Second");
  });

  it("skips an aria-disabled first button", () => {
    open(`<button aria-disabled="true">First</button><button>Second</button>`);
    expect(focused()).toBe("Second");
  });

  it("focuses the first button when it is enabled", () => {
    open(`<button>First</button><button>Second</button>`);
    expect(focused()).toBe("First");
  });

  it("does nothing and does not throw when every control is disabled", () => {
    let anchor: HTMLElement | undefined;
    expect(() => {
      anchor = open(
        `<button disabled>First</button><button aria-disabled="true">Second</button>`,
      );
    }).not.toThrow();
    expect(document.activeElement).toBe(anchor);
  });
});
