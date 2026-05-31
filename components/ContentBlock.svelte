<!--
  @component ContentBlock

  Prose container for documentation / legal / content pages (privacy, terms,
  accessibility, regulamento — the `content` page template). Applies readable
  measure + typographic rhythm to long-form content, with an optional title
  and a version/date badge slot.

  SECURITY: ContentBlock only STYLES its children — it does not parse or
  sanitise. A consumer rendering operator-authored markdown/HTML MUST sanitise
  before injecting it (XSS); pass the sanitised result as `children`.

  @example
  <ContentBlock title="Privacy Policy">
    {#snippet badge()}<Badge>v3 · updated 2026-05-01</Badge>{/snippet}
    {@html sanitizedHtml}
  </ContentBlock>
-->
<script>
  let {
    /** @type {string} Page title (rendered as h1 — keep one per page). */
    title = "",
    /** @type {1 | 2} Heading level for `title`. */
    headingLevel = 1,
    /** @type {string} */
    class: className = "",
    /** @type {import('svelte').Snippet | undefined} Version / date badge. */
    badge = undefined,
    /** @type {import('svelte').Snippet | undefined} The (pre-sanitised) prose. */
    children = undefined,
    ...rest
  } = $props();
</script>

<article class="content-block {className}" {...rest}>
  {#if title}
    <header class="content-block-head">
      <svelte:element this={`h${headingLevel}`} class="content-block-title">{title}</svelte:element>
      {#if badge}<div class="content-block-badge">{@render badge()}</div>{/if}
    </header>
  {/if}
  <div class="content-block-prose">
    {#if children}{@render children()}{/if}
  </div>
</article>

<style>
  .content-block {
    width: 100%;
    max-width: var(--content-width-narrow);
    margin-inline: auto;
    padding: var(--space-2xl) var(--content-padding-x);
  }

  .content-block-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
  }

  .content-block-title {
    margin: 0;
    font-family: var(--type-heading-lg-font);
    font-size: var(--type-heading-lg-size);
    color: var(--color-text);
  }

  /* Long-form rhythm. Scoped to descendants since prose is consumer-injected
     (:global needed — these elements aren't in this component's own markup). */
  .content-block-prose {
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    color: var(--color-text);
    line-height: 1.6;
  }

  .content-block-prose :global(h2) {
    font-family: var(--type-heading-font);
    font-size: var(--type-heading-size);
    margin: var(--space-xl) 0 var(--space-sm);
  }

  .content-block-prose :global(h3) {
    font-family: var(--type-heading-sm-font);
    font-size: var(--type-heading-sm-size);
    margin: var(--space-lg) 0 var(--space-xs);
  }

  .content-block-prose :global(p),
  .content-block-prose :global(ul),
  .content-block-prose :global(ol) {
    margin: 0 0 var(--space-md);
  }

  .content-block-prose :global(a) {
    color: var(--color-accent);
  }
</style>
