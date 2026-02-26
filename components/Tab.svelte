<!--
  @component Tab

  Individual tab trigger inside a TabList.
  Reads active state from Tabs context.
  Consumes --tabs-trigger-* tokens from components.css.

  @example
  <Tab value="overview">OVERVIEW</Tab>

  @example Disabled
  <Tab value="admin" disabled>ADMIN</Tab>
-->
<script>
  import { getContext } from 'svelte';

  let {
    /** @type {string} */
    value,
    /** @type {boolean} */
    disabled = false,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children,
    ...rest
  } = $props();

  /** @type {{ value: string, setValue: (v: string) => void } | undefined} */
  const tabs = getContext('aiaiai-tabs');
  const isActive = $derived(tabs?.value === value);

  function handleClick() {
    if (disabled) return;
    if (!tabs) {
      console.warn('[aiaiai] <Tab> used outside <Tabs> — wrap in a <Tabs> parent.');
      return;
    }
    tabs.setValue(value);
  }
</script>

<button
  type="button"
  role="tab"
  aria-selected={isActive}
  {disabled}
  class="tab {className}"
  class:tab-active={isActive}
  onclick={handleClick}
  {...rest}
>
  {#if children}{@render children()}{/if}
</button>

<style>
  .tab {
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--tabs-trigger-height);
    padding: 0 var(--tabs-trigger-padding-x);
    border-radius: var(--tabs-trigger-radius);
    font-family: var(--tabs-trigger-font);
    font-size: var(--tabs-trigger-size);
    letter-spacing: var(--tabs-trigger-tracking);
    color: var(--tabs-trigger-color);
    cursor: pointer;
    transition: all var(--tabs-trigger-transition);
    white-space: nowrap;
  }

  .tab:hover:not(:disabled) {
    color: var(--color-text);
  }

  .tab:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .tab:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tab-active {
    color: var(--tabs-trigger-color-active);
    background: var(--tabs-trigger-bg-active);
    box-shadow: var(--tabs-trigger-shadow-active);
  }
</style>
