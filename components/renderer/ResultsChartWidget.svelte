<script lang="ts">
  import ResultsChart from "../ResultsChart.svelte";
  import type { WidgetProps } from "./types";
  import { toRankedItems } from "./aggregate";

  // `results-chart` widget (#105 Phase 4) — a bar chart over a public aggregate
  // VIEW that SHIPS its data table (ARTE #3/#6: a chart is never the only
  // encoding). Type-ranked on `kind: "aggregate"` (out-ranks the board default)
  // so a `type: "results-chart"` block renders the chart while the bare kind
  // renders the board. Vertical-agnostic: `props.label_field` / `value_field`
  // name the view columns; `props.label_header` / `value_header` localise the
  // table headers. Soft-empty on no rows (optional slot). Flush band.
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
    <ResultsChart
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
