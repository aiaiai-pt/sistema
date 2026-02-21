<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';

	const dataDisplayTokens = [
		'--badge-font: var(--type-label-font)',
		'--badge-radius: var(--radius-pill)',
		'--tag-font: var(--type-label-font)',
		'--tag-radius: var(--radius-sm)',
		'--kv-key-font: var(--type-label-font)',
		'--kv-value-font: var(--type-data-font)',
		'--status-dot-size: 8px',
		'--status-font: var(--type-label-font)'
	];
</script>

<svelte:head>
	<title>Data Display — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Data Display"
	description="Badges, tags, key-value pairs, and status indicators. All use Berkeley Mono (label/data fonts) for that exposed-mechanism feel. Built with component tokens."
/>

<!-- Badges -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Badge</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Semantic status labels. Pill-shaped, mono font, color-coded by meaning.</p>
	<div class="demo-row">
		<div class="demo-item">
			<span class="badge badge-neutral">NEUTRAL</span>
			<span class="type-caption">Neutral</span>
		</div>
		<div class="demo-item">
			<span class="badge badge-info">INFO</span>
			<span class="type-caption">Info</span>
		</div>
		<div class="demo-item">
			<span class="badge badge-success">SUCCESS</span>
			<span class="type-caption">Success</span>
		</div>
		<div class="demo-item">
			<span class="badge badge-warning">WARNING</span>
			<span class="type-caption">Warning</span>
		</div>
		<div class="demo-item">
			<span class="badge badge-error">ERROR</span>
			<span class="type-caption">Error</span>
		</div>
	</div>
	<div class="demo-row" style="margin-top: var(--space-md);">
		<div class="demo-item">
			<span class="badge badge-info">
				<span class="badge-dot" style="background: var(--color-info);"></span>
				WITH DOT
			</span>
			<span class="type-caption">With dot indicator</span>
		</div>
		<div class="demo-item">
			<span class="badge badge-success">
				<svg class="badge-icon" viewBox="0 0 12 12" fill="none">
					<path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				VERIFIED
			</span>
			<span class="type-caption">With icon</span>
		</div>
	</div>
	<div class="usage-context" style="margin-top: var(--space-md);">
		<span class="type-label" style="margin-bottom: var(--space-xs); display: block;">IN CONTEXT</span>
		<div class="context-row">
			<span class="type-body-sm">Build #1247</span>
			<span class="badge badge-success">PASSED</span>
		</div>
		<div class="context-row">
			<span class="type-body-sm">Build #1246</span>
			<span class="badge badge-error">FAILED</span>
		</div>
		<div class="context-row">
			<span class="type-body-sm">Build #1245</span>
			<span class="badge badge-warning">TIMEOUT</span>
		</div>
	</div>
</section>

<!-- Tags -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Tag</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Categorization labels. Bordered, removable. Less semantic than badges.</p>
	<div class="demo-row">
		<div class="demo-item">
			<span class="tag">DESIGN</span>
			<span class="type-caption">Default</span>
		</div>
		<div class="demo-item">
			<span class="tag">FRONTEND</span>
			<span class="type-caption">Default</span>
		</div>
		<div class="demo-item">
			<span class="tag tag-removable">
				REMOVABLE
				<button class="tag-remove" aria-label="Remove tag">
					<svg viewBox="0 0 10 10" fill="none" class="tag-remove-icon">
						<path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
				</button>
			</span>
			<span class="type-caption">Removable</span>
		</div>
	</div>
	<div class="usage-context" style="margin-top: var(--space-md);">
		<span class="type-label" style="margin-bottom: var(--space-xs); display: block;">IN CONTEXT</span>
		<div style="display: flex; flex-wrap: wrap; gap: var(--space-xs);">
			<span class="tag tag-removable">
				SVELTE
				<button class="tag-remove" aria-label="Remove"><svg viewBox="0 0 10 10" fill="none" class="tag-remove-icon"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
			</span>
			<span class="tag tag-removable">
				TYPESCRIPT
				<button class="tag-remove" aria-label="Remove"><svg viewBox="0 0 10 10" fill="none" class="tag-remove-icon"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
			</span>
			<span class="tag tag-removable">
				CSS
				<button class="tag-remove" aria-label="Remove"><svg viewBox="0 0 10 10" fill="none" class="tag-remove-icon"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
			</span>
		</div>
	</div>
