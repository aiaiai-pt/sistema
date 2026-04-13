<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import DemoGrid from '$lib/components/DemoGrid.svelte';
	import StateCard from '$lib/components/StateCard.svelte';
	import Combobox from '$ui/Combobox.svelte';
	import SearchInput from '$ui/SearchInput.svelte';
	import FilterBar from '$ui/FilterBar.svelte';
	import FilterPanel from '$ui/FilterPanel.svelte';
	import CommandPalette from '$ui/CommandPalette.svelte';
	import Button from '$ui/Button.svelte';

	// Combobox data
	const countries = [
		{ value: 'pt', label: 'Portugal', group: 'Europe' },
		{ value: 'es', label: 'Spain', group: 'Europe' },
		{ value: 'fr', label: 'France', group: 'Europe', description: 'République française' },
		{ value: 'de', label: 'Germany', group: 'Europe' },
		{ value: 'br', label: 'Brazil', group: 'Americas' },
		{ value: 'us', label: 'United States', group: 'Americas' },
		{ value: 'jp', label: 'Japan', group: 'Asia' },
	];

	let comboValue = $state('');
	let asyncComboValue = $state('');
	let asyncItems: typeof countries = $state([]);
	let asyncLoading = $state(false);

	function handleAsyncSearch(query: string) {
		asyncLoading = true;
		setTimeout(() => {
			asyncItems = countries.filter(c =>
				c.label.toLowerCase().includes(query.toLowerCase())
			);
			asyncLoading = false;
		}, 400);
	}

	// SearchInput
	let searchValue = $state('');
	let searchLoading = $state(false);

	function handleSearch(val: string) {
		searchLoading = true;
		setTimeout(() => { searchLoading = false; }, 600);
	}

	// FilterBar
	let filterBarValue: Record<string, any> = $state({});
	const filterBarFilters = [
		{ key: 'status', label: 'Status', type: 'select' as const, options: [
			{ value: 'active', label: 'Active' },
			{ value: 'paused', label: 'Paused' },
			{ value: 'error', label: 'Error' },
		]},
		{ key: 'verified', label: 'Verified', type: 'toggle' as const },
		{ key: 'type', label: 'Type', type: 'multi-select' as const, options: [
			{ value: 'sync', label: 'Sync' },
			{ value: 'transform', label: 'Transform' },
			{ value: 'extract', label: 'Extract' },
		]},
	];

	// FilterPanel
	let filterPanelValue: Record<string, any> = $state({});
	const filterPanelFilters = [
		{ key: 'status', label: 'STATUS', type: 'select' as const, options: [
			{ value: 'active', label: 'Active' },
			{ value: 'scheduled', label: 'Scheduled' },
			{ value: 'completed', label: 'Completed' },
			{ value: 'cancelled', label: 'Cancelled' },
		]},
		{ key: 'priority', label: 'PRIORITY', type: 'select' as const, options: [
			{ value: 'low', label: 'Low' },
			{ value: 'medium', label: 'Medium' },
			{ value: 'high', label: 'High' },
			{ value: 'critical', label: 'Critical' },
		]},
		{ key: 'overdue', label: 'OVERDUE', type: 'boolean' as const },
	];

	// CommandPalette
	let paletteOpen = $state(false);
	const paletteSections = [
		{
			heading: 'Actions',
			items: [
				{ id: 'new', label: 'New pipeline', description: 'Create a new data pipeline', keywords: ['create', 'add'], onSelect: () => paletteOpen = false },
				{ id: 'import', label: 'Import configuration', description: 'Import from YAML or JSON', onSelect: () => paletteOpen = false },
				{ id: 'export', label: 'Export all', description: 'Download pipeline definitions', onSelect: () => paletteOpen = false },
			],
		},
		{
			heading: 'Navigation',
			items: [
				{ id: 'dash', label: 'Dashboard', shortcut: '⌘D', onSelect: () => paletteOpen = false },
				{ id: 'settings', label: 'Settings', shortcut: '⌘,', onSelect: () => paletteOpen = false },
				{ id: 'logs', label: 'Activity log', onSelect: () => paletteOpen = false },
			],
		},
	];

	const searchTokens = [
		'--combobox-list-max-height: 240px',
		'--combobox-item-padding: var(--space-xs) var(--space-sm)',
		'--combobox-highlight-color: var(--color-accent)',
		'--search-clear-size: var(--icon-size-sm)',
		'--search-spinner-size: var(--icon-size-sm)',
		'--filter-chip-font: var(--type-label-font)',
		'--filter-chip-radius: var(--radius-pill)',
		'--filter-chip-active-bg: var(--color-accent-subtle)',
		'--palette-width: 560px',
		'--palette-max-height: 400px',
		'--palette-highlight-color: var(--color-accent)',
	];
