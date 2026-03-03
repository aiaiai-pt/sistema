<!--
  @component CollapsibleSection

  Animated expand/collapse container for grouped content.
  Built on native <details>/<summary> for no-JS accessibility.
  Consumes --type-label-* and --color-* tokens.

  @example Basic
  <CollapsibleSection title="Advanced Options" bind:open>
    <p>Content here</p>
  </CollapsibleSection>

  @example With badge count and action buttons
  <CollapsibleSection title="Filters" bind:open badge={3}>
    {#snippet actions()}
      <Button variant="ghost" size="sm">Clear</Button>
    {/snippet}
    <p>Filter content</p>
  </CollapsibleSection>
-->
<script>
  import Badge from './Badge.svelte';

  let {
    /** @type {string} */
    title = '',
    /** @type {boolean} */
    open = $bindable(false),
    /** @type {string | number | undefined} */
    badge = undefined,
    /** @type {boolean} */
    defaultOpen = false,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    actions = undefined,
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();

  // Seed open from defaultOpen at creation time (mount-only, no effect needed)
  if (defaultOpen && !open) open = defaultOpen;

  /** @param {Event} e */
  function handleToggle(e) {
    open = /** @type {HTMLDetailsElement} */ (e.currentTarget).open;
  }
</script>

<details
  class="collapsible-section {className}"
  {open}
  ontoggle={handleToggle}
  {...rest}
>
  <summary class="collapsible-summary">
    <div class="collapsible-header">
      <svg
        class="collapsible-caret"
        class:collapsible-caret--open={open}
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        <path d="M5 3L10 7L5 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span class="collapsible-title">{title}</span>
      {#if badge !== undefined}
        <Badge variant="neutral">{badge}</Badge>
      {/if}
    </div>
    {#if actions}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="collapsible-actions" onclick={(e) => e.stopPropagation()}>
        {@render actions()}
      </div>
    {/if}
  </summary>

  {#if open && children}
    <div class="collapsible-content">
      {@render children()}
    </div>
  {/if}
</details>

<style>
  .collapsible-section {
    border-bottom: var(--elevation-border);
  }

  .collapsible-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
    padding: var(--space-sm) 0;
    list-style: none;
  }

  /* Remove default marker */
  .collapsible-summary::-webkit-details-marker {
    display: none;
  }
  .collapsible-summary::marker {
    display: none;
    content: '';
  }

  .collapsible-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .collapsible-caret {
    color: var(--color-text-secondary);
    transition: transform var(--duration-fast) var(--easing-default);
    flex-shrink: 0;
  }

  .collapsible-caret--open {
    transform: rotate(90deg);
  }

  .collapsible-title {
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    font-weight: var(--type-label-weight);
    letter-spacing: var(--type-label-tracking);
    line-height: var(--type-label-leading);
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .collapsible-actions {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .collapsible-content {
    padding-top: var(--space-md);
    padding-bottom: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  @media (prefers-reduced-motion: reduce) {
    .collapsible-caret {
      transition: none;
    }
  }
</style>
