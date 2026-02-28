<!--
  @component BottomNav

  Mobile bottom navigation bar.
  Consumes --nav-bottom-* tokens from components.css.

  @example
  <BottomNav>
    <BottomNavItem active label="Home">
      {#snippet icon()}<svg>...</svg>{/snippet}
    </BottomNavItem>
  </BottomNav>
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

<nav class="bottom-nav {className}" {...rest}>
  {#if children}{@render children()}{/if}
</nav>

<style>
  .bottom-nav {
    height: var(--nav-bottom-height);
    background: var(--nav-bottom-bg);
    border-top: var(--nav-bottom-border-top);
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
</style>
