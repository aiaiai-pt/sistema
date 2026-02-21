<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import DemoGrid from '$lib/components/DemoGrid.svelte';
	import StateCard from '$lib/components/StateCard.svelte';

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
			<button class="btn btn-primary btn-md">
				<span class="btn-label">PRIMARY</span>
			</button>
			<code class="type-caption">Primary</code>
		</div>
		<div class="demo-item">
			<button class="btn btn-secondary btn-md">
				<span class="btn-label">SECONDARY</span>
			</button>
			<code class="type-caption">Secondary</code>
		</div>
		<div class="demo-item">
			<button class="btn btn-ghost btn-md">
				<span class="btn-label">GHOST</span>
			</button>
			<code class="type-caption">Ghost</code>
		</div>
		<div class="demo-item">
			<button class="btn btn-destructive btn-md">
				<span class="btn-label">DESTRUCTIVE</span>
			</button>
			<code class="type-caption">Destructive</code>
		</div>
	</div>
</section>

<!-- Sizes -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Sizes</h2>
	<div class="demo-row" style="align-items: flex-end;">
		<div class="demo-item">
			<button class="btn btn-primary btn-sm">
				<span class="btn-label">SMALL</span>
			</button>
			<code class="type-caption">sm (28px)</code>
		</div>
		<div class="demo-item">
			<button class="btn btn-primary btn-md">
				<span class="btn-label">MEDIUM</span>
			</button>
			<code class="type-caption">md (36px)</code>
		</div>
		<div class="demo-item">
			<button class="btn btn-primary btn-lg">
				<span class="btn-label">LARGE</span>
			</button>
			<code class="type-caption">lg (44px)</code>
		</div>
	</div>
</section>

