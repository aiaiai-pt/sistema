<!-- Test stand-in for MapPicker inside ActionFormRenderer (jsdom cannot draw
     on an OpenLayers canvas). It records the props the renderer hands the
     picker and exposes `draw(parts)`, which runs the REAL MapPicker
     composition (`composeGeometry`) for the mode it was given and fires the
     callbacks exactly as MapPicker does — so a test proves the renderer picked
     the right mode AND stores what that mode emits. -->
<script>
  import { composeGeometry } from '../../components/map-geometry';

  let props = $props();

  const g = /** @type {any} */ (globalThis);
  g.__mapPickerStubs = g.__mapPickerStubs ?? [];
  g.__mapPickerStubs.push({
    get props() {
      return props;
    },
    /** @param {any[]} parts */
    draw(parts) {
      const mode = props.mode ?? 'point';
      if (mode === 'point') {
        const last = parts[parts.length - 1];
        props.onchange?.(last);
        return;
      }
      props.ongeometry?.(composeGeometry(mode, parts));
    },
  });
</script>

<div data-testid="map-picker-stub" data-mode={props.mode ?? 'point'}>
  <span>{props.label}</span>
  {#if props.error}<span role="alert">{props.error}</span>{/if}
</div>
