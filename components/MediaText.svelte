<!--
  @component MediaText

  An image (or video) beside a prose column — the alternating "about / feature"
  section. Presentational: heading, body, media URL + alt text, and the optional
  CTA are DATA, so it drops into any vertical. `reverse` flips the media to the
  other side for the classic zig-zag layout; columns stack on narrow viewports.

  The body slot is the consumer's pre-sanitised rich content (the portal passes
  sanitised markdown through `bodyHtml`); a plain `body` string is rendered as a
  paragraph when no HTML is given. The image carries operator-authored `alt`.

  @example
  <MediaText
    heading="Orçamento Participativo"
    body="Os cidadãos decidem como investir parte do orçamento municipal."
    image="/media/op.jpg"
    alt="Sessão pública de participação"
    cta={{ label: "Saber mais", href: "/info/regulamento" }}
  />
-->
<script>
  import Button from "./Button.svelte";

  let {
    /** @type {string} */
    heading = "",
    /** @type {2 | 3} Heading level for `heading`. */
    headingLevel = 2,
    /** @type {string} Plain-text body (used when `bodyHtml`/`children` absent). */
    body = "",
    /** @type {string | undefined} Pre-sanitised HTML body (XSS boundary is the consumer). */
    bodyHtml = undefined,
    /** @type {string | undefined} Image URL. */
    image = undefined,
    /** @type {string} Image alt text (operator data; "" = decorative). */
    alt = "",
    /** @type {string | undefined} Video URL (rendered instead of the image). */
    video = undefined,
    /** @type {boolean} Place the media on the right (zig-zag). */
    reverse = false,
    /** @type {{ label?: string, href?: string } | undefined} */
    cta = undefined,
    /** @type {string} */
    class: className = "",
    /** @type {import('svelte').Snippet | undefined} Rich body override. */
    children = undefined,
    ...rest
  } = $props();
</script>

<section class="media-text {className}" class:media-text-reverse={reverse} {...rest}>
  <div class="media-text-media">
    {#if video}
      <!-- svelte-ignore a11y_media_has_caption -->
      <video class="media-text-asset" src={video} controls></video>
    {:else if image}
      <img class="media-text-asset" src={image} {alt} loading="lazy" />
    {/if}
  </div>
  <div class="media-text-body">
    {#if heading}
      <svelte:element this={`h${headingLevel}`} class="media-text-heading"
        >{heading}</svelte:element
      >
    {/if}
    {#if children}
      {@render children()}
    {:else if bodyHtml !== undefined}
      <!-- eslint-disable-next-line svelte/no-at-html-tags — caller-sanitised -->
      <div class="media-text-prose">{@html bodyHtml}</div>
    {:else if body}
      <p class="media-text-prose">{body}</p>
    {/if}
    {#if cta && cta.label}
      <div class="media-text-cta">
        <Button href={cta.href || undefined} variant="secondary"
          >{cta.label}</Button
        >
      </div>
    {/if}
  </div>
</section>

<style>
  .media-text {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-xl);
    align-items: center;
    overflow-wrap: break-word;
  }

  @media (min-width: 768px) {
    .media-text {
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3xl);
    }
    .media-text-reverse .media-text-media {
      order: 2;
    }
  }

  .media-text-asset {
    display: block;
    width: 100%;
    height: auto;
    border-radius: var(--card-radius);
    background: var(--color-surface-secondary);
  }

  .media-text-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    /* Let the grid column shrink so its prose can wrap a long token. */
    min-width: 0;
  }

  .media-text-heading {
    margin: 0;
    font-family: var(--type-heading-font);
    font-size: var(--type-heading-size);
    line-height: var(--type-heading-leading);
    color: var(--color-text);
  }

  .media-text-prose {
    margin: 0;
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    line-height: var(--type-body-leading);
    color: var(--color-text-secondary);
  }

  .media-text-prose :global(p) {
    margin: 0 0 var(--space-sm);
  }

  .media-text-cta {
    margin-top: var(--space-xs);
  }
</style>
