<!--
  @component DateRangePicker

  Integrated calendar for selecting a date range. Single calendar with
  two-phase selection: click start → hover preview → click end.
  Range highlighted between start and end dates.
  Consumes --datepicker-* tokens from components.css.

  @example Basic
  <DateRangePicker label="PERIOD" bind:start bind:end />

  @example With constraints
  <DateRangePicker label="FISCAL YEAR" min={fiscalStart} max={fiscalEnd} bind:start bind:end />
-->
<script module>
  let _daterangeUid = 0;
</script>

<script>
  import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, isSameMonth, isBefore, isAfter, isWithinInterval } from 'date-fns';
  import { enUS } from 'date-fns/locale';
  import Popover from './Popover.svelte';

  /**
   * @typedef {'sm' | 'md' | 'lg'} Size
   * @typedef {'start' | 'end'} SelectionPhase
   */

  let {
    /** @type {Date | null} */
    start = $bindable(null),
    /** @type {Date | null} */
    end = $bindable(null),
    /** @type {string | undefined} */
    label = undefined,
    /** @type {string} */
    startPlaceholder = 'Start date',
    /** @type {string} */
    endPlaceholder = 'End date',
    /** @type {string | undefined} */
    help = undefined,
    /** @type {string | undefined} */
    error = undefined,
    /** @type {Size} */
    size = 'md',
    /** @type {boolean} */
    disabled = false,
    /** @type {boolean} */
    readonly = false,
    /** @type {Date | undefined} */
    min = undefined,
    /** @type {Date | undefined} */
    max = undefined,
    /** @type {string} */
    displayFormat = 'dd/MM/yyyy',
    /** @type {import('date-fns').Locale} */
    locale = enUS,
    /** @type {((range: { start: Date | null, end: Date | null }) => void) | undefined} */
    onchange = undefined,
    /** @type {string | undefined} */
    id = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const fallbackId = `daterange-${_daterangeUid++}`;
  const pickerId = $derived(id ?? fallbackId);
  const hintId = $derived(`${pickerId}-hint`);
  const hasHint = $derived(!!error || !!help);

  let open = $state(false);
  /** @type {HTMLElement | undefined} */
  let triggerEl = $state();
  let viewDate = $state(start ?? new Date());
  /** @type {SelectionPhase} */
  let phase = $state('start');
  /** @type {Date | null} */
  let hoveredDate = $state(null);

  const startDisplay = $derived(start ? format(start, displayFormat, { locale }) : '');
  const endDisplay = $derived(end ? format(end, displayFormat, { locale }) : '');

  const weekdays = $derived(getWeekdays(locale));
  const calendarDays = $derived(getCalendarDays(viewDate, locale));

  /** @param {import('date-fns').Locale} loc */
  function getWeekdays(loc) {
    const s = startOfWeek(new Date(), { locale: loc });
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(s, i), 'EEEEEE', { locale: loc })
    );
  }

  /** @param {Date} month @param {import('date-fns').Locale} loc */
  function getCalendarDays(month, loc) {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calStart = startOfWeek(monthStart, { locale: loc });
    const calEnd = endOfWeek(monthEnd, { locale: loc });

    /** @type {Date[]} */
    const days = [];
    let cursor = calStart;
    while (isBefore(cursor, calEnd) || isSameDay(cursor, calEnd)) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return days;
  }

  /** @param {Date} date */
  function isDisabledDate(date) {
    if (min && isBefore(date, min)) return true;
    if (max && isAfter(date, max)) return true;
    return false;
  }

  /** @param {Date} date */
  function isInRange(date) {
    if (!start) return false;
    const rangeEnd = phase === 'end' && hoveredDate ? hoveredDate : end;
    if (!rangeEnd) return false;

    const [lo, hi] = isBefore(start, rangeEnd) ? [start, rangeEnd] : [rangeEnd, start];
    return isWithinInterval(date, { start: lo, end: hi }) && !isSameDay(date, lo) && !isSameDay(date, hi);
  }

  /** @param {Date} date */
  function isRangeStart(date) {
    return start !== null && isSameDay(date, start);
  }

  /** @param {Date} date */
  function isRangeEnd(date) {
    if (phase === 'end' && hoveredDate) {
      return isSameDay(date, hoveredDate);
    }
    return end !== null && isSameDay(date, end);
  }

  /** @param {Date} date */
  function selectDate(date) {
    if (isDisabledDate(date)) return;

    if (phase === 'start') {
      start = date;
      end = null;
      phase = 'end';
    } else {
      // Phase: end
      if (isBefore(date, /** @type {Date} */ (start))) {
        // Clicked before start — swap: this becomes start, reset end
        start = date;
        end = null;
        // Stay in 'end' phase
      } else if (isSameDay(date, /** @type {Date} */ (start))) {
        // Same as start — ignore
        return;
      } else {
        end = date;
        phase = 'start';
        hoveredDate = null;
        open = false;
        onchange?.({ start, end });
      }
    }
  }

  function handleTriggerClick() {
    if (disabled || readonly) return;
    open = !open;
    if (open) {
      phase = start && !end ? 'end' : 'start';
    }
  }

  /** @param {KeyboardEvent} e */
  function handleTriggerKeydown(e) {
    if (disabled || readonly) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      open = true;
      phase = start && !end ? 'end' : 'start';
    }
  }

  function prevMonth() { viewDate = subMonths(viewDate, 1); }
  function nextMonth() { viewDate = addMonths(viewDate, 1); }

  $effect(() => {
    if (start && !open) viewDate = start;
  });
