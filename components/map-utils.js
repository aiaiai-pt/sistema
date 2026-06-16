/**
 * Shared utilities for map components.
 * Not exported from index.js — internal to map components only.
 */

/**
 * @typedef {{ type: 'osm' }} OsmSource
 * @typedef {{ type: 'xyz', url: string, attributions?: string, maxZoom?: number }} XyzSource
 * @typedef {{ type: 'stadia', layer: string, retina?: boolean, apiKey?: string }} StadiaSource
 * @typedef {OsmSource | XyzSource | StadiaSource} TileSourceConfig
 */

/**
 * Creates an OL tile layer from a config object.
 *
 * @param {TileSourceConfig} config
 * @returns {Promise<import('ol/layer/Tile.js').default>}
 */
export async function createTileLayer(config) {
  const { default: TileLayer } = await import("ol/layer/Tile.js");

  if (config.type === "stadia") {
    const { default: StadiaMaps } = await import("ol/source/StadiaMaps.js");
    return new TileLayer({
      source: new StadiaMaps({
        layer: config.layer,
        retina: config.retina ?? true,
        apiKey: config.apiKey,
      }),
    });
  }

  if (config.type === "xyz") {
    const { default: XYZ } = await import("ol/source/XYZ.js");
    return new TileLayer({
      source: new XYZ({
        url: config.url,
        attributions: config.attributions,
        maxZoom: config.maxZoom,
        crossOrigin: "anonymous",
      }),
    });
  }

  const { default: OSM } = await import("ol/source/OSM.js");
  return new TileLayer({ source: new OSM() });
}

// ─── Theme-Reactive Style Factory ────────────────────────────────

/**
 * @typedef {object} MapStyles
 * @property {import('ol/style/Style.js').default} marker
 * @property {import('ol/style/Style.js').default} polygon
 * @property {(size: number) => import('ol/style/Style.js').default} cluster
 * @property {() => void} refresh — re-read CSS tokens, mutate styles in place
 */

/**
 * Creates OL styles from DS tokens. Returns mutable style objects
 * with a refresh() method that re-reads CSS vars and updates the
 * styles in place — call after theme change, then source.changed().
 *
 * @param {Element} el
 * @returns {Promise<MapStyles>}
 */
export async function createMapStyles(el) {
  const [
    { default: Style },
    { default: CircleStyle },
    { default: Fill },
    { default: Stroke },
    { default: Text },
  ] = await Promise.all([
    import("ol/style/Style.js"),
    import("ol/style/Circle.js"),
    import("ol/style/Fill.js"),
    import("ol/style/Stroke.js"),
    import("ol/style/Text.js"),
  ]);

  // Mutable fill/stroke refs — mutated in-place on refresh()
  const markerFillObj = new Fill({ color: "" });
  const markerStrokeObj = new Stroke({ color: "", width: 0 });
  const polyFillObj = new Fill({ color: "" });
  const polyStrokeObj = new Stroke({ color: "", width: 0 });

  let markerRadiusVal = 8;
  let clusterBaseRadiusVal = 16;
  let clusterFillColor = "";
  let clusterTextColor = "";
  let clusterFontStr = "";

  const marker = new Style({
    image: new CircleStyle({
      radius: 8,
      fill: markerFillObj,
      stroke: markerStrokeObj,
    }),
  });

  const polygon = new Style({
    fill: polyFillObj,
    stroke: polyStrokeObj,
  });

  /** @type {Map<string, import('ol/style/Style.js').default>} */
  const clusterCache = new Map();

  function readTokens() {
    markerFillObj.setColor(cssVar(el, "--map-marker-fill", "#ff6b35"));
    markerStrokeObj.setColor(cssVar(el, "--map-marker-stroke", "#fff"));
    markerStrokeObj.setWidth(cssPx(el, "--map-marker-stroke-width", 2));
    markerRadiusVal = cssPx(el, "--map-marker-radius", 8);
    polyFillObj.setColor(
      cssVar(el, "--map-polygon-fill", "rgba(255,107,53,0.2)"),
    );
    polyStrokeObj.setColor(cssVar(el, "--map-polygon-stroke", "#ff6b35"));
    polyStrokeObj.setWidth(cssPx(el, "--map-polygon-stroke-width", 2));
    clusterBaseRadiusVal = cssPx(el, "--map-cluster-radius", 16);
    clusterFillColor = cssVar(el, "--map-cluster-fill", "#ff6b35");
    clusterTextColor = cssVar(el, "--map-cluster-text-fill", "#fff");
    const font = cssVar(el, "--map-cluster-font", "monospace");
    const fontSize = cssVar(el, "--map-cluster-font-size", "12px");
    clusterFontStr = `600 ${fontSize} ${font}`;

    // Rebuild marker image with new radius (CircleStyle radius is immutable)
    marker.setImage(
      new CircleStyle({
        radius: markerRadiusVal,
        fill: markerFillObj,
        stroke: markerStrokeObj,
      }),
    );
  }

  // Initial read
  readTokens();

  /** @param {number} size */
  function cluster(size) {
    const key = `c-${size}`;
    let cached = clusterCache.get(key);
    if (cached) return cached;

    if (size === 1) {
      clusterCache.set(key, marker);
      return marker;
    }

    const style = new Style({
      image: new CircleStyle({
        radius: clusterBaseRadiusVal + Math.min(size, 20),
        fill: new Fill({ color: clusterFillColor }),
      }),
      text: new Text({
        text: String(size),
        fill: new Fill({ color: clusterTextColor }),
        font: clusterFontStr,
      }),
    });

    clusterCache.set(key, style);
    return style;
  }

  function refresh() {
    readTokens();
    clusterCache.clear(); // cluster styles must be rebuilt with new colors
  }

  return { marker, polygon, cluster, refresh };
}

