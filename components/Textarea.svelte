<!--
  @component Textarea

  Multi-line text input with label, help text, and error state.
  Values displayed in Berkeley Mono (data font).
  Consumes --input-* and --textarea-* tokens from components.css.

  @example
  <Textarea label="DESCRIPTION" placeholder="Enter a description..." rows={4} />

  @example With error
  <Textarea label="SQL QUERY" value="SELCT *" error="Syntax error near SELCT" />
-->
<script module>
  let _textareaUid = 0;
</script>

<script>
  let {
    /** @type {string | undefined} */
    label,
    /** @type {string | undefined} */
    placeholder,
    /** @type {string} */
    value = $bindable(''),
    /** @type {string | undefined} */
    help,
    /** @type {string | undefined} */
    error,
    /** @type {number} */
    rows = 3,
    /** @type {boolean} */
    disabled = false,
    /** @type {boolean} */
    readonly = false,
    /** @type {string | undefined} */
    id,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const fallbackId = `textarea-${_textareaUid++}`;
  const textareaId = $derived(id ?? fallbackId);
  const hintId = $derived(`${textareaId}-hint`);
  const hasHint = $derived(!!error || !!help);
</script>

<div class="textarea-group {className}">
  {#if label}
    <label class="textarea-label" for={textareaId}>{label}</label>
  {/if}

  <textarea
    id={textareaId}
    class="textarea"
    class:textarea-error={!!error}
    class:textarea-readonly={readonly}
    aria-invalid={error ? true : undefined}
    aria-describedby={hasHint ? hintId : undefined}
    {placeholder}
    {disabled}
    {readonly}
    {rows}
    bind:value
    {...rest}
  ></textarea>

  {#if error}
    <span id={hintId} class="textarea-error-text" role="alert">{error}</span>
  {:else if help}
    <span id={hintId} class="textarea-help">{help}</span>
  {/if}
</div>

<style>
  .textarea-group {
    display: flex;
    flex-direction: column;
    gap: var(--input-label-gap);
    width: 100%;
  }

  .textarea-label {
    font-family: var(--input-label-font);
    font-size: var(--input-label-size);
    letter-spacing: var(--input-label-tracking);
    color: var(--input-label-color);
  }

  .textarea {
    font-family: var(--input-font);
    font-size: var(--input-font-size);
    border: var(--input-border);
    border-radius: var(--input-radius);
    background: var(--input-bg);
    color: var(--input-text);
    transition: border var(--input-transition);
    width: 100%;
    padding: var(--textarea-padding);
    min-height: var(--textarea-min-height);
    resize: vertical;
  }

  .textarea::placeholder {
    color: var(--input-placeholder);
  }

  .textarea:focus {
    outline: none;
    border: var(--input-border-focus);
  }

  .textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .textarea-readonly {
    background: var(--color-surface-secondary);
    cursor: default;
  }

  .textarea-error {
    border-color: var(--input-error-border-color);
  }

  .textarea-error:focus {
    border-color: var(--input-error-border-color);
  }

  .textarea-help {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-help-color);
  }

  .textarea-error-text {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-error-text);
  }
</style>
