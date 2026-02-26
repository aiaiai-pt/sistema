<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import Badge from '$ui/Badge.svelte';
	import Tag from '$ui/Tag.svelte';
	import KeyValue from '$ui/KeyValue.svelte';
	import Status from '$ui/Status.svelte';

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
			<Badge variant="neutral">NEUTRAL</Badge>
			<span class="type-caption">Neutral</span>
		</div>
		<div class="demo-item">
			<Badge variant="info">INFO</Badge>
			<span class="type-caption">Info</span>
		</div>
		<div class="demo-item">
			<Badge variant="success">SUCCESS</Badge>
			<span class="type-caption">Success</span>
		</div>
		<div class="demo-item">
			<Badge variant="warning">WARNING</Badge>
			<span class="type-caption">Warning</span>
		</div>
		<div class="demo-item">
			<Badge variant="error">ERROR</Badge>
			<span class="type-caption">Error</span>
		</div>
	</div>
	<div class="demo-row" style="margin-top: var(--space-md);">
		<div class="demo-item">
			<Badge variant="info" dot>WITH DOT</Badge>
			<span class="type-caption">With dot indicator</span>
		</div>
		<div class="demo-item">
			<Badge variant="success">
				{#snippet icon()}
					<svg viewBox="0 0 12 12" fill="none">
						<path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				{/snippet}
				VERIFIED
			</Badge>
			<span class="type-caption">With icon</span>
		</div>
	</div>
	<div class="usage-context" style="margin-top: var(--space-md);">
		<span class="type-label" style="margin-bottom: var(--space-xs); display: block;">IN CONTEXT</span>
		<div class="context-row">
			<span class="type-body-sm">Build #1247</span>
			<Badge variant="success">PASSED</Badge>
		</div>
		<div class="context-row">
			<span class="type-body-sm">Build #1246</span>
			<Badge variant="error">FAILED</Badge>
		</div>
		<div class="context-row">
			<span class="type-body-sm">Build #1245</span>
			<Badge variant="warning">TIMEOUT</Badge>
		</div>
	</div>
</section>

<!-- Tags -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Tag</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Categorization labels. Bordered, removable. Less semantic than badges.</p>
	<div class="demo-row">
		<div class="demo-item">
			<Tag>DESIGN</Tag>
			<span class="type-caption">Default</span>
		</div>
		<div class="demo-item">
			<Tag>FRONTEND</Tag>
			<span class="type-caption">Default</span>
		</div>
		<div class="demo-item">
			<Tag removable>REMOVABLE</Tag>
			<span class="type-caption">Removable</span>
		</div>
	</div>
	<div class="usage-context" style="margin-top: var(--space-md);">
		<span class="type-label" style="margin-bottom: var(--space-xs); display: block;">IN CONTEXT</span>
		<div style="display: flex; flex-wrap: wrap; gap: var(--space-xs);">
			<Tag removable>SVELTE</Tag>
			<Tag removable>TYPESCRIPT</Tag>
			<Tag removable>CSS</Tag>
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
				<KeyValue key="STATUS" value="Active" />
				<KeyValue key="CREATED" value="2026-02-14" />
				<KeyValue key="OWNER" value="carlos@aiaiai.pt" />
				<KeyValue key="VERSION" value="1.4.2" />
			</div>
		</div>
		<div class="kv-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">INLINE</span>
			<div class="kv-inline-list">
				<KeyValue key="PLAN" value="Pro" layout="inline" class="kv-inline-item" />
				<KeyValue key="USERS" value="12" layout="inline" class="kv-inline-item" />
				<KeyValue key="STORAGE" value="48.2 GB" layout="inline" class="kv-inline-item" />
				<KeyValue key="REGION" value="eu-west-1" layout="inline" class="kv-inline-item" />
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
			<Status variant="success">ACTIVE</Status>
		</div>
		<div class="demo-item">
			<Status variant="inactive">INACTIVE</Status>
		</div>
		<div class="demo-item">
			<Status variant="warning" pulse>PENDING</Status>
		</div>
		<div class="demo-item">
			<Status variant="error">ERROR</Status>
		</div>
	</div>
	<div class="usage-context" style="margin-top: var(--space-md);">
		<span class="type-label" style="margin-bottom: var(--space-xs); display: block;">IN CONTEXT</span>
		<div class="context-row">
			<span class="type-body-sm">api.aiaiai.pt</span>
			<Status variant="success">OPERATIONAL</Status>
		</div>
		<div class="context-row">
			<span class="type-body-sm">cdn.aiaiai.pt</span>
			<Status variant="warning" pulse>DEGRADED</Status>
		</div>
		<div class="context-row">
			<span class="type-body-sm">db.aiaiai.pt</span>
			<Status variant="success">OPERATIONAL</Status>
		</div>
	</div>
</section>

<!-- Token reference -->
<TokenRef component="Data display components" file="components.css" tokens={dataDisplayTokens} />

<style>
	/* Only demo layout — all component CSS lives in the components */
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

	/* Key-value demo layout */
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

	.kv-inline-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.kv-inline-list :global(.kv-inline-item) {
		padding-bottom: var(--space-sm);
		border-bottom: var(--elevation-border);
	}

	.kv-inline-list :global(.kv-inline-item:last-child) {
		border-bottom: none;
		padding-bottom: 0;
	}
</style>
