<!--
  @component MapHeatmap

  Density visualization layer using OpenLayers built-in Heatmap.
  Consumes --map-* tokens from components.css.

  @example
  <MapHeatmap
    points={[{ lon: -9.14, lat: 38.74, weight: 5 }]}
    center={[-9.14, 38.74]}
    zoom={10}
  />
-->
<script>
  import { fromLonLat } from 'ol/proj.js';

  /**
   * @typedef {{ lon: number, lat: number, weight?: number }} HeatPoint
   */

  let {
    /** @type {HeatPoint[]} */
    points = [],
    /** @type {[number, number]} — initial center [lon, lat] */
    center = [0, 0],
    /** @type {number} */
    zoom = 6,
    /** @type {number} — blur radius in pixels */
    blur = 15,
    /** @type {number} — point radius in pixels */
    radius = 8,
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
        { default: VectorSource },
        { default: Heatmap },
        { default: Feature },
        { default: Point },
      ] = await Promise.all([
        import('ol/Map.js'),
        import('ol/View.js'),
        import('ol/layer/Tile.js'),
        import('ol/source/OSM.js'),
        import('ol/source/Vector.js'),
        import('ol/layer/Heatmap.js'),
        import('ol/Feature.js'),
        import('ol/geom/Point.js'),
      ]);

      if (disposed) return;

      const features = points.map(p => {
        const f = new Feature({ geometry: new Point(fromLonLat([p.lon, p.lat])) });
        f.set('weight', p.weight ?? 1);
        return f;
      });

      const vectorSource = new VectorSource({ features });

      const heatmapLayer = new Heatmap({
        source: vectorSource,
        blur,
        radius,
        weight: (feature) => {
          const w = feature.get('weight') ?? 1;
          // Normalize to 0-1 range
          const maxWeight = Math.max(...points.map(p => p.weight ?? 1), 1);
          return w / maxWeight;
        },
      });

      const viewCenter = points.length > 0
        ? fromLonLat([
            points.reduce((s, p) => s + p.lon, 0) / points.length,
            points.reduce((s, p) => s + p.lat, 0) / points.length,
          ])
        : fromLonLat(center);

      map = new OlMap({
        target: container,
        layers: [
          new TileLayer({ source: new OSM() }),
          heatmapLayer,
        ],
        view: new View({
          center: viewCenter,
          zoom,
        }),
      });
    })();

    return () => {
      disposed = true;
      map?.setTarget(undefined);
    };
  });
</script>

<div
  bind:this={container}
  class="map-heatmap {className}"
  style:height
  role="img"
  aria-label="Heatmap"
  {...rest}
></div>

<style>
  .map-heatmap {
    width: 100%;
    border: var(--map-border);
    border-radius: var(--map-radius);
    overflow: hidden;
  }

  .map-heatmap :global(.ol-viewport) {
    border-radius: inherit;
  }
</style>
