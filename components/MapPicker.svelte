<!--
  @component MapPicker

  Interactive map for selecting a point or drawing shapes.
  OpenLayers with configurable tiles and Draw interaction.
  Modes and the GeoJSON type each one emits (atelier#2838):
  point → Point (`value` / `onchange` speak [lon, lat]);
  multipoint → MultiPoint; linestring → LineString;
  multilinestring → MultiLineString; polygon → Polygon;
  multipolygon → MultiPolygon. Shape modes take and report a GeoJSON
  geometry of EXACTLY their type through `geometry` / `ongeometry` (null
  when every shape is removed); a `geometry` of another type is not drawn
  and fails loud through the field error. Shape modes add a drawing
  toolbar (clear; multi modes also count + delete selected), select-by-
  click, vertex dragging (alt+click removes a vertex), and keyboard keys
  on the focused map: Enter finishes a sketch, Escape cancels it (or
  deselects), Backspace removes the last sketched vertex, Delete removes
  the selected shape.
  Draw sketch styled with DS tokens (not OL blue default).
  Built-in GeoSearch (Nominatim) for address lookup + pan.
  Consumes --map-* tokens from components.css.

  @example Point selection with search
  <MapPicker mode="point" onchange={(coords) => console.log(coords)} />

  @example Without search
  <MapPicker mode="point" search={false} onchange={(coords) => console.log(coords)} />

  @example Polygon drawing
  <MapPicker mode="polygon" ongeometry={(polygon) => console.log(polygon)} />

  @example Several polygons → one MultiPolygon
  <MapPicker mode="multipolygon" bind:geometry={area} />
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
    cssPx,
  } from './map-utils.js';
  import {
    MAP_PICKER_MODES,
    POSITION_DEPTH,
    composeGeometry,
    decomposeGeometry,
    mapPositions,
  } from './map-geometry';
  import { untrack } from 'svelte';
  import Button from './Button.svelte';
  import GeoSearch from './GeoSearch.svelte';

  let {
    /** @type {import('./map-geometry').MapPickerMode} */
    mode = 'point',
    /** @type {[number, number]} — initial center [lon, lat] */
    center = [0, 0],
    /** @type {number} */
    zoom = 12,
    /** @type {[number, number] | undefined} — current point value [lon, lat]
     *  (point mode) */
    value = $bindable(undefined),
    /** @type {import('./map-geometry').GeoJsonGeometry | null | undefined}
     *  Shape modes: the current GeoJSON geometry, of exactly the mode's type
     *  (see the mode table above). Drawn on mount and whenever it changes
     *  from outside; updated (bindable) on every edit. */
    geometry = $bindable(undefined),
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
    /** @type {((coords: [number, number] | number[][]) => void) | undefined}
     *  Legacy payloads: point → [lon, lat]; polygon → the outer ring. Shape
     *  modes report through `ongeometry`. */
    onchange = undefined,
    /** @type {((geometry: import('./map-geometry').GeoJsonGeometry | null) => void) | undefined}
     *  Shape modes: fired after every draw, vertex edit, delete or clear
     *  with the GeoJSON geometry of exactly the mode's type (polygon rings
     *  wound per RFC 7946), or null when no shape is left. */
    ongeometry = undefined,
    /** @type {string} — shape modes: delete-selected button (multi modes) */
    deleteSelectedLabel = 'Delete selected',
    /** @type {string} — shape modes: clear-all button */
    clearLabel = 'Clear',
    /** @type {string} — shape modes: accessible name of the toolbar */
    toolbarLabel = 'Drawing tools',
    /** @type {(count: number, drawType: 'Point' | 'LineString' | 'Polygon') => string}
     *  Multi modes: the live shape count ("2 polygons"). */
    countLabel = defaultCountLabel,
    /** @type {string | undefined} — shape modes: how to draw with pointer
     *  and keyboard; shown as the help text when no `help` is given.
     *  Defaults to English copy for the mode. */
    instructionsLabel = undefined,
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

  /** @param {number} count @param {'Point' | 'LineString' | 'Polygon'} drawType */
  function defaultCountLabel(count, drawType) {
    const noun = drawType === 'Point' ? 'point' : drawType === 'LineString' ? 'line' : 'polygon';
    return `${count} ${noun}${count === 1 ? '' : 's'}`;
  }

  /** @param {import('./map-geometry').MapPickerModeSpec} spec */
  function defaultInstructions(spec) {
    const replace = spec.multi ? '' : ' Drawing a new one replaces the current one.';
    if (spec.drawType === 'Point') {
      return 'Click the map to add a point. Drag a point to move it; click it to select it and press Delete to remove it.';
    }
    const what = spec.drawType === 'Polygon' ? 'shape' : 'line';
    return `Click to add vertices; double-click or press Enter to finish. Escape cancels, Backspace removes the last vertex. Drag a vertex to move it (alt+click removes it). Click a ${what} to select it and press Delete to remove it.${replace}`;
  }

  const spec = $derived(MAP_PICKER_MODES[mode] ?? MAP_PICKER_MODES.point);
  const shaped = $derived(mode !== 'point' && mode in MAP_PICKER_MODES);
  // Shape modes: `geometry` is the single source of truth for what is
  // drawn — the count and the hydration error derive from it.
  const shapes = $derived(shaped ? decomposeGeometry(mode, geometry) : { parts: [], error: null });
  const shapeCount = $derived(shapes.parts.length);
  const fieldError = $derived(error ?? shapes.error ?? undefined);
  const helpText = $derived(help ?? (shaped ? (instructionsLabel ?? defaultInstructions(spec)) : undefined));

  const fallbackId = `mappicker-${_mappickerUid++}`;
  const pickerId = $derived(id ?? fallbackId);
  const hintId = $derived(`${pickerId}-hint`);
  const hasHint = $derived(!!fieldError || !!helpText);

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

  // ── Shape-mode state ──
  /** @type {any[]} — drawn OL features, in draw order (the emit order) */
  let _drawn = [];
  /** @type {any} — the shape Delete removes */
  let _selected = $state.raw(null);
  /** @type {any} — the Draw interaction */
  let _draw;
  /** @type {any} — OL geometry constructor for the mode's draw type */
  let _ShapeGeom;
  let _sketching = false;
  let _justDrew = false;
  /** JSON of the geometry last drawn or emitted — an incoming `geometry`
   *  equal to it is our own echo, not an outside change. */
  let _lastGeometryJson = '';

  /** @param {any} feature */
  function setSelected(feature) {
    _selected = feature;
    _vectorSource?.changed();
  }

  function emitShapes() {
    const depth = POSITION_DEPTH[spec.drawType];
    const parts = _drawn.map((f) =>
      mapPositions(f.getGeometry().getCoordinates(), depth, (c) => toLonLat(c)),
    );
    const next = composeGeometry(mode, parts);
    _lastGeometryJson = JSON.stringify(next);
    geometry = next;
    ongeometry?.(next);
    if (mode === 'polygon' && parts.length) {
      onchange?.(/** @type {number[][]} */ (/** @type {any} */ (parts[parts.length - 1])[0]));
    }
  }

  /** Draw `geom` (outside value) onto the source — never emits. */
  function renderShapes(geom) {
    if (!_vectorSource || !_Feature || !_ShapeGeom) return;
    const depth = POSITION_DEPTH[spec.drawType];
    const { parts } = decomposeGeometry(mode, geom);
    _draw?.abortDrawing();
    _vectorSource.clear();
    _drawn = parts.map(
      (part) =>
        new _Feature({ geometry: new _ShapeGeom(mapPositions(part, depth, (p) => fromLonLat(p))) }),
    );
    _drawn.forEach((f) => _vectorSource.addFeature(f));
    _selected = null;
    _lastGeometryJson = JSON.stringify(geom ?? null);
  }

  function deleteSelected() {
    if (!_selected) return;
    _vectorSource?.removeFeature(_selected);
    _drawn = _drawn.filter((f) => f !== _selected);
    setSelected(null);
    emitShapes();
  }

  function clearShapes() {
    _draw?.abortDrawing();
    _vectorSource?.clear();
    _drawn = [];
    setSelected(null);
    emitShapes();
  }

  /** @param {KeyboardEvent} e */
  function handleShapeKeydown(e) {
    if (!shaped || disabled) return;
    if (e.key === 'Escape') {
      if (_sketching) _draw?.abortDrawing();
      else if (_selected) setSelected(null);
      else return;
    } else if (e.key === 'Enter') {
      if (!_sketching) return;
      _draw?.finishDrawing();
    } else if (e.key === 'Backspace') {
      if (_sketching) _draw?.removeLastPoint();
      else if (_selected) deleteSelected();
      else return;
    } else if (e.key === 'Delete') {
      if (!_selected) return;
      deleteSelected();
    } else {
      return;
    }
    e.preventDefault();
  }

  // Shape modes: an outside change to `geometry` (an edit form loading its
  // record after mount, a consumer reset) redraws; our own emits echo back
  // unchanged and are skipped.
  $effect(() => {
    const g = geometry;
    const map = _map;
    if (!shaped || !map) return;
    if (JSON.stringify(g ?? null) === _lastGeometryJson) return;
    untrack(() => renderShapes(g));
  });

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
    if (!map || value || shapeCount > 0) return;
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
        { default: Modify },
        { default: LineString },
        { default: Polygon },
        { noModifierKeys },
      ] = await Promise.all([
        import('ol/Map.js'),
        import('ol/View.js'),
        import('ol/layer/Vector.js'),
        import('ol/source/Vector.js'),
        import('ol/Feature.js'),
        import('ol/geom/Point.js'),
        import('ol/interaction/Draw.js'),
        import('ol/interaction/Modify.js'),
        import('ol/geom/LineString.js'),
        import('ol/geom/Polygon.js'),
        import('ol/events/condition.js'),
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
          if (feature === _selected) return styles.selection;
          const type = feature.getGeometry()?.getType();
          return type === 'Point' ? styles.marker : styles.polygon;
        },
      });

      // Composite draw style: marker for vertices + polygon for fill/stroke
      const drawStyle = [
        styles.polygon,
        styles.marker,
      ];

      /** @type {any} */
      let drawInteraction;
      /** @type {any} */
      let modifyInteraction;
      /** @type {((evt: any) => any) | undefined} */
      let hitShape;

      if (!shaped) {
        drawInteraction = new Draw({
          source: vectorSource,
          type: 'Point',
          style: drawStyle,
        });

        drawInteraction.on('drawstart', () => {
          vectorSource.clear();
        });

        drawInteraction.on('drawend', (evt) => {
          const geom = evt.feature.getGeometry();
          if (!geom) return;
          const coords = /** @type {import('ol/geom/Point.js').default} */ (geom).getCoordinates();
          const wgs84 = /** @type {[number, number]} */ (toLonLat(coords));
          value = wgs84;
          handleMapPointPlaced(wgs84[0], wgs84[1]);
          checkBoundary(wgs84);
          onchange?.(wgs84);
        });
      } else {
        // ── Shape modes (atelier#2838) ──
        _ShapeGeom = { Point, LineString, Polygon }[spec.drawType];
        renderShapes(untrack(() => geometry));

        hitShape = (evt) =>
          map?.forEachFeatureAtPixel(evt.pixel, (f) => f, {
            layerFilter: (l) => l === vectorLayer,
            hitTolerance: cssPx(container, '--space-xs', 4),
          }) ?? null;

        // A click on an existing shape selects it instead of starting a new
        // sketch; mid-sketch every click is a vertex.
        drawInteraction = new Draw({
          source: vectorSource,
          type: spec.drawType,
          style: drawStyle,
          condition: (evt) => noModifierKeys(evt) && (_sketching || !hitShape?.(evt)),
        });
        _draw = drawInteraction;

        drawInteraction.on('drawstart', () => {
          _sketching = spec.drawType !== 'Point';
          setSelected(null);
        });
        drawInteraction.on('drawabort', () => {
          _sketching = false;
        });
        drawInteraction.on('drawend', (evt) => {
          _sketching = false;
          _justDrew = true;
          if (!spec.multi) {
            // Replace on COMPLETION (not on drawstart) so an aborted sketch
            // leaves the current shape in place.
            for (const old of _drawn) vectorSource.removeFeature(old);
            _drawn = [];
          }
          _drawn = [..._drawn, evt.feature];
          emitShapes();
        });

        modifyInteraction = new Modify({ source: vectorSource, style: styles.marker });
        modifyInteraction.on('modifyend', () => emitShapes());
      }

      const initialCenter = value && mode === 'point' ? fromLonLat(value) : fromLonLat(center);

      map = new OlMap({
        target: container,
        layers: [tileLayer, vectorLayer],
        view: new View({
          center: initialCenter,
          zoom,
        }),
      });

      // Modify before Draw (OL's draw-and-modify order): a drag on a vertex
      // edits it, a click elsewhere draws.
      if (modifyInteraction) map.addInteraction(modifyInteraction);
      map.addInteraction(drawInteraction);

      if (shaped) {
        map.on('click', (evt) => {
          if (_justDrew) {
            _justDrew = false;
            return;
          }
          if (_sketching) return;
          setSelected(hitShape?.(evt) ?? null);
        });
        if (_drawn.length) {
          try {
            const pad = cssPx(container, '--space-xl', 32);
            map.getView().fit(vectorSource.getExtent(), {
              padding: [pad, pad, pad, pad],
              maxZoom: Math.max(zoom, 17),
            });
          } catch {
            /* no viewport size yet — keep the declared centre */
          }
        }
      }
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
      _draw = undefined;
      _sketching = false;
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

  {#if shaped && !disabled}
    <div class="map-picker-toolbar" role="group" aria-label={toolbarLabel}>
      {#if spec.multi}
        <span class="map-picker-count" aria-live="polite">{countLabel(shapeCount, spec.drawType)}</span>
        <Button variant="secondary" size="sm" disabled={!_selected} onclick={deleteSelected}>
          {deleteSelectedLabel}
        </Button>
      {/if}
      <Button variant="ghost" size="sm" disabled={shapeCount === 0} onclick={clearShapes}>
        {clearLabel}
      </Button>
    </div>
  {/if}

  <!-- svelte-ignore a11y_no_noninteractive_tabindex — role="application"
       is interactive; shape modes take their keyboard on the focused map. -->
  <div
    bind:this={container}
    id={pickerId}
    class="map-picker-canvas"
    class:map-picker-error={!!fieldError}
    class:map-picker-disabled={disabled}
    style:height
    role="application"
    tabindex={shaped && !disabled ? 0 : undefined}
    onkeydown={handleShapeKeydown}
    aria-label={label ?? 'Map picker'}
    aria-describedby={hasHint ? hintId : undefined}
  ></div>

  {#if fieldError}
    <span id={hintId} class="map-picker-error-text" role="alert">{fieldError}</span>
  {:else if helpText}
    <span id={hintId} class="map-picker-help">{helpText}</span>
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

  .map-picker-canvas:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .map-picker-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-xs);
    background: var(--map-toolbar-bg);
    border: var(--map-toolbar-border);
    border-radius: var(--map-toolbar-radius);
    padding: var(--map-toolbar-padding);
  }

  .map-picker-count {
    margin-right: auto;
    padding-inline: var(--space-xs);
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-help-color);
  }

  .map-picker-canvas :global(.ol-viewport) {
    border-radius: inherit;
  }

  /* tileSource.tone 'muted': only the basemap's own canvas is filtered. */
  .map-picker-canvas :global(.map-tiles-muted) {
    filter: var(--map-tiles-muted-filter);
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
