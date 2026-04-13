<!--
  @component StatGrid

  Responsive grid for StatCard components. Wraps CardGrid with
  stat-appropriate defaults (4 columns, stat-grid gap).

  @example
  <StatGrid>
    <StatCard label="TOTAL" value="1,247" />
    <StatCard label="ACTIVE" value="892" variant="success" />
    <StatCard label="OVERDUE" value="23" variant="error" />
    <StatCard label="SCHEDULED" value="156" variant="info" />
  </StatGrid>
-->
<script>
  import CardGrid from './CardGrid.svelte';

  let {
    /** @type {'2' | '3' | '4'} */
    columns = '4',
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();
</script>

<CardGrid {columns} class="stat-grid {className}" {...rest}>
  {#if children}
    {@render children()}
  {/if}
</CardGrid>

<style>
  :global(.stat-grid) {
    gap: var(--stat-grid-gap);
  }
</style>
