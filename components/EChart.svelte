<!--
  @component EChart

  A horizontal bar chart for a single categorical aggregate (votes per proposal,
  reports per category, …) rendered with Apache ECharts, that SHIPS ITS DATA
  TABLE — same a11y contract as `ResultsChart`. The ECharts canvas is decorative
  (`aria-hidden`); the accompanying `<table>` is the accessible source of truth,
  always rendered server-side and client-side, so the data is reachable with
  JS off, CSS off, at any zoom, and to assistive tech. This is a hard
  requirement (WCAG / ARTE: a chart must not be the only encoding of its data),
  not a toggle.

  ECharts is LAZY-loaded: `echarts/core` + only the BarChart / Grid / Tooltip
  modules + the canvas renderer are dynamically `import()`ed inside the mount
  effect, so the heavy library lands in its OWN async chunk — a page that never
  mounts a chart never pays for it. Effects are client-only in Svelte 5, so the
  canvas is never touched during SSR.

  Vertical-agnostic: `items` is already shaped to `{ label, value }` by the
  consumer (a widget over a public aggregate VIEW). Themed from the live
  `--color-*` semantic tokens read off the container, and re-themed on
  `data-theme` / `prefers-color-scheme` change (#244), so dark / high-contrast
  schemes ride through. Soft-empty: no items → renders nothing.

  @example
  <EChart
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
  import { watchTheme } from "./map-utils.js";

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

  /** @type {HTMLElement | undefined} */
  let container = $state();

  // The ECharts instance + the canvas-renderer chart option are owned by the
  // mount effect; this effect (re-)builds the option whenever `items`, the
  // locale, or the theme change. `_chart` is hoisted so the data effect can
  // re-setOption without re-initialising the canvas.
  /** @type {import('echarts/core').EChartsType | undefined} */
  let _chart = $state();

  /** Build the ECharts option from current items + the container's tokens. */
  function buildOption() {
    const el = container;
    if (!el) return {};
    const cs = getComputedStyle(el);
    const token = (name, fallback) => {
      const v = cs.getPropertyValue(name).trim();
      return v || fallback;
    };
    const accent = token("--color-accent", "#2563eb");
    const textPrimary = token("--color-text-primary", "#1f2937");
    const textSecondary = token("--color-text-secondary", "#6b7280");
    const border = token("--color-border", "#e5e7eb");

    // ECharts plots the category axis bottom-up; reverse so the highest value
    // sits at the top (matching ResultsChart's top-down order). `items` is
    // already sorted desc by the consumer.
    const ordered = [...items].reverse();

    return {
      animation: false,
      grid: { left: 8, right: 16, top: 8, bottom: 8, containLabel: true },
      tooltip: {
        trigger: "item",
        /** @param {{ name: string, value: number }} p */
        formatter: (p) => `${p.name}: ${fmt(p.value)}`,
      },
      xAxis: {
        type: "value",
        axisLabel: { color: textSecondary, formatter: (/** @type {number} */ v) => fmt(v) },
        axisLine: { lineStyle: { color: border } },
        splitLine: { lineStyle: { color: border } },
      },
      yAxis: {
        type: "category",
        data: ordered.map((it) => it.label),
        axisLabel: { color: textPrimary },
        axisLine: { lineStyle: { color: border } },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: ordered.map((it) => it.value),
          itemStyle: { color: accent, borderRadius: [0, 4, 4, 0] },
          barMaxWidth: 28,
        },
      ],
    };
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
          components.GridComponent,
          components.TooltipComponent,
          renderers.CanvasRenderer,
        ]);

        chart = core.init(container, null, { renderer: "canvas" });
        _chart = chart;
        chart.setOption(buildOption());

        ro = new ResizeObserver(() => chart?.resize());
        ro.observe(container);

        disposeTheme = watchTheme(() => chart?.setOption(buildOption()));
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

  // Re-apply the option when items / locale change after mount (the canvas
  // persists; only the data is swapped). Guarded on `_chart` so it no-ops
  // before init and after dispose.
  $effect(() => {
    // touch reactive deps so the effect re-runs when they change
    void items;
    void locale;
    if (_chart) _chart.setOption(buildOption());
  });
</script>

{#if items.length > 0}
  <figure class="echart {className}" aria-label={caption} {...rest}>
    <!-- Decorative visual: the data lives in the table below. -->
    <div
      class="echart-canvas"
      bind:this={container}
      aria-hidden="true"
      style="block-size: {height}"
    ></div>

    <!-- Accessible source of truth — always rendered (ARTE #3/#6). Named via
         aria-label, not a <caption>: position:absolute/clip is unreliable on a
         display:table-caption element (it leaks visibly in some engines). -->
    <table class="echart-table" aria-label={caption}>
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
