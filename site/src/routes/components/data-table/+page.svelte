<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import DemoGrid from '$lib/components/DemoGrid.svelte';
	import StateCard from '$lib/components/StateCard.svelte';
	import DataTable from '$ui/DataTable.svelte';
	import Pagination from '$ui/Pagination.svelte';
	import Breadcrumb from '$ui/Breadcrumb.svelte';
	import Badge from '$ui/Badge.svelte';
	import Button from '$ui/Button.svelte';

	// DataTable data
	const columns = [
		{ key: 'name', label: 'Name', sortable: true },
		{ key: 'status', label: 'Status', width: '120px', render: (val: string) => val },
		{ key: 'type', label: 'Type', sortable: true },
		{ key: 'updated', label: 'Updated', sortable: true, width: '160px' },
	];

	const rows = [
		{ id: '1', name: 'customer-enrichment-v2', status: 'active', type: 'Sync', updated: '2026-04-13 09:14' },
		{ id: '2', name: 'order-reconciliation', status: 'active', type: 'Transform', updated: '2026-04-12 22:01' },
		{ id: '3', name: 'inventory-snapshot', status: 'paused', type: 'Extract', updated: '2026-04-11 14:30' },
		{ id: '4', name: 'payment-gateway-sync', status: 'error', type: 'Sync', updated: '2026-04-10 08:45' },
		{ id: '5', name: 'user-activity-rollup', status: 'active', type: 'Aggregate', updated: '2026-04-09 17:22' },
	];

	let sortKey = $state('updated');
	let sortDir: 'asc' | 'desc' = $state('desc');
	let selectedRows = $state(new Set<string>());

	// Pagination
	let cursorHasNext = $state(true);
	let cursorHasPrev = $state(false);
	let offsetPage = $state(3);
	let pageSize = $state(25);

	const dataTableTokens = [
		'--table-header-font: var(--type-label-font)',
		'--table-header-bg: var(--color-surface-secondary)',
		'--table-cell-font: var(--type-data-font)',
		'--table-row-hover-bg: var(--color-surface-secondary)',
		'--table-row-alt-bg: var(--color-surface)',
		'--table-border: var(--elevation-border)',
		'--table-checkbox-size: 16px',
		'--table-sort-icon-size: var(--icon-size-xs)',
		'--pagination-font: var(--type-label-font)',
		'--pagination-button-size: var(--button-sm-height)',
		'--breadcrumb-font: var(--type-label-font)',
		'--breadcrumb-separator-color: var(--color-text-muted)',
	];
</script>

<svelte:head>
	<title>Data Table — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Data Table"
	description="Sortable, selectable data tables with cursor or offset pagination and breadcrumb navigation. All data values in Berkeley Mono. Column headers in label font."
/>

<!-- DataTable: Default -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">DataTable</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Semantic HTML table with sortable columns, row selection, loading skeletons, and empty state. Sort and selection state owned by parent.</p>

	<div style="margin-bottom: var(--space-lg);">
		<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">SORTABLE + SELECTABLE</span>
		<DataTable
			{columns}
			{rows}
			selectable
			sort_key={sortKey}
			sort_direction={sortDir}
			bind:selected_rows={selectedRows}
			on_sort={(key, dir) => { sortKey = key; sortDir = dir; }}
			on_row_click={(row) => console.log('Row clicked:', row)}
		>
			{#snippet children()}
				<div style="display: flex; align-items: center; gap: var(--space-sm);">
					{#if selectedRows.size > 0}
						<span class="type-label">{selectedRows.size} SELECTED</span>
						<Button size="sm" variant="ghost" onclick={() => selectedRows = new Set()}>CLEAR</Button>
					{/if}
				</div>
			{/snippet}
		</DataTable>
	</div>

	<div style="margin-bottom: var(--space-lg);">
		<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">LOADING</span>
		<DataTable columns={columns} rows={[]} loading />
	</div>

	<div>
		<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">EMPTY</span>
		<DataTable
			columns={columns}
			rows={[]}
			empty_heading="No pipelines found"
			empty_body="Create your first pipeline to see it here."
		/>
	</div>
</section>

<!-- Pagination -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Pagination</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Two modes: cursor (PREV/NEXT for API-driven pagination) and offset (numbered pages for known totals). Renders below DataTable.</p>

	<div class="pagination-demos">
		<div>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">CURSOR MODE</span>
			<Pagination
				mode="cursor"
				has_next={cursorHasNext}
				has_prev={cursorHasPrev}
				total_items={147}
				page_size={25}
				on_next={() => { cursorHasPrev = true; }}
				on_prev={() => { cursorHasNext = true; }}
			/>
		</div>
		<div>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">OFFSET MODE</span>
			<Pagination
				mode="offset"
				current_page={offsetPage}
				total_pages={12}
				total_items={287}
				page_size={pageSize}
				page_sizes={[10, 25, 50, 100]}
				on_page_change={(p) => offsetPage = p}
				on_page_size_change={(s) => pageSize = s}
			/>
		</div>
	</div>
</section>

<!-- Breadcrumb -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Breadcrumb</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Hierarchical navigation trail. Last item (no href) renders as bold text for the current page. Supports truncation via max_items.</p>

	<DemoGrid columns="1fr">
		<StateCard label="DEFAULT">
			<Breadcrumb items={[
				{ label: 'Home', href: '/' },
				{ label: 'Components', href: '/components/data-table' },
				{ label: 'customer-enrichment-v2' },
			]} />
		</StateCard>

		<StateCard label="TRUNCATED (max_items=3)">
			<Breadcrumb
				max_items={3}
				items={[
					{ label: 'Home', href: '/' },
					{ label: 'Foundations', href: '/foundations/color' },
					{ label: 'System', href: '/system/principles' },
					{ label: 'Components', href: '/components/data-table' },
					{ label: 'customer-enrichment-v2' },
				]}
			/>
		</StateCard>

		<StateCard label="SINGLE LEVEL">
			<Breadcrumb items={[{ label: 'Dashboard' }]} />
		</StateCard>
	</DemoGrid>
</section>

<!-- Token reference -->
<TokenRef component="Data table, Pagination, Breadcrumb" file="components.css" tokens={dataTableTokens} />

<style>
	.pagination-demos {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}
</style>
