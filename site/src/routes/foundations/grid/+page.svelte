<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';

	const contentWidths = [
		{ name: '--content-width-narrow', px: '640px', usage: 'Prose, single-column content' },
		{ name: '--content-width', px: '960px', usage: 'Standard content area' },
		{ name: '--content-width-wide', px: '1200px', usage: 'Dashboard, multi-column layouts' },
		{ name: '--content-width-full', px: '1440px', usage: 'Maximum content width' }
	];

	const breakpoints = [
		{ name: '--breakpoint-sm', px: '640px', desc: 'Mobile landscape / large phone' },
		{ name: '--breakpoint-md', px: '768px', desc: 'Tablet portrait' },
		{ name: '--breakpoint-lg', px: '1024px', desc: 'Tablet landscape / small desktop' },
		{ name: '--breakpoint-xl', px: '1280px', desc: 'Desktop' }
	];
</script>

<svelte:head>
	<title>Grid — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Grid"
	description="Standard 12-column grid with responsive gutters and margins. Content width constraints from narrow (640px) to full (1440px)."
/>

<!-- 12-column grid visualization -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">12-Column Grid</h2>
	<div class="grid-demo">
		{#each Array(12) as _, i}
			<div class="grid-column">
				<span class="type-data grid-col-number">{i + 1}</span>
			</div>
		{/each}
	</div>
	<div class="grid-info">
		<div class="grid-info-item">
			<span class="type-label">COLUMNS</span>
			<span class="type-data">12</span>
		</div>
		<div class="grid-info-item">
			<span class="type-label">GUTTER</span>
			<span class="type-data">16px / 24px</span>
			<span class="type-caption">Mobile / Desktop</span>
		</div>
		<div class="grid-info-item">
			<span class="type-label">MARGIN</span>
			<span class="type-data">16px / 48px</span>
			<span class="type-caption">Mobile / Desktop</span>
		</div>
	</div>
</section>

<!-- Content width constraints -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Content Widths</h2>
	<div class="width-demo-container">
		{#each contentWidths as width}
			<div class="width-bar-row">
				<div class="width-bar" style="max-width: {width.px};">
					<div class="width-bar-inner">
						<code class="type-data width-label">{width.name}</code>
						<span class="type-caption">{width.px}</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
	<div class="width-table">
		{#each contentWidths as width}
			<div class="width-table-row">
				<code class="type-data" style="font-size: var(--type-caption-size);">{width.name}</code>
				<span class="type-label">{width.px}</span>
				<span class="type-caption">{width.usage}</span>
			</div>
		{/each}
	</div>
</section>

<!-- Breakpoints -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Breakpoints</h2>
	<div class="breakpoint-table">
		<div class="breakpoint-header">
			<span class="type-label">TOKEN</span>
			<span class="type-label">VALUE</span>
			<span class="type-label">DESCRIPTION</span>
		</div>
		{#each breakpoints as bp}
			<div class="breakpoint-row">
				<code class="type-data" style="font-size: var(--type-caption-size);">{bp.name}</code>
				<span class="type-data">{bp.px}</span>
				<span class="type-body-sm">{bp.desc}</span>
			</div>
		{/each}
	</div>
</section>

<!-- Responsive gutter/margin -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Responsive Behavior</h2>
	<div class="responsive-grid">
		<div class="responsive-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">MOBILE (&lt;1024px)</span>
			<div class="responsive-demo">
				<div class="margin-indicator" style="width: var(--space-md);">
					<span class="type-caption">16</span>
				</div>
				<div class="gutter-demo">
					<div class="gutter-col"></div>
					<div class="gutter-indicator" style="width: var(--space-md);">
						<span class="type-caption">16</span>
					</div>
					<div class="gutter-col"></div>
				</div>
				<div class="margin-indicator" style="width: var(--space-md);">
					<span class="type-caption">16</span>
				</div>
			</div>
			<span class="type-caption" style="margin-top: var(--space-sm);">Gutter: --space-md (16px), Margin: --space-md (16px)</span>
		</div>
		<div class="responsive-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">DESKTOP (&ge;1024px)</span>
			<div class="responsive-demo">
				<div class="margin-indicator" style="width: var(--space-2xl);">
					<span class="type-caption">48</span>
				</div>
				<div class="gutter-demo">
					<div class="gutter-col"></div>
					<div class="gutter-indicator" style="width: var(--space-lg);">
						<span class="type-caption">24</span>
					</div>
					<div class="gutter-col"></div>
				</div>
				<div class="margin-indicator" style="width: var(--space-2xl);">
					<span class="type-caption">48</span>
				</div>
			</div>
			<span class="type-caption" style="margin-top: var(--space-sm);">Gutter: --space-lg (24px), Margin: --space-2xl (48px)</span>
		</div>
	</div>
</section>

<style>
	.grid-demo {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: var(--space-sm);
		padding: var(--space-md);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		margin-bottom: var(--space-md);
		overflow-x: auto;
	}

	.grid-column {
		background: var(--color-accent-subtle);
		border: var(--border-width) solid var(--color-accent);
		border-radius: var(--radius-sm);
		padding: var(--space-md) 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.grid-col-number {
		font-size: var(--type-caption-size);
		color: var(--color-accent);
		display: none;
	}

	@media (min-width: 768px) {
		.grid-col-number {
			display: inline;
		}
	}

	.grid-info {
		display: flex;
		gap: var(--space-xl);
		flex-wrap: wrap;
	}

	.grid-info-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.width-demo-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		margin-bottom: var(--space-lg);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		background: var(--color-surface);
		overflow: hidden;
	}

	.width-bar-row {
		width: 100%;
	}

	.width-bar {
		width: 100%;
		background: var(--color-surface-secondary);
		border: var(--elevation-border);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.width-bar-inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-sm) var(--space-md);
	}

	.width-label {
		font-size: var(--type-caption-size);
	}

	.width-table {
		display: flex;
		flex-direction: column;
		gap: var(--border-width);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.width-table-row {
		display: grid;
		grid-template-columns: 1fr auto 2fr;
		gap: var(--space-md);
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border-bottom: var(--elevation-border);
	}

	.width-table-row:last-child {
		border-bottom: none;
	}

	.breakpoint-table {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow-x: auto;
	}

	.breakpoint-header {
		display: grid;
		grid-template-columns: 1fr 1fr 2fr;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-secondary);
		border-bottom: var(--elevation-border);
		min-width: 480px;
	}

	.breakpoint-row {
		display: grid;
		grid-template-columns: 1fr 1fr 2fr;
		gap: var(--space-md);
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border-bottom: var(--elevation-border);
		min-width: 480px;
	}

	.breakpoint-row:last-child {
		border-bottom: none;
	}

	.responsive-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.responsive-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.responsive-card {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
	}

	.responsive-demo {
		display: flex;
		align-items: stretch;
		height: var(--space-3xl);
		border: var(--elevation-border);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.margin-indicator {
		background: var(--color-accent-subtle);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.gutter-demo {
		flex: 1;
		display: flex;
		align-items: stretch;
	}

	.gutter-col {
		flex: 1;
		background: var(--color-surface-secondary);
	}

	.gutter-indicator {
		background: var(--color-surface-tertiary);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
</style>
