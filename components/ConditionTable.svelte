<!--
  @component ConditionTable

  Configurable condition-row editor for building rule-based filters.
  Composes Input, Select, and Button primitives into an interactive grid.

  @example
  <ConditionTable
    columns={[
      { key: 'field', label: 'Field', type: 'text', placeholder: 'data.field_name' },
      { key: 'operator', label: 'Operator', type: 'select', width: '10rem', options: operators },
      { key: 'value', label: 'Value', type: 'text', placeholder: 'value' },
    ]}
    bind:conditions
    onchange={handleChange}
  />
-->
<script>
  /**
   * @typedef {{ value: string, label: string }} SelectOption
   * @typedef {{ key: string, label: string, type: 'text' | 'select', width?: string, options?: SelectOption[], placeholder?: string }} ColumnDef
   */

  import Input from './Input.svelte';
  import Select from './Select.svelte';
  import Button from './Button.svelte';

  let {
    /** @type {{ [key: string]: string }[]} */
    conditions = $bindable([]),
    /** @type {ColumnDef[]} */
    columns = [],
    /** @type {number} */
    maxRows = 20,
    /** @type {boolean} */
    disabled = false,
    /** @type {string} */
    emptyMessage = 'No conditions defined.',
    /** @type {string} */
    addLabel = 'Add condition',
    /** @type {((conditions: { [key: string]: string }[]) => void) | undefined} */
    onchange = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const gridTemplate = $derived(
    columns.map((col) => col.width ?? '1fr').join(' ') + ' 2.5rem'
  );

  const canAdd = $derived(conditions.length < maxRows);

  function notify() {
    onchange?.(conditions);
  }

  function addRow() {
    /** @type {{ [key: string]: string }} */
    const row = {};
    for (const col of columns) {
      row[col.key] = '';
    }
    conditions = [...conditions, row];
    notify();
  }

  /** @param {number} index */
  function removeRow(index) {
    conditions = conditions.filter((_, i) => i !== index);
    notify();
  }

  /**
   * @param {number} rowIndex
   * @param {string} key
   * @param {string} value
   */
  function updateCell(rowIndex, key, value) {
    conditions[rowIndex] = { ...conditions[rowIndex], [key]: value };
    conditions = [...conditions];
    notify();
  }
</script>

<div class="condition-table {className}" {...rest}>
  {#if conditions.length === 0}
    <p class="condition-table-empty">{emptyMessage}</p>
  {:else}
    <!-- Header row — separate from data grid so row-gap only applies between data rows -->
    <div class="condition-table-header-row" style:grid-template-columns={gridTemplate}>
      {#each columns as col}
        <span class="condition-table-header">{col.label}</span>
      {/each}
      <span class="condition-table-header"></span>
    </div>

    <!-- Data rows — each row is its own grid so row-gap creates visible separation -->
    {#each conditions as row, rowIndex}
      <div class="condition-table-row" style:grid-template-columns={gridTemplate}>
        {#each columns as col}
          <div class="condition-table-cell">
            {#if col.type === 'select'}
              <Select
                size="sm"
                value={row[col.key] ?? ''}
                options={col.options ?? []}
                placeholder={col.placeholder}
                {disabled}
                onchange={(e) => updateCell(rowIndex, col.key, e.target.value)}
              />
            {:else}
              <Input
                size="sm"
                value={row[col.key] ?? ''}
                placeholder={col.placeholder}
                {disabled}
                oninput={(e) => updateCell(rowIndex, col.key, e.target.value)}
              />
            {/if}
          </div>
        {/each}
        <div class="condition-table-cell condition-table-delete">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            {disabled}
            aria-label="Remove condition"
            onclick={() => removeRow(rowIndex)}
          >
            {#snippet icon()}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            {/snippet}
          </Button>
        </div>
      </div>
    {/each}
  {/if}

  {#if canAdd}
    <div class="condition-table-footer">
      <Button
        variant="ghost"
        size="sm"
        {disabled}
        onclick={addRow}
      >
        {#snippet icon()}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        {/snippet}
        {addLabel}
      </Button>
    </div>
  {/if}
</div>

<style>
  .condition-table {
    display: flex;
    flex-direction: column;
    gap: var(--condition-table-row-gap);
    width: 100%;
  }

  .condition-table-header-row {
    display: grid;
    column-gap: var(--condition-table-header-gap);
    align-items: center;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .condition-table-row {
    display: grid;
    column-gap: var(--condition-table-header-gap);
    align-items: center;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .condition-table-header {
    font-family: var(--input-label-font);
    font-size: var(--input-label-size);
    letter-spacing: var(--input-label-tracking);
    color: var(--input-label-color);
    user-select: none;
  }

  .condition-table-cell {
    min-width: 0;
  }

  .condition-table-delete {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .condition-table-empty {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--condition-table-empty-color);
    margin: 0;
    padding: var(--space-sm) 0;
  }

  .condition-table-footer {
    padding-top: var(--space-xs);
  }
</style>
