// @vitest-environment jsdom
//
// atelier#2838 — the geometry widget picks its picker from the parameter's
// DECLARED geometry type (`geometry_type`, a GeoJSON type name sent by the
// Atelier BFF, atelier#2998) and stores a GeoJSON value of EXACTLY that type.
// Absent `geometry_type` keeps the #39 behaviour (a Point). A type the picker
// cannot draw fails LOUD on the field — never a silent point.
//
// MapPicker is replaced by a stub that runs the real `composeGeometry` for the
// mode the renderer chose (jsdom has no canvas to draw on); the pure
// composition itself is covered in tests/map-geometry.test.ts and the real
// MapPicker mount in tests/map-picker-shapes.test.ts.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../components/MapPicker.svelte", async () => ({
  default: (await import("./fixtures/MapPickerStub.svelte")).default,
}));

import ActionFormRenderer from "../components/ActionFormRenderer.svelte";

type Stub = { props: Record<string, any>; draw: (parts: unknown[]) => void };
const g = globalThis as unknown as { __mapPickerStubs?: Stub[] };

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;
let seen: Record<string, unknown>[] = [];

beforeEach(() => {
  g.__mapPickerStubs = [];
  seen = [];
});

afterEach(() => {
  if (component) {
    unmount(component);
    component = undefined;
  }
  target?.remove();
  target = undefined;
});

function render(param: Record<string, unknown>) {
  target = document.createElement("div");
  document.body.appendChild(target);
  component = mount(ActionFormRenderer, {
    target,
    props: {
      action: { key: "__update", label: "Edit" },
      mode: "admin-execute",
      parameters: [
        { key: "location", label: "Location", type: "geometry", widget: "geometry", ...param },
      ],
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    },
  });
  flushSync();
  return target;
}

function picker(): Stub {
  const stubs = g.__mapPickerStubs ?? [];
  expect(stubs.length).toBe(1);
  return stubs[0];
}

function stored(): unknown {
  const last = seen[seen.length - 1] as { form?: { raw_values?: Record<string, unknown> } };
  return last?.form?.raw_values?.location;
}

const SQUARE = [
  [
    [-9.14, 38.72],
    [-9.13, 38.72],
    [-9.13, 38.73],
    [-9.14, 38.73],
    [-9.14, 38.72],
  ],
];
const SQUARE_2 = [
  [
    [-9.12, 38.70],
    [-9.11, 38.70],
    [-9.11, 38.71],
    [-9.12, 38.71],
    [-9.12, 38.70],
  ],
];

describe("geometry widget dispatches on the declared geometry_type", () => {
  it("absent geometry_type keeps the point picker and stores a GeoJSON Point", () => {
    render({});
    const p = picker();
    expect(p.props.mode ?? "point").toBe("point");
    p.draw([[-9.1394, 38.7223]]);
    flushSync();
    expect(stored()).toEqual({ type: "Point", coordinates: [-9.1394, 38.7223] });
  });

  it("declared Point is the same point picker", () => {
    render({ geometry_type: "Point" });
    const p = picker();
    expect(p.props.mode ?? "point").toBe("point");
    p.draw([[1, 2]]);
    flushSync();
    expect(stored()).toEqual({ type: "Point", coordinates: [1, 2] });
  });

  it("a Polygon-declared param draws a polygon and stores a Polygon", () => {
    render({ geometry_type: "Polygon" });
    const p = picker();
    expect(p.props.mode).toBe("polygon");
    p.draw([SQUARE]);
    flushSync();
    const value = stored() as { type: string; coordinates: unknown[] };
    expect(value.type).toBe("Polygon");
    expect(value.coordinates).toHaveLength(1);
    expect(value.coordinates[0]).toHaveLength(5);
  });

  it("a MultiPolygon-declared param stores a MultiPolygon with N polygons", () => {
    render({ geometry_type: "MultiPolygon" });
    const p = picker();
    expect(p.props.mode).toBe("multipolygon");
    p.draw([SQUARE, SQUARE_2]);
    flushSync();
    const value = stored() as { type: string; coordinates: unknown[] };
    expect(value.type).toBe("MultiPolygon");
    expect(value.coordinates).toHaveLength(2);
  });

  it("removing every shape stores null (a clear), never an empty geometry", () => {
    render({ geometry_type: "MultiPolygon" });
    const p = picker();
    p.draw([SQUARE]);
    flushSync();
    p.draw([]);
    flushSync();
    expect(stored()).toBeNull();
  });

  it("clearing a PREFILLED value (edit form) sends null, not the old geometry", () => {
    const old = { type: "MultiPolygon", coordinates: [SQUARE] };
    render({ geometry_type: "MultiPolygon", default_value: old });
    picker().draw([]);
    flushSync();
    expect(stored()).toBeNull();
  });

  it("MultiPoint and LineString are drawable and store their own type", () => {
    render({ geometry_type: "MultiPoint" });
    let p = picker();
    expect(p.props.mode).toBe("multipoint");
    p.draw([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
    flushSync();
    expect(stored()).toEqual({
      type: "MultiPoint",
      coordinates: [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
    });
    unmount(component!);
    component = undefined;
    target?.remove();
    g.__mapPickerStubs = [];

    render({ geometry_type: "LineString" });
    p = picker();
    expect(p.props.mode).toBe("linestring");
    p.draw([
      [
        [1, 2],
        [3, 4],
      ],
    ]);
    flushSync();
    expect(stored()).toEqual({
      type: "LineString",
      coordinates: [
        [1, 2],
        [3, 4],
      ],
    });
  });

  for (const unsupported of ["GeometryCollection", "Circle", "polygon"]) {
    it(`unsupported declared type ${unsupported} renders a LOUD field state, no picker`, () => {
      const t = render({ geometry_type: unsupported });
      expect(g.__mapPickerStubs).toHaveLength(0);
      const alert = t.querySelector('[role="alert"]');
      expect(alert?.textContent).toContain("Unsupported geometry type");
      expect(alert?.textContent).toContain(unsupported);
      expect(t.textContent).toContain("Location");
    });
  }

  it("hydrates an existing value of the declared type onto the picker", () => {
    const value = { type: "MultiPolygon", coordinates: [SQUARE, SQUARE_2] };
    render({ geometry_type: "MultiPolygon", default_value: value });
    const p = picker();
    expect(p.props.geometry).toEqual(value);
    expect(p.props.error).toBeFalsy();
  });

  it("a value of another type fails loud on the field (no silent re-type)", () => {
    const t = render({
      geometry_type: "MultiPolygon",
      default_value: { type: "Polygon", coordinates: SQUARE },
    });
    const p = picker();
    expect(p.props.geometry ?? null).toBeNull();
    expect(p.props.error).toContain("expected a GeoJSON MultiPolygon, got Polygon");
    expect(t.querySelector('[role="alert"]')?.textContent).toContain("Unsupported geometry");
  });
});
