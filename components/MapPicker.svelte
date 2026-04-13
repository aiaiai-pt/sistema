<!--
  @component MapPicker

  Interactive map for selecting a point or drawing a polygon.
  OpenLayers with configurable tiles and Draw interaction.
  Consumes --map-* tokens from components.css.

  @example Point selection
  <MapPicker mode="point" onchange={(coords) => console.log(coords)} />

  @example Polygon drawing
  <MapPicker mode="polygon" onchange={(coords) => console.log(coords)} />
-->
<script module>
  let _mappickerUid = 0;
</script>

<script>
  import { fromLonLat, toLonLat } from 'ol/proj.js';
  import { createTileLayer, cssVar } from './map-utils.js';

  /**
   * @typedef {'point' | 'polygon'} Mode
   */

  let {
    /** @type {Mode} */
    mode = 'point',
    /** @type {[number, number]} — initial center [lon, lat] */
    center = [0, 0],
    /** @type {number} */
    zoom = 12,
    /** @type {[number, number] | undefined} — current point value [lon, lat] */
    value = $bindable(undefined),
    /** @type {string | undefined} */
    label = undefined,
    /** @type {string | undefined} */
    help = undefined,
    /** @type {string | undefined} */
    error = undefined,
    /** @type {boolean} */
    disabled = false,
    /** @type {import('./map-utils.js').TileSourceConfig} */
    tileSource = { type: 'osm' },
    /** @type {((coords: [number, number] | number[][]) => void) | undefined} */
    onchange = undefined,
    /** @type {string} */
    height = '100%',
    /** @type {string | undefined} */
    id = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const fallbackId = `mappicker-${_mappickerUid++}`;
  const pickerId = $derived(id ?? fallbackId);
  const hintId = $derived(`${pickerId}-hint`);
  const hasHint = $derived(!!error || !!help);

  /** @type {HTMLElement | undefined} */
  let container = $state();

  $effect(() => {
    if (!container || disabled) return;

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
        { default: Draw },
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
        import('ol/interaction/Draw.js'),
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

      const vectorSource = new VectorSource();

      if (value && mode === 'point') {
        vectorSource.addFeature(new Feature({ geometry: new Point(fromLonLat(value)) }));
      }

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          image: new CircleStyle({
            radius: markerRadius,
            fill: new Fill({ color: markerFill }),
            stroke: new Stroke({ color: markerStrokeColor, width: markerStrokeWidth }),
          }),
          fill: new Fill({ color: polyFill }),
          stroke: new Stroke({ color: polyStroke, width: polyStrokeWidth }),
        }),
      });

      const drawType = mode === 'point' ? 'Point' : 'Polygon';
      const drawInteraction = new Draw({
        source: vectorSource,
        type: drawType,
      });

      drawInteraction.on('drawstart', () => {
        vectorSource.clear();
      });

      drawInteraction.on('drawend', (evt) => {
        const geom = evt.feature.getGeometry();
        if (!geom) return;

        if (mode === 'point') {
          const coords = /** @type {import('ol/geom/Point.js').default} */ (geom).getCoordinates();
          const wgs84 = /** @type {[number, number]} */ (toLonLat(coords));
          value = wgs84;
          onchange?.(wgs84);
        } else {
          const coords = /** @type {import('ol/geom/Polygon.js').default} */ (geom).getCoordinates()[0];
          const wgs84 = coords.map(c => /** @type {[number, number]} */ (toLonLat(c)));
          onchange?.(wgs84);
        }
      });

      const initialCenter = value && mode === 'point' ? fromLonLat(value) : fromLonLat(center);

      map = new OlMap({
        target: container,
        layers: [tileLayer, vectorLayer],
        view: new View({
          center: initialCenter,
          zoom,
        }),
      });

      map.addInteraction(drawInteraction);
    })();

    return () => {
      disposed = true;
      map?.setTarget(undefined);
    };
  });
</script>

<div class="map-picker {className}" {...rest}>
  {#if label}
    <label class="map-picker-label" for={pickerId}>{label}</label>
  {/if}

  <div
    bind:this={container}
    id={pickerId}
    class="map-picker-canvas"
    class:map-picker-error={!!error}
    class:map-picker-disabled={disabled}
    style:height
    role="application"
    aria-label={label ?? 'Map picker'}
    aria-describedby={hasHint ? hintId : undefined}
  ></div>

  {#if error}
    <span id={hintId} class="map-picker-error-text" role="alert">{error}</span>
  {:else if help}
    <span id={hintId} class="map-picker-help">{help}</span>
  {/if}
</div>

<style>
  .map-picker {
    display: flex;
    flex-direction: column;
    gap: var(--input-label-gap);
    width: 100%;
  }

  .map-picker-label {
    font-family: var(--input-label-font);
    font-size: var(--input-label-size);
    letter-spacing: var(--input-label-tracking);
    color: var(--input-label-color);
  }

  .map-picker-canvas {
    width: 100%;
    border: var(--map-border);
    border-radius: var(--map-radius);
    overflow: hidden;
    cursor: crosshair;
  }

  .map-picker-canvas :global(.ol-viewport) {
    border-radius: inherit;
  }

  .map-picker-canvas.map-picker-error {
    border-color: var(--input-error-border-color);
  }

  .map-picker-canvas.map-picker-disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  .map-picker-help {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-help-color);
  }

  .map-picker-error-text {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-error-text);
  }
</style>
