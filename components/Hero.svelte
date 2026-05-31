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
-->
<script>
  let {
    /** @type {string} */
    title = "",
    /** @type {string} */
    subtitle = "",
    /** @type {1 | 2 | 3} Heading level for `title` — keep one h1 per page. */
    headingLevel = 1,
    /** @type {string} */
    class: className = "",
    /** @type {import('svelte').Snippet | undefined} Title override (rich content). */
    children = undefined,
    /** @type {import('svelte').Snippet | undefined} Call-to-action buttons. */
    actions = undefined,
    ...rest
  } = $props();
</script>

<section class="hero {className}" {...rest}>
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
</style>