// ─── Theme Watcher ───────────────────────────────────────────────

/**
 * Watches for theme changes (data-theme attribute, class changes on <html>,
 * OS prefers-color-scheme). Calls onchange when a theme switch is detected.
 * Returns a dispose function.
 *
 * @param {() => void} onchange
 * @returns {() => void} dispose
 */
export function watchTheme(onchange) {
  const mo = new MutationObserver(() => onchange());
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "class"],
  });

  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => onchange();
  mql.addEventListener("change", handler);

  return () => {
    mo.disconnect();
    mql.removeEventListener("change", handler);
  };
}

// ─── Error Rendering ─────────────────────────────────────────────

/**
 * Renders a visible error state inside a map container.
 *
 * @param {HTMLElement} el
 * @param {string} component
 * @param {Error} error
 */
export function renderMapError(el, component, error) {
  const msg = error.message || String(error);
  const isModuleError =
    msg.includes("Failed to fetch") ||
    msg.includes("Module not found") ||
    msg.includes("Cannot find module");

  el.innerHTML = "";
  const errorEl = document.createElement("div");
  errorEl.setAttribute("role", "alert");
  errorEl.style.cssText = `
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; min-height: 120px; padding: 24px; text-align: center;
    font-family: var(--type-body-sm-font, sans-serif); font-size: var(--type-body-sm-size, 13px);
    color: var(--color-text-muted, #888); background: var(--color-surface-secondary, #f5f5f5);
    border-radius: inherit;
  `;

  const title = document.createElement("strong");
  title.style.cssText = `
    display: block; margin-bottom: 4px;
    font-family: var(--type-label-font, monospace); font-size: var(--type-label-size, 11px);
    letter-spacing: 0.05em; color: var(--color-destructive, #c00);
  `;
  title.textContent = `${component} FAILED`;

  const detail = document.createElement("span");
  detail.textContent = isModuleError
    ? "OpenLayers (ol) is not installed. Add it to your dependencies."
    : msg;

  errorEl.appendChild(title);
  errorEl.appendChild(detail);
  el.appendChild(errorEl);

  console.error(`[${component}]`, error);
}

// ─── CSS Helpers ─────────────────────────────────────────────────

/**
 * @param {Element} el
 * @param {string} prop
 * @param {string} fallback
 * @returns {string}
 */
export function cssVar(el, prop, fallback) {
  const val = getComputedStyle(el).getPropertyValue(prop).trim();
  return val || fallback;
}

/**
 * Resolves a CSS custom property to a pixel number via probe element.
 *
 * @param {Element} el
 * @param {string} prop
 * @param {number} fallback
 * @returns {number}
 */
