<script lang="ts">
  import ResultsChart from "../ResultsChart.svelte";
  import type { WidgetProps } from "./types";
  import { toRankedItems, toSeriesData, type ChartSpec } from "./aggregate";
  import { asChartSpec } from "./chart-spec";

  // `results-chart` widget (#105 Phase 4) — the dependency-free (pure-CSS) SSR /
  // no-JS fallback over a public aggregate VIEW that SHIPS its data table (ARTE
  // #3/#6: a chart is never the only encoding). Type-ranked on `kind:
  // "aggregate"`. Same two authoring modes as EChartWidget (#176 follow-on):
  //  • DECLARATIVE — `props.chart_spec` projected via `toSeriesData`; the table
  //    renders ALL series, the CSS bars render the first.
  //  • LEGACY — `props.label_field` / `value_field` via `toRankedItems`.
  let { data, props, ownsH1, locale }: WidgetProps = $props();

  const rows = $derived(
    data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)
      ? ((data as { items: Record<string, unknown>[] }).items)
      : [],
  );

  const spec = $derived<ChartSpec | null>(asChartSpec(props.chart_spec));
  const chartData = $derived(spec ? toSeriesData(rows, spec) : null);

  const labelField = $derived(
    typeof props.label_field === "string" && props.label_field
      ? props.label_field
      : "label",
  );
  const valueField = $derived(
    typeof props.value_field === "string" && props.value_field
      ? props.value_field
      : "value",
  );
  const limit = $derived(
    typeof props.limit === "number" && props.limit > 0 ? props.limit : 0,
  );
  const legacyItems = $derived(
    spec ? [] : toRankedItems(rows, { labelField, valueField, limit }),
  );

  const hasData = $derived(
    chartData ? chartData.series.length > 0 && chartData.category.length > 0 : legacyItems.length > 0,
  );

  const heading = $derived(
    typeof props.title === "string" && props.title ? props.title : "",
  );
  const caption = $derived(heading || "Results");
  const labelHeader = $derived(
    typeof props.label_header === "string" && props.label_header
      ? props.label_header
      : "Item",
  );
  const valueHeader = $derived(
    typeof props.value_header === "string" && props.value_header
      ? props.value_header
      : "Value",
  );
</script>

{#if hasData}
  <section class="widget-band">
    {#if heading}
      {#if ownsH1}<h1>{heading}</h1>{:else}<h2>{heading}</h2>{/if}
    {/if}
    {#if chartData}
      <ResultsChart
        category={chartData.category}
        series={chartData.series}
        {caption}
        {labelHeader}
        locale={locale ?? "en"}
      />
    {:else}
      <ResultsChart
        items={legacyItems}
        {caption}
        {labelHeader}
        {valueHeader}
        locale={locale ?? "en"}
      />
    {/if}
  </section>
{/if}

<style>
  .widget-band {
    width: 100%;
    max-width: var(--content-width-narrow);
    margin-inline: auto;
    padding-inline: var(--content-padding-x);
  }
</style>
