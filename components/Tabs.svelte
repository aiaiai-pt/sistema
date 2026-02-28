<!--
  @component Tabs

  Container for tabbed interface. Provides context to TabList, Tab, and TabPanel.
  Consumes --tabs-* tokens from components.css.

  @example
  <Tabs bind:value={activeTab}>
    <TabList>
      <Tab value="overview">OVERVIEW</Tab>
      <Tab value="settings">SETTINGS</Tab>
    </TabList>
    <TabPanel value="overview">Overview content</TabPanel>
    <TabPanel value="settings">Settings content</TabPanel>
  </Tabs>
-->
<script>
  import { setContext } from 'svelte';

  let {
    /** @type {string} */
    value = $bindable(''),
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();

  setContext('tabs', {
    get value() { return value; },
    /** @param {string} v */
    setValue(v) { value = v; }
  });
</script>

<div class="tabs {className}" {...rest}>
  {#if children}{@render children()}{/if}
</div>

<style>
  .tabs {
    display: flex;
    flex-direction: column;
  }
</style>