export function cssPx(el, prop, fallback) {
  const raw = getComputedStyle(el).getPropertyValue(prop).trim();
  if (!raw) return fallback;

  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;width:${raw}`;
  el.appendChild(probe);
  const px = probe.offsetWidth;
  el.removeChild(probe);
  return px || fallback;
}

/**
 * Resolves any CSS color expression (hex, rgb, color-mix, var refs)
 * to a concrete rgb()/rgba() string via a probe element.
 * Required because getComputedStyle doesn't resolve color-mix() on
 * custom properties — only on applied styles like backgroundColor.
 *
 * @param {Element} el
 * @param {string} value — raw CSS color expression
 * @returns {string} — resolved rgb()/rgba() string
 */
function resolveColor(el, value) {
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;background-color:${value}`;
  el.appendChild(probe);
  const resolved = getComputedStyle(probe).backgroundColor;
  el.removeChild(probe);
  return resolved || value;
}

/**
 * Extracts RGB components from a resolved color string.
 * Handles rgb(r, g, b) and rgba(r, g, b, a) formats.
 *
 * @param {string} color
 * @returns {{ r: number, g: number, b: number }}
 */
function parseRgb(color) {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) return { r: +match[1], g: +match[2], b: +match[3] };
  return { r: 254, g: 228, b: 142 };
}

/**
 * Reads heatmap gradient stops from CSS custom properties.
 * Resolves color-mix() and other CSS color expressions to concrete
 * rgb values that OL's canvas gradient can consume.
 *
 * @param {Element} el
 * @returns {string[]}
 */
export function getHeatmapGradient(el) {
  const styles = getComputedStyle(el);
  const rawStops = [
    styles.getPropertyValue("--map-heatmap-stop-1").trim(),
    styles.getPropertyValue("--map-heatmap-stop-2").trim(),
    styles.getPropertyValue("--map-heatmap-stop-3").trim(),
    styles.getPropertyValue("--map-heatmap-stop-4").trim(),
  ].filter(Boolean);

  if (rawStops.length >= 2) {
    const stops = rawStops.map((s) => resolveColor(el, s));
    const { r, g, b } = parseRgb(stops[0]);
    return [`rgba(${r}, ${g}, ${b}, 0)`, ...stops];
  }

  return ["rgba(251, 227, 142, 0)", "#fbe38e", "#fb923c", "#e85a28", "#ae2a1e"];
}

// ─── Overlay Layers (#187 D-c) ───────────────────────────────────

/**
 * @typedef {object} OverlayLayerStyle
 * Flat style subset applied to a whole overlay layer. Colors are CSS color
 * strings (they come from layer DATA — geolayers GeoStyler styles — not
 * from design tokens; absent values fall back to the DS-tokened defaults).
 * @property {string} [pointColor]
 * @property {number} [pointRadius]
 * @property {string} [strokeColor]
 * @property {number} [strokeWidth]
 * @property {string} [fillColor]
 *
 * @typedef {object} OverlayLayerDef
 * One ordered overlay rendered between the tile layer and the component's
 * own interactive vector layer. v1 is GeoJSON-only — the platform's citizen
 * data plane serves GeoJSON (`/{app}/public/layers/{id}/features`); WMS/tile
 * overlays arrive with the per-tenant raster principal (spec open question).
 * @property {string} [id]
 * @property {'geojson'} [type]
 * @property {object} [data] — inline GeoJSON (Feature/FeatureCollection)
 * @property {string} [url] — fetched when `data` is absent
 * @property {OverlayLayerStyle | object} [style] — flat style or GeoStyler
 *   JSON (best-effort subset via `geoStylerToFlat`)
 * @property {boolean} [visible]
 */

/**
 * Best-effort GeoStyler → flat style. Reads the first symbolizer of the
 * first rule — enough for the platform's single-rule layer styles. Unknown
 * shapes return {} so the DS-tokened defaults apply.
 *
 * @param {any} style
 * @returns {OverlayLayerStyle}
 */
