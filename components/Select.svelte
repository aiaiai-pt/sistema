<!--
  @component Select

  Native select with label, help text, and error state.
  Consumes --input-* tokens from components.css.

  @example
  <Select label="COUNTRY" placeholder="Select a country" options={[
    { value: 'pt', label: 'Portugal' },
    { value: 'br', label: 'Brazil' },
  ]} />
-->
<script>
  /**
   * @typedef {{ value: string, label: string, disabled?: boolean }} Option
   * @typedef {'sm' | 'md' | 'lg'} Size
   */

  let {
    /** @type {string | undefined} */
    label,
    /** @type {string | undefined} */
    placeholder,
    /** @type {string} */
    value = $bindable(''),
    /** @type {Option[]} */
    options = [],
    /** @type {string | undefined} */
    help,
    /** @type {string | undefined} */
    error,
    /** @type {Size} */
    size = 'md',
    /** @type {boolean} */
    disabled = false,
    /** @type {string | undefined} */
    id,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const fallbackId = `select-${Math.random().toString(36).slice(2, 8)}`;
  const selectId = $derived(id ?? fallbackId);
</script>

<div class="input-group {className}">
  {#if label}
    <label class="input-label" for={selectId}>{label}</label>
  {/if}

  <select
    id={selectId}
    class="input select input-{size}"
    class:input-error={!!error}
    {disabled}
    bind:value
    {...rest}
  >
    {#if placeholder}
      <option value="" disabled>{placeholder}</option>
    {/if}
    {#each options as opt}
      <option value={opt.value} disabled={opt.disabled}>{opt.label}</option>
    {/each}
  </select>

  {#if error}
    <span class="input-error-text" role="alert">{error}</span>
  {:else if help}
    <span class="input-help">{help}</span>
  {/if}
</div>

<style>
  .input-group {
    display: flex;
    flex-direction: column;
    gap: var(--input-label-gap);
    width: 100%;
  }

  .input-label {
    font-family: var(--input-label-font);
    font-size: var(--input-label-size);
    letter-spacing: var(--input-label-tracking);
    color: var(--input-label-color);
  }

  .input {
    font-family: var(--input-font);
    font-size: var(--input-font-size);
    border: var(--input-border);
    border-radius: var(--input-radius);
    background: var(--input-bg);
    color: var(--input-text);
    transition: border var(--input-transition);
    width: 100%;
  }

  .input-sm {
    height: var(--input-sm-height);
    padding: 0 var(--input-sm-padding-x);
  }

  .input-md {
    height: var(--input-md-height);
    padding: 0 var(--input-md-padding-x);
  }

  .input-lg {
    height: var(--input-lg-height);
    padding: 0 var(--input-lg-padding-x);
  }

  .input:focus {
    outline: none;
    border: var(--input-border-focus);
  }

  .input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input-error {
    border-color: var(--input-error-border-color);
  }

  .input-help {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-help-color);
  }

  .input-error-text {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-error-text);
  }

  .select {
    appearance: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2378716c' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right var(--input-md-padding-x) center;
    padding-right: var(--space-xl);
  }
</style>
