<!--
  @component MenuSeparator

  A thin visual divider between groups of MenuItems.
  Consumes --menu-separator-* tokens from components.css.

  @example
  <Menu bind:open {anchor}>
    <MenuItem>Edit</MenuItem>
    <MenuSeparator />
    <MenuItem variant="destructive">Delete</MenuItem>
  </Menu>
-->
<script>
  let {
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();
</script>

<div
  role="separator"
  class="menu-separator {className}"
  {...rest}
></div>

<style>
  .menu-separator {
    height: 1px;
    background: var(--menu-separator-color);
    margin: var(--menu-separator-spacing) 0;
  }
</style>
