<!--
  @component CallToAction

  A conversion band: a heading, optional body, and one or two action buttons.
  The reusable "ready to act?" strip at the foot of landing / campaign / content
  pages. Presentational — heading, body and buttons (label + href) are DATA, so
  it drops into any vertical.

  `variant="accent"` fills the band with the brand accent (text flips to
  `--color-text-on-accent`); `"surface"` (default) is a quiet bordered band.

  @example
  <CallToAction
    heading="Tem uma ideia para o seu município?"
    body="Submeta a sua proposta ao Orçamento Participativo."
    primary={{ label: "Submeter proposta", href: "/propor" }}
    secondary={{ label: "Ver propostas", href: "/mapa" }}
    variant="accent"
  />
-->
<script>
  import Button from "./Button.svelte";

  let {
    /** @type {string} */
    heading = "",
    /** @type {string} */
    body = "",
    /** @type {2 | 3} Heading level for `heading`. */
    headingLevel = 2,
    /** @type {{ label?: string, href?: string } | undefined} Primary CTA. */
    primary = undefined,
    /** @type {{ label?: string, href?: string } | undefined} Secondary CTA. */
    secondary = undefined,
    /** @type {'surface' | 'accent'} Band fill. */
    variant = "surface",
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();
</script>

<section class="cta cta-{variant} {className}" {...rest}>
  <div class="cta-inner">
    {#if heading}
      <svelte:element this={`h${headingLevel}`} class="cta-heading"
        >{heading}</svelte:element
      >
    {/if}
    {#if body}<p class="cta-body">{body}</p>{/if}
    {#if (primary && primary.label) || (secondary && secondary.label)}
      <div class="cta-actions">
        {#if variant === "accent"}
          <!-- On an accent (brand-coloured) fill the DS button variants don't
               guarantee contrast (the theme's `secondary`/`ghost` text/bg sit
               too close to the accent). Render explicit INVERTED controls whose
               colours are the on-accent/accent token pair — the same contrast
               ratio as a primary button, just flipped. -->
          {#if primary && primary.label}
            <a class="cta-btn-inverted" href={primary.href || undefined}
              >{primary.label}</a
            >
          {/if}
          {#if secondary && secondary.label}
            <a class="cta-link-on-accent" href={secondary.href || undefined}
              >{secondary.label}</a
            >
          {/if}
        {:else}
          {#if primary && primary.label}
            <Button href={primary.href || undefined} variant="primary"
              >{primary.label}</Button
            >
          {/if}
          {#if secondary && secondary.label}
            <Button href={secondary.href || undefined} variant="ghost"
              >{secondary.label}</Button
            >
          {/if}
        {/if}
      </div>
    {/if}
  </div>
</section>

<style>
  .cta {
    border-radius: var(--card-radius);
  }

  .cta-surface {
    background: var(--color-surface-secondary);
    border: 1px solid var(--color-border);
  }

  .cta-accent {
    background: var(--color-accent);
    color: var(--color-text-on-accent);
  }

  .cta-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    align-items: flex-start;
    max-width: var(--content-width-wide);
    margin-inline: auto;
    padding: var(--space-2xl) var(--content-padding-x);
  }

  .cta-heading {
    margin: 0;
    font-family: var(--type-heading-font);
    font-size: var(--type-heading-size);
    line-height: var(--type-heading-leading);
    color: inherit;
  }

  .cta-surface .cta-heading {
    color: var(--color-text);
  }

  .cta-body {
    margin: 0;
    max-width: var(--content-width-narrow);
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    line-height: var(--type-body-leading);
    color: inherit;
  }

  .cta-surface .cta-body {
    color: var(--color-text-secondary);
  }

  .cta-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-md);
    margin-top: var(--space-xs);
  }

  /* Inverted solid button for the accent band: the on-accent surface as the
     fill, the accent as the text — the primary-button token pair, flipped, so
     it carries the same contrast guarantee against the coloured band. */
  .cta-btn-inverted {
    display: inline-flex;
    align-items: center;
    height: var(--button-md-height);
    padding-inline: var(--button-md-padding-x);
    border-radius: var(--button-radius);
    background: var(--color-text-on-accent);
    color: var(--color-accent);
    font-family: var(--button-font);
    font-size: var(--button-md-font-size);
    letter-spacing: var(--button-tracking);
    text-decoration: none;
    white-space: nowrap;
  }

  .cta-btn-inverted:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-text-on-accent);
    outline-offset: var(--focus-ring-offset);
  }

  .cta-link-on-accent {
    color: var(--color-text-on-accent);
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .cta-link-on-accent:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-text-on-accent);
    outline-offset: var(--focus-ring-offset);
  }
</style>
