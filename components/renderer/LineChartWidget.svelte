<script lang="ts">
  import EChartWidget from "./EChartWidget.svelte";
  import type { WidgetProps } from "./types";

  // `line-chart` registry key (#176 Tier 1). Thin wrapper that binds the ECharts
  // `kind` the dispatcher can't pass — the registry maps this key to this
  // component, which renders the shared EChart widget as a line. Same aggregate
  // data path + a11y data table as the bar.
  let p: WidgetProps = $props();
</script>

<EChartWidget {...p} kind="line" />
