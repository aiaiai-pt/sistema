<!--
  @component Breadcrumb

  Navigation breadcrumb trail. Items with `href` are links; the last item
  (current page, no href) is rendered as plain bold text.

  @example
  <Breadcrumb items={[
    { label: 'Home', href: '/' },
    { label: 'Settings', href: '/settings' },
    { label: 'Profile' },
  ]} />

  @example With truncation
  <Breadcrumb
    items={deepPath}
    max_items={4}
  />
-->
<script>
  /**
   * @typedef {{ label: string, href?: string }} BreadcrumbItem
   */

  let {
    /** @type {BreadcrumbItem[]} */
    items = [],
    /** @type {number | undefined} */
    max_items = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  /**
   * Truncate items when max_items is set.
   * Keeps first item + ellipsis + last (max_items - 2) items.
   * Minimum effective max_items is 3 (first + ellipsis + last).
   * @type {(BreadcrumbItem | null)[]}
   */
  const visible_items = $derived(
    !max_items || items.length <= max_items
      ? items
      : (() => {
          const keep_end = Math.max(1, max_items - 2);
          /** @type {(BreadcrumbItem | null)[]} */
          const result = [items[0], null];
          for (let i = items.length - keep_end; i < items.length; i++) {
            result.push(items[i]);
          }
          return result;
        })()
  );
</script>

<nav class="breadcrumb {className}" aria-label="Breadcrumb" {...rest}>
  <ol class="breadcrumb-list">
    {#each visible_items as item, idx}
      {#if item === null}
        <li class="breadcrumb-item" aria-hidden="true">
          <span class="breadcrumb-separator" aria-hidden="true">/</span>
          <span class="breadcrumb-ellipsis">…</span>
        </li>
      {:else}
        {#if idx > 0}
          <li class="breadcrumb-sep-item" aria-hidden="true">
            <span class="breadcrumb-separator">/</span>
          </li>
        {/if}
        <li class="breadcrumb-item">
          {#if item.href}
            <a href={item.href} class="breadcrumb-link">{item.label}</a>
          {:else}
            <span class="breadcrumb-current" aria-current="page">{item.label}</span>
          {/if}
        </li>
      {/if}
    {/each}
  </ol>
</nav>

<style>
  .breadcrumb {
    /* no outer constraints — caller controls width */
  }

  .breadcrumb-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
  }

  .breadcrumb-item {
    display: inline-flex;
    align-items: center;
  }

  .breadcrumb-sep-item {
    display: inline-flex;
    align-items: center;
  }

  .breadcrumb-separator {
    margin: 0 var(--space-xs);
    color: var(--color-text-muted);
    user-select: none;
    font-size: var(--type-body-sm-size);
  }

  .breadcrumb-link {
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: color var(--duration-instant) var(--easing-default);
  }

  .breadcrumb-link:hover {
    color: var(--color-text);
    text-decoration: underline;
  }

  .breadcrumb-link:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    border-radius: var(--radius-sm);
  }

  .breadcrumb-current {
    color: var(--color-text);
    font-weight: var(--raw-font-weight-semibold, 600);
  }

  .breadcrumb-ellipsis {
    color: var(--color-text-muted);
    user-select: none;
  }
</style>
