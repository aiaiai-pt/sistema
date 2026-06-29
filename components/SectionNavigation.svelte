<!--
  @component SectionNavigation

  Contextual SECONDARY navigation for the public portal — the band that sits
  directly under the `SiteHeader` primary row and surfaces the pages of the
  section the visitor is currently inside (e.g. inside "Ocorrências": Reportar /
  Consultar / Acompanhar). It is the second tier of a two-level information
  architecture; the first tier (the sections themselves) lives in the header's
  `ServiceNavigation`.

  Why a separate band instead of a second inline nav: stacking two navs in one
  header row makes the row reflow sideways every time the visitor crosses into
  or out of a section. This component owns its OWN full-width band and animates
  its disclosure (grid-rows 0fr→1fr) BELOW the fixed header, so the primary tier
  never moves and there is no layout shift on the content above it. Render it in
  `SiteHeader`'s `subnav` snippet.

  Information architecture (GOV.UK / National Archives secondary-navigation
  pattern): the band lists ONLY the section's pages — it does NOT repeat the
  section name as a visible label. The section identity is carried by the active
  PRIMARY item directly above it, and exposed to assistive tech via the nav
  landmark's `aria-label` (the section name). The pages read one step quieter
  than the primary tier (smaller text), and the current page gets a single
  accent bar flush to the band's bottom border — the same device the primary
  tier uses, one level down, so the two tiers read as one calm system.

  Accessibility:
   - `<nav aria-label={label}>` landmark — pass the localized SECTION name; it
     is announced to screen readers but never rendered as a visible chip.
   - The current page carries `aria-current="page"`.
   - Empty `items` → the band collapses to zero height and is `aria-hidden`,
     so it is never an empty landmark and never a dead row.
   - Hidden below `--breakpoint`: on mobile the section's pages live in the
     header's single unified disclosure (`SiteHeader` `menu` snippet), so there
     is no second mobile toggle.

  @example
  <SectionNavigation
    label="Ocorrências"
    items={[
      { href: "/ocorrencias/submit", label: "Reportar ocorrência", current: true },
      { href: "/ocorrencias/track",  label: "Acompanhar" },
    ]}
  />
-->
<script>
  let {
    /** @type {Array<{ href: string, label: string, current?: boolean }>} */
    items = [],
    /** @type {string} The section's (localized) name — the nav landmark's
     *  aria-label (announced, never rendered as a visible label). */
    label = "",
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();

  const open = $derived(items.length > 0);
</script>

<div class="section-nav-band {className}" class:open aria-hidden={!open} {...rest}>
  <div class="section-nav-clip">
    <nav class="section-nav-inner" aria-label={label || "Section"}>
      <ul class="section-nav-list">
        {#each items as item (item.href)}
          <li class="section-nav-item">
            <a
              href={item.href}
              class="section-nav-link"
              aria-current={item.current ? "page" : undefined}
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  </div>
</div>

<style>
  /* Full-width band on the page surface, set apart by a hairline only (no
     competing fill). Animates its disclosure via grid-template-rows so opening /
     closing is a vertical reveal, never a sideways shove of the header tier. */
  .section-nav-band {
    display: grid;
    grid-template-rows: 0fr;
    background: var(--color-surface);
    border-bottom: var(--border-width) solid transparent;
    transition:
      grid-template-rows var(--duration-normal) var(--easing-enter),
      border-color var(--duration-normal) var(--easing-default);
  }
  .section-nav-band.open {
    grid-template-rows: 1fr;
    border-bottom-color: var(--color-border);
  }
  .section-nav-clip {
    overflow: hidden;
    min-height: 0;
  }
  /* The inner band is the nav landmark itself — fixed gridded height so the
     links can fill it and the active bar sits flush on the bottom border. */
  .section-nav-inner {
    display: flex;
    align-items: stretch;
    height: var(--nav-section-height);
    width: 100%;
    max-width: var(--content-width-wide);
    margin-inline: auto;
    padding-inline: var(--content-padding-x);
    /* Content fades in just behind the height reveal. */
    opacity: 0;
    transform: translateY(calc(-1 * var(--space-xs)));
    transition:
      opacity var(--duration-normal) var(--easing-default),
      transform var(--duration-normal) var(--easing-default);
  }
  .section-nav-band.open .section-nav-inner {
    opacity: 1;
    transform: none;
  }

  .section-nav-list {
    display: flex;
    align-items: stretch;
    height: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    /* Long sections scroll horizontally inside the band rather than wrapping
       into a second row (which would reintroduce the height jump). */
    overflow-x: auto;
    scrollbar-width: none;
  }
  .section-nav-list::-webkit-scrollbar {
    display: none;
  }
  .section-nav-item {
    display: flex;
  }

  /* One step quieter than the primary tier: smaller text, full height so the
     active bar is flush on the band's bottom border. Horizontal padding only;
     the first item aligns to the content edge (under the primary tier). */
  .section-nav-link {
    display: inline-flex;
    align-items: center;
    height: 100%;
    white-space: nowrap;
    padding-inline: var(--space-md);
    color: var(--color-text-secondary);
    text-decoration: none;
    font-family: var(--type-label-font);
    font-size: var(--nav-section-link-size);
    font-weight: var(--raw-font-weight-medium);
    transition: color var(--duration-fast) var(--easing-default);
  }
  .section-nav-item:first-child .section-nav-link {
    padding-inline-start: 0;
  }
  .section-nav-link:hover {
    color: var(--color-text);
  }
  .section-nav-link:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
  /* Current page: emphasized text + accent underline bar (shared
     --nav-service-underline token), flush on the band's bottom border. */
  .section-nav-link[aria-current="page"] {
    color: var(--color-text);
    font-weight: var(--raw-font-weight-semibold);
    box-shadow: inset 0 calc(-1 * var(--nav-service-underline)) 0 0
      var(--color-accent);
  }

  /* Mobile: the band is suppressed — the section's pages are reachable through
     SiteHeader's single unified disclosure, so there is no second toggle. */
  @media (max-width: 47.99rem) {
    .section-nav-band {
      display: none;
    }
  }
</style>
