<!--
  @component EChart

  A categorical chart over a public aggregate VIEW, rendered with Apache ECharts,
  that SHIPS ITS DATA TABLE — same a11y contract as `ResultsChart`. The ECharts
  canvas is decorative (`aria-hidden`); the accompanying `<table>` is the
  accessible source of truth, always rendered server-side and client-side, so the
  data is reachable with JS off, CSS off, at any zoom, and to assistive tech. This
  is a hard requirement (WCAG / ARTE: a chart must not be the only encoding of its
  data), not a toggle.

  Declarative + multi-series (#176 follow-on): the data contract is the
  column-aligned `{ category, series[] }` (`ChartData`) produced by `toSeriesData`
  — a single series is the degenerate case, ≥2 series is multi-series. Each series
  carries its own `type` (bar/line/area/scatter/pie), optional `stack`, and
  optional secondary `axis`; the ECharts `option` is built by the PURE
  `buildChartOption` (unit-tested separately). Back-compat: the legacy
  `items={[{label,value}]}` + `kind` props synthesise a single series.

  ECharts is LAZY-loaded inside the mount effect, so the heavy library lands in
  its OWN async chunk — a page that never mounts a chart never pays for it.
  Effects are client-only in Svelte 5, so the canvas is never touched during SSR.

  Themed from the live `--color-*` semantic tokens read off the container, and
  re-themed on `data-theme` / `prefers-color-scheme` change (#244). The per-series
  palette is an alpha ramp off `--color-accent` — no hardcoded colour list.
  Soft-empty: no series/category → renders nothing.

  @example
  <EChart
    caption="Reports by status"
    labelHeader="Status"
    category={["Open", "In progress", "Resolved"]}
    series={[
      { name: "Open", type: "bar", data: [12, 0, 0] },
      { name: "Resolved", type: "bar", data: [0, 0, 31] },
    ]}
    legend
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
  import { watchTheme } from "./map-utils.js";
  import { buildChartOption } from "./renderer/chart-option";

  let {
    /** @type {string[]} The category (x / pie-angle) ticks. */
    category = [],
    /** @type {SeriesData[]} The series to plot (≥1; ≥2 = multi-series). */
    series = [],
    /** @type {boolean} Render a legend (needed once there are ≥2 series). */
    legend = false,
    /** @type {"horizontal" | "vertical" | undefined} Cartesian orientation. */
    orientation = undefined,
    /** @type {boolean} Enable a 2nd value axis for `axis: "secondary"` series. */
    ySecondary = false,
    /** @type {number} Pie/donut hole as a fraction of the radius (0 = full pie). */
    innerRadius = 0,
    /** @type {ChartItem[]} BACK-COMPAT: single-series `{label,value}` rows. */
    items = [],
    /** @type {"bar" | "line" | "donut"} BACK-COMPAT: legacy single-series kind. */
    kind = "bar",
    /** @type {string} Accessible caption / heading for the chart + table. */
    caption = "Results",
    /** @type {string} Column header for the category (localize it). */
    labelHeader = "Item",
    /** @type {string} Header for the (legacy single) value column (localize it). */
    valueHeader = "Value",
    /** @type {string} BCP-47 locale for number formatting. */
    locale = "en",
    /** @type {string} CSS block-size for the chart canvas. */
    height = "20rem",
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();

  /** @param {number} value @returns {string} */
  function fmt(value) {
    return new Intl.NumberFormat(locale).format(value);
  }

  // Normalise to the declarative `{ category, series }` contract. When `series`
  // is given we render it directly; otherwise we synthesise a single series from
  // the legacy `items` + `kind` (donut → a pie series).
  /** @type {ChartData} */
  const chartData = $derived.by(() => {
    if (series.length > 0) return { category, series };
    if (items.length === 0) return { category: [], series: [] };
    const t = kind === "donut" ? "pie" : kind;
    return {
      category: items.map((it) => it.label),
      series: [
        {
          name: valueHeader,
          type: /** @type {SeriesData["type"]} */ (t),
          data: items.map((it) => it.value),
        },
      ],
    };
  });

  // Legacy donut gets the ring hole even though the caller passes no innerRadius.
  const effInnerRadius = $derived(
    series.length === 0 && kind === "donut" ? 0.45 : innerRadius,
  );

  // The legacy single-series `kind="bar"` rendered a HORIZONTAL bar (category on
  // the y-axis). Preserve that look for back-compat callers; the declarative
  // path defaults to vertical (category on x) unless `orientation` says otherwise.
  const effOrientation = $derived(
    orientation ?? (series.length === 0 && kind === "bar" ? "horizontal" : undefined),
  );

  const hasData = $derived(
    chartData.series.length > 0 && chartData.category.length > 0,
  );

  /** @type {HTMLElement | undefined} */
  let container = $state();

  /** @type {import('echarts/core').EChartsType | undefined} */
  let _chart = $state();

  /** Build the ECharts option from current data + the container's tokens. */
  function buildOption() {
    const el = container;
    if (!el) return {};
    const cs = getComputedStyle(el);
    const token = (name, fallback) => {
      const v = cs.getPropertyValue(name).trim();
      return v || fallback;
    };
    return buildChartOption(chartData, {
      tokens: {
        accent: token("--color-accent", "#2563eb"),
        textPrimary: token("--color-text-primary", "#1f2937"),
        textSecondary: token("--color-text-secondary", "#6b7280"),
        border: token("--color-border", "#e5e7eb"),
      },
      locale,
      legend,
      orientation: effOrientation,
      ySecondary,
      innerRadius: effInnerRadius,
    });
  }

  $effect(() => {
    if (!container) return;

    let disposed = false;
    /** @type {import('echarts/core').EChartsType | undefined} */
    let chart;
    /** @type {ResizeObserver | undefined} */
    let ro;
    /** @type {(() => void) | undefined} */
    let disposeTheme;

    (async () => {
      try {
        const [core, charts, components, renderers] = await Promise.all([
          import("echarts/core"),
          import("echarts/charts"),
          import("echarts/components"),
          import("echarts/renderers"),
        ]);
        if (disposed || !container) return;

        core.use([
          charts.BarChart,
          charts.LineChart,
          charts.PieChart,
          charts.ScatterChart,
          components.GridComponent,
          components.TooltipComponent,
          components.LegendComponent,
          renderers.CanvasRenderer,
        ]);

        chart = core.init(container, null, { renderer: "canvas" });
        _chart = chart;
        chart.setOption(buildOption());

        ro = new ResizeObserver(() => chart?.resize());
        ro.observe(container);

        disposeTheme = watchTheme(() => chart?.setOption(buildOption(), true));
      } catch (err) {
        // Fail soft: the <table> below is the accessible source of truth, so a
        // failed chart load degrades to data-only, never to a broken page.
        // eslint-disable-next-line no-console
        console.error("EChart: failed to render", err);
      }
    })();

    return () => {
      disposed = true;
      disposeTheme?.();
      ro?.disconnect();
      chart?.dispose();
      _chart = undefined;
    };
  });

  // Re-apply the option when the data / locale / options change after mount (the
  // canvas persists; only the option is swapped). `true` replaces (not merges)
  // so stale axis/series components from a previous shape are cleared.
  $effect(() => {
    void chartData;
    void locale;
    void legend;
    void effOrientation;
    void ySecondary;
    void effInnerRadius;
    if (_chart) _chart.setOption(buildOption(), true);
  });
</script>

{#if hasData}
  <figure class="echart {className}" aria-label={caption} {...rest}>
    <!-- Decorative visual: the data lives in the table below. -->
    <div
      class="echart-canvas"
      bind:this={container}
      aria-hidden="true"
      style="block-size: {height}"
    ></div>

    <!-- Accessible source of truth — always rendered (ARTE #3/#6), one value
         column per series. Named via aria-label, not a <caption>:
         position:absolute/clip is unreliable on a display:table-caption element
         (it leaks visibly in some engines). -->
    <table class="echart-table" aria-label={caption}>
      <thead>
        <tr>
          <th scope="col">{labelHeader}</th>
          {#each chartData.series as s, si (si)}
            <th scope="col">{s.name}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each chartData.category as cat, r (cat + r)}
          <tr>
            <th scope="row">{cat}</th>
            {#each chartData.series as s, si (si)}
              <td>{fmt(s.data[r] ?? 0)}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </figure>
{/if}

<style>
  .echart {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .echart-canvas {
    inline-size: 100%;
  }

  .echart-table {
    inline-size: 100%;
    border-collapse: collapse;
    font-size: var(--type-body-sm-size);
  }

  .echart-table th,
  .echart-table td {
    text-align: start;
    padding: var(--space-2xs) var(--space-xs);
    border-block-end: 1px solid var(--color-border);
  }

  .echart-table thead th {
    color: var(--color-text-secondary);
    font-weight: 600;
  }

  .echart-table tbody th {
    font-weight: 400;
    color: var(--color-text-primary);
  }

  .echart-table td {
    text-align: end;
    font-variant-numeric: tabular-nums;
    color: var(--color-text-primary);
  }
</style>
