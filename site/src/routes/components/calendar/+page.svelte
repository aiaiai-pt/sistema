<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import Calendar from '$ui/Calendar.svelte';

	/** @typedef {import('$ui/Calendar.svelte').CalendarEvent} CalendarEvent */

	// Build sample events relative to the current month
	const today = new Date();
	const y = today.getFullYear();
	const m = today.getMonth();

	/** @type {CalendarEvent[]} */
	const sampleEvents = [
		{ id: 1, title: 'Equipment inspection', start: new Date(y, m, 3, 9, 0), end: new Date(y, m, 3, 11, 0), color: 'var(--color-info)' },
		{ id: 2, title: 'HVAC maintenance', start: new Date(y, m, 5, 14, 0), end: new Date(y, m, 5, 16, 30), color: 'var(--color-warning)' },
		{ id: 3, title: 'Fire extinguisher check', start: new Date(y, m, 8, 10, 0), end: new Date(y, m, 8, 11, 0) },
		{ id: 4, title: 'Generator service', start: new Date(y, m, 12, 8, 0), end: new Date(y, m, 12, 12, 0), color: 'var(--color-success)' },
		{ id: 5, title: 'Elevator inspection', start: new Date(y, m, 12, 9, 30), end: new Date(y, m, 12, 11, 30), color: 'var(--color-info)' },
		{ id: 6, title: 'Plumbing repair', start: new Date(y, m, 15, 13, 0), end: new Date(y, m, 15, 15, 0), color: 'var(--color-destructive)' },
		{ id: 7, title: 'Safety training', start: new Date(y, m, 18, 9, 0), end: new Date(y, m, 18, 17, 0), color: 'var(--color-warning)' },
		{ id: 8, title: 'Roof inspection', start: new Date(y, m, 20, 10, 0), end: new Date(y, m, 20, 12, 0), color: 'var(--color-info)' },
		{ id: 9, title: 'Electrical audit', start: new Date(y, m, 22, 14, 0), end: new Date(y, m, 22, 16, 0) },
		{ id: 10, title: 'Water quality test', start: new Date(y, m, 25, 11, 0), end: new Date(y, m, 25, 12, 30), color: 'var(--color-success)' },
		// Today events for the now indicator
		{ id: 11, title: 'Team standup', start: new Date(y, m, today.getDate(), 9, 0), end: new Date(y, m, today.getDate(), 9, 30), color: 'var(--color-info)' },
		{ id: 12, title: 'Site walkthrough', start: new Date(y, m, today.getDate(), 14, 0), end: new Date(y, m, today.getDate(), 16, 0), color: 'var(--color-success)' },
	];

	let selectedEvent = $state('');

	function handleEventClick(ev: any) {
		selectedEvent = `Clicked: ${ev.title}`;
		setTimeout(() => (selectedEvent = ''), 2000);
	}

	const calendarTokens = [
		'--calendar-bg: var(--color-surface)',
		'--calendar-border: var(--elevation-border)',
		'--calendar-radius: var(--radius-md)',
		'--calendar-title-font: var(--type-heading-font)',
		'--calendar-title-size: var(--type-heading-size)',
		'--calendar-toggle-font: var(--type-label-font) (Berkeley Mono)',
		'--calendar-toggle-active-bg: var(--color-accent)',
		'--calendar-weekday-font: var(--type-label-font)',
		'--calendar-cell-min-height: var(--space-4xl)',
		'--calendar-cell-today-bg: var(--color-accent-subtle)',
		'--calendar-day-today-bg: var(--color-accent)',
		'--calendar-time-font: var(--type-data-font)',
		'--calendar-slot-height: var(--space-2xl)',
		'--calendar-now-color: var(--color-destructive)',
		'--calendar-event-font: var(--type-body-sm-font)',
		'--calendar-event-radius: var(--radius-sm)',
		'--calendar-event-default-bg: var(--color-accent)',
	];
</script>

<svelte:head>
	<title>Calendar — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Calendar"
	description="Full-page scheduling calendar with month, week, and day views. Renders events as colored blocks. Built natively with DS tokens — not FullCalendar.js. Reusable across verticals for equipment scheduling, occurrences, and reservations."
/>

<!-- Interactive: Month View -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Month View</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Default view. Events render as colored pills. Click events or empty dates. Use the toolbar to navigate months or switch views.</p>

	{#if selectedEvent}
		<p class="type-body-sm" style="margin-bottom: var(--space-sm); color: var(--color-accent);">{selectedEvent}</p>
	{/if}

	<div style="height: 600px;">
		<Calendar
			events={sampleEvents}
			oneventclick={handleEventClick}
			style="height: 100%;"
		/>
	</div>
</section>

<!-- Week View -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Week View</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Timed events positioned on a 24-hour grid. Overlapping events stack side-by-side. Red line shows current time on today's column.</p>

	<div style="height: 500px;">
		<Calendar
			view="week"
			events={sampleEvents}
			oneventclick={handleEventClick}
			style="height: 100%;"
		/>
	</div>
</section>

<!-- Day View -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Day View</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Single-day focus with full-width event blocks. Same time grid and positioning as week view.</p>

	<div style="height: 500px;">
		<Calendar
			view="day"
			events={sampleEvents}
			oneventclick={handleEventClick}
			style="height: 100%;"
		/>
	</div>
</section>

<!-- Color-coded events -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Event Colors</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Each event carries its own color. Use DS semantic tokens for consistent meaning: info for inspections, warning for maintenance, success for completed, destructive for urgent. Events without a color use the accent default.</p>

	<div style="display: flex; gap: var(--space-md); flex-wrap: wrap;">
		<div style="display: flex; align-items: center; gap: var(--space-xs);">
			<span style="width: var(--space-md); height: var(--space-md); border-radius: var(--radius-sm); background: var(--color-accent);"></span>
			<span class="type-caption">Default (accent)</span>
		</div>
		<div style="display: flex; align-items: center; gap: var(--space-xs);">
			<span style="width: var(--space-md); height: var(--space-md); border-radius: var(--radius-sm); background: var(--color-info);"></span>
			<span class="type-caption">Inspection (info)</span>
		</div>
		<div style="display: flex; align-items: center; gap: var(--space-xs);">
			<span style="width: var(--space-md); height: var(--space-md); border-radius: var(--radius-sm); background: var(--color-warning);"></span>
			<span class="type-caption">Maintenance (warning)</span>
		</div>
		<div style="display: flex; align-items: center; gap: var(--space-xs);">
			<span style="width: var(--space-md); height: var(--space-md); border-radius: var(--radius-sm); background: var(--color-success);"></span>
			<span class="type-caption">Completed (success)</span>
		</div>
		<div style="display: flex; align-items: center; gap: var(--space-xs);">
			<span style="width: var(--space-md); height: var(--space-md); border-radius: var(--radius-sm); background: var(--color-destructive);"></span>
			<span class="type-caption">Urgent (destructive)</span>
		</div>
	</div>
</section>

<!-- Token reference -->
<TokenRef component="Calendar" file="components.css" tokens={calendarTokens} />
