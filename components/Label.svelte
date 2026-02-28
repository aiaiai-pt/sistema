<!--
  @component Label

  Standalone form label. Uses the same typography tokens as Input labels.
  Use this in complex form layouts where the label isn't built into a form component.

  @example
  <Label for="my-input">EMAIL ADDRESS</Label>

  @example Disabled
  <Label for="my-input" disabled>LOCKED FIELD</Label>
-->
<script>
  let {
    /** @type {string | undefined} */
    for: htmlFor = undefined,
    /** @type {boolean} */
    disabled = false,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();
</script>

<label
  for={htmlFor}
  class="label {className}"
  class:label-disabled={disabled}
  {...rest}
>
  {#if children}{@render children()}{/if}
</label>

<style>
  .label {
    font-family: var(--input-label-font);
    font-size: var(--input-label-size);
    letter-spacing: var(--input-label-tracking);
    color: var(--input-label-color);
    cursor: default;
  }

  .label-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
