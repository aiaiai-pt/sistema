<!--
  @component Pagination

  Cursor-based and offset-based pagination with page size selector.
  Self-contained nav controls with correct icon placement (chevron
  leading for PREV, trailing for NEXT).

  @example Cursor mode (default)
  <Pagination
    has_next={page.has_next}
    has_prev={page.has_prev}
    on_next={() => loadNext()}
    on_prev={() => loadPrev()}
    total_items={page.count}
    page_size={25}
  />

  @example Offset mode
  <Pagination
    mode="offset"
    current_page={page}
    total_pages={totalPages}
    total_items={totalItems}
    on_page_change={(p) => setPage(p)}
    page_sizes={[10, 25, 50, 100]}
    on_page_size_change={(s) => setSize(s)}
  />
-->
<script>
  import Select from './Select.svelte';

  let {
    /** @type {'cursor' | 'offset'} */
    mode = 'cursor',

    /* Cursor mode */
    /** @type {boolean} */
    has_next = false,
    /** @type {boolean} */
    has_prev = false,
    /** @type {(() => void) | undefined} */
    on_next = undefined,
    /** @type {(() => void) | undefined} */
    on_prev = undefined,

    /* Offset mode */
    /** @type {number} */
    current_page = 1,
    /** @type {number | undefined} */
    total_pages = undefined,
    /** @type {number | undefined} */
    total_items = undefined,
    /** @type {((page: number) => void) | undefined} */
    on_page_change = undefined,

    /* Shared */
    /** @type {number} */
    page_size = 25,
    /** @type {number[] | undefined} */
    page_sizes = undefined,
    /** @type {((size: number) => void) | undefined} */
    on_page_size_change = undefined,

    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const page_size_options = $derived(
    (page_sizes ?? []).map((s) => ({ value: String(s), label: String(s) }))
  );

  const page_size_value = $derived(String(page_size));

  const page_numbers = $derived(
    mode === 'offset' && total_pages
      ? build_pages(current_page, total_pages)
      : /** @type {(number | null)[]} */ ([])
  );

  const item_range_text = $derived(
    total_items === undefined
      ? ''
      : mode === 'cursor'
        ? `${total_items.toLocaleString()} total`
        : (() => {
            const start = (current_page - 1) * page_size + 1;
            const end = Math.min(current_page * page_size, total_items);
            return start > total_items
              ? `${total_items.toLocaleString()} total`
              : `${start}–${end} of ${total_items.toLocaleString()}`;
          })()
  );

  /**
   * @param {number} current
   * @param {number} total
   * @returns {(number | null)[]}
   */
  function build_pages(current, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = /** @type {(number | null)[]} */ ([]);
    pages.push(1);
    if (current > 3) pages.push(null);
    const win_start = Math.max(2, current - 1);
    const win_end = Math.min(total - 1, current + 1);
    for (let p = win_start; p <= win_end; p++) pages.push(p);
    if (current < total - 2) pages.push(null);
    pages.push(total);
    return pages;
  }
</script>

{#snippet chevronLeft()}
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
{/snippet}

{#snippet chevronRight()}
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
{/snippet}

<div class="pagination {className}" {...rest}>
  {#if page_sizes && page_sizes.length > 0}
    <div class="pagination-size">
      <Select
        size="sm"
        value={page_size_value}
        options={page_size_options}
        onchange={(val) => on_page_size_change?.(Number(val))}
        aria-label="Rows per page"
      />
    </div>
  {/if}

  {#if total_items !== undefined}
    <span class="pagination-info">{item_range_text}</span>
  {/if}

  <span class="pagination-spacer" aria-hidden="true"></span>

  {#if mode === 'cursor'}
    <button class="pagination-nav" disabled={!has_prev} onclick={on_prev} aria-label="Previous page">
      {@render chevronLeft()}<span>PREV</span>
    </button>
    <button class="pagination-nav" disabled={!has_next} onclick={on_next} aria-label="Next page">
      <span>NEXT</span>{@render chevronRight()}
    </button>

  {:else}
    <button class="pagination-nav" disabled={current_page <= 1} onclick={() => on_page_change?.(current_page - 1)} aria-label="Previous page">
      {@render chevronLeft()}<span>PREV</span>
    </button>

    <div class="pagination-pages">
      {#each page_numbers as p}
        {#if p === null}
          <span class="pagination-ellipsis" aria-hidden="true">…</span>
        {:else}
          <button
            type="button"
            class="pagination-page"
            class:pagination-page-active={p === current_page}
            onclick={() => on_page_change?.(/** @type {number} */ (p))}
            aria-label={`Page ${p}`}
            aria-current={p === current_page ? 'page' : undefined}
          >
            {p}
          </button>
        {/if}
      {/each}
    </div>

    <button class="pagination-nav" disabled={current_page >= (total_pages ?? current_page)} onclick={() => on_page_change?.(current_page + 1)} aria-label="Next page">
      <span>NEXT</span>{@render chevronRight()}
    </button>
  {/if}
</div>

<style>
  .pagination {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-wrap: wrap;
  }

  .pagination-size {
    width: 80px;
  }

  .pagination-info {
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  .pagination-spacer {
    flex: 1;
    min-width: var(--space-sm);
  }

  /* ─── Nav buttons (PREV / NEXT) ─── */
  .pagination-nav {
    all: unset;
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    letter-spacing: var(--type-label-tracking);
    color: var(--color-text-secondary);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: color var(--duration-instant) var(--easing-default),
                background var(--duration-instant) var(--easing-default);
  }

  .pagination-nav:hover:not(:disabled) {
    color: var(--color-text);
    background: var(--color-surface-secondary);
  }

  .pagination-nav:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .pagination-nav:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .pagination-nav svg {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
    flex-shrink: 0;
  }

  /* ─── Offset page numbers ─── */
  .pagination-pages {
    display: flex;
    align-items: center;
    gap: var(--space-2xs);
  }

  .pagination-page {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 var(--space-xs);
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    letter-spacing: var(--type-label-tracking);
    color: var(--color-text-secondary);
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background var(--duration-instant) var(--easing-default);
  }

  .pagination-page:hover:not(.pagination-page-active) {
    background: var(--color-surface-secondary);
    color: var(--color-text);
  }

  .pagination-page:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .pagination-page-active {
    background: var(--color-accent);
    color: var(--color-text-on-accent);
    cursor: default;
  }

  .pagination-ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    color: var(--color-text-muted);
    user-select: none;
  }
</style>
