<!--
  @component MapDisplay

  Read-only map showing a point or polygon. OpenLayers with configurable tiles.
  Consumes --map-* tokens from components.css.

  @example Point
  <MapDisplay center={[-9.14, 38.74]} zoom={14} marker={[-9.14, 38.74]} />

  @example Custom tiles
  <MapDisplay center={[-9.14, 38.74]} tileSource={{ type: 'xyz', url: '...' }} />
-->
<script>
  import { fromLonLat } from 'ol/proj.js';
  import { createTileLayer, cssVar } from './map-utils.js';

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
        { default: VectorLayer },
        { default: VectorSource },
        { default: Feature },
        { default: Point },
        { default: Polygon },
        { default: Style },
        { default: CircleStyle },
        { default: Fill },
        { default: Stroke },
      ] = await Promise.all([
        import('ol/Map.js'),
        import('ol/View.js'),
        import('ol/layer/Vector.js'),
        import('ol/source/Vector.js'),
        import('ol/Feature.js'),
        import('ol/geom/Point.js'),
        import('ol/geom/Polygon.js'),
        import('ol/style/Style.js'),
        import('ol/style/Circle.js'),
        import('ol/style/Fill.js'),
        import('ol/style/Stroke.js'),
      ]);

      if (disposed) return;

      const tileLayer = await createTileLayer(tileSource);
      if (disposed) return;

      const markerFill = cssVar(container, '--map-marker-fill', '#ff6b35');
      const markerStrokeColor = cssVar(container, '--map-marker-stroke', '#fff');
      const markerRadius = parseFloat(cssVar(container, '--map-marker-radius', '8'));
      const markerStrokeWidth = parseFloat(cssVar(container, '--map-marker-stroke-width', '2'));
      const polyFill = cssVar(container, '--map-polygon-fill', 'rgba(255,107,53,0.2)');
      const polyStroke = cssVar(container, '--map-polygon-stroke', '#ff6b35');
      const polyStrokeWidth = parseFloat(cssVar(container, '--map-polygon-stroke-width', '2'));

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
          if (type === 'Point') {
            return new Style({
              image: new CircleStyle({
                radius: markerRadius,
                fill: new Fill({ color: markerFill }),
                stroke: new Stroke({ color: markerStrokeColor, width: markerStrokeWidth }),
              }),
            });
          }
          return new Style({
            fill: new Fill({ color: polyFill }),
            stroke: new Stroke({ color: polyStroke, width: polyStrokeWidth }),
          });
        },
      });

      map = new OlMap({
        target: container,
        layers: [tileLayer, vectorLayer],
        view: new View({
          center: fromLonLat(center),
          zoom,
        }),
        controls: [],
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
