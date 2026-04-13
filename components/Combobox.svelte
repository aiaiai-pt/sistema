<!--
  @component Combobox

  Searchable select composing Input + Popover + filtered list.
  Supports grouped items, description text, and highlighted matches.
  Consumes --combobox-* tokens from components.css.

  @example Basic
  <Combobox
    label="FUNCTION"
    items={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]}
    bind:value={selected}
  />

  @example With groups and descriptions
  <Combobox
    label="NODE TYPE"
    placeholder="Search node types..."
    items={[
      { value: 'llm', label: 'LLM', group: 'Processing', description: 'AI model call' },
      { value: 'fn', label: 'Function', group: 'Integration', description: 'HTTP endpoint' },
    ]}
    bind:value={selected}
  />
-->
<script module>
  let _comboboxUid = 0;
</script>

<script>
  /**
   * @typedef {{ value: string, label: string, group?: string, description?: string }} ComboboxItem
   */

  import Popover from './Popover.svelte';

  let {
    /** @type {ComboboxItem[]} */
    items = [],
    /** @type {string} */
    value = $bindable(''),
    /** @type {string | undefined} */
    label = undefined,
    /** @type {string | undefined} */
    placeholder = 'Search...',
    /** @type {boolean} */
    disabled = false,
    /** @type {string | undefined} */
    error = undefined,
    /** @type {string | undefined} */
    help = undefined,
    /** @type {string} */
    size = 'md',
    /** @type {((value: string) => void) | undefined} */
    onchange = undefined,
    /** @type {((query: string) => void) | undefined} — async search; when set, disables internal filtering */
    onsearch = undefined,
    /** @type {boolean} */
    loading = false,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const comboboxId = `combobox-${_comboboxUid++}`;
  const listboxId = `${comboboxId}-listbox`;

  /** @type {HTMLInputElement | undefined} */
  let inputEl;
  /** @type {HTMLElement | undefined} */
  let anchorEl = $state();

  let open = $state(false);
  let query = $state('');
  let activeIndex = $state(-1);

  const hintId = $derived(`${comboboxId}-hint`);
  const hasHint = $derived(!!error || !!help);

  // Selected item label for display
  const selectedItem = $derived(items.find(i => i.value === value));

  // Debounced onsearch dispatch
  let _searchTimer = 0;
  $effect(() => {
    // Subscribe to query changes; only fire if onsearch is set
    const q = query;
    if (!onsearch) return;
    clearTimeout(_searchTimer);
    if (!q) return;
    _searchTimer = /** @type {any} */ (setTimeout(() => onsearch(q), 300));
    return () => clearTimeout(_searchTimer);
  });

  // Filter items by query — skip when onsearch is set (parent controls items)
  const filtered = $derived.by(() => {
    if (onsearch) return items;
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(i =>
      i.label.toLowerCase().includes(q) ||
      (i.description && i.description.toLowerCase().includes(q))
    );
  });

  // Group filtered items
  const grouped = $derived.by(() => {
    /** @type {Map<string, ComboboxItem[]>} */
    const groups = new Map();
    for (const item of filtered) {
      const key = item.group ?? '';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)?.push(item);
    }
    return groups;
  });

  // Precompute index map for O(1) lookup in grouped render loop
  const filteredIndexMap = $derived(new Map(filtered.map((item, i) => [item, i])));

  /**
   * @param {ComboboxItem} item
   */
  function selectItem(item) {
    value = item.value;
    query = '';
    open = false;
    onchange?.(item.value);
    inputEl?.focus();
  }

  /** @param {KeyboardEvent} e */
  function handleKeydown(e) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        open = true;
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        activeIndex = (activeIndex + 1) % filtered.length;
        scrollActiveIntoView();
        break;
      case 'ArrowUp':
        e.preventDefault();
        activeIndex = activeIndex <= 0 ? filtered.length - 1 : activeIndex - 1;
        scrollActiveIntoView();
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          selectItem(filtered[activeIndex]);
        }
        break;
      case 'Escape':
        // Popover handles Escape close
        break;
      case 'Tab':
        open = false;
        break;
    }
  }

  function scrollActiveIntoView() {
    requestAnimationFrame(() => {
      const el = document.getElementById(`${comboboxId}-option-${activeIndex}`);
      el?.scrollIntoView({ block: 'nearest' });
    });
  }

  function handleInput() {
    if (!open) open = true;
    activeIndex = -1;
  }

  function handleFocus() {
    if (!disabled) open = true;
  }

  function handlePopoverClose() {
    query = '';
    activeIndex = -1;
  }

  /**
   * Highlight matching text in a label
   * @param {string} text
   * @param {string} q
   * @returns {{ before: string, match: string, after: string } | null}
   */
  function getHighlight(text, q) {
    if (!q) return null;
    const lower = text.toLowerCase();
    const idx = lower.indexOf(q.toLowerCase());
    if (idx === -1) return null;
    return {
      before: text.slice(0, idx),
      match: text.slice(idx, idx + q.length),
      after: text.slice(idx + q.length),
    };
  }
</script>

