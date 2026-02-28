<!--
  @component ListItem

  A single row with leading content area (flex: 1, column layout) and trailing action area (flex-shrink: 0).
  Consumes --list-item-* tokens from components.css.

  @example Simple content
  <ListItem>Item text here</ListItem>

  @example With leading and trailing snippets
  <ListItem>
    {#snippet leading()}
      <span class="name">Pipeline v2</span>
      <span class="desc">Last run: 2 hours ago</span>
    {/snippet}
    {#snippet trailing()}
      <Toggle checked />
    {/snippet}
  </ListItem>

  @example Interactive (renders as button)
  <ListItem interactive onclick={() => select(id)}>
    {#snippet leading()}
      <span>Clickable row</span>
    {/snippet}
  </ListItem>
-->
<script>
  let {
    /** @type {boolean} */
    interactive = false,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    leading,
    /** @type {import('svelte').Snippet | undefined} */
    trailing,
    /** @type {import('svelte').Snippet | undefined} */
    children,
    ...rest
  } = $props();
</script>

{#snippet body()}
  <div class="list-item-leading">
    {#if leading}
      {@render leading()}
    {:else if children}
      {@render children()}
    {/if}
  </div>
  {#if trailing}
    <div class="list-item-trailing">
      {@render trailing()}
    </div>
  {/if}
{/snippet}

{#if interactive}
  <button
    class="list-item list-item-interactive {className}"
    role="listitem"
    {...rest}
  >
    {@render body()}
  </button>
{:else}
  <div
    class="list-item {className}"
    role="listitem"
    {...rest}
  >
    {@render body()}
  </div>
{/if}

<style>
  .list-item {
    display: flex;
    align-items: center;
    gap: var(--list-item-gap);
    padding: var(--list-item-padding-y) var(--list-item-padding-x);
    background: var(--list-item-bg);
    transition: background var(--list-item-transition);
  }

  .list-item-interactive {
    all: unset;
    display: flex;
    align-items: center;
    gap: var(--list-item-gap);
    padding: var(--list-item-padding-y) var(--list-item-padding-x);
    background: var(--list-item-bg);
    transition: background var(--list-item-transition);
    width: 100%;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    text-align: left;
  }

  .list-item-interactive:hover {
    background: var(--list-item-bg-hover);
  }

  .list-item-interactive:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: calc(-1 * var(--focus-ring-offset));
  }

  .list-item-leading {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--list-item-leading-gap);
  }

  .list-item-trailing {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: var(--list-item-trailing-gap);
  }
</style>
