<!--
  @component TreeNode

  One node in a Tree. Recursive via `svelte:self` for descendants.
  Not typically used directly — see `Tree.svelte`.
-->
<script>
  import TreeNode from './TreeNode.svelte';

  /**
   * @typedef {Object} TreeItem
   * @property {string | number} id
   * @property {string} label
   * @property {TreeItem[]} [children]
   * @property {boolean} [disabled]
   */

  let {
    /** @type {TreeItem} */
    node,
    /** @type {number} */
    depth = 0,
    /** @type {Set<string | number>} */
    expanded = new Set(),
    /** @type {string | number | null} */
    selectedId = null,
    /** @type {(id: string | number) => void} */
    ontoggle,
    /** @type {(id: string | number) => void} */
    onselect,
  } = $props();

  let hasChildren = $derived(
    Array.isArray(node.children) && node.children.length > 0
  );
  let isOpen = $derived(expanded.has(node.id));
  let isSelected = $derived(selectedId === node.id);

  /** @param {KeyboardEvent} event */
  function handleKey(event) {
    if (node.disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onselect(node.id);
    } else if (event.key === 'ArrowRight' && hasChildren && !isOpen) {
      event.preventDefault();
      ontoggle(node.id);
    } else if (event.key === 'ArrowLeft' && hasChildren && isOpen) {
      event.preventDefault();
      ontoggle(node.id);
    }
  }
</script>

<li class="tree-node" role="none">
  <div
    class="tree-node-row"
    class:tree-node-row--selected={isSelected}
    class:tree-node-row--disabled={node.disabled}
    role="treeitem"
    aria-expanded={hasChildren ? isOpen : undefined}
    aria-selected={isSelected}
    tabindex={isSelected ? 0 : -1}
    style:--tree-depth={depth}
    onkeydown={handleKey}
  >
    {#if hasChildren}
      <button
        type="button"
        class="tree-toggle"
        class:tree-toggle--open={isOpen}
        aria-label={isOpen ? 'Collapse' : 'Expand'}
        aria-hidden="true"
        tabindex="-1"
        onclick={(e) => {
          e.stopPropagation();
          ontoggle(node.id);
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 3L10 7L5 11"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    {:else}
      <span class="tree-toggle-spacer" aria-hidden="true"></span>
    {/if}

    <button
      type="button"
      class="tree-label"
      disabled={node.disabled}
      onclick={() => onselect(node.id)}
    >
      {node.label}
    </button>
  </div>

  {#if hasChildren && isOpen}
    <ul role="group" class="tree-group">
      {#each node.children ?? [] as child (child.id)}
        <TreeNode
          node={child}
          depth={depth + 1}
          {expanded}
          {selectedId}
          {ontoggle}
          {onselect}
        />
      {/each}
    </ul>
  {/if}
</li>

<style>
  .tree-node {
    list-style: none;
  }

  .tree-node-row {
    display: flex;
    align-items: center;
    gap: var(--space-2xs);
    padding-left: calc(var(--tree-depth, 0) * var(--tree-indent));
    border-radius: var(--tree-node-radius);
    transition: background var(--tree-node-transition);
  }

  .tree-node-row:hover:not(.tree-node-row--disabled) {
    background: var(--tree-node-bg-hover);
  }

  .tree-node-row--selected {
    background: var(--tree-node-bg-selected);
  }

  .tree-node-row--disabled {
    opacity: 0.5;
  }

  .tree-toggle,
  .tree-toggle-spacer {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .tree-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--tree-node-caret-color);
    transition: transform var(--duration-fast) var(--easing-default);
  }

  .tree-toggle--open {
    transform: rotate(90deg);
  }

  .tree-label {
    flex: 1;
    min-width: 0;
    text-align: left;
    background: transparent;
    border: none;
    padding: var(--tree-node-padding-y) var(--tree-node-padding-x);
    cursor: pointer;
    font-family: var(--tree-node-font);
    font-size: var(--tree-node-font-size);
    color: var(--tree-node-color);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .tree-label:disabled {
    cursor: not-allowed;
  }

  .tree-group {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--tree-gap);
    margin-top: var(--tree-gap);
  }

  @media (prefers-reduced-motion: reduce) {
    .tree-toggle,
    .tree-node-row {
      transition: none;
    }
  }
</style>
