<!--
  @component Input

  Text input with label, help text, and error state.
  Values displayed in Berkeley Mono (data font).
  Consumes --input-* tokens from components.css.

  @example Basic
  <Input label="EMAIL" placeholder="you@example.com" />

  @example With help text
  <Input label="USERNAME" placeholder="Enter username" help="3-20 characters" />

  @example Error
  <Input label="EMAIL" value="bad" error="Please enter a valid email" />

  @example With leading icon
  <Input label="SEARCH" placeholder="Search...">
    {#snippet leadingIcon()}
      <PhMagnifyingGlass size={16} />
    {/snippet}
  </Input>
-->
<script module>
  let _inputUid = 0;
</script>

<script>
  /**
   * @typedef {'sm' | 'md' | 'lg'} Size
   */

  let {
    /** @type {string | undefined} */
    label = undefined,
    /** @type {string | undefined} */
    placeholder = undefined,
    /** @type {string} */
    value = $bindable(''),
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
    /** @type {string} */
    type = 'text',
    /** @type {string | undefined} */
    id = undefined,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    leadingIcon = undefined,
    ...rest
  } = $props();

  const fallbackId = `input-${_inputUid++}`;
  const inputId = $derived(id ?? fallbackId);
  const hintId = $derived(`${inputId}-hint`);
  const hasHint = $derived(!!error || !!help);
</script>

<div class="input-group {className}">
  {#if label}
    <label class="input-label" for={inputId}>{label}</label>
  {/if}

  {#if leadingIcon}
    <div class="input-icon-wrapper">
      <span class="input-leading-icon" aria-hidden="true">
        {@render leadingIcon()}
      </span>
      <input
        id={inputId}
        {type}
        class="input input-{size} input-with-icon"
        class:input-error={!!error}
        class:input-readonly={readonly}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasHint ? hintId : undefined}
        {placeholder}
        {disabled}
        {readonly}
        bind:value
        {...rest}
      />
    </div>
  {:else}
    <input
      id={inputId}
      {type}
      class="input input-{size}"
      class:input-error={!!error}
      class:input-readonly={readonly}
      aria-invalid={error ? true : undefined}
      aria-describedby={hasHint ? hintId : undefined}
      {placeholder}
      {disabled}
      {readonly}
      bind:value
      {...rest}
    />
  {/if}

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

  .input::placeholder {
    color: var(--input-placeholder);
  }

  .input:focus {
    outline: none;
    border: var(--input-border-focus);
  }

  .input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input-readonly {
    background: var(--color-surface-secondary);
    cursor: default;
  }

  .input-error {
    border-color: var(--input-error-border-color);
  }

  .input-error:focus {
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

  /* ─── Icon ─── */
  .input-icon-wrapper {
    position: relative;
    width: 100%;
  }

  .input-leading-icon {
    position: absolute;
    left: var(--input-md-padding-x);
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    width: 16px;
    height: 16px;
    color: var(--input-placeholder);
    pointer-events: none;
  }

  .input-leading-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .input-with-icon {
    padding-left: calc(var(--input-md-padding-x) + 16px + var(--space-xs));
  }
</style>
