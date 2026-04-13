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
