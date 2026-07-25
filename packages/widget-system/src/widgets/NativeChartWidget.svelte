<!--
  @component NativeChartWidget — transport-neutral native chart (S1.4 #59).

  Renders an ALREADY-RESOLVED chart model over the Sistema `EChart` visual
  primitive (an optional peer). It knows nothing about views, BFF paths, tenant,
  ontology, or how the data was fetched — it receives the resolved
  `{ category, series }` model as `request.data` and presentation options as
  `request.props`. There is NO row projection here: unlike the Atelier renderer's
  coupled EChartWidget (which reads `{ items }` rows and projects via
  `toSeriesData`/`asChartSpec`), this widget consumes the resolved series
  directly. That is the boundary #59 draws — the host resolves; the widget renders.

  Accessible table fallback: `EChart` always ships its data table (the a11y
  source of truth, ARTE #3/#6 — a chart is never the only encoding); the table
  headers come from the caller-supplied `caption` / `labelHeader` and each
  series' `name`. The echarts canvas is decorative and lazy-loaded inside
  EChart's own client-only effect, so this widget is SSR-safe.

  String-free (D9): every label (`caption`, `labelHeader`) is caller-supplied via
  `props`; absent ones fall through to EChart's own neutral defaults — this
  package ships no copy of its own.

  Overflow: the transport-neutral widget renders every resolved category/series
  it is given (the accessible table never silently drops data). WHEN a result is
  too large to render is a host budget decision, surfaced by the renderer's
  `WidgetState.overflow`, not inferred here.
-->
<script lang="ts">
  import EChart from "@aiaiai-pt/design-system/components/EChart.svelte";
  import type { WidgetRenderRequest } from "../core/index.ts";

  /** One resolved series — mirrors the Sistema EChart SeriesData contract. */
  interface ResolvedSeries {
    name: string;
    type: "bar" | "line" | "area" | "scatter" | "pie";
    data: number[];
    stack?: string;
    axis?: "primary" | "secondary";
  }

  /** The already-resolved chart model this widget renders. No rows, no schema. */
  interface ResolvedChartModel {
    category: string[];
    series: ResolvedSeries[];
  }

  let { data, props, locale }: WidgetRenderRequest = $props();

  function asModel(value: unknown): ResolvedChartModel {
    if (!value || typeof value !== "object") return { category: [], series: [] };
    const v = value as { category?: unknown; series?: unknown };
    return {
      category: Array.isArray(v.category) ? (v.category as string[]) : [],
      series: Array.isArray(v.series) ? (v.series as ResolvedSeries[]) : [],
    };
  }

  const model = $derived(asModel(data));

  // Presentation options — all caller-supplied (string-free: undefined labels
  // fall through to EChart's own defaults).
  const caption = $derived(
    typeof props.caption === "string" ? props.caption : undefined,
  );
  const labelHeader = $derived(
    typeof props.labelHeader === "string" ? props.labelHeader : undefined,
  );
  const legend = $derived(
    typeof props.legend === "boolean" ? props.legend : model.series.length > 1,
  );
  const orientation = $derived(
    props.orientation === "horizontal" || props.orientation === "vertical"
      ? props.orientation
      : undefined,
  );
  const ySecondary = $derived(props.ySecondary === true);
  const innerRadius = $derived(
    typeof props.innerRadius === "number" ? props.innerRadius : 0,
  );
  const height = $derived(
    typeof props.height === "string" ? props.height : undefined,
  );
</script>

<!-- Passing `undefined` for a caller-omitted label/height lets EChart apply its
     own default (Svelte uses the prop default when the value is undefined) — so
     this package ships no copy of its own. -->
<EChart
  category={model.category}
  series={model.series}
  {legend}
  {orientation}
  {ySecondary}
  {innerRadius}
  {caption}
  {labelHeader}
  {height}
  locale={locale ?? "en"}
/>
