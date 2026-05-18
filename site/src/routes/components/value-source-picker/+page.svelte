<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import DemoGrid from '$lib/components/DemoGrid.svelte';
	import StateCard from '$lib/components/StateCard.svelte';
	import ValueSourcePicker from '$ui/ValueSourcePicker.svelte';

	// ---- Realistic context shaped like an action editor would feed it ----

	const parameters = [
		{ key: 'assignee_id', label: 'Assignee', type: 'object_reference' },
		{ key: 'comment', label: 'Comment', type: 'string' },
		{ key: 'escalation_level', label: 'Escalation level', type: 'enum' },
		{ key: 'due_at', label: 'Due at', type: 'datetime' },
	];

	const entitySchema = {
		type: 'occurrence',
		properties: {
			id: { type: 'uuid' },
			state: { type: 'string' },
			organization: { type: 'uuid' },
			assigned_to: { type: 'uuid' },
			reopen_count: { type: 'int' },
			acknowledged_at: { type: 'datetime' },
		},
	};

	const userFields = [
		{ key: 'sub', label: 'sub', description: 'Keycloak user id' },
		{ key: 'email', label: 'email', description: 'verified address' },
		{ key: 'preferred_username', label: 'preferred_username' },
		{ key: 'realm_access.roles', label: 'realm_access.roles', description: 'array of role names' },
	];

	const functions = [
		{
			name: 'resolve_team',
			label: 'resolve_team',
			argSchema: {
				org_id: { type: 'uuid' },
				region: { type: 'string' },
			},
		},
		{
			name: 'validate_transition',
			label: 'validate_transition',
			argSchema: {
				transitions: { type: 'list' },
				target_state: { type: 'string' },
			},
		},
	];

	const priorCreates = [
		{ index: 0, entityType: 'occurrence_comment', fields: ['id', 'body', 'created_at'] },
		{ index: 1, entityType: 'occurrence_audit_log', fields: ['id', 'event_type'] },
	];

	const configTypes = [
		{ code: 'occurrence_state', label: 'occurrence_state' },
		{ code: 'occurrence_state_transition', label: 'occurrence_state_transition' },
	];

	const fullContext = { parameters, entitySchema, userFields, functions, priorCreates, configTypes };

	// ---- Per-card state ----

	let empty = $state<any>(null);
	let literal = $state<any>({ mode: 'literal', value: 'closed' });
	let parameter = $state<any>({ mode: 'parameter', key: 'assignee_id' });
	let entityField = $state<any>({ mode: 'entity-field', field: 'state' });
	let userField = $state<any>({ mode: 'user-field', key: 'sub' });
	let now = $state<any>({ mode: 'now' });
	let sourceId = $state<any>({ mode: 'source-id' });
	let createdField = $state<any>({ mode: 'created-field', index: 0, field: 'id' });
	let configList = $state<any>({ mode: 'config-list', configType: 'occurrence_state_transition' });
	let expression = $state<any>({ mode: 'expression', expr: '$entity.reopen_count + 1' });
	let fn = $state<any>({
		mode: 'function',
		name: 'resolve_team',
		args: {
			org_id: { mode: 'entity-field', field: 'organization' },
			region: { mode: 'literal', value: 'EU-West' },
		},
	});

	let typeMismatch = $state<any>({ mode: 'parameter', key: 'comment' }); // string param into datetime slot
	let dangling = $state<any>({ mode: 'parameter', key: 'deleted_param' });
	let forbidden = $state<any>({ mode: 'function', name: 'resolve_team', args: {} });

	// Real-world examples mirroring seed.py shapes
	let acknowledgeEdit = $state<any>({ mode: 'now' });
	let reopenEdit = $state<any>({ mode: 'expression', expr: '$entity.reopen_count + 1' });
	let changeStateArg = $state<any>({ mode: 'config-list', configType: 'occurrence_state_transition' });

	const tokens = [
		'--space-xs · gap between mode label and row',
		'--space-sm · gap between mode select and detail pane',
		'--space-2xs · gap between detail items',
		'--color-text-muted · placeholder copy in empty state',
		'--color-border-subtle · args panel border',
		'--color-surface-secondary · args panel background',
		'--radius-md · args panel corners',
	];
</script>

<svelte:head>
	<title>Value Source Picker — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Value Source Picker"
	description="One picker for every action-engine slot that accepts literal-or-reference. Wire format matches the action engine's resolver byte-for-byte. Used in declarative action editors — Edit values, Create field maps, function args, config-query filters. Mode set narrows per consumer via `allowed`."
/>

<!-- Picking / empty -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Picking the source</h2>
	<DemoGrid columns="repeat(auto-fill, minmax(360px, 1fr))">
		<StateCard label="EMPTY">
			<ValueSourcePicker
				label="VALUE"
				bind:value={empty}
				allowed={['literal', 'parameter', 'entity-field', 'user-field', 'now', 'function']}
				context={fullContext}
			/>
		</StateCard>
	</DemoGrid>
</section>

