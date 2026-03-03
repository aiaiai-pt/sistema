<!--
  @component Menu

  Positioned floating menu anchored to a trigger element.
  Composes Popover internally and adds WAI-ARIA Menu Button semantics:
  arrow key navigation, typeahead, and Enter/Space activation.

  Consumes --menu-* tokens from components.css.

  @example
  <button bind:this={anchor} onclick={() => open = !open}>Options</button>
  <Menu bind:open {anchor} placement="bottom-start">
    <MenuItem onclick={handleEdit}>
      {#snippet leading()}<PencilIcon size={14} />{/snippet}
      Edit name
    </MenuItem>
    <MenuSeparator />
    <MenuItem variant="destructive" onclick={handleDelete}>
      {#snippet leading()}<TrashIcon size={14} />{/snippet}
      Delete
    </MenuItem>
  </Menu>
-->
<script>
  import Popover from './Popover.svelte';

  let {
    /** @type {boolean} */
    open = $bindable(false),
    /** @type {HTMLElement | undefined} */
    anchor = undefined,
    /** @type {'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'} */
    placement = 'bottom-start',
    /** @type {(() => void) | undefined} */
    onclose = undefined,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();

  /** @type {HTMLElement | undefined} */
  let menuEl;

  let typeaheadBuffer = $state('');
  let typeaheadTimer = $state(0);

  /**
   * Get all enabled menu items inside the menu container.
   * @returns {HTMLElement[]}
   */
  function getItems() {
    if (!menuEl) return [];
    return /** @type {HTMLElement[]} */ (
      Array.from(menuEl.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])'))
    );
  }

  /**
   * Focus the menu item at the given index (clamped).
   * @param {HTMLElement[]} items
   * @param {number} index
   */
  function focusItem(items, index) {
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    items[clamped]?.focus();
  }

  /** @param {KeyboardEvent} e */
  function handleKeydown(e) {
    const items = getItems();
    if (items.length === 0) return;

    const current = /** @type {HTMLElement} */ (document.activeElement);
    const currentIndex = items.indexOf(current);

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        focusItem(items, next);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        focusItem(items, prev);
        break;
      }
      case 'Home': {
        e.preventDefault();
        focusItem(items, 0);
        break;
      }
      case 'End': {
        e.preventDefault();
        focusItem(items, items.length - 1);
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (current && current.getAttribute('role') === 'menuitem') {
          current.click();
        }
        break;
      }
      default: {
        // Typeahead: printable characters
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          clearTimeout(typeaheadTimer);
          typeaheadBuffer += e.key.toLowerCase();
          typeaheadTimer = /** @type {number} */ (/** @type {unknown} */ (setTimeout(() => {
            typeaheadBuffer = '';
          }, 500)));

          const match = items.find((item) =>
            (item.textContent ?? '').trim().toLowerCase().startsWith(typeaheadBuffer)
          );
          if (match) match.focus();
        }
      }
    }
  }
</script>

<Popover
  bind:open
  {anchor}
  {placement}
  {onclose}
  class="menu-popover {className}"
  role="menu"
  aria-orientation="vertical"
  {...rest}
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    bind:this={menuEl}
    class="menu"
    onkeydown={handleKeydown}
  >
    {#if children}{@render children()}{/if}
  </div>
</Popover>

<style>
  :global(.menu-popover) {
    padding: 0 !important;
    min-width: var(--menu-min-width);
  }

  .menu {
    display: flex;
    flex-direction: column;
    padding: var(--menu-padding);
    outline: none;
  }
</style>
