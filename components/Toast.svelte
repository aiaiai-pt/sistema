<!--
  @component Toast

  Non-blocking notification with accent stripe.
  Consumes --toast-* tokens from components.css.

  This is the visual component only — toast positioning/stacking/auto-dismiss
  is the consumer's responsibility.

  @example
  <Toast variant="success">
    <strong>Project created.</strong> Your new project is ready.
  </Toast>

  @example With action
  <Toast variant="info" actionLabel="UNDO" onaction={() => undo()}>
    <strong>Message archived.</strong>
  </Toast>
-->
<script>
  /**
   * @typedef {'info' | 'success' | 'warning' | 'error'} Variant
   */

  let {
    /** @type {Variant} */
    variant = 'info',
    /** @type {string | undefined} */
    actionLabel,
    /** @type {(() => void) | undefined} */
    onaction,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children,
    ...rest
  } = $props();

  const accentColors = {
    info: 'var(--color-info)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-destructive)',
  };
</script>

<div class="toast {className}" role="status" {...rest}>
  <div class="toast-accent" style:background={accentColors[variant]}></div>
  <div class="toast-content">
    <span class="toast-message">
      {#if children}{@render children()}{/if}
    </span>
    {#if actionLabel && onaction}
      <button class="toast-action" onclick={onaction}>
        <span class="toast-action-label">{actionLabel}</span>
      </button>
    {/if}
  </div>
</div>

<style>
  .toast {
    display: flex;
    overflow: hidden;
    border-radius: var(--toast-radius);
    border: var(--toast-border);
    box-shadow: var(--toast-shadow);
    background: var(--toast-bg);
    max-width: var(--toast-max-width);
  }

  .toast-accent {
    width: var(--accent-stripe-width);
    flex-shrink: 0;
  }

  .toast-content {
    padding: var(--toast-padding);
    font-family: var(--toast-font);
    font-size: var(--toast-font-size);
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex: 1;
  }

  .toast-message {
    flex: 1;
  }

  .toast-action {
    all: unset;
    cursor: pointer;
    flex-shrink: 0;
    transition: opacity var(--duration-instant) var(--easing-default);
  }

  .toast-action:hover {
    opacity: 0.8;
  }

  .toast-action:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .toast-action-label {
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    letter-spacing: var(--type-label-tracking);
    color: var(--color-accent);
  }
</style>
