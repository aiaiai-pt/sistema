<!--
  @component DataTable

  Data table with sortable columns, row selection, loading and empty states.
  Composes Skeleton and EmptyState primitives. Consumes --table-* tokens from
  components.css, falling back to semantic tokens.

  @example Basic
  <DataTable
    columns={[
      { key: 'name', label: 'NAME' },
      { key: 'status', label: 'STATUS', width: '120px' },
    ]}
    rows={items}
    on_sort={(key, dir) => sort(key, dir)}
    on_row_click={(row) => goto(`/items/${row.id}`)}
  />

  @example Selectable
  <DataTable
    {columns}
    {rows}
    selectable
    bind:selected_rows={selected}
    on_select={(sel) => console.log(sel)}
  />

  @example Loading
  <DataTable {columns} rows={[]} loading />

  @example Custom cell rendering (badges, chips, components)
  Pass a `cell` snippet to override the default per-cell text rendering.
  The default behavior (using `column.render` to produce a string) is
  preserved when no `cell` snippet is provided.

  <DataTable {columns} {rows}>
    {#snippet cell({ row, column, value })}
      {#if column.key === 'status'}
        <Badge variant={statusVariant(value)}>{value}</Badge>
      {:else}
        {value ?? '-'}
      {/if}
    {/snippet}
  </DataTable>
-->
<script>
  /**
   * @typedef {{ key: string, label: string, width?: string, sortable?: boolean, render?: (value: unknown, row: Record<string, unknown>) => string }} ColumnDef
   */

  import Skeleton from './Skeleton.svelte';
  import EmptyState from './EmptyState.svelte';

  let {
    /** @type {ColumnDef[]} */
    columns = [],
    /** @type {Record<string, unknown>[]} */
    rows = [],
    /** @type {boolean} */
    loading = false,
    /** @type {boolean} */
    sortable = true,
    /** @type {string | undefined} */
    sort_key = undefined,
    /** @type {'asc' | 'desc'} */
    sort_direction = 'asc',
    /** @type {boolean} */
    selectable = false,
    /** @type {Set<string>} */
    selected_rows = $bindable(new Set()),
    /** @type {string} */
    row_key = 'id',
    /** @type {string} */
    empty_heading = 'No data',
    /** @type {string} */
    empty_body = 'No items to display',
    /** @type {((key: string, direction: 'asc' | 'desc') => void) | undefined} */
    on_sort = undefined,
    /** @type {((selected: Set<string>) => void) | undefined} */
    on_select = undefined,
    /** @type {((row: Record<string, unknown>) => void) | undefined} */
    on_row_click = undefined,
    /**
     * Optional per-cell render override. When provided, called for every td
     * with `{ row, column, value }`; the snippet's output replaces the
     * default text rendering. When omitted, the default text path runs
     * (`column.render` then `String(value)`) so existing consumers keep
     * working unchanged.
     *
     * Why a snippet rather than passing a Svelte component class via
     * `column.render`: snippets accept the full row context (not just the
     * value), let consumers compose any DS primitive (Badge, Tag, Status,
     * Button) without bringing those imports into the DS surface, and
     * Svelte 5's snippet API is the canonical way to parameterize child
     * rendering. `column.render` stays for the common string case.
     *
     * @type {import('svelte').Snippet<[{ row: Record<string, unknown>, column: ColumnDef, value: unknown }]> | undefined}
     */
    cell = undefined,
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const SKELETON_ROWS = 5;

  const all_selected = $derived(
    rows.length > 0 &&
    rows.every((row) => selected_rows.has(String(row[row_key])))
  );

  const some_selected = $derived(
    rows.some((row) => selected_rows.has(String(row[row_key]))) && !all_selected
  );

  /**
   * @param {string} key
   */
  function handle_header_click(key) {
    const col = columns.find((c) => c.key === key);
    const col_sortable = col?.sortable ?? sortable;
    if (!col_sortable || !on_sort) return;

    const next_dir = sort_key === key && sort_direction === 'asc' ? 'desc' : 'asc';
    on_sort(key, next_dir);
  }

  /** @param {string} row_id */
  function handle_row_check(row_id) {
    const next = new Set(selected_rows);
    if (next.has(row_id)) {
      next.delete(row_id);
    } else {
      next.add(row_id);
    }
    selected_rows = next;
    on_select?.(next);
  }

  function handle_select_all() {
    let next;
    if (all_selected) {
      next = new Set(/** @type {Set<string>} */ (selected_rows));
      for (const row of rows) {
        next.delete(String(row[row_key]));
      }
    } else {
      next = new Set(/** @type {Set<string>} */ (selected_rows));
      for (const row of rows) {
        next.add(String(row[row_key]));
      }
    }
    selected_rows = next;
    on_select?.(next);
  }

  /**
   * @param {ColumnDef} col
   * @param {unknown} value
   * @param {Record<string, unknown>} row
   */
  function render_cell(col, value, row) {
    if (col.render) return col.render(value, row);
    if (value === null || value === undefined) return '';
    return String(value);
  }

  /**
   * @param {string} key
   */
  function is_col_sortable(key) {
    const col = columns.find((c) => c.key === key);
    return col?.sortable ?? sortable;
  }
</script>

<div class="table-wrap {className}" {...rest}>
  {#if children}
    <div class="table-toolbar">
      {@render children()}
    </div>
  {/if}

  <div class="table-scroll">
    <table class="table">
      <thead class="table-head">
        <tr>
          {#if selectable}
            <th class="table-th table-th-check" scope="col">
              <input
                type="checkbox"
                class="table-checkbox"
                checked={all_selected}
                indeterminate={some_selected}
                disabled={loading}
                aria-label="Select all rows"
                onchange={handle_select_all}
              />
            </th>
          {/if}
          {#each columns as col}
            {@const col_sort = is_col_sortable(col.key)}
            <th
              class="table-th"
              class:table-th-sortable={col_sort && !!on_sort}
              scope="col"
              style:width={col.width ?? undefined}
              onclick={col_sort && on_sort ? () => handle_header_click(col.key) : undefined}
              aria-sort={!col_sort ? undefined : sort_key === col.key ? (sort_direction === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <span class="table-th-inner">
                {col.label}
                {#if col_sort && on_sort}
                  <span class="table-sort-icon" aria-hidden="true">
                    {#if sort_key === col.key}
                      {#if sort_direction === 'asc'}
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M5 2L9 8H1L5 2Z" fill="currentColor"/>
                        </svg>
                      {:else}
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M5 8L1 2H9L5 8Z" fill="currentColor"/>
                        </svg>
                      {/if}
                    {:else}
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style="opacity: 0.3">
                        <path d="M5 2L9 5H1L5 2Z" fill="currentColor"/>
                        <path d="M5 8L1 5H9L5 8Z" fill="currentColor"/>
                      </svg>
                    {/if}
                  </span>
                {/if}
              </span>
            </th>
          {/each}
        </tr>
      </thead>

      <tbody class="table-body">
        {#if loading}
          {#each { length: SKELETON_ROWS } as _, i}
            <tr class="table-row" aria-hidden="true">
              {#if selectable}
                <td class="table-td table-td-check">
                  <Skeleton width="16px" height="16px" radius="var(--radius-sm)" />
                </td>
              {/if}
              {#each columns as col}
                <td class="table-td">
                  <Skeleton width={i % 3 === 0 ? '60%' : i % 3 === 1 ? '80%' : '70%'} height="14px" />
                </td>
              {/each}
            </tr>
          {/each}
        {:else if rows.length === 0}
          <tr>
            <td colspan={selectable ? columns.length + 1 : columns.length} class="table-td-empty">
              <EmptyState heading={empty_heading} body={empty_body} />
            </td>
          </tr>
        {:else}
          {#each rows as row, row_index}
            {@const row_id = String(row[row_key])}
            {@const is_selected = selected_rows.has(row_id)}
            <tr
              class="table-row"
              class:table-row-even={row_index % 2 === 1}
              class:table-row-selected={is_selected}
              class:table-row-clickable={!!on_row_click}
              onclick={on_row_click ? () => on_row_click(row) : undefined}
              tabindex={on_row_click ? 0 : undefined}
              onkeydown={on_row_click ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); on_row_click(row); } } : undefined}
            >
              {#if selectable}
                <td
                  class="table-td table-td-check"
                  onclick={(e) => { e.stopPropagation(); handle_row_check(row_id); }}
                >
                  <input
                    type="checkbox"
                    class="table-checkbox"
                    checked={is_selected}
                    aria-label="Select row"
                    onchange={() => handle_row_check(row_id)}
                    onclick={(e) => e.stopPropagation()}
                  />
                </td>
              {/if}
              {#each columns as col}
                <td class="table-td">
                  {#if cell}
                    {@render cell({ row, column: col, value: row[col.key] })}
                  {:else}
                    {render_cell(col, row[col.key], row)}
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>

<style>
  .table-wrap {
    width: 100%;
    display: flex;
    flex-direction: column;
    border: var(--elevation-border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .table-toolbar {
    padding: var(--space-sm) var(--space-md);
    border-bottom: var(--elevation-border);
    background: var(--color-surface);
  }

  .table-scroll {
    width: 100%;
    overflow: auto;
    /* When a max-height is set on .table-wrap, this enables sticky thead. */
    max-height: inherit;
  }

  .table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }

  /* ─── Head ───
     Sticky headers require the consumer to set a fixed height on .table-wrap
     or a scroll-owning ancestor. Without a constrained height the header will
     simply sit at the top of the table and not "stick" because this scroll
     container owns the overflow. */
  .table-head {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .table-th {
    background: var(--color-surface-tertiary);
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    letter-spacing: var(--type-label-tracking);
    color: var(--color-text-secondary);
    font-weight: var(--raw-font-weight-regular, 400);
    text-align: left;
    padding: var(--space-sm) var(--space-md);
    white-space: nowrap;
    user-select: none;
    border-bottom: var(--elevation-border);
  }

  .table-th-sortable {
    cursor: pointer;
  }

  .table-th-sortable:hover {
    color: var(--color-text);
  }

  .table-th-check {
    width: 40px;
    padding-left: var(--space-md);
    padding-right: var(--space-sm);
  }

  .table-th-inner {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .table-sort-icon {
    display: inline-flex;
    align-items: center;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .table-th-sortable:hover .table-sort-icon {
    color: var(--color-text-secondary);
  }

  /* ─── Body ─── */
  .table-body {
    background: var(--color-surface);
  }

  .table-row {
    transition: background var(--duration-instant) var(--easing-default);
  }

  .table-row-even {
    background: var(--color-surface-secondary);
  }

  .table-row:hover {
    background: var(--color-surface-tertiary);
  }

  .table-row-selected {
    background: var(--color-accent-subtle) !important;
  }

  .table-row-clickable {
    cursor: pointer;
  }

  .table-row-clickable:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: -2px;
  }

  .table-td {
    font-family: var(--type-data-font);
    font-size: var(--type-data-size);
    color: var(--color-text);
    padding: var(--space-sm) var(--space-md);
    border-bottom: var(--elevation-border);
    vertical-align: middle;
  }

  /* Remove border from last row */
  .table-body tr:last-child .table-td {
    border-bottom: none;
  }

  .table-td-check {
    width: 40px;
    padding-left: var(--space-md);
    padding-right: var(--space-sm);
  }

  .table-td-empty {
    padding: 0;
    border-bottom: none;
  }

  /* ─── Checkbox ─── */
  .table-checkbox {
    width: var(--checkbox-size);
    height: var(--checkbox-size);
    accent-color: var(--color-accent);
    cursor: pointer;
    display: block;
  }
</style>
