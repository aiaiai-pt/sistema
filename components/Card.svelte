<!--
  @component Card

  Surface container. Three variants: flat, bordered (default), elevated.
  Content-agnostic. Consumes --card-* tokens from components.css.

  @example Bordered (default)
  <Card>Content here</Card>

  @example Elevated
  <Card variant="elevated">Floating content</Card>

  @example Interactive + selectable
  <Card interactive selected={isSelected} onclick={() => select(id)}>
    Clickable card
  </Card>
-->
<script>
  /**
   * @typedef {'flat' | 'bordered' | 'elevated'} Variant
   */

  let {
    /** @type {Variant} */
    variant = 'bordered',
    /** @type {boolean} */
    interactive = false,
    /** @type {boolean} */
    selected = false,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();

  // tag variable unused — rendering uses {#if interactive} branching
</script>

{#if interactive}
  <button
    class="card card-{variant} card-interactive {className}"
    class:card-selected={selected}
    {...rest}
  >
    {#if children}{@render children()}{/if}
  </button>
{:else}
  <div
    class="card card-{variant} {className}"
    class:card-selected={selected}
    {...rest}
  >
    {#if children}{@render children()}{/if}
  </div>
{/if}

<style>
  .card {
    border-radius: var(--card-radius);
    padding: var(--card-padding);
    background: var(--card-bg);
    transition: all var(--card-transition);
    text-align: left;
    display: flex;
    flex-direction: column;
  }

  .card-flat {
    border: var(--card-flat-border);
    box-shadow: var(--card-flat-shadow);
    background: var(--color-surface-secondary);
  }

  .card-bordered {
    border: var(--card-bordered-border);
    box-shadow: var(--card-bordered-shadow);
  }

  .card-elevated {
    border: var(--card-elevated-border);
    box-shadow: var(--card-elevated-shadow);
  }

  .card-interactive {
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    width: 100%;
  }

  .card-interactive:hover {
    border: var(--card-interactive-hover-border);
  }

  .card-interactive:active {
    background: var(--card-interactive-active-bg);
  }

  .card-interactive:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .card-selected {
    border-color: var(--card-selected-border-color);
  }
</style>