</section>

<!-- Key-value pairs -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Key-Value Pair</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Structured data display. Key in mono label, value in mono data. Stacked or inline.</p>
	<div class="kv-demo-grid">
		<div class="kv-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">STACKED</span>
			<div class="kv-stacked">
				<div class="kv-pair">
					<span class="kv-key">STATUS</span>
					<span class="kv-value">Active</span>
				</div>
				<div class="kv-pair">
					<span class="kv-key">CREATED</span>
					<span class="kv-value">2026-02-14</span>
				</div>
				<div class="kv-pair">
					<span class="kv-key">OWNER</span>
					<span class="kv-value">carlos@aiaiai.pt</span>
				</div>
				<div class="kv-pair">
					<span class="kv-key">VERSION</span>
					<span class="kv-value">1.4.2</span>
				</div>
			</div>
		</div>
		<div class="kv-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">INLINE</span>
			<div class="kv-inline-list">
				<div class="kv-inline">
					<span class="kv-key">PLAN</span>
					<span class="kv-value">Pro</span>
				</div>
				<div class="kv-inline">
					<span class="kv-key">USERS</span>
					<span class="kv-value">12</span>
				</div>
				<div class="kv-inline">
					<span class="kv-key">STORAGE</span>
					<span class="kv-value">48.2 GB</span>
				</div>
				<div class="kv-inline">
					<span class="kv-key">REGION</span>
					<span class="kv-value">eu-west-1</span>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Status indicators -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Status Indicator</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Colored dot with label. Used for real-time status, system health, presence.</p>
	<div class="demo-row">
		<div class="demo-item">
			<span class="status">
				<span class="status-dot status-dot-success" style="background: var(--color-success);"></span>
				<span class="status-label">ACTIVE</span>
			</span>
		</div>
		<div class="demo-item">
			<span class="status">
				<span class="status-dot status-dot-inactive" style="color: var(--color-text-muted);"></span>
				<span class="status-label">INACTIVE</span>
			</span>
		</div>
		<div class="demo-item">
			<span class="status">
				<span class="status-dot status-dot-warning status-dot-pulse" style="background: var(--color-warning);"></span>
				<span class="status-label">PENDING</span>
			</span>
		</div>
		<div class="demo-item">
			<span class="status">
				<span class="status-dot status-dot-error" style="background: var(--color-destructive);"></span>
				<span class="status-label">ERROR</span>
			</span>
		</div>
	</div>
	<div class="usage-context" style="margin-top: var(--space-md);">
		<span class="type-label" style="margin-bottom: var(--space-xs); display: block;">IN CONTEXT</span>
		<div class="context-row">
			<span class="type-body-sm">api.aiaiai.pt</span>
			<span class="status">
				<span class="status-dot status-dot-success" style="background: var(--color-success);"></span>
				<span class="status-label">OPERATIONAL</span>
			</span>
		</div>
		<div class="context-row">
			<span class="type-body-sm">cdn.aiaiai.pt</span>
			<span class="status">
				<span class="status-dot status-dot-warning status-dot-pulse" style="background: var(--color-warning);"></span>
				<span class="status-label">DEGRADED</span>
			</span>
		</div>
		<div class="context-row">
			<span class="type-body-sm">db.aiaiai.pt</span>
			<span class="status">
				<span class="status-dot status-dot-success" style="background: var(--color-success);"></span>
				<span class="status-label">OPERATIONAL</span>
			</span>
		</div>
	</div>
