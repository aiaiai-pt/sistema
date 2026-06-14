<!--
  @component FeedView

  A segmented view-switch for one feed (e.g. list ⇄ map). Presentational only:
  it renders the available views as a WAI-ARIA tablist and emits the chosen
  view via `onchange` — it does NOT render the views' content (the consumer
  swaps that in response to the change, typically by re-resolving the feed).

  Keyboard (automatic activation, per the tablist pattern for cheap-to-reveal
  views): Arrow keys move focus AND select; Home/End jump to the ends; focus
  roves (active tab is the only tab stop).

  Consumes --feedview-* tokens from components.css.

  @example
  <FeedView
    views={[
      { value: 'list', label: 'List' },
      { value: 'map', label: 'Map' },
    ]}
    bind:value={activeView}
    onchange={(v) => goto(`?view=${v}`)}
  />

  @example With icons (icon is a Svelte component, e.g. phosphor-svelte)
  <FeedView views={[
    { value: 'list', label: 'List', icon: ListIcon },
    { value: 'map', label: 'Map', icon: MapIcon },
  ]} bind:value={activeView} onchange={onChange} />
-->
<script module>
  let _feedviewUid = 0;
  /**
   * @typedef {{ value: string, label: string, icon?: import('svelte').Component }} FeedViewOption
   */
</script>

<script>
  let {
    /** @type {FeedViewOption[]} The available views (first = default). */
    views = [],
    /** @type {string} The active view's value (bindable). */
    value = $bindable(''),
    /** @type {((value: string) => void) | undefined} Fires when the view changes. */
    onchange = undefined,
    /** @type {string} Accessible name for the tablist. */
    label = 'View',
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const uid = `feedview-${_feedviewUid++}`;
  /** @type {HTMLButtonElement[]} */
  let tabs = $state([]);

  const activeIndex = $derived(Math.max(0, views.findIndex((v) => v.value === value)));

  /** @param {string} v */
  function select(v) {
    if (v === value) return;
    value = v;
    onchange?.(v);
  }

  /**
   * @param {number} index
   * @param {boolean} focus
   */
  function activate(index, focus) {
    const view = views[index];
    if (!view) return;
    if (focus) tabs[index]?.focus();
    select(view.value);
  }

  /** @param {KeyboardEvent} event */
  function onKeydown(event) {
    const last = views.length - 1;
    let next = -1;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = activeIndex >= last ? 0 : activeIndex + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = activeIndex <= 0 ? last : activeIndex - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    activate(next, true);
  }
</script>

<div
  class="feedview {className}"
  role="tablist"
  aria-label={label}
  onkeydown={onKeydown}
  {...rest}
>
  {#each views as view, i (view.value)}
    {@const Icon = view.icon}
    {@const isActive = view.value === value}
    <button
      type="button"
      role="tab"
      id={`${uid}-${view.value}`}
      aria-selected={isActive}
      tabindex={isActive ? 0 : -1}
      class="feedview-tab"
      class:feedview-tab-active={isActive}
      bind:this={tabs[i]}
      onclick={() => activate(i, false)}
    >
      {#if Icon}<span class="feedview-icon" aria-hidden="true"><Icon /></span>{/if}
      <span class="feedview-label">{view.label}</span>
    </button>
  {/each}
</div>

<style>
  .feedview {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2xs);
    background: var(--feedview-bg);
    border-radius: var(--feedview-radius);
    padding: var(--feedview-padding);
  }

  .feedview-tab {
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    height: var(--feedview-tab-height);
    padding: 0 var(--feedview-tab-padding-x);
    border-radius: var(--feedview-tab-radius);
    font-family: var(--feedview-tab-font);
    font-size: var(--feedview-tab-size);
    letter-spacing: var(--feedview-tab-tracking);
    color: var(--feedview-tab-color);
    cursor: pointer;
    white-space: nowrap;
    transition: all var(--feedview-tab-transition);
  }

  .feedview-tab:hover {
    color: var(--color-text);
  }

  .feedview-tab:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .feedview-tab-active {
    color: var(--feedview-tab-color-active);
    background: var(--feedview-tab-bg-active);
    box-shadow: var(--feedview-tab-shadow-active);
  }

  .feedview-icon {
    display: inline-flex;
    align-items: center;
  }

  .feedview-icon :global(svg) {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
  }

  @media (prefers-reduced-motion: reduce) {
    .feedview-tab {
      transition: none;
    }
  }
</style>
