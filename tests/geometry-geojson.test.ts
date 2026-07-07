// @vitest-environment jsdom
//
// #39 (atelier#669 V1) — geometry speaks GeoJSON on the wire. The ONE
// contract answer: the form-surface.v1 `geometry` widget carries a GeoJSON
// Point in the value bag; the DS MapPicker keeps speaking [lon, lat] at its
// prop edge; the renderer's pure serialization layer adapts (the date-only
// pattern — no host-side shape juggling). Non-Point payloads fail LOUD.
// The legacy action-lane `geo` param (bare [lon,lat] tuple) is untouched.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import ActionFormRenderer from "../components/ActionFormRenderer.svelte";
import {
  geoJsonPointToLonLat,
  lonLatToGeoJsonPoint,
} from "../components/action-form-renderer-widgets";

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
  component = mount(ActionFormRenderer, {
    target,
    props: {
      action: { key: "__update", label: "Edit" },
      mode: "admin-execute",
      ...props,
    },
  });
  flushSync();
  return target;
}

// ─── the pure wire adapters ─────────────────────────────────────────────────

describe("GeoJSON Point adapters (pure)", () => {
  it("a GeoJSON Point round-trips through the tuple edge", () => {
    const point = { type: "Point", coordinates: [-9.1394, 38.7223] };
    const { coords, error } = geoJsonPointToLonLat(point);
    expect(error).toBeNull();
    expect(coords).toEqual([-9.1394, 38.7223]);
    expect(lonLatToGeoJsonPoint(coords as [number, number])).toEqual(point);
  });

  it("empty values hydrate as no pin, no error", () => {
    for (const empty of [null, undefined, ""]) {
      const { coords, error } = geoJsonPointToLonLat(empty);
      expect(coords).toBeNull();
      expect(error).toBeNull();
    }
  });

  it("non-Point geometries fail LOUD, never silently", () => {
    const polygon = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [1, 1],
          [0, 1],
          [0, 0],
        ],
      ],
    };
    const { coords, error } = geoJsonPointToLonLat(polygon);
    expect(coords).toBeNull();
    expect(error).toContain("Polygon");
    expect(geoJsonPointToLonLat([1, 2]).error).not.toBeNull();
    expect(
      geoJsonPointToLonLat({ type: "Point", coordinates: ["a", "b"] }).error,
    ).not.toBeNull();
  });
});

// ─── renderer dispatch ──────────────────────────────────────────────────────

describe("geometry widget (renderer dispatch)", () => {
  const PARAM = {
    key: "location",
    label: "Location",
    type: "geometry",
    widget: "geometry",
  };

  it("kind 'geometry' mounts the map picker over a GeoJSON Point default", () => {
    const t = render({
      parameters: [
        {
          ...PARAM,
          default_value: { type: "Point", coordinates: [-9.1394, 38.7223] },
        },
      ],
    });
    // The picker mounts and no unsupported-geometry error shows.
    expect(t.textContent).toContain("Location");
    expect(t.textContent).not.toContain("Unsupported geometry");
  });

  it("a non-Point value fails loud on the field", () => {
    const t = render({
      parameters: [
        {
          ...PARAM,
          default_value: { type: "Polygon", coordinates: [] },
        },
      ],
    });
    expect(t.textContent).toContain("Unsupported geometry");
  });
});
