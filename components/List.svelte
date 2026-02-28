<!--
  @component List

  Container for sequences of items. Two variants:
  - "gap" (default) — flex column with `var(--list-gap)` between children.
  - "bordered" — outer border + border-radius + overflow hidden. Children use border-bottom dividers.

  Consumes --list-* tokens from components.css.

  @example Gap variant (default)
  <List>
    <ListItem>First item</ListItem>
    <ListItem>Second item</ListItem>
  </List>

  @example Bordered variant
  <List variant="bordered">
    <ListItem>Row one</ListItem>
    <ListItem>Row two</ListItem>
  </List>
-->
<script>
  /**
   * @typedef {'gap' | 'bordered'} Variant
   */

  let {
    /** @type {Variant} */
    variant = 'gap',
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children,
    ...rest
  } = $props();
</script>

<div class="list list-{variant} {className}" role="list" {...rest}>
  {#if children}{@render children()}{/if}
</div>

<style>
  .list {
    display: flex;
    flex-direction: column;
  }

  .list-gap {
    gap: var(--list-gap);
  }

  .list-bordered {
    border: var(--list-border);
    border-radius: var(--list-border-radius);
    overflow: hidden;
  }

  /* Bordered variant: dividers + hover on direct children */
  .list-bordered > :global([role="listitem"]) {
    border-bottom: var(--list-item-divider);
  }

  .list-bordered > :global([role="listitem"]:last-child) {
    border-bottom: none;
  }

  .list-bordered > :global([role="listitem"]:hover) {
    background: var(--list-item-bg-hover);
  }
</style>
