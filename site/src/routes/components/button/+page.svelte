<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import DemoGrid from '$lib/components/DemoGrid.svelte';
	import StateCard from '$lib/components/StateCard.svelte';
	import Button from '$ui/Button.svelte';

	let loading = $state(false);

	function simulateLoading() {
		loading = true;
		setTimeout(() => { loading = false; }, 2000);
	}

	const buttonTokens = [
		'--button-font: var(--type-label-font)',
		'--button-radius: var(--radius-md)',
		'--button-transition: var(--duration-instant) var(--easing-default)',
		'--button-primary-bg: var(--color-accent)',
		'--button-md-height: 36px'
	];

	const plusIcon = `<svg viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
</script>

<svelte:head>
	<title>Button — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Button"
	description="Four variants, three sizes. Labels are always Berkeley Mono (uppercase tracking). Styled with component tokens from components.css."
/>

<!-- Variants -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Variants</h2>
	<div class="demo-row">
		<div class="demo-item">
			<Button variant="primary">PRIMARY</Button>
			<code class="type-caption">Primary</code>
		</div>
		<div class="demo-item">
			<Button variant="secondary">SECONDARY</Button>
			<code class="type-caption">Secondary</code>
		</div>
		<div class="demo-item">
			<Button variant="ghost">GHOST</Button>
			<code class="type-caption">Ghost</code>
		</div>
		<div class="demo-item">
			<Button variant="destructive">DESTRUCTIVE</Button>
			<code class="type-caption">Destructive</code>
		</div>
	</div>
</section>

<!-- Sizes -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Sizes</h2>
	<div class="demo-row" style="align-items: flex-end;">
		<div class="demo-item">
			<Button variant="primary" size="sm">SMALL</Button>
			<code class="type-caption">sm (28px)</code>
		</div>
		<div class="demo-item">
			<Button variant="primary" size="md">MEDIUM</Button>
			<code class="type-caption">md (36px)</code>
		</div>
		<div class="demo-item">
			<Button variant="primary" size="lg">LARGE</Button>
			<code class="type-caption">lg (44px)</code>
		</div>
	</div>
</section>

<!-- States -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">States</h2>
	<DemoGrid>
		<StateCard label="DEFAULT">
			<Button variant="primary">ACTION</Button>
		</StateCard>

		<StateCard label="HOVER">
			<Button variant="primary">ACTION</Button>
			<span class="type-caption">Hover over the button to see</span>
		</StateCard>

		<StateCard label="FOCUSED">
			<Button variant="primary">ACTION</Button>
			<span class="type-caption">Focus ring via :focus-visible</span>
		</StateCard>

		<StateCard label="DISABLED">
			<Button variant="primary" disabled>ACTION</Button>
		</StateCard>

		<StateCard label="LOADING">
			<Button variant="primary" {loading} onclick={simulateLoading}>
				{loading ? 'LOADING' : 'CLICK ME'}
			</Button>
		</StateCard>

		<StateCard label="WITH ICON">
			<Button variant="primary">
				{#snippet icon()}
					<svg viewBox="0 0 16 16" fill="none">
						<path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				{/snippet}
				CREATE
			</Button>
		</StateCard>

		<StateCard label="ICON ONLY">
			<Button variant="secondary" iconOnly aria-label="Add">
				{#snippet icon()}
					<svg viewBox="0 0 16 16" fill="none">
						<path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				{/snippet}
			</Button>
		</StateCard>
	</DemoGrid>
</section>

<!-- All variants with states -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">All Variants (hover to interact)</h2>
	<div class="variant-table">
		<div class="variant-table-header">
			<span class="type-label">VARIANT</span>
			<span class="type-label">DEFAULT</span>
			<span class="type-label">DISABLED</span>
		</div>
		<div class="variant-table-row">
			<span class="type-label">PRIMARY</span>
			<Button variant="primary">LABEL</Button>
			<Button variant="primary" disabled>LABEL</Button>
		</div>
		<div class="variant-table-row">
			<span class="type-label">SECONDARY</span>
			<Button variant="secondary">LABEL</Button>
			<Button variant="secondary" disabled>LABEL</Button>
		</div>
		<div class="variant-table-row">
			<span class="type-label">GHOST</span>
			<Button variant="ghost">LABEL</Button>
			<Button variant="ghost" disabled>LABEL</Button>
		</div>
		<div class="variant-table-row">
			<span class="type-label">DESTRUCTIVE</span>
			<Button variant="destructive">LABEL</Button>
			<Button variant="destructive" disabled>LABEL</Button>
		</div>
	</div>
</section>

<!-- Token reference -->
<TokenRef component="Buttons" file="components.css" tokens={buttonTokens} />

<style>
	/* Only demo layout — all button CSS now lives in the Button component */
	.demo-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
		align-items: center;
		padding: var(--space-lg);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
	}

	.demo-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
	}

	.variant-table {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow-x: auto;
	}

	.variant-table-header {
		display: grid;
		grid-template-columns: 120px 1fr 1fr;
		gap: var(--space-md);
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-secondary);
		border-bottom: var(--elevation-border);
		min-width: 480px;
	}

	.variant-table-row {
		display: grid;
		grid-template-columns: 120px 1fr 1fr;
		gap: var(--space-md);
		align-items: center;
		padding: var(--space-md);
		background: var(--color-surface);
		border-bottom: var(--elevation-border);
		min-width: 480px;
	}

	.variant-table-row:last-child {
		border-bottom: none;
	}
</style>
