<!--
  @component MapCluster

  Map with clustered markers, hover tooltips, and click-to-select.
  OpenLayers with built-in Cluster source and OL Overlay for tooltips.
  Consumes --map-* tokens from components.css.

  @example
  <MapCluster
    markers={[{ id: '1', lon: -9.14, lat: 38.74, label: 'HQ' }]}
    onclick={(marker) => goto(`/equipment/${marker.id}`)}
  />
-->
<script>
  import { fromLonLat } from 'ol/proj.js';
  import { createTileLayer, cssVar, cssPx, renderMapError } from './map-utils.js';

  let {
    /** @type {MarkerData[]} */
    markers = [],
    /** @type {[number, number]} — initial center [lon, lat] */
    center = [0, 0],
    /** @type {number} */
    zoom = 6,
    /** @type {number} — cluster distance in pixels */
    distance = 40,
    /** @type {import('./map-utils.js').TileSourceConfig} */
    tileSource = { type: 'osm' },
    /** @type {((marker: MarkerData) => void) | undefined} */
    onclick = undefined,
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
        { default: Style },
        { default: CircleStyle },
        { default: Fill },
        { default: Stroke },
        { default: Text },
      ] = await Promise.all([
        import('ol/Map.js'),
        import('ol/View.js'),
        import('ol/layer/Vector.js'),
        import('ol/source/Vector.js'),
        import('ol/source/Cluster.js'),
        import('ol/Feature.js'),
        import('ol/geom/Point.js'),
        import('ol/Overlay.js'),
        import('ol/style/Style.js'),
        import('ol/style/Circle.js'),
        import('ol/style/Fill.js'),
        import('ol/style/Stroke.js'),
        import('ol/style/Text.js'),
      ]);

      if (disposed) return;

      const tileLayer = await createTileLayer(tileSource);
      if (disposed) return;

      const clusterFill = cssVar(container, '--map-cluster-fill', '#ff6b35');
      const clusterTextColor = cssVar(container, '--map-cluster-text-fill', '#fff');
      const clusterBaseRadius = cssPx(container, '--map-cluster-radius', 16);
      const markerFill = cssVar(container, '--map-marker-fill', '#ff6b35');
      const markerStrokeColor = cssVar(container, '--map-marker-stroke', '#fff');
      const markerRadius = cssPx(container, '--map-marker-radius', 8);
      const markerStrokeWidth = cssPx(container, '--map-marker-stroke-width', 2);
      const clusterFont = cssVar(container, '--map-cluster-font', 'monospace');
      const clusterFontSize = cssVar(container, '--map-cluster-font-size', '12px');

      const features = markers.map(m => {
        const f = new Feature({ geometry: new Point(fromLonLat([m.lon, m.lat])) });
        f.set('markerData', m);
        return f;
      });

      const vectorSource = new VectorSource({ features });
      const clusterSource = new Cluster({ distance, source: vectorSource });

      const clusterLayer = new VectorLayer({
        source: clusterSource,
        style: (feature) => {
          const size = feature.get('features')?.length ?? 1;
          if (size > 1) {
            return new Style({
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
          }
          return new Style({
            image: new CircleStyle({
              radius: markerRadius,
              fill: new Fill({ color: markerFill }),
              stroke: new Stroke({ color: markerStrokeColor, width: markerStrokeWidth }),
            }),
          });
        },
      });

      // Tooltip overlay
      const tooltipEl = document.createElement('div');
      tooltipEl.className = 'map-cluster-tooltip';
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

      // Hover: show tooltip for single markers
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
    } catch (err) { renderMapError(container, 'MapCluster', /** @type {Error} */ (err)); } })();

    return () => {
      disposed = true;
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
