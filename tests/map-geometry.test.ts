// atelier#2838 — the pure composition behind MapPicker's shape modes: drawn
// parts (lon/lat coordinates per drawn feature) compose into EXACTLY the
// mode's GeoJSON type, and an existing geometry decomposes back into parts
// only when its type matches the mode (otherwise a named, loud error).

import { describe, expect, it } from "vitest";
import {
  MAP_PICKER_MODES,
  composeGeometry,
  decomposeGeometry,
  modeForGeometryType,
} from "../components/map-geometry";

const CW_SQUARE = [
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0],
    [0, 0],
  ],
];

function signedArea(ring: number[][]): number {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return sum / 2;
}

describe("modeForGeometryType", () => {
  it("maps every drawable GeoJSON type to a picker mode", () => {
    expect(modeForGeometryType("Point")).toBe("point");
    expect(modeForGeometryType("MultiPoint")).toBe("multipoint");
    expect(modeForGeometryType("LineString")).toBe("linestring");
    expect(modeForGeometryType("MultiLineString")).toBe("multilinestring");
    expect(modeForGeometryType("Polygon")).toBe("polygon");
    expect(modeForGeometryType("MultiPolygon")).toBe("multipolygon");
  });

  it("returns null for anything it cannot draw (case is GeoJSON's)", () => {
    for (const t of ["GeometryCollection", "polygon", "Circle", "", null, undefined, 3]) {
      expect(modeForGeometryType(t)).toBeNull();
    }
  });

  it("every mode declares the GeoJSON type it emits", () => {
    for (const [mode, spec] of Object.entries(MAP_PICKER_MODES)) {
      expect(modeForGeometryType(spec.geometryType)).toBe(mode);
    }
  });
});

describe("composeGeometry", () => {
  it("no parts → null (a clear, never an empty geometry)", () => {
    for (const mode of Object.keys(MAP_PICKER_MODES)) {
      expect(composeGeometry(mode, [])).toBeNull();
    }
  });

  it("polygon emits a Polygon from the last drawn part, exterior ring CCW (RFC 7946)", () => {
    const g = composeGeometry("polygon", [CW_SQUARE]);
    expect(g?.type).toBe("Polygon");
    expect(g?.coordinates).toHaveLength(1);
    expect(signedArea(g!.coordinates[0] as number[][])).toBeGreaterThan(0);
  });

  it("multipolygon emits a MultiPolygon with one member per drawn polygon", () => {
    const g = composeGeometry("multipolygon", [CW_SQUARE, CW_SQUARE, CW_SQUARE]);
    expect(g?.type).toBe("MultiPolygon");
    expect(g?.coordinates).toHaveLength(3);
    for (const poly of g!.coordinates as number[][][][]) {
      expect(signedArea(poly[0])).toBeGreaterThan(0);
    }
  });

  it("holes are wound clockwise", () => {
    const outer = [
      [0, 0],
      [4, 0],
      [4, 4],
      [0, 4],
      [0, 0],
    ];
    const ccwHole = [
      [1, 1],
      [2, 1],
      [2, 2],
      [1, 2],
      [1, 1],
    ];
    const g = composeGeometry("polygon", [[outer, ccwHole]]);
    const [ext, hole] = g!.coordinates as number[][][];
    expect(signedArea(ext)).toBeGreaterThan(0);
    expect(signedArea(hole)).toBeLessThan(0);
  });

  it("point / multipoint / linestring / multilinestring emit their own type", () => {
    expect(composeGeometry("point", [[1, 2]])).toEqual({ type: "Point", coordinates: [1, 2] });
    expect(composeGeometry("multipoint", [[1, 2], [3, 4]])).toEqual({
      type: "MultiPoint",
      coordinates: [
        [1, 2],
        [3, 4],
      ],
    });
    const line = [
      [0, 0],
      [1, 1],
    ];
    expect(composeGeometry("linestring", [line])).toEqual({ type: "LineString", coordinates: line });
    expect(composeGeometry("multilinestring", [line, line])).toEqual({
      type: "MultiLineString",
      coordinates: [line, line],
    });
  });

  it("does not alias the caller's arrays", () => {
    const part = [[1, 2]];
    const g = composeGeometry("multipoint", part);
    (g!.coordinates as number[][])[0][0] = 99;
    expect(part[0][0]).toBe(1);
  });

  it("an unknown mode throws (programming error, not data)", () => {
    expect(() => composeGeometry("circle", [[1, 2]])).toThrow(/Unknown MapPicker mode/);
  });
});

describe("decomposeGeometry", () => {
  it("empty → no parts, no error", () => {
    for (const empty of [null, undefined, ""]) {
      expect(decomposeGeometry("multipolygon", empty)).toEqual({ parts: [], error: null });
    }
  });

  it("round-trips a value of the mode's type", () => {
    const mp = { type: "MultiPolygon", coordinates: [CW_SQUARE, CW_SQUARE] };
    const { parts, error } = decomposeGeometry("multipolygon", mp);
    expect(error).toBeNull();
    expect(parts).toHaveLength(2);
    expect(decomposeGeometry("polygon", { type: "Polygon", coordinates: CW_SQUARE }).parts).toEqual([
      CW_SQUARE,
    ]);
    expect(decomposeGeometry("multipoint", { type: "MultiPoint", coordinates: [[1, 2]] }).parts).toEqual([
      [1, 2],
    ]);
  });

  it("a value of another type fails loud with both type names", () => {
    const { parts, error } = decomposeGeometry("multipolygon", { type: "Polygon", coordinates: CW_SQUARE });
    expect(parts).toEqual([]);
    expect(error).toBe("Unsupported geometry: expected a GeoJSON MultiPolygon, got Polygon");
  });

  it("malformed coordinates fail loud", () => {
    const bad = [
      { type: "Polygon", coordinates: [[[0, 0], [1, 1], [0, 0]]] }, // ring < 4 positions
      { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1]]] }, // not closed
      { type: "Polygon", coordinates: [[["a", 0], [1, 0], [1, 1], ["a", 0]]] },
    ];
    for (const value of bad) {
      expect(decomposeGeometry("polygon", value).error).toBe(
        "Unsupported geometry: malformed Polygon coordinates",
      );
    }
    expect(decomposeGeometry("linestring", { type: "LineString", coordinates: [[0, 0]] }).error).toBe(
      "Unsupported geometry: malformed LineString coordinates",
    );
    expect(decomposeGeometry("multipolygon", [1, 2]).error).toBe(
      "Unsupported geometry: expected a GeoJSON MultiPolygon",
    );
  });
});
