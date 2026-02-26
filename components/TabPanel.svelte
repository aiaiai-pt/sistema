<!--
  @component TabPanel

  Content panel shown when its matching Tab is active.
  Reads active state from Tabs context.
  Consumes --tabs-content-* tokens from components.css.

  @example
  <TabPanel value="overview">
    Overview content goes here.
  </TabPanel>
-->
<script>
  import { getContext } from 'svelte';

  let {
    /** @type {string} */
    value,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children,
    ...rest
  } = $props();

  /** @type {{ value: string, setValue: (v: string) => void } | undefined} */
  const tabs = getContext('aiaiai-tabs');
  const isActive = $derived(tabs?.value === value);
</script>

{#if isActive}
  <div
    role="tabpanel"
    class="tab-panel {className}"
    {...rest}
  >
    {#if children}{@render children()}{/if}
  </div>
{/if}

<style>
  .tab-panel {
    padding-top: var(--tabs-content-padding-top);
  }
</style>
