<!--
  @component Sidebar

  Vertical navigation container with collapsible support.
  Children (SidebarItem, SidebarSection) read collapsed state via context.
  Consumes --nav-sidebar-* tokens from components.css.

  @example
  <Sidebar bind:collapsed>
    {#snippet header()}
      <span class="type-label">AIAIAI</span>
    {/snippet}
    <SidebarSection title="WORKSPACE" />
    <SidebarItem href="/dashboard" active>
      {#snippet icon()}<DashboardIcon />{/snippet}
      DASHBOARD
    </SidebarItem>
  </Sidebar>
-->
<script>
  import { setContext } from 'svelte';

  let {
    /** @type {boolean} */
    collapsed = $bindable(false),
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    header = undefined,
    /** @type {import('svelte').Snippet | undefined} */
    footer = undefined,
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();

  setContext('aiaiai-sidebar', {
    get collapsed() { return collapsed; }
  });
</script>

<aside
  class="sidebar {className}"
  class:sidebar-collapsed={collapsed}
  {...rest}
>
  {#if header}
    <div class="sidebar-header">
      {@render header()}
    </div>
  {/if}

  <nav class="sidebar-nav">
    {#if children}{@render children()}{/if}
  </nav>

  {#if footer}
    <div class="sidebar-footer">
      {@render footer()}
    </div>
  {/if}
</aside>

<style>
  .sidebar {
    width: var(--nav-sidebar-width);
    min-width: var(--nav-sidebar-width);
    background: var(--nav-sidebar-bg);
    border-right: var(--nav-sidebar-border);
    padding: var(--nav-sidebar-padding);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    transition: width var(--duration-slow) var(--easing-default),
                min-width var(--duration-slow) var(--easing-default);
  }

  .sidebar-collapsed {
    width: var(--nav-sidebar-width-collapsed);
    min-width: var(--nav-sidebar-width-collapsed);
  }

  .sidebar-header {
    display: flex;
    align-items: baseline;
    gap: var(--space-sm);
    padding: var(--space-sm);
    border-bottom: var(--elevation-border);
    padding-bottom: var(--space-md);
    flex-shrink: 0;
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: var(--border-width);
    flex: 1;
    overflow-y: auto;
  }

  .sidebar-footer {
    flex-shrink: 0;
    border-top: var(--elevation-border);
    padding-top: var(--space-sm);
  }
</style>
