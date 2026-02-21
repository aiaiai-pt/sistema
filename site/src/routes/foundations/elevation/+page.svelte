<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Callout from '$lib/components/Callout.svelte';
</script>

<svelte:head>
	<title>Elevation — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Elevation"
	description="Borders over shadows. The exposed mechanism aesthetic means structure is visible through borders, not implied through shadows. Shadows are reserved for elements that float above the page plane."
/>

<!-- Elevation levels -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Elevation Levels</h2>
	<div class="elevation-grid">
		<div class="elevation-card elevation-none">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">FLAT / NONE</span>
			<p class="type-body-sm">No elevation. No border, no shadow. Used when the surface itself is enough.</p>
			<code class="type-data token-ref">elevation: none</code>
		</div>

		<div class="elevation-card elevation-border">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">BORDER (DEFAULT)</span>
			<p class="type-body-sm">1px solid border. The default for cards, inputs, dividers. Visible structure.</p>
			<code class="type-data token-ref">--elevation-border</code>
		</div>

		<div class="elevation-card elevation-border-strong">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">BORDER STRONG</span>
			<p class="type-body-sm">Emphasized border. Active state, focus, hover on interactive elements.</p>
			<code class="type-data token-ref">--elevation-border-strong</code>
		</div>

		<div class="elevation-card elevation-raised">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">RAISED</span>
			<p class="type-body-sm">Subtle warm shadow. Dropdowns, popovers, tooltips. Barely there — just enough to float.</p>
			<code class="type-data token-ref">--elevation-raised</code>
		</div>

		<div class="elevation-card elevation-overlay">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">OVERLAY</span>
			<p class="type-body-sm">Full warm shadow. Modals, command palettes, drawers. Clearly floating above the page.</p>
			<code class="type-data token-ref">--elevation-overlay</code>
		</div>
	</div>
</section>

<!-- Philosophy -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Philosophy: Borders &gt; Shadows</h2>
	<div class="philosophy-grid">
		<div class="philosophy-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block; color: var(--color-success);">PAGE STRUCTURE = BORDERS</span>
			<div class="philosophy-demo">
				<div class="demo-card-border">
					<span class="type-body-sm">Card content</span>
				</div>
				<div class="demo-card-border">
					<span class="type-body-sm">Card content</span>
				</div>
			</div>
			<p class="type-caption" style="margin-top: var(--space-sm);">
				Borders show how the page is structured. The mechanism is exposed —
				you can see where one element ends and another begins.
			</p>
		</div>
		<div class="philosophy-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block; color: var(--color-success);">FLOATING ELEMENTS = SHADOWS</span>
			<div class="philosophy-demo" style="position: relative;">
				<div class="demo-card-border" style="opacity: 0.5;">
					<span class="type-body-sm">Page content below</span>
				</div>
				<div class="demo-card-shadow">
					<span class="type-body-sm">Floating dropdown</span>
				</div>
			</div>
			<p class="type-caption" style="margin-top: var(--space-sm);">
				Shadows indicate that an element floats above the page plane.
				Reserved for modals, dropdowns, and popovers.
			</p>
		</div>
	</div>
</section>

<!-- Token reference -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Token Reference</h2>
	<div class="token-table">
		<div class="token-table-header">
			<span class="type-label">TOKEN</span>
			<span class="type-label">VALUE</span>
			<span class="type-label">USAGE</span>
		</div>
		<div class="token-table-row">
			<code class="type-data" style="font-size: var(--type-caption-size);">--elevation-border</code>
			<code class="type-caption">1px solid var(--color-border)</code>
			<span class="type-body-sm">Cards, inputs, dividers</span>
		</div>
		<div class="token-table-row">
			<code class="type-data" style="font-size: var(--type-caption-size);">--elevation-border-strong</code>
			<code class="type-caption">1px solid var(--color-border-strong)</code>
			<span class="type-body-sm">Active state, focus, emphasis</span>
		</div>
		<div class="token-table-row">
			<code class="type-data" style="font-size: var(--type-caption-size);">--elevation-raised</code>
			<code class="type-caption">0 1px 3px rgba(44,40,37,.08), ...</code>
			<span class="type-body-sm">Dropdowns, popovers</span>
		</div>
		<div class="token-table-row">
			<code class="type-data" style="font-size: var(--type-caption-size);">--elevation-overlay</code>
			<code class="type-caption">0 4px 16px rgba(44,40,37,.12), ...</code>
			<span class="type-body-sm">Modals, command palettes</span>
		</div>
	</div>
</section>

<!-- Key rule callout -->
<Callout title="KEY RULE">
	<p class="type-body">
		Shadows are <strong>always warm</strong> — <code class="type-data">rgba(44, 40, 37, ...)</code> — never cold gray.
		This maintains the aged-paper warmth even for floating elements. If it is part of the page structure, use a border.
		If it floats above the page, use a shadow.
	</p>
</Callout>

<style>
	.elevation-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--space-lg);
	}

	.elevation-card {
		padding: var(--space-lg);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		display: flex;
		flex-direction: column;
	}

	.elevation-none {
		background: var(--color-surface-secondary);
	}

	.elevation-border {
		border: var(--elevation-border);
	}

	.elevation-border-strong {
		border: var(--elevation-border-strong);
	}

	.elevation-raised {
		box-shadow: var(--elevation-raised);
	}

	.elevation-overlay {
		box-shadow: var(--elevation-overlay);
	}

	.token-ref {
		font-size: var(--type-caption-size);
		color: var(--color-text-secondary);
		margin-top: auto;
		padding-top: var(--space-md);
	}

	.philosophy-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.philosophy-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.philosophy-card {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
	}

	.philosophy-demo {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.demo-card-border {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		background: var(--color-surface);
	}

	.demo-card-shadow {
		box-shadow: var(--elevation-overlay);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		background: var(--color-surface);
	}

	.token-table {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow-x: auto;
	}

	.token-table-header {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-secondary);
		border-bottom: var(--elevation-border);
		min-width: 480px;
	}

	.token-table-row {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: var(--space-md);
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border-bottom: var(--elevation-border);
		min-width: 480px;
	}

	.token-table-row:last-child {
		border-bottom: none;
	}

</style>
