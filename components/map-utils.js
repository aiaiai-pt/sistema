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
 * Reads heatmap gradient stops from CSS custom properties.
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

  if (stops.length >= 2) {
    const firstHex = stops[0];
    const r = parseInt(firstHex.slice(1, 3), 16) || 254;
    const g = parseInt(firstHex.slice(3, 5), 16) || 228;
    const b = parseInt(firstHex.slice(5, 7), 16) || 142;
    return [`rgba(${r}, ${g}, ${b}, 0)`, ...stops];
  }

  return ["rgba(251, 227, 142, 0)", "#fbe38e", "#fb923c", "#e85a28", "#ae2a1e"];
}