export function geoStylerToFlat(style) {
  if (!style || typeof style !== "object") return {};
  if (!Array.isArray(style.rules))
    return /** @type {OverlayLayerStyle} */ (style);
  const sym = style.rules?.[0]?.symbolizers?.[0];
  if (!sym || typeof sym !== "object") return {};
  /** @type {OverlayLayerStyle} */
  const flat = {};
  if (sym.kind === "Mark" || sym.kind === "Icon") {
    if (typeof sym.color === "string") flat.pointColor = sym.color;
    if (typeof sym.radius === "number") flat.pointRadius = sym.radius;
    if (typeof sym.strokeColor === "string") flat.strokeColor = sym.strokeColor;
    if (typeof sym.strokeWidth === "number") flat.strokeWidth = sym.strokeWidth;
  } else if (sym.kind === "Line") {
    if (typeof sym.color === "string") flat.strokeColor = sym.color;
    if (typeof sym.width === "number") flat.strokeWidth = sym.width;
  } else if (sym.kind === "Fill") {
    if (typeof sym.color === "string") flat.fillColor = sym.color;
    if (typeof sym.outlineColor === "string")
      flat.strokeColor = sym.outlineColor;
    if (typeof sym.outlineWidth === "number")
      flat.strokeWidth = sym.outlineWidth;
  }
  return flat;
}

/**
 * Builds OL vector layers for `layers` overlay defs, ordered as given.
 * URL-sourced layers load asynchronously into their source; a fetch failure
 * leaves that overlay empty and logs a warning (the map still renders).
 *
 * @param {OverlayLayerDef[]} defs
 * @param {import('./map-utils.js').MapStyles} styles — DS default styles
 * @returns {Promise<import('ol/layer/Vector.js').default[]>}
 */
export async function createOverlayLayers(defs, styles) {
  if (!Array.isArray(defs) || defs.length === 0) return [];

  const [
    { default: VectorLayer },
    { default: VectorSource },
    { default: GeoJSON },
    { default: Style },
    { default: CircleStyle },
    { default: Fill },
    { default: Stroke },
  ] = await Promise.all([
    import("ol/layer/Vector.js"),
    import("ol/source/Vector.js"),
    import("ol/format/GeoJSON.js"),
    import("ol/style/Style.js"),
    import("ol/style/Circle.js"),
    import("ol/style/Fill.js"),
    import("ol/style/Stroke.js"),
  ]);

  const format = new GeoJSON({ featureProjection: "EPSG:3857" });

  /** @param {OverlayLayerDef} def */
  function buildStyleFn(def) {
    const flat = geoStylerToFlat(def.style);
    const hasCustom = Object.keys(flat).length > 0;
    if (!hasCustom) {
      return (/** @type {any} */ feature) => {
        const type = feature.getGeometry()?.getType();
        return type === "Point" || type === "MultiPoint"
          ? styles.marker
          : styles.polygon;
      };
    }
    const stroke = new Stroke({
      color: flat.strokeColor ?? flat.pointColor ?? "#3366cc",
      width: flat.strokeWidth ?? 2,
    });
    const fill = new Fill({
      color: flat.fillColor ?? "rgba(51,102,204,0.15)",
    });
    const point = new Style({
      image: new CircleStyle({
        radius: flat.pointRadius ?? 6,
        fill: new Fill({
          color: flat.pointColor ?? flat.strokeColor ?? "#3366cc",
        }),
        stroke,
      }),
    });
    const shape = new Style({ fill, stroke });
    return (/** @type {any} */ feature) => {
      const type = feature.getGeometry()?.getType();
      return type === "Point" || type === "MultiPoint" ? point : shape;
    };
  }

  return defs
    .filter((def) => def && def.visible !== false)
    .map((def) => {
      const source = new VectorSource();
      if (def.data) {
        source.addFeatures(format.readFeatures(def.data));
      } else if (def.url) {
        fetch(def.url)
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
          .then((geojson) => source.addFeatures(format.readFeatures(geojson)))
          .catch((err) =>
            console.warn(
              `[map] overlay layer ${def.id ?? def.url} failed to load:`,
              err,
            ),
          );
      }
      return new VectorLayer({ source, style: buildStyleFn(def) });
    });
}

// ─── Hover tooltip label ─────────────────────────────────────────

/**
 * Decide the hover-tooltip text for a feature under the pointer.
 *
 * Markers passed via the `markers` prop go through an OL Cluster source, so
 * each rendered feature carries a `features` collection: one entry → that
 * marker's label; many → "N items". Features served from an overlay `layers`
 * def (a file/WFS source) are added to a plain VectorSource and have NO
 * `features` collection (`undefined`) — for those, fall back to the feature's
 * own descriptive props rather than rendering the misleading "0 items".
 *
 * @param {{ get: (key: string) => any }} feature — an OL Feature (or any
 *   object exposing `.get(key)`).
 * @returns {string | null} the label to show, or null to hide the tooltip.
 */
