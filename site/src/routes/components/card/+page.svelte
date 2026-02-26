<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import Card from '$ui/Card.svelte';
	import Skeleton from '$ui/Skeleton.svelte';

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
		<Card variant="flat">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">FLAT</span>
			<h3 class="type-heading-sm" style="margin-bottom: var(--space-xs);">No elevation</h3>
			<p class="type-body-sm">No border, no shadow. Used when the surface itself provides sufficient context, such as content within another container.</p>
			<code class="type-data card-token">--card-flat-border: none</code>
		</Card>

		<Card>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">BORDERED (DEFAULT)</span>
			<h3 class="type-heading-sm" style="margin-bottom: var(--space-xs);">Exposed structure</h3>
			<p class="type-body-sm">The default. A 1px border that makes the card's boundaries visible. This is the "exposed mechanism" — structure is shown, not implied.</p>
			<code class="type-data card-token">--card-bordered-border: var(--elevation-border)</code>
		</Card>

		<Card variant="elevated">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">ELEVATED</span>
			<h3 class="type-heading-sm" style="margin-bottom: var(--space-xs);">Floating</h3>
			<p class="type-body-sm">Warm shadow to indicate floating above the surface. Reserved for cards that need to feel lifted — feature highlights, promotional content.</p>
			<code class="type-data card-token">--card-elevated-shadow: var(--elevation-raised)</code>
		</Card>
	</div>
</section>

<!-- Interactive states -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Interactive States</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Hover and click these cards to see interactive states. Click to select/deselect.</p>
	<div class="card-grid">
		<Card interactive selected={selectedCard === 0} onclick={() => selectedCard = selectedCard === 0 ? null : 0}>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">
				{selectedCard === 0 ? 'SELECTED' : 'DEFAULT'}
			</span>
			<h3 class="type-heading-sm" style="margin-bottom: var(--space-xs);">Project Alpha</h3>
			<p class="type-body-sm">Click to select this card. Hover to see the interactive border state.</p>
			<div class="card-meta">
				<span class="type-data" style="font-size: var(--type-caption-size);">12 tasks</span>
				<span class="type-caption">Updated 2h ago</span>
			</div>
		</Card>

		<Card interactive selected={selectedCard === 1} onclick={() => selectedCard = selectedCard === 1 ? null : 1}>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">
				{selectedCard === 1 ? 'SELECTED' : 'DEFAULT'}
			</span>
			<h3 class="type-heading-sm" style="margin-bottom: var(--space-xs);">Project Beta</h3>
			<p class="type-body-sm">Another selectable card. The selected state uses the accent color border.</p>
			<div class="card-meta">
				<span class="type-data" style="font-size: var(--type-caption-size);">8 tasks</span>
				<span class="type-caption">Updated 5h ago</span>
			</div>
		</Card>

		<Card interactive selected={selectedCard === 2} onclick={() => selectedCard = selectedCard === 2 ? null : 2}>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">
				{selectedCard === 2 ? 'SELECTED' : 'DEFAULT'}
			</span>
			<h3 class="type-heading-sm" style="margin-bottom: var(--space-xs);">Project Gamma</h3>
			<p class="type-body-sm">Third selectable card demonstrates that selection is exclusive per this demo.</p>
			<div class="card-meta">
				<span class="type-data" style="font-size: var(--type-caption-size);">3 tasks</span>
				<span class="type-caption">Updated 1d ago</span>
			</div>
		</Card>
	</div>
</section>

<!-- Loading skeleton -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Loading Skeleton</h2>
	<div class="card-grid">
		<Card>
			<Skeleton width="40%" height="12px" />
			<Skeleton width="80%" height="16px" style="margin-top: var(--space-sm);" />
			<Skeleton width="100%" height="14px" style="margin-top: var(--space-xs);" />
			<Skeleton width="60%" height="14px" style="margin-top: var(--space-xs);" />
			<div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
				<Skeleton width="60px" height="12px" />
				<Skeleton width="80px" height="12px" />
			</div>
		</Card>
		<Card>
			<Skeleton width="50%" height="12px" />
			<Skeleton width="70%" height="16px" style="margin-top: var(--space-sm);" />
			<Skeleton width="90%" height="14px" style="margin-top: var(--space-xs);" />
			<Skeleton width="45%" height="14px" style="margin-top: var(--space-xs);" />
			<div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
				<Skeleton width="70px" height="12px" />
				<Skeleton width="50px" height="12px" />
			</div>
		</Card>
	</div>
</section>

<!-- Token reference -->
<TokenRef component="Cards" file="components.css" tokens={cardTokens} />

<style>
	/* Only demo layout — all card + skeleton CSS lives in the components */
	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: var(--space-md);
	}

	.card-token {
		font-size: var(--type-caption-size);
		color: var(--color-text-muted);
		margin-top: auto;
		padding-top: var(--space-md);
	}

	.card-meta {
		display: flex;
		gap: var(--space-md);
		margin-top: auto;
		padding-top: var(--space-md);
	}
</style>
