<!--
  @component Button

  Four variants, three sizes. Labels always mono (Berkeley Mono).
  Renders as `<a>` when `href` is provided, `<button>` otherwise.
  Consumes --button-* tokens from components.css.

  @example
  <Button variant="primary" size="md">CREATE</Button>

  @example With icon
  <Button variant="secondary" size="sm">
    {#snippet icon()}<PhPlus size={16} />{/snippet}
    ADD ITEM
  </Button>

  @example As link
  <Button variant="secondary" size="sm" href="/some/path">
    GO THERE
  </Button>

  @example Loading
  <Button variant="primary" loading>SAVING</Button>

  @example Icon only
  <Button variant="ghost" size="md" iconOnly aria-label="Settings">
    {#snippet icon()}<PhGear size={16} />{/snippet}
  </Button>
-->
<script>
  /**
   * @typedef {'primary' | 'secondary' | 'ghost' | 'destructive'} Variant
   * @typedef {'sm' | 'md' | 'lg'} Size
   * @typedef {'button' | 'submit' | 'reset'} ButtonType
   */

  let {
    /** @type {Variant} */
    variant = 'primary',
    /** @type {Size} */
    size = 'md',
    /** @type {boolean} */
    loading = false,
    /** @type {boolean} */
    disabled = false,
    /** @type {boolean} */
    iconOnly = false,
    /** @type {ButtonType} */
    type = 'button',
    /** @type {string | undefined} */
    href = undefined,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    icon = undefined,
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    /** @type {HTMLButtonElement | HTMLAnchorElement | undefined} */
    ref = $bindable(),
    ...rest
  } = $props();

  /** @type {'button' | 'submit' | 'reset'} — cast needed for svelte-check on <button type> */
  const buttonType = $derived(/** @type {'button' | 'submit' | 'reset'} */ (type));
  const classes = $derived(`btn btn-${variant} btn-${size} ${iconOnly ? 'btn-icon-only' : ''} ${className}`.trim());
</script>

{#snippet content()}
  {#if loading}
    <span class="spinner" aria-hidden="true"></span>
  {/if}
  {#if icon && !loading}
    <span class="btn-icon-wrap">{@render icon()}</span>
  {/if}
  {#if children}
    <span class="btn-label">{@render children()}</span>
  {/if}
{/snippet}

{#if href && !disabled}
  <a
    bind:this={ref}
    {href}
    class={classes}
    aria-busy={loading || undefined}
    {...rest}
  >
    {@render content()}
  </a>
{:else}
  <button
    bind:this={ref}
    type={buttonType}
    class={classes}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    {...rest}
  >
    {@render content()}
  </button>
{/if}

<style>
  /* ─── Base ─── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    font-family: var(--button-font);
    letter-spacing: var(--button-tracking);
    border-radius: var(--button-radius);
    border: none;
    cursor: pointer;
    transition: all var(--button-transition);
    white-space: nowrap;
    text-decoration: none;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  /* ─── Sizes ─── */
  .btn-sm {
    height: var(--button-sm-height);
    padding: 0 var(--button-sm-padding-x);
    font-size: var(--button-sm-font-size);
  }

  .btn-md {
    height: var(--button-md-height);
    padding: 0 var(--button-md-padding-x);
    font-size: var(--button-md-font-size);
  }

  .btn-lg {
    height: var(--button-lg-height);
    padding: 0 var(--button-lg-padding-x);
    font-size: var(--button-lg-font-size);
  }

  /* ─── Primary ─── */
  .btn-primary {
    background: var(--button-primary-bg);
    color: var(--button-primary-text);
    border: var(--button-primary-border);
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--button-primary-bg-hover);
  }

  .btn-primary:active:not(:disabled) {
    background: var(--button-primary-bg-hover);
    transform: scale(0.97);
  }

  /* ─── Secondary ─── */
  .btn-secondary {
    background: var(--button-secondary-bg);
    color: var(--button-secondary-text);
    border: var(--button-secondary-border);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--button-secondary-bg-hover);
  }

  .btn-secondary:active:not(:disabled) {
    background: var(--button-secondary-bg-hover);
    transform: scale(0.97);
  }

  /* ─── Ghost ─── */
  .btn-ghost {
    background: var(--button-ghost-bg);
    color: var(--button-ghost-text);
    border: var(--button-ghost-border);
  }

  .btn-ghost:hover:not(:disabled) {
    background: var(--button-ghost-bg-hover);
  }

  .btn-ghost:active:not(:disabled) {
    background: var(--button-ghost-bg-hover);
    transform: scale(0.97);
  }

  /* ─── Destructive ─── */
  .btn-destructive {
    background: var(--button-destructive-bg);
    color: var(--button-destructive-text);
    border: var(--button-destructive-border);
  }

  .btn-destructive:hover:not(:disabled) {
    background: var(--button-destructive-bg-hover);
  }

  .btn-destructive:active:not(:disabled) {
    background: var(--button-destructive-bg-hover);
    transform: scale(0.97);
  }

  /* ─── Label ─── */
  .btn-label {
    font-family: inherit;
    font-size: inherit;
    letter-spacing: inherit;
  }

  /* ─── Icon ─── */
  .btn-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
    flex-shrink: 0;
  }

  .btn-icon-wrap :global(svg) {
    width: 100%;
    height: 100%;
  }

  .btn-icon-only {
    padding: 0;
  }

  .btn-icon-only.btn-sm {
    width: var(--button-sm-height);
  }

  .btn-icon-only.btn-md {
    width: var(--button-md-height);
  }

  .btn-icon-only.btn-lg {
    width: var(--button-lg-height);
  }

  /* ─── Spinner ─── */
  .spinner {
    width: 14px;
    height: 14px;
    border: var(--border-width-thick) solid currentColor;
    border-top-color: transparent;
    border-radius: var(--radius-circle);
    animation: spin 0.6s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: none;
    }
  }
</style>
