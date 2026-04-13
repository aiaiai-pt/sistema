<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import StatCard from '$ui/StatCard.svelte';
	import StatGrid from '$ui/StatGrid.svelte';

	const statTokens = [
		'--stat-padding: var(--space-lg)',
		'--stat-radius: var(--radius-md)',
		'--stat-border: var(--elevation-border)',
		'--stat-value-font: var(--type-display-font)',
		'--stat-value-size: var(--type-display-size)',
		'--stat-label-font: var(--type-label-font) (Berkeley Mono)',
		'--stat-trend-up-color: var(--color-success)',
		'--stat-trend-down-color: var(--color-destructive)',
		'--stat-icon-size: var(--icon-size-lg)',
		'--stat-grid-gap: var(--space-md)',
	];
</script>

<svelte:head>
	<title>Stat Card — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Stat Card"
	description="KPI cards for dashboards. Large display-font value, mono label, optional trend indicator and icon. Color variants signal meaning. StatGrid renders a responsive 4-column layout."
/>

<!-- StatGrid: Full dashboard row -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">StatGrid</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Responsive 4-column grid (2 on mobile). Use as a dashboard KPI row above tables or charts.</p>

	<StatGrid>
		<StatCard label="TOTAL EQUIPMENT" value="1,247" trend={3.2} trendLabel="vs last month" />
		<StatCard label="ACTIVE" value="892" variant="success" trend={1.8} trendLabel="vs last month" />
		<StatCard label="OVERDUE MAINTENANCE" value="23" variant="error" trend={-12.5} trendLabel="vs last week" />
		<StatCard label="SCHEDULED THIS WEEK" value="47" variant="info" />
	</StatGrid>
</section>

<!-- Variants -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Variants</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Color variants change the value color. Label stays muted. Use to signal meaning: success for healthy metrics, error for problems.</p>

	<StatGrid>
		<StatCard label="NEUTRAL" value="1,247" />
		<StatCard label="SUCCESS" value="892" variant="success" />
		<StatCard label="WARNING" value="156" variant="warning" />
		<StatCard label="ERROR" value="23" variant="error" />
	</StatGrid>
</section>

<!-- Trend indicators -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Trend Indicators</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Pass a percentage change via the trend prop. Positive = green up arrow, negative = red down arrow, zero = neutral dash.</p>

	<StatGrid columns="3">
		<StatCard label="REVENUE" value="€48,200" trend={12.4} trendLabel="vs last quarter" />
		<StatCard label="INCIDENTS" value="7" variant="error" trend={-33.0} trendLabel="vs last month" />
		<StatCard label="UPTIME" value="99.97%" variant="success" trend={0} trendLabel="no change" />
	</StatGrid>
</section>

<!-- With icons -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">With Icons</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Icons render in the top-right corner. Pass any SVG or Phosphor icon via the icon snippet.</p>

	<StatGrid columns="3">
		<StatCard label="BUILDINGS" value="34">
			{#snippet icon()}
				<svg viewBox="0 0 256 256" fill="none">
					<rect x="48" y="40" width="160" height="176" rx="8" stroke="currentColor" stroke-width="16" fill="none" />
					<line x1="48" y1="112" x2="208" y2="112" stroke="currentColor" stroke-width="16" />
					<line x1="128" y1="112" x2="128" y2="216" stroke="currentColor" stroke-width="16" />
				</svg>
			{/snippet}
		</StatCard>
		<StatCard label="INSPECTIONS DUE" value="12" variant="warning">
			{#snippet icon()}
				<svg viewBox="0 0 256 256" fill="none">
					<circle cx="128" cy="128" r="96" stroke="currentColor" stroke-width="16" fill="none" />
					<line x1="128" y1="80" x2="128" y2="136" stroke="currentColor" stroke-width="16" stroke-linecap="round" />
					<circle cx="128" cy="172" r="8" fill="currentColor" />
				</svg>
			{/snippet}
		</StatCard>
		<StatCard label="COMPLETED TODAY" value="8" variant="success" trend={60.0}>
			{#snippet icon()}
				<svg viewBox="0 0 256 256" fill="none">
					<polyline points="88,136 112,160 168,104" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
					<circle cx="128" cy="128" r="96" stroke="currentColor" stroke-width="16" fill="none" />
				</svg>
			{/snippet}
		</StatCard>
	</StatGrid>
</section>

<!-- Loading -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Loading State</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Shows skeleton placeholders while data is being fetched.</p>

	<StatGrid>
		<StatCard loading />
		<StatCard loading />
		<StatCard loading />
		<StatCard loading />
	</StatGrid>
</section>

<!-- Token reference -->
<TokenRef component="StatCard" file="components.css" tokens={statTokens} />
