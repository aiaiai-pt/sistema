// @vitest-environment jsdom
//
// #517 (atelier) — component-render guards for the two DS additions that let a
// unified dashboard/portal `Block[]` render KPI + Metabase embeds via
// `resolveWidget` (no host special-cases):
//   1. MetabaseEmbedWidget renders an <iframe> from a host-resolved `props.src`
//      (presentation-only DS), and a placeholder when unconfigured.
//   2. StatGridWidget renders a per-card Phosphor icon from `stat.icon`.
//
// Component-render (mount into jsdom) because both behaviors are template-only;
// a pure-function test can't see the emitted DOM.
import { mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import MetabaseEmbedWidget from "../components/renderer/MetabaseEmbedWidget.svelte";
import StatGridWidget from "../components/renderer/StatGridWidget.svelte";

function baseProps(over: Record<string, unknown> = {}) {
  return { data: null, schema: null, actionDef: null, props: {}, ...over };
}

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  target?.remove();
  target = undefined;
});

function render(Comp: unknown, props: Record<string, unknown>) {
  target = document.createElement("div");
  document.body.appendChild(target);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component = mount(Comp as any, { target, props }) as unknown as Record<
    string,
    unknown
  >;
  return target;
}

describe("MetabaseEmbedWidget (#517)", () => {
  it("renders an <iframe> from the host-resolved props.src", () => {
    const el = render(
      MetabaseEmbedWidget,
      baseProps({
        props: {
          src: "/internal/metabase-embed/x/1",
          title: "Overview",
          height: "500px",
        },
      }),
    );
    const iframe = el.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute("src")).toBe("/internal/metabase-embed/x/1");
    expect(iframe?.getAttribute("title")).toBe("Overview");
    // caption echoes the title
    expect(el.querySelector("figcaption")?.textContent).toContain("Overview");
  });

  it("renders a placeholder (no iframe) when src is absent", () => {
    const el = render(
      MetabaseEmbedWidget,
      baseProps({ props: { title: "t" } }),
    );
    expect(el.querySelector("iframe")).toBeNull();
    expect(el.textContent).toContain("not configured");
  });
});

describe("StatGridWidget per-card icons (#517)", () => {
  it("renders a Phosphor icon from stat.icon", () => {
    const el = render(
      StatGridWidget,
      baseProps({
        data: { stats: [{ label: "Open", value: "12", icon: "chart-bar" }] },
      }),
    );
    const icon = el.querySelector("i.ph");
    expect(icon).not.toBeNull();
    expect(icon?.className).toBe("ph ph-chart-bar");
  });

  it("renders no icon element when stat.icon is absent", () => {
    const el = render(
      StatGridWidget,
      baseProps({ data: { stats: [{ label: "Open", value: "12" }] } }),
    );
    expect(el.querySelector("i.ph")).toBeNull();
  });

  it("sanitises the icon name into the class (defensive)", () => {
    const el = render(
      StatGridWidget,
      baseProps({
        data: { stats: [{ label: "x", value: "1", icon: "bad name!<>" }] },
      }),
    );
    expect(el.querySelector("i.ph")?.className).toBe("ph ph-badname");
  });
});
