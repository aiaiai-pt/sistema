<!--
  @component MapCluster

  Map with clustered markers for list views. OpenLayers with OSM tiles,
  built-in Cluster source, and click-to-select callback.
  Consumes --map-* tokens from components.css.

  @example
  <MapCluster
    markers={[{ id: '1', lon: -9.14, lat: 38.74, label: 'HQ' }]}
    onclick={(marker) => goto(`/equipment/${marker.id}`)}
  />
-->
<script>
  import { fromLonLat, toLonLat } from 'ol/proj.js';

  /**
   * @typedef {{ id: string, lon: number, lat: number, label?: string, [key: string]: any }} MarkerData
   */

  let {
    /** @type {MarkerData[]} */
    markers = [],
    /** @type {[number, number]} — initial center [lon, lat] */
    center = [0, 0],
    /** @type {number} */
    zoom = 6,
    /** @type {number} — cluster distance in pixels */
    distance = 40,
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

    (async () => {
      const [
        { default: OlMap },
        { default: View },
        { default: TileLayer },
        { default: OSM },
        { default: VectorLayer },
        { default: VectorSource },
        { default: Cluster },
        { default: Feature },
        { default: Point },
        { default: Style },
        { default: CircleStyle },
        { default: Fill },
        { default: Stroke },
        { default: Text },
      ] = await Promise.all([
        import('ol/Map.js'),
        import('ol/View.js'),
        import('ol/layer/Tile.js'),
        import('ol/source/OSM.js'),
        import('ol/layer/Vector.js'),
        import('ol/source/Vector.js'),
        import('ol/source/Cluster.js'),
        import('ol/Feature.js'),
        import('ol/geom/Point.js'),
        import('ol/style/Style.js'),
        import('ol/style/Circle.js'),
        import('ol/style/Fill.js'),
        import('ol/style/Stroke.js'),
        import('ol/style/Text.js'),
      ]);

      if (disposed) return;

      const styles = getComputedStyle(container);
      const clusterFill = styles.getPropertyValue('--map-cluster-fill').trim() || '#ff6b35';
      const clusterText = styles.getPropertyValue('--map-cluster-text-fill').trim() || '#fff';
      const markerFill = styles.getPropertyValue('--map-marker-fill').trim() || '#ff6b35';
      const markerStroke = styles.getPropertyValue('--map-marker-stroke').trim() || '#fff';

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
                radius: 16 + Math.min(size, 20),
                fill: new Fill({ color: clusterFill }),
              }),
              text: new Text({
                text: String(size),
                fill: new Fill({ color: clusterText }),
                font: '600 12px var(--type-label-font, monospace)',
              }),
            });
          }
          return new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({ color: markerFill }),
              stroke: new Stroke({ color: markerStroke, width: 2 }),
            }),
          });
        },
      });

      // Auto-fit to markers if available
      const viewCenter = markers.length > 0
        ? fromLonLat([
            markers.reduce((s, m) => s + m.lon, 0) / markers.length,
            markers.reduce((s, m) => s + m.lat, 0) / markers.length,
          ])
        : fromLonLat(center);

      map = new OlMap({
        target: container,
        layers: [
          new TileLayer({ source: new OSM() }),
          clusterLayer,
        ],
        view: new View({
          center: viewCenter,
          zoom,
        }),
      });

      if (onclick) {
        map.on('click', (evt) => {
          const feature = map?.forEachFeatureAtPixel(evt.pixel, f => f);
          if (!feature) return;

          const clustered = feature.get('features');
          if (clustered?.length === 1) {
            const data = clustered[0].get('markerData');
            if (data) onclick(data);
          } else if (clustered?.length > 1) {
            // Zoom into cluster
            const view = map?.getView();
            const currentZoom = view?.getZoom() ?? zoom;
            view?.animate({
              center: feature.getGeometry()?.getCoordinates(),
              zoom: currentZoom + 2,
              duration: 300,
            });
          }
        });

        // Pointer cursor on features
        map.on('pointermove', (evt) => {
          const hit = map?.forEachFeatureAtPixel(evt.pixel, () => true);
          if (container) container.style.cursor = hit ? 'pointer' : '';
        });
      }
    })();

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
  }

  .map-cluster :global(.ol-viewport) {
    border-radius: inherit;
  }
</style>
