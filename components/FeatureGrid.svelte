<!--
  @component FeatureGrid

  A responsive grid of feature cards — each an optional icon, a heading, and a
  short description (optionally a link). The landing/marketing "what you can do"
  / highlights band. Purely presentational: the items are DATA (page props), so
  it drops into any vertical with different copy. Built on CardGrid + Card.

  Headings render at `headingLevel` (default h3 — the band sits under a section
  heading the consumer owns). Icons are DECORATIVE: the DS stays icon-set
  agnostic, so the consumer supplies an `icon` snippet that renders an icon for
  each item (e.g. mapping `item.icon` to its own icon library). No snippet → no
  icons, cards still render.

  @example
  <FeatureGrid
    heading="Como participar"
    items={[
      { icon: "lightbulb", title: "Proponha", text: "Submeta a sua ideia." },
      { icon: "check-circle", title: "Vote", text: "Escolha as vencedoras.", href: "/propor" },
    ]}
  >
    {#snippet icon(item)}<MyIcon name={item.icon} />{/snippet}
  </FeatureGrid>
-->
<script>
  import CardGrid from "./CardGrid.svelte";
  import Card from "./Card.svelte";

  let {
    /** @type {string} Optional band heading (rendered above the grid). */
    heading = "",
    /** @type {string} Optional supporting text under the heading. */
    intro = "",
    /** @type {2 | 3 | 4} Heading level for `heading`. */
    headingLevel = 2,
    /** @type {'2' | '3' | '4'} Grid columns at desktop. */
    columns = "3",
    /**
     * @type {Array<{ icon?: string, title?: string, text?: string, href?: string }>}
     * Feature items. `icon` is an opaque name passed to the `icon` snippet;
     * `href` makes the whole card a link.
     */
    items = [],
    /**
     * @type {import('svelte').Snippet<[{ icon?: string }]> | undefined}
     * Decorative per-item icon. Receives the item; the consumer maps `item.icon`
     * to its own icon component (the DS doesn't bundle an icon set).
     */
    icon = undefined,
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();
</script>

<div class="feature-grid {className}" {...rest}>
  {#if heading}
    <div class="feature-grid-head">
      <svelte:element this={`h${headingLevel}`} class="feature-grid-heading"
        >{heading}</svelte:element
      >
      {#if intro}<p class="feature-grid-intro">{intro}</p>{/if}
    </div>
  {/if}

  <CardGrid {columns}>
    {#each items as item (item.title)}
      <Card href={item.href || undefined} interactive={!!item.href}>
        {#if icon && item.icon}
          <span class="feature-icon" aria-hidden="true">{@render icon(item)}</span>
        {/if}
        {#if item.title}
          <svelte:element
            this={`h${Math.min(headingLevel + 1, 4)}`}
            class="feature-title">{item.title}</svelte:element
          >
        {/if}
        {#if item.text}<p class="feature-text">{item.text}</p>{/if}
      </Card>
    {/each}
  </CardGrid>
</div>

<style>
  .feature-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
    /* Break a pathological unbreakable token instead of blowing out a card
       (CardGrid already sets min-width:0 on its children). Inherited. */
    overflow-wrap: break-word;
  }

  .feature-grid-head {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .feature-grid-heading {
    margin: 0;
    font-family: var(--type-heading-font);
    font-size: var(--type-heading-size);
    line-height: var(--type-heading-leading);
    color: var(--color-text);
  }

  .feature-grid-intro {
    margin: 0;
    max-width: var(--content-width-narrow);
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    color: var(--color-text-secondary);
  }

  .feature-icon {
    display: inline-flex;
    color: var(--color-accent);
    margin-bottom: var(--space-sm);
    line-height: 0;
  }

  .feature-title {
    margin: 0 0 var(--space-xs);
    font-family: var(--type-heading-sm-font);
    font-size: var(--type-heading-sm-size);
    line-height: var(--type-heading-sm-leading);
    color: var(--color-text);
  }

  .feature-text {
    margin: 0;
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    line-height: var(--type-body-leading);
    color: var(--color-text-secondary);
  }
</style>
