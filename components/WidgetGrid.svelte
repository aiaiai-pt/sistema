<!--
  @component WidgetGrid

  Responsive dashboard layout for the citizen portal's `landing` /
  information-portal pages, where blocks vary in weight — a hero stat, a list of
  recent consultations, a map, a voting panel. Where CardGrid lays out equal
  cards, WidgetGrid is a column grid whose children may declare a span, so a
  feature widget can sit beside two narrow ones.

  Collapses to one column on small screens (every widget full-width), goes to
  two at tablet, and to `columns` at desktop. Children opt into width via the
  span helper classes (applied to the direct child, e.g. a `<Card>` or
  `<section>`):

   - `widget-span-2`  — span two columns from tablet up
   - `widget-span-full` — span the full row at every breakpoint

  Layout only — it sets no landmark and imposes no semantics; the page supplies
  headings and regions.

  @example
  <WidgetGrid columns="3">
    <section class="widget-span-2"><Hero ... /></section>
    <Card>…</Card>
    <Card class="widget-span-full">…</Card>
  </WidgetGrid>
-->
<script>
  let {
    /** @type {'2' | '3' | '4'} Column count at the desktop breakpoint. */
    columns = "3",
    /** @type {string} */
    class: className = "",
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();
</script>

<div class="widget-grid widget-grid-{columns} {className}" {...rest}>
  {#if children}{@render children()}{/if}
</div>

<style>
  .widget-grid {
    display: grid;
    gap: var(--grid-gutter);
    grid-template-columns: 1fr;
    align-items: start;
  }

  /* Keep widgets from blowing out their track. */
  .widget-grid > :global(*) {
    min-width: 0;
  }

  /* ─── Tablet: two columns, span helpers come alive ─── */
  @media (min-width: 768px) {
    .widget-grid-2,
    .widget-grid-3,
    .widget-grid-4 {
      grid-template-columns: repeat(2, 1fr);
    }
    .widget-grid > :global(.widget-span-2) {
      grid-column: span 2;
    }
  }

  /* ─── Desktop: open up to the configured column count ─── */
  @media (min-width: 1024px) {
    .widget-grid-3 {
      grid-template-columns: repeat(3, 1fr);
    }
    .widget-grid-4 {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  /* Full-width span at every breakpoint. */
  .widget-grid > :global(.widget-span-full) {
    grid-column: 1 / -1;
  }
</style>
