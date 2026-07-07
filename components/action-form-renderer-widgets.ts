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
