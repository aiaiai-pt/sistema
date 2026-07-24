<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { createRegistry } from '@aiaiai-pt/widget-system/core';
	import {
		registerBaseWidgets,
		type WidgetComponent,
	} from '@aiaiai-pt/widget-system/widgets';
	import {
		WidgetRenderer,
		type WidgetMatchContext,
		type WidgetState,
	} from '@aiaiai-pt/widget-system/svelte';

	// One isolated registry, populated at startup with the two generic widgets.
	const registry = createRegistry<WidgetComponent, WidgetMatchContext>();
	registerBaseWidgets(registry);

	// Caller-supplied labels — the package ships no copy of its own (D9).
	const messages = {
		loading: 'Loading…',
		empty: 'No data for this slot',
		error: 'Something went wrong',
		unauthorized: 'You do not have access',
		timeout: 'The request timed out',
		unsupported: 'No widget for this slot',
		overflow: 'Too much data to render',
		stale: 'Showing cached data',
	};

	// A resolved chart model (already-resolved category/series — no rows, no BFF).
	const chartState: WidgetState = {
		status: 'ready',
		request: {
			data: {
				category: ['Open', 'In progress', 'Resolved', 'Closed'],
				series: [
					{ name: 'Reports', type: 'bar', data: [128, 74, 213, 190] },
					{ name: 'Target', type: 'line', data: [140, 90, 200, 200] },
				],
			},
			props: { caption: 'Reports by status', labelHeader: 'Status', legend: true },
			locale: 'en',
		},
	};

	// An already-authorized, sanitised URL supplied by the host. Illustrative
	// same-origin page stands in for a signed analytics embed.
	const embedState: WidgetState = {
		status: 'ready',
		request: {
			data: null,
			props: {
				src: '/components/stat-card',
				title: 'Embedded analysis (illustrative same-origin URL)',
				height: '320px',
			},
		},
	};

	// The observable-state gallery — structural slots so every terminal state is
	// visible. Each is a real WidgetRenderer over the same registry.
	const stateGallery: Array<{ label: string; context: WidgetMatchContext; state: WidgetState }> = [
		{ label: 'loading', context: { kind: 'chart' }, state: { status: 'loading' } },
		{ label: 'empty', context: { kind: 'chart' }, state: { status: 'empty' } },
		{ label: 'error', context: { kind: 'chart' }, state: { status: 'error' } },
		{ label: 'unauthorized', context: { kind: 'chart' }, state: { status: 'unauthorized' } },
		{ label: 'timeout', context: { kind: 'chart' }, state: { status: 'timeout' } },
		{ label: 'overflow', context: { kind: 'chart' }, state: { status: 'overflow' } },
		{ label: 'unsupported', context: { kind: 'no-such-kind' }, state: { status: 'ready', request: { data: null, props: {} } } },
		{ label: 'stale', context: { kind: 'chart' }, state: chartState.status === 'ready' ? { status: 'stale', request: chartState.request } : { status: 'stale', request: { data: null, props: {} } } },
	];
</script>

<svelte:head>
	<title>Widget system — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Widget system"
	description="The generic @aiaiai-pt/widget-system runtime rendering through its extracted Svelte integration: an injected registry, the two transport-neutral widgets (native chart + embedded analysis), and the fail-closed observable states."
/>

<section class="ws-demo-band">
	<h2 class="type-heading">Live widgets</h2>
	<div class="ws-demo-grid">
		<figure class="ws-demo-card">
			<figcaption class="type-label">native-chart</figcaption>
			<WidgetRenderer {registry} context={{ kind: 'chart' }} state={chartState} importance="structural" {messages} />
		</figure>
		<figure class="ws-demo-card">
			<figcaption class="type-label">embedded-analysis</figcaption>
			<WidgetRenderer {registry} context={{ kind: 'embed' }} state={embedState} importance="structural" {messages} />
		</figure>
	</div>
</section>

<section class="ws-demo-band">
	<h2 class="type-heading">Observable states</h2>
	<div class="ws-demo-states">
		{#each stateGallery as slot (slot.label)}
			<div class="ws-demo-state">
				<span class="type-caption">{slot.label}</span>
				<WidgetRenderer {registry} context={slot.context} state={slot.state} importance="structural" {messages} />
			</div>
		{/each}
	</div>
</section>

<style>
	.ws-demo-band {
		margin-bottom: var(--space-3xl);
	}

	.ws-demo-band h2 {
		margin-bottom: var(--space-lg);
	}

	.ws-demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: var(--space-xl);
	}

	.ws-demo-card {
		margin: 0;
		padding: var(--space-lg);
		border: var(--elevation-border);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
	}

	.ws-demo-card figcaption {
		margin-bottom: var(--space-md);
		color: var(--color-text-secondary);
	}

	.ws-demo-states {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-md);
	}

	.ws-demo-state {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
		padding: var(--space-sm);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.ws-demo-state .type-caption {
		color: var(--color-text-secondary);
	}
</style>
