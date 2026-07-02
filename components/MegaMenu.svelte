<!--
  @component MegaMenu

  Category mega-menu for many-section portals (#507): a single "Services ▾"
  disclosure in the primary band that opens a full-width panel of category
  columns, so ~20 verticals collapse into one trigger instead of overflowing
  the bar. Modelled on the GOV.UK "Menu" / Designers Italia mega-nav pattern.

  Semantics: a disclosure (`button[aria-expanded][aria-controls]` + panel),
  NOT a `menu` role — the panel holds plain links in labelled groups, which
  screen readers navigate as ordinary lists. Escape closes and restores focus
  to the trigger; clicking outside or navigating closes. The trigger reads as
  current (underline bar) when any contained link is current.

  Desktop-only affordance: below `--breakpoint` it renders nothing — small
  screens keep their native menu (SiteHeader's unified disclosure), which the
  consumer feeds the same category groups.

  Layout note: the panel is absolutely positioned against the NEAREST
  POSITIONED ANCESTOR — inside `SiteHeader` (position: sticky) it spans the
  full header band, which is the intended composition:

  @example
  <SiteHeader>
    {#snippet nav()}
      <ServiceNavigation label="Primary" items={primary} />
      <MegaMenu label="Serviços" categories={buckets} />
    {/snippet}
  </SiteHeader>
-->
<script>
  let {
    /** @type {string} Visible trigger label (localize it). */
    label = "Services",
    /** @type {Array<{ label: string, items: Array<{ href: string, label: string, current?: boolean }> }>} */
    categories = [],
    /** @type {string} id linking the trigger to the panel (unique per page). */
    menuId = "mega-menu",
    /** @type {string} */
    class: className = "",
    /** @type {import('svelte').Snippet | undefined} Trigger icon (chevron). */
    icon = undefined,
    ...rest
  } = $props();

  let open = $state(false);
  /** @type {HTMLElement | undefined} */
  let root = $state(undefined);
  /** @type {HTMLButtonElement | undefined} */
  let trigger = $state(undefined);

  const hasCurrent = $derived(
    categories.some((c) => (c.items ?? []).some((i) => i.current)),
  );

  function onDocumentClick(event) {
    if (open && root && !root.contains(event.target)) open = false;
  }
  function onDocumentKeydown(event) {
    if (event.key === "Escape" && open) {
      open = false;
      trigger?.focus();
    }
  }
</script>

{#if categories.length > 0}
  <div class="mega-menu {className}" bind:this={root} {...rest}>
    <button
      type="button"
      class="mega-menu-trigger"
      class:current={hasCurrent}
      aria-expanded={open}
      aria-controls={menuId}
      bind:this={trigger}
      onclick={() => (open = !open)}
    >
      {label}
      {#if icon}{@render icon()}{:else}
        <svg
          class="mega-menu-chevron"
          class:open
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      {/if}
    </button>

    {#if open}
      <div id={menuId} class="mega-menu-panel">
        {#each categories as category (category.label)}
          <section class="mega-menu-category" aria-label={category.label}>
            <h3 class="mega-menu-heading">{category.label}</h3>
            <ul class="mega-menu-list">
              {#each category.items ?? [] as item (item.href)}
                <li class="mega-menu-item">
                  <a
                    href={item.href}
                    class="mega-menu-link"
                    aria-current={item.current ? "page" : undefined}
                    onclick={() => (open = false)}
                  >
                    {item.label}
                  </a>
                </li>
              {/each}
            </ul>
          </section>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<svelte:document onclick={onDocumentClick} onkeydown={onDocumentKeydown} />

<style>
  .mega-menu {
    display: flex;
    align-items: stretch;
  }

  /* The trigger reads as a peer of ServiceNavigation's links: same type ramp,
     full band height, and the same accent underline bar when a contained link
     is the current page. */
  .mega-menu-trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2xs);
    height: 100%;
    padding-inline: var(--space-md);
    border: none;
    background: none;
    color: var(--color-text-secondary);
    font-family: var(--type-label-font);
    font-size: var(--nav-service-link-size);
    font-weight: var(--raw-font-weight-medium);
    cursor: pointer;
    transition: color var(--duration-fast) var(--easing-default);
  }
  .mega-menu-trigger:hover,
  .mega-menu-trigger[aria-expanded="true"] {
    color: var(--color-text);
  }
  .mega-menu-trigger:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
  .mega-menu-trigger.current {
    color: var(--color-text);
    font-weight: var(--raw-font-weight-semibold);
    box-shadow: inset 0 calc(-1 * var(--nav-service-underline)) 0 0
      var(--color-accent);
  }
  .mega-menu-chevron {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
    transition: transform var(--duration-fast) var(--easing-default);
  }
  .mega-menu-chevron.open {
    transform: rotate(180deg);
  }

  /* Full-width panel anchored under the band (the nearest positioned ancestor
     — SiteHeader's sticky banner). Category columns auto-flow; the panel
     scrolls internally rather than covering the page (#507 overflow fix). */
  .mega-menu-panel {
    position: absolute;
    top: 100%;
    inset-inline: 0;
    z-index: 50;
    display: grid;
    grid-template-columns: repeat(
      auto-fill,
      minmax(var(--nav-mega-column-min-width), 1fr)
    );
    gap: var(--space-lg);
    padding: var(--space-lg) var(--content-padding-x);
    max-height: var(--nav-mega-panel-max-height);
    overflow-y: auto;
    background: var(--color-surface-raised);
    border-top: var(--border-width) solid var(--color-border);
    border-bottom: var(--border-width) solid var(--color-border);
    box-shadow: var(--shadow-md);
  }

  .mega-menu-heading {
    margin: 0 0 var(--space-2xs);
    font-family: var(--type-label-font);
    font-size: var(--type-body-sm-size);
    font-weight: var(--raw-font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-secondary);
  }
  .mega-menu-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .mega-menu-item {
    display: flex;
  }
  .mega-menu-link {
    flex: 1;
    padding: var(--space-2xs) var(--space-2xs);
    border-radius: var(--radius-md);
    color: var(--color-text);
    text-decoration: none;
    font-family: var(--type-label-font);
    font-size: var(--type-body-sm-size);
  }
  .mega-menu-link:hover {
    background: var(--color-surface-tertiary);
  }
  .mega-menu-link:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
  .mega-menu-link[aria-current="page"] {
    background: var(--color-surface-tertiary);
    font-weight: var(--raw-font-weight-semibold);
  }

  /* Desktop-only: small screens use the consumer's native menu (SiteHeader's
     unified disclosure), grouped by the same categories. */
  @media (max-width: 47.99rem) {
    .mega-menu {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mega-menu-chevron {
      transition: none;
    }
  }
</style>
