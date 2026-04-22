<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Callout from '$lib/components/Callout.svelte';
	import Tree from '$ui/Tree.svelte';

	type TreeItem = {
		id: string;
		label: string;
		children?: TreeItem[];
		disabled?: boolean;
	};

	const items: TreeItem[] = [
		{
			id: 'uw',
			label: 'UW — Ubiwhere',
			children: [
				{
					id: 'uw9',
					label: 'UW9 — Cities Unit',
					children: [
						{ id: 'uw93', label: 'UW93 — Ontology Team' },
						{ id: 'uw94', label: 'UW94 — Martha Team' },
						{ id: 'uw95', label: 'UW95 — UMS Team', disabled: true }
					]
				},
				{
					id: 'uw2',
					label: 'UW2 — Mobility Unit',
					children: [{ id: 'uw21', label: 'UW21 — Fleet Team' }]
				}
			]
		},
		{
			id: 'wn',
			label: 'WN — WNIVERSE',
			children: [{ id: 'wn1', label: 'WN1 — Product' }]
		}
	];

	let selectedId = $state<string | number | null>(null);
	let expanded = $state<Set<string | number>>(new Set(['uw', 'uw9']));
</script>

<svelte:head>
	<title>Tree — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Tree"
	description="Recursive hierarchy view with expand/collapse and selection. Suitable for org trees, category hierarchies, navigation. v1: no drag-and-drop, no cascading selection."
/>

<Callout variant="info">
	Built for the org-tree view in the occurrence-manager admin. Uses <code>--tree-*</code> tokens from
	<code>components.css</code>; data model is <code>{'{ id, label, children? }'}</code>.
</Callout>

<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Default</h2>
	<div class="tree-demo-container">
		<Tree {items} bind:selectedId bind:expanded />
	</div>
	<p class="type-body" style="margin-top: var(--space-md); color: var(--color-text-secondary);">
		Selected: <code>{selectedId ?? '—'}</code> · Expanded:
		<code>{[...expanded].join(', ') || '—'}</code>
	</p>
</section>

<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Keyboard navigation</h2>
	<ul class="type-body" style="color: var(--color-text-secondary); line-height: 1.8;">
		<li><kbd>ArrowRight</kbd> — expand current node</li>
		<li><kbd>ArrowLeft</kbd> — collapse current node</li>
		<li><kbd>Enter</kbd> / <kbd>Space</kbd> — select current node</li>
	</ul>
</section>

<style>
	.tree-demo-container {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		background: var(--color-surface);
		max-width: 480px;
	}

	kbd {
		font-family: var(--type-mono-font);
		font-size: 0.875em;
		background: var(--color-surface-secondary);
		padding: 0 var(--space-2xs);
		border-radius: var(--radius-xs, 2px);
	}
</style>
