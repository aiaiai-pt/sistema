/**
 * Shared utilities for map components.
 * Not exported from index.js — internal to map components only.
 */

/**
 * @typedef {{ type: 'osm' }} OsmSource
 * @typedef {{ type: 'xyz', url: string, attributions?: string }} XyzSource
 * @typedef {OsmSource | XyzSource} TileSourceConfig
 */

/**
 * Creates an OL tile layer from a config object.
 * Consumers pass a plain object, never OL imports.
 *
 * @param {TileSourceConfig} config
 * @returns {Promise<import('ol/layer/Tile.js').default>}
 */
export async function createTileLayer(config) {
  const { default: TileLayer } = await import("ol/layer/Tile.js");

  if (config.type === "xyz") {
    const { default: XYZ } = await import("ol/source/XYZ.js");
    return new TileLayer({
      source: new XYZ({
        url: config.url,
        attributions: config.attributions,
      }),
    });
  }

  // Default: OSM
  const { default: OSM } = await import("ol/source/OSM.js");
  return new TileLayer({ source: new OSM() });
}

/**
 * Renders a visible error state inside a map container.
 * Shows component name + short message so the person debugging at 2am
 * knows exactly which component failed and why.
 *
 * @param {HTMLElement} el — the map container element
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 120px;
    padding: 24px;
    text-align: center;
    font-family: var(--type-body-sm-font, sans-serif);
    font-size: var(--type-body-sm-size, 13px);
    color: var(--color-text-muted, #888);
    background: var(--color-surface-secondary, #f5f5f5);
    border-radius: inherit;
  `;

  const title = document.createElement("strong");
  title.style.cssText = `
    display: block;
    margin-bottom: 4px;
    font-family: var(--type-label-font, monospace);
    font-size: var(--type-label-size, 11px);
    letter-spacing: 0.05em;
    color: var(--color-destructive, #c00);
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

/**
 * Reads a computed CSS custom property from an element.
 * Returns the trimmed value or the fallback.
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
 * Handles rem, em, px, and bare numbers. Used for OL canvas API
 * which requires pixel values, not CSS units.
 *
 * @param {Element} el
 * @param {string} prop
 * @param {number} fallback
 * @returns {number}
 */
export function cssPx(el, prop, fallback) {
  const raw = getComputedStyle(el).getPropertyValue(prop).trim();
  if (!raw) return fallback;

  // Use a temporary element to resolve any CSS unit to pixels
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;width:${raw}`;
  el.appendChild(probe);
  const px = probe.offsetWidth;
  el.removeChild(probe);
  return px || fallback;
}

/**
 * Reads the heatmap gradient stops from CSS custom properties.
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

  return stops.length >= 2 ? ["transparent", ...stops] : undefined;
}
