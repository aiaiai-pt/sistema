// atelier#2838 (read-only side) — `geoGeometry(value)` validates ANY GeoJSON
// geometry (incl. a recursive GeometryCollection) for the read-only map, and
// returns it, or null so the host can show its own fallback. `geoPoint` keeps
// its point-only contract.

import { describe, expect, it } from "vitest";
import { geoGeometry, geoPoint } from "../components/renderer/display";

const RING = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
  [0, 0],
];

const VALID: Record<string, unknown> = {
  Point: { type: "Point", coordinates: [-9.14, 38.74] },
  MultiPoint: { type: "MultiPoint", coordinates: [[1, 2], [3, 4]] },
  LineString: { type: "LineString", coordinates: [[1, 2], [3, 4]] },
  MultiLineString: { type: "MultiLineString", coordinates: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]] },
  Polygon: { type: "Polygon", coordinates: [RING] },
  MultiPolygon: { type: "MultiPolygon", coordinates: [[RING], [RING]] },
  // The DEV Equipment shape: a collection wrapping one Point.
  "GeometryCollection[Point]": {
    type: "GeometryCollection",
    geometries: [{ type: "Point", coordinates: [-8.61, 41.15] }],
  },
  "GeometryCollection (mixed, nested)": {
    type: "GeometryCollection",
    geometries: [
      { type: "Polygon", coordinates: [RING] },
      { type: "GeometryCollection", geometries: [{ type: "LineString", coordinates: [[0, 0], [2, 2]] }] },
    ],
  },
};

describe("geoGeometry", () => {
  for (const [name, value] of Object.entries(VALID)) {
    it(`returns a valid ${name} as-is`, () => {
      expect(geoGeometry(value)).toBe(value);
    });
  }

  const INVALID: Record<string, unknown> = {
    null: null,
    undefined: undefined,
    string: "POINT(1 2)",
    "bare tuple": [1, 2],
    "no type": { coordinates: [1, 2] },
    "unknown type": { type: "Circle", coordinates: [1, 2] },
    Feature: { type: "Feature", geometry: { type: "Point", coordinates: [1, 2] } },
    "non-numeric Point": { type: "Point", coordinates: ["a", "b"] },
    "infinite Point": { type: "Point", coordinates: [Infinity, 2] },
    "one-position LineString": { type: "LineString", coordinates: [[1, 2]] },
    "unclosed Polygon": { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1]]] },
    "MultiPolygon with a bad member": { type: "MultiPolygon", coordinates: [[RING], [[[0, 0]]]] },
    "empty GeometryCollection": { type: "GeometryCollection", geometries: [] },
    "GeometryCollection with a bad member": {
      type: "GeometryCollection",
      geometries: [{ type: "Point", coordinates: [1, 2] }, { type: "Point", coordinates: [] }],
    },
  };
  for (const [name, value] of Object.entries(INVALID)) {
    it(`returns null for ${name} (the host shows its own fallback)`, () => {
      expect(geoGeometry(value)).toBeNull();
    });
  }

  it("geoPoint keeps its point-only contract", () => {
    expect(geoPoint(VALID.Point)).toEqual([-9.14, 38.74]);
    expect(geoPoint(VALID["GeometryCollection[Point]"])).toBeNull();
  });
});
