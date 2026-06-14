<!--
  @component Hero

  Landing / page hero. Renders the page's primary heading (an `<h1>` by
  default — keep exactly one per page for the single-H1 a11y contract), an
  optional subtitle, and an actions slot. Use at the top of `landing` and
  `service-flow` page templates.

  @example
  <Hero title="Report a problem in Valongo" subtitle="Potholes, lighting, waste — in two minutes.">
    {#snippet actions()}<Button href="/report">Start a report</Button>{/snippet}
  </Hero>

  @example Custom heading level (when the hero is not the page's H1)
  <Hero title="Latest consultations" headingLevel={2} />

  @example Background image (a theme-tinted scrim keeps text contrast)
  <Hero title="Report a problem" image="/images/city.jpg" />

  @example Centered marketing hero with a call-to-action
  <Hero title="Participe" subtitle="As suas ideias." align="center" image="/op.jpg">
    {#snippet actions()}<Button href="/propor">Submeter</Button>{/snippet}
  </Hero>
-->
<script>
  let {
    /** @type {string} */
    title = "",
    /** @type {string} */
    subtitle = "",
    /** @type {1 | 2 | 3} Heading level for `title` — keep one h1 per page. */
    headingLevel = 1,
    /** @type {string | undefined} Background image URL — rendered cover/center
     *  under a `--hero-scrim` overlay so the text tokens keep contrast. */
    image = undefined,
    /** @type {'start' | 'center'} Content alignment — `center` is the marketing
     *  variant (centered title/subtitle/actions); `start` (default) is the
     *  left-aligned process hero. */
    align = "start",
    /** @type {string} */
    class: className = "",
    /** @type {import('svelte').Snippet | undefined} Title override (rich content). */
    children = undefined,
    /** @type {import('svelte').Snippet | undefined} Call-to-action buttons. */
    actions = undefined,
    ...rest
  } = $props();

  // CSS-string escape for the url() value — the image URL is operator data.
  const bgStyle = $derived(
    image
      ? `background-image: url('${image.replace(/\\/g, "%5C").replace(/'/g, "%27")}')`
      : undefined,
  );
</script>

<section
  class="hero hero-align-{align} {className}"
  class:hero-has-image={!!image}
  style={bgStyle}
  {...rest}
>
  <div class="hero-inner">
    {#if children}
      {@render children()}
    {:else if title}
      <svelte:element this={`h${headingLevel}`} class="hero-title">{title}</svelte:element>
    {/if}
    {#if subtitle}
      <p class="hero-subtitle">{subtitle}</p>
    {/if}
    {#if actions}
      <div class="hero-actions">{@render actions()}</div>
    {/if}
  </div>
</section>

<style>
  .hero {
    background: var(--color-surface);
  }

  .hero-has-image {
    position: relative;
    background-size: cover;
    background-position: center;
  }

  /* Theme-tinted scrim between the image and the text (contrast guard). */
  .hero-has-image::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--hero-scrim);
  }

  .hero-has-image .hero-inner {
    position: relative;
  }

  .hero-inner {
    width: 100%;
    max-width: var(--content-width-wide);
    margin-inline: auto;
    padding: var(--space-3xl) var(--content-padding-x);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .hero-title {
    margin: 0;
    font-family: var(--type-display-font);
    font-size: var(--type-display-size);
    color: var(--color-text);
  }

  .hero-subtitle {
    margin: 0;
    max-width: var(--content-width-narrow);
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    color: var(--color-text-secondary);
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    margin-top: var(--space-sm);
  }

  /* Centered marketing variant — title/subtitle/actions all centre-aligned. */
  .hero-align-center .hero-inner {
    align-items: center;
    text-align: center;
  }

  .hero-align-center .hero-subtitle {
    margin-inline: auto;
  }
</style>
