// @vitest-environment jsdom
//
// Rendered contract tests for the Svelte WidgetRenderer (S1.3 #58). These mount
// the real component in jsdom and assert emitted DOM / ARIA — a no-op renderer
// cannot pass (every assertion checks concrete output, not a return value).
//
// Covered:
//  - ready + matched → the widget's real DOM renders (data-widget-state="ready").
//  - unsupported (no registration): structural → visible alert; optional → collapse.
//  - loading → role=status + aria-busy.
//  - empty: structural → visible; optional → collapse.
//  - stale + matched → widget + a stale affordance.
//  - error boundary: a throwing OPTIONAL widget collapses AND does not crash a
//    sibling renderer (failure isolation); a throwing STRUCTURAL widget surfaces
//    a visible error.
//  - registry is injected per-instance: two registries do not leak.
//  - caller-supplied messages render (string-free package contract, D9).

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import {
  createRegistry,
  byKind,
  type WidgetMatchContext,
  type WidgetRenderRequest,
  type WidgetState,
} from "../../src/core/index.ts";
import WidgetRenderer from "../../src/svelte/WidgetRenderer.svelte";
import EchoWidget from "../fixtures/EchoWidget.svelte";
import ThrowWidget from "../fixtures/ThrowWidget.svelte";

type WidgetComponent = Parameters<typeof byKind>[2];

function echoRegistry() {
  const r = createRegistry<WidgetComponent, WidgetMatchContext>();
  r.register(byKind("echo", "kpi", EchoWidget as WidgetComponent));
  return r;
}

const READY = (over: Partial<WidgetRenderRequest> = {}): WidgetState => ({
  status: "ready",
  request: { data: null, props: {}, ...over },
});

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mounts.push(mount(WidgetRenderer as any, { target, props }) as Record<string, unknown>);
  // Force any scheduled update to settle — a caught error boundary swaps to its
  // `failed` snippet on a scheduled re-render, not synchronously during mount.
  flushSync();
  return target;
}

describe("WidgetRenderer — data rendering", () => {
  it("ready + matched renders the widget's real DOM", () => {
    const el = render({
      registry: echoRegistry(),
      context: { kind: "kpi" },
      state: READY({ data: { count: 3 }, props: { title: "Open reports" }, locale: "pt" }),
    });

    const container = el.querySelector('[data-widget-state="ready"]');
    expect(container).not.toBeNull();
    expect(container?.getAttribute("data-widget-key")).toBe("echo");
    // The fixture rendered the ACTUAL request — proves it is not a no-op.
    expect(el.querySelector(".echo-data")?.textContent).toBe('{"count":3}');
    expect(el.querySelector(".echo-title")?.textContent).toBe("Open reports");
    expect(el.querySelector(".echo")?.getAttribute("data-locale")).toBe("pt");
  });

  it("stale + matched renders the widget plus a stale affordance", () => {
    const el = render({
      registry: echoRegistry(),
      context: { kind: "kpi" },
      state: { status: "stale", request: { data: { count: 1 }, props: {} } },
      messages: { stale: "Showing cached data" },
    });

    expect(el.querySelector('[data-widget-state="stale"]')).not.toBeNull();
    expect(el.querySelector(".echo-data")?.textContent).toBe('{"count":1}');
    const staleNote = el.querySelector("[data-widget-stale]");
    expect(staleNote).not.toBeNull();
    expect(staleNote?.getAttribute("role")).toBe("status");
    expect(staleNote?.textContent).toBe("Showing cached data");
  });
});

