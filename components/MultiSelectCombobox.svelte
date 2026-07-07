<!--
  @component MultiSelectCombobox

  Multi-value picking: removable Tag chips over a search-to-add Combobox
  (the Carbon MultiSelect / Polaris tag-combobox pattern). Presentation-only:
  the parent owns the selection list AND the async item source — the widget
  never holds the selection in its input (a single-pick replace of a
  multi-value field is impossible by construction).

  @example
  <MultiSelectCombobox
    label="INSPECTORS"
    items={searchResults}
    selected={[{ value: 'u-1', label: 'Ana Silva' }]}
    onsearch={(q) => search(q)}
    onadd={(value) => add(value)}
    onremove={(value) => remove(value)}
  />
-->
<script module>
  let _mscUid = 0;
</script>

<script>
  /**
   * @typedef {{ value: string, label: string, group?: string, description?: string }} ComboboxItem
   */

  import Combobox from './Combobox.svelte';
  import Tag from './Tag.svelte';

  let {
    /** @type {ComboboxItem[]} — the search-result pool (parent-owned; async via onsearch) */
    items = [],
    /** @type {ComboboxItem[]} — the current selection, WITH display labels */
    selected = [],
    /** @type {string | undefined} */
    label = undefined,
    /** @type {string | undefined} */
    placeholder = 'Search...',
    /** @type {boolean} */
    disabled = false,
    /** @type {boolean} */
    loading = false,
    /** @type {string | undefined} */
    error = undefined,
    /** @type {string | undefined} */
    help = undefined,
    /** @type {boolean} */
    required = false,
    /** @type {string} */
    size = 'md',
    /** @type {((value: string) => void) | undefined} — a NEW value was picked */
    onadd = undefined,
    /** @type {((value: string) => void) | undefined} — a chip was removed */
    onremove = undefined,
    /** @type {((query: string) => void) | undefined} — async search; parent owns items */
    onsearch = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const mscId = `msc-${_mscUid++}`;

  // The draft is WIDGET-internal: it exists only to drive the Combobox and is
  // cleared after every pick, so the input never displays a "selection".
  let draft = $state('');

  // An already-picked value never re-offers (no double-add by construction).
  const available = $derived(
    items.filter((item) => !selected.some((entry) => entry.value === item.value)),
  );

  /** @param {string} value */
  function handlePick(value) {
    if (value && !selected.some((entry) => entry.value === value)) {
      onadd?.(value);
    }
    draft = '';
  }
</script>

<div
  class="msc {className}"
  role="group"
  aria-labelledby={label ? `${mscId}-label` : undefined}
  {...rest}
>
  {#if label}
    <span id={`${mscId}-label`} class="msc-label"
      >{label}{required ? ' (required)' : ''}</span
    >
  {/if}

  {#if selected.length}
    <div class="msc-chips">
      {#each selected as entry (entry.value)}
        <Tag removable={!disabled} onremove={() => onremove?.(entry.value)}>
          {entry.label}
        </Tag>
      {/each}
    </div>
  {/if}

  <Combobox
    items={available}
    bind:value={draft}
    {placeholder}
    {disabled}
    {loading}
    {error}
    {help}
    {size}
    onsearch={onsearch}
    onchange={handlePick}
  />
</div>

<style>
  .msc {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    width: 100%;
  }

  .msc-label {
    font-family: var(--input-label-font);
    font-size: var(--input-label-size);
    letter-spacing: var(--input-label-tracking);
    color: var(--input-label-color);
  }

  .msc-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
  }
</style>
