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
<script module>
  let _selectUid = 0;
</script>

<script>
  /**
   * @typedef {{ value: string, label: string, disabled?: boolean }} Option
   * @typedef {'sm' | 'md' | 'lg'} Size
   */

  let {
    /** @type {string | undefined} */
    label = undefined,
    /** @type {string | undefined} */
    placeholder = undefined,
    /** @type {string} */
    value = $bindable(''),
    /** @type {Option[]} */
    options = [],
    /** @type {string | undefined} */
    help = undefined,
    /** @type {string | undefined} */
    error = undefined,
    /** @type {Size} */
    size = 'md',
    /** @type {boolean} */
    disabled = false,
    /** @type {string | undefined} */
    id = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const fallbackId = `select-${_selectUid++}`;
  const selectId = $derived(id ?? fallbackId);
  const hintId = $derived(`${selectId}-hint`);
  const hasHint = $derived(!!error || !!help);
</script>

<div class="input-group {className}">
  {#if label}
    <label class="input-label" for={selectId}>{label}</label>
  {/if}

  <div class="select-wrapper">
    <select
      id={selectId}
      class="input select input-{size}"
      class:input-error={!!error}
      aria-invalid={error ? true : undefined}
      aria-describedby={hasHint ? hintId : undefined}
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
    <span class="select-chevron" aria-hidden="true">
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
        <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </div>

  {#if error}
    <span id={hintId} class="input-error-text" role="alert">{error}</span>
  {:else if help}
    <span id={hintId} class="input-help">{help}</span>
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
    padding-right: var(--space-xl);
  }

  .select-wrapper {
    position: relative;
    width: 100%;
  }

  .select-chevron {
    position: absolute;
    right: var(--input-md-padding-x);
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    display: flex;
    color: var(--color-text-secondary);
  }

  .select-chevron svg {
    width: 10px;
    height: 6px;
  }
</style>
