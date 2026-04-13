<!--
  @component DateRangePicker

  Start/end date pair for filters and ranges. Two coordinated DatePickers
  where start constrains end and vice versa.
  Consumes --datepicker-* and --input-* tokens from components.css.

  @example Basic
  <DateRangePicker label="PERIOD" bind:start bind:end />

  @example With constraints
  <DateRangePicker label="FISCAL YEAR" min={fiscalStart} max={fiscalEnd} bind:start bind:end />
-->
<script>
  import DatePicker from './DatePicker.svelte';
  import { enUS } from 'date-fns/locale';

  /**
   * @typedef {'sm' | 'md' | 'lg'} Size
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
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  /** @param {Date} date */
  function handleStartChange(date) {
    start = date;
    onchange?.({ start: date, end });
  }

  /** @param {Date} date */
  function handleEndChange(date) {
    end = date;
    onchange?.({ start, end: date });
  }
</script>

<div class="daterange {className}" {...rest}>
  {#if label}
    <label class="daterange-label">{label}</label>
  {/if}

  <div class="daterange-row">
    <div class="daterange-field">
      <DatePicker
        bind:value={start}
        placeholder={startPlaceholder}
        {size}
        {disabled}
        {readonly}
        {min}
        max={end ?? max}
        {displayFormat}
        {locale}
        onchange={handleStartChange}
      />
    </div>
    <span class="daterange-separator" aria-hidden="true">
      <svg viewBox="0 0 256 256" fill="none">
        <line x1="40" y1="128" x2="216" y2="128" stroke="currentColor" stroke-width="16" stroke-linecap="round" />
        <polyline points="168,80 216,128 168,176" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
    <div class="daterange-field">
      <DatePicker
        bind:value={end}
        placeholder={endPlaceholder}
        {size}
        {disabled}
        {readonly}
        min={start ?? min}
        {max}
        {displayFormat}
        {locale}
        onchange={handleEndChange}
      />
    </div>
  </div>

  {#if error}
    <span class="daterange-error-text" role="alert">{error}</span>
  {:else if help}
    <span class="daterange-help">{help}</span>
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

  .daterange-row {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .daterange-field {
    flex: 1;
    min-width: 0;
  }

  .daterange-separator {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    color: var(--color-text-muted);
  }

  .daterange-separator svg {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
  }

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
</style>
