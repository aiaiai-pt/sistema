// @vitest-environment jsdom
//
// Integration tests for registerBaseWidgets (S1.4 #59): the two generic widgets
// register under DISTINCT kinds/keys, resolve deterministically, never fall
// back to one another, and render together on ONE surface through the S1.3
// WidgetRenderer.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import {
  createRegistry,
  type WidgetMatchContext,
  type WidgetRenderRequest,
  type WidgetState,
} from "../../src/core/index.ts";
import {
  registerBaseWidgets,
  NATIVE_CHART_KEY,
  EMBEDDED_ANALYSIS_KEY,
  ENTRY_STREAM_KEY,
  INDICATOR_CARD_KEY,
  DEFINITION_MEMBERS_CARD_KEY,
  CHART_TILE_MOCK_KEY,
  type WidgetComponent,
} from "../../src/widgets/index.ts";
import WidgetRenderer from "../../src/svelte/WidgetRenderer.svelte";

describe("registerBaseWidgets — distinct keys, no fallback", () => {
  // The base set is pinned deliberately: a widget appearing in every host's
  // registry without anyone opting in is a real change, so it should break this
  // test and be added here on purpose. The four card faces joined the set when
  // the investigations surfaces moved from bespoke components to widget kinds.
  it("registers exactly the base widget set", () => {
    const r = createRegistry<WidgetComponent, WidgetMatchContext>();
    registerBaseWidgets(r);
    expect(r.entries.map((e) => e.key).sort()).toEqual(
      [
        EMBEDDED_ANALYSIS_KEY,
        NATIVE_CHART_KEY,
        ENTRY_STREAM_KEY,
        INDICATOR_CARD_KEY,
        DEFINITION_MEMBERS_CARD_KEY,
        CHART_TILE_MOCK_KEY,
      ].sort(),
    );
  });

  it("resolves chart → native-chart and embed → embedded-analysis", () => {
    const r = createRegistry<WidgetComponent, WidgetMatchContext>();
    registerBaseWidgets(r);
    expect(r.resolve({ kind: "chart" })?.key).toBe(NATIVE_CHART_KEY);
    expect(r.resolve({ kind: "embed" })?.key).toBe(EMBEDDED_ANALYSIS_KEY);
  });

  it("has NO heuristic fallback between the two widgets", () => {
    // A registry with ONLY the native chart must not answer an embed context
    // with the chart (and vice versa) — the kinds are disjoint testers.
    const chartOnly = createRegistry<WidgetComponent, WidgetMatchContext>();
    const full = createRegistry<WidgetComponent, WidgetMatchContext>();
    registerBaseWidgets(full);
    // Copy just the native-chart entry into chartOnly.
    const nativeChart = full.entries.find((e) => e.key === NATIVE_CHART_KEY);
    if (nativeChart) chartOnly.register(nativeChart);

    expect(chartOnly.resolve({ kind: "embed" })).toBeNull();
    // And a full registry never returns the embed widget for a chart context.
    expect(full.resolve({ kind: "chart" })?.key).not.toBe(EMBEDDED_ANALYSIS_KEY);
  });
});

describe("both widgets render on one surface", () => {
  let mounts: Array<Record<string, unknown>> = [];
  let targets: HTMLElement[] = [];

  afterEach(() => {
    for (const m of mounts) unmount(m);
    for (const t of targets) t.remove();
    mounts = [];
    targets = [];
  });

  function renderSlot(context: WidgetMatchContext, state: WidgetState): HTMLElement {
    const registry = createRegistry<WidgetComponent, WidgetMatchContext>();
    registerBaseWidgets(registry);
    const target = document.createElement("div");
    document.body.appendChild(target);
    targets.push(target);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mounts.push(
      mount(WidgetRenderer as any, {
        target,
        props: { registry, context, state, importance: "structural" },
      }) as Record<string, unknown>,
    );
    flushSync();
    return target;
  }

  it("a chart slot and an embed slot both render their real output", () => {
    const chartState: WidgetState = {
      status: "ready",
      request: {
        data: { category: ["A", "B"], series: [{ name: "N", type: "bar", data: [1, 2] }] },
        props: { labelHeader: "Item" },
      } as WidgetRenderRequest,
    };
    const embedState: WidgetState = {
      status: "ready",
      request: { data: null, props: { src: "https://ex.com/embed/1", title: "Embed" } },
    };

    const chartEl = renderSlot({ kind: "chart" }, chartState);
    const embedEl = renderSlot({ kind: "embed" }, embedState);

    // Chart slot → the accessible table; embed slot → the iframe. Distinct keys.
    expect(chartEl.querySelector(`[data-widget-key="${NATIVE_CHART_KEY}"]`)).not.toBeNull();
    expect(chartEl.querySelector("table")).not.toBeNull();
    expect(embedEl.querySelector(`[data-widget-key="${EMBEDDED_ANALYSIS_KEY}"]`)).not.toBeNull();
    expect(embedEl.querySelector("iframe")?.getAttribute("src")).toBe("https://ex.com/embed/1");
  });
});
