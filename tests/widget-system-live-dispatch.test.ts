// @vitest-environment jsdom
//
// Live-dispatch proof for @aiaiai-pt/widget-system/core extraction (S1.2 #57).
//
// Demonstrates the extracted package's registry/dispatch resolving a real DS
// widget component (StatGridWidget) and rendering it to the DOM — the "running
// page rendering at least one widget resolved through the EXTRACTED package's
// registry/dispatch" criterion.
//
// The registry used here is NOT the DS module-global singleton: it is the new
// isolated factory from packages/widget-system/src/core/index.ts.
//
// Selection and rendering are deliberately separated:
//   - registry.resolve({ kind, type? })  →  WidgetMatchContext (selection input)
//   - renderWidget(payload, { data, props })  →  WidgetRenderRequest (render input)
// This matches the JSONForms lineage: the tester sees the descriptor; the
// component receives the data.

import { mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import {
  createRegistry,
  byKind,
  NOT_APPLICABLE,
  type WidgetMatchContext,
} from "../packages/widget-system/src/core/index.ts";
import StatGridWidget from "../components/renderer/StatGridWidget.svelte";

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  target?.remove();
  target = undefined;
});

function renderWidget(
  Widget: unknown,
  props: Record<string, unknown>,
): HTMLElement {
  target = document.createElement("div");
  document.body.appendChild(target);
  component = mount(Widget as Parameters<typeof mount>[0], {
    target,
    props,
  }) as unknown as Record<string, unknown>;
  return target;
}

describe("widget-system/core live dispatch (S1.2 #57)", () => {
  it("createRegistry() resolves StatGridWidget by kind 'kpi'", () => {
    // EXTRACTED registry — NOT the DS module-global singleton.
    const registry = createRegistry<unknown>();
    registry.register(byKind("stat-grid", "kpi", StatGridWidget));

    // Selection context: only kind/type — no data/props.
    const ctx: WidgetMatchContext = { kind: "kpi" };
    const match = registry.resolve(ctx);

    expect(match).not.toBeNull();
    expect(match!.key).toBe("stat-grid");
    expect(match!.payload).toBe(StatGridWidget);
  });

  it("resolved widget renders visible DOM output (live render proof)", () => {
    const registry = createRegistry<unknown>();
    registry.register(byKind("stat-grid", "kpi", StatGridWidget));

    // Selection — context only.
    const match = registry.resolve({ kind: "kpi" });
    expect(match).not.toBeNull();

    // Render — WidgetRenderRequest (separate from the match context).
    const el = renderWidget(match!.payload, {
      data: null,
      schema: null,
      actionDef: null,
      props: {
        stats: [
          { label: "Reports", value: "42", variant: "accent" },
          { label: "Resolved", value: "38", variant: "positive" },
        ],
      },
    });

    // Verify DOM output — the widget renders at least two stat cards.
    expect(el.textContent).toContain("42");
    expect(el.textContent).toContain("38");
    // DOM is non-empty — the widget rendered something.
    expect(el.children.length).toBeGreaterThan(0);
  });

  it("two isolated registries cannot observe each other (isolation proof)", () => {
    const r1 = createRegistry<unknown>();
    const r2 = createRegistry<unknown>();

    // Only r1 has the kpi widget.
    r1.register(byKind("stat-grid", "kpi", StatGridWidget));

    expect(r1.resolve({ kind: "kpi" })).not.toBeNull();
    expect(r2.resolve({ kind: "kpi" })).toBeNull(); // r2 cannot see r1's registration
  });

  it("byKind score 10 is outranked by a higher-score custom tester", () => {
    const registry = createRegistry<{ label: string }>();

    registry.register(byKind("generic-kpi", "kpi", { label: "generic" }));

    // A more-specific tester at score 20 overrides the generic for matching requests.
    // The type hint is part of the match context, not a separate positional arg.
    registry.register({
      key: "specific-kpi",
      payload: { label: "specific" },
      tester: (ctx) =>
        ctx.kind === "kpi" && ctx.type === "specific-kpi" ? 20 : NOT_APPLICABLE,
    });

    // No type hint → generic wins (score 10 beats NOT_APPLICABLE for specific).
    const generic = registry.resolve({ kind: "kpi" });
    // type hint in context → specific-kpi tester scores 20, beats generic's 10.
    const specific = registry.resolve({ kind: "kpi", type: "specific-kpi" });

    expect(generic?.key).toBe("generic-kpi");
    expect(specific?.key).toBe("specific-kpi");
  });
});
