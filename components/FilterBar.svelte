<!--
  @component FilterBar

  Horizontal bar of filter chips with active-filter state and clear-all action.
  Accepts a declarative config of filters or renders children directly.
  Consumes --filter-chip-* and --filter-bar-* tokens from components.css.

  @example Declarative (common case)
  <FilterBar
    filters={[
      { key: 'status', label: 'Status', type: 'toggle', options: [
        { value: 'active', label: 'Active' },
        { value: 'draft', label: 'Draft' },
        { value: 'error', label: 'Error' },
      ]},
    ]}
    bind:value={activeFilters}
    onchange={handleFilterChange}
  />

  @example Composable (custom rendering)
  <FilterBar bind:value={activeFilters} onchange={handleFilterChange}>
    {#snippet children(toggle, isActive)}
      <FilterBar.Chip active={isActive('status', 'active')} onclick={() => toggle('status', 'active')}>
        Active
      </FilterBar.Chip>
    {/snippet}
  </FilterBar>
-->
<script module>
  /**
   * @typedef {{ value: string, label: string, icon?: import('svelte').Component }} FilterOption
   * @typedef {{ key: string, label: string, type: 'toggle' | 'select' | 'multi-select', options?: FilterOption[], defaultValue?: any }} FilterDef
   */
</script>

<script>
  let {
    /** @type {FilterDef[]} Declarative filter definitions */
    filters = [],
    /** @type {Record<string, any>} Active filter values (bindable) */
    value = $bindable({}),
    /** @type {((value: Record<string, any>) => void) | undefined} Fires when any filter changes */
    onchange = undefined,
    /** @type {(() => void) | undefined} Fires when "Clear all" is clicked */
    onclear = undefined,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();

  const activeCount = $derived(
    Object.values(value).filter(v => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null && v !== '';
    }).length
  );

  const showClearAll = $derived(activeCount >= 2);

  /**
   * Toggle a filter value
   * @param {string} key
   * @param {string} optionValue
   */
  function toggle(key, optionValue) {
    const filter = filters.find(f => f.key === key);
    if (!filter) return;

    if (filter.type === 'multi-select') {
      const current = Array.isArray(value[key]) ? [...value[key]] : [];
      const idx = current.indexOf(optionValue);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        current.push(optionValue);
      }
      value = { ...value, [key]: current.length > 0 ? current : undefined };
    } else {
      // toggle: same value = deactivate
      value = {
        ...value,
        [key]: value[key] === optionValue ? undefined : optionValue,
      };
    }

    onchange?.(value);
  }

  /**
   * Check if a filter option is active
   * @param {string} key
   * @param {string} optionValue
   * @returns {boolean}
   */
  function isActive(key, optionValue) {
    const v = value[key];
    if (Array.isArray(v)) return v.includes(optionValue);
    return v === optionValue;
  }

  function clearAll() {
    value = {};
    onchange?.({});
    onclear?.();
  }

</script>

<div
  class="filter-bar {className}"
  role="group"
  aria-label="Filters"
  {...rest}
>
  {#if children}
    {@render children(toggle, isActive)}
  {:else}
    <div class="filter-bar-chips">
      {#each filters as filter}
        {#if filter.options}
          {#each filter.options as option}
            {@const active = isActive(filter.key, option.value)}
            <button
              class="filter-chip"
              class:filter-chip-active={active}
              onclick={() => toggle(filter.key, option.value)}
              aria-pressed={active}
              type="button"
            >
              {option.label}
            </button>
          {/each}
        {/if}
      {/each}
    </div>

    {#if showClearAll}
      <button
        class="filter-bar-clear"
        onclick={clearAll}
        type="button"
      >
        Clear all
      </button>
    {/if}
  {/if}
</div>

<style>
  .filter-bar {
    display: flex;
    align-items: center;
    gap: var(--filter-bar-gap);
    flex-wrap: wrap;
  }

  .filter-bar-chips {
    display: flex;
    align-items: center;
    gap: var(--filter-chip-gap);
    flex-wrap: wrap;
  }

  /* ─── Chip ─── */
  .filter-chip {
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    height: var(--filter-chip-height);
    padding: var(--filter-chip-padding);
    font-family: var(--filter-chip-font);
    font-size: var(--filter-chip-size);
    letter-spacing: var(--filter-chip-tracking);
    color: var(--filter-chip-color);
    background: var(--filter-chip-bg);
    border: var(--filter-chip-border);
    border-radius: var(--filter-chip-radius);
    cursor: pointer;
    white-space: nowrap;
    transition: all var(--filter-chip-transition);
    user-select: none;
  }

  .filter-chip:hover {
    background: var(--filter-chip-bg-hover);
  }

  .filter-chip:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .filter-chip-active {
    background: var(--filter-chip-bg-active);
    color: var(--filter-chip-color-active);
    border: var(--filter-chip-border-active);
  }

  .filter-chip-active:hover {
    background: var(--filter-chip-bg-active);
  }

  /* ─── Clear all ─── */
  .filter-bar-clear {
    all: unset;
    box-sizing: border-box;
    font-family: var(--filter-chip-font);
    font-size: var(--filter-chip-size);
    letter-spacing: var(--filter-chip-tracking);
    color: var(--filter-bar-clear-color);
    cursor: pointer;
    white-space: nowrap;
    transition: color var(--filter-chip-transition);
  }

  .filter-bar-clear:hover {
    color: var(--filter-bar-clear-color-hover);
  }

  .filter-bar-clear:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    border-radius: var(--radius-sm);
  }

  /* ─── Mobile: horizontal scroll ─── */
  @media (max-width: 640px) {
    .filter-bar {
      flex-wrap: nowrap;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .filter-bar::-webkit-scrollbar {
      display: none;
    }

    .filter-bar-chips {
      flex-wrap: nowrap;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .filter-chip,
    .filter-bar-clear {
      transition: none;
    }
  }
</style>
