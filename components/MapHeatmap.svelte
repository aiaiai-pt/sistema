<!--
  @component MapHeatmap

  Density visualization using OpenLayers built-in Heatmap layer.
  Gradient derived from DS semantic color tokens by default.
  Consumes --map-* tokens from components.css.

  OL Heatmap intensity is density-driven: overlapping point quads
  accumulate alpha. blur/radius are screen pixels (not map units).
  Keep radius >= blur for peak intensity (blurSlope = radius/blur).

  @example
  <MapHeatmap
    points={[{ lon: -9.14, lat: 38.74, weight: 5 }]}
    radius={25}
    blur={15}
  />

  @example Custom gradient
  <MapHeatmap points={data} gradient={['#fef9ee', '#fef3c7', '#f59e0b', '#dc2626']} />
-->
<script>
  import { fromLonLat } from 'ol/proj.js';
  import { createTileLayer, getHeatmapGradient, watchTheme, renderMapError } from './map-utils.js';

  let {
    /** @type {{ lon: number, lat: number, weight?: number }[]} */
    points = [],
    /** @type {[number, number]} — fallback center if no points [lon, lat] */
    center = [0, 0],
    /** @type {number} — fallback zoom if no points */
    zoom = 6,
    /** @type {number} — point radius in screen pixels. Keep >= blur for peak intensity. */
    radius = 25,
    /** @type {number} — blur falloff in screen pixels */
    blur = 15,
    /** @type {string[] | undefined} — custom gradient overrides tokens */
    gradient = undefined,
    /** @type {import('./map-utils.js').TileSourceConfig} */
    tileSource = { type: 'osm' },
    /** @type {number} — max zoom when auto-fitting to points extent */
    maxZoom = 17,
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

      // Non-linear weight normalization: sqrt lifts low values so they're
      // visible while preserving relative ordering. OL expects 0-1.
      const maxWeight = Math.max(...points.map(p => p.weight ?? 1), 1);

      const features = points.map(p => {
        const f = new Feature({ geometry: new Point(fromLonLat([p.lon, p.lat])) });
        f.set('weight', Math.sqrt((p.weight ?? 1) / maxWeight));
        return f;
      });

      const vectorSource = new VectorSource({ features });

      const resolvedGradient = gradient ?? getHeatmapGradient(container);

      const heatmapLayer = new Heatmap({
        source: vectorSource,
        blur,
        radius,
        gradient: resolvedGradient,
        weight: (/** @type {import('ol/Feature.js').default} */ feature) =>
          feature.get('weight') ?? 0,
      });

      map = new OlMap({
        target: container,
        layers: [tileLayer, heatmapLayer],
        view: new View({
          center: fromLonLat(center),
          zoom,
        }),
      });

      // Auto-fit view to points extent
      if (points.length > 0) {
        const extent = vectorSource.getExtent();
        if (extent && isFinite(extent[0])) {
          map.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            maxZoom,
          });
        }
      }

      // Theme reactivity: re-read gradient tokens on theme change
      if (!gradient) {
        disposeTheme = watchTheme(() => {
          heatmapLayer.setGradient(getHeatmapGradient(container));
          map?.render();
        });
      }
    } catch (err) { renderMapError(container, 'MapHeatmap', /** @type {Error} */ (err)); } })();

    return () => {
      disposed = true;
      disposeTheme?.();
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
