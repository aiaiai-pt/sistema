// @vitest-environment jsdom
//
// Rendered tests for EmbeddedAnalysisWidget (S1.4 #59). Mounts the real widget
// in jsdom and asserts emitted DOM/ARIA. Covered: iframe from a safe host-
// resolved URL, accessible title, loading=lazy, the empty state for an absent
// or UNSAFE src (no iframe — the defence-in-depth guard), and the bounded
// (overflow-safe) frame height.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import EmbeddedAnalysisWidget from "../../src/widgets/EmbeddedAnalysisWidget.svelte";
import type { WidgetRenderRequest } from "../../src/core/index";

let mounts: Array<Record<string, unknown>> = [];
let targets: HTMLElement[] = [];

afterEach(() => {
  for (const m of mounts) unmount(m);
  for (const t of targets) t.remove();
  mounts = [];
  targets = [];
});

function render(props: Record<string, unknown>): HTMLElement {
  const target = document.createElement("div");
  document.body.appendChild(target);
  targets.push(target);
  // The widget only reads `props`; supply the full render request shape.
  const request: WidgetRenderRequest = { data: null, props };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mounts.push(mount(EmbeddedAnalysisWidget as any, { target, props: request }) as Record<string, unknown>);
  flushSync();
  return target;
}

describe("EmbeddedAnalysisWidget — renders a safe embed", () => {
  it("renders an <iframe> from a host-resolved https URL", () => {
    const el = render({
      src: "https://metabase.example.com/embed/dash/1?token=abc",
      title: "City overview",
      height: "500px",
    });
    const iframe = el.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute("src")).toBe(
      "https://metabase.example.com/embed/dash/1?token=abc",
    );
    // Accessibility: the iframe carries an accessible title, and the caption echoes it.
    expect(iframe?.getAttribute("title")).toBe("City overview");
    expect(el.querySelector("figcaption")?.textContent).toBe("City overview");
    // Deferred network (loading behaviour).
    expect(iframe?.getAttribute("loading")).toBe("lazy");
    // Overflow-safe: the frame is height-bounded.
    expect(iframe?.getAttribute("style")).toContain("height");
  });

  it("renders a root-relative proxy URL", () => {
    const el = render({ src: "/internal/metabase-embed/x/1", title: "t" });
    expect(el.querySelector("iframe")?.getAttribute("src")).toBe(
      "/internal/metabase-embed/x/1",
    );
  });
});

describe("EmbeddedAnalysisWidget — fail-closed on bad/absent src", () => {
  it("renders the empty state (no iframe) when src is absent", () => {
    const el = render({ title: "Unconfigured" });
    expect(el.querySelector("iframe")).toBeNull();
    const empty = el.querySelector('[data-widget-state="empty"]');
    expect(empty).not.toBeNull();
    expect(empty?.getAttribute("role")).toBe("status");
  });

  it("renders the empty state (no iframe) for a javascript: src — defence in depth", () => {
    const el = render({ src: "javascript:alert(1)", title: "hostile" });
    expect(el.querySelector("iframe")).toBeNull();
    expect(el.querySelector('[data-widget-state="empty"]')).not.toBeNull();
  });

  it("renders the empty state for a protocol-relative //host src", () => {
    const el = render({ src: "//evil.example.com/x" });
    expect(el.querySelector("iframe")).toBeNull();
    expect(el.querySelector('[data-widget-state="empty"]')).not.toBeNull();
  });
});
