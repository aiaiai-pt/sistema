<!--
  @component ResultsChart

  A dependency-free (pure-CSS) categorical chart that SHIPS ITS DATA TABLE — the
  SSR / no-JS fallback sibling of `EChart`. The visual bars are decorative
  (`aria-hidden`); the accompanying `<table>` is the accessible source of truth,
  always rendered — so the data is reachable with CSS off, at any zoom, and to
  assistive tech. This is a hard requirement (WCAG / ARTE: a chart must not be the
  only encoding of its data), not a toggle.

  Declarative + multi-series (#176 follow-on): consumes the same column-aligned
  `{ category, series[] }` (`ChartData`) as `EChart`. The data TABLE renders one
  value column per series (full fidelity, no JS); the CSS bars render the FIRST
  series only (a simple horizontal bar is the honest no-JS visual — stacked /
  dual-axis geometry needs the canvas). Back-compat: legacy `items={[{label,
  value}]}` synthesises a single series.

  Consumes semantic tokens so dark / high-contrast schemes (#244) ride through.
  Soft-empty: no series/category → renders nothing.

  @example
  <ResultsChart
    caption="Votes per proposal"
    labelHeader="Proposal"
    category={["Ciclovia", "Parque"]}
    series={[{ name: "Votes", type: "bar", data: [1284, 967] }]}
    locale="pt"
  />
-->
<script module>
  /**
   * @typedef {{ label: string, value: number }} ChartItem
   * @typedef {import('./renderer/aggregate').ChartData} ChartData
   * @typedef {import('./renderer/aggregate').SeriesData} SeriesData
   */
</script>

<script>
  let {
    /** @type {string[]} The category ticks. */
    category = [],
    /** @type {SeriesData[]} The series (≥1; the table shows all, bars show #1). */
    series = [],
    /** @type {ChartItem[]} BACK-COMPAT: single-series `{label,value}` rows. */
    items = [],
    /** @type {string} Accessible caption / heading for the chart + table. */
    caption = "Results",
    /** @type {string} Column header for the category (localize it). */
    labelHeader = "Item",
    /** @type {string} Header for the (legacy single) value column (localize it). */
    valueHeader = "Value",
    /** @type {string} BCP-47 locale for number formatting. */
    locale = "en",
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();

  /** @type {ChartData} */
  const chartData = $derived.by(() => {
    if (series.length > 0) return { category, series };
    if (items.length === 0) return { category: [], series: [] };
    return {
      category: items.map((it) => it.label),
      series: [
        { name: valueHeader, type: /** @type {SeriesData["type"]} */ ("bar"), data: items.map((it) => it.value) },
      ],
    };
  });

  const hasData = $derived(
    chartData.series.length > 0 && chartData.category.length > 0,
  );

  // CSS bars visualise the FIRST series only.
  const barSeries = $derived(chartData.series[0]);
  const max = $derived(
    (barSeries?.data ?? []).reduce((m, v) => (v > m ? v : m), 0),
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

{#if hasData}
  <figure class="results-chart {className}" aria-label={caption} {...rest}>
    <!-- Decorative visual (first series): the full data lives in the table below. -->
    <div class="results-chart-bars" aria-hidden="true">
      {#each chartData.category as cat, i (cat + i)}
        <div class="results-bar-row">
          <span class="results-bar-label">{cat}</span>
          <span class="results-bar-track">
            <span
              class="results-bar-fill"
              style="inline-size: {pct(barSeries?.data[i] ?? 0)}%"
            ></span>
          </span>
          <span class="results-bar-value">{fmt(barSeries?.data[i] ?? 0)}</span>
        </div>
      {/each}
    </div>

    <!-- Accessible source of truth — always rendered (ARTE #3/#6), one value
         column per series. Named via aria-label, not a <caption>:
         position:absolute/clip is unreliable on a display:table-caption element
         (it leaks visibly in some engines). -->
    <table class="results-chart-table" aria-label={caption}>
      <thead>
        <tr>
          <th scope="col">{labelHeader}</th>
          {#each chartData.series as s (s.name)}
            <th scope="col">{s.name}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each chartData.category as cat, r (cat + r)}
          <tr>
            <th scope="row">{cat}</th>
            {#each chartData.series as s (s.name)}
              <td>{fmt(s.data[r] ?? 0)}</td>
            {/each}
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
