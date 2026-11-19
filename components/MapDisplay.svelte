<!--
  @component MapDisplay

  Read-only map showing a point or polygon, or ANY GeoJSON geometry through
  `geometry` (Point, MultiPoint, LineString, MultiLineString, Polygon,
  MultiPolygon, or a recursive GeometryCollection — atelier#2838): every
  leaf is drawn and the view fits its extent; a lone point is centred at
  `zoom`. Validate a stored value with `geoGeometry` (renderer/display) —
  an invalid `geometry` draws nothing. OpenLayers with configurable tiles.
  Consumes --map-* tokens from components.css.

  @example Point
  <MapDisplay center={[-9.14, 38.74]} zoom={14} marker={[-9.14, 38.74]} />

  @example Any GeoJSON geometry (e.g. a stored location)
  <MapDisplay zoom={16} geometry={geoGeometry(row.location)} />

  @example Styled tiles
  <MapDisplay center={[-9.14, 38.74]} tileSource={{ type: 'stadia', layer: 'stamen_toner_lite' }} />
-->
<script>
  import { fromLonLat } from 'ol/proj.js';
  import {
    buildGeometryFeatures,
    createTileLayer,
    createMapStyles,
    createOverlayLayers,
    cssPx,
    watchTheme,
    renderMapError,
  } from './map-utils.js';

  let {
    /** @type {[number, number]} — [longitude, latitude] WGS84 */
    center = [0, 0],
    /** @type {number} */
    zoom = 12,
    /** @type {[number, number] | undefined} — [lon, lat] for single marker */
    marker = undefined,
    /** @type {number[][] | undefined} — polygon coords [[lon,lat], ...] */
    polygon = undefined,
    /** @type {unknown} — any GeoJSON geometry (incl. GeometryCollection),
     *  drawn in full; the view fits its extent (a lone point keeps `zoom`).
     *  Reactive: a value arriving after mount is drawn then. Invalid or
     *  null → nothing drawn. Coexists with `marker` / `polygon`. */
    geometry = undefined,
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

  // Hoisted references for the overlay owner effect
  /** @type {import('ol/Map.js').default | undefined} */
  let _map = $state();
  /** @type {any} — shared style factory (set at mount) */
  let _styles = $state();
  /** @type {any} — the marker/polygon/geometry vector source (set at mount) */
  let _vectorSource = $state.raw();

  // The `geometry` features have ONE owner: this effect — a detail page
  // typically loads its record after the map mounts. Replaces only its own
  // features (never the `marker` / `polygon` ones) and re-fits the view.
  /** @type {any[]} */
  let _geometryFeatures = [];
  let _geometrySeq = 0;
  $effect(() => {
    const g = geometry;
    const map = _map;
    const source = _vectorSource;
    if (!map || !source) return;
    const seq = ++_geometrySeq;
    void (async () => {
      const built = await buildGeometryFeatures(g);
      if (seq !== _geometrySeq || _map !== map) return;
      for (const f of _geometryFeatures) source.removeFeature(f);
      _geometryFeatures = built?.features ?? [];
      if (!built) return;
      source.addFeatures(_geometryFeatures);
      const view = map.getView();
      if (built.center) {
        view.setCenter(built.center);
      } else {
        const pad = container ? cssPx(container, '--space-lg', 24) : 24;
        view.fit(built.extent, { padding: [pad, pad, pad, pad], maxZoom: 18 });
      }
    })();
  });

  // The `layers` overlays have ONE owner: this effect (same contract as
  // MapPicker's boundary). Consumers typically RESOLVE overlay defs
  // asynchronously (layer codes → url defs, after a fetch), so a
  // mount-time-only build silently drops them — the overlays must track
  // `layers` for as long as the map lives. The sequence counter drops
  // stale async builds when the defs change mid-flight.
  /** @type {any[]} */
  let _overlayLayers = [];
  let _overlaySeq = 0;
  $effect(() => {
    const defs = layers;
    const map = _map;
    const styles = _styles;
    if (!map || !styles) return;
    const seq = ++_overlaySeq;
    void (async () => {
      const built = defs?.length ? await createOverlayLayers(defs, styles) : [];
      if (seq !== _overlaySeq || _map !== map) return;
      for (const l of _overlayLayers) map.removeLayer(l);
      _overlayLayers = built;
      // Between the tiles (index 0) and the marker/polygon vector layer —
      // overlays never cover the marker.
      built.forEach((l, i) => map.getLayers().insertAt(1 + i, l));
    })();
  });

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

      _styles = styles;

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

      const vectorSource = new VectorSource({ features });
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: (feature) => {
          const type = feature.getGeometry()?.getType();
          // Lines take the polygon style's stroke (fill is ignored).
          return type === 'Point' || type === 'MultiPoint' ? styles.marker : styles.polygon;
        },
      });

      map = new OlMap({
        target: container,
        // The `layers` overlays are NOT built here — the reactive owner
        // effect above inserts them between the tiles and the vector layer.
        layers: [tileLayer, vectorLayer],
        view: new View({
          center: fromLonLat(center),
          zoom,
        }),
        controls: [],
      });
      _vectorSource = vectorSource;
      _map = map;

      disposeTheme = watchTheme(() => {
        styles.refresh();
        vectorLayer.getSource()?.changed();
        // Token-styled overlays (no custom style) re-read via the shared
        // styles object; poke their sources so OL repaints.
        for (const l of _overlayLayers) l.getSource()?.changed();
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

  /* tileSource.tone 'muted': only the basemap's own canvas is filtered. */
  .map-display :global(.map-tiles-muted) {
    filter: var(--map-tiles-muted-filter);
  }
</style>
