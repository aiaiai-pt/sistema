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
    /** #517 — optional Phosphor icon NAME (kebab-case, e.g. "chart-bar"),
     * rendered via the Phosphor web font. Lets a dashboard KPI block carry its
     * per-card icon through the DS widget, so KPI renders via `resolveWidget`
     * like every other block (no host-side StatCard special-case). */
    icon?: string;
  }

  const view = $derived((data ?? {}) as Record<string, unknown>);
  const stats = $derived<Stat[]>(
    (Array.isArray(view.stats)
      ? view.stats
      : Array.isArray(props.stats)
        ? props.stats
        : []) as Stat[],
  );

  // Phosphor web-font class names are kebab-case (`ph ph-chart-bar`); keep only
  // the safe charset so a bad name can't leak into `class` (defensive — attribute
  // values are escaped, but this keeps the class well-formed).
  const iconClass = (name: string): string => `ph ph-${name.replace(/[^a-z0-9-]/gi, "")}`;
</script>

<StatGrid>
  {#each stats as stat (stat.label)}
    {#snippet cardIcon()}<i class={iconClass(stat.icon ?? "")} aria-hidden="true"></i>{/snippet}
    <StatCard
      label={stat.label}
      value={stat.value}
      variant={stat.variant}
      icon={stat.icon ? cardIcon : undefined}
    />
  {/each}
</StatGrid>