export function clusterTooltipLabel(feature) {
  const clustered = feature.get("features");
  if (clustered === undefined) {
    const label =
      feature.get("name") ??
      feature.get("title") ??
      feature.get("label") ??
      feature.get("markerData")?.label;
    return label != null && String(label) !== "" ? String(label) : null;
  }
  if (clustered.length === 1) {
    const data = clustered[0].get("markerData");
    return data?.label ?? null;
  }
  return `${clustered.length} items`;
}

// ─── Boundary (#187 D-e prep) ────────────────────────────────────

/**
 * Normalises a boundary prop into polygon rings (lon/lat WGS84).
 * Accepts: raw ring `number[][]`, GeoJSON Polygon / MultiPolygon,
 * Feature, or FeatureCollection (first polygonal feature per entry).
 *
 * @param {any} boundary
 * @returns {number[][][]} — array of outer rings (one per polygon)
 */
export function boundaryToRings(boundary) {
  if (!boundary) return [];
  if (Array.isArray(boundary)) {
    // Raw ring: [[lon,lat], ...]
    return boundary.length >= 3 ? [boundary] : [];
  }
  if (boundary.type === "FeatureCollection") {
    return (boundary.features ?? []).flatMap((/** @type {any} */ f) =>
      boundaryToRings(f),
    );
  }
  if (boundary.type === "Feature") return boundaryToRings(boundary.geometry);
  if (boundary.type === "Polygon") {
    const ring = boundary.coordinates?.[0];
    return ring && ring.length >= 3 ? [ring] : [];
  }
  if (boundary.type === "MultiPolygon") {
    return (boundary.coordinates ?? [])
      .map((/** @type {any} */ poly) => poly?.[0])
      .filter((/** @type {any} */ r) => r && r.length >= 3);
  }
  return [];
}

/**
 * Ray-casting point-in-polygon over WGS84 rings (outer rings only — holes
 * are out of scope for the boundary gate; the BFF hard-gate is authoritative).
 *
 * @param {[number, number]} lonLat
 * @param {number[][][]} rings — from `boundaryToRings`
 * @returns {boolean} true when the point is inside ANY ring
 */
export function pointInRings(lonLat, rings) {
  const [x, y] = lonLat;
  for (const ring of rings) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      const intersects =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersects) inside = !inside;
    }
    if (inside) return true;
  }
  return false;
}

/**
 * Builds the boundary overlay layer (dashed outline, faint fill — distinct
 * from the selection polygon so "the edge of the allowed area" reads as
 * context, not content). Token-driven: --map-boundary-*.
 *
 * @param {number[][][]} rings
 * @param {Element} el — token read context
 * @returns {Promise<import('ol/layer/Vector.js').default | null>}
 */
export async function createBoundaryLayer(rings, el) {
  if (!rings.length) return null;
  const [
    { default: VectorLayer },
    { default: VectorSource },
    { default: Feature },
    { default: Polygon },
    { default: Style },
    { default: Fill },
    { default: Stroke },
    { fromLonLat },
  ] = await Promise.all([
    import("ol/layer/Vector.js"),
    import("ol/source/Vector.js"),
    import("ol/Feature.js"),
    import("ol/geom/Polygon.js"),
    import("ol/style/Style.js"),
    import("ol/style/Fill.js"),
    import("ol/style/Stroke.js"),
    import("ol/proj.js"),
  ]);

  const dash = cssPx(el, "--map-boundary-dash", 8);
  const style = new Style({
    fill: new Fill({
      color: cssVar(el, "--map-boundary-fill", "rgba(255,107,53,0.06)"),
    }),
    stroke: new Stroke({
      color: cssVar(el, "--map-boundary-stroke", "#ff6b35"),
      width: cssPx(el, "--map-boundary-stroke-width", 2),
      lineDash: [dash, dash * 0.75],
    }),
  });

  const features = rings.map(
    (ring) =>
      new Feature({
        geometry: new Polygon([ring.map((c) => fromLonLat(c))]),
      }),
  );

  return new VectorLayer({
    source: new VectorSource({ features }),
    style,
  });
}
