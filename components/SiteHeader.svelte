<!--
  @component SiteHeader

  Public site banner landmark (`<header role="banner">`). Locked accessibility
  chrome for the citizen portal: a brand area, a primary navigation slot, an
  actions slot (locale switch, sign-in), and — for two-level information
  architectures — an optional contextual `subnav` band and a single unified
  mobile disclosure. Structure and landmarks are fixed (conformance-checkable);
  only brand tokens vary per tenant via `data-theme`.

  Two tiers, one banner:
   - `nav`    — the PRIMARY row (sections), a `ServiceNavigation`.
   - `subnav` — an OPTIONAL second band directly beneath the primary row,
                a `SectionNavigation` showing the active section's pages. It
                lives inside this same sticky banner so it scrolls/sticks as one
                unit and never reflows the primary row sideways.

  Unified mobile menu (fixes the "two hamburgers" problem): when a `menu` snippet
  is provided, this header renders ONE toggle below `--breakpoint` and hides the
  inline `nav` + `subnav`; both tiers collapse into a single hierarchical panel
  (the `menu` snippet) instead of each nav growing its own toggle. Consumers
  without a `menu` snippet keep the previous behaviour unchanged (backward
  compatible) — the inline `nav`'s own responsive collapse still applies.

  Icon-agnostic, per DS convention — pass the toggle/close icons as snippets;
  minimal glyphs are used as defaults.

  @example
  <SiteHeader>
    {#snippet brand()}<a href="/"><Logo /> Valongo</a>{/snippet}
    {#snippet nav()}<ServiceNavigation items={sections} />{/snippet}
    {#snippet subnav()}<SectionNavigation label={sectionName} items={pages} />{/snippet}
    {#snippet actions()}<LocaleSwitch /> <Button>Sign in</Button>{/snippet}
    {#snippet menu()}…hierarchical sections → pages tree…{/snippet}
  </SiteHeader>
-->
<script>
  let {
    /** @type {string} aria-label for the primary nav (localize it). */
    navLabel = "Primary",
    /** @type {string} */
    class: className = "",
    /** @type {import('svelte').Snippet | undefined} Brand / logo area. */
    brand = undefined,
    /** @type {import('svelte').Snippet | undefined} Primary navigation links. */
    nav = undefined,
    /** @type {import('svelte').Snippet | undefined} Contextual second band (compose `SectionNavigation`). */
    subnav = undefined,
    /** @type {import('svelte').Snippet | undefined} Trailing actions (locale, auth). */
    actions = undefined,
    /** @type {import('svelte').Snippet | undefined} Hierarchical menu content for the unified mobile disclosure. */
    menu = undefined,
    /** @type {string} Visible/aria label for the mobile toggle (localize it). */
    menuLabel = "Menu",
    /** @type {string} aria-label for the mobile menu panel (localize it). */
    menuPanelLabel = "Menu",
    /** @type {string} aria-label for the close button (localize it). */
    closeLabel = "Close",
    /** @type {string} id linking the toggle to the panel (unique per page). */
    menuId = "site-header-menu",
    /** @type {import('svelte').Snippet | undefined} Icon for the mobile toggle. */
    menuIcon = undefined,
    /** @type {import('svelte').Snippet | undefined} Icon for the panel close button. */
    closeIcon = undefined,
    ...rest
  } = $props();

  let open = $state(false);
  const hasMenu = $derived(!!menu);

  // Lock body scroll while the mobile panel is open (no-op during SSR).
  $effect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  });
</script>

<header
  class="site-header {className}"
  class:has-mobile-menu={hasMenu}
  {...rest}
>
  <div class="site-header-inner">
    {#if brand}
      <div class="site-header-brand">{@render brand()}</div>
    {/if}
    {#if nav}
      <nav class="site-header-nav" aria-label={navLabel}>{@render nav()}</nav>
    {/if}
    {#if actions}
      <div class="site-header-actions">{@render actions()}</div>
    {/if}
    {#if hasMenu}
      <button
        type="button"
        class="site-header-toggle"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        onclick={() => (open = true)}
      >
        {#if menuIcon}{@render menuIcon()}{:else}
          <svg
            class="site-header-toggle-glyph"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M2 4h12M2 8h12M2 12h12"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        {/if}
        <span class="site-header-toggle-label">{menuLabel}</span>
      </button>
    {/if}
  </div>

  <!-- Contextual second band: inside the banner, beneath the primary row. -->
  {#if subnav}{@render subnav()}{/if}
</header>

{#if hasMenu}
  <!-- Single unified mobile disclosure: one panel hosting both nav tiers as a
       hierarchy. Rendered outside the banner so it overlays the page (the
       header stays sticky underneath). -->
  <div
    class="site-header-scrim"
    class:open
    onclick={() => (open = false)}
    aria-hidden="true"
  ></div>
  <div
    id={menuId}
    class="site-header-panel"
    class:open
    role="dialog"
    aria-modal="true"
    aria-label={menuPanelLabel}
  >
    <div class="site-header-panel-head">
      <span class="site-header-panel-title">{menuPanelLabel}</span>
      <button
        type="button"
        class="site-header-close"
        aria-label={closeLabel}
        onclick={() => (open = false)}
      >
        {#if closeIcon}{@render closeIcon()}{:else}
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        {/if}
      </button>
    </div>
    <div class="site-header-panel-body">{@render menu()}</div>
  </div>
{/if}

<svelte:window
  onkeydown={(e) => {
    if (e.key === "Escape") open = false;
  }}
/>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 40;
    background: var(--color-surface);
    border-bottom: var(--border-width) solid var(--color-border);
  }

  /* Fixed gridded height + stretch so the primary nav links fill the band and
     their active underline bar sits flush on the header's bottom border. */
  .site-header-inner {
    display: flex;
    align-items: stretch;
    gap: var(--space-lg);
    width: 100%;
    max-width: var(--content-width-wide);
    margin-inline: auto;
    height: var(--nav-service-height);
    padding-inline: var(--content-padding-x);
  }

  .site-header-brand {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-family: var(--type-heading-sm-font);
    font-size: var(--type-heading-sm-size);
    color: var(--color-text);
  }

  /* The nav slot hosts a `ServiceNavigation` (data-driven, self-styled).
     Stretch so its full-height links can fill the band; the header doesn't
     style anchors itself — no descendant-anchor magic. */
  .site-header-nav {
    display: flex;
    align-items: stretch;
  }

  /* Push trailing actions to the far end regardless of nav presence. */
  .site-header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-inline-start: auto;
  }

  /* ─── Mobile toggle (only when a `menu` snippet is provided) ─── */
  .site-header-toggle {
    display: none;
    align-self: center;
    align-items: center;
    gap: var(--space-2xs);
    padding: var(--space-2xs) var(--space-sm);
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    font-weight: var(--type-label-weight);
    cursor: pointer;
  }
  .site-header-toggle:focus-visible,
  .site-header-close:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
  .site-header-toggle-glyph {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
  }

  /* ─── Mobile panel + scrim ─── */
  .site-header-scrim {
    position: fixed;
    inset: 0;
    z-index: 60;
    background: var(--color-overlay);
    opacity: 0;
    visibility: hidden;
    transition:
      opacity var(--duration-fast) var(--easing-default),
      visibility var(--duration-fast) var(--easing-default);
  }
  .site-header-scrim.open {
    opacity: 1;
    visibility: visible;
  }
  .site-header-panel {
    position: fixed;
    inset-block: 0;
    inset-inline-end: 0;
    z-index: 61;
    width: var(--nav-menu-panel-width);
    max-width: 100vw;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    background: var(--color-surface-raised);
    border-inline-start: var(--border-width) solid var(--color-border);
    box-shadow: var(--elevation-overlay);
    transform: translateX(100%);
    transition: transform var(--duration-normal) var(--easing-enter);
  }
  .site-header-panel.open {
    transform: none;
  }
  .site-header-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md);
    border-bottom: var(--border-width) solid var(--color-border);
  }
  .site-header-panel-title {
    font-family: var(--type-heading-sm-font);
    font-size: var(--type-heading-sm-size);
    font-weight: var(--type-heading-sm-weight);
    color: var(--color-text);
  }
  .site-header-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-xs);
    border: var(--border-width) solid transparent;
    border-radius: var(--radius-md);
    background: none;
    color: var(--color-text-secondary);
    cursor: pointer;
  }
  .site-header-close svg {
    width: var(--icon-size-md);
    height: var(--icon-size-md);
  }
  .site-header-close:hover {
    color: var(--color-text);
  }
  .site-header-panel-body {
    flex: 1 0 auto;
  }

  /* Below the breakpoint, when a unified menu exists: hide both inline nav tiers
     and reveal the single toggle. The actions cluster (locale/auth) stays in the
     bar. Consumers WITHOUT a `menu` keep the inline nav + its own collapse.
     (SectionNavigation already self-hides below the breakpoint.) */
  @media (max-width: 47.99rem) {
    .has-mobile-menu .site-header-nav {
      display: none;
    }
    .has-mobile-menu .site-header-toggle {
      display: inline-flex;
    }
  }

  /* Reduced-motion: drop the slide/fade, keep the state change instant. */
  @media (prefers-reduced-motion: reduce) {
    .site-header-scrim,
    .site-header-panel {
      transition: none;
    }
  }
</style>
