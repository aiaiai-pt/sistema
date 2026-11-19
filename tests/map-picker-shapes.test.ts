// @vitest-environment jsdom
//
// atelier#2838 — the REAL MapPicker in its shape modes (jsdom cannot draw on
// the OpenLayers canvas, so drawing itself is covered by the pure composition
// in tests/map-geometry.test.ts; this file covers what the component renders
// and emits around it): the toolbar, the live count from the hydrated value,
// clear → null, the loud mismatch error, keyboard focusability, and the point
// mode staying exactly as it was.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import MapPicker from "../components/MapPicker.svelte";

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;

afterEach(() => {
  if (component) {
    unmount(component);
    component = undefined;
  }
  target?.remove();
  target = undefined;
});

function render(props: Record<string, unknown>) {
  target = document.createElement("div");
  document.body.appendChild(target);
  component = mount(MapPicker, { target, props: { search: false, label: "Area", ...props } });
  flushSync();
  return target;
}

const SQUARE = [
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 0],
  ],
];

function button(t: HTMLElement, text: string): HTMLButtonElement {
  const found = [...t.querySelectorAll("button")].find((b) => b.textContent?.trim() === text);
  expect(found, `button "${text}"`).toBeTruthy();
  return found as HTMLButtonElement;
}

describe("MapPicker shape modes", () => {
  it("multipolygon: toolbar counts the hydrated polygons; Clear emits null", () => {
    const ongeometry = vi.fn();
    const t = render({
      mode: "multipolygon",
      geometry: { type: "MultiPolygon", coordinates: [SQUARE, SQUARE] },
      ongeometry,
    });
    const toolbar = t.querySelector('[role="group"]');
    expect(toolbar?.getAttribute("aria-label")).toBe("Drawing tools");
    expect(toolbar?.textContent).toContain("2 polygons");
    expect(button(t, "Delete selected").disabled).toBe(true);
    const clear = button(t, "Clear");
    expect(clear.disabled).toBe(false);

    clear.click();
    flushSync();
    expect(ongeometry).toHaveBeenLastCalledWith(null);
    expect(toolbar?.textContent).toContain("0 polygons");
    expect(button(t, "Clear").disabled).toBe(true);
  });

  it("a geometry of another type fails loud on the field", () => {
    const t = render({ mode: "multipolygon", geometry: { type: "Polygon", coordinates: SQUARE } });
    expect(t.querySelector('[role="alert"]')?.textContent).toBe(
      "Unsupported geometry: expected a GeoJSON MultiPolygon, got Polygon",
    );
  });

  it("the map is keyboard-focusable and describes how to draw", () => {
    const t = render({ mode: "polygon" });
    const canvas = t.querySelector('[role="application"]') as HTMLElement;
    expect(canvas.getAttribute("tabindex")).toBe("0");
    const hint = t.querySelector(`#${canvas.getAttribute("aria-describedby")}`);
    expect(hint?.textContent).toContain("press Enter to finish");
    // Keys with nothing to act on are left to the browser.
    const esc = new KeyboardEvent("keydown", { key: "Escape", cancelable: true, bubbles: true });
    canvas.dispatchEvent(esc);
    expect(esc.defaultPrevented).toBe(false);
  });

  it("single modes show Clear only (no count, no delete-selected)", () => {
    const t = render({ mode: "linestring" });
    expect(t.textContent).not.toContain("Delete selected");
    expect(button(t, "Clear").disabled).toBe(true);
  });

  it("labels are consumer-overridable", () => {
    const t = render({
      mode: "multipoint",
      geometry: { type: "MultiPoint", coordinates: [[1, 2]] },
      clearLabel: "Limpar",
      deleteSelectedLabel: "Apagar seleção",
      toolbarLabel: "Ferramentas",
      countLabel: (n: number) => `${n} pontos`,
      instructionsLabel: "Clique no mapa",
    });
    expect(t.querySelector('[role="group"]')?.getAttribute("aria-label")).toBe("Ferramentas");
    expect(t.textContent).toContain("1 pontos");
    expect(t.textContent).toContain("Clique no mapa");
    button(t, "Limpar");
    button(t, "Apagar seleção");
  });

  it("point mode is unchanged: no toolbar, not in the tab order", () => {
    const t = render({ mode: "point" });
    expect(t.querySelector('[role="group"]')).toBeNull();
    expect(t.querySelector('[role="application"]')?.hasAttribute("tabindex")).toBe(false);
  });
});
