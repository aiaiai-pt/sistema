<!--
  @component FilterBar

  Filter controls over a feed. Two modes:

  • **Facet mode** (set `facets` and/or `searchable`) — a row of labelled
    dropdowns + an optional search box, the shape a browse/list/map surface
    uses for its declared facets. Options are supplied by the consumer (it
    owns the data source); FilterBar is presentational. A misconfigured /
    undeclared facet is surfaced LOUDLY via `error` — never a silent dead
    control. Consumes --filter-bar-* tokens.

  • **Chip mode** (default — `filters` and/or `children`) — horizontal bar of
    filter chips with active-filter state and clear-all. Consumes
    --filter-chip-* and --filter-bar-* tokens.

  @example Facet mode (browse/list/map)
  <FilterBar
    facets={[
      { key: 'status', label: 'Status', value: '', options: [
        { value: '', label: 'All' },
        { value: 'open', label: 'Open' },
      ]},
    ]}
    searchable
    searchPlaceholder="Search"
    onfacetchange={(key, value) => refetch(key, value)}
    onsearch={(term) => refetch('search', term)}
  />

  @example Chip mode (declarative)
  <FilterBar
    filters={[
      { key: 'status', label: 'Status', type: 'toggle', options: [
        { value: 'active', label: 'Active' },
        { value: 'draft', label: 'Draft' },
      ]},
    ]}
    bind:value={activeFilters}
    onchange={handleFilterChange}
  />
-->
<script module>
  /**
   * @typedef {{ value: string, label: string, icon?: import('svelte').Component }} FilterOption
   * @typedef {{ key: string, label: string, type: 'toggle' | 'select' | 'multi-select', options?: FilterOption[], defaultValue?: any }} FilterDef
   * @typedef {{ value: string, label: string, disabled?: boolean }} FacetOption
   * @typedef {{ key: string, label: string, value?: string, options: FacetOption[] }} FacetControl
   */
</script>

<script>
  import Select from './Select.svelte';
  import SearchInput from './SearchInput.svelte';
  import Alert from './Alert.svelte';

  let {
    // ─── Facet mode ───
    /** @type {FacetControl[]} Labelled dropdown controls (facet mode). */
    facets = [],
    /** @type {boolean} Render a search box (facet mode). */
    searchable = false,
    /** @type {string} */
    searchPlaceholder = 'Search',
    /** @type {string} */
    searchValue = '',
    /** @type {boolean} Spinner on the search box / aria-busy on the bar. */
    busy = false,
    /** @type {string | undefined} Loud-fail message for misconfigured facets. */
    error = undefined,
    /** @type {((key: string, value: string) => void) | undefined} */
    onfacetchange = undefined,
    /** @type {((value: string) => void) | undefined} */
    onsearch = undefined,
    /** @type {(() => void) | undefined} Fires when the search box is cleared. */
    onsearchclear = undefined,

    // ─── Chip mode ───
    /** @type {FilterDef[]} Declarative chip definitions */
    filters = [],
    /** @type {Record<string, any>} Active chip values (bindable) */
    value = $bindable({}),
    /** @type {((value: Record<string, any>) => void) | undefined} Fires when any chip changes */
    onchange = undefined,
    /** @type {(() => void) | undefined} Fires when "Clear all" is clicked */
    onclear = undefined,

    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();

  // Facet mode wins whenever facet controls or search are configured; chip
  // mode is the default (back-compat with the original FilterBar contract).
  const isFacetMode = $derived(facets.length > 0 || searchable);

  const activeCount = $derived(
    Object.values(value).filter(v => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null && v !== '';
    }).length
  );

  const showClearAll = $derived(activeCount >= 2);

  /**
   * Toggle a filter value (chip mode)
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
   * Check if a filter option is active (chip mode)
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

{#if isFacetMode}
  <!-- Loud-fail (never a silent dead control): a configured facet the surface
       does not declare can't filter — surface it as an operator fix. -->
  {#if error}
    <Alert variant="error" data-testid="filter-bar-error" class="filter-bar-alert">
      {error}
    </Alert>
  {/if}
  <div
    class="filter-bar filter-bar-facets {className}"
    role="group"
    aria-label="Filters"
    aria-busy={busy}
    {...rest}
  >
    {#if searchable}
      <SearchInput
        placeholder={searchPlaceholder}
        value={searchValue}
        loading={busy}
        onsearch={(v) => onsearch?.((v ?? '').trim())}
        onclear={() => onsearchclear?.()}
      />
    {/if}
    {#each facets as facet (facet.key)}
      <Select
        label={facet.label}
        options={facet.options}
        value={facet.value ?? ''}
        onchange={(v) => onfacetchange?.(facet.key, v)}
      />
    {/each}
  </div>
{:else}
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
{/if}

<style>
  .filter-bar {
    display: flex;
    align-items: center;
    gap: var(--filter-bar-gap);
    flex-wrap: wrap;
  }

  /* Facet mode: labelled dropdowns + search align to their baselines. */
  .filter-bar-facets {
    align-items: flex-end;
    gap: var(--space-sm);
  }

  .filter-bar-alert {
    margin-bottom: var(--space-sm);
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
