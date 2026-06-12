<!--
  @component MapDisplay

  Read-only map showing a point or polygon. OpenLayers with configurable tiles.
  Consumes --map-* tokens from components.css.

  @example Point
  <MapDisplay center={[-9.14, 38.74]} zoom={14} marker={[-9.14, 38.74]} />

  @example Styled tiles
  <MapDisplay center={[-9.14, 38.74]} tileSource={{ type: 'stadia', layer: 'stamen_toner_lite' }} />
-->
<script>
  import { fromLonLat } from 'ol/proj.js';
  import { createTileLayer, createMapStyles, createOverlayLayers, watchTheme, renderMapError } from './map-utils.js';

  let {
    /** @type {[number, number]} — [longitude, latitude] WGS84 */
    center = [0, 0],
    /** @type {number} */
    zoom = 12,
    /** @type {[number, number] | undefined} — [lon, lat] for single marker */
    marker = undefined,
    /** @type {number[][] | undefined} — polygon coords [[lon,lat], ...] */
    polygon = undefined,
    /** @type {import('./map-utils.js').TileSourceConfig} */
    tileSource = { type: 'osm' },
    /** @type {import('./map-utils.js').OverlayLayerDef[]} — ordered GeoJSON
     *  overlays rendered between the tiles and the marker/polygon layer.
     *  Each entry: inline `data` or a `url` (e.g. the platform's
     *  `/{app}/public/layers/{id}/features`), optional flat or GeoStyler
     *  `style`. See map-utils OverlayLayerDef. */
    layers = [],
    /** @type {string} */
    height = '100%',
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  /** @type {HTMLElement | undefined} */
  let container = $state();

  $effect(() => {
    if (!container) return;

    let disposed = false;
    /** @type {import('ol/Map.js').default | undefined} */
    let map;
    /** @type {(() => void) | undefined} */
    let disposeTheme;

    (async () => { try {
      const [
        { default: OlMap },
        { default: View },
        { default: VectorLayer },
        { default: VectorSource },
        { default: Feature },
        { default: Point },
        { default: Polygon },
      ] = await Promise.all([
        import('ol/Map.js'),
        import('ol/View.js'),
        import('ol/layer/Vector.js'),
        import('ol/source/Vector.js'),
        import('ol/Feature.js'),
        import('ol/geom/Point.js'),
        import('ol/geom/Polygon.js'),
      ]);

      if (disposed) return;

      const [tileLayer, styles] = await Promise.all([
        createTileLayer(tileSource),
        createMapStyles(container),
      ]);
      if (disposed) return;

      const overlayLayers = await createOverlayLayers(layers, styles);
      if (disposed) return;

      /** @type {Feature[]} */
      const features = [];

      if (marker) {
        features.push(new Feature({ geometry: new Point(fromLonLat(marker)) }));
      }

      if (polygon) {
        features.push(new Feature({
          geometry: new Polygon([polygon.map(c => fromLonLat(c))]),
        }));
      }

      const vectorLayer = new VectorLayer({
        source: new VectorSource({ features }),
        style: (feature) => {
          const type = feature.getGeometry()?.getType();
          return type === 'Point' ? styles.marker : styles.polygon;
        },
      });

      map = new OlMap({
        target: container,
        layers: [tileLayer, ...overlayLayers, vectorLayer],
        view: new View({
          center: fromLonLat(center),
          zoom,
        }),
        controls: [],
      });

      disposeTheme = watchTheme(() => {
        styles.refresh();
        vectorLayer.getSource()?.changed();
        // Token-styled overlays (no custom style) re-read via the shared
        // styles object; poke their sources so OL repaints.
        for (const l of overlayLayers) l.getSource()?.changed();
      });
    } catch (err) { renderMapError(container, 'MapDisplay', /** @type {Error} */ (err)); } })();

    return () => {
      disposed = true;
      disposeTheme?.();
      map?.setTarget(undefined);
    };
  });
</script>

<div
  bind:this={container}
  class="map-display {className}"
  style:height
  role="img"
  aria-label="Map"
  {...rest}
></div>

<style>
  .map-display {
    width: 100%;
    border: var(--map-border);
    border-radius: var(--map-radius);
    overflow: hidden;
  }

  .map-display :global(.ol-viewport) {
    border-radius: inherit;
  }
</style>
