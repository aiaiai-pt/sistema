<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import DemoGrid from '$lib/components/DemoGrid.svelte';
	import StateCard from '$lib/components/StateCard.svelte';
	import Input from '$ui/Input.svelte';
	import Select from '$ui/Select.svelte';
	import Toggle from '$ui/Toggle.svelte';
	import Checkbox from '$ui/Checkbox.svelte';

	let toggleOn = $state(false);
	let checked = $state(false);
	let selectValue = $state('');

	const countries = [
		{ value: 'pt', label: 'Portugal' },
		{ value: 'br', label: 'Brazil' },
		{ value: 'us', label: 'United States' },
		{ value: 'uk', label: 'United Kingdom' },
	];

	const inputTokens = [
		'--input-font: var(--type-data-font) (Berkeley Mono)',
		'--input-radius: var(--radius-sm) (2px)',
		'--input-border: var(--elevation-border)',
		'--input-label-font: var(--type-label-font)',
		'--toggle-bg-on: var(--color-accent)',
		'--checkbox-bg-checked: var(--color-accent)'
	];
</script>

<svelte:head>
	<title>Input — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Input"
	description="Text input, select, toggle, and checkbox. Berkeley Mono for input values (data font). Labels always in mono. All states demonstrated live."
/>

<!-- Text Input -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Text Input</h2>
	<DemoGrid columns="repeat(auto-fill, minmax(240px, 1fr))">
		<StateCard label="PLACEHOLDER">
			<Input label="EMAIL" placeholder="you@example.com" />
		</StateCard>

		<StateCard label="FILLED">
			<Input label="EMAIL" value="hello@aiaiai.pt" />
		</StateCard>

		<StateCard label="WITH HELP TEXT">
			<Input label="USERNAME" placeholder="Enter username" help="Must be 3-20 characters, letters and numbers only." />
		</StateCard>

		<StateCard label="FOCUSED">
			<Input label="NAME" placeholder="Click to focus" />
			<span class="type-caption">Click the input to see focus state</span>
		</StateCard>

		<StateCard label="ERROR">
			<Input label="EMAIL" value="not-an-email" error="Please enter a valid email address." />
		</StateCard>

		<StateCard label="DISABLED">
			<Input label="EMAIL" value="disabled@example.com" disabled />
		</StateCard>

		<StateCard label="READ-ONLY">
			<Input label="API KEY" value="sk-xxxxx-readonly" readonly />
		</StateCard>

		<StateCard label="WITH ICON">
			<Input label="SEARCH" placeholder="Search projects...">
				{#snippet leadingIcon()}
					<svg viewBox="0 0 16 16" fill="none">
						<circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/>
						<path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
				{/snippet}
			</Input>
		</StateCard>
	</DemoGrid>
</section>

<!-- Select -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Select</h2>
	<DemoGrid columns="repeat(auto-fill, minmax(240px, 1fr))">
		<StateCard label="DEFAULT">
			<Select label="COUNTRY" placeholder="Select a country" options={countries} bind:value={selectValue} />
		</StateCard>

		<StateCard label="DISABLED">
			<Select label="COUNTRY" options={[{ value: 'pt', label: 'Portugal' }]} value="pt" disabled />
		</StateCard>

		<StateCard label="ERROR">
			<Select label="COUNTRY" placeholder="Required" options={[]} error="Please select a country." />
		</StateCard>

		<StateCard label="WITH VALUE">
			<Select label="COUNTRY" options={countries} value="pt" />
		</StateCard>
	</DemoGrid>
</section>

<!-- Toggle -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Toggle</h2>
	<DemoGrid columns="repeat(auto-fill, minmax(240px, 1fr))">
		<StateCard label="INTERACTIVE">
			<Toggle bind:checked={toggleOn} label={toggleOn ? 'On' : 'Off'} />
		</StateCard>

		<StateCard label="OFF">
			<Toggle label="Notifications" />
		</StateCard>

		<StateCard label="ON">
			<Toggle checked label="Dark mode" />
		</StateCard>

		<StateCard label="DISABLED OFF">
			<Toggle label="Disabled" disabled />
		</StateCard>

		<StateCard label="DISABLED ON">
			<Toggle checked disabled label="Disabled" />
		</StateCard>
	</DemoGrid>
</section>

<!-- Checkbox -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Checkbox</h2>
	<DemoGrid columns="repeat(auto-fill, minmax(240px, 1fr))">
		<StateCard label="INTERACTIVE">
			<Checkbox label="Accept terms and conditions" bind:checked />
		</StateCard>

		<StateCard label="UNCHECKED">
			<Checkbox label="Remember me" />
		</StateCard>

		<StateCard label="CHECKED">
			<Checkbox label="Email notifications" checked />
		</StateCard>

		<StateCard label="DISABLED">
			<Checkbox label="Disabled option" disabled />
		</StateCard>

		<StateCard label="DISABLED CHECKED">
			<Checkbox label="Disabled checked" checked disabled />
		</StateCard>

		<StateCard label="INDETERMINATE">
			<Checkbox label="Select all" indeterminate />
		</StateCard>
	</DemoGrid>
</section>

<!-- Token reference -->
<TokenRef component="Inputs" file="components.css" tokens={inputTokens} />
