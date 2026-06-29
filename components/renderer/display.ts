/**
 * Host-agnostic display transforms (#499 criterion A) — the pure value→text +
 * status-badge + geo helpers the list/detail surfaces of BOTH hosts (the
 * citizen portal AND the staff admin) share. Previously duplicated: the portal
 * kept them in `portal/src/lib/renderer/{cells,columns}.ts`; the admin re-rolled
 * equivalents inline (`renderCell`/`formatValue`). Lifting them here makes the
 * value-redaction boundary one tested function instead of two drifting ones.
 *
 * Two host forks are parameters, not separate copies (the reconciliation #499
 * called out before sharing):
 *   - object fallback: the portal REDACTS an unknown object (never leak a blob
 *     into the public DOM — a hard rule); the admin JSON-dumps it for operators.
 *     → `formatScalar(value, { objectFallback: "redact" | "json" })`, default
 *     "redact" (the safe default; a caller opts INTO dumping).
 *   - date detection: the portal detects timestamps by VALUE shape (the public
 *     schema strips created_at/updated_at, so type-driven detection misses
 *     them); the admin knows the field is a datetime from its schema TYPE.
 *     → `displayCell(value, locale, { treatAsDate })` — `treatAsDate` forces
 *     date formatting (admin, from schema type); otherwise value-shape
 *     detection (`isIsoTimestamp`) applies (portal).
 *
 * Everything here is PURE and dependency-free.
 */

export type ObjectFallback = "redact" | "json";

/**
 * Pure value → display string. Scalars stringify; arrays join their non-empty
 * formatted members; a disclosed relationship object ({id,label}|{name}|{title})
 * renders its human label then its id. An UNKNOWN object renders per
 * `objectFallback`: "redact" (default) → "" (never dumps internals — the public
 * security boundary); "json" → pretty JSON (the admin operator view).
 */
export function formatScalar(
  value: unknown,
  opts: { objectFallback?: ObjectFallback } = {},
): string {
  // `== null` catches both null and undefined.
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map((v) => formatScalar(v, opts))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    for (const k of ["label", "name", "title"]) {
      const v = o[k];
      if (typeof v === "string" && v) return v;
    }
    const id = o.id;
    if (typeof id === "string" || typeof id === "number") return String(id);
    // No human handle and no id → fall back per host policy.
    if (opts.objectFallback === "json") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return "";
      }
    }
    return "";
  }
  return "";
}

const ISO_TIMESTAMP_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/;

/** True for an ISO-8601 timestamp STRING (not a bare date). Value-shape
 *  detection — used where the schema can't tell us the field is a datetime. */
export function isIsoTimestamp(value: unknown): value is string {
  return typeof value === "string" && ISO_TIMESTAMP_RE.test(value);
}

/** Locale date for an ISO timestamp (date-only, UTC-stable so SSR == hydrate);
 *  the raw string when unparseable. */
export function formatTimestamp(value: string, locale: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  try {
    return new Intl.DateTimeFormat(locale || "en", {
      dateStyle: "medium",
      timeZone: "UTC",
    }).format(parsed);
  } catch {
    return value;
  }
}

/**
 * The single display boundary for list cells / detail values. Formats a value
 * as a locale date when it's a timestamp — either because `opts.treatAsDate`
 * forces it (the admin, from the schema field type) or because the value itself
 * looks like an ISO timestamp (the portal, value-shape). Everything else goes
 * through `formatScalar` (with the host's object-fallback policy).
 */
export function displayCell(
  value: unknown,
  locale: string,
  opts: { treatAsDate?: boolean; objectFallback?: ObjectFallback } = {},
): string {
  if (opts.treatAsDate && typeof value === "string" && value) {
    return formatTimestamp(value, locale);
  }
  if (isIsoTimestamp(value)) return formatTimestamp(value, locale);
  return formatScalar(value, { objectFallback: opts.objectFallback });
}

/** Operator copy for a status value (falls back to the raw value). `labels` is
 *  untrusted DATA — a non-object/array is ignored. */
export function statusLabel(value: unknown, labels: unknown): string {
  const raw = formatScalar(value);
  if (labels && typeof labels === "object" && !Array.isArray(labels)) {
    const mapped = (labels as Record<string, unknown>)[raw];
    if (typeof mapped === "string" && mapped) return mapped;
  }
  return raw;
}

/** DS Badge variant for a status value (neutral when unmapped). `variants` is
 *  untrusted DATA — a non-object/array is ignored. */
export function statusVariant(value: unknown, variants: unknown): string {
  const raw = formatScalar(value);
  if (variants && typeof variants === "object" && !Array.isArray(variants)) {
    const mapped = (variants as Record<string, unknown>)[raw];
    if (typeof mapped === "string" && mapped) return mapped;
  }
  return "neutral";
}

/** Resolve a status value to a `{ label, variant }` pair in one call. */
export function resolveStatusBadge(
  value: unknown,
  opts: { labels?: unknown; variants?: unknown } = {},
): { label: string; variant: string } {
  return {
    label: statusLabel(value, opts.labels),
    variant: statusVariant(value, opts.variants),
  };
}

/**
 * Extract a `[lon, lat]` pair from a GeoJSON-ish Point value (the shape both a
 * detail row's location FK and a MapPicker value use), or null when it isn't a
 * usable point. Pure — the map widget decides how to render the result.
 */
export function geoPoint(value: unknown): [number, number] | null {
  if (!value || typeof value !== "object") return null;
  const coords = (value as { coordinates?: unknown }).coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const lon = coords[0];
  const lat = coords[1];
  if (typeof lon !== "number" || typeof lat !== "number") return null;
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  return [lon, lat];
}
