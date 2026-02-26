<!--
  @component Panel

  Slide-over drawer surface. Opens from the right edge.
  Consumes --panel-* tokens from components.css.

  @example
  <Panel open={showEditor} title="Edit Step" onclose={() => showEditor = false}>
    Panel content here
  </Panel>

  @example Narrow
  <Panel open width="narrow" title="Settings" onclose={close}>
    Settings form
  </Panel>
-->
<script>
  /**
   * @typedef {'default' | 'narrow' | 'wide'} Width
   */

  let {
    /** @type {boolean} */
    open = false,
    /** @type {string | undefined} */
    title,
    /** @type {Width} */
    width = 'default',
    /** @type {(() => void) | undefined} */
    onclose,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    header,
    /** @type {import('svelte').Snippet | undefined} */
    children,
    ...rest
  } = $props();

  function handleKeydown(e) {
    if (e.key === 'Escape' && open) {
      onclose?.();
    }
  }

  function handleBackdropClick() {
    onclose?.();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <div
    class="panel-backdrop"
    onclick={handleBackdropClick}
    aria-hidden="true"
  ></div>

  <!-- Panel -->
  <aside
    class="panel panel-{width} {className}"
    role="dialog"
    aria-modal="true"
    aria-label={title}
    {...rest}
  >
    <div class="panel-header">
      {#if header}
        {@render header()}
      {:else if title}
        <h2 class="panel-title">{title}</h2>
      {/if}
      <button
        class="panel-close"
        onclick={onclose}
        aria-label="Close panel"
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <div class="panel-body">
      {#if children}{@render children()}{/if}
    </div>
  </aside>
{/if}

<style>
  .panel-backdrop {
    position: fixed;
    inset: 0;
    background: var(--panel-backdrop);
    z-index: 40;
    animation: fade-in var(--duration-normal) var(--easing-enter);
  }

  .panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    background: var(--panel-bg);
    border-left: var(--panel-border);
    box-shadow: var(--panel-shadow);
    border-radius: var(--panel-radius);
    z-index: 41;
    display: flex;
    flex-direction: column;
    animation: slide-in var(--panel-transition);
  }

  .panel-default {
    width: var(--panel-width);
    max-width: 100vw;
  }

  .panel-narrow {
    width: var(--panel-width-narrow);
    max-width: 100vw;
  }

  .panel-wide {
    width: var(--panel-width-wide);
    max-width: 100vw;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--panel-header-height);
    padding: 0 var(--panel-padding);
    border-bottom: var(--panel-header-border);
    flex-shrink: 0;
  }

  .panel-title {
    font-family: var(--panel-header-font);
    font-size: var(--panel-header-size);
    font-weight: var(--panel-header-weight);
    color: var(--color-text);
    margin: 0;
  }

  .panel-close {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    color: var(--color-text-secondary);
    transition: all var(--duration-instant) var(--easing-default);
  }

  .panel-close:hover {
    background: var(--color-surface-secondary);
    color: var(--color-text);
  }

  .panel-close:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .panel-close svg {
    width: 16px;
    height: 16px;
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--panel-padding);
  }

  @keyframes slide-in {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .panel {
      animation: none;
    }

    .panel-backdrop {
      animation: none;
    }
  }
</style>
