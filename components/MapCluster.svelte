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
  import { boundingExtent } from 'ol/extent.js';
  import { createTileLayer, createMapStyles, createOverlayLayers, watchTheme, renderMapError } from './map-utils.js';

  let {
    /** @type {{ id: string, lon: number, lat: number, label?: string, [key: string]: any }[]} */
    markers = [],
    /** @type {[number, number] | undefined} — initial center [lon, lat].
     *  Omit to auto-FIT the markers' extent (the right default for "show
     *  my data" maps; explicit center wins for dashboards pinned to a
     *  region). */
    center = undefined,
    /** @type {number} */
    zoom = 6,
    /** @type {number} — cluster distance in pixels */
    distance = 40,
    /** @type {import('./map-utils.js').TileSourceConfig} */
    tileSource = { type: 'osm' },
    /** @type {import('./map-utils.js').OverlayLayerDef[]} — ordered GeoJSON
     *  overlays rendered between the tiles and the cluster layer. Each
     *  entry: inline `data` or a `url` (e.g. the platform's
     *  `/{app}/public/layers/{id}/features`), optional flat or GeoStyler
     *  `style`. Unbounded — render as many as the consumer configures. */
    layers = [],
    /** @type {((marker: { id: string, lon: number, lat: number, label?: string }) => void) | undefined} */
    onclick = undefined,
    /** @type {import('svelte').Snippet<[any, () => void]> | undefined} —
     *  click-popup content. When provided, clicking a single marker (or a
     *  stacked pile) opens an anchored OL Overlay rendering this snippet with
     *  `(markerData, close)` — the "ficha resumo" intermediate step before the
     *  consumer's detail link — INSTEAD of firing `onclick`. Omit for the
     *  legacy click-to-navigate behaviour. Compose with the DS `MapPopup` for
     *  the card chrome (the original `let:popup` contract, now a snippet). */
    popup = undefined,
    /** @type {string} */
    height = '100%',
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  /** @type {HTMLElement | undefined} */
  let container = $state();
  /** @type {HTMLElement | undefined} — the popup overlay's element (Svelte
   *  renders the snippet into it; OL positions it). */
  let popupEl = $state();
  /** @type {any} — the marker data of the open popup, or null. */
  let selected = $state(null);
  /** @type {any} — popup OL Overlay ref, set at mount. */
  let _popupOverlay;

  function closePopup() {
    selected = null;
    _popupOverlay?.setPosition(undefined);
  }

  // Hoisted references for reactive effects
  /** @type {import('ol/Map.js').default | undefined} */
  let _map = $state();
  /** @type {any} — VectorSource */
  let _vectorSource = $state();
  /** @type {any} — Cluster source */
  let _clusterSource = $state();
  /** @type {any} — shared style factory (set at mount, consumed by the
   *  overlay owner effect) */
  let _styles = $state();
  /** @type {any} — Feature constructor */
  let _Feature;
  /** @type {any} — Point constructor */
  let _Point;

  // The `layers` overlays have ONE owner: this effect (same contract as
  // MapPicker's boundary). Consumers typically RESOLVE overlay defs
  // asynchronously (layer codes → url defs, after a fetch), so a
  // mount-time-only build silently drops them — the overlays must track
  // `layers` for as long as the map lives. The sequence counter drops
  // stale async builds when the defs change mid-flight.
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
      // Between the tiles (index 0) and the cluster layer — overlays never
      // cover the markers.
      built.forEach((l, i) => map.getLayers().insertAt(1 + i, l));
    })();
  });

  // Reactive: animate when the CALLER's center/zoom props change. Guarded
  // against the mount-time run — with no explicit `center` the view was
  // initialised to the markers' extent/mean, and animating to the prop
  // default ([0,0], null island) shoved every marker off-screen.
  let _lastCenterKey = $state("");
  $effect(() => {
    const key = center ? `${center[0]},${center[1]},${zoom}` : "";
    if (!_map || !center) return;
    if (key === _lastCenterKey) return;
    const first = _lastCenterKey === "";
    _lastCenterKey = key;
    if (first) return; // initial view already honours the props
    const view = _map.getView();
    if (!view) return;
    view.animate({ center: fromLonLat(center), zoom, duration: 300 });
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
      _styles = styles;
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
        // The hover tooltip anchors AT the feature — OL's default
        // stopEvent:true puts it in the event-stopping overlay pane, so the
        // very click the tooltip invites lands on the overlay container and
        // dies (the element's own pointer-events:none can't help; the
        // CONTAINER captures). Informational overlay → never stop events.
        stopEvent: false,
      });

      // Click-popup overlay (the "ficha resumo"): anchored above the marker.
      // `stopEvent: true` (OL default) keeps it in the interactive overlay
      // pane so the link/close button inside the popup snippet are clickable.
      // Its element is the Svelte-rendered `popupEl`; Svelte owns the content,
      // OL owns the position. Only created when a `popup` snippet is supplied.
      const overlays = [tooltipOverlay];
      if (popup && popupEl) {
        _popupOverlay = new Overlay({
          element: popupEl,
          positioning: 'bottom-center',
          offset: [0, -18],
          stopEvent: true,
        });
        overlays.push(_popupOverlay);
      }

      const viewCenter = center
        ? fromLonLat(center)
        : markers.length > 0
          ? fromLonLat([
              markers.reduce((s, m) => s + m.lon, 0) / markers.length,
              markers.reduce((s, m) => s + m.lat, 0) / markers.length,
            ])
          : fromLonLat([0, 0]);

      map = new OlMap({
        target: container,
        // The `layers` overlays are NOT built here — the reactive owner
        // effect above inserts them between the tiles and the cluster layer.
        layers: [tileLayer, clusterLayer],
        overlays,
        view: new View({
          center: viewCenter,
          zoom,
        }),
      });
      _map = map;
      // No explicit center → fit the markers' extent so every cluster is on
      // screen regardless of how the data spreads (mean-centre alone leaves
      // distant clouds outside the default zoom).
      if (!center && markers.length > 1) {
        const coords = markers.map((m) => fromLonLat([m.lon, m.lat]));
        const ext = boundingExtent(coords);
        map.getView().fit(ext, { padding: [48, 48, 48, 48], maxZoom: 15 });
      }

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

      // `popup` opens the anchored ficha-resumo overlay; otherwise `onclick`
      // navigates (legacy). A single marker (or a stacked pile that can't split
      // by zoom) "selects"; a spread cluster zooms in.
      const selectMarker = (data, coords) => {
        if (!data) return;
        if (popup) {
          selected = data;
          if (coords) {
            _popupOverlay?.setPosition(coords);
            // Fly TO the clicked marker: animate the view so the marker (and its
            // anchored popup) is centred — a clear "the map moved to what I
            // tapped" gesture, not a subtle edge-nudge. The small ficha-resumo
            // card opens above the now-centred marker and stays in view.
            map?.getView().animate({ center: coords, duration: 400 });
          }
        } else {
          onclick?.(data);
        }
      };

      // Click handler
      if (onclick || popup) {
        map.on('click', (evt) => {
          const feature = map?.forEachFeatureAtPixel(evt.pixel, f => f);
          // Clicking empty map dismisses an open popup (no-op without one).
          if (!feature) { closePopup(); return; }

          const clustered = feature.get('features');
          if (clustered?.length === 1) {
            selectMarker(
              clustered[0].get('markerData'),
              (/** @type {any} */ (feature.getGeometry()))?.getCoordinates(),
            );
          } else if (clustered?.length > 1) {
            // A cluster ALWAYS expands first — zoom in toward it so the citizen
            // picks an individual marker; only a SINGLE marker opens a popup.
            // The lone exception is a genuinely STACKED pile (near-identical
            // coords — stacked reports at one point are common in civic data)
            // that can't split by zooming: once we're already at max zoom and
            // it's still piled, fall back to opening the first item so it stays
            // reachable instead of zoom-looping forever.
            const view = map?.getView();
            const currentZoom = view?.getZoom() ?? zoom;
            const maxZoom = view?.getMaxZoom?.() ?? 19;
            const coords = clustered.map((f) => f.getGeometry()?.getCoordinates()).filter(Boolean);
            const lons = coords.map((c) => c[0]);
            const lats = coords.map((c) => c[1]);
            const spread = Math.max(...lons) - Math.min(...lons) + (Math.max(...lats) - Math.min(...lats));
            const stacked = spread < 1; // metres in web-mercator units
            if (stacked && currentZoom >= maxZoom - 0.5) {
              selectMarker(
                clustered[0].get('markerData'),
                (/** @type {any} */ (feature.getGeometry()))?.getCoordinates(),
              );
              return;
            }
            view?.animate({
              center: feature.getGeometry()?.getCoordinates(),
              zoom: Math.min(currentZoom + 2, maxZoom),
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

    // Escape closes an open popup (keyboard dismissal).
    const onKeydown = (/** @type {KeyboardEvent} */ e) => {
      if (e.key === 'Escape') closePopup();
    };
    if (typeof window !== 'undefined') window.addEventListener('keydown', onKeydown);

    return () => {
      disposed = true;
      disposeTheme?.();
      if (typeof window !== 'undefined') window.removeEventListener('keydown', onKeydown);
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

<!-- Popup overlay element. Always in the DOM (OL moves it into the overlay
     pane + positions it); Svelte owns its content. The snippet receives the
     selected marker + a `close` callback (the original `let:popup` contract). -->
{#if popup}
  <div bind:this={popupEl} class="map-cluster-popup">
    {#if selected}{@render popup(selected, closePopup)}{/if}
  </div>
{/if}

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

  /* Overlay element wrapper — OL owns its position (inline transform); this
     just lifts it above the map controls. The card chrome is the consumer's
     MapPopup. */
  .map-cluster-popup {
    z-index: 2;
  }
</style>
