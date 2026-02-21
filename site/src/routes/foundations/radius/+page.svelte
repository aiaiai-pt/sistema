<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Callout from '$lib/components/Callout.svelte';

	const radii = [
		{ name: '--radius-sm', value: '2px', usage: 'Inputs, small controls, code blocks', raw: '--raw-radius-2' },
		{ name: '--radius-md', value: '4px', usage: 'Cards, containers, buttons', raw: '--raw-radius-4' },
		{ name: '--radius-lg', value: '8px', usage: 'Dialogs, large surfaces', raw: '--raw-radius-8' },
		{ name: '--radius-pill', value: '999px', usage: 'Tags, badges, toggles', raw: '--raw-radius-999' },
		{ name: '--radius-circle', value: '50%', usage: 'Avatars, status dots', raw: '--raw-radius-circle' }
	];
</script>

<svelte:head>
	<title>Radius — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Radius"
	description="Sharp by default. The mechanism is precise — tight radii for controls, slightly softer for containers, pills only for explicitly rounded elements. No soft, bubbly corners by default."
/>

<!-- Visual radius scale -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Scale</h2>
	<div class="radius-grid">
		{#each radii as r}
			<div class="radius-card">
				<div
					class="radius-demo"
					class:is-circle={r.name === '--radius-circle'}
					style="border-radius: var({r.name});"
				>
					<span class="type-data" style="font-size: var(--type-caption-size);">{r.value}</span>
				</div>
				<code class="type-data token-name">{r.name}</code>
				<span class="type-caption">{r.usage}</span>
			</div>
		{/each}
	</div>
</section>

<!-- In context -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">In Context</h2>
	<div class="context-grid">
		<div class="context-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">INPUT (SM)</span>
			<div class="context-demo">
				<input
					type="text"
					placeholder="Text input"
					class="demo-input"
					style="border-radius: var(--radius-sm);"
				/>
			</div>
			<code class="type-caption">--radius-sm (2px)</code>
		</div>
		<div class="context-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">BUTTON (MD)</span>
			<div class="context-demo">
				<button class="demo-button" style="border-radius: var(--radius-md);">
					<span class="type-label" style="color: var(--color-text-on-accent);">ACTION</span>
				</button>
			</div>
			<code class="type-caption">--radius-md (4px)</code>
		</div>
		<div class="context-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">CARD (MD)</span>
			<div class="context-demo">
				<div class="demo-card-context" style="border-radius: var(--radius-md);">
					<span class="type-body-sm">Card</span>
				</div>
			</div>
			<code class="type-caption">--radius-md (4px)</code>
		</div>
		<div class="context-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">DIALOG (LG)</span>
			<div class="context-demo">
				<div class="demo-dialog" style="border-radius: var(--radius-lg);">
					<span class="type-body-sm">Dialog</span>
				</div>
			</div>
			<code class="type-caption">--radius-lg (8px)</code>
		</div>
		<div class="context-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">TAG (PILL)</span>
			<div class="context-demo">
				<span class="demo-tag" style="border-radius: var(--radius-pill);">
					<span class="type-label" style="color: var(--color-text-secondary);">TAG</span>
				</span>
			</div>
			<code class="type-caption">--radius-pill (999px)</code>
		</div>
		<div class="context-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">AVATAR (CIRCLE)</span>
			<div class="context-demo">
				<div class="demo-avatar" style="border-radius: var(--radius-circle);">
					<span class="type-data" style="color: var(--color-text-on-accent);">A</span>
				</div>
			</div>
			<code class="type-caption">--radius-circle (50%)</code>
		</div>
	</div>
</section>

<!-- Key rule callout -->
<Callout title="KEY RULE">
	<p class="type-body">
		Sharp by default. The radius scale matches the "exposed mechanism" personality — precision
		instrument, not soft cushion. Pill (999px) and circle (50%) are special-purpose,
		used only for elements that explicitly need rounding (tags, badges, avatars, toggles).
	</p>
</Callout>

<style>
	.radius-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: var(--space-md);
	}

	.radius-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
		text-align: center;
	}

	.radius-demo {
		width: 96px;
		height: 96px;
		border: var(--border-width-thick) solid var(--color-accent);
		background: var(--color-accent-subtle);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.radius-demo.is-circle {
		width: 96px;
		height: 96px;
	}

	.token-name {
		font-size: var(--type-caption-size);
		color: var(--color-text);
	}

	.context-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-md);
	}

	.context-card {
		display: flex;
		flex-direction: column;
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
	}

	.context-demo {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--space-sm);
		min-height: 48px;
	}

	.demo-input {
		font-family: var(--input-font);
		font-size: var(--input-font-size);
		height: var(--input-md-height);
		padding: 0 var(--input-md-padding-x);
		border: var(--input-border);
		background: var(--input-bg);
		color: var(--input-text);
		width: 100%;
	}

	.demo-input::placeholder {
		color: var(--input-placeholder);
	}

	.demo-button {
		font-family: var(--button-font);
		font-size: var(--button-md-font-size);
		letter-spacing: var(--button-tracking);
		height: var(--button-md-height);
		padding: 0 var(--button-md-padding-x);
		background: var(--button-primary-bg);
		color: var(--button-primary-text);
		border: none;
		cursor: pointer;
	}

	.demo-card-context {
		border: var(--elevation-border);
		padding: var(--space-md);
		background: var(--color-surface);
		width: 100%;
	}

	.demo-dialog {
		box-shadow: var(--elevation-overlay);
		padding: var(--space-md);
		background: var(--color-surface);
		width: 100%;
	}

	.demo-tag {
		border: var(--elevation-border);
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface);
	}

	.demo-avatar {
		width: 40px;
		height: 40px;
		background: var(--color-accent);
		display: flex;
		align-items: center;
		justify-content: center;
	}

</style>
