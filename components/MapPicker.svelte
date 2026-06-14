<!--
  @component MapPicker

  Interactive map for selecting a point or drawing a polygon.
  OpenLayers with configurable tiles and Draw interaction.
  Draw sketch styled with DS tokens (not OL blue default).
  Built-in GeoSearch (Nominatim) for address lookup + pan.
  Consumes --map-* tokens from components.css.

  @example Point selection with search
  <MapPicker mode="point" onchange={(coords) => console.log(coords)} />

  @example Without search
  <MapPicker mode="point" search={false} onchange={(coords) => console.log(coords)} />

  @example Polygon drawing
  <MapPicker mode="polygon" onchange={(coords) => console.log(coords)} />
-->
<script module>
  let _mappickerUid = 0;
</script>

<script>
  import { fromLonLat, toLonLat } from 'ol/proj.js';
  import {
    createTileLayer,
    createMapStyles,
    createOverlayLayers,
    createBoundaryLayer,
    boundaryToRings,
    pointInRings,
    watchTheme,
    renderMapError,
  } from './map-utils.js';
  import GeoSearch from './GeoSearch.svelte';

  let {
    /** @type {'point' | 'polygon'} */
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
    /** @type {boolean} — show GeoSearch bar above map */
    search = true,
    /** @type {string} — Nominatim-compatible search endpoint */
    searchProviderUrl = undefined,
    /** @type {[number, number, number, number] | undefined} — viewbox bias for search */
    searchViewbox = undefined,
    /** @type {import('./map-utils.js').TileSourceConfig} */
    tileSource = { type: 'osm' },
    /** @type {import('./map-utils.js').OverlayLayerDef[]} — ordered GeoJSON
     *  overlays between the tiles and the draw layer (see MapDisplay). */
    layers = [],
    /** @type {any} — tenant boundary: GeoJSON Polygon/MultiPolygon/Feature/
     *  FeatureCollection or a raw ring [[lon,lat],...]. Rendered as a dashed
     *  --map-boundary-* overlay; point placements are tested against it. */
    boundary = undefined,
    /** @type {((outside: boolean, coords: [number, number]) => void) | undefined}
     *  Fired on every point placement (map click or search pick) when a
     *  `boundary` is set. The pin still lands — surfacing/blocking is the
     *  consumer's call (the intake hard-gate is server-side regardless). */
    onoutofbounds = undefined,
    /** @type {((coords: [number, number] | number[][]) => void) | undefined} */
    onchange = undefined,
    /** @type {((displayName: string) => void) | undefined} — the resolved
     *  address whenever the pin settles (search pick or reverse geocode of a
     *  map click). Feed it to an address field; coords stay `onchange`. */
    onaddress = undefined,
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
  /** @type {import('ol/Map.js').default | undefined} */
  let _map = $state();
  /** @type {any} — shared style factory (set at mount, consumed by the
   *  overlay owner effect) */
  let _styles = $state();
  /** @type {any} — VectorSource for placing markers via search */
  let _vectorSource;
  /** @type {any} */
  let _Feature;
  /** @type {any} */
  let _Point;

  // Bidirectional coords for GeoSearch: search → map, map click → reverse geocode
  let searchCoords = $state(/** @type {[number, number] | undefined} */ (undefined));
  let initialReverseDone = false;

  // Set searchCoords from initial value (triggers reverse geocode in GeoSearch)
  $effect(() => {
    if (!initialReverseDone && value) {
      searchCoords = /** @type {[number, number]} */ ([...value]);
      initialReverseDone = true;
    }
  });

  function handleGeoLocation(lon, lat) {
    if (!_map) return;
    const view = _map.getView();
    if (view) view.animate({ center: fromLonLat([lon, lat]), zoom: 16, duration: 400 });

    // In point mode, also place a marker and emit the value
    if (mode === 'point' && _vectorSource && _Feature && _Point) {
      _vectorSource.clear();
      _vectorSource.addFeature(new _Feature({ geometry: new _Point(fromLonLat([lon, lat])) }));
      value = [lon, lat];
      checkBoundary([lon, lat]);
      onchange?.([lon, lat]);
    }
  }

  /** Called by MapPicker when user clicks to place a point — triggers reverse geocoding */
  function handleMapPointPlaced(lon, lat) {
    searchCoords = [lon, lat];
  }

  const boundaryRings = $derived(boundaryToRings(boundary));

  // Recentre when `center` arrives or changes after mount. Consumers commonly
  // resolve the centre asynchronously (after a boundary/config fetch), and the
  // map-init effect reads `center` only PAST an `await`, so it is not tracked
  // as a dependency there — without this the late centre is silently dropped
  // and the map sits on its initial view (e.g. [0,0]). Skips once the user has
  // placed a pin (`value`) so a late centre never yanks the map out from under
  // a selection, and skips the [0,0] "unset" sentinel.
  $effect(() => {
    const c = center;
    const map = _map;
    if (!map || value) return;
    if (!Array.isArray(c) || c.length !== 2) return;
    if (c[0] === 0 && c[1] === 0) return;
    const view = map.getView();
    if (view) view.setCenter(fromLonLat(/** @type {[number, number]} */ (c)));
  });

  /** @param {[number, number]} coords */
  function checkBoundary(coords) {
    if (!boundaryRings.length || !onoutofbounds) return;
    onoutofbounds(!pointInRings(coords, boundaryRings), coords);
  }

  // The dashed boundary overlay has ONE owner: this effect. Consumers
  // typically FETCH the boundary (it arrives after map init), so a
  // mount-time-only build silently drops it — the overlay must track
  // `boundaryRings` for as long as the map lives. The sequence counter
  // drops stale async builds when the rings change mid-flight.
  /** @type {any} */
  let _boundaryLayer = null;
  let _boundarySeq = 0;
  $effect(() => {
    const rings = boundaryRings;
    const map = _map;
    if (!map || !container) return;
    const seq = ++_boundarySeq;
    void (async () => {
      const layer = rings.length ? await createBoundaryLayer(rings, container) : null;
      if (seq !== _boundarySeq || _map !== map) return;
      if (_boundaryLayer) map.removeLayer(_boundaryLayer);
      _boundaryLayer = layer;
      if (layer) {
        // Just below the pin/draw vector layer — boundary never covers the pin.
        const coll = map.getLayers();
        coll.insertAt(coll.getLength() - 1, layer);
      }
    })();
  });

  // The `layers` overlays get the same single-owner treatment as the
  // boundary above: consumers typically RESOLVE overlay defs asynchronously
  // (layer codes → url defs, after a fetch), so a mount-time-only build
  // silently drops them.
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
      // Between the tiles (index 0) and the boundary/pin layers — overlays
      // never cover the pin.
      built.forEach((l, i) => map.getLayers().insertAt(1 + i, l));
    })();
  });

  $effect(() => {
    if (!container || disabled) return;

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
        { default: Draw },
      ] = await Promise.all([
        import('ol/Map.js'),
        import('ol/View.js'),
        import('ol/layer/Vector.js'),
        import('ol/source/Vector.js'),
        import('ol/Feature.js'),
        import('ol/geom/Point.js'),
        import('ol/interaction/Draw.js'),
      ]);

      if (disposed) return;

      const [tileLayer, styles] = await Promise.all([
        createTileLayer(tileSource),
        createMapStyles(container),
      ]);
      if (disposed) return;

      // Neither the boundary overlay NOR the `layers` overlays are built
      // here — the reactive owner effects above track their late-arriving
      // props for as long as the map lives.
      _styles = styles;

      const vectorSource = new VectorSource();
      _vectorSource = vectorSource;
      _Feature = Feature;
      _Point = Point;

      if (value && mode === 'point') {
        vectorSource.addFeature(new Feature({ geometry: new Point(fromLonLat(value)) }));
      }

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: (feature) => {
          const type = feature.getGeometry()?.getType();
          return type === 'Point' ? styles.marker : styles.polygon;
        },
      });

      // Composite draw style: marker for vertices + polygon for fill/stroke
      const drawStyle = [
        styles.polygon,
        styles.marker,
      ];

      const drawType = mode === 'point' ? 'Point' : 'Polygon';
      const drawInteraction = new Draw({
        source: vectorSource,
        type: drawType,
        style: drawStyle,
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
          handleMapPointPlaced(wgs84[0], wgs84[1]);
          checkBoundary(wgs84);
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
      _map = map;

      disposeTheme = watchTheme(() => {
        styles.refresh();
        vectorSource.changed();
        for (const l of _overlayLayers) l.getSource()?.changed();
      });
    } catch (err) { renderMapError(container, 'MapPicker', /** @type {Error} */ (err)); } })();

    return () => {
      disposed = true;
      disposeTheme?.();
      map?.setTarget(undefined);
    };
  });
</script>

<div class="map-picker {className}" {...rest}>
  {#if label}
    <label class="map-picker-label" for={pickerId}>{label}</label>
  {/if}

  {#if search && !disabled}
    <GeoSearch
      placeholder="Search address or place..."
      providerUrl={searchProviderUrl}
      viewbox={searchViewbox}
      onlocation={handleGeoLocation}
      onresolved={onaddress}
      bind:coords={searchCoords}
      size="sm"
    />
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
