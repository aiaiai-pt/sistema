// #36/#37 (atelier#669 V1) — widget-first dispatch vocabulary + date-only
// serialization for ActionFormRenderer. Pure functions.
//
// The form-surface.v1 field summary carries render intent in `widget`
// (derived from the field type + legal refinements, both compilers);
// derived-action params carry the same under `ui_schema.widget`. The
// renderer dispatches on this kind and falls back to the param `type`, so
// legacy action-lane params (no widget key) render byte-identically.

type Entity = Record<string, unknown>;

/** The render intent for a param: `widget` → `ui_schema.widget` → `type`. */
export function widgetKind(parameter: Entity): string {
  const direct = parameter.widget;
  if (typeof direct === "string" && direct) return direct;
  const uiSchema = parameter.ui_schema;
  if (uiSchema && typeof uiSchema === "object" && !Array.isArray(uiSchema)) {
    const widget = (uiSchema as Entity).widget;
    if (typeof widget === "string" && widget) return widget;
  }
  return String(parameter.type ?? "string");
}

/** Widget kinds that can never sit half-width in a two-column section —
 *  they carry their own wide UI. Mirrors the CRUD form-surface compilers'
 *  FULL_WIDTH_WIDGETS clamp (form-surface.ts / derived_crud.py). */
export const FULL_WIDTH_WIDGET_KINDS = new Set([
  "geo",
  "file",
  "json",
  "textarea",
  "geometry",
]);

/** #37 — parse the platform's date-only wire shape (YYYY-MM-DD) onto a LOCAL
 *  calendar date. Never routes through Date.parse/toISOString: a local
 *  midnight serialized via UTC shifts a day across DST/negative-offset
 *  timezones — the classic off-by-one. */
export function dateOnlyToDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** #37 — serialize a picked Date back onto YYYY-MM-DD from its LOCAL
 *  calendar parts (no time component, no timezone shift). */
export function dateToDateOnly(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type GeoJsonPoint = { type: "Point"; coordinates: [number, number] };

/** #39 — hydrate the contract's GeoJSON value onto the MapPicker's
 *  [lon, lat] prop edge. Empty → no pin, no error. A non-Point (or
 *  malformed Point) fails LOUD: null coords + a named error the field
 *  renders — never a silently-empty map over real data. */
export function geoJsonPointToLonLat(value: unknown): {
  coords: [number, number] | null;
  error: string | null;
} {
  if (value === null || value === undefined || value === "") {
    return { coords: null, error: null };
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const row = value as Record<string, unknown>;
    if (row.type === "Point" && Array.isArray(row.coordinates)) {
      const [lon, lat] = row.coordinates as unknown[];
      if (typeof lon === "number" && typeof lat === "number") {
        return { coords: [lon, lat], error: null };
      }
      return {
        coords: null,
        error: "Unsupported geometry: malformed Point coordinates",
      };
    }
    return {
      coords: null,
      error: `Unsupported geometry: expected a GeoJSON Point, got ${String(row.type ?? "unknown")}`,
    };
  }
  return {
    coords: null,
    error: "Unsupported geometry: expected a GeoJSON Point",
  };
}

/** #39 — serialize a placed pin back onto the GeoJSON wire shape. */
export function lonLatToGeoJsonPoint(coords: [number, number]): GeoJsonPoint {
  return { type: "Point", coordinates: [coords[0], coords[1]] };
}

/** #46 — the map picker's INITIAL CENTRE, from its declared home:
 *  `ui_schema.map.initial_center` ([lon, lat]). A viewport hint is
 *  presentation, not a value — it lives in ui_schema so `default_value`
 *  keeps its one meaning (the initial VALUE). Malformed/absent → undefined
 *  (the picker keeps its own default). Consumers still passing a bare
 *  [lon, lat] `default_value` on a legacy geo param keep working via the
 *  renderer's fallback (deprecated; removed next minor). */
export function mapInitialCenter(parameter: {
  ui_schema?: unknown;
  [key: string]: unknown;
}): [number, number] | undefined {
  const ui =
    parameter.ui_schema && typeof parameter.ui_schema === "object"
      ? (parameter.ui_schema as Record<string, unknown>)
      : null;
  const map =
    ui?.map && typeof ui.map === "object"
      ? (ui.map as Record<string, unknown>)
      : null;
  const c = map?.initial_center;
  if (
    Array.isArray(c) &&
    c.length >= 2 &&
    typeof c[0] === "number" &&
    typeof c[1] === "number"
  ) {
    return [c[0], c[1]];
  }
  return undefined;
}

export type StoredFile = { name: string; url?: string };

/** #40 — normalize a file param's stored-current value (the edit form's
 *  prefill) onto {name, url?}. Accepts a bare name, a URL string (name =
 *  last path segment), or a {name?, url?} descriptor. Anything else → null
 *  (no stored file → the legacy append-mode upload field). */
export function storedFileDescriptor(value: unknown): StoredFile | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) {
      const segments = trimmed.split("?")[0].split("/").filter(Boolean);
      return { name: segments[segments.length - 1] || trimmed, url: trimmed };
    }
    return { name: trimmed };
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const row = value as Record<string, unknown>;
    const url = typeof row.url === "string" && row.url ? row.url : undefined;
    const name =
      typeof row.name === "string" && row.name
        ? row.name
        : url
          ? (url.split("?")[0].split("/").filter(Boolean).pop() ?? url)
          : null;
    if (!name) return null;
    return url ? { name, url } : { name };
  }
  return null;
}
