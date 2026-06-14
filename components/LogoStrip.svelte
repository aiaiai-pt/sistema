<!--
  @component LogoStrip

  A row of partner / sponsor logos. Presentational — the logos (image URL + alt
  text + optional link) are DATA. The strip wraps on narrow viewports. When a
  logo has an `href` it renders a link; otherwise a plain image. Each logo MUST
  carry meaningful `alt` (the partner's name) or be explicitly decorative.

  @example
  <LogoStrip
    label="Parceiros"
    logos={[
      { src: "/logos/cm-valongo.svg", alt: "Câmara Municipal de Valongo", href: "https://cm-valongo.pt" },
      { src: "/logos/ue.svg", alt: "União Europeia" },
    ]}
  />
-->
<script>
  let {
    /** @type {string} Accessible label for the logo group (localize it). */
    label = "Partners",
    /** @type {string} Optional visible heading (renders above the strip). */
    heading = "",
    /** @type {2 | 3} Heading level for `heading`. */
    headingLevel = 2,
    /**
     * @type {Array<{ src?: string, alt?: string, href?: string }>} The logos.
     */
    logos = [],
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();
</script>

<section class="logo-strip {className}" aria-label={heading ? undefined : label} {...rest}>
  {#if heading}
    <svelte:element this={`h${headingLevel}`} class="logo-strip-heading"
      >{heading}</svelte:element
    >
  {/if}
  <ul class="logo-strip-list">
    {#each logos as logo (logo.src)}
      <li class="logo-strip-item">
        {#if logo.href}
          <a class="logo-strip-link" href={logo.href}>
            <img class="logo-strip-img" src={logo.src} alt={logo.alt ?? ""} loading="lazy" />
          </a>
        {:else}
          <img class="logo-strip-img" src={logo.src} alt={logo.alt ?? ""} loading="lazy" />
        {/if}
      </li>
    {/each}
  </ul>
</section>

<style>
  .logo-strip {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    align-items: center;
  }

  .logo-strip-heading {
    margin: 0;
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    font-weight: var(--type-label-weight);
    letter-spacing: var(--type-label-tracking);
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .logo-strip-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: var(--space-2xl);
  }

  .logo-strip-item {
    display: flex;
    align-items: center;
  }

  .logo-strip-link:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .logo-strip-img {
    display: block;
    max-height: 3rem;
    width: auto;
    /* Quiet the logos to a single visual weight; full opacity on hover/focus. */
    opacity: 0.75;
    transition: opacity var(--duration-fast) var(--easing-default);
  }

  .logo-strip-link:hover .logo-strip-img,
  .logo-strip-link:focus-visible .logo-strip-img {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .logo-strip-img {
      transition: none;
    }
  }
</style>
