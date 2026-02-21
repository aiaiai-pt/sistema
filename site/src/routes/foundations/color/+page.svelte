<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';

	interface ColorToken {
		name: string;
		var: string;
		role: string;
	}

	const surfaces: ColorToken[] = [
		{ name: '--color-surface', var: 'var(--color-surface)', role: 'Primary background. Aged paper.' },
		{ name: '--color-surface-secondary', var: 'var(--color-surface-secondary)', role: 'Recessed areas, sidebars.' },
		{ name: '--color-surface-tertiary', var: 'var(--color-surface-tertiary)', role: 'Deep nesting, active states.' }
	];

	const borders: ColorToken[] = [
		{ name: '--color-border', var: 'var(--color-border)', role: 'Default structural borders.' },
		{ name: '--color-border-strong', var: 'var(--color-border-strong)', role: 'Emphasized borders, focus.' }
	];

	const texts: ColorToken[] = [
		{ name: '--color-text', var: 'var(--color-text)', role: 'Primary text. Never pure black.' },
		{ name: '--color-text-secondary', var: 'var(--color-text-secondary)', role: 'Descriptions, metadata.' },
		{ name: '--color-text-muted', var: 'var(--color-text-muted)', role: 'Placeholders, disabled.' }
	];

	const accents: ColorToken[] = [
		{ name: '--color-accent', var: 'var(--color-accent)', role: 'Orange. Creation, focus, primary action.' },
		{ name: '--color-accent-hover', var: 'var(--color-accent-hover)', role: 'Accent hover state.' },
		{ name: '--color-accent-subtle', var: 'var(--color-accent-subtle)', role: 'Accent background tint.' }
	];

	const semantic: ColorToken[] = [
		{ name: '--color-destructive', var: 'var(--color-destructive)', role: 'Red. Danger, errors, deletion.' },
		{ name: '--color-destructive-subtle', var: 'var(--color-destructive-subtle)', role: 'Destructive background.' },
		{ name: '--color-success', var: 'var(--color-success)', role: 'Green. Confirmation, positive.' },
		{ name: '--color-success-subtle', var: 'var(--color-success-subtle)', role: 'Success background.' },
		{ name: '--color-warning', var: 'var(--color-warning)', role: 'Amber. Caution, attention.' },
		{ name: '--color-warning-subtle', var: 'var(--color-warning-subtle)', role: 'Warning background.' },
		{ name: '--color-info', var: 'var(--color-info)', role: 'Blue. Information, links.' },
		{ name: '--color-info-subtle', var: 'var(--color-info-subtle)', role: 'Info background.' }
	];
</script>

<svelte:head>
	<title>Color — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Color"
	description="Warm earth tones with decisive semantic color. Every color has a job. All neutrals have a warm undertone (OKLCH hue ~55). Never pure black, never clinical white."
/>

<section class="color-section">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Surfaces</h2>
	<div class="swatch-grid">
		{#each surfaces as token}
			<div class="swatch-card">
				<div class="swatch" style="background: {token.var}; border: var(--elevation-border);"></div>
				<code class="type-data swatch-name">{token.name}</code>
				<span class="type-caption">{token.role}</span>
			</div>
		{/each}
	</div>
</section>

<section class="color-section">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Borders</h2>
	<div class="swatch-grid">
		{#each borders as token}
			<div class="swatch-card">
				<div class="swatch" style="background: {token.var};"></div>
				<code class="type-data swatch-name">{token.name}</code>
				<span class="type-caption">{token.role}</span>
			</div>
		{/each}
	</div>
</section>

<section class="color-section">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Text</h2>
	<div class="swatch-grid">
		{#each texts as token}
			<div class="swatch-card">
				<div class="swatch" style="background: {token.var};"></div>
				<code class="type-data swatch-name">{token.name}</code>
				<span class="type-caption">{token.role}</span>
			</div>
		{/each}
	</div>
</section>

<section class="color-section">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Accent</h2>
	<div class="swatch-grid">
		{#each accents as token}
			<div class="swatch-card">
				<div class="swatch" style="background: {token.var};"></div>
				<code class="type-data swatch-name">{token.name}</code>
				<span class="type-caption">{token.role}</span>
			</div>
		{/each}
	</div>
</section>

<section class="color-section">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Semantic</h2>
	<div class="swatch-grid swatch-grid-sm">
		{#each semantic as token}
			<div class="swatch-card">
				<div class="swatch swatch-sm" style="background: {token.var};"></div>
				<code class="type-data swatch-name">{token.name}</code>
				<span class="type-caption">{token.role}</span>
			</div>
		{/each}
	</div>
</section>

<style>
	.color-section {
		margin-bottom: var(--space-2xl);
	}

	.swatch-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-md);
	}

	.swatch-grid-sm {
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	}

	.swatch-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.swatch {
		width: 100%;
		height: 80px;
		border-radius: var(--radius-md);
	}

	.swatch-sm {
		height: 48px;
	}

	.swatch-name {
		color: var(--color-text);
		font-size: var(--type-caption-size);
	}
</style>
