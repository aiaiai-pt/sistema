// SSR determinism (acceptance #3): the renderer produces deterministic server
// output and never touches a browser-only global during server render. Uses
// Svelte's server renderer (`svelte/server`) — the same path a SvelteKit host
// takes for the initial HTML — in the default node env (NO jsdom, so any
// window/localStorage access would throw here and fail the test).

import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import {
  createRegistry,
  byKind,
  type WidgetMatchContext,
  type WidgetRenderRequest,
  type WidgetState,
} from "../../src/core/index";
import WidgetRenderer from "../../src/svelte/WidgetRenderer.svelte";
import EchoWidget from "../fixtures/EchoWidget.svelte";

type WidgetComponent = Parameters<typeof byKind>[2];

function echoRegistry() {
  const r = createRegistry<WidgetComponent, WidgetMatchContext>();
  r.register(byKind("echo", "kpi", EchoWidget as WidgetComponent));
  return r;
}

const READY: WidgetState = {
  status: "ready",
  request: { data: { count: 7 }, props: { title: "SSR" }, locale: "en" } as WidgetRenderRequest,
};

describe("WidgetRenderer SSR", () => {
  it("renders the widget to a deterministic HTML string on the server", () => {
    const first = render(WidgetRenderer, {
      props: { registry: echoRegistry(), context: { kind: "kpi" }, state: READY },
    });
    const second = render(WidgetRenderer, {
      props: { registry: echoRegistry(), context: { kind: "kpi" }, state: READY },
    });

    // Deterministic: two independent server renders of the same inputs match.
    expect(first.body).toBe(second.body);
    // The widget's real content is in the server HTML (not a client-only no-op).
    expect(first.body).toContain('data-widget-state="ready"');
    expect(first.body).toContain('data-widget-key="echo"');
    expect(first.body).toContain('{"count":7}');
    expect(first.body).toContain("SSR");
  });

  it("renders a fail-closed status on the server for a structural unsupported slot", () => {
    const { body } = render(WidgetRenderer, {
      props: {
        registry: createRegistry(),
        context: { kind: "kpi" },
        state: READY,
        importance: "structural",
        messages: { unsupported: "No widget" },
      },
    });
    expect(body).toContain('data-widget-state="unsupported"');
    expect(body).toContain("No widget");
  });

  it("collapses an optional unsupported slot on the server (no stray markup)", () => {
    const { body } = render(WidgetRenderer, {
      props: {
        registry: createRegistry(),
        context: { kind: "kpi" },
        state: READY,
        importance: "optional",
      },
    });
    expect(body).not.toContain("data-widget-state");
  });
});
