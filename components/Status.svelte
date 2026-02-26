<!--
  @component Status

  Colored indicator dot with label. Used for real-time status, health, presence.
  Consumes --status-* tokens from components.css.

  Dot shapes encode meaning: circle=success, triangle=warning, diamond=error, ring=inactive.

  @example
  <Status variant="success">ACTIVE</Status>

  @example Pulsing
  <Status variant="warning" pulse>DEGRADED</Status>
-->
<script>
  /**
   * @typedef {'success' | 'warning' | 'error' | 'inactive'} Variant
   */

  let {
    /** @type {Variant} */
    variant = 'success',
    /** @type {boolean} */
    pulse = false,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children,
    ...rest
  } = $props();

  const colorMap = {
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-destructive)',
    inactive: 'var(--color-text-muted)',
  };
</script>

<span class="status {className}" {...rest}>
  <span
    class="status-dot status-dot-{variant}"
    class:status-dot-pulse={pulse}
    style:background={variant !== 'inactive' ? colorMap[variant] : undefined}
    style:color={variant === 'inactive' ? colorMap[variant] : undefined}
    aria-hidden="true"
  ></span>
  {#if children}
    <span class="status-label">{@render children()}</span>
  {/if}
</span>

<style>
  .status {
    display: inline-flex;
    align-items: center;
    gap: var(--status-gap);
  }

  .status-dot {
    width: var(--status-dot-size);
    height: var(--status-dot-size);
    border-radius: var(--radius-circle);
    flex-shrink: 0;
  }

  /* Shape variants: progressive enhancement over base circle */
  .status-dot-warning {
    border-radius: 0;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  }

  .status-dot-error {
    border-radius: 0;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }

  .status-dot-inactive {
    background: transparent !important;
    box-shadow: inset 0 0 0 2px currentColor;
  }

  .status-dot-pulse {
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  @media (prefers-reduced-motion: reduce) {
    .status-dot-pulse {
      animation: none;
    }
  }

  .status-label {
    font-family: var(--status-font);
    font-size: var(--status-size);
    letter-spacing: var(--type-label-tracking);
  }
</style>
