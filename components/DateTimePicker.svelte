<!--
  @component DateTimePicker

  Date + time selection. Composes DatePicker with styled hour/minute selects.
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
  const hintId = $derived(`${pickerId}-hint`);
  const hasHint = $derived(!!error || !!help);

  // Split value into date and time parts
  let selectedDate = $state(value ? new Date(value) : null);
  let hours = $state(value ? value.getHours() : 9);
  let minutes = $state(value ? value.getMinutes() : 0);

  // Generate minute options based on step
  const minuteOptions = $derived(
    Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep)
  );

  /** @param {Date} date */
  function handleDateChange(date) {
    selectedDate = date;
    syncValue(date, hours, minutes);
  }

  /** @param {Event} e */
  function handleHourChange(e) {
    const h = Number(/** @type {HTMLSelectElement} */ (e.target).value);
    hours = h;
    if (selectedDate) syncValue(selectedDate, h, minutes);
  }

  /** @param {Event} e */
  function handleMinuteChange(e) {
    const m = Number(/** @type {HTMLSelectElement} */ (e.target).value);
    minutes = m;
    if (selectedDate) syncValue(selectedDate, hours, m);
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
    <label class="datetimepicker-label" for={pickerId}>{label}</label>
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

    <div class="datetimepicker-time">
      <select
        class="datetimepicker-select datetimepicker-select-{size}"
        class:datetimepicker-select-error={!!error}
        value={hours}
        {disabled}
        onchange={handleHourChange}
        aria-label="Hour"
      >
        {#each Array.from({ length: 24 }, (_, i) => i) as h}
          <option value={h}>{String(h).padStart(2, '0')}</option>
        {/each}
      </select>
      <span class="datetimepicker-colon" aria-hidden="true">:</span>
      <select
        class="datetimepicker-select datetimepicker-select-{size}"
        class:datetimepicker-select-error={!!error}
        value={minutes}
        {disabled}
        onchange={handleMinuteChange}
        aria-label="Minute"
      >
        {#each minuteOptions as m}
          <option value={m}>{String(m).padStart(2, '0')}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if error}
    <span id={hintId} class="datetimepicker-error-text" role="alert">{error}</span>
  {:else if help}
    <span id={hintId} class="datetimepicker-help">{help}</span>
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
    align-items: stretch;
  }

  .datetimepicker-date {
    flex: 1;
    min-width: 0;
  }

  .datetimepicker-time {
    display: flex;
    align-items: center;
    gap: 0;
    flex-shrink: 0;
  }

  .datetimepicker-colon {
    font-family: var(--input-font);
    font-size: var(--input-font-size);
    color: var(--color-text-secondary);
    padding: 0 var(--space-2xs);
    user-select: none;
  }

  .datetimepicker-select {
    font-family: var(--input-font);
    font-size: var(--input-font-size);
    border: var(--input-border);
    border-radius: var(--input-radius);
    background: var(--input-bg);
    color: var(--input-text);
    cursor: pointer;
    transition: border var(--input-transition);
    appearance: none;
    -webkit-appearance: none;
    text-align: center;
    width: 3.2em;
  }

  .datetimepicker-select-sm {
    height: var(--input-sm-height);
    padding: 0 var(--space-xs);
  }

  .datetimepicker-select-md {
    height: var(--input-md-height);
    padding: 0 var(--space-xs);
  }

  .datetimepicker-select-lg {
    height: var(--input-lg-height);
    padding: 0 var(--space-sm);
  }

  .datetimepicker-select:focus {
    outline: none;
    border: var(--input-border-focus);
  }

  .datetimepicker-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .datetimepicker-select-error {
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
    .datetimepicker-select {
      transition: none;
    }
  }
</style>
