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

  @example Collapsed with abbreviation (no icon)
  <SidebarItem href="/cases" abbr="C" label="Cases">
    Cases
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
    href = undefined,
    /** @type {string | number | undefined} */
    badge = undefined,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    icon = undefined,
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    /** Short text shown when collapsed and no icon is given (e.g. the
     *  first letter of the entry). The component cannot read text out of
     *  the `children` snippet, so the consumer supplies it. If absent and
     *  there is no icon, nothing is rendered when collapsed. */
    abbr = undefined,
    /** Full accessible name used as `aria-label` and `title` when
     *  collapsed. When expanded, the visible children serve as the name
     *  and no `aria-label` is added. A consumer passing `abbr` should
     *  pass `label` so the collapsed abbreviation has a full name. */
    label = undefined,
    ...rest
  } = $props();

  const sidebar = getContext('aiaiai-sidebar');
  const isCollapsed = $derived(sidebar?.collapsed ?? false);

  /** Whether to show the abbreviation: collapsed, no icon, abbr provided. */
  const showAbbr = $derived(isCollapsed && !icon && !!abbr);
</script>

{#if href && !disabled}
  <a
    {href}
    class="nav-item {className}"
    class:nav-item-active={active}
    aria-current={active ? 'page' : undefined}
    aria-label={isCollapsed && label ? label : undefined}
    title={isCollapsed && label ? label : undefined}
    {...rest}
  >
    {#if icon}<span class="nav-icon-wrap">{@render icon()}</span>{/if}
    {#if showAbbr}<span class="nav-abbr" aria-hidden="true">{abbr}</span>{/if}
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
    aria-label={isCollapsed && label ? label : undefined}
    title={isCollapsed && label ? label : undefined}
    {...rest}
  >
    {#if icon}<span class="nav-icon-wrap">{@render icon()}</span>{/if}
    {#if showAbbr}<span class="nav-abbr" aria-hidden="true">{abbr}</span>{/if}
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
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
  }

  .nav-icon-wrap :global(svg) {
    width: 100%;
    height: 100%;
  }

  /* The abbreviation box matches the icon-wrap size so a column of
     letters aligns with a column of icons. */
  .nav-abbr {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
    font-family: var(--nav-item-font);
    font-size: var(--nav-item-font-size);
    font-weight: var(--raw-font-weight-semibold);
    line-height: 1;
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
