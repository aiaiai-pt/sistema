<!--
  @component TabList

  Horizontal bar containing Tab triggers.
  Consumes --tabs-list-* tokens from components.css.

  @example
  <TabList>
    <Tab value="one">ONE</Tab>
    <Tab value="two">TWO</Tab>
  </TabList>
-->
<script>
  let {
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();
</script>

<div class="tab-list {className}" role="tablist" {...rest}>
  {#if children}{@render children()}{/if}
</div>

<style>
  .tab-list {
    display: inline-flex;
    align-items: center;
    background: var(--tabs-list-bg);
    border-radius: var(--tabs-list-radius);
    padding: var(--tabs-list-padding);
    gap: var(--space-2xs);
  }
</style>
