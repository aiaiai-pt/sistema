<!--
  @component Testimonial

  A quote / testimonial band — one prominent pull-quote, or a small grid of
  them. Semantic `<figure>` + `<blockquote>` + `<figcaption>` so the attribution
  is correctly associated with the quote. Presentational: the quotes (text +
  author + role + optional avatar) are DATA.

  @example Single quote
  <Testimonial quote="Finalmente a minha rua tem iluminação nova." author="Maria S." role="Junta de Freguesia" />

  @example A grid of quotes
  <Testimonial
    heading="O que dizem os cidadãos"
    items={[
      { quote: "Simples e rápido.", author: "João P." },
      { quote: "A minha proposta foi executada!", author: "Ana R.", role: "Valongo" },
    ]}
  />
-->
<script>
  let {
    /** @type {string} Optional band heading (for the grid form). */
    heading = "",
    /** @type {2 | 3} Heading level for `heading`. */
    headingLevel = 2,
    /** @type {string} Single-quote text (when `items` is empty). */
    quote = "",
    /** @type {string} */
    author = "",
    /** @type {string} */
    role = "",
    /** @type {string | undefined} Avatar image URL. */
    avatar = undefined,
    /**
     * @type {Array<{ quote?: string, author?: string, role?: string, avatar?: string }>}
     * Multiple testimonials (renders a grid). Overrides the single-quote props.
     */
    items = [],
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();

  const list = $derived(
    items.length > 0
      ? items
      : quote
        ? [{ quote, author, role, avatar }]
        : [],
  );
</script>

<section class="testimonial {className}" {...rest}>
  {#if heading}
    <svelte:element this={`h${headingLevel}`} class="testimonial-heading"
      >{heading}</svelte:element
    >
  {/if}
  <div class="testimonial-grid" class:testimonial-grid-multi={list.length > 1}>
    {#each list as item (item.quote)}
      <figure class="testimonial-item">
        <blockquote class="testimonial-quote">{item.quote}</blockquote>
        {#if item.author || item.role}
          <figcaption class="testimonial-cite">
            {#if item.avatar}
              <img class="testimonial-avatar" src={item.avatar} alt="" loading="lazy" />
            {/if}
            <span class="testimonial-attrib">
              {#if item.author}<span class="testimonial-author">{item.author}</span>{/if}
              {#if item.role}<span class="testimonial-role">{item.role}</span>{/if}
            </span>
          </figcaption>
        {/if}
      </figure>
    {/each}
  </div>
</section>

<style>
  .testimonial {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }

  .testimonial-heading {
    margin: 0;
    font-family: var(--type-heading-font);
    font-size: var(--type-heading-size);
    line-height: var(--type-heading-leading);
    color: var(--color-text);
  }

  .testimonial-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  @media (min-width: 768px) {
    .testimonial-grid-multi {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .testimonial-item {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-xl);
    background: var(--color-surface-secondary);
    border-left: 3px solid var(--color-accent);
    border-radius: var(--card-radius);
  }

  .testimonial-quote {
    margin: 0;
    font-family: var(--type-heading-sm-font);
    font-size: var(--type-heading-sm-size);
    line-height: var(--type-heading-sm-leading);
    color: var(--color-text);
  }

  .testimonial-cite {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-style: normal;
  }

  .testimonial-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    object-fit: cover;
  }

  .testimonial-attrib {
    display: flex;
    flex-direction: column;
  }

  .testimonial-author {
    font-family: var(--type-label-font);
    font-size: var(--type-body-sm-size);
    font-weight: 600;
    color: var(--color-text);
  }

  .testimonial-role {
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    color: var(--color-text-muted);
  }
</style>
