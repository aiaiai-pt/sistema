<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Callout from '$lib/components/Callout.svelte';

	interface SpaceToken {
		name: string;
		var: string;
		px: string;
		usage: string;
	}

	const scale: SpaceToken[] = [
		{ name: '--space-xs', var: 'var(--space-xs)', px: '4px', usage: 'Inline icon gaps, tight internal padding' },
		{ name: '--space-sm', var: 'var(--space-sm)', px: '8px', usage: 'Default icon-to-label gap, compact padding' },
		{ name: '--space-md', var: 'var(--space-md)', px: '16px', usage: 'Standard padding, between related elements' },
		{ name: '--space-lg', var: 'var(--space-lg)', px: '24px', usage: 'Between sections, card padding' },
		{ name: '--space-xl', var: 'var(--space-xl)', px: '32px', usage: 'Major section breaks' },
		{ name: '--space-2xl', var: 'var(--space-2xl)', px: '48px', usage: 'Page-level spacing' },
		{ name: '--space-3xl', var: 'var(--space-3xl)', px: '64px', usage: 'Hero spacing, page margins on desktop' },
		{ name: '--space-4xl', var: 'var(--space-4xl)', px: '96px', usage: 'Maximum breathing room' }
	];
</script>

<svelte:head>
	<title>Spacing — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Spacing"
	description="8px base grid. Named tokens from xs (4px) to 4xl (96px). The only exception is xs at 4px — used for micro-spacing within tight component internals. All layout spacing uses 8px multiples."
/>

<!-- Visual bar scale -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Scale</h2>
	<div class="scale-list">
		{#each scale as token}
			<div class="scale-row">
				<div class="scale-bar-container">
					<div class="scale-bar" style="width: {token.var}; height: {token.var};"></div>
				</div>
				<div class="scale-meta">
					<code class="type-data token-name">{token.name}</code>
					<span class="type-label">{token.px}</span>
					<span class="type-caption">{token.usage}</span>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- Side-by-side comparison -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Side-by-Side Comparison</h2>
	<div class="comparison-row">
		{#each scale as token}
			<div class="comparison-item">
				<div class="comparison-bar" style="height: {token.var};"></div>
				<code class="type-data" style="font-size: var(--type-caption-size);">{token.px}</code>
			</div>
		{/each}
	</div>
</section>

<!-- Usage examples -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Usage in Context</h2>
	<div class="usage-grid">
		<div class="usage-card">
			<span class="type-label" style="margin-bottom: var(--space-xs); display: block;">COMPONENT INTERNAL</span>
			<div class="usage-demo" style="padding: var(--space-sm); border: var(--elevation-border); border-radius: var(--radius-sm);">
				<div style="display: flex; align-items: center; gap: var(--space-xs);">
					<div class="demo-icon"></div>
					<span class="type-label">LABEL</span>
				</div>
			</div>
			<span class="type-caption" style="margin-top: var(--space-xs);">xs (4px) gap between icon and label</span>
		</div>
		<div class="usage-card">
			<span class="type-label" style="margin-bottom: var(--space-xs); display: block;">CARD PADDING</span>
			<div class="usage-demo" style="padding: var(--space-lg); border: var(--elevation-border); border-radius: var(--radius-md);">
				<span class="type-body-sm">Card content sits inside lg (24px) padding.</span>
			</div>
			<span class="type-caption" style="margin-top: var(--space-xs);">lg (24px) for card internal padding</span>
		</div>
		<div class="usage-card">
			<span class="type-label" style="margin-bottom: var(--space-xs); display: block;">SECTION SPACING</span>
			<div class="usage-demo" style="border: var(--elevation-border); border-radius: var(--radius-sm); padding: var(--space-sm);">
				<div style="background: var(--color-surface-secondary); padding: var(--space-sm); border-radius: var(--radius-sm);">
					<span class="type-caption">Section A</span>
				</div>
				<div style="height: var(--space-2xl);"></div>
				<div style="background: var(--color-surface-secondary); padding: var(--space-sm); border-radius: var(--radius-sm);">
					<span class="type-caption">Section B</span>
				</div>
			</div>
			<span class="type-caption" style="margin-top: var(--space-xs);">2xl (48px) between major sections</span>
		</div>
	</div>
</section>

<!-- Key rule callout -->
<Callout title="KEY RULE">
	<p class="type-body">
		The 8px grid is <strong>non-negotiable</strong>. All layout spacing uses 8px multiples.
		The only exception is <code class="type-data">--space-xs</code> (4px), reserved for micro-spacing
		within tight component internals like icon-to-label gaps and badge padding.
	</p>
</Callout>

<style>
	.scale-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.scale-row {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
		padding: var(--space-md) var(--space-lg);
		background: var(--color-surface);
		border-bottom: var(--elevation-border);
	}

	.scale-row:last-child {
		border-bottom: none;
	}

	.scale-bar-container {
		flex-shrink: 0;
		width: 96px;
		display: flex;
		align-items: center;
	}

	.scale-bar {
		background: var(--color-accent);
		border-radius: var(--radius-sm);
		min-width: 4px;
		min-height: 4px;
	}

	.scale-meta {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}

	.token-name {
		font-size: var(--type-caption-size);
		color: var(--color-text);
	}

	.comparison-row {
		display: flex;
		align-items: flex-end;
		gap: var(--space-md);
		padding: var(--space-lg);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	.comparison-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
	}

	.comparison-bar {
		width: var(--space-lg);
		background: var(--color-accent);
		border-radius: var(--radius-sm);
		min-height: 4px;
	}

	.usage-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--space-md);
	}

	.usage-card {
		display: flex;
		flex-direction: column;
	}

	.usage-demo {
		background: var(--color-surface);
	}

	.demo-icon {
		width: 16px;
		height: 16px;
		background: var(--color-text-muted);
		border-radius: var(--radius-sm);
	}

</style>
