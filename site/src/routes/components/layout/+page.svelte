<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import Separator from '$ui/Separator.svelte';
	import List from '$ui/List.svelte';
	import ListItem from '$ui/ListItem.svelte';
	import CollapsibleSection from '$ui/CollapsibleSection.svelte';
	import OptionGrid from '$ui/OptionGrid.svelte';
	import Badge from '$ui/Badge.svelte';
	import Toggle from '$ui/Toggle.svelte';
	import Button from '$ui/Button.svelte';

	let sectionOpen = $state(false);
	let sectionOpenBadge = $state(true);
	let selectedOption = $state('sync');

	const gridOptions = [
		{ value: 'sync', label: 'Sync', description: 'Real-time data synchronization between systems' },
		{ value: 'transform', label: 'Transform', description: 'Clean, reshape, and enrich data before loading' },
		{ value: 'extract', label: 'Extract', description: 'Pull data from external sources and APIs' },
		{ value: 'aggregate', label: 'Aggregate', description: 'Combine and summarize data for reporting' },
	];

	const layoutTokens = [
		'--separator-color: var(--color-border)',
		'--separator-thickness: var(--border-width-default)',
		'--list-gap: var(--space-sm)',
		'--list-border: var(--elevation-border)',
		'--list-border-radius: var(--radius-md)',
		'--list-item-padding-x: var(--space-md)',
		'--list-item-padding-y: var(--space-sm)',
		'--list-item-gap: var(--space-md)',
		'--list-item-bg: var(--color-surface)',
		'--list-item-bg-hover: var(--color-surface-secondary)',
		'--list-item-divider: var(--elevation-border)',
		'--list-item-leading-gap: var(--space-xs)',
		'--list-item-trailing-gap: var(--space-xs)'
	];
</script>

<svelte:head>
	<title>Layout — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Layout"
	description="Separator dividers and list containers for organizing sequential content. Lists standardize the flex-column + gap pattern used across admin pages."
/>

<!-- Separator -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Separator</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Visual divider between content sections. Horizontal by default, vertical inside flex rows.</p>
	<div class="separator-demos">
		<div class="separator-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">HORIZONTAL</span>
			<div class="separator-demo-h">
				<span class="type-body-sm">Section one</span>
				<Separator />
				<span class="type-body-sm">Section two</span>
				<Separator />
				<span class="type-body-sm">Section three</span>
			</div>
		</div>
		<div class="separator-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">VERTICAL</span>
			<div class="separator-demo-v">
				<span class="type-body-sm">Left</span>
				<Separator orientation="vertical" />
				<span class="type-body-sm">Center</span>
				<Separator orientation="vertical" />
				<span class="type-body-sm">Right</span>
			</div>
		</div>
	</div>
</section>

<!-- List: gap variant -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">List — Gap</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Default variant. Flex column with consistent gap between children. Replaces ad-hoc <code class="type-data">.thing-list</code> classes.</p>
	<div class="list-demo-container">
		<List>
			<div class="demo-card">
				<span class="type-body-sm"><strong>customer-enrichment-v2</strong></span>
				<span class="type-caption" style="color: var(--color-text-secondary);">Last run: 2 hours ago</span>
			</div>
			<div class="demo-card">
				<span class="type-body-sm"><strong>order-sync-daily</strong></span>
				<span class="type-caption" style="color: var(--color-text-secondary);">Last run: 6 hours ago</span>
			</div>
			<div class="demo-card">
				<span class="type-body-sm"><strong>inventory-check</strong></span>
				<span class="type-caption" style="color: var(--color-text-secondary);">Last run: 1 day ago</span>
			</div>
		</List>
	</div>
</section>

