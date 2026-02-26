<!--
  @component EmptyState

  Shown when there's nothing to display. Different contexts need different copy.
  Consumes --empty-* tokens from components.css.

  @example First use
  <EmptyState
    heading="Create your first project"
    body="Projects organize your work into focused spaces."
    actionLabel="NEW PROJECT"
    onaction={() => create()}
  >
    {#snippet icon()}
      <PhPlusCircle size={48} />
    {/snippet}
  </EmptyState>

  @example Error recovery
  <EmptyState
    heading="Couldn't load your projects"
    body="The server didn't respond. Check your connection."
    actionLabel="TRY AGAIN"
    actionVariant="secondary"
    onaction={() => retry()}
  >
    {#snippet icon()}
      <PhWarningCircle size={48} />
    {/snippet}
  </EmptyState>
-->
<script>
  let {
    /** @type {string} */
    heading,
    /** @type {string | undefined} */
    body,
    /** @type {string | undefined} */
    actionLabel,
    /** @type {'primary' | 'secondary'} */
    actionVariant = 'primary',
    /** @type {(() => void) | undefined} */
    onaction,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    icon,
    ...rest
  } = $props();
</script>

<div class="empty-state {className}" {...rest}>
  {#if icon}
    <div class="empty-icon">{@render icon()}</div>
  {/if}

  <h3 class="empty-heading">{heading}</h3>

  {#if body}
    <p class="empty-body">{body}</p>
  {/if}

  {#if actionLabel && onaction}
    <button
      class="empty-action"
      class:empty-action-secondary={actionVariant === 'secondary'}
      onclick={onaction}
    >
      <span class="empty-action-label">{actionLabel}</span>
    </button>
  {/if}
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--empty-gap);
    text-align: center;
    padding: var(--space-2xl) var(--space-lg);
  }

  .empty-icon {
    width: var(--empty-icon-size);
    height: var(--empty-icon-size);
    color: var(--empty-icon-color);
  }

  .empty-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .empty-heading {
    font-family: var(--empty-heading-font);
    font-size: var(--empty-heading-size);
    color: var(--color-text);
    margin: 0;
  }

  .empty-body {
    font-family: var(--empty-body-font);
    font-size: var(--empty-body-size);
    color: var(--empty-body-color);
    margin: 0;
    max-width: 320px;
  }

  .empty-action {
    font-family: var(--button-font);
    font-size: var(--button-md-font-size);
    letter-spacing: var(--button-tracking);
    height: var(--button-md-height);
    padding: 0 var(--button-md-padding-x);
    border: none;
    border-radius: var(--button-radius);
    background: var(--color-accent);
    color: var(--color-text-on-accent);
    cursor: pointer;
    transition: background var(--button-transition);
  }

  .empty-action:hover {
    background: var(--color-accent-hover);
  }

  .empty-action:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .empty-action-secondary {
    background: transparent;
    color: var(--color-text);
    border: var(--elevation-border);
  }

  .empty-action-secondary:hover {
    background: var(--color-surface-secondary);
  }

  .empty-action-label {
    font-family: inherit;
    font-size: inherit;
    letter-spacing: inherit;
  }
</style>
