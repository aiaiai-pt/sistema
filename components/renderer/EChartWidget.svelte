<script lang="ts">
  import EChart from "../EChart.svelte";
  import type { WidgetProps } from "./types";
  import { toRankedItems, toSeriesData, type ChartSpec } from "./aggregate";
  import { asChartSpec } from "./chart-spec";

  // `chart` / `echart` widget — an ECharts chart over a public aggregate VIEW,
  // the richer sibling of `results-chart` (pure-CSS bars). Type-ranked on
  // `kind: "aggregate"`. Same a11y contract: EChart ships its data table (ARTE
  // #3/#6 — a chart is never the only encoding). Same data path as
  // ResultsChartWidget: reads the `{ items }` rows; NO resolve-data / provider
  // change needed.
  //
  // Two authoring modes (#176 follow-on):
  //  • DECLARATIVE — `props.chart_spec` (category column + ≥1 series of value
  //    columns, each with its own type/stack/axis + chart options). Projected
  //    via `toSeriesData`; multi-series is the ≥2-series case.
  //  • LEGACY — `props.label_field` / `value_field` (+ registry `kind`). A single
  //    series via `toRankedItems`. Kept for back-compat reads.
  let { data, props, ownsH1, locale, kind = "bar" }: WidgetProps & {
    kind?: "bar" | "line" | "donut";
  } = $props();

  const rows = $derived(
    data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)
      ? ((data as { items: Record<string, unknown>[] }).items)
      : [],
  );

  // Declarative spec (validated/whitelisted) — null when the block is legacy.
  const spec = $derived<ChartSpec | null>(asChartSpec(props.chart_spec));
  const chartData = $derived(spec ? toSeriesData(rows, spec) : null);

  // Legacy single-series projection (only used when there is no spec).
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
      <EChart
        category={chartData.category}
        series={chartData.series}
        legend={spec?.options?.legend ?? (chartData.series.length > 1)}
        orientation={spec?.options?.orientation}
        ySecondary={spec?.options?.y_secondary ?? false}
        innerRadius={spec?.options?.inner_radius ?? 0}
        {caption}
        {labelHeader}
        locale={locale ?? "en"}
      />
    {:else}
      <EChart
        items={legacyItems}
        {caption}
        {labelHeader}
        {valueHeader}
        {kind}
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
