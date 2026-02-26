<!--
  @component SidebarSection

  Section header for grouping sidebar items.
  Hidden when Sidebar is collapsed (reads context).
  Consumes --nav-section-* tokens from components.css.

  @example
  <SidebarSection title="WORKSPACE" />
-->
<script>
  import { getContext } from 'svelte';

  let {
    /** @type {string} */
    title,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const sidebar = getContext('aiaiai-sidebar');
  const isCollapsed = $derived(sidebar?.collapsed ?? false);
</script>

{#if !isCollapsed}
  <span class="nav-section {className}" {...rest}>{title}</span>
{/if}

<style>
  .nav-section {
    font-family: var(--nav-section-font);
    font-size: var(--nav-section-size);
    letter-spacing: var(--nav-section-tracking);
    color: var(--nav-section-color);
    padding: var(--space-sm) var(--space-sm) var(--space-xs);
    margin-top: var(--nav-section-margin-top);
  }

  .nav-section:first-child {
    margin-top: 0;
  }
</style>
