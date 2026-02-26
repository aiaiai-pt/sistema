<!--
  @component KeyValue

  Structured data display. Key in mono label, value in mono data.
  Consumes --kv-* tokens from components.css.

  @example Stacked (default)
  <KeyValue key="STATUS" value="Active" />

  @example Inline
  <KeyValue key="PLAN" value="Pro" layout="inline" />

  @example Custom value via snippet
  <KeyValue key="STATUS">
    {#snippet value()}<Badge variant="success">ACTIVE</Badge>{/snippet}
  </KeyValue>
-->
<script>
  /**
   * @typedef {'stacked' | 'inline'} Layout
   */

  let {
    /** @type {string} */
    key,
    /** @type {string | undefined} */
    value: valueText,
    /** @type {Layout} */
    layout = 'stacked',
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    value: valueSnippet,
    ...rest
  } = $props();

  // Determine if we got a snippet or a string for value
  const hasSnippet = $derived(typeof valueSnippet === 'function');
</script>

<div
  class="kv kv-{layout} {className}"
  {...rest}
>
  <span class="kv-key">{key}</span>
  {#if hasSnippet}
    <span class="kv-value">{@render valueSnippet()}</span>
  {:else if valueText != null}
    <span class="kv-value">{valueText}</span>
  {/if}
</div>

<style>
  .kv {
    display: flex;
    gap: var(--kv-gap);
  }

  .kv-stacked {
    flex-direction: column;
  }

  .kv-inline {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .kv-key {
    font-family: var(--kv-key-font);
    font-size: var(--kv-key-size);
    color: var(--kv-key-color);
    letter-spacing: var(--type-label-tracking);
  }

  .kv-value {
    font-family: var(--kv-value-font);
    font-size: var(--kv-value-size);
    color: var(--kv-value-color);
  }
</style>
