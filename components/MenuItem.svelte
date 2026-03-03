<!--
  @component MenuItem

  A single actionable row inside a Menu.
  Renders as <button role="menuitem"> with optional leading/trailing snippets.

  Consumes --menu-item-* tokens from components.css.

  @example
  <MenuItem onclick={handleEdit}>
    {#snippet leading()}<PencilIcon size={14} />{/snippet}
    Edit name
  </MenuItem>

  @example Destructive
  <MenuItem variant="destructive" onclick={handleDelete}>
    {#snippet leading()}<TrashIcon size={14} />{/snippet}
    Delete
  </MenuItem>

  @example With keyboard shortcut
  <MenuItem onclick={handleCopy}>
    Copy
    {#snippet trailing()}<kbd>⌘C</kbd>{/snippet}
  </MenuItem>
-->
<script>
  let {
    /** @type {'default' | 'destructive'} */
    variant = 'default',
    /** @type {boolean} */
    disabled = false,
    /** @type {import('svelte').Snippet | undefined} */
    leading = undefined,
    /** @type {import('svelte').Snippet | undefined} */
    trailing = undefined,
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();
</script>

<button
  role="menuitem"
  class="menu-item menu-item-{variant} {className}"
  class:menu-item-disabled={disabled}
  disabled={disabled || undefined}
  aria-disabled={disabled || undefined}
  tabindex={disabled ? -1 : -1}
  {...rest}
>
  {#if leading}
    <span class="menu-item-leading" aria-hidden="true">{@render leading()}</span>
  {/if}
  <span class="menu-item-label">
    {#if children}{@render children()}{/if}
  </span>
  {#if trailing}
    <span class="menu-item-trailing">{@render trailing()}</span>
  {/if}
</button>

<style>
  .menu-item {
    all: unset;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--menu-item-gap);
    min-height: var(--menu-item-height);
    padding: var(--menu-item-padding-y) var(--menu-item-padding-x);
    border-radius: var(--menu-item-radius);
    font-size: var(--menu-item-font-size);
    color: var(--menu-item-color);
    cursor: pointer;
    user-select: none;
    text-align: start;
    width: 100%;
  }

  .menu-item:hover:not(.menu-item-disabled),
  .menu-item:focus-visible:not(.menu-item-disabled) {
    background: var(--menu-item-bg-hover);
    outline: none;
  }

  .menu-item-destructive {
    color: var(--menu-item-color-destructive);
  }

  .menu-item-disabled {
    color: var(--menu-item-color-disabled);
    cursor: default;
    pointer-events: none;
  }

  .menu-item-leading {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  .menu-item-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .menu-item-trailing {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    color: var(--menu-item-color-disabled);
    font-size: var(--type-caption-size);
  }
</style>
