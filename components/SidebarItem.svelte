<!--
  @component SidebarItem

  Navigation item for use inside Sidebar.
  Reads collapsed state from Sidebar context — hides label and badge when collapsed.
  Consumes --nav-item-* tokens from components.css.

  @example Button
  <SidebarItem active onclick={() => navigate('/')}>
    {#snippet icon()}<svg>...</svg>{/snippet}
    DASHBOARD
  </SidebarItem>

  @example Link
  <SidebarItem href="/settings">
    {#snippet icon()}<svg>...</svg>{/snippet}
    SETTINGS
  </SidebarItem>

  @example With badge
  <SidebarItem href="/inbox" badge={3}>
    {#snippet icon()}<svg>...</svg>{/snippet}
    INBOX
  </SidebarItem>
-->
<script>
  import { getContext } from 'svelte';

  let {
    /** @type {boolean} */
    active = false,
    /** @type {boolean} */
    disabled = false,
    /** @type {string | undefined} */
    href,
    /** @type {string | number | undefined} */
    badge,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    icon,
    /** @type {import('svelte').Snippet | undefined} */
    children,
    ...rest
  } = $props();

  const sidebar = getContext('aiaiai-sidebar');
  const isCollapsed = $derived(sidebar?.collapsed ?? false);
</script>

{#if href && !disabled}
  <a
    {href}
    class="nav-item {className}"
    class:nav-item-active={active}
    aria-current={active ? 'page' : undefined}
    {...rest}
  >
    {#if icon}<span class="nav-icon-wrap">{@render icon()}</span>{/if}
    {#if !isCollapsed}
      {#if children}<span class="nav-item-label">{@render children()}</span>{/if}
      {#if badge != null}<span class="nav-badge">{badge}</span>{/if}
    {/if}
  </a>
{:else}
  <button
    class="nav-item {className}"
    class:nav-item-active={active}
    class:nav-item-disabled={disabled}
    {disabled}
    aria-current={active ? 'page' : undefined}
    {...rest}
  >
    {#if icon}<span class="nav-icon-wrap">{@render icon()}</span>{/if}
    {#if !isCollapsed}
      {#if children}<span class="nav-item-label">{@render children()}</span>{/if}
      {#if badge != null}<span class="nav-badge">{badge}</span>{/if}
    {/if}
  </button>
{/if}

<style>
  .nav-item {
    all: unset;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    height: var(--nav-item-height);
    padding: 0 var(--nav-item-padding-x);
    border-radius: var(--nav-item-radius);
    font-family: var(--nav-item-font);
    font-size: var(--nav-item-font-size);
    letter-spacing: var(--nav-item-tracking);
    color: var(--nav-item-color);
    cursor: pointer;
    transition: all var(--nav-item-transition);
    text-decoration: none;
    box-sizing: border-box;
  }

  .nav-item:hover {
    color: var(--nav-item-color-hover);
    background: var(--nav-item-bg-hover);
  }

  .nav-item:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .nav-item-active {
    color: var(--nav-item-color-active);
    background: var(--nav-item-bg-active);
  }

  .nav-item-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .nav-icon-wrap {
    display: flex;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }

  .nav-icon-wrap :global(svg) {
    width: 100%;
    height: 100%;
  }

  .nav-item-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-badge {
    font-family: var(--type-data-font);
    font-size: var(--type-caption-size);
    background: var(--color-accent);
    color: var(--color-text-on-accent);
    border-radius: var(--radius-pill);
    padding: 0 var(--space-xs);
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
  }
</style>
