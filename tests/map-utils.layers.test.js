import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  geoStylerToFlat,
  boundaryToRings,
  pointInRings,
} from "../components/map-utils.js";

// ---------------------------------------------------------------------------
// geoStylerToFlat — best-effort GeoStyler → flat style (#187 D-c). Layer
// styles arrive from geolayers as GeoStyler JSON (first rule, first
// symbolizer is the platform's authored shape).
// ---------------------------------------------------------------------------

describe("geoStylerToFlat", () => {
  test("passes a flat style object through unchanged", () => {
    const flat = { strokeColor: "#123456", strokeWidth: 3 };
    assert.deepEqual(geoStylerToFlat(flat), flat);
  });

  test("maps a Mark symbolizer to point styling", () => {
    const gs = {
      name: "occ",
      rules: [
        {
          symbolizers: [
            { kind: "Mark", wellKnownName: "circle", color: "#ff0000", radius: 7 },
          ],
        },
      ],
    };
    assert.deepEqual(geoStylerToFlat(gs), { pointColor: "#ff0000", pointRadius: 7 });
  });

  test("maps Line and Fill symbolizers", () => {
    assert.deepEqual(
      geoStylerToFlat({ rules: [{ symbolizers: [{ kind: "Line", color: "#0f0", width: 4 }] }] }),
      { strokeColor: "#0f0", strokeWidth: 4 },
    );
    assert.deepEqual(
      geoStylerToFlat({
        rules: [{ symbolizers: [{ kind: "Fill", color: "#00f", outlineColor: "#001", outlineWidth: 1 }] }],
      }),
      { fillColor: "#00f", strokeColor: "#001", strokeWidth: 1 },
    );
  });

  test("unknown shapes degrade to {} (DS defaults apply)", () => {
    assert.deepEqual(geoStylerToFlat(null), {});
    assert.deepEqual(geoStylerToFlat({ rules: [] }), {});
    assert.deepEqual(geoStylerToFlat({ rules: [{ symbolizers: [{ kind: "Raster" }] }] }), {});
  });
});

// ---------------------------------------------------------------------------
// boundaryToRings / pointInRings — the MapPicker boundary gate (#187 D-e
// prep). The BFF intake hard-gate is authoritative; this is the UX signal.
// ---------------------------------------------------------------------------

const SQUARE = [
  [-9.2, 38.7],
  [-9.1, 38.7],
  [-9.1, 38.8],
  [-9.2, 38.8],
  [-9.2, 38.7],
];

describe("boundaryToRings", () => {
  test("accepts a raw ring", () => {
    assert.deepEqual(boundaryToRings(SQUARE), [SQUARE]);
  });

  test("accepts GeoJSON Polygon, Feature, FeatureCollection, MultiPolygon", () => {
    const polygon = { type: "Polygon", coordinates: [SQUARE] };
    assert.deepEqual(boundaryToRings(polygon), [SQUARE]);
    assert.deepEqual(boundaryToRings({ type: "Feature", geometry: polygon }), [SQUARE]);
    assert.deepEqual(
      boundaryToRings({ type: "FeatureCollection", features: [{ type: "Feature", geometry: polygon }] }),
      [SQUARE],
    );
    assert.deepEqual(
      boundaryToRings({ type: "MultiPolygon", coordinates: [[SQUARE], [SQUARE]] }),
      [SQUARE, SQUARE],
    );
  });

  test("rejects degenerate input", () => {
    assert.deepEqual(boundaryToRings(undefined), []);
    assert.deepEqual(boundaryToRings([[0, 0], [1, 1]]), []);
    assert.deepEqual(boundaryToRings({ type: "Point", coordinates: [0, 0] }), []);
  });
});

describe("pointInRings", () => {
  const rings = boundaryToRings({ type: "Polygon", coordinates: [SQUARE] });

  test("inside → true, outside → false", () => {
    assert.equal(pointInRings([-9.15, 38.75], rings), true);
    assert.equal(pointInRings([-9.05, 38.75], rings), false);
    assert.equal(pointInRings([-9.15, 38.65], rings), false);
  });

  test("multi-ring: inside ANY ring counts", () => {
    const second = SQUARE.map(([x, y]) => [x + 1, y]);
    const multi = boundaryToRings({
      type: "MultiPolygon",
      coordinates: [[SQUARE], [second]],
    });
    assert.equal(pointInRings([-8.15, 38.75], multi), true);
    assert.equal(pointInRings([-9.15, 38.75], multi), true);
    assert.equal(pointInRings([0, 0], multi), false);
  });

  test("no rings → false (no boundary, no signal)", () => {
    assert.equal(pointInRings([-9.15, 38.75], []), false);
  });
});