<!-- List: bordered variant -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">List — Bordered</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Bordered variant with divider lines between items. Used for access lists, settings, and compact data rows.</p>
	<div class="list-demo-container">
		<List variant="bordered">
			<ListItem>
				{#snippet leading()}
					<span class="item-name">get_customer_data</span>
					<span class="item-desc">Fetches customer profile from CRM</span>
				{/snippet}
				{#snippet trailing()}
					<Badge variant="success">ACTIVE</Badge>
				{/snippet}
			</ListItem>
			<ListItem>
				{#snippet leading()}
					<span class="item-name">send_notification</span>
					<span class="item-desc">Sends email or SMS notification</span>
				{/snippet}
				{#snippet trailing()}
					<Badge variant="success">ACTIVE</Badge>
				{/snippet}
			</ListItem>
			<ListItem>
				{#snippet leading()}
					<span class="item-name">generate_report</span>
					<span class="item-desc">Creates PDF or CSV report from data</span>
				{/snippet}
				{#snippet trailing()}
					<Badge variant="neutral">INACTIVE</Badge>
				{/snippet}
			</ListItem>
		</List>
	</div>
</section>

<!-- ListItem variants -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">ListItem</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Flexible row with leading content (name + description) and trailing actions (toggle, badge, button).</p>
	<div class="list-demo-container">
		<List variant="bordered">
			<ListItem>
				{#snippet leading()}
					<span class="item-name">Simple content</span>
					<span class="item-desc">ListItem with just leading text</span>
				{/snippet}
			</ListItem>
			<ListItem>
				{#snippet leading()}
					<span class="item-name">With toggle</span>
					<span class="item-desc">Leading content plus a trailing toggle</span>
				{/snippet}
				{#snippet trailing()}
					<Toggle checked />
				{/snippet}
			</ListItem>
			<ListItem interactive onclick={() => {}}>
				{#snippet leading()}
					<span class="item-name">Interactive row</span>
					<span class="item-desc">Renders as button with hover and focus states</span>
				{/snippet}
				{#snippet trailing()}
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="color: var(--color-text-muted);">
						<path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				{/snippet}
			</ListItem>
		</List>
	</div>
</section>

<!-- CollapsibleSection -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">CollapsibleSection</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Progressive disclosure via native details/summary. Caret rotates on open. Optional badge count and action buttons.</p>
	<div class="collapsible-demos">
		<CollapsibleSection title="Pipeline Configuration" bind:open={sectionOpen}>
			<div style="display: flex; flex-direction: column; gap: var(--space-sm);">
				<span class="type-body-sm">Schedule: <code class="type-data">0 */6 * * *</code></span>
				<span class="type-body-sm">Timeout: <code class="type-data">300s</code></span>
				<span class="type-body-sm">Retries: <code class="type-data">3</code></span>
			</div>
		</CollapsibleSection>

		<CollapsibleSection title="Recent Runs" bind:open={sectionOpenBadge} badge={12}>
			{#snippet actions()}
				<Button size="sm" variant="ghost" onclick={() => {}}>VIEW ALL</Button>
			{/snippet}
			<div style="display: flex; flex-direction: column; gap: var(--space-xs);">
				<div class="context-row">
					<span class="type-body-sm">Run #1247</span>
					<Badge variant="success">PASSED</Badge>
				</div>
				<div class="context-row">
					<span class="type-body-sm">Run #1246</span>
					<Badge variant="error">FAILED</Badge>
				</div>
				<div class="context-row">
					<span class="type-body-sm">Run #1245</span>
					<Badge variant="success">PASSED</Badge>
				</div>
			</div>
		</CollapsibleSection>
	</div>
</section>

<!-- OptionGrid -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">OptionGrid</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Radio-group selection rendered as a card grid. Keyboard navigable (arrow keys). Compact mode hides descriptions.</p>
	<div style="max-width: 560px;">
		<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">PIPELINE TYPE</span>
		<OptionGrid options={gridOptions} bind:value={selectedOption} columns={2} />
		<div style="margin-top: var(--space-sm);">
			<code class="type-data" style="font-size: var(--type-caption-size); color: var(--color-text-muted);">
				selected: {selectedOption}
			</code>
		</div>
	</div>
</section>

<!-- Token reference -->
<TokenRef component="Layout components" file="components.css" tokens={layoutTokens} />

<style>
	.separator-demos {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-md);
	}

	@media (max-width: 640px) {
		.separator-demos {
			grid-template-columns: 1fr;
		}
	}

	.separator-card {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
	}

	.separator-demo-h {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.separator-demo-v {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		height: 48px;
	}

	.list-demo-container {
		max-width: 480px;
	}

	.demo-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		padding: var(--space-md);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	.item-name {
		font-size: var(--type-body-sm-size);
		font-weight: 500;
		color: var(--color-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.item-desc {
		font-size: var(--type-caption-size);
		color: var(--color-text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.collapsible-demos {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		max-width: 480px;
	}

	.context-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-xs) 0;
	}
</style>
