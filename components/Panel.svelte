<!--
  @component Panel

  Slide-over drawer surface. Opens from the left or right edge.
  Consumes --panel-* tokens from components.css.

  @example Right (default)
  <Panel open={showEditor} title="Edit Step" onclose={() => showEditor = false}>
    Panel content here
  </Panel>

  @example Left side
  <Panel open side="left" title="History" onclose={() => showHistory = false}>
    Navigation content
  </Panel>

  @example Persistent (no backdrop, inline layout)
  <Panel open persistent side="left" title="History">
    Always-visible sidebar content
  </Panel>

  @example Modeless drawer (fixed slide-over, page behind stays interactive)
  <Panel open modeless title="Execute action" onclose={() => showAction = false}>
    Action form here — focus moves to the heading, Escape closes while inside
  </Panel>
-->
<script module>
  let _panelUid = 0;
</script>

<script>
  /**
   * @typedef {'default' | 'narrow' | 'wide'} Width
   * @typedef {'left' | 'right'} Side
   */

  let {
    /** @type {boolean} */
    open = false,
    /** @type {string | undefined} */
    title,
    /** @type {Width} */
    width = 'default',
    /** @type {Side} */
    side = 'right',
    /** @type {boolean} When true, removes backdrop and focus trap. Panel becomes an inline layout element. */
    persistent = false,
    /** @type {boolean} Modeless drawer (#629): stays a FIXED slide-over like the
     * default mode, but with no backdrop, no aria-modal, and no focus trap —
     * the page behind remains browsable/interactive. On open the panel is a
     * labelled region and focus MOVES to its heading (announced, not trapped);
     * Escape closes only while focus is inside the panel; focus returns to the
     * previously-focused element on close (the host owns any deep-link
     * fallback). Ignored when `persistent` is set. */
    modeless = false,
    /** @type {boolean} When false, body doesn't scroll — children manage their own overflow. */
    scrollBody = true,
    /** @type {(() => void) | undefined} */
    onclose,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    header = undefined,
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    /** @type {import('svelte').Snippet | undefined} */
    footer = undefined,
    ...rest
  } = $props();

  const headerId = `panel-header-${_panelUid++}`;

  /** @type {HTMLElement | undefined} */
  let panelEl = $state();

  const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  // Resolved mode: persistent wins over modeless (persistent consumers are
  // inline layout elements — a fixed slide-over would be a breaking change).
  const isPersistent = $derived(persistent);
  const isModeless = $derived(modeless && !persistent);
  const isDialog = $derived(!persistent && !modeless);

  // Focus trap: save previous focus, trap Tab, restore on close
  // Skipped in persistent and modeless modes (persistent is inline; modeless
  // deliberately leaves the page behind reachable — focus moved, not trapped)
  $effect(() => {
    if (!open || !panelEl || !isDialog) return;

    const previouslyFocused = /** @type {HTMLElement | null} */ (document.activeElement);

    // Focus the close button on open
    const firstFocusable = panelEl.querySelector(FOCUSABLE);
    if (firstFocusable) /** @type {HTMLElement} */ (firstFocusable).focus();

    /** @param {KeyboardEvent} e */
    function handleKeydown(e) {
      if (e.key === 'Escape') {
        onclose?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = /** @type {NodeListOf<HTMLElement>} */ (panelEl?.querySelectorAll(FOCUSABLE));
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      previouslyFocused?.focus();
    };
  });

  function handleBackdropClick() {
    onclose?.();
  }

  // Modeless drawer (#629): initial focus to the panel heading (announces the
  // labelled region without trapping), Escape scoped to the PANEL element so
  // it closes only while focus is inside, previous focus restored on close.
  $effect(() => {
    if (!open || !panelEl || !isModeless) return;

    const previouslyFocused = /** @type {HTMLElement | null} */ (document.activeElement);

    const heading = /** @type {HTMLElement | null} */ (
      panelEl.querySelector('.panel-heading-focus')
    );
    heading?.focus();

    /** @param {KeyboardEvent} e */
    function handlePanelKeydown(e) {
      if (e.key === 'Escape') onclose?.();
    }

    panelEl.addEventListener('keydown', handlePanelKeydown);

    return () => {
      panelEl?.removeEventListener('keydown', handlePanelKeydown);
      // Deep-link entries have no meaningful previous focus (body) — the HOST
      // owns that fallback (e.g. page H1); restoring a disconnected node is a
      // no-op by contract.
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  });
</script>

{#if open}
  <!-- Backdrop (dialog mode only — persistent is inline, modeless leaves the
       page behind visible and interactive) -->
  {#if isDialog}
    <div
      class="panel-backdrop"
      onclick={handleBackdropClick}
      aria-hidden="true"
    ></div>
  {/if}

  <!-- Panel -->
  <aside
    bind:this={panelEl}
    class="panel panel-{width} panel-side-{side} {isPersistent ? 'panel-persistent' : ''} {className}"
    role={isPersistent ? 'complementary' : isModeless ? 'region' : 'dialog'}
    aria-modal={isDialog ? 'true' : undefined}
    aria-label={!header ? title : undefined}
    aria-labelledby={header ? headerId : undefined}
    {...rest}
  >
    <div class="panel-header">
      {#if header}
        <div
          id={headerId}
          class="panel-heading-focus"
          tabindex={isModeless ? -1 : undefined}
        >{@render header()}</div>
      {:else if title}
        <h2
          class="panel-title panel-heading-focus"
          tabindex={isModeless ? -1 : undefined}
        >{title}</h2>
      {/if}
      {#if !persistent}
        <button
          class="panel-close"
          onclick={onclose}
          aria-label="Close panel"
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      {/if}
    </div>

    <div class="panel-body" class:panel-body-no-scroll={!scrollBody}>
      {#if children}{@render children()}{/if}
    </div>

    {#if footer}
      <div class="panel-footer">
        {@render footer()}
      </div>
    {/if}
  </aside>
{/if}

<style>
  .panel-backdrop {
    position: fixed;
    inset: 0;
    background: var(--panel-backdrop);
    z-index: var(--panel-z-backdrop);
    animation: fade-in var(--duration-normal) var(--easing-enter);
  }

  .panel {
    position: fixed;
    top: 0;
    bottom: 0;
    background: var(--panel-bg);
    box-shadow: var(--panel-shadow);
    border-radius: var(--panel-radius);
    z-index: var(--panel-z-panel);
    display: flex;
    flex-direction: column;
  }

  .panel-side-right {
    right: 0;
    border-left: var(--panel-border);
    animation: slide-in-right var(--panel-transition);
  }

  .panel-side-left {
    left: 0;
    border-right: var(--panel-border);
    animation: slide-in-left var(--panel-transition);
  }

  .panel-persistent {
    position: relative;
    top: auto;
    bottom: auto;
    z-index: auto;
    box-shadow: none;
    flex-shrink: 0;
    height: 100%;
    animation: none;
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
    width: var(--panel-close-size);
    height: var(--panel-close-size);
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
    width: var(--panel-close-icon-size);
    height: var(--panel-close-icon-size);
  }

  .panel-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--panel-padding);
  }

  .panel-body-no-scroll {
    overflow: hidden;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .panel-footer {
    flex-shrink: 0;
    border-top: var(--panel-header-border);
    padding: var(--space-md) var(--panel-padding);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes slide-in-left {
    from {
      transform: translateX(-100%);
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
    .panel-side-right,
    .panel-side-left {
      animation: none;
    }

    .panel-backdrop {
      animation: none;
    }
  }
</style>
