<!--
  @component FilterPanel

  Typed, labeled filter bar for admin/data UIs.
  Each filter renders as the appropriate widget based on its type:
  select → Select dropdown, boolean → Toggle pair, search → Combobox.

  Consumes --filter-chip-*, --filter-bar-clear-*, and --input-* tokens from components.css.

  @example
  <FilterPanel
    filters={[
      { key: 'status', label: 'Status', type: 'select', options: [
        { value: 'open', label: 'Open' },
        { value: 'closed', label: 'Closed' },
      ]},
      { key: 'active', label: 'Active', type: 'boolean' },
    ]}
    bind:value={activeFilters}
    onchange={handleFilterChange}
  />
-->
<script module>
  /**
   * @typedef {{ value: string, label: string }} FilterOption
   * @typedef {{
   *   key: string,
   *   label: string,
   *   type: 'select' | 'boolean' | 'search',
   *   options?: FilterOption[],
   *   onsearch?: (query: string) => void,
   *   searchItems?: FilterOption[],
   *   searchLoading?: boolean,
   * }} FilterFieldDef
   */
</script>

<script>
  import Combobox from './Combobox.svelte';

  let {
    /** @type {FilterFieldDef[]} */
    filters = [],
    /** @type {Record<string, any>} */
    value = $bindable({}),
    /** @type {((value: Record<string, any>) => void) | undefined} */
    onchange = undefined,
    /** @type {(() => void) | undefined} */
    onclear = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const activeCount = $derived(
    Object.values(value).filter(v => v !== undefined && v !== null && v !== '').length
  );

  /**
   * @param {string} key
   * @param {string | undefined} val
   */
  function setFilter(key, val) {
    value = { ...value, [key]: val === '' || val === undefined ? undefined : val };
    onchange?.(value);
  }

  /**
   * @param {string} key
   * @param {string} optionValue
   */
  function toggleBoolean(key, optionValue) {
    value = {
      ...value,
      [key]: value[key] === optionValue ? undefined : optionValue,
    };
    onchange?.(value);
  }

  function clearAll() {
    value = {};
    onchange?.({});
    onclear?.();
  }
</script>

{#if filters.length > 0}
<div
  class="filter-panel {className}"
  role="group"
  aria-label="Filters"
  {...rest}
>
  {#each filters as filter (filter.key)}
    <div class="filter-field">
      {#if filter.type === 'select' && filter.options}
        <label class="filter-field-label" for="filter-{filter.key}">{filter.label}</label>
        <div class="filter-select-wrap">
          <select
            id="filter-{filter.key}"
            class="filter-select filter-select-sm"
            value={value[filter.key] ?? ''}
            onchange={(e) => setFilter(filter.key, /** @type {HTMLSelectElement} */ (e.currentTarget).value)}
          >
            <option value="">All</option>
            {#each filter.options as opt (opt.value)}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
          <span class="filter-select-chevron" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </div>
      {:else if filter.type === 'boolean'}
        {@const opts = filter.options ?? [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]}
        <span class="filter-field-label">{filter.label}</span>
        <div class="filter-bool-chips">
          {#each opts as opt (opt.value)}
            {@const active = value[filter.key] === opt.value}
            <button
              class="filter-chip"
              class:filter-chip-active={active}
              aria-pressed={active}
              type="button"
              onclick={() => toggleBoolean(filter.key, opt.value)}
            >{opt.label}</button>
          {/each}
        </div>
      {:else if filter.type === 'search'}
        <Combobox
          size="sm"
          label={filter.label}
          placeholder="All"
          items={filter.searchItems ?? []}
          value={value[filter.key] ?? ''}
          onchange={(val) => setFilter(filter.key, val)}
          onsearch={filter.onsearch}
          loading={filter.searchLoading ?? false}
        />
      {/if}
    </div>
  {/each}

  {#if activeCount >= 2}
    <button
      class="filter-panel-clear"
      onclick={clearAll}
      type="button"
    >
      Clear all
    </button>
  {/if}
</div>
{/if}

<style>
  .filter-panel {
    display: flex;
    align-items: flex-end;
    gap: var(--space-md);
    flex-wrap: wrap;
  }

  .filter-select-wrap {
    position: relative;
  }

  .filter-select {
    font-family: var(--input-font);
    font-size: var(--input-font-size);
    border: var(--input-border);
    border-radius: var(--input-radius);
    background: var(--input-bg);
    color: var(--input-text);
    width: 100%;
    appearance: none;
    padding-right: var(--space-xl);
  }

  .filter-select-sm {
    height: var(--input-sm-height);
    padding: 0 var(--input-sm-padding-x);
  }

  .filter-select:focus {
    outline: none;
    border: var(--input-border-focus);
  }

  .filter-select-chevron {
    position: absolute;
    right: var(--space-sm);
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--input-placeholder);
    display: flex;
  }

  .filter-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    min-width: 140px;
    max-width: 220px;
  }

  .filter-field-label {
    font-family: var(--input-label-font);
    font-size: var(--input-label-size);
    letter-spacing: var(--input-label-tracking);
    color: var(--input-label-color);
  }

  .filter-bool-chips {
    display: flex;
    gap: var(--filter-chip-gap);
  }

  /* Reuse existing filter-chip tokens */
  .filter-chip {
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
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

  .filter-panel-clear {
    all: unset;
    box-sizing: border-box;
    font-family: var(--filter-chip-font);
    font-size: var(--filter-chip-size);
    letter-spacing: var(--filter-chip-tracking);
    color: var(--filter-bar-clear-color);
    cursor: pointer;
    white-space: nowrap;
    padding-bottom: var(--space-xs);
    transition: color var(--filter-chip-transition);
  }

  .filter-panel-clear:hover {
    color: var(--filter-bar-clear-color-hover);
  }

  .filter-panel-clear:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    border-radius: var(--radius-sm);
  }

  @media (max-width: 640px) {
    .filter-panel {
      flex-wrap: nowrap;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .filter-panel::-webkit-scrollbar {
      display: none;
    }

    .filter-field {
      flex-shrink: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .filter-chip,
    .filter-panel-clear {
      transition: none;
    }
  }
</style>
