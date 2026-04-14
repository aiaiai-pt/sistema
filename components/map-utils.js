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
 * Consumers pass a plain object, never OL imports.
 *
 * Supported tile sources:
 * - { type: 'osm' } — standard OpenStreetMap (default)
 * - { type: 'stadia', layer: 'stamen_toner_lite' } — Stadia Maps (free, no key for web)
 * - { type: 'xyz', url: 'https://.../{z}/{x}/{y}.png' } — any XYZ tile URL (Mapbox, CARTO, etc.)
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

  // Default: OSM
  const { default: OSM } = await import("ol/source/OSM.js");
  return new TileLayer({ source: new OSM() });
}

// ─── Style Factory ───────────────────────────────────────────────

/** @type {Map<string, import('ol/style/Style.js').default>} */
const _styleCache = new Map();

/**
 * Creates and caches OL Style objects from DS token values.
 * Styles are created once per unique key and reused across features/renders.
 *
 * @param {Element} el — element to read CSS custom properties from
 * @returns {Promise<{
 *   marker: import('ol/style/Style.js').default,
 *   polygon: import('ol/style/Style.js').default,
 *   cluster: (size: number) => import('ol/style/Style.js').default,
 * }>}
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

  const markerFill = cssVar(el, "--map-marker-fill", "#ff6b35");
  const markerStrokeColor = cssVar(el, "--map-marker-stroke", "#fff");
  const markerRadius = cssPx(el, "--map-marker-radius", 8);
  const markerStrokeWidth = cssPx(el, "--map-marker-stroke-width", 2);
  const polyFill = cssVar(el, "--map-polygon-fill", "rgba(255,107,53,0.2)");
  const polyStroke = cssVar(el, "--map-polygon-stroke", "#ff6b35");
  const polyStrokeWidth = cssPx(el, "--map-polygon-stroke-width", 2);
  const clusterFill = cssVar(el, "--map-cluster-fill", "#ff6b35");
  const clusterTextColor = cssVar(el, "--map-cluster-text-fill", "#fff");
  const clusterBaseRadius = cssPx(el, "--map-cluster-radius", 16);
  const clusterFont = cssVar(el, "--map-cluster-font", "monospace");
  const clusterFontSize = cssVar(el, "--map-cluster-font-size", "12px");

  const marker = new Style({
    image: new CircleStyle({
      radius: markerRadius,
      fill: new Fill({ color: markerFill }),
      stroke: new Stroke({
        color: markerStrokeColor,
        width: markerStrokeWidth,
      }),
    }),
  });

  const polygon = new Style({
    fill: new Fill({ color: polyFill }),
    stroke: new Stroke({ color: polyStroke, width: polyStrokeWidth }),
  });

  // Cluster styles cached by size to avoid GC pressure
  /** @param {number} size */
  function cluster(size) {
    const key = `cluster-${size}`;
    if (_styleCache.has(key))
      return /** @type {import('ol/style/Style.js').default} */ (
        _styleCache.get(key)
      );

    const style =
      size === 1
        ? marker
        : new Style({
            image: new CircleStyle({
              radius: clusterBaseRadius + Math.min(size, 20),
              fill: new Fill({ color: clusterFill }),
            }),
            text: new Text({
              text: String(size),
              fill: new Fill({ color: clusterTextColor }),
              font: `600 ${clusterFontSize} ${clusterFont}`,
            }),
          });

    _styleCache.set(key, style);
    return style;
  }

  return { marker, polygon, cluster };
}

// ─── Error Rendering ─────────────────────────────────────────────

/**
 * Renders a visible error state inside a map container.
 * Shows component name + short message so the person debugging at 2am
 * knows exactly which component failed and why.
 *
 * @param {HTMLElement} el
 * @param {string} component — e.g. 'MapDisplay', 'MapCluster'
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
 * Reads a computed CSS custom property from an element.
 *
 * @param {Element} el
 * @param {string} prop — e.g. '--map-marker-fill'
 * @param {string} fallback
 * @returns {string}
 */
export function cssVar(el, prop, fallback) {
  const val = getComputedStyle(el).getPropertyValue(prop).trim();
  return val || fallback;
}

/**
 * Reads a CSS custom property and resolves it to a pixel number.
 * Uses a probe element to convert any CSS unit (rem, em, px, calc())
 * to actual pixels. Required because OL canvas API needs numeric px.
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
 * Reads heatmap gradient stops from CSS custom properties.
 * Falls back to a warm sequential ramp (amber → red) if tokens
 * aren't resolvable.
 *
 * @param {Element} el
 * @returns {string[]}
 */
export function getHeatmapGradient(el) {
  const styles = getComputedStyle(el);
  const stops = [
    styles.getPropertyValue("--map-heatmap-stop-1").trim(),
    styles.getPropertyValue("--map-heatmap-stop-2").trim(),
    styles.getPropertyValue("--map-heatmap-stop-3").trim(),
    styles.getPropertyValue("--map-heatmap-stop-4").trim(),
  ].filter(Boolean);

  // First stop: same hue as stop-1 at zero alpha. NOT 'transparent'
  // (which is rgba(0,0,0,0) — transparent black — and causes dark
  // interpolation artifacts in canvas gradient rendering).
  if (stops.length >= 2) {
    const firstHex = stops[0];
    const r = parseInt(firstHex.slice(1, 3), 16) || 254;
    const g = parseInt(firstHex.slice(3, 5), 16) || 228;
    const b = parseInt(firstHex.slice(5, 7), 16) || 142;
    return [`rgba(${r}, ${g}, ${b}, 0)`, ...stops];
  }

  // Fallback: warm sequential ramp (amber → orange → red)
  return ["rgba(251, 227, 142, 0)", "#fbe38e", "#fb923c", "#e85a28", "#ae2a1e"];
}