</script>

<svelte:head>
	<title>Search & Filter — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Search & Filter"
	description="Searchable select (Combobox), debounced search input, chip-based filter bar, form-based filter panel, and keyboard-driven command palette. All composable, all accessible."
/>

<!-- Combobox -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Combobox</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Searchable select with grouped results, async search, and query highlighting. Replaces native selects when items exceed ~10 or need filtering.</p>

	<DemoGrid columns="repeat(auto-fill, minmax(260px, 1fr))">
		<StateCard label="CLIENT-SIDE FILTER">
			<Combobox
				label="COUNTRY"
				items={countries}
				bind:value={comboValue}
				placeholder="Search countries..."
			/>
		</StateCard>

		<StateCard label="ASYNC SEARCH">
			<Combobox
				label="COUNTRY (ASYNC)"
				items={asyncItems}
				bind:value={asyncComboValue}
				placeholder="Type to search..."
				loading={asyncLoading}
				onsearch={handleAsyncSearch}
			/>
		</StateCard>

		<StateCard label="WITH ERROR">
			<Combobox
				label="ORGANIZATION"
				items={[]}
				error="Please select an organization."
			/>
		</StateCard>

		<StateCard label="DISABLED">
			<Combobox
				label="BUILDING"
				items={[{ value: 'hq', label: 'Headquarters' }]}
				value="hq"
				disabled
			/>
		</StateCard>

		<StateCard label="WITH HELP TEXT">
			<Combobox
				label="SUPPLIER"
				items={countries}
				help="Start typing to filter the list."
			/>
		</StateCard>
	</DemoGrid>
</section>

<!-- SearchInput -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">SearchInput</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Debounced search with loading state, clear button, and optional collapse-to-icon behavior. Fires onsearch after debounce, oninput on every keystroke.</p>

	<DemoGrid columns="repeat(auto-fill, minmax(260px, 1fr))">
		<StateCard label="DEFAULT">
			<SearchInput
				bind:value={searchValue}
				onsearch={handleSearch}
				loading={searchLoading}
			/>
		</StateCard>

		<StateCard label="WITH SHORTCUT HINT">
			<SearchInput placeholder="Search pipelines..." shortcutHint="/" />
		</StateCard>

		<StateCard label="COLLAPSIBLE">
			<SearchInput placeholder="Search..." collapsible />
		</StateCard>

		<StateCard label="DISABLED">
			<SearchInput value="locked query" disabled />
		</StateCard>
	</DemoGrid>
</section>

<!-- FilterBar -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">FilterBar</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Horizontal chip bar for quick filtering. Toggle and multi-select types. Shows "Clear all" when 2+ filters active.</p>

	<div style="border: var(--elevation-border); border-radius: var(--radius-md); padding: var(--space-md);">
		<FilterBar
			filters={filterBarFilters}
			bind:value={filterBarValue}
		/>
		<div style="margin-top: var(--space-sm);">
			<code class="type-data" style="font-size: var(--type-caption-size); color: var(--color-text-muted);">
				value: {JSON.stringify(filterBarValue)}
			</code>
		</div>
	</div>
</section>

<!-- FilterPanel -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">FilterPanel</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Structured filter form with select dropdowns, boolean toggles, and async search fields. Used in admin list views alongside DataTable.</p>

	<div style="border: var(--elevation-border); border-radius: var(--radius-md); padding: var(--space-md); max-width: 360px;">
		<FilterPanel
			filters={filterPanelFilters}
			bind:value={filterPanelValue}
		/>
		<div style="margin-top: var(--space-sm);">
			<code class="type-data" style="font-size: var(--type-caption-size); color: var(--color-text-muted);">
				value: {JSON.stringify(filterPanelValue)}
			</code>
		</div>
	</div>
</section>

<!-- CommandPalette -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">CommandPalette</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Keyboard-driven command launcher with fuzzy search. Opens with configurable shortcut (default: Cmd+K). Sections, shortcuts, and query highlighting built in.</p>

	<div>
		<Button variant="secondary" onclick={() => paletteOpen = true}>
			OPEN PALETTE
		</Button>
		<span class="type-caption" style="color: var(--color-text-muted); margin-left: var(--space-sm);">or press Cmd+K</span>
	</div>

	<CommandPalette
		bind:open={paletteOpen}
		sections={paletteSections}
		placeholder="Type a command or search..."
	/>
</section>

<!-- Token reference -->
<TokenRef component="Search & filter components" file="components.css" tokens={searchTokens} />
