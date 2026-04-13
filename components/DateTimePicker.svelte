<!--
  @component DateTimePicker

  Date + time selection. Composes DatePicker with a time input.
  Values displayed in Berkeley Mono (data font).
  Consumes --datepicker-* and --input-* tokens from components.css.

  @example Basic
  <DateTimePicker label="SCHEDULED AT" bind:value={scheduledAt} />

  @example With constraints
  <DateTimePicker label="MEETING" min={new Date()} displayFormat="dd/MM/yyyy HH:mm" />
-->
<script module>
  let _datetimepickerUid = 0;
</script>

<script>
  import { format } from 'date-fns';
  import { enUS } from 'date-fns/locale';
  import DatePicker from './DatePicker.svelte';

  /**
   * @typedef {'sm' | 'md' | 'lg'} Size
   */

  let {
    /** @type {Date | null} */
    value = $bindable(null),
    /** @type {string | undefined} */
    label = undefined,
    /** @type {string | undefined} */
    placeholder = 'Select date and time',
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
    displayFormat = 'dd/MM/yyyy HH:mm',
    /** @type {import('date-fns').Locale} */
    locale = enUS,
    /** @type {number} */
    minuteStep = 5,
    /** @type {((date: Date) => void) | undefined} */
    onchange = undefined,
    /** @type {string | undefined} */
    id = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const fallbackId = `datetimepicker-${_datetimepickerUid++}`;
  const pickerId = $derived(id ?? fallbackId);

  // Split value into date and time parts
  let selectedDate = $state(value ? new Date(value) : null);
  let hours = $state(value ? value.getHours() : 9);
  let minutes = $state(value ? value.getMinutes() : 0);

  const timeValue = $derived(
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  );

  const displayValue = $derived(
    value ? format(value, displayFormat, { locale }) : ''
  );

  /** @param {Date} date */
  function handleDateChange(date) {
    selectedDate = date;
    syncValue(date, hours, minutes);
  }

  /** @param {Event} e */
  function handleTimeChange(e) {
    const input = /** @type {HTMLInputElement} */ (e.target);
    const [h, m] = input.value.split(':').map(Number);
    hours = h;
    minutes = m;
    if (selectedDate) {
      syncValue(selectedDate, h, m);
    }
  }

  /** @param {Date} date @param {number} h @param {number} m */
  function syncValue(date, h, m) {
    const merged = new Date(date);
    merged.setHours(h, m, 0, 0);
    value = merged;
    onchange?.(merged);
  }

  // Sync when value changes externally
  $effect(() => {
    if (value) {
      selectedDate = new Date(value);
      hours = value.getHours();
      minutes = value.getMinutes();
    }
  });
</script>

<div class="datetimepicker {className}" {...rest}>
  {#if label}
    <label class="datetimepicker-label">{label}</label>
  {/if}

  <div class="datetimepicker-row">
    <div class="datetimepicker-date">
      <DatePicker
        bind:value={selectedDate}
        placeholder={value ? undefined : placeholder}
        {size}
        {disabled}
        {readonly}
        {min}
        {max}
        {locale}
        onchange={handleDateChange}
        id={pickerId}
      />
    </div>

    <input
      type="time"
      class="datetimepicker-time datetimepicker-time-{size}"
      class:datetimepicker-time-error={!!error}
      value={timeValue}
      step={minuteStep * 60}
      {disabled}
      {readonly}
      onchange={handleTimeChange}
      aria-label="Time"
    />
  </div>

  {#if error}
    <span class="datetimepicker-error-text" role="alert">{error}</span>
  {:else if help}
    <span class="datetimepicker-help">{help}</span>
  {/if}
</div>

<style>
  .datetimepicker {
    display: flex;
    flex-direction: column;
    gap: var(--input-label-gap);
    width: 100%;
  }

  .datetimepicker-label {
    font-family: var(--input-label-font);
    font-size: var(--input-label-size);
    letter-spacing: var(--input-label-tracking);
    color: var(--input-label-color);
  }

  .datetimepicker-row {
    display: flex;
    gap: var(--space-xs);
  }

  .datetimepicker-date {
    flex: 1;
    min-width: 0;
  }

  .datetimepicker-time {
    font-family: var(--input-font);
    font-size: var(--input-font-size);
    border: var(--input-border);
    border-radius: var(--input-radius);
    background: var(--input-bg);
    color: var(--input-text);
    transition: border var(--input-transition);
    flex-shrink: 0;
    width: auto;
  }

  .datetimepicker-time-sm {
    height: var(--input-sm-height);
    padding: 0 var(--input-sm-padding-x);
  }

  .datetimepicker-time-md {
    height: var(--input-md-height);
    padding: 0 var(--input-md-padding-x);
  }

  .datetimepicker-time-lg {
    height: var(--input-lg-height);
    padding: 0 var(--input-lg-padding-x);
  }

  .datetimepicker-time:focus {
    outline: none;
    border: var(--input-border-focus);
  }

  .datetimepicker-time:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .datetimepicker-time-error {
    border-color: var(--input-error-border-color);
  }

  .datetimepicker-help {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-help-color);
  }

  .datetimepicker-error-text {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-error-text);
  }

  @media (prefers-reduced-motion: reduce) {
    .datetimepicker-time {
      transition: none;
    }
  }
</style>
