<!--
  @component Popover

  Positioned floating content anchored to a trigger element.
  Uses position: fixed + JS positioning (no CSS Anchor).
  Consumes --popover-* tokens from components.css.

  @example
  <button bind:this={anchor} onclick={() => open = !open}>Options</button>
  <Popover bind:open {anchor} placement="bottom-start">
    <p>Popover content</p>
  </Popover>

  @example Match trigger width
  <Popover bind:open {anchor} matchWidth>
    <ul>...</ul>
  </Popover>
-->
<script module>
  let _popoverUid = 0;
</script>

<script>
  /**
   * @typedef {'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'} Placement
   */

  let {
    /** @type {boolean} */
    open = $bindable(false),
    /** @type {HTMLElement | undefined} */
    anchor = undefined,
    /** @type {Placement} */
    placement = 'bottom-start',
    /** @type {number} */
    offset = 4,
    /** @type {boolean} */
    matchWidth = false,
    /** @type {(() => void) | undefined} */
    onclose = undefined,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();

  const popoverId = `popover-${_popoverUid++}`;

  /** @type {HTMLElement | undefined} */
  let popoverEl = $state();

  let posX = $state(0);
  let posY = $state(0);
  let width = $state(0);

  function reposition() {
    if (!anchor || !popoverEl) return;

    const rect = anchor.getBoundingClientRect();
    const popRect = popoverEl.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;

    if (matchWidth) {
      width = rect.width;
    }

    const isTop = placement.startsWith('top');
    const isEnd = placement.endsWith('end');

    let x = isEnd ? rect.right - (matchWidth ? rect.width : popRect.width) : rect.left;
    let y = isTop ? rect.top - popRect.height - offset : rect.bottom + offset;

    // Flip vertical if out of viewport
    if (!isTop && y + popRect.height > viewportH) {
      y = rect.top - popRect.height - offset;
    } else if (isTop && y < 0) {
      y = rect.bottom + offset;
    }

    // Clamp horizontal
    if (x + popRect.width > viewportW) {
      x = viewportW - popRect.width - offset;
    }
    if (x < 0) x = offset;

    posX = x;
    posY = y;
  }

  // Position + close listeners
  $effect(() => {
    if (!open || !popoverEl || !anchor) return;

    requestAnimationFrame(() => reposition());

    /** @type {HTMLElement | null} */
    const previouslyFocused = /** @type {HTMLElement | null} */ (document.activeElement);

    // Focus first focusable child
    requestAnimationFrame(() => {
      const focusable = popoverEl?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) /** @type {HTMLElement} */ (focusable).focus();
    });

    /** @param {KeyboardEvent} e */
    function handleKeydown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        open = false;
        onclose?.();
      }
    }

    /** @param {MouseEvent} e */
    function handleClickOutside(e) {
      const target = /** @type {Node} */ (e.target);
      if (
        popoverEl &&
        !popoverEl.contains(target) &&
        anchor &&
        !anchor.contains(target)
      ) {
        open = false;
        onclose?.();
      }
    }

    function handleScroll() {
      reposition();
    }

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', reposition);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', reposition);
      previouslyFocused?.focus();
    };
  });
</script>

{#if open}
  <div
    bind:this={popoverEl}
    id={popoverId}
    class="popover {className}"
    role="dialog"
    style:left="{posX}px"
    style:top="{posY}px"
    style:width={matchWidth ? `${width}px` : undefined}
    {...rest}
  >
    {#if children}{@render children()}{/if}
  </div>
{/if}

<style>
  .popover {
    position: fixed;
    z-index: var(--popover-z);
    background: var(--popover-bg);
    border: var(--popover-border);
    border-radius: var(--popover-radius);
    box-shadow: var(--popover-shadow);
    padding: var(--popover-padding);
    animation: popover-enter var(--duration-fast) var(--easing-enter);
  }

  @keyframes popover-enter {
    from {
      opacity: 0;
      transform: translateY(var(--popover-enter-offset));
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .popover {
      animation: none;
    }
  }
</style>
