<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import DemoGrid from '$lib/components/DemoGrid.svelte';
	import StateCard from '$lib/components/StateCard.svelte';
	import ConditionTable from '$ui/ConditionTable.svelte';

	const operators = [
		{ value: 'equals', label: 'equals' },
		{ value: 'not_equals', label: 'not equals' },
		{ value: 'contains', label: 'contains' },
		{ value: 'gt', label: '>' },
		{ value: 'lt', label: '<' },
		{ value: 'exists', label: 'exists' },
	];

	const actionOptions = [
		{ value: 'exclude', label: 'Exclude' },
		{ value: 'flag', label: 'Flag for Review' },
	];

	let basicConditions = $state([
		{ field: 'data.status', operator: 'equals', value: 'published' },
		{ field: 'data.priority', operator: 'gt', value: '5' },
	]);

	let emptyConditions = $state<Record<string, string>[]>([]);

	let fourColConditions = $state([
		{ field: 'revenue', operator: 'lt', value: '100', action: 'flag' },
	]);

	let disabledConditions = $state([
		{ field: 'data.status', operator: 'equals', value: 'published' },
	]);

	let maxRowsConditions = $state([
		{ field: 'data.status', operator: 'equals', value: 'active' },
		{ field: 'data.role', operator: 'equals', value: 'admin' },
	]);

	const tokens = [
		'--condition-table-header-gap: var(--space-sm)',
		'--condition-table-row-gap: var(--space-sm)',
		'--condition-table-empty-color: var(--color-text-secondary)',
	];
</script>

<PageHeader
	title="Condition Table"
	description="Configurable condition-row editor for building rule-based filters. Composes Input, Select, and Button into an interactive grid. Supports any number of columns via the columns prop."
/>

<DemoGrid columns="1fr">
	<StateCard label="Default (3 columns)">
		<div style="width: 100%;">
			<ConditionTable
				columns={[
					{ key: 'field', label: 'Field', type: 'text', placeholder: 'data.field_name' },
					{ key: 'operator', label: 'Operator', type: 'select', width: '10rem', options: operators },
					{ key: 'value', label: 'Value', type: 'text', placeholder: 'value' },
				]}
				bind:conditions={basicConditions}
			/>
		</div>
	</StateCard>

	<StateCard label="Empty state">
		<div style="width: 100%;">
			<ConditionTable
				columns={[
					{ key: 'field', label: 'Field', type: 'text' },
					{ key: 'operator', label: 'Operator', type: 'select', options: operators },
					{ key: 'value', label: 'Value', type: 'text' },
				]}
				bind:conditions={emptyConditions}
				emptyMessage="No conditions defined. All items will match."
			/>
		</div>
	</StateCard>

	<StateCard label="4 columns (with Action)">
		<div style="width: 100%;">
			<ConditionTable
				columns={[
					{ key: 'field', label: 'Field', type: 'text', placeholder: 'field_name' },
					{ key: 'operator', label: 'Operator', type: 'select', width: '9rem', options: operators },
					{ key: 'value', label: 'Value', type: 'text', placeholder: 'value' },
					{ key: 'action', label: 'Action', type: 'select', width: '10rem', options: actionOptions },
				]}
				bind:conditions={fourColConditions}
				addLabel="Add Rule"
			/>
		</div>
	</StateCard>
</DemoGrid>

<DemoGrid columns="repeat(auto-fill, minmax(min(100%, 400px), 1fr))">
	<StateCard label="Disabled">
		<div style="width: 100%;">
			<ConditionTable
				columns={[
					{ key: 'field', label: 'Field', type: 'text' },
					{ key: 'operator', label: 'Operator', type: 'select', options: operators },
					{ key: 'value', label: 'Value', type: 'text' },
				]}
				conditions={disabledConditions}
				disabled
			/>
		</div>
	</StateCard>

	<StateCard label="Max rows (2)">
		<div style="width: 100%;">
			<ConditionTable
				columns={[
					{ key: 'field', label: 'Field', type: 'text' },
					{ key: 'operator', label: 'Operator', type: 'select', options: operators },
					{ key: 'value', label: 'Value', type: 'text' },
				]}
				bind:conditions={maxRowsConditions}
				maxRows={2}
			/>
		</div>
	</StateCard>
</DemoGrid>

<TokenRef {tokens} />

