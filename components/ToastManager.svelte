<!--
  @component ToastManager

  Lifecycle manager for Toast notifications — positioning, stacking,
  auto-dismiss, and max-visible limit.  Wraps the visual Toast component.

  Mount once in your root layout.  Use the exported `toasts` store to
  push notifications from anywhere in the app.

  Consumes --toast-manager-* tokens from components.css.

  @example
  <script>
    import { ToastManager, toasts } from '@aiaiai-pt/design-system';

    toasts.push({ variant: 'success', message: 'Saved!' });
    toasts.push({ variant: 'error', message: 'Failed.', autoDismiss: 8000 });
  </script>

  <ToastManager />
-->
<script>
  import Toast from './Toast.svelte';

  /**
   * @typedef {'info' | 'success' | 'warning' | 'error'} Variant
   * @typedef {{ id: string; variant: Variant; message: string; actionLabel?: string; onaction?: () => void; autoDismiss?: number }} ToastItem
   */

  let {
    /** @type {'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'} */
    position = 'top-right',
    /** @type {number} ms before auto-dismiss (0 = no auto-dismiss) */
    autoDismiss = 5000,
    /** @type {number} max visible toasts — oldest removed when exceeded */
    maxVisible = 5,
    /** @type {string} */
    class: className = '',
  } = $props();

  /** @type {ToastItem[]} */
  let items = $state([]);

  /** @type {Map<string, ReturnType<typeof setTimeout>>} */
  const timers = new Map();

  let _idCounter = 0;

  /**
   * Add a toast.  Returns the toast id for manual removal.
   * @param {{ variant?: Variant; message: string; actionLabel?: string; onaction?: () => void; autoDismiss?: number }} toast
   * @returns {string}
   */
  export function push(toast) {
    const id = `toast-${++_idCounter}-${Date.now()}`;
    const item = {
      id,
      variant: toast.variant ?? 'info',
      message: toast.message,
      actionLabel: toast.actionLabel,
      onaction: toast.onaction,
      autoDismiss: toast.autoDismiss,
    };

    items = [...items, item];

    // Enforce max visible
    if (items.length > maxVisible) {
      const removed = items[0];
      items = items.slice(1);
      _clearTimer(removed.id);
    }

    // Schedule auto-dismiss
    const duration = item.autoDismiss ?? autoDismiss;
    if (duration > 0) {
      const timer = setTimeout(() => dismiss(id), duration);
      timers.set(id, timer);
    }

    return id;
  }

  /**
   * Remove a toast by id.
   * @param {string} id
   */
  export function dismiss(id) {
    _clearTimer(id);
    items = items.filter((t) => t.id !== id);
  }

  /** Remove all toasts. */
  export function clear() {
    for (const [id] of timers) clearTimeout(timers.get(id));
    timers.clear();
    items = [];
  }

  /**
   * @param {string} id
   */
  function _clearTimer(id) {
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
  }

  const positionClasses = {
    'top-right': 'tm-top tm-right',
    'top-left': 'tm-top tm-left',
    'bottom-right': 'tm-bottom tm-right',
    'bottom-left': 'tm-bottom tm-left',
  };
</script>

{#if items.length > 0}
  <div
    class="toast-manager {positionClasses[position]} {className}"
    aria-live="polite"
    aria-relevant="additions removals"
  >
    {#each items as item (item.id)}
      <div class="toast-slot" data-toast-id={item.id}>
        <Toast
          variant={item.variant}
          actionLabel={item.actionLabel}
          onaction={item.onaction}
        >
          {@html item.message}
        </Toast>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-manager {
    position: fixed;
    z-index: var(--toast-manager-z, 60);
    display: flex;
    flex-direction: column;
    gap: var(--toast-manager-gap, var(--space-sm));
    padding: var(--toast-manager-padding, var(--space-lg));
    pointer-events: none;
  }

  .toast-manager > :global(*) {
    pointer-events: auto;
  }

  /* Position modifiers */
  .tm-top { top: 0; }
  .tm-bottom { bottom: 0; flex-direction: column-reverse; }
  .tm-right { right: 0; align-items: flex-end; }
  .tm-left { left: 0; align-items: flex-start; }

  /* Entry animation */
  .toast-slot {
    animation: toast-enter var(--duration-normal) var(--easing-enter);
  }

  @keyframes toast-enter {
    from {
      opacity: 0;
      transform: translateX(var(--toast-manager-enter-offset, 16px));
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .toast-slot {
      animation: none;
    }
  }
</style>
