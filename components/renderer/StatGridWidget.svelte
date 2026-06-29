<script lang="ts">
  import StatGrid from "../StatGrid.svelte";
  import StatCard from "../StatCard.svelte";
  import type { WidgetProps } from "./types";

  // `kpi` widget — public stat grid (counts, KPIs). Adapts a list of stat
  // items into DS StatCards inside a StatGrid. The public KPI read endpoint is
  // not wired yet (resolveData fails closed for `kind: "kpi"`); registered here
  // and fed once a slice adds the surface. Defensive over `data` (live) /
  // `props` (seeded preview).
  let { data, props }: WidgetProps = $props();

  interface Stat {
    label?: string;
    value?: string;
    variant?: string;
  }

  const view = $derived((data ?? {}) as Record<string, unknown>);
  const stats = $derived<Stat[]>(
    (Array.isArray(view.stats)
      ? view.stats
      : Array.isArray(props.stats)
        ? props.stats
        : []) as Stat[],
  );
</script>

<StatGrid>
  {#each stats as stat (stat.label)}
    <StatCard label={stat.label} value={stat.value} variant={stat.variant} />
  {/each}
</StatGrid>