<div class="combobox {className}" bind:this={anchorEl} {...rest}>
  {#if label}
    <label class="combobox-label" for={comboboxId}>{label}</label>
  {/if}

  <input
    bind:this={inputEl}
    id={comboboxId}
    type="text"
    class="combobox-input combobox-input-{size}"
    class:combobox-input-error={!!error}
    role="combobox"
    aria-expanded={open}
    aria-controls={listboxId}
    aria-activedescendant={activeIndex >= 0 ? `${comboboxId}-option-${activeIndex}` : undefined}
    aria-invalid={error ? true : undefined}
    aria-describedby={hasHint ? hintId : undefined}
    {placeholder}
    {disabled}
    value={open ? query : (selectedItem?.label ?? '')}
    oninput={(e) => { query = /** @type {HTMLInputElement} */ (e.currentTarget).value; handleInput(); }}
    onkeydown={handleKeydown}
    onfocus={handleFocus}
    autocomplete="off"
  />

  {#if error}
    <span id={hintId} class="combobox-error-text" role="alert">{error}</span>
  {:else if help}
    <span id={hintId} class="combobox-help">{help}</span>
  {/if}

  <Popover bind:open anchor={anchorEl} matchWidth onclose={handlePopoverClose}>
    <ul
      id={listboxId}
      class="combobox-list"
      role="listbox"
      aria-label={label ?? 'Options'}
    >
      {#if loading}
        <li class="combobox-empty" role="option" aria-selected="false" aria-disabled="true">
          Searching…
        </li>
      {:else if filtered.length === 0}
        <li class="combobox-empty" role="option" aria-selected="false" aria-disabled="true">
          No results found
        </li>
      {:else}
        {#each [...grouped.entries()] as [group, groupItems]}
          {#if group}
            <li class="combobox-group" role="presentation">{group}</li>
          {/if}
          {#each groupItems as item}
            {@const idx = filteredIndexMap.get(item) ?? -1}
            {@const isActive = idx === activeIndex}
            {@const isSelected = item.value === value}
            {@const hl = getHighlight(item.label, query)}
            <li
              id="{comboboxId}-option-{idx}"
              class="combobox-item"
              class:combobox-item-active={isActive}
              class:combobox-item-selected={isSelected}
              role="option"
              aria-selected={isSelected}
              onmousedown={(e) => { e.preventDefault(); selectItem(item); }}
              onmouseenter={() => { activeIndex = idx; }}
            >
              <span class="combobox-item-label">
                {#if hl}
                  {hl.before}<mark class="combobox-highlight">{hl.match}</mark>{hl.after}
                {:else}
                  {item.label}
                {/if}
              </span>
              {#if item.description}
                <span class="combobox-item-description">{item.description}</span>
              {/if}
            </li>
          {/each}
        {/each}
      {/if}
    </ul>
  </Popover>
</div>

<style>
  .combobox {
    display: flex;
    flex-direction: column;
    gap: var(--input-label-gap);
    width: 100%;
    position: relative;
  }

  .combobox-label {
    font-family: var(--input-label-font);
    font-size: var(--input-label-size);
    letter-spacing: var(--input-label-tracking);
    color: var(--input-label-color);
  }

  .combobox-input {
    font-family: var(--input-font);
    font-size: var(--input-font-size);
    border: var(--input-border);
    border-radius: var(--input-radius);
    background: var(--input-bg);
    color: var(--input-text);
    transition: border var(--input-transition);
    width: 100%;
  }

  .combobox-input-sm { height: var(--input-sm-height); padding: 0 var(--input-sm-padding-x); }
  .combobox-input-md { height: var(--input-md-height); padding: 0 var(--input-md-padding-x); }
  .combobox-input-lg { height: var(--input-lg-height); padding: 0 var(--input-lg-padding-x); }

  .combobox-input::placeholder { color: var(--input-placeholder); }
  .combobox-input:focus { outline: none; border: var(--input-border-focus); }
  .combobox-input:disabled { opacity: 0.5; cursor: not-allowed; }
  .combobox-input-error { border-color: var(--input-error-border-color); }

  .combobox-help {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-help-color);
  }

  .combobox-error-text {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-error-text);
  }

  /* ─── Dropdown list ─── */
  .combobox-list {
    list-style: none;
    margin: 0;
    padding: var(--space-xs) 0;
    max-height: var(--combobox-list-max-height);
    overflow-y: auto;
  }

  .combobox-group {
    font-family: var(--combobox-group-font);
    font-size: var(--combobox-group-size);
    letter-spacing: var(--combobox-group-tracking);
    color: var(--combobox-group-color);
    padding: var(--combobox-group-padding);
    text-transform: uppercase;
  }

  .combobox-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    padding: var(--combobox-item-padding);
    border-radius: var(--combobox-item-radius);
    margin: 0 var(--space-xs);
    cursor: pointer;
    font-family: var(--input-font);
    font-size: var(--input-font-size);
    color: var(--color-text);
  }

  .combobox-item-active,
  .combobox-item:hover {
    background: var(--combobox-item-hover-bg);
  }

  .combobox-item-selected {
    background: var(--combobox-item-active-bg);
    color: var(--combobox-item-active-color);
  }

  .combobox-item-selected.combobox-item-active {
    background: var(--combobox-item-active-bg);
  }

  .combobox-item-label {
    line-height: 1.4;
  }

  .combobox-item-description {
    font-family: var(--combobox-description-font);
    font-size: var(--combobox-description-size);
    color: var(--combobox-description-color);
  }

  .combobox-highlight {
    background: transparent;
    color: var(--combobox-highlight-color);
    font-weight: var(--raw-font-weight-semibold);
  }

  .combobox-empty {
    padding: var(--combobox-item-padding);
    margin: 0 var(--space-xs);
    color: var(--combobox-empty-color);
    font-family: var(--input-font);
    font-size: var(--input-font-size);
    font-style: italic;
  }

  @media (prefers-reduced-motion: reduce) {
    .combobox-input {
      transition: none;
    }
  }
</style>