<!-- States -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">States</h2>
	<DemoGrid>
		<StateCard label="DEFAULT">
			<button class="btn btn-primary btn-md">
				<span class="btn-label">ACTION</span>
			</button>
		</StateCard>

		<StateCard label="HOVER">
			<button class="btn btn-primary btn-md force-hover">
				<span class="btn-label">ACTION</span>
			</button>
			<span class="type-caption">Hover over any button to see</span>
		</StateCard>

		<StateCard label="FOCUSED">
			<button class="btn btn-primary btn-md force-focus">
				<span class="btn-label">ACTION</span>
			</button>
			<span class="type-caption">Focus ring via :focus-visible</span>
		</StateCard>

		<StateCard label="ACTIVE">
			<button class="btn btn-primary btn-md force-active">
				<span class="btn-label">ACTION</span>
			</button>
		</StateCard>

		<StateCard label="DISABLED">
			<button class="btn btn-primary btn-md" disabled>
				<span class="btn-label">ACTION</span>
			</button>
		</StateCard>

		<StateCard label="LOADING">
			<button class="btn btn-primary btn-md btn-loading" onclick={simulateLoading} disabled={loading}>
				{#if loading}
					<span class="spinner"></span>
					<span class="btn-label">LOADING</span>
				{:else}
					<span class="btn-label">CLICK ME</span>
				{/if}
			</button>
		</StateCard>

		<StateCard label="WITH ICON">
			<button class="btn btn-primary btn-md">
				<svg class="btn-icon" viewBox="0 0 16 16" fill="none">
					<path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
				<span class="btn-label">CREATE</span>
			</button>
		</StateCard>

		<StateCard label="ICON ONLY">
			<button class="btn btn-secondary btn-md btn-icon-only" aria-label="Add">
				<svg class="btn-icon" viewBox="0 0 16 16" fill="none">
					<path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</button>
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
			<button class="btn btn-primary btn-md"><span class="btn-label">LABEL</span></button>
			<button class="btn btn-primary btn-md" disabled><span class="btn-label">LABEL</span></button>
		</div>
		<div class="variant-table-row">
			<span class="type-label">SECONDARY</span>
			<button class="btn btn-secondary btn-md"><span class="btn-label">LABEL</span></button>
			<button class="btn btn-secondary btn-md" disabled><span class="btn-label">LABEL</span></button>
		</div>
		<div class="variant-table-row">
			<span class="type-label">GHOST</span>
			<button class="btn btn-ghost btn-md"><span class="btn-label">LABEL</span></button>
			<button class="btn btn-ghost btn-md" disabled><span class="btn-label">LABEL</span></button>
		</div>
		<div class="variant-table-row">
			<span class="type-label">DESTRUCTIVE</span>
			<button class="btn btn-destructive btn-md"><span class="btn-label">LABEL</span></button>
			<button class="btn btn-destructive btn-md" disabled><span class="btn-label">LABEL</span></button>
		</div>
	</div>
</section>

<!-- Token reference -->
<TokenRef component="Buttons" file="components.css" tokens={buttonTokens} />

<style>
	/* ─── Base button ─── */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		font-family: var(--button-font);
		letter-spacing: var(--button-tracking);
		border-radius: var(--button-radius);
		border: none;
		cursor: pointer;
		transition: all var(--button-transition);
		white-space: nowrap;
		text-decoration: none;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn.force-focus {
		outline: var(--focus-ring-width) solid var(--focus-ring-color);
		outline-offset: var(--focus-ring-offset);
	}

	/* ─── Sizes ─── */
	.btn-sm {
		height: var(--button-sm-height);
		padding: 0 var(--button-sm-padding-x);
		font-size: var(--button-sm-font-size);
	}

	.btn-md {
		height: var(--button-md-height);
		padding: 0 var(--button-md-padding-x);
		font-size: var(--button-md-font-size);
	}

	.btn-lg {
		height: var(--button-lg-height);
		padding: 0 var(--button-lg-padding-x);
		font-size: var(--button-lg-font-size);
	}

	/* ─── Primary ─── */
	.btn-primary {
		background: var(--button-primary-bg);
		color: var(--button-primary-text);
		border: var(--button-primary-border);
	}

	.btn-primary:hover:not(:disabled),
	.btn-primary.force-hover {
		background: var(--button-primary-bg-hover);
	}

	.btn-primary:active:not(:disabled),
	.btn-primary.force-active {
		background: var(--button-primary-bg-hover);
		transform: scale(0.97);
	}

	/* ─── Secondary ─── */
	.btn-secondary {
		background: var(--button-secondary-bg);
		color: var(--button-secondary-text);
		border: var(--button-secondary-border);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--button-secondary-bg-hover);
	}

	.btn-secondary:active:not(:disabled) {
		background: var(--button-secondary-bg-hover);
		transform: scale(0.97);
	}

	/* ─── Ghost ─── */
	.btn-ghost {
		background: var(--button-ghost-bg);
		color: var(--button-ghost-text);
		border: var(--button-ghost-border);
	}

	.btn-ghost:hover:not(:disabled) {
		background: var(--button-ghost-bg-hover);
	}

	.btn-ghost:active:not(:disabled) {
		background: var(--button-ghost-bg-hover);
		transform: scale(0.97);
	}

	/* ─── Destructive ─── */
	.btn-destructive {
		background: var(--button-destructive-bg);
		color: var(--button-destructive-text);
		border: var(--button-destructive-border);
	}

	.btn-destructive:hover:not(:disabled) {
		background: var(--button-destructive-bg-hover);
	}

	.btn-destructive:active:not(:disabled) {
		background: var(--button-destructive-bg-hover);
		transform: scale(0.97);
	}

	/* ─── Label ─── */
	.btn-label {
		font-family: inherit;
		font-size: inherit;
		letter-spacing: inherit;
	}

	/* ─── Icon ─── */
	.btn-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	.btn-icon-only {
		padding: 0;
		width: var(--button-md-height);
	}

	/* ─── Spinner ─── */
	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: var(--radius-circle);
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* ─── Layout ─── */
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
		overflow: hidden;
	}

	.variant-table-header {
		display: grid;
		grid-template-columns: 120px 1fr 1fr;
		gap: var(--space-md);
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-secondary);
		border-bottom: var(--elevation-border);
	}

	.variant-table-row {
		display: grid;
		grid-template-columns: 120px 1fr 1fr;
		gap: var(--space-md);
		align-items: center;
		padding: var(--space-md);
		background: var(--color-surface);
		border-bottom: var(--elevation-border);
	}

	.variant-table-row:last-child {
		border-bottom: none;
	}
</style>