describe("WidgetRenderer — fail-closed status states", () => {
  it("unsupported (no registration) is a visible alert on a structural slot", () => {
    const el = render({
      registry: createRegistry(), // empty — nothing matches
      context: { kind: "kpi" },
      state: READY(),
      importance: "structural",
      messages: { unsupported: "No widget for this slot" },
    });
    const status = el.querySelector('[data-widget-state="unsupported"]');
    expect(status).not.toBeNull();
    expect(status?.getAttribute("role")).toBe("alert");
    expect(status?.textContent?.trim()).toBe("No widget for this slot");
  });

  it("unsupported on an optional slot collapses to nothing", () => {
    const el = render({
      registry: createRegistry(),
      context: { kind: "kpi" },
      state: READY(),
      importance: "optional",
    });
    expect(el.querySelector("[data-widget-state]")).toBeNull();
    expect(el.textContent?.trim()).toBe("");
  });

  it("loading renders role=status + aria-busy regardless of importance", () => {
    const el = render({
      registry: echoRegistry(),
      context: { kind: "kpi" },
      state: { status: "loading" },
      importance: "optional",
      messages: { loading: "Loading…" },
    });
    const status = el.querySelector('[data-widget-state="loading"]');
    expect(status).not.toBeNull();
    expect(status?.getAttribute("role")).toBe("status");
    expect(status?.getAttribute("aria-busy")).toBe("true");
    expect(status?.textContent?.trim()).toBe("Loading…");
  });

  it("empty is visible on structural, collapsed on optional", () => {
    const structural = render({
      registry: echoRegistry(),
      context: { kind: "kpi" },
      state: { status: "empty" },
      importance: "structural",
      messages: { empty: "Nothing to show" },
    });
    expect(structural.querySelector('[data-widget-state="empty"]')?.textContent?.trim()).toBe(
      "Nothing to show",
    );

    const optional = render({
      registry: echoRegistry(),
      context: { kind: "kpi" },
      state: { status: "empty" },
      importance: "optional",
      messages: { empty: "Nothing to show" },
    });
    expect(optional.querySelector("[data-widget-state]")).toBeNull();
  });
});

describe("WidgetRenderer — error boundary isolation (acceptance #4)", () => {
  it("a throwing optional widget collapses and does NOT crash a sibling renderer", () => {
    const registry = createRegistry<WidgetComponent, WidgetMatchContext>();
    registry.register(byKind("boom", "kpi", ThrowWidget as WidgetComponent));

    // The throwing widget on an optional slot.
    const bad = render({
      registry,
      context: { kind: "kpi" },
      state: READY(),
      importance: "optional",
      messages: { error: "Widget failed" },
    });
    // Boundary caught it: no unhandled crash; optional → soft (no error text).
    expect(bad.querySelector('[data-widget-key="boom"]')).not.toBeNull();
    expect(bad.textContent).not.toContain("Widget failed");

    // A sibling renderer with a healthy widget still renders — the failure did
    // not propagate across renderers (isolation).
    const good = render({
      registry: echoRegistry(),
      context: { kind: "kpi" },
      state: READY({ data: { ok: true }, props: {} }),
    });
    expect(good.querySelector(".echo-data")?.textContent).toBe('{"ok":true}');
  });

  it("a throwing structural widget surfaces a visible error", () => {
    const registry = createRegistry<WidgetComponent, WidgetMatchContext>();
    registry.register(byKind("boom", "kpi", ThrowWidget as WidgetComponent));

    const el = render({
      registry,
      context: { kind: "kpi" },
      state: READY(),
      importance: "structural",
      messages: { error: "Widget failed" },
    });
    const alert = el.querySelector('[role="alert"][data-widget-state="error"]');
    expect(alert).not.toBeNull();
    expect(alert?.textContent).toContain("Widget failed");
  });
});

describe("WidgetRenderer — registry injection (no module-global state)", () => {
  it("two renderers with different registries resolve independently", () => {
    const r1 = createRegistry<WidgetComponent, WidgetMatchContext>();
    r1.register(byKind("echo", "kpi", EchoWidget as WidgetComponent));
    const r2 = createRegistry<WidgetComponent, WidgetMatchContext>(); // empty

    const withWidget = render({ registry: r1, context: { kind: "kpi" }, state: READY() });
    const withoutWidget = render({
      registry: r2,
      context: { kind: "kpi" },
      state: READY(),
      importance: "structural",
      messages: { unsupported: "none" },
    });

    expect(withWidget.querySelector('[data-widget-key="echo"]')).not.toBeNull();
    // r2 never saw r1's registration → unsupported.
    expect(withoutWidget.querySelector('[data-widget-state="unsupported"]')).not.toBeNull();
  });
});
