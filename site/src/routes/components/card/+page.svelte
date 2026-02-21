<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';

	let selectedCard = $state<number | null>(null);

	const cardTokens = [
		'--card-radius: var(--radius-md) (4px)',
		'--card-padding: var(--space-lg) (24px)',
		'--card-bg: var(--color-surface)',
		'--card-bordered-border: var(--elevation-border)',
		'--card-interactive-hover-border: var(--elevation-border-strong)',
		'--card-selected-border-color: var(--color-accent)'
	];
</script>

<svelte:head>
	<title>Card — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Card"
	description="Surface container with three variants: flat, bordered (default), and elevated. Content-agnostic — designed to hold any content. Bordered is the default, following the &quot;exposed mechanism&quot; philosophy."
/>

<!-- Variants -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Variants</h2>
	<div class="card-grid">
		<!-- Flat -->
		<div class="card card-flat">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">FLAT</span>
			<h3 class="type-heading-sm" style="margin-bottom: var(--space-xs);">No elevation</h3>
			<p class="type-body-sm">No border, no shadow. Used when the surface itself provides sufficient context, such as content within another container.</p>
			<code class="type-data card-token">--card-flat-border: none</code>
		</div>

		<!-- Bordered (default) -->
		<div class="card card-bordered">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">BORDERED (DEFAULT)</span>
			<h3 class="type-heading-sm" style="margin-bottom: var(--space-xs);">Exposed structure</h3>
			<p class="type-body-sm">The default. A 1px border that makes the card's boundaries visible. This is the "exposed mechanism" — structure is shown, not implied.</p>
			<code class="type-data card-token">--card-bordered-border: var(--elevation-border)</code>
		</div>

		<!-- Elevated -->
		<div class="card card-elevated">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">ELEVATED</span>
			<h3 class="type-heading-sm" style="margin-bottom: var(--space-xs);">Floating</h3>
			<p class="type-body-sm">Warm shadow to indicate floating above the surface. Reserved for cards that need to feel lifted — feature highlights, promotional content.</p>
			<code class="type-data card-token">--card-elevated-shadow: var(--elevation-raised)</code>
		</div>
	</div>
</section>

<!-- Interactive states -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Interactive States</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Hover and click these cards to see interactive states. Click to select/deselect.</p>
	<div class="card-grid">
		<!-- Interactive hover -->
		<button
			class="card card-bordered card-interactive"
			class:card-selected={selectedCard === 0}
			onclick={() => selectedCard = selectedCard === 0 ? null : 0}
		>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">
				{selectedCard === 0 ? 'SELECTED' : 'DEFAULT'}
			</span>
			<h3 class="type-heading-sm" style="margin-bottom: var(--space-xs);">Project Alpha</h3>
			<p class="type-body-sm">Click to select this card. Hover to see the interactive border state.</p>
			<div class="card-meta">
				<span class="type-data" style="font-size: var(--type-caption-size);">12 tasks</span>
				<span class="type-caption">Updated 2h ago</span>
			</div>
		</button>

		<button
			class="card card-bordered card-interactive"
			class:card-selected={selectedCard === 1}
			onclick={() => selectedCard = selectedCard === 1 ? null : 1}
		>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">
				{selectedCard === 1 ? 'SELECTED' : 'DEFAULT'}
			</span>
			<h3 class="type-heading-sm" style="margin-bottom: var(--space-xs);">Project Beta</h3>
			<p class="type-body-sm">Another selectable card. The selected state uses the accent color border.</p>
			<div class="card-meta">
				<span class="type-data" style="font-size: var(--type-caption-size);">8 tasks</span>
				<span class="type-caption">Updated 5h ago</span>
			</div>
		</button>

		<button
			class="card card-bordered card-interactive"
			class:card-selected={selectedCard === 2}
			onclick={() => selectedCard = selectedCard === 2 ? null : 2}
		>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">
				{selectedCard === 2 ? 'SELECTED' : 'DEFAULT'}
			</span>
			<h3 class="type-heading-sm" style="margin-bottom: var(--space-xs);">Project Gamma</h3>
			<p class="type-body-sm">Third selectable card demonstrates that selection is exclusive per this demo.</p>
			<div class="card-meta">
				<span class="type-data" style="font-size: var(--type-caption-size);">3 tasks</span>
				<span class="type-caption">Updated 1d ago</span>
			</div>
		</button>
	</div>
</section>

<!-- Loading skeleton -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Loading Skeleton</h2>
	<div class="card-grid">
		<div class="card card-bordered">
			<div class="skeleton skeleton-line" style="width: 40%; height: 12px;"></div>
			<div class="skeleton skeleton-line" style="width: 80%; height: 16px; margin-top: var(--space-sm);"></div>
			<div class="skeleton skeleton-line" style="width: 100%; height: 14px; margin-top: var(--space-xs);"></div>
			<div class="skeleton skeleton-line" style="width: 60%; height: 14px; margin-top: var(--space-xs);"></div>
			<div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
				<div class="skeleton skeleton-line" style="width: 60px; height: 12px;"></div>
				<div class="skeleton skeleton-line" style="width: 80px; height: 12px;"></div>
			</div>
		</div>
		<div class="card card-bordered">
			<div class="skeleton skeleton-line" style="width: 50%; height: 12px;"></div>
			<div class="skeleton skeleton-line" style="width: 70%; height: 16px; margin-top: var(--space-sm);"></div>
			<div class="skeleton skeleton-line" style="width: 90%; height: 14px; margin-top: var(--space-xs);"></div>
			<div class="skeleton skeleton-line" style="width: 45%; height: 14px; margin-top: var(--space-xs);"></div>
			<div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
				<div class="skeleton skeleton-line" style="width: 70px; height: 12px;"></div>
				<div class="skeleton skeleton-line" style="width: 50px; height: 12px;"></div>
			</div>
		</div>
	</div>
</section>

<!-- Token reference -->
<TokenRef component="Cards" file="components.css" tokens={cardTokens} />

<style>
	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: var(--space-md);
	}

	.card {
		border-radius: var(--card-radius);
		padding: var(--card-padding);
		background: var(--card-bg);
		transition: all var(--card-transition);
		text-align: left;
		display: flex;
		flex-direction: column;
	}

	.card-flat {
		border: var(--card-flat-border);
		box-shadow: var(--card-flat-shadow);
		background: var(--color-surface-secondary);
	}

	.card-bordered {
		border: var(--card-bordered-border);
		box-shadow: var(--card-bordered-shadow);
	}

	.card-elevated {
		border: var(--card-elevated-border);
		box-shadow: var(--card-elevated-shadow);
	}

	.card-token {
		font-size: var(--type-caption-size);
		color: var(--color-text-muted);
		margin-top: auto;
		padding-top: var(--space-md);
	}

	/* Interactive */
	.card-interactive {
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
	}

	.card-interactive:hover {
		border: var(--card-interactive-hover-border);
	}

	.card-interactive:active {
		background: var(--card-interactive-active-bg);
	}

	.card-selected {
		border-color: var(--card-selected-border-color);
	}

	.card-meta {
		display: flex;
		gap: var(--space-md);
		margin-top: auto;
		padding-top: var(--space-md);
	}

	/* Skeleton */
	.skeleton {
		background: var(--skeleton-bg);
		border-radius: var(--skeleton-radius);
		position: relative;
		overflow: hidden;
	}

	.skeleton::after {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, var(--skeleton-shine), transparent);
		animation: shimmer var(--skeleton-duration) infinite;
	}

	@keyframes shimmer {
		100% { left: 100%; }
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton::after {
			animation: none;
		}
	}

</style>
