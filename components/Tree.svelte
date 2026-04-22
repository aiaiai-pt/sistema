<!--
  @component Tree

  Recursive hierarchy view with expand/collapse and selection.
  Renders TreeNodes from a nested data array. v1: no drag-and-drop,
  no cascading selection, no virtualization.

  Data shape (recursive):
    { id: string | number, label: string, children?: TreeNode[], disabled?: boolean }

  Keyboard navigation:
    ArrowDown / ArrowUp — move focus between visible rows
    ArrowRight         — expand current node (or move to first child if already open)
    ArrowLeft          — collapse current node (or move to parent if already closed)
    Enter / Space      — select current node
    Home / End         — jump to first/last visible row

  @example Basic
    <Tree {items} onselect={(id) => (selectedId = id)} />

  @example Controlled expansion
    <Tree {items} bind:expanded onselect={(id) => (selectedId = id)} />

  Consumes --tree-* tokens from components.css.
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
    /** @type {TreeItem[]} */
    items = [],
    /** @type {string | number | null} */
    selectedId = $bindable(null),
    /** @type {Set<string | number>} */
    expanded = $bindable(new Set()),
    /** @type {(id: string | number) => void | undefined} */
    onselect = undefined,
    /** @type {(id: string | number, open: boolean) => void | undefined} */
    ontoggle = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  /** @param {string | number} id */
  function toggle(id) {
    const next = new Set(expanded);
    const open = !next.has(id);
    if (open) next.add(id);
    else next.delete(id);
    expanded = next;
    ontoggle?.(id, open);
  }

  /** @param {string | number} id */
  function select(id) {
    selectedId = id;
    onselect?.(id);
  }
</script>

<ul class="tree {className}" role="tree" {...rest}>
  {#each items as node (node.id)}
    <TreeNode
      {node}
      depth={0}
      {expanded}
      {selectedId}
      ontoggle={toggle}
      onselect={select}
    />
  {/each}
</ul>

<style>
  .tree {
    display: flex;
    flex-direction: column;
    gap: var(--tree-gap);
    list-style: none;
    margin: 0;
    padding: 0;
  }
</style>
