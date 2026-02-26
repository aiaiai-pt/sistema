<!--
  @component Checkbox

  Checkbox with label. Supports checked, indeterminate, and disabled states.
  Consumes --checkbox-* tokens from components.css.

  @example
  <Checkbox label="Accept terms" bind:checked />

  @example Indeterminate
  <Checkbox label="Select all" indeterminate />
-->
<script module>
  let _checkboxUid = 0;
</script>

<script>
  let {
    /** @type {boolean} */
    checked = $bindable(false),
    /** @type {boolean} */
    indeterminate = false,
    /** @type {boolean} */
    disabled = false,
    /** @type {string | undefined} */
    label,
    /** @type {string | undefined} */
    id,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const fallbackId = `checkbox-${_checkboxUid++}`;
  const checkboxId = $derived(id ?? fallbackId);

  /** @type {HTMLInputElement | undefined} */
  let inputEl;

  $effect(() => {
    if (inputEl) {
      inputEl.indeterminate = indeterminate;
    }
  });
</script>

<label
  class="checkbox-group {className}"
  class:checkbox-group-disabled={disabled}
  for={checkboxId}
>
  <span
    class="checkbox"
    class:checkbox-checked={checked || indeterminate}
  >
    {#if checked}
      <svg class="checkbox-icon" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    {:else if indeterminate}
      <svg class="checkbox-icon" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M3 6h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    {/if}
  </span>
  <input
    bind:this={inputEl}
    id={checkboxId}
    type="checkbox"
    class="checkbox-input"
    {disabled}
    bind:checked
    {...rest}
  />
  {#if label}
    <span class="checkbox-label">{label}</span>
  {/if}
</label>

<style>
  .checkbox-group {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    cursor: pointer;
  }

  .checkbox-group-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .checkbox-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .checkbox {
    width: var(--checkbox-size);
    height: var(--checkbox-size);
    border-radius: var(--checkbox-radius);
    border: var(--checkbox-border);
    background: var(--color-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all var(--duration-fast) var(--easing-default);
  }

  .checkbox-group:has(.checkbox-input:focus-visible) .checkbox {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .checkbox-checked {
    background: var(--checkbox-bg-checked);
    border-color: var(--checkbox-bg-checked);
  }

  .checkbox-icon {
    width: 12px;
    height: 12px;
    color: var(--checkbox-check-color);
  }

  .checkbox-label {
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    color: var(--color-text);
  }

  .checkbox-group-disabled .checkbox-label {
    color: var(--color-text-muted);
  }
</style>
