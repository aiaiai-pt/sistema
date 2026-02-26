<!--
  @component Badge

  Semantic status label. Pill-shaped, mono font, color-coded.
  Consumes --badge-* tokens from components.css.

  @example
  <Badge variant="success">PASSED</Badge>

  @example With dot
  <Badge variant="info" dot>SYNCING</Badge>
-->
<script>
  /**
   * @typedef {'neutral' | 'info' | 'success' | 'warning' | 'error'} Variant
   */

  let {
    /** @type {Variant} */
    variant = 'neutral',
    /** @type {boolean} */
    dot = false,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    icon,
    /** @type {import('svelte').Snippet | undefined} */
    children,
    ...rest
  } = $props();
</script>

<span class="badge badge-{variant} {className}" {...rest}>
  {#if dot}
    <span class="badge-dot" aria-hidden="true"></span>
  {/if}
  {#if icon}
    <span class="badge-icon-wrap">{@render icon()}</span>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    font-family: var(--badge-font);
    font-size: var(--badge-size);
    letter-spacing: var(--badge-tracking);
    border-radius: var(--badge-radius);
    padding: var(--badge-padding-y) var(--badge-padding-x);
    white-space: nowrap;
  }

  .badge-neutral {
    background: var(--badge-neutral-bg);
    color: var(--badge-neutral-text);
  }

  .badge-info {
    background: var(--color-info-subtle);
    color: var(--color-info);
  }

  .badge-success {
    background: var(--color-success-subtle);
    color: var(--color-success);
  }

  .badge-warning {
    background: var(--color-warning-subtle);
    color: var(--color-warning);
  }

  .badge-error {
    background: var(--color-destructive-subtle);
    color: var(--color-destructive);
  }

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: var(--radius-circle);
    background: currentColor;
    flex-shrink: 0;
  }

  .badge-icon-wrap {
    display: flex;
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }

  .badge-icon-wrap :global(svg) {
    width: 100%;
    height: 100%;
  }
</style>
