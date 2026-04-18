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
  import { createTileLayer, createMapStyles, watchTheme, renderMapError } from './map-utils.js';

  let {
    /** @type {{ id: string, lon: number, lat: number, label?: string, [key: string]: any }[]} */
    markers = [],
    /** @type {[number, number]} — initial center [lon, lat] */
    center = [0, 0],
    /** @type {number} */
    zoom = 6,
    /** @type {number} — cluster distance in pixels */
    distance = 40,
    /** @type {import('./map-utils.js').TileSourceConfig} */
    tileSource = { type: 'osm' },
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

  // Reactive: animate to new center/zoom when props change
  $effect(() => {
    if (!_map) return;
    const view = _map.getView();
    if (!view) return;
    const targetCenter = fromLonLat(center);
    view.animate({ center: targetCenter, zoom, duration: 300 });
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
      });

      const viewCenter = markers.length > 0
        ? fromLonLat([
            markers.reduce((s, m) => s + m.lon, 0) / markers.length,
            markers.reduce((s, m) => s + m.lat, 0) / markers.length,
          ])
        : fromLonLat(center);

      map = new OlMap({
        target: container,
        layers: [tileLayer, clusterLayer],
        overlays: [tooltipOverlay],
        view: new View({
          center: viewCenter,
          zoom,
        }),
      });
      _map = map;

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
