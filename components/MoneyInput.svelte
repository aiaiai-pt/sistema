<!--
  @component MoneyInput

  Number-semantics input with a currency affordance (#35, atelier#669 V1).
  The WIRE value is always a raw number (or null when empty — empty and 0
  are distinct); locale-aware currency formatting appears while the field is
  NOT being edited; focus switches to the raw editable number.
  Consumes --input-* tokens (mirrors Input's field chrome).

  @example
  <MoneyInput label="BUDGET" value={1234.5} onchange={(n) => save(n)} />

  @example Non-default currency
  <MoneyInput label="FEE" currency="USD" locale="en-US" />
-->
<script module>
  let _moneyUid = 0;
</script>

<script>
  let {
    /** @type {number | null} — the raw amount; null = empty */
    value = null,
    /** @type {string} — ISO 4217 code for the display affordance */
    currency = 'EUR',
    /** @type {string | undefined} — BCP 47; defaults to the runtime locale */
    locale = undefined,
    /** @type {string | undefined} */
    label = undefined,
    /** @type {string | undefined} */
    placeholder = undefined,
    /** @type {string | undefined} */
    help = undefined,
    /** @type {string | undefined} */
    error = undefined,
    /** @type {'sm' | 'md' | 'lg'} */
    size = 'md',
    /** @type {boolean} */
    disabled = false,
    /** @type {boolean} */
    readonly = false,
    /** @type {string | undefined} */
    id = undefined,
    /** @type {string | undefined} */
    name = undefined,
    /** @type {((value: number | null) => void) | undefined} — fires with the
     *  RAW number (never a formatted string); null when cleared/unparseable */
    onchange = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const fallbackId = `money-input-${_moneyUid++}`;
  const inputId = $derived(id ?? fallbackId);
  const hintId = $derived(`${inputId}-hint`);
  const hasHint = $derived(!!error || !!help);

  let focused = $state(false);
  let draft = $state('');

  const formatter = $derived(
    new Intl.NumberFormat(locale, { style: 'currency', currency }),
  );

  const display = $derived(
    focused
      ? draft
      : value === null || value === undefined
        ? ''
        : formatter.format(Number(value)),
  );

  /**
   * Parse the operator's raw text onto a number: strips grouping spaces,
   * accepts a comma decimal. Empty/unparseable → null (never NaN, never a
   * silent 0 — empty and 0 stay distinct).
   * @param {string} text
   * @returns {number | null}
   */
  function parseAmount(text) {
    const trimmed = text.trim().replace(/\s+/g, '');
    if (!trimmed) return null;
    const normalized =
      trimmed.includes(',') && !trimmed.includes('.')
        ? trimmed.replace(',', '.')
        : trimmed;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function handleFocus() {
    if (readonly || disabled) return;
    draft = value === null || value === undefined ? '' : String(value);
    focused = true;
  }

  /** @param {Event} event */
  function handleInput(event) {
    draft = /** @type {HTMLInputElement} */ (event.currentTarget).value;
    const parsed = parseAmount(draft);
    value = parsed;
    onchange?.(parsed);
  }

  function handleBlur() {
    focused = false;
  }
</script>

<div class="money-input input-group {className}">
  {#if label}
    <label class="input-label" for={inputId}>{label}</label>
  {/if}

  <input
    id={inputId}
    {name}
    type="text"
    inputmode="decimal"
    class="input input-{size}"
    class:input-error={!!error}
    class:input-readonly={readonly}
    aria-invalid={error ? true : undefined}
    aria-describedby={hasHint ? hintId : undefined}
    {placeholder}
    {disabled}
    {readonly}
    value={display}
    onfocus={handleFocus}
    oninput={handleInput}
    onblur={handleBlur}
    autocomplete="off"
    {...rest}
  />

  {#if error}
    <span id={hintId} class="input-error-text" role="alert">{error}</span>
  {:else if help}
    <span id={hintId} class="input-help">{help}</span>
  {/if}
</div>

<style>
  .money-input {
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
</style>
