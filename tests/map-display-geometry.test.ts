// atelier#2838 (read-only side) — what MapDisplay draws for a `geometry`
// prop: `buildGeometryFeatures` (map-utils) turns ANY GeoJSON geometry into
// one projected OpenLayers feature per leaf geometry (a GeometryCollection is
// flattened recursively), plus the extent the view fits to — or, for a lone
// point, the centre that keeps the consumer's zoom.

import { describe, expect, it } from "vitest";
import { fromLonLat } from "ol/proj.js";
import { buildGeometryFeatures } from "../components/map-utils.js";

const RING = [
  [-9.15, 38.72],
  [-9.14, 38.72],
  [-9.14, 38.73],
  [-9.15, 38.73],
  [-9.15, 38.72],
];

async function leafTypes(geometry: unknown) {
  const built = await buildGeometryFeatures(geometry);
  return built?.features.map((f: any) => f.getGeometry().getType());
}

describe("buildGeometryFeatures", () => {
  it("Point → one projected point; a lone point centres instead of fitting", async () => {
    const built = await buildGeometryFeatures({ type: "Point", coordinates: [-9.14, 38.74] });
    expect(built?.features).toHaveLength(1);
    const coords = built!.features[0].getGeometry().getCoordinates();
    const expected = fromLonLat([-9.14, 38.74]);
    expect(coords[0]).toBeCloseTo(expected[0], 3);
    expect(coords[1]).toBeCloseTo(expected[1], 3);
    expect(built?.center?.[0]).toBeCloseTo(expected[0], 3);
  });

  it("each simple type draws as itself, with an extent to fit", async () => {
    const cases: [unknown, string][] = [
      [{ type: "MultiPoint", coordinates: [[-9.1, 38.7], [-9.2, 38.8]] }, "MultiPoint"],
      [{ type: "LineString", coordinates: [[-9.1, 38.7], [-9.2, 38.8]] }, "LineString"],
      [{ type: "MultiLineString", coordinates: [[[-9.1, 38.7], [-9.2, 38.8]]] }, "MultiLineString"],
      [{ type: "Polygon", coordinates: [RING] }, "Polygon"],
      [{ type: "MultiPolygon", coordinates: [[RING], [RING]] }, "MultiPolygon"],
    ];
    for (const [geometry, type] of cases) {
      const built = await buildGeometryFeatures(geometry);
      expect(await leafTypes(geometry)).toEqual([type]);
      expect(built?.center).toBeNull();
      const [minX, minY, maxX, maxY] = built!.extent;
      expect(maxX - minX + (maxY - minY)).toBeGreaterThan(0);
    }
  });

  it("GeometryCollection[Point] (the DEV Equipment shape) draws its point at the consumer zoom", async () => {
    const built = await buildGeometryFeatures({
      type: "GeometryCollection",
      geometries: [{ type: "Point", coordinates: [-8.61, 41.15] }],
    });
    expect(built?.features.map((f: any) => f.getGeometry().getType())).toEqual(["Point"]);
    expect(built?.center).not.toBeNull();
  });

  it("a nested mixed GeometryCollection flattens to every leaf", async () => {
    expect(
      await leafTypes({
        type: "GeometryCollection",
        geometries: [
          { type: "Polygon", coordinates: [RING] },
          {
            type: "GeometryCollection",
            geometries: [
              { type: "LineString", coordinates: [[-9.1, 38.7], [-9.2, 38.8]] },
              { type: "Point", coordinates: [-9.1, 38.7] },
            ],
          },
        ],
      }),
    ).toEqual(["Polygon", "LineString", "Point"]);
  });

  it("an invalid geometry builds nothing (null)", async () => {
    expect(await buildGeometryFeatures({ type: "Polygon", coordinates: [[[0, 0]]] })).toBeNull();
    expect(await buildGeometryFeatures(null)).toBeNull();
    expect(await buildGeometryFeatures({ type: "GeometryCollection", geometries: [] })).toBeNull();
  });
});
