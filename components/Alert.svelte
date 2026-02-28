<!--
  @component Alert

  Inline callout for contextual messages.
  Unlike Toast (floating, transient), Alert is in-flow and persistent.
  Consumes --alert-* tokens from components.css.

  @example Info
  <Alert variant="info">
    <strong>Note:</strong> This pipeline requires a source connection.
  </Alert>

  @example Error with icon
  <Alert variant="error">
    {#snippet icon()}<svg>...</svg>{/snippet}
    <strong>Build failed.</strong> Check the CI logs for details.
  </Alert>
-->
<script>
  /**
   * @typedef {'info' | 'success' | 'warning' | 'error'} Variant
   */

  let {
    /** @type {Variant} */
    variant = 'info',
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    icon = undefined,
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();

  /** @type {Record<string, string>} */
  const accentColors = {
    info: 'var(--color-info)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-destructive)',
  };
</script>

<div
  class="alert {className}"
  role={variant === 'error' ? 'alert' : 'status'}
  {...rest}
>
  <div class="alert-accent" style:background={accentColors[variant]}></div>
  <div class="alert-content">
    {#if icon}
      <span class="alert-icon" aria-hidden="true">{@render icon()}</span>
    {/if}
    <div class="alert-body">
      {#if children}{@render children()}{/if}
    </div>
  </div>
</div>

<style>
  .alert {
    display: flex;
    overflow: hidden;
    border-radius: var(--alert-radius);
    border: var(--alert-border);
    background: var(--alert-bg);
  }

  .alert-accent {
    width: var(--accent-stripe-width);
    flex-shrink: 0;
  }

  .alert-content {
    padding: var(--alert-padding);
    display: flex;
    gap: var(--space-sm);
    flex: 1;
  }

  .alert-icon {
    display: flex;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    margin-top: 2px;
  }

  .alert-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .alert-body {
    font-family: var(--alert-font);
    font-size: var(--alert-font-size);
    flex: 1;
  }
</style>
