// atelier#2838 — MapPicker's shape modes, as pure functions.
//
// A mode draws ONE kind of OpenLayers feature (Point, LineString or Polygon)
// and emits EXACTLY one GeoJSON geometry type: the single modes emit the
// last drawn feature, the multi modes emit one member per drawn feature.
// Drawn "parts" are the WGS84 [lon, lat] coordinates of each drawn feature,
// shaped like that draw type's GeoJSON `coordinates`. An existing geometry
// decomposes back into parts only when its type is the mode's type —
// anything else is a named, loud error, never a silent re-type.

export type MapPickerMode =
  | "point"
  | "multipoint"
  | "linestring"
  | "multilinestring"
  | "polygon"
  | "multipolygon";

export type DrawType = "Point" | "LineString" | "Polygon";

export type GeoJsonGeometryType =
  | "Point"
  | "MultiPoint"
  | "LineString"
  | "MultiLineString"
  | "Polygon"
  | "MultiPolygon";

export type GeoJsonGeometry = {
  type: GeoJsonGeometryType;
  coordinates: unknown[];
};

export type MapPickerModeSpec = {
  geometryType: GeoJsonGeometryType;
  drawType: DrawType;
  multi: boolean;
};

export const MAP_PICKER_MODES: Readonly<
  Record<MapPickerMode, MapPickerModeSpec>
> = Object.freeze({
  point: { geometryType: "Point", drawType: "Point", multi: false },
  multipoint: { geometryType: "MultiPoint", drawType: "Point", multi: true },
  linestring: {
    geometryType: "LineString",
    drawType: "LineString",
    multi: false,
  },
  multilinestring: {
    geometryType: "MultiLineString",
    drawType: "LineString",
    multi: true,
  },
  polygon: { geometryType: "Polygon", drawType: "Polygon", multi: false },
  multipolygon: {
    geometryType: "MultiPolygon",
    drawType: "Polygon",
    multi: true,
  },
});

/** Nesting depth of a draw type's coordinates down to a position
 *  (Point 0, LineString 1, Polygon 2). */
export const POSITION_DEPTH: Readonly<Record<DrawType, number>> = Object.freeze(
  {
    Point: 0,
    LineString: 1,
    Polygon: 2,
  },
);

/** The picker mode that draws a GeoJSON type, or null when it cannot be
 *  drawn (GeometryCollection, unknown names, wrong case — the contract is
 *  GeoJSON's own spelling). */
export function modeForGeometryType(type: unknown): MapPickerMode | null {
  if (typeof type !== "string") return null;
  for (const [mode, spec] of Object.entries(MAP_PICKER_MODES)) {
    if (spec.geometryType === type) return mode as MapPickerMode;
  }
  return null;
}

function specFor(mode: string): MapPickerModeSpec {
  const spec = (MAP_PICKER_MODES as Record<string, MapPickerModeSpec>)[mode];
  if (!spec) throw new Error(`Unknown MapPicker mode: ${mode}`);
  return spec;
}

/** Map `fn` over every position of a coordinates array of the given depth. */
export function mapPositions<T>(
  coords: unknown,
  depth: number,
  fn: (p: number[]) => T,
): unknown {
  if (depth === 0) return fn(coords as number[]);
  return (coords as unknown[]).map((c) => mapPositions(c, depth - 1, fn));
}

function clone(coords: unknown, depth: number): unknown {
  return mapPositions(coords, depth, (p) => [...p]);
}

/** Twice the signed area of a ring (shoelace); > 0 means counter-clockwise. */
function ringArea(ring: number[][]): number {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return sum;
}

/** RFC 7946 §3.1.6 winding: exterior ring counter-clockwise, holes clockwise. */
function rightHanded(rings: number[][][]): number[][][] {
  return rings.map((ring, i) => {
    const ccw = ringArea(ring) > 0;
    const wantCcw = i === 0;
    return ccw === wantCcw ? ring : [...ring].reverse();
  });
}

/** Compose drawn parts into EXACTLY the mode's GeoJSON type. No parts → null
 *  (a clear — never an empty geometry). */
export function composeGeometry(
  mode: string,
  parts: unknown[],
): GeoJsonGeometry | null {
  const spec = specFor(mode);
  if (!parts.length) return null;
  const depth = POSITION_DEPTH[spec.drawType];
  const shape = (part: unknown) => {
    const copy = clone(part, depth);
    return spec.drawType === "Polygon"
      ? rightHanded(copy as number[][][])
      : copy;
  };
  if (spec.multi) {
    return { type: spec.geometryType, coordinates: parts.map(shape) };
  }
  return {
    type: spec.geometryType,
    coordinates: shape(parts[parts.length - 1]) as unknown[],
  };
}

function isPosition(p: unknown): boolean {
  return (
    Array.isArray(p) &&
    p.length >= 2 &&
    p.every((n) => typeof n === "number" && Number.isFinite(n))
  );
}

function isLine(l: unknown): boolean {
  return Array.isArray(l) && l.length >= 2 && l.every(isPosition);
}

function isRing(r: unknown): boolean {
  if (!Array.isArray(r) || r.length < 4 || !r.every(isPosition)) return false;
  const first = r[0] as number[];
  const last = r[r.length - 1] as number[];
  return first[0] === last[0] && first[1] === last[1];
}

const PART_VALID: Record<DrawType, (part: unknown) => boolean> = {
  Point: isPosition,
  LineString: isLine,
  Polygon: (p) => Array.isArray(p) && p.length >= 1 && p.every(isRing),
};

/** Decompose an existing value into drawable parts for `mode`. Empty → no
 *  parts. A non-geometry, a geometry of another type, or malformed
 *  coordinates → no parts and a named error the field renders. */
export function decomposeGeometry(
  mode: string,
  value: unknown,
): { parts: unknown[]; error: string | null } {
  const spec = specFor(mode);
  if (value === null || value === undefined || value === "") {
    return { parts: [], error: null };
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      parts: [],
      error: `Unsupported geometry: expected a GeoJSON ${spec.geometryType}`,
    };
  }
  const row = value as Record<string, unknown>;
  if (row.type !== spec.geometryType) {
    return {
      parts: [],
      error: `Unsupported geometry: expected a GeoJSON ${spec.geometryType}, got ${String(row.type ?? "unknown")}`,
    };
  }
  const malformed = {
    parts: [],
    error: `Unsupported geometry: malformed ${spec.geometryType} coordinates`,
  };
  const valid = PART_VALID[spec.drawType];
  const coords = row.coordinates;
  const depth = POSITION_DEPTH[spec.drawType];
  if (spec.multi) {
    if (!Array.isArray(coords) || !coords.every(valid)) return malformed;
    return { parts: coords.map((c) => clone(c, depth)), error: null };
  }
  if (!valid(coords)) return malformed;
  return { parts: [clone(coords, depth)], error: null };
}
