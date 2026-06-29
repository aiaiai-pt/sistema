<script lang="ts">
  import EChartWidget from "./EChartWidget.svelte";
  import type { WidgetProps } from "./types";

  // `donut-chart` registry key (#176 Tier 1). Thin wrapper binding the ECharts
  // `kind` to a ring pie — the registry maps this key here. Same aggregate data
  // path + a11y data table as the bar/line.
  let p: WidgetProps = $props();
</script>

<EChartWidget {...p} kind="donut" />
