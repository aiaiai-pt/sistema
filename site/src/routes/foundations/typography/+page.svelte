<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Callout from '$lib/components/Callout.svelte';

	const scale = [
		{ class: 'type-display', label: 'Display', desc: 'Brand moments, hero sections', font: 'Instrument Sans 600' },
		{ class: 'type-heading-lg', label: 'Heading Large', desc: 'Page titles', font: 'Instrument Sans 500' },
		{ class: 'type-heading', label: 'Heading', desc: 'Section headings, card titles', font: 'Instrument Sans 500' },
		{ class: 'type-heading-sm', label: 'Heading Small', desc: 'Subsection headings', font: 'Instrument Sans 500' },
		{ class: 'type-body', label: 'Body', desc: 'Default prose', font: 'Instrument Sans 400' },
		{ class: 'type-body-sm', label: 'Body Small', desc: 'Secondary prose, help text', font: 'Instrument Sans 400' },
		{ class: 'type-label', label: 'LABEL', desc: 'Control labels, nav, tags', font: 'Berkeley Mono 400' },
		{ class: 'type-data', label: 'Data', desc: 'Numbers, times, code, metrics', font: 'Berkeley Mono 400' },
		{ class: 'type-caption', label: 'Caption', desc: 'Footnotes, fine print', font: 'Instrument Sans 400' }
	];
</script>

<svelte:head>
	<title>Typography — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Typography"
	description="Instrument Sans for prose (the Swiss canvas). Berkeley Mono for labels and data (the exposed mechanism). Every character earns its place."
/>

<!-- Font pairing showcase -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Font Pairing</h2>
	<div class="pairing-grid">
		<div class="pairing-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">SANS</span>
			<span style="font-family: var(--font-sans); font-size: 48px; font-weight: 600; line-height: 1.1; letter-spacing: -0.02em;">
				Instrument Sans
			</span>
			<p class="type-body-sm" style="margin-top: var(--space-sm);">
				Interface text, prose, headings. The quiet backdrop.
			</p>
		</div>
		<div class="pairing-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">MONO</span>
			<span style="font-family: var(--font-mono); font-size: 48px; font-weight: 400; line-height: 1.1;">
				Berkeley Mono
			</span>
			<p class="type-body-sm" style="margin-top: var(--space-sm);">
				Labels, data, numbers, code. The exposed mechanism.
			</p>
		</div>
	</div>
</section>

<!-- Type scale -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Type Scale</h2>
	<div class="scale-list">
		{#each scale as step}
			<div class="scale-row">
				<div class="scale-specimen">
					<span class={step.class} style="color: var(--color-text);">
						{step.label === 'LABEL' ? 'LABEL TEXT' : `The quick brown fox`}
					</span>
				</div>
				<div class="scale-meta">
					<code class="type-data" style="font-size: var(--type-caption-size);">.{step.class}</code>
					<span class="type-caption">{step.font}</span>
					<span class="type-caption">{step.desc}</span>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- Key rule callout -->
<Callout title="KEY RULE">
	<p class="type-body">
		Labels and data are <strong>always</strong> Berkeley Mono. This is the "exposed mechanism" —
		the interface reveals its structure through monospace type. Instrument Sans is the quiet
		backdrop for prose and headings.
	</p>
</Callout>

<style>
	.pairing-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-md);
	}

	.pairing-card {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
	}

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

	.scale-specimen {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.scale-meta {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 180px;
		text-align: right;
	}

</style>
