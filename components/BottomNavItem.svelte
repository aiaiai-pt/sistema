<!--
  @component BottomNavItem

  Individual item in a BottomNav.
  Consumes --nav-bottom-* tokens from components.css.

  @example
  <BottomNavItem active label="Home" onclick={() => goto('/')}>
    {#snippet icon()}<svg>...</svg>{/snippet}
  </BottomNavItem>

  @example With badge dot
  <BottomNavItem label="Activity" badge>
    {#snippet icon()}<svg>...</svg>{/snippet}
  </BottomNavItem>
-->
<script>
  let {
    /** @type {boolean} */
    active = false,
    /** @type {boolean} */
    disabled = false,
    /** @type {string | undefined} */
    href,
    /** @type {string} */
    label,
    /** @type {boolean} */
    badge = false,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    icon,
    ...rest
  } = $props();
</script>

{#if href && !disabled}
  <a
    {href}
    class="bottom-nav-item {className}"
    class:bottom-nav-active={active}
    aria-current={active ? 'page' : undefined}
    {...rest}
  >
    <div class="bottom-nav-icon-wrap">
      {#if icon}{@render icon()}{/if}
      {#if badge}<span class="bottom-nav-badge" aria-hidden="true"></span>{/if}
    </div>
    <span class="bottom-nav-label">{label}</span>
  </a>
{:else}
  <button
    class="bottom-nav-item {className}"
    class:bottom-nav-active={active}
    class:bottom-nav-disabled={disabled}
    {disabled}
    aria-current={active ? 'page' : undefined}
    {...rest}
  >
    <div class="bottom-nav-icon-wrap">
      {#if icon}{@render icon()}{/if}
      {#if badge}<span class="bottom-nav-badge" aria-hidden="true"></span>{/if}
    </div>
    <span class="bottom-nav-label">{label}</span>
  </button>
{/if}

<style>
  .bottom-nav-item {
    all: unset;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2xs);
    cursor: pointer;
    color: var(--nav-bottom-item-color);
    transition: color var(--duration-instant) var(--easing-default);
    padding: var(--space-xs);
    text-decoration: none;
  }

  .bottom-nav-item:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .bottom-nav-active {
    color: var(--nav-bottom-item-color-active);
  }

  .bottom-nav-disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  .bottom-nav-icon-wrap {
    position: relative;
    display: flex;
  }

  .bottom-nav-icon-wrap :global(svg) {
    width: 20px;
    height: 20px;
  }

  .bottom-nav-badge {
    position: absolute;
    top: -2px;
    right: -4px;
    width: var(--status-dot-size);
    height: var(--status-dot-size);
    background: var(--color-accent);
    border-radius: var(--radius-circle);
  }

  .bottom-nav-label {
    font-family: var(--nav-bottom-item-font);
    font-size: var(--nav-bottom-item-size);
  }
</style>
