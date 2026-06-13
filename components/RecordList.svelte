<!--
  @component RecordList

  A typed list of child records rendered from FIELD CONFIG — the generalisation
  of a comment list into any detail-page child collection (reviews, pareceres,
  occurrence updates, maintenance logs). Vertical-agnostic: `items` is the child
  rows, `fields` declares which keys to show and how.

  Layout convention (so one component serves every collection): the FIRST field
  is the record's primary line; the rest render as a muted meta line, separated
  by middots. A field may `format` as a date (locale-formatted) or `badge`
  (rendered as a Badge). Soft-empty: no items → nothing; an absent field value
  is skipped (no dangling separators).

  Consumes semantic tokens so dark / high-contrast schemes (#244) ride through.

  @example
  <RecordList
    items={updates}
    fields={[
      { key: 'note', label: 'Update' },
      { key: 'author' },
      { key: 'created_at', format: 'date' },
      { key: 'status', format: 'badge' },
    ]}
    locale="pt"
  />
-->
<script module>
  /**
   * @typedef {{ key: string, label?: string, format?: 'text' | 'date' | 'badge' }} RecordField
   */
</script>

<script>
  import List from './List.svelte';
  import ListItem from './ListItem.svelte';
  import Badge from './Badge.svelte';

  let {
    /** @type {Record<string, unknown>[]} The child records to render. */
    items = [],
    /** @type {RecordField[]} The columns; fields[0] is the primary line. */
    fields = [],
    /** @type {string} BCP-47 locale for date formatting. */
    locale = 'en',
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  /**
   * @param {unknown} value
   * @param {RecordField} field
   * @returns {string}
   */
  function display(value, field) {
    if (value === null || value === undefined || value === '') return '';
    if (field.format === 'date') {
      const d = new Date(String(value));
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(locale);
    }
    return String(value);
  }

  /**
   * The non-empty meta fields (everything after the primary) for one record —
   * precomputed so the template never emits a leading/dangling separator.
   * @param {Record<string, unknown>} item
   * @returns {{ field: RecordField, value: unknown }[]}
   */
  function metaParts(item) {
    return fields
      .slice(1)
      .map((field) => ({ field, value: item[field.key] }))
      .filter((p) => p.value !== null && p.value !== undefined && p.value !== '');
  }
</script>

{#if items.length > 0 && fields.length > 0}
  <List class={className} {...rest}>
    {#each items as item, i (item.id ?? i)}
      {@const primary = fields[0]}
      {@const primaryValue = item[primary.key]}
      {@const meta = metaParts(item)}
      <ListItem>
        {#snippet leading()}
          {#if primaryValue !== null && primaryValue !== undefined && primaryValue !== ''}
            <span class="record-primary">
              {#if primary.format === 'badge'}
                <Badge>{String(primaryValue)}</Badge>
              {:else}
                {display(primaryValue, primary)}
              {/if}
            </span>
          {/if}
          {#if meta.length > 0}
            <span class="record-meta">
              {#each meta as part, mi (part.field.key)}
                {#if mi > 0}<span class="record-sep" aria-hidden="true">·</span>{/if}
                {#if part.field.format === 'badge'}
                  <Badge>{String(part.value)}</Badge>
                {:else}<span>{display(part.value, part.field)}</span>{/if}
              {/each}
            </span>
          {/if}
        {/snippet}
      </ListItem>
    {/each}
  </List>
{/if}

<style>
  .record-primary {
    display: block;
  }

  .record-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2xs);
    margin-top: var(--space-2xs);
    font-size: var(--type-body-sm-size);
    color: var(--color-text-secondary);
  }

  .record-sep {
    color: var(--color-text-secondary);
  }
</style>
