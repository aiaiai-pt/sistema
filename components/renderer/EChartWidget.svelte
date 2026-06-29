<script lang="ts">
  import EChart from "../EChart.svelte";
  import type { WidgetProps } from "./types";
  import { toRankedItems } from "./aggregate";

  // `chart` widget (#498) — an ECharts bar chart over a public aggregate VIEW,
  // the richer sibling of `results-chart` (pure-CSS bars). Type-ranked on
  // `kind: "aggregate"` (out-ranks the kind default) so a `type: "chart"` block
  // renders the ECharts widget while `type: "results-chart"` renders the CSS
  // one. Same a11y contract: EChart ships its data table (ARTE #3/#6 — a chart
  // is never the only encoding). Same data path as ResultsChartWidget: reads
  // the `{ items }` rows and projects `{ label, value }` via `toRankedItems`,
  // so NO resolve-data / provider change is needed. Soft-empty on no rows.
  let { data, props, ownsH1, locale }: WidgetProps = $props();

  const rows = $derived(
    data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)
      ? ((data as { items: Record<string, unknown>[] }).items)
      : [],
  );

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

  const items = $derived(
    toRankedItems(rows, { labelField, valueField, limit }),
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

{#if items.length > 0}
  <section class="widget-band">
    {#if heading}
      {#if ownsH1}<h1>{heading}</h1>{:else}<h2>{heading}</h2>{/if}
    {/if}
    <EChart
      {items}
      {caption}
      {labelHeader}
      {valueHeader}
      locale={locale ?? "en"}
    />
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
