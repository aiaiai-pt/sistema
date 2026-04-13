<!--
  @component DatePicker

  Calendar dropdown for date selection. Values displayed in Berkeley Mono (data font).
  Locale-aware formatting via date-fns. Follows Input patterns for label, help, error.
  Consumes --datepicker-* and --input-* tokens from components.css.

  @example Basic
  <DatePicker label="START DATE" bind:value={startDate} />

  @example With constraints
  <DatePicker label="BIRTH DATE" min={new Date(1900, 0, 1)} max={new Date()} />

  @example Error
  <DatePicker label="DUE DATE" error="Date is required" />

  @example Locale
  <DatePicker label="DATA" locale={pt} />
-->
<script module>
  let _datepickerUid = 0;
</script>

<script>
  import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, isSameMonth, isBefore, isAfter } from 'date-fns';
  import { enUS } from 'date-fns/locale';
  import Popover from './Popover.svelte';

  /**
   * @typedef {'sm' | 'md' | 'lg'} Size
   */

  let {
    /** @type {Date | null} */
    value = $bindable(null),
    /** @type {string | undefined} */
    label = undefined,
    /** @type {string | undefined} */
    placeholder = 'Select date',
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
    /** @type {((date: Date) => void) | undefined} */
    onchange = undefined,
    /** @type {string | undefined} */
    id = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const fallbackId = `datepicker-${_datepickerUid++}`;
  const inputId = $derived(id ?? fallbackId);
  const hintId = $derived(`${inputId}-hint`);
  const hasHint = $derived(!!error || !!help);

  let open = $state(false);
  /** @type {HTMLElement | undefined} */
  let triggerEl = $state();
  let viewDate = $state(value ?? new Date());

  const displayValue = $derived(value ? format(value, displayFormat, { locale }) : '');

  const weekdays = $derived(getWeekdays(locale));
  const calendarDays = $derived(getCalendarDays(viewDate, locale));

  /** @param {import('date-fns').Locale} loc */
  function getWeekdays(loc) {
    const start = startOfWeek(new Date(), { locale: loc });
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(start, i), 'EEEEEE', { locale: loc })
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
  function selectDate(date) {
    if (isDisabledDate(date)) return;
    value = date;
    open = false;
    onchange?.(date);
  }

  function prevMonth() {
    viewDate = subMonths(viewDate, 1);
  }

  function nextMonth() {
    viewDate = addMonths(viewDate, 1);
  }

  function handleTriggerClick() {
    if (disabled || readonly) return;
    open = !open;
  }

  /** @param {KeyboardEvent} e */
  function handleTriggerKeydown(e) {
    if (disabled || readonly) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open = !open;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      open = true;
    }
  }

  /** @param {KeyboardEvent} e @param {Date} date */
  function handleDayKeydown(e, date) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectDate(date);
    }
  }

  // Sync viewDate when value changes externally
  $effect(() => {
    if (value) {
      viewDate = value;
    }
  });
</script>

