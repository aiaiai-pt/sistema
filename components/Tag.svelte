<!--
  @component Tag

  Categorization label. Bordered, optionally removable.
  Consumes --tag-* tokens from components.css.

  @example
  <Tag>SVELTE</Tag>

  @example Removable
  <Tag removable onremove={() => console.log('removed')}>CSS</Tag>
-->
<script>
  let {
    /** @type {boolean} */
    removable = false,
    /** @type {(() => void) | undefined} */
    onremove,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children,
    ...rest
  } = $props();
</script>

<span
  class="tag {className}"
  class:tag-removable={removable}
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
  {#if removable}
    <button
      class="tag-remove"
      aria-label="Remove tag"
      onclick={(e) => {
        e.stopPropagation();
        onremove?.();
      }}
    >
      <svg viewBox="0 0 10 10" fill="none" class="tag-remove-icon" aria-hidden="true">
        <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  {/if}
</span>

<style>
  .tag {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    font-family: var(--tag-font);
    font-size: var(--tag-size);
    border-radius: var(--tag-radius);
    padding: var(--tag-padding-y) var(--tag-padding-x);
    border: var(--tag-border);
    background: var(--tag-bg);
    color: var(--tag-text);
    white-space: nowrap;
  }

  .tag-removable {
    padding-right: var(--space-xs);
  }

  .tag-remove {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
    transition: color var(--duration-instant) var(--easing-default);
  }

  .tag-remove:hover {
    color: var(--color-text);
  }

  .tag-remove:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .tag-remove-icon {
    width: 10px;
    height: 10px;
  }
</style>