<!-- Modes -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Modes</h2>
	<DemoGrid columns="repeat(auto-fill, minmax(360px, 1fr))">
		<StateCard label="LITERAL">
			<ValueSourcePicker
				label="STATUS"
				bind:value={literal}
				allowed={['literal', 'parameter']}
				context={fullContext}
			/>
		</StateCard>

		<StateCard label="PARAMETER">
			<ValueSourcePicker
				label="ASSIGNEE"
				bind:value={parameter}
				allowed={['literal', 'parameter']}
				context={fullContext}
			/>
		</StateCard>

		<StateCard label="ENTITY FIELD">
			<ValueSourcePicker
				label="OLD STATE"
				bind:value={entityField}
				allowed={['literal', 'parameter', 'entity-field', 'user-field']}
				context={fullContext}
			/>
		</StateCard>

		<StateCard label="USER FIELD">
			<ValueSourcePicker
				label="ACTOR"
				bind:value={userField}
				allowed={['literal', 'parameter', 'entity-field', 'user-field']}
				context={fullContext}
			/>
		</StateCard>

		<StateCard label="NOW">
			<ValueSourcePicker
				label="ACKNOWLEDGED AT"
				bind:value={now}
				allowed={['literal', 'parameter', 'now']}
				context={fullContext}
			/>
		</StateCard>

		<StateCard label="SOURCE ID">
			<ValueSourcePicker
				label="OCCURRENCE"
				bind:value={sourceId}
				allowed={['literal', 'source-id', 'created-field']}
				context={fullContext}
			/>
		</StateCard>

		<StateCard label="CREATED FIELD">
			<ValueSourcePicker
				label="ANCHOR"
				bind:value={createdField}
				allowed={['literal', 'source-id', 'created-field']}
				context={fullContext}
			/>
		</StateCard>

		<StateCard label="CONFIG LIST">
			<ValueSourcePicker
				label="TRANSITIONS"
				bind:value={configList}
				allowed={['literal', 'parameter', 'entity-field', 'user-field', 'config-list']}
				context={fullContext}
			/>
		</StateCard>

		<StateCard label="EXPRESSION">
			<ValueSourcePicker
				label="REOPEN_COUNT"
				bind:value={expression}
				allowed={['literal', 'parameter', 'function', 'now', 'expression']}
				context={fullContext}
			/>
		</StateCard>

		<StateCard label="FUNCTION (recursive)">
			<ValueSourcePicker
				label="ASSIGNED_TO"
				bind:value={fn}
				allowed={['literal', 'parameter', 'function', 'now', 'expression']}
				context={fullContext}
			/>
		</StateCard>
	</DemoGrid>
</section>

<!-- States -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">States</h2>
	<DemoGrid columns="repeat(auto-fill, minmax(360px, 1fr))">
		<StateCard label="TYPE MISMATCH (soft warn)">
			<ValueSourcePicker
				label="DUE AT (datetime)"
				bind:value={typeMismatch}
				allowed={['literal', 'parameter', 'entity-field']}
				context={fullContext}
				expectedType="datetime"
			/>
		</StateCard>

		<StateCard label="DANGLING REF">
			<ValueSourcePicker
				label="ASSIGNEE"
				bind:value={dangling}
				allowed={['literal', 'parameter']}
				context={fullContext}
			/>
		</StateCard>

		<StateCard label="MODE NO LONGER ALLOWED">
			<ValueSourcePicker
				label="VALUE"
				bind:value={forbidden}
				allowed={['literal', 'parameter']}
				context={fullContext}
			/>
		</StateCard>

		<StateCard label="DISABLED">
			<ValueSourcePicker
				label="LOCKED"
				value={{ mode: 'literal', value: 'cannot edit' }}
				allowed={['literal']}
				context={fullContext}
				disabled
			/>
		</StateCard>
	</DemoGrid>
</section>

<!-- Real-world consumers -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Real-world consumers</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		Mode allow-lists narrowed per call site. Examples mirror shapes used by
		the action engine in production today.
	</p>
	<DemoGrid columns="repeat(auto-fill, minmax(360px, 1fr))">
		<StateCard label="EDIT — acknowledge.acknowledged_at">
			<ValueSourcePicker
				label="VALUE"
				bind:value={acknowledgeEdit}
				allowed={['literal', 'parameter', 'function', 'now', 'expression']}
				context={fullContext}
				expectedType="datetime"
			/>
		</StateCard>

		<StateCard label="EDIT — reopen.reopen_count">
			<ValueSourcePicker
				label="VALUE"
				bind:value={reopenEdit}
				allowed={['literal', 'parameter', 'function', 'now', 'expression']}
				context={fullContext}
				expectedType="int"
			/>
		</StateCard>

		<StateCard label="PRECONDITION — change_state.transitions arg">
			<ValueSourcePicker
				label="TRANSITIONS"
				bind:value={changeStateArg}
				allowed={['literal', 'parameter', 'entity-field', 'user-field', 'config-list']}
				context={fullContext}
				expectedType="list"
			/>
		</StateCard>
	</DemoGrid>
</section>

<TokenRef tokens={tokens} />