</section>

<!-- Token reference -->
<TokenRef component="Data display components" file="components.css" tokens={dataDisplayTokens} />

<style>
	/* ─── Badge ─── */
	.badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		font-family: var(--badge-font);
		font-size: var(--badge-size);
		letter-spacing: var(--badge-tracking);
		border-radius: var(--badge-radius);
		padding: var(--badge-padding-y) var(--badge-padding-x);
		white-space: nowrap;
	}

	.badge-neutral {
		background: var(--badge-neutral-bg);
		color: var(--badge-neutral-text);
	}

	.badge-info {
		background: var(--color-info-subtle);
		color: var(--color-info);
	}

	.badge-success {
		background: var(--color-success-subtle);
		color: var(--color-success);
	}

	.badge-warning {
		background: var(--color-warning-subtle);
		color: var(--color-warning);
	}

	.badge-error {
		background: var(--color-destructive-subtle);
		color: var(--color-destructive);
	}

	.badge-dot {
		width: 6px;
		height: 6px;
		border-radius: var(--radius-circle);
		flex-shrink: 0;
	}

	.badge-icon {
		width: 12px;
		height: 12px;
		flex-shrink: 0;
	}

	/* ─── Tag ─── */
	.tag {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		font-family: var(--tag-font);
		font-size: var(--tag-size);
		border-radius: var(--tag-radius);
		padding: var(--tag-padding-y) var(--tag-padding-x);
		border: var(--tag-border);
		background: var(--tag-bg);
		color: var(--tag-text);
		white-space: nowrap;
	}

	.tag-removable {
		padding-right: var(--space-xs);
	}

	.tag-remove {
		all: unset;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		transition: color var(--duration-instant) var(--easing-default);
	}

	.tag-remove:hover {
		color: var(--color-text);
	}

	.tag-remove:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-accent);
		outline-offset: var(--focus-ring-offset);
	}

	.tag-remove-icon {
		width: 10px;
		height: 10px;
	}

	/* ─── Key-value ─── */
	.kv-demo-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.kv-demo-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.kv-card {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
	}

	.kv-stacked {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.kv-pair {
		display: flex;
		flex-direction: column;
		gap: var(--kv-gap);
	}

	.kv-key {
		font-family: var(--kv-key-font);
		font-size: var(--kv-key-size);
		color: var(--kv-key-color);
		letter-spacing: var(--type-label-tracking);
	}

	.kv-value {
		font-family: var(--kv-value-font);
		font-size: var(--kv-value-size);
		color: var(--kv-value-color);
	}

	.kv-inline-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.kv-inline {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: var(--space-sm);
		border-bottom: var(--elevation-border);
	}

	.kv-inline:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	/* ─── Status indicator ─── */
	.status {
		display: inline-flex;
		align-items: center;
		gap: var(--status-gap);
	}

	.status-dot {
		width: var(--status-dot-size);
		height: var(--status-dot-size);
		border-radius: var(--radius-circle);
		flex-shrink: 0;
	}

	/* Shape variants: progressive enhancement over the base circle */
	.status-dot-success {
		/* circle — default shape, no overrides needed */
	}

	.status-dot-warning {
		border-radius: 0;
		clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
	}

	.status-dot-error {
		border-radius: 0;
		clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
	}

	.status-dot-inactive {
		background: transparent;
		box-shadow: inset 0 0 0 2px currentColor;
	}

	.status-dot-pulse {
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.4; }
	}

	@media (prefers-reduced-motion: reduce) {
		.status-dot-pulse {
			animation: none;
		}
	}

	.status-label {
		font-family: var(--status-font);
		font-size: var(--status-size);
		letter-spacing: var(--type-label-tracking);
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

	.usage-context {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
	}

	.context-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-sm) 0;
		border-bottom: var(--elevation-border);
	}

	.context-row:last-child {
		border-bottom: none;
	}

</style>
