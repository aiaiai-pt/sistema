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

import { mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import { createRegistry, byKind, NOT_APPLICABLE } from "../packages/widget-system/src/core/index.ts";
import StatGridWidget from "../components/renderer/StatGridWidget.svelte";
import type { WidgetRenderRequest } from "../packages/widget-system/src/core/index.ts";

// The request type understood by this demo registry — extends the generic
// WidgetRenderRequest with an optional `kind` discriminant.
type DemoRequest = WidgetRenderRequest & { kind?: string };

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
    const registry = createRegistry<unknown, DemoRequest>();
    registry.register(byKind("stat-grid", "kpi", StatGridWidget));

    const request: DemoRequest = { data: null, props: {}, kind: "kpi" };
    const match = registry.resolve(request);

    expect(match).not.toBeNull();
    expect(match!.key).toBe("stat-grid");
    expect(match!.payload).toBe(StatGridWidget);
  });

  it("resolved widget renders visible DOM output (live render proof)", () => {
    const registry = createRegistry<unknown, DemoRequest>();
    registry.register(byKind("stat-grid", "kpi", StatGridWidget));

    const request: DemoRequest = {
      data: null,
      props: {
        stats: [
          { label: "Reports", value: "42", variant: "accent" },
          { label: "Resolved", value: "38", variant: "positive" },
        ],
      },
      kind: "kpi",
    };

    const match = registry.resolve(request);
    expect(match).not.toBeNull();

    // Render the resolved widget component using the matched payload.
    const el = renderWidget(match!.payload, {
      data: request.data,
      schema: null,
      actionDef: null,
      props: request.props,
    });

    // Verify DOM output — the widget renders at least two stat cards.
    const statValues = el.querySelectorAll(".stat-card__value, .stat-value");
    expect(el.textContent).toContain("42");
    expect(el.textContent).toContain("38");
    // DOM is non-empty — the widget rendered something.
    expect(el.children.length).toBeGreaterThan(0);
  });

  it("two isolated registries cannot observe each other (isolation proof)", () => {
    const r1 = createRegistry<unknown, DemoRequest>();
    const r2 = createRegistry<unknown, DemoRequest>();

    // Only r1 has the kpi widget.
    r1.register(byKind("stat-grid", "kpi", StatGridWidget));

    const req: DemoRequest = { data: null, props: {}, kind: "kpi" };
    expect(r1.resolve(req)).not.toBeNull();
    expect(r2.resolve(req)).toBeNull(); // r2 cannot see r1's registration
  });

  it("byKind score 10 is outranked by a higher-score custom tester", () => {
    const registry = createRegistry<{ label: string }, DemoRequest>();

    registry.register(byKind("generic-kpi", "kpi", { label: "generic" }));

    // A more-specific tester at score 20 overrides the generic for matching requests.
    registry.register({
      key: "specific-kpi",
      payload: { label: "specific" },
      tester: (req, type) =>
        req.kind === "kpi" && type === "specific-kpi" ? 20 : NOT_APPLICABLE,
    });

    const generic = registry.resolve({ data: null, props: {}, kind: "kpi" });
    const specific = registry.resolve(
      { data: null, props: {}, kind: "kpi" },
      "specific-kpi",
    );

    expect(generic?.key).toBe("generic-kpi");   // no type hint → generic wins
    expect(specific?.key).toBe("specific-kpi"); // type hint → specific wins
  });
});
