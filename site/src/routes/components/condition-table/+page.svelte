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

	const tokens = [
		'--condition-table-header-gap: var(--space-xs)',
		'--condition-table-row-gap: var(--space-xs)',
		'--condition-table-empty-color: var(--color-text-secondary)',
	];
</script>

<PageHeader
	title="Condition Table"
	description="Configurable condition-row editor for building rule-based filters. Composes Input, Select, and Button into an interactive grid."
/>

<DemoGrid>
	<StateCard title="Default (3 columns)">
		<ConditionTable
			columns={[
				{ key: 'field', label: 'Field', type: 'text', placeholder: 'data.field_name' },
				{ key: 'operator', label: 'Operator', type: 'select', width: '10rem', options: operators },
				{ key: 'value', label: 'Value', type: 'text', placeholder: 'value' },
			]}
			bind:conditions={basicConditions}
		/>
	</StateCard>

	<StateCard title="Empty state">
		<ConditionTable
			columns={[
				{ key: 'field', label: 'Field', type: 'text' },
				{ key: 'operator', label: 'Operator', type: 'select', options: operators },
				{ key: 'value', label: 'Value', type: 'text' },
			]}
			bind:conditions={emptyConditions}
			emptyMessage="No conditions defined. All items will match."
		/>
	</StateCard>

	<StateCard title="4 columns (with Action)">
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
	</StateCard>

	<StateCard title="Disabled">
		<ConditionTable
			columns={[
				{ key: 'field', label: 'Field', type: 'text' },
				{ key: 'operator', label: 'Operator', type: 'select', options: operators },
				{ key: 'value', label: 'Value', type: 'text' },
			]}
			conditions={basicConditions}
			disabled
		/>
	</StateCard>

	<StateCard title="Max rows (2)">
		<ConditionTable
			columns={[
				{ key: 'field', label: 'Field', type: 'text' },
				{ key: 'operator', label: 'Operator', type: 'select', options: operators },
				{ key: 'value', label: 'Value', type: 'text' },
			]}
			bind:conditions={basicConditions}
			maxRows={2}
		/>
	</StateCard>
</DemoGrid>

<TokenRef {tokens} />
