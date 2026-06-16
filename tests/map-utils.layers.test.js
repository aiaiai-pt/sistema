import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  geoStylerToFlat,
  boundaryToRings,
  pointInRings,
  clusterTooltipLabel,
} from "../components/map-utils.js";

// A tiny OL-Feature stand-in: only `.get(key)` is exercised by the helper.
const feat = (props) => ({ get: (k) => props[k] });

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
            {
              kind: "Mark",
              wellKnownName: "circle",
              color: "#ff0000",
              radius: 7,
            },
          ],
        },
      ],
    };
    assert.deepEqual(geoStylerToFlat(gs), {
      pointColor: "#ff0000",
      pointRadius: 7,
    });
  });

  test("maps Line and Fill symbolizers", () => {
    assert.deepEqual(
      geoStylerToFlat({
        rules: [{ symbolizers: [{ kind: "Line", color: "#0f0", width: 4 }] }],
      }),
      { strokeColor: "#0f0", strokeWidth: 4 },
    );
    assert.deepEqual(
      geoStylerToFlat({
        rules: [
          {
            symbolizers: [
              {
                kind: "Fill",
                color: "#00f",
                outlineColor: "#001",
                outlineWidth: 1,
              },
            ],
          },
        ],
      }),
      { fillColor: "#00f", strokeColor: "#001", strokeWidth: 1 },
    );
  });

  test("unknown shapes degrade to {} (DS defaults apply)", () => {
    assert.deepEqual(geoStylerToFlat(null), {});
    assert.deepEqual(geoStylerToFlat({ rules: [] }), {});
    assert.deepEqual(
      geoStylerToFlat({ rules: [{ symbolizers: [{ kind: "Raster" }] }] }),
      {},
    );
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
    assert.deepEqual(boundaryToRings({ type: "Feature", geometry: polygon }), [
      SQUARE,
    ]);
    assert.deepEqual(
      boundaryToRings({
        type: "FeatureCollection",
        features: [{ type: "Feature", geometry: polygon }],
      }),
      [SQUARE],
    );
    assert.deepEqual(
      boundaryToRings({
        type: "MultiPolygon",
        coordinates: [[SQUARE], [SQUARE]],
      }),
      [SQUARE, SQUARE],
    );
  });

  test("rejects degenerate input", () => {
    assert.deepEqual(boundaryToRings(undefined), []);
    assert.deepEqual(
      boundaryToRings([
        [0, 0],
        [1, 1],
      ]),
      [],
    );
    assert.deepEqual(
      boundaryToRings({ type: "Point", coordinates: [0, 0] }),
      [],
    );
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

// ---------------------------------------------------------------------------
// clusterTooltipLabel — hover label decision. Regression: features served
// from a file/WFS overlay layer are NOT wrapped in an OL Cluster (they live in
// a plain VectorSource), so `feature.get('features')` is undefined. The hover
// handler used to fall through to the cluster-count branch and render the
// misleading "0 items" instead of the feature's own name.
// ---------------------------------------------------------------------------

describe("clusterTooltipLabel", () => {
  test("non-clustered overlay feature shows its name (was '0 items')", () => {
    // An equipamentos file-layer feature: { properties: { name, equipment_type } }.
    const f = feat({
      name: "Piscina Municipal de Valongo",
      equipment_type: "pool",
    });
    assert.equal(clusterTooltipLabel(f), "Piscina Municipal de Valongo");
  });

  test("non-clustered feature falls back through title and label", () => {
    // A winners file-layer feature uses `title`, not `name`.
    assert.equal(
      clusterTooltipLabel(feat({ title: "Requalificação do Parque Urbano" })),
      "Requalificação do Parque Urbano",
    );
    assert.equal(clusterTooltipLabel(feat({ label: "Camada X" })), "Camada X");
    assert.equal(
      clusterTooltipLabel(feat({ markerData: { label: "Marker label" } })),
      "Marker label",
    );
  });

  test("non-clustered feature with no descriptive prop hides the tooltip", () => {
    // The bug fix: NEVER render "0 items" for a raw feature.
    assert.equal(clusterTooltipLabel(feat({ equipment_type: "pool" })), null);
    assert.equal(clusterTooltipLabel(feat({ name: "" })), null);
  });

  test("single-marker cluster shows the marker's label", () => {
    const f = feat({ features: [feat({ markerData: { label: "HQ" } })] });
    assert.equal(clusterTooltipLabel(f), "HQ");
  });

  test("single-marker cluster with no label hides the tooltip", () => {
    const f = feat({ features: [feat({ markerData: {} })] });
    assert.equal(clusterTooltipLabel(f), null);
  });

  test("multi-marker cluster shows the count", () => {
    const f = feat({ features: [feat({}), feat({}), feat({})] });
    assert.equal(clusterTooltipLabel(f), "3 items");
  });
});