<div class="datepicker {className}" {...rest}>
  {#if label}
    <label class="datepicker-label" for={inputId}>{label}</label>
  {/if}

  <button
    bind:this={triggerEl}
    id={inputId}
    type="button"
    class="datepicker-trigger datepicker-trigger-{size}"
    class:datepicker-trigger-error={!!error}
    class:datepicker-trigger-readonly={readonly}
    aria-haspopup="dialog"
    aria-expanded={open}
    aria-invalid={error ? true : undefined}
    aria-describedby={hasHint ? hintId : undefined}
    {disabled}
    onclick={handleTriggerClick}
    onkeydown={handleTriggerKeydown}
  >
    <span class="datepicker-value" class:datepicker-placeholder={!value}>
      {displayValue || placeholder}
    </span>
    <svg class="datepicker-icon" viewBox="0 0 256 256" fill="none" aria-hidden="true">
      <rect x="40" y="40" width="176" height="176" rx="8" stroke="currentColor" stroke-width="16" fill="none" />
      <line x1="176" y1="24" x2="176" y2="56" stroke="currentColor" stroke-width="16" stroke-linecap="round" />
      <line x1="80" y1="24" x2="80" y2="56" stroke="currentColor" stroke-width="16" stroke-linecap="round" />
      <line x1="40" y1="88" x2="216" y2="88" stroke="currentColor" stroke-width="16" stroke-linecap="round" />
    </svg>
  </button>

  <Popover bind:open anchor={triggerEl} placement="bottom-start" onclose={() => (open = false)}>
    <div class="datepicker-calendar" role="application" aria-label="Calendar">
      <div class="datepicker-nav">
        <button type="button" class="datepicker-nav-btn" onclick={prevMonth} aria-label="Previous month">
          <svg viewBox="0 0 256 256" aria-hidden="true">
            <polyline points="160,208 80,128 160,48" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <span class="datepicker-nav-title">
          {format(viewDate, 'LLLL yyyy', { locale })}
        </span>
        <button type="button" class="datepicker-nav-btn" onclick={nextMonth} aria-label="Next month">
          <svg viewBox="0 0 256 256" aria-hidden="true">
            <polyline points="96,48 176,128 96,208" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <div class="datepicker-grid" role="grid" aria-label="Calendar dates">
        <div class="datepicker-weekdays" role="row">
          {#each weekdays as day}
            <span class="datepicker-weekday" role="columnheader">{day}</span>
          {/each}
        </div>

        <div class="datepicker-days" role="rowgroup">
          {#each calendarDays as date}
            {@const isSelected = value && isSameDay(date, value)}
            {@const isToday = isSameDay(date, new Date())}
            {@const isOutside = !isSameMonth(date, viewDate)}
            {@const isDisabled = isDisabledDate(date)}
            <button
              type="button"
              class="datepicker-day"
              class:datepicker-day-selected={isSelected}
              class:datepicker-day-today={isToday && !isSelected}
              class:datepicker-day-outside={isOutside}
              role="gridcell"
              aria-selected={isSelected}
              aria-disabled={isDisabled}
              tabindex={isSelected || (!value && isToday) ? 0 : -1}
              disabled={isDisabled}
              onclick={() => selectDate(date)}
              onkeydown={(e) => handleDayKeydown(e, date)}
            >
              {date.getDate()}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </Popover>

  {#if error}
    <span id={hintId} class="datepicker-error-text" role="alert">{error}</span>
  {:else if help}
    <span id={hintId} class="datepicker-help">{help}</span>
  {/if}
</div>

<style>
  .datepicker {
    display: flex;
    flex-direction: column;
    gap: var(--input-label-gap);
    width: 100%;
  }

  .datepicker-label {
    font-family: var(--input-label-font);
    font-size: var(--input-label-size);
    letter-spacing: var(--input-label-tracking);
    color: var(--input-label-color);
  }

  /* ─── Trigger ─── */
  .datepicker-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-xs);
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

  .datepicker-trigger-sm {
    height: var(--input-sm-height);
    padding: 0 var(--input-sm-padding-x);
  }

  .datepicker-trigger-md {
    height: var(--input-md-height);
    padding: 0 var(--input-md-padding-x);
  }

  .datepicker-trigger-lg {
    height: var(--input-lg-height);
    padding: 0 var(--input-lg-padding-x);
  }

  .datepicker-trigger:focus {
    outline: none;
    border: var(--input-border-focus);
  }

  .datepicker-trigger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .datepicker-trigger-readonly {
    background: var(--color-surface-secondary);
    cursor: default;
  }

  .datepicker-trigger-error {
    border-color: var(--input-error-border-color);
  }

  .datepicker-value {
    flex: 1;
    min-width: 0;
  }

  .datepicker-placeholder {
    color: var(--datepicker-placeholder-color);
  }

  .datepicker-icon {
    flex-shrink: 0;
    width: var(--datepicker-icon-size);
    height: var(--datepicker-icon-size);
    color: var(--datepicker-icon-color);
  }

  /* ─── Calendar ─── */
  .datepicker-calendar {
    padding: var(--datepicker-calendar-padding);
  }

  .datepicker-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-sm);
  }

  .datepicker-nav-title {
    font-family: var(--datepicker-nav-font);
    font-size: var(--datepicker-nav-size);
    letter-spacing: var(--datepicker-nav-tracking);
    color: var(--datepicker-nav-color);
    text-transform: uppercase;
  }

  .datepicker-nav-btn {
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

  .datepicker-nav-btn:hover {
    background: var(--datepicker-nav-btn-hover-bg);
  }

  .datepicker-nav-btn svg {
    width: var(--icon-size-xs);
    height: var(--icon-size-xs);
  }

  /* ─── Grid ─── */
  .datepicker-grid {
    display: flex;
    flex-direction: column;
  }

  .datepicker-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: var(--space-2xs);
  }

  .datepicker-weekday {
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

  .datepicker-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }

  .datepicker-day {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--datepicker-day-size);
    height: var(--datepicker-day-size);
    font-family: var(--datepicker-day-font);
    font-size: var(--datepicker-day-font-size);
    border: none;
    border-radius: var(--datepicker-day-radius);
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
    transition: background var(--duration-instant) var(--easing-default);
    margin: 0 auto;
  }

  .datepicker-day:hover:not(:disabled) {
    background: var(--datepicker-day-hover-bg);
  }

  .datepicker-day-selected {
    background: var(--datepicker-day-selected-bg);
    color: var(--datepicker-day-selected-text);
  }

  .datepicker-day-selected:hover:not(:disabled) {
    background: var(--datepicker-day-selected-bg);
  }

  .datepicker-day-today {
    border: var(--datepicker-day-today-border);
  }

  .datepicker-day-outside {
    opacity: var(--datepicker-day-outside-opacity);
  }

  .datepicker-day:disabled {
    opacity: var(--datepicker-day-disabled-opacity);
    cursor: not-allowed;
  }

  /* ─── Hint / Error ─── */
  .datepicker-help {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-help-color);
  }

  .datepicker-error-text {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-error-text);
  }

  @media (prefers-reduced-motion: reduce) {
    .datepicker-trigger,
    .datepicker-nav-btn,
    .datepicker-day {
      transition: none;
    }
  }
</style>
