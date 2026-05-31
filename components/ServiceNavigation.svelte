<!--
  @component ServiceNavigation

  Primary site navigation for the public portal, modelled on the GOV.UK
  "Service navigation" and Designers Italia header-nav patterns (the citizen /
  PA gold standard). Data-driven: it owns its `<a>` markup (rendered from
  `items`), so it styles its own links — no magic descendant styling of
  consumer anchors.

  Accessibility:
   - `<nav aria-label>` landmark; the current item carries `aria-current="page"`.
   - Below `--breakpoint` the list collapses behind a toggle button with
     `aria-expanded` + `aria-controls` (WCAG-friendly disclosure).
   - Empty `items` renders NOTHING — never an empty nav landmark.
   - Toggle + links have visible focus rings.

  @example
  <ServiceNavigation
    label="Primary"
    items={[
      { href: "/report", label: "Report a problem" },
      { href: "/track", label: "Track a report", current: true },
      { href: "/info/privacy", label: "Privacy" },
    ]}
  >
    {#snippet menuIcon()}<MenuIcon />{/snippet}
  </ServiceNavigation>
-->
<script>
  let {
    /** @type {Array<{ href: string, label: string, current?: boolean }>} */
    items = [],
    /** @type {string} aria-label for the nav landmark (localize it). */
    label = "Primary",
    /** @type {string} id linking the toggle button to the menu (unique per page). */
    menuId = "service-navigation-menu",
    /** @type {string} Visible label for the mobile toggle (localize it). */
    toggleLabel = "Menu",
    /** @type {string} */
    class: className = "",
    /** @type {import('svelte').Snippet | undefined} Icon for the mobile toggle. */
    menuIcon = undefined,
    ...rest
  } = $props();

  let open = $state(false);
</script>

{#if items.length > 0}
  <nav class="service-nav {className}" aria-label={label} {...rest}>
    <button
      type="button"
      class="service-nav-toggle"
      aria-expanded={open}
      aria-controls={menuId}
      onclick={() => (open = !open)}
    >
      {#if menuIcon}{@render menuIcon()}{/if}
      <span class="service-nav-toggle-label">{toggleLabel}</span>
    </button>

    <ul id={menuId} class="service-nav-list" class:open>
      {#each items as item (item.href)}
        <li class="service-nav-item">
          <a
            href={item.href}
            class="service-nav-link"
            aria-current={item.current ? "page" : undefined}
          >
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  .service-nav {
    display: flex;
    align-items: center;
  }

  /* Toggle hidden on wide viewports; the list is a horizontal row. */
  .service-nav-toggle {
    display: none;
    align-items: center;
    gap: var(--space-2xs);
    padding: var(--space-2xs) var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    cursor: pointer;
  }
  .service-nav-toggle:focus-visible,
  .service-nav-link:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .service-nav-list {
    display: flex;
    align-items: center;
    gap: var(--space-2xs);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .service-nav-link {
    display: block;
    padding: var(--space-2xs) var(--space-sm);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    text-decoration: none;
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
  }
  .service-nav-link:hover {
    color: var(--color-text);
    background: var(--color-surface-tertiary);
  }
  /* Current page: emphasized text + an accent underline bar (GOV.UK pattern). */
  .service-nav-link[aria-current="page"] {
    color: var(--color-text);
    font-weight: var(--raw-font-weight-semibold);
    box-shadow: inset 0 -3px 0 0 var(--color-accent);
  }

  /* Mobile: button shows, list collapses behind it. */
  @media (max-width: 47.99rem) {
    .service-nav {
      position: relative;
    }
    .service-nav-toggle {
      display: inline-flex;
    }
    .service-nav-list {
      display: none;
      position: absolute;
      top: calc(100% + var(--space-2xs));
      inset-inline-end: 0;
      flex-direction: column;
      align-items: stretch;
      min-width: 12rem;
      padding: var(--space-2xs);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      z-index: 50;
    }
    .service-nav-list.open {
      display: flex;
    }
  }
</style>