</script>

<div class="daterange {className}" {...rest}>
  {#if label}
    <span class="daterange-label">{label}</span>
  {/if}

  <button
    bind:this={triggerEl}
    id={pickerId}
    type="button"
    class="daterange-trigger daterange-trigger-{size}"
    class:daterange-trigger-error={!!error}
    class:daterange-trigger-readonly={readonly}
    aria-haspopup="dialog"
    aria-expanded={open}
    aria-describedby={hasHint ? hintId : undefined}
    {disabled}
    onclick={handleTriggerClick}
    onkeydown={handleTriggerKeydown}
  >
    <span class="daterange-value" class:daterange-placeholder={!start}>
      {startDisplay || startPlaceholder}
    </span>
    <span class="daterange-arrow" aria-hidden="true">
      <svg viewBox="0 0 256 256" fill="none">
        <line x1="40" y1="128" x2="216" y2="128" stroke="currentColor" stroke-width="16" stroke-linecap="round" />
        <polyline points="168,80 216,128 168,176" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
    <span class="daterange-value" class:daterange-placeholder={!end}>
      {endDisplay || endPlaceholder}
    </span>
    <svg class="daterange-icon" viewBox="0 0 256 256" fill="none" aria-hidden="true">
      <rect x="40" y="40" width="176" height="176" rx="8" stroke="currentColor" stroke-width="16" fill="none" />
      <line x1="176" y1="24" x2="176" y2="56" stroke="currentColor" stroke-width="16" stroke-linecap="round" />
      <line x1="80" y1="24" x2="80" y2="56" stroke="currentColor" stroke-width="16" stroke-linecap="round" />
      <line x1="40" y1="88" x2="216" y2="88" stroke="currentColor" stroke-width="16" stroke-linecap="round" />
    </svg>
  </button>

  <Popover bind:open anchor={triggerEl} placement="bottom-start" onclose={() => { open = false; hoveredDate = null; }}>
    <div class="daterange-calendar" role="application" aria-label="Date range calendar">
      <div class="daterange-phase-hint">
        <span class="type-caption" style="color: var(--color-text-muted);">
          {phase === 'start' ? 'Select start date' : 'Select end date'}
        </span>
      </div>

      <div class="daterange-nav">
        <button type="button" class="daterange-nav-btn" onclick={prevMonth} aria-label="Previous month">
          <svg viewBox="0 0 256 256" aria-hidden="true">
            <polyline points="160,208 80,128 160,48" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <span class="daterange-nav-title">
          {format(viewDate, 'LLLL yyyy', { locale })}
        </span>
        <button type="button" class="daterange-nav-btn" onclick={nextMonth} aria-label="Next month">
          <svg viewBox="0 0 256 256" aria-hidden="true">
            <polyline points="96,48 176,128 96,208" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <div class="daterange-grid" role="grid" aria-label="Calendar dates">
        <div class="daterange-weekdays" role="row">
          {#each weekdays as day}
            <span class="daterange-weekday" role="columnheader">{day}</span>
          {/each}
        </div>

        <div class="daterange-days" role="rowgroup">
          {#each calendarDays as date}
            {@const isStart = isRangeStart(date)}
            {@const isEnd = isRangeEnd(date)}
            {@const inRange = isInRange(date)}
            {@const isToday = isSameDay(date, new Date())}
            {@const isOutside = !isSameMonth(date, viewDate)}
            {@const isDisabled = isDisabledDate(date)}
            <button
              type="button"
              class="daterange-day"
              class:daterange-day-start={isStart}
              class:daterange-day-end={isEnd}
              class:daterange-day-in-range={inRange}
              class:daterange-day-today={isToday && !isStart && !isEnd}
              class:daterange-day-outside={isOutside}
              role="gridcell"
              aria-selected={isStart || isEnd}
              aria-disabled={isDisabled}
              tabindex={isStart || isEnd || (!start && isToday) ? 0 : -1}
              disabled={isDisabled}
              onclick={() => selectDate(date)}
              onmouseenter={() => { if (phase === 'end') hoveredDate = date; }}
              onmouseleave={() => { if (phase === 'end') hoveredDate = null; }}
            >
              {date.getDate()}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </Popover>

  {#if error}
    <span id={hintId} class="daterange-error-text" role="alert">{error}</span>
  {:else if help}
    <span id={hintId} class="daterange-help">{help}</span>
  {/if}
</div>

<style>
  .daterange {
    display: flex;
    flex-direction: column;
    gap: var(--input-label-gap);
    width: 100%;
  }

  .daterange-label {
    font-family: var(--input-label-font);
    font-size: var(--input-label-size);
    letter-spacing: var(--input-label-tracking);
    color: var(--input-label-color);
  }

  /* ─── Trigger ─── */
  .daterange-trigger {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-family: var(--input-font);
    font-size: var(--input-font-size);
    border: var(--input-border);
    border-radius: var(--input-radius);
    background: var(--input-bg);
    color: var(--input-text);
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: border var(--input-transition);
  }

  .daterange-trigger-sm {
    height: var(--input-sm-height);
    padding: 0 var(--input-sm-padding-x);
  }

  .daterange-trigger-md {
    height: var(--input-md-height);
    padding: 0 var(--input-md-padding-x);
  }

  .daterange-trigger-lg {
    height: var(--input-lg-height);
    padding: 0 var(--input-lg-padding-x);
  }

  .daterange-trigger:focus {
    outline: none;
    border: var(--input-border-focus);
  }

  .daterange-trigger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .daterange-trigger-readonly {
    background: var(--color-surface-secondary);
    cursor: default;
  }

  .daterange-trigger-error {
    border-color: var(--input-error-border-color);
  }

  .daterange-value {
    flex: 1;
    min-width: 0;
  }

  .daterange-placeholder {
    color: var(--datepicker-placeholder-color);
  }

  .daterange-arrow {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    color: var(--color-text-muted);
  }

  .daterange-arrow svg {
    width: var(--icon-size-xs);
    height: var(--icon-size-xs);
  }

  .daterange-icon {
    flex-shrink: 0;
    width: var(--datepicker-icon-size);
    height: var(--datepicker-icon-size);
    color: var(--datepicker-icon-color);
  }

  /* ─── Calendar ─── */
  .daterange-calendar {
    padding: var(--datepicker-calendar-padding);
    min-width: 280px;
  }

  .daterange-phase-hint {
    text-align: center;
    margin-bottom: var(--space-xs);
  }

  .daterange-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-sm);
  }

  .daterange-nav-title {
    font-family: var(--datepicker-nav-font);
    font-size: var(--datepicker-nav-size);
    letter-spacing: var(--datepicker-nav-tracking);
    color: var(--datepicker-nav-color);
    text-transform: uppercase;
  }

  .daterange-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--datepicker-nav-btn-size);
    height: var(--datepicker-nav-btn-size);
    border: none;
    border-radius: var(--datepicker-nav-btn-radius);
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: background var(--duration-instant) var(--easing-default);
  }

  .daterange-nav-btn:hover {
    background: var(--datepicker-nav-btn-hover-bg);
  }

  .daterange-nav-btn svg {
    width: var(--icon-size-xs);
    height: var(--icon-size-xs);
  }

  /* ─── Grid ─── */
  .daterange-grid {
    display: flex;
    flex-direction: column;
  }

  .daterange-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: var(--space-2xs);
  }

  .daterange-weekday {
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--datepicker-day-size);
    font-family: var(--datepicker-weekday-font);
    font-size: var(--datepicker-weekday-size);
    letter-spacing: var(--datepicker-weekday-tracking);
    color: var(--datepicker-weekday-color);
    text-transform: uppercase;
  }

  .daterange-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }

  .daterange-day {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: var(--datepicker-day-size);
    font-family: var(--datepicker-day-font);
    font-size: var(--datepicker-day-font-size);
    border: none;
    border-radius: 0;
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
    transition: background var(--duration-instant) var(--easing-default);
  }

  .daterange-day:hover:not(:disabled) {
    background: var(--datepicker-day-hover-bg);
  }

  /* Range endpoints */
  .daterange-day-start,
  .daterange-day-end {
    background: var(--datepicker-range-endpoint-bg);
    color: var(--datepicker-range-endpoint-text);
    border-radius: var(--datepicker-day-radius);
    font-weight: 600;
  }

  .daterange-day-start:hover:not(:disabled),
  .daterange-day-end:hover:not(:disabled) {
    background: var(--datepicker-range-endpoint-bg);
  }

  /* In-range fill */
  .daterange-day-in-range {
    background: var(--datepicker-range-bg);
    border-radius: 0;
  }

  .daterange-day-in-range:hover:not(:disabled) {
    background: var(--datepicker-range-hover-bg);
  }

  /* Today indicator */
  .daterange-day-today {
    border: var(--datepicker-day-today-border);
    border-radius: var(--datepicker-day-radius);
  }

  /* Outside month */
  .daterange-day-outside {
    opacity: var(--datepicker-day-outside-opacity);
  }

  .daterange-day:disabled {
    opacity: var(--datepicker-day-disabled-opacity);
    cursor: not-allowed;
  }

  /* ─── Hint / Error ─── */
  .daterange-help {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-help-color);
  }

  .daterange-error-text {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-error-text);
  }

  @media (prefers-reduced-motion: reduce) {
    .daterange-trigger,
    .daterange-nav-btn,
    .daterange-day {
      transition: none;
    }
  }
</style>
