<!--
  @component CardGrid

  Responsive grid layout for cards. Standardizes column counts and gaps
  across all card grid usages in the application.

  Uses --grid-gutter token for consistent gap spacing.

  @example Default (3-column card grid)
  <CardGrid>
    <Card>...</Card>
    <Card>...</Card>
    <Card>...</Card>
  </CardGrid>

  @example Stats row (4-column, compact)
  <CardGrid columns="4">
    <Card><StatValue /></Card>
    <Card><StatValue /></Card>
  </CardGrid>

  @example 2-column layout
  <CardGrid columns="2">
    <Card>...</Card>
    <Card>...</Card>
  </CardGrid>
-->
<script>
  let {
    /** @type {'2' | '3' | '4'} Number of columns at desktop breakpoint */
    columns = '3',
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();
</script>

<div
  class="card-grid card-grid-{columns} {className}"
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .card-grid {
    display: grid;
    gap: var(--grid-gutter);
    grid-template-columns: 1fr;
  }

  /* Prevent children from blowing out their grid track */
  .card-grid > :global(*) {
    min-width: 0;
  }

  /* Allow children to span full grid width */
  .card-grid :global(.grid-full) {
    grid-column: 1 / -1;
  }

  /* ─── 2-column variant ─── */
  .card-grid-2 {
    grid-template-columns: 1fr;
  }

  @media (min-width: 768px) {
    .card-grid-2 {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* ─── 3-column variant (default) ─── */
  .card-grid-3 {
    grid-template-columns: 1fr;
  }

  @media (min-width: 768px) {
    .card-grid-3 {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .card-grid-3 {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  /* ─── 4-column variant (stats) ─── */
  .card-grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 768px) {
    .card-grid-4 {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
