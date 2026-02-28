<!--
  @component Modal

  Centered overlay dialog with focus trap and backdrop.
  Unlike Panel (slide-over drawer), Modal is centered and rounded.
  Consumes --modal-* tokens from components.css.

  @example
  <Modal open={showConfirm} title="Delete Pipeline" onclose={() => showConfirm = false}>
    Are you sure you want to delete this pipeline?
    {#snippet footer()}
      <Button variant="ghost" onclick={() => showConfirm = false}>CANCEL</Button>
      <Button variant="destructive" onclick={handleDelete}>DELETE</Button>
    {/snippet}
  </Modal>

  @example Small
  <Modal open width="sm" title="Rename" onclose={close}>
    <Input label="NAME" bind:value={name} />
  </Modal>
-->
<script module>
  let _modalUid = 0;
</script>

<script>
  /**
   * @typedef {'default' | 'sm' | 'lg'} Width
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
    header = undefined,
    /** @type {import('svelte').Snippet | undefined} */
    footer = undefined,
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();

  const headerId = `modal-header-${_modalUid++}`;

  /** @type {HTMLElement | undefined} */
  let modalEl;

  const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  // Focus trap + scroll lock
  $effect(() => {
    if (!open || !modalEl) return;

    const previouslyFocused = /** @type {HTMLElement | null} */ (document.activeElement);
    document.body.style.overflow = 'hidden';

    const firstFocusable = modalEl.querySelector(FOCUSABLE);
    if (firstFocusable) /** @type {HTMLElement} */ (firstFocusable).focus();

    /** @param {KeyboardEvent} e */
    function handleKeydown(e) {
      if (e.key === 'Escape') {
        onclose?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = /** @type {NodeListOf<HTMLElement>} */ (modalEl?.querySelectorAll(FOCUSABLE));
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
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  });

  function handleBackdropClick() {
    onclose?.();
  }
</script>

{#if open}
  <div class="modal-backdrop" onclick={handleBackdropClick} aria-hidden="true"></div>

  <div class="modal-container">
    <div
      bind:this={modalEl}
      class="modal modal-{width} {className}"
      role="dialog"
      aria-modal="true"
      aria-label={!header ? title : undefined}
      aria-labelledby={header ? headerId : undefined}
      {...rest}
    >
      <div class="modal-header">
        {#if header}
          <div id={headerId}>{@render header()}</div>
        {:else if title}
          <h2 class="modal-title">{title}</h2>
        {/if}
        <button
          class="modal-close"
          onclick={onclose}
          aria-label="Close"
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        {#if children}{@render children()}{/if}
      </div>

      {#if footer}
        <div class="modal-footer">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: var(--modal-backdrop);
    z-index: 50;
    animation: modal-fade-in var(--duration-normal) var(--easing-enter);
  }

  .modal-container {
    position: fixed;
    inset: 0;
    z-index: 51;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
    pointer-events: none;
  }

  .modal {
    pointer-events: auto;
    background: var(--modal-bg);
    border-radius: var(--modal-radius);
    box-shadow: var(--modal-shadow);
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - calc(2 * var(--space-lg)));
    animation: modal-scale-in var(--modal-transition);
  }

  .modal-default { width: var(--modal-width); max-width: 100%; }
  .modal-sm { width: var(--modal-width-sm); max-width: 100%; }
  .modal-lg { width: var(--modal-width-lg); max-width: 100%; }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: var(--modal-header-height);
    padding: 0 var(--modal-padding);
    border-bottom: var(--modal-header-border);
    flex-shrink: 0;
  }

  .modal-title {
    font-family: var(--modal-header-font);
    font-size: var(--modal-header-size);
    font-weight: var(--modal-header-weight);
    color: var(--color-text);
    margin: 0;
  }

  .modal-close {
    all: unset;
    box-sizing: border-box;
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

  .modal-close:hover {
    background: var(--color-surface-secondary);
    color: var(--color-text);
  }

  .modal-close:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .modal-close svg {
    width: 16px;
    height: 16px;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--modal-padding);
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-sm);
    padding: var(--space-md) var(--modal-padding);
    border-top: var(--modal-header-border);
    flex-shrink: 0;
  }

  @keyframes modal-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes modal-scale-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    .modal { animation: none; }
    .modal-backdrop { animation: none; }
  }
</style>
