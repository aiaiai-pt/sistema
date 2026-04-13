<!--
  @component MapHeatmap

  Density visualization using OpenLayers built-in Heatmap layer.
  Gradient derived from DS semantic color tokens by default.
  Consumes --map-* tokens from components.css.

  @example
  <MapHeatmap
    points={[{ lon: -9.14, lat: 38.74, weight: 5 }]}
    center={[-9.14, 38.74]}
    zoom={10}
  />

  @example Custom gradient
  <MapHeatmap points={data} gradient={['#f7fbff', '#6baed6', '#2171b5', '#08306b']} />
-->
<script>
  import { fromLonLat } from 'ol/proj.js';
  import { createTileLayer, cssVar, getHeatmapGradient } from './map-utils.js';

  let {
    /** @type {{ lon: number, lat: number, weight?: number }[]} */
    points = [],
    /** @type {[number, number]} — initial center [lon, lat] */
    center = [0, 0],
    /** @type {number} */
    zoom = 6,
    /** @type {number} — blur radius in pixels */
    blur = 15,
    /** @type {number} — point radius in pixels */
    radius = 8,
    /** @type {string[] | undefined} — custom gradient overrides tokens */
    gradient = undefined,
    /** @type {import('./map-utils.js').TileSourceConfig} */
    tileSource = { type: 'osm' },
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
        { default: VectorSource },
        { default: Heatmap },
        { default: Feature },
        { default: Point },
      ] = await Promise.all([
        import('ol/Map.js'),
        import('ol/View.js'),
        import('ol/source/Vector.js'),
        import('ol/layer/Heatmap.js'),
        import('ol/Feature.js'),
        import('ol/geom/Point.js'),
      ]);

      if (disposed) return;

      const tileLayer = await createTileLayer(tileSource);
      if (disposed) return;

      const maxWeight = Math.max(...points.map(p => p.weight ?? 1), 1);

      const features = points.map(p => {
        const f = new Feature({ geometry: new Point(fromLonLat([p.lon, p.lat])) });
        f.set('weight', (p.weight ?? 1) / maxWeight);
        return f;
      });

      const vectorSource = new VectorSource({ features });

      // Gradient: prop override > CSS tokens > OL default
      const resolvedGradient = gradient ?? getHeatmapGradient(container);

      /** @type {Record<string, any>} */
      const heatmapOpts = {
        source: vectorSource,
        blur,
        radius,
        weight: (/** @type {import('ol/Feature.js').default} */ feature) =>
          feature.get('weight') ?? 0,
      };
      if (resolvedGradient) {
        heatmapOpts.gradient = resolvedGradient;
      }

      const heatmapLayer = new Heatmap(heatmapOpts);

      const viewCenter = points.length > 0
        ? fromLonLat([
            points.reduce((s, p) => s + p.lon, 0) / points.length,
            points.reduce((s, p) => s + p.lat, 0) / points.length,
          ])
        : fromLonLat(center);

      map = new OlMap({
        target: container,
        layers: [tileLayer, heatmapLayer],
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
