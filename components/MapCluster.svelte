<!--
  @component MapCluster

  Map with clustered markers, hover tooltips, and click-to-select.
  OpenLayers with built-in Cluster source and OL Overlay for tooltips.
  Styles cached via shared style factory for render performance.
  Consumes --map-* tokens from components.css.

  @example
  <MapCluster
    markers={[{ id: '1', lon: -9.14, lat: 38.74, label: 'HQ' }]}
    onclick={(marker) => goto(`/equipment/${marker.id}`)}
  />
-->
<script>
  import { fromLonLat } from 'ol/proj.js';
  import { boundingExtent } from 'ol/extent.js';
  import { createTileLayer, createMapStyles, createOverlayLayers, watchTheme, renderMapError } from './map-utils.js';

  let {
    /** @type {{ id: string, lon: number, lat: number, label?: string, [key: string]: any }[]} */
    markers = [],
    /** @type {[number, number] | undefined} — initial center [lon, lat].
     *  Omit to auto-FIT the markers' extent (the right default for "show
     *  my data" maps; explicit center wins for dashboards pinned to a
     *  region). */
    center = undefined,
    /** @type {number} */
    zoom = 6,
    /** @type {number} — cluster distance in pixels */
    distance = 40,
    /** @type {import('./map-utils.js').TileSourceConfig} */
    tileSource = { type: 'osm' },
    /** @type {import('./map-utils.js').OverlayLayerDef[]} — ordered GeoJSON
     *  overlays rendered between the tiles and the cluster layer. Each
     *  entry: inline `data` or a `url` (e.g. the platform's
     *  `/{app}/public/layers/{id}/features`), optional flat or GeoStyler
     *  `style`. Unbounded — render as many as the consumer configures. */
    layers = [],
    /** @type {((marker: { id: string, lon: number, lat: number, label?: string }) => void) | undefined} */
    onclick = undefined,
    /** @type {string} */
    height = '100%',
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  /** @type {HTMLElement | undefined} */
  let container = $state();

  // Hoisted references for reactive effects
  /** @type {import('ol/Map.js').default | undefined} */
  let _map = $state();
  /** @type {any} — VectorSource */
  let _vectorSource = $state();
  /** @type {any} — Cluster source */
  let _clusterSource = $state();
  /** @type {any} — Feature constructor */
  let _Feature;
  /** @type {any} — Point constructor */
  let _Point;

  // Reactive: animate when the CALLER's center/zoom props change. Guarded
  // against the mount-time run — with no explicit `center` the view was
  // initialised to the markers' extent/mean, and animating to the prop
  // default ([0,0], null island) shoved every marker off-screen.
  let _lastCenterKey = $state("");
  $effect(() => {
    const key = center ? `${center[0]},${center[1]},${zoom}` : "";
    if (!_map || !center) return;
    if (key === _lastCenterKey) return;
    const first = _lastCenterKey === "";
    _lastCenterKey = key;
    if (first) return; // initial view already honours the props
    const view = _map.getView();
    if (!view) return;
    view.animate({ center: fromLonLat(center), zoom, duration: 300 });
  });

  // Reactive: update markers when props change
  $effect(() => {
    if (!_vectorSource || !_Feature || !_Point) return;
    const features = markers.map(m => {
      const f = new _Feature({ geometry: new _Point(fromLonLat([m.lon, m.lat])) });
      f.set('markerData', m);
      return f;
    });
    _vectorSource.clear();
    _vectorSource.addFeatures(features);
    _clusterSource?.refresh();
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
        { default: Cluster },
        { default: Feature },
        { default: Point },
        { default: Overlay },
      ] = await Promise.all([
        import('ol/Map.js'),
        import('ol/View.js'),
        import('ol/layer/Vector.js'),
        import('ol/source/Vector.js'),
        import('ol/source/Cluster.js'),
        import('ol/Feature.js'),
        import('ol/geom/Point.js'),
        import('ol/Overlay.js'),
      ]);

      if (disposed) return;

      const [tileLayer, styles] = await Promise.all([
        createTileLayer(tileSource),
        createMapStyles(container),
      ]);
      if (disposed) return;

      const overlayLayers = await createOverlayLayers(layers, styles);
      if (disposed) return;

      const features = markers.map(m => {
        const f = new Feature({ geometry: new Point(fromLonLat([m.lon, m.lat])) });
        f.set('markerData', m);
        return f;
      });

      const vectorSource = new VectorSource({ features });
      const clusterSource = new Cluster({ distance, source: vectorSource });

      // Store refs for reactive effects
      _vectorSource = vectorSource;
      _clusterSource = clusterSource;
      _Feature = Feature;
      _Point = Point;

      const clusterLayer = new VectorLayer({
        source: clusterSource,
        style: (feature) => {
          const size = feature.get('features')?.length ?? 1;
          return styles.cluster(size);
        },
      });

      // Tooltip overlay
      const tooltipEl = document.createElement('div');
      tooltipEl.style.cssText = `
        background: var(--map-popup-bg, #fff);
        border: var(--map-popup-border, 1px solid #ddd);
        border-radius: var(--map-popup-radius, 4px);
        padding: var(--map-popup-padding, 8px);
        box-shadow: var(--map-popup-shadow, 0 2px 8px rgba(0,0,0,0.15));
        font-family: var(--type-body-sm-font, sans-serif);
        font-size: var(--type-body-sm-size, 13px);
        color: var(--color-text, #2c2825);
        pointer-events: none;
        white-space: nowrap;
      `;
      tooltipEl.style.display = 'none';
      container.appendChild(tooltipEl);

      const tooltipOverlay = new Overlay({
        element: tooltipEl,
        positioning: 'bottom-center',
        offset: [0, -12],
        // The hover tooltip anchors AT the feature — OL's default
        // stopEvent:true puts it in the event-stopping overlay pane, so the
        // very click the tooltip invites lands on the overlay container and
        // dies (the element's own pointer-events:none can't help; the
        // CONTAINER captures). Informational overlay → never stop events.
        stopEvent: false,
      });

      const viewCenter = center
        ? fromLonLat(center)
        : markers.length > 0
          ? fromLonLat([
              markers.reduce((s, m) => s + m.lon, 0) / markers.length,
              markers.reduce((s, m) => s + m.lat, 0) / markers.length,
            ])
          : fromLonLat([0, 0]);

      map = new OlMap({
        target: container,
        layers: [tileLayer, ...overlayLayers, clusterLayer],
        overlays: [tooltipOverlay],
        view: new View({
          center: viewCenter,
          zoom,
        }),
      });
      _map = map;
      // No explicit center → fit the markers' extent so every cluster is on
      // screen regardless of how the data spreads (mean-centre alone leaves
      // distant clouds outside the default zoom).
      if (!center && markers.length > 1) {
        const coords = markers.map((m) => fromLonLat([m.lon, m.lat]));
        const ext = boundingExtent(coords);
        map.getView().fit(ext, { padding: [48, 48, 48, 48], maxZoom: 15 });
      }

      // Hover: show tooltip
      map.on('pointermove', (evt) => {
        const feature = map?.forEachFeatureAtPixel(evt.pixel, f => f);
        if (!feature) {
          tooltipEl.style.display = 'none';
          if (container) container.style.cursor = '';
          return;
        }

        const clustered = feature.get('features');
        if (container) container.style.cursor = 'pointer';

        if (clustered?.length === 1) {
          const data = clustered[0].get('markerData');
          if (data?.label) {
            tooltipEl.textContent = data.label;
            tooltipEl.style.display = 'block';
            tooltipOverlay.setPosition(feature.getGeometry()?.getCoordinates());
          }
        } else {
          tooltipEl.textContent = `${clustered?.length ?? 0} items`;
          tooltipEl.style.display = 'block';
          tooltipOverlay.setPosition(feature.getGeometry()?.getCoordinates());
        }
      });

      // Click handler
      if (onclick) {
        map.on('click', (evt) => {
          const feature = map?.forEachFeatureAtPixel(evt.pixel, f => f);
          if (!feature) return;

          const clustered = feature.get('features');
          if (clustered?.length === 1) {
            const data = clustered[0].get('markerData');
            if (data) onclick(data);
          } else if (clustered?.length > 1) {
            // A cluster of (near-)IDENTICAL coordinates can never split by
            // zooming (stacked reports at one point are common in civic
            // data) — open the first item instead of zoom-looping forever.
            const coords = clustered.map((f) => f.getGeometry()?.getCoordinates()).filter(Boolean);
            const lons = coords.map((c) => c[0]);
            const lats = coords.map((c) => c[1]);
            const spread = Math.max(...lons) - Math.min(...lons) + (Math.max(...lats) - Math.min(...lats));
            if (spread < 1) { // metres in web-mercator units — a stacked pile
              const data = clustered[0].get('markerData');
              if (data) onclick(data);
              return;
            }
            const view = map?.getView();
            const currentZoom = view?.getZoom() ?? zoom;
            view?.animate({
              center: feature.getGeometry()?.getCoordinates(),
              zoom: currentZoom + 2,
              duration: 300,
            });
          }
        });
      }

      disposeTheme = watchTheme(() => {
        styles.refresh();
        clusterSource.changed();
      });
    } catch (err) { renderMapError(container, 'MapCluster', /** @type {Error} */ (err)); } })();

    return () => {
      disposed = true;
      disposeTheme?.();
      map?.setTarget(undefined);
    };
  });
</script>

<div
  bind:this={container}
  class="map-cluster {className}"
  style:height
  role="application"
  aria-label="Map with clustered markers"
  {...rest}
></div>

<style>
  .map-cluster {
    width: 100%;
    border: var(--map-border);
    border-radius: var(--map-radius);
    overflow: hidden;
    position: relative;
  }

  .map-cluster :global(.ol-viewport) {
    border-radius: inherit;
  }
</style>
