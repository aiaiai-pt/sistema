<!--
  @component MediaGallery

  A landing-grade media gallery — a responsive grid (or a horizontal scroll-snap
  rail) of captioned images. Distinct from the detail-page image strip: this is
  presentational showcase content for landing / campaign / about pages. No JS
  carousel/autoplay (an accessibility and reduced-motion liability); on narrow
  viewports the `rail` layout becomes a swipeable scroll-snap row that is fully
  keyboard-scrollable. Each image carries operator-authored `alt`; captions are
  optional `<figcaption>`s.

  @example Grid
  <MediaGallery
    heading="Projetos executados"
    items={[
      { src: "/g/parque.jpg", alt: "Novo parque urbano", caption: "Parque da Cidade — 2025" },
      { src: "/g/ciclovia.jpg", alt: "Ciclovia ribeirinha", caption: "Ciclovia — 2024" },
    ]}
  />

  @example Horizontal rail
  <MediaGallery layout="rail" label="Galeria" items={photos} />
-->
<script>
  let {
    /** @type {string} Optional visible heading. */
    heading = "",
    /** @type {2 | 3} Heading level for `heading`. */
    headingLevel = 2,
    /** @type {string} Accessible label when there is no visible heading. */
    label = "Gallery",
    /** @type {'grid' | 'rail'} Grid (wrap) or horizontal scroll-snap rail. */
    layout = "grid",
    /** @type {'2' | '3' | '4'} Grid columns at desktop (grid layout only). */
    columns = "3",
    /**
     * @type {Array<{ src?: string, alt?: string, caption?: string }>} The media.
     */
    items = [],
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();
</script>

<section
  class="media-gallery {className}"
  aria-label={heading ? undefined : label}
  {...rest}
>
  {#if heading}
    <svelte:element this={`h${headingLevel}`} class="media-gallery-heading"
      >{heading}</svelte:element
    >
  {/if}
  <!-- A horizontal scroll-snap rail is a scrollable region: give it keyboard
       access (tabindex=0) and an accessible name so it isn't an axe
       `scrollable-region-focusable` violation. Keep the native list semantics
       (no role override) so the <li>s stay valid list items. The grid layout
       doesn't scroll, so it's a plain list. -->
  <ul
    class="media-gallery-list media-gallery-{layout} media-gallery-cols-{columns}"
    tabindex={layout === "rail" ? 0 : undefined}
    aria-label={layout === "rail" ? heading || label : undefined}
  >
    {#each items as item (item.src)}
      <li class="media-gallery-item">
        <figure class="media-gallery-figure">
          <img class="media-gallery-img" src={item.src} alt={item.alt ?? ""} loading="lazy" />
          {#if item.caption}
            <figcaption class="media-gallery-caption">{item.caption}</figcaption>
          {/if}
        </figure>
      </li>
    {/each}
  </ul>
</section>

<style>
  .media-gallery {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
    overflow-wrap: break-word;
  }

  .media-gallery-heading {
    margin: 0;
    font-family: var(--type-heading-font);
    font-size: var(--type-heading-size);
    line-height: var(--type-heading-leading);
    color: var(--color-text);
  }

  .media-gallery-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /* ─── Grid layout ─── */
  .media-gallery-grid {
    display: grid;
    gap: var(--grid-gutter);
    grid-template-columns: 1fr;
  }

  @media (min-width: 768px) {
    .media-gallery-grid.media-gallery-cols-2 {
      grid-template-columns: repeat(2, 1fr);
    }
    .media-gallery-grid.media-gallery-cols-3 {
      grid-template-columns: repeat(2, 1fr);
    }
    .media-gallery-grid.media-gallery-cols-4 {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .media-gallery-grid.media-gallery-cols-3 {
      grid-template-columns: repeat(3, 1fr);
    }
    .media-gallery-grid.media-gallery-cols-4 {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  /* ─── Horizontal scroll-snap rail ─── */
  .media-gallery-rail {
    display: flex;
    gap: var(--grid-gutter);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: var(--space-sm);
  }

  .media-gallery-rail:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .media-gallery-rail .media-gallery-item {
    flex: 0 0 80%;
    scroll-snap-align: start;
  }

  @media (min-width: 768px) {
    .media-gallery-rail .media-gallery-item {
      flex-basis: 40%;
    }
  }

  .media-gallery-figure {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .media-gallery-img {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    border-radius: var(--card-radius);
    background: var(--color-surface-secondary);
  }

  .media-gallery-caption {
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    color: var(--color-text-muted);
  }
</style>
