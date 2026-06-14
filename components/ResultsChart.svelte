<!--
  @component ResultsChart

  A horizontal bar chart for a single categorical aggregate (votes per proposal,
  reports per category, consumption per meter) that SHIPS ITS DATA TABLE. The
  visual bars are decorative (`aria-hidden`); the accompanying `<table>` is the
  accessible source of truth, always rendered — so the data is reachable with CSS
  off, at any zoom, and to assistive tech. This is a hard requirement (WCAG /
  ARTE: a chart must not be the only encoding of its data), not a toggle.

  Vertical-agnostic: `items` is already shaped to `{ label, value }`; the consumer
  (a portal widget over a public aggregate VIEW) maps the view columns and orders
  the rows. Dependency-free (pure CSS bars) so it stays a11y- and SSR-clean.
  Consumes semantic tokens so dark / high-contrast schemes (#244) ride through.
  Soft-empty: no items → renders nothing.

  @example
  <ResultsChart
    caption="Votes per proposal"
    labelHeader="Proposal"
    valueHeader="Votes"
    items={[
      { label: "Ciclovia da Marginal", value: 1284 },
      { label: "Parque infantil de Gaia", value: 967 },
    ]}
    locale="pt"
  />
-->
<script module>
  /**
   * @typedef {{ label: string, value: number }} ChartItem
   */
</script>

<script>
  let {
    /** @type {ChartItem[]} The categorical rows to plot. */
    items = [],
    /** @type {string} Accessible caption / heading for the chart + table. */
    caption = "Results",
    /** @type {string} Column header for the category (localize it). */
    labelHeader = "Item",
    /** @type {string} Column header for the value (localize it). */
    valueHeader = "Value",
    /** @type {string} BCP-47 locale for number formatting. */
    locale = "en",
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();

  const max = $derived(
    items.reduce((m, it) => (it.value > m ? it.value : m), 0),
  );

  /** @param {number} value @returns {string} */
  function fmt(value) {
    return new Intl.NumberFormat(locale).format(value);
  }

  /** @param {number} value @returns {number} */
  function pct(value) {
    return max > 0 ? Math.round((value / max) * 100) : 0;
  }
</script>

{#if items.length > 0}
  <figure class="results-chart {className}" aria-label={caption} {...rest}>
    <!-- Decorative visual: the data lives in the table below. -->
    <div class="results-chart-bars" aria-hidden="true">
      {#each items as item, i (item.label + i)}
        <div class="results-bar-row">
          <span class="results-bar-label">{item.label}</span>
          <span class="results-bar-track">
            <span
              class="results-bar-fill"
              style="inline-size: {pct(item.value)}%"
            ></span>
          </span>
          <span class="results-bar-value">{fmt(item.value)}</span>
        </div>
      {/each}
    </div>

    <!-- Accessible source of truth — always rendered (ARTE #3/#6). Named via
         aria-label, not a <caption>: position:absolute/clip is unreliable on a
         display:table-caption element (it leaks visibly in some engines). -->
    <table class="results-chart-table" aria-label={caption}>
      <thead>
        <tr>
          <th scope="col">{labelHeader}</th>
          <th scope="col">{valueHeader}</th>
        </tr>
      </thead>
      <tbody>
        {#each items as item, i (item.label + i)}
          <tr>
            <th scope="row">{item.label}</th>
            <td>{fmt(item.value)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </figure>
{/if}

<style>
  .results-chart {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .results-chart-bars {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .results-bar-row {
    display: grid;
    grid-template-columns: minmax(6rem, 14rem) 1fr auto;
    align-items: center;
    gap: var(--space-sm);
  }

  .results-bar-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--color-text-primary);
  }

  .results-bar-track {
    block-size: var(--space-sm, 12px);
    inline-size: 100%;
    background: var(--color-border);
    border-radius: var(--radius-full, 999px);
    overflow: hidden;
  }

  .results-bar-fill {
    display: block;
    block-size: 100%;
    background: var(--color-accent);
    border-radius: inherit;
  }

  .results-bar-value {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
  }

  .results-chart-table {
    inline-size: 100%;
    border-collapse: collapse;
    font-size: var(--type-body-sm-size);
  }

  .results-chart-table th,
  .results-chart-table td {
    text-align: start;
    padding: var(--space-2xs) var(--space-xs);
    border-block-end: 1px solid var(--color-border);
  }

  .results-chart-table thead th {
    color: var(--color-text-secondary);
    font-weight: 600;
  }

  .results-chart-table tbody th {
    font-weight: 400;
    color: var(--color-text-primary);
  }

  .results-chart-table td {
    text-align: end;
    font-variant-numeric: tabular-nums;
    color: var(--color-text-primary);
  }
</style>
