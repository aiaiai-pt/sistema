<!--
  @component LinkHighlightToggle

  Citizen "underline links" preference (#244 C7 accessibility pack). A single
  on/off switch: "on" forces a visible underline on every in-content link, so
  links are distinguishable by more than colour (WCAG 1.4.1 Use of Colour /
  Selo item 6 — hyperlinks should not rely on colour alone).

  Presentational, mirrors the scheme/motion controls: it reports the new value
  via `onchange`; the consumer persists it (cookie) and applies the
  `:root[data-link-highlight="on"]` layer (tokens/semantic.css) server-side, so
  SSR paints it with no flash. The label is a prop for i18n (default English).

  @example
  <LinkHighlightToggle on={prefs.linkHighlight} onchange={(v) => setLinkHighlight(v)} />
-->
<script>
  import Toggle from "./Toggle.svelte";

  let {
    /** @type {boolean} Whether link-underlining is currently on. */
    on = false,
    /** @type {((on: boolean) => void) | undefined} */
    onchange = undefined,
    /** @type {string} Accessible label (i18n). */
    label = "Underline links",
    ...rest
  } = $props();
</script>

<Toggle
  checked={on}
  {label}
  {onchange}
  data-testid="link-highlight-toggle"
  {...rest}
/>
