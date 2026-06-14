<!--
  @component ContrastToggle

  Citizen high-contrast preference (#244 C7 accessibility pack). A single on/off
  switch: "on" asks for a high-contrast rendering (max text/surface separation,
  stronger borders, underlined links) on top of the active light/dark scheme.

  Presentational, mirrors the scheme/motion controls: it reports the new value
  via `onchange`; the consumer persists it (cookie) and applies the
  `:root[data-contrast="high"]` layer (tokens/semantic.css) server-side, so SSR
  paints it with no flash. The label is a prop for i18n (default English).

  @example
  <ContrastToggle high={prefs.contrast === "high"} onchange={(v) => setContrast(v)} />
-->
<script>
  import Toggle from "./Toggle.svelte";

  let {
    /** @type {boolean} Whether high-contrast is currently on. */
    high = false,
    /** @type {((high: boolean) => void) | undefined} */
    onchange = undefined,
    /** @type {string} Accessible label (i18n). */
    label = "High contrast",
    ...rest
  } = $props();
</script>

<Toggle
  checked={high}
  {label}
  {onchange}
  data-testid="contrast-toggle"
  {...rest}
/>
