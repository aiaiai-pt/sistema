<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import DemoGrid from '$lib/components/DemoGrid.svelte';
	import StateCard from '$lib/components/StateCard.svelte';
	import DatePicker from '$ui/DatePicker.svelte';
	import DateTimePicker from '$ui/DateTimePicker.svelte';
	import DateRangePicker from '$ui/DateRangePicker.svelte';
	import { pt } from 'date-fns/locale';

	let basicDate = $state(null);
	let filledDate = $state(new Date(2026, 3, 15));
	let constrainedDate = $state(null);
	let datetimeValue = $state(new Date(2026, 3, 15, 14, 30));
	let rangeStart = $state(new Date(2026, 3, 1));
	let rangeEnd = $state(new Date(2026, 3, 30));

	const datepickerTokens = [
		'--datepicker-calendar-padding: var(--space-sm)',
		'--datepicker-nav-font: var(--type-label-font) (Berkeley Mono)',
		'--datepicker-day-size: var(--button-md-height)',
		'--datepicker-day-font: var(--type-data-font) (Berkeley Mono)',
		'--datepicker-day-selected-bg: var(--color-accent)',
		'--datepicker-day-today-border: var(--border-width) solid var(--color-border-strong)',
		'--datepicker-day-outside-opacity: 0.3',
		'--datepicker-icon-size: var(--icon-size-sm)',
		'--datepicker-placeholder-color: var(--input-placeholder)',
	];
</script>

<svelte:head>
	<title>DatePicker — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="DatePicker"
	description="Calendar dropdown for date selection. Berkeley Mono for values (data font). Locale-aware via date-fns. Three variants: DatePicker, DateTimePicker, DateRangePicker."
/>

<!-- DatePicker -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">DatePicker</h2>
	<DemoGrid columns="repeat(auto-fill, minmax(240px, 1fr))">
		<StateCard label="PLACEHOLDER">
			<DatePicker label="START DATE" bind:value={basicDate} />
		</StateCard>

		<StateCard label="FILLED">
			<DatePicker label="PURCHASE DATE" bind:value={filledDate} />
		</StateCard>

		<StateCard label="WITH HELP TEXT">
			<DatePicker label="INSPECTION DATE" help="Next inspection must be within 90 days." />
		</StateCard>

		<StateCard label="ERROR">
			<DatePicker label="DUE DATE" error="Date is required for scheduled maintenance." />
		</StateCard>

		<StateCard label="DISABLED">
			<DatePicker label="CREATED AT" value={new Date(2026, 0, 10)} disabled />
		</StateCard>

		<StateCard label="READ-ONLY">
			<DatePicker label="WARRANTY END" value={new Date(2028, 11, 31)} readonly />
		</StateCard>

		<StateCard label="WITH CONSTRAINTS">
			<DatePicker
				label="SCHEDULE"
				bind:value={constrainedDate}
				min={new Date()}
				help="Only future dates allowed."
			/>
		</StateCard>

		<StateCard label="PORTUGUESE LOCALE">
			<DatePicker label="DATA" value={new Date(2026, 3, 15)} locale={pt} />
		</StateCard>
	</DemoGrid>
</section>

<!-- DateTimePicker -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">DateTimePicker</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Date + time selection. Composes DatePicker with a time input. Time steps configurable via minuteStep prop.</p>
	<DemoGrid columns="repeat(auto-fill, minmax(300px, 1fr))">
		<StateCard label="FILLED">
			<DateTimePicker label="SCHEDULED AT" bind:value={datetimeValue} />
		</StateCard>

		<StateCard label="PLACEHOLDER">
			<DateTimePicker label="MEETING TIME" />
		</StateCard>

		<StateCard label="DISABLED">
			<DateTimePicker label="COMPLETED AT" value={new Date(2026, 2, 20, 9, 0)} disabled />
		</StateCard>

		<StateCard label="ERROR">
			<DateTimePicker label="DEADLINE" error="Deadline must be in the future." />
		</StateCard>
	</DemoGrid>
</section>

<!-- DateRangePicker -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">DateRangePicker</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Start/end date pair for filters and ranges. Start constrains end and vice versa.</p>
	<DemoGrid columns="repeat(auto-fill, minmax(340px, 1fr))">
		<StateCard label="WITH VALUES">
			<DateRangePicker label="PERIOD" bind:start={rangeStart} bind:end={rangeEnd} />
		</StateCard>

		<StateCard label="PLACEHOLDER">
			<DateRangePicker label="FILTER BY DATE" />
		</StateCard>

		<StateCard label="DISABLED">
			<DateRangePicker
				label="FISCAL YEAR"
				start={new Date(2026, 0, 1)}
				end={new Date(2026, 11, 31)}
				disabled
			/>
		</StateCard>

		<StateCard label="ERROR">
			<DateRangePicker label="REPORTING PERIOD" error="Both dates are required." />
		</StateCard>
	</DemoGrid>
</section>

<!-- Token reference -->
<TokenRef component="DatePicker" file="components.css" tokens={datepickerTokens} />
