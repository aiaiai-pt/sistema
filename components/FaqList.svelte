<!--
  @component FaqList

  A frequently-asked-questions accordion. Built on native `<details>`/`<summary>`
  so it expand/collapses with zero JS and is keyboard + screen-reader accessible
  out of the box. Distinct from `CollapsibleSection` (filter-group chrome, label
  styling): this renders question-weight summaries for content/help pages.
  Presentational — the Q/A pairs are DATA. Answers accept pre-sanitised HTML
  (the consumer owns the XSS boundary) or plain text.

  @example
  <FaqList
    heading="Perguntas frequentes"
    items={[
      { q: "Quem pode participar?", a: "Qualquer cidadão recenseado no município." },
      { q: "Como submeto?", aHtml: "<p>Use o <a href='/propor'>formulário</a>.</p>" },
    ]}
  />
-->
<script>
  let {
    /** @type {string} Optional heading above the list. */
    heading = "",
    /** @type {2 | 3} Heading level for `heading`. */
    headingLevel = 2,
    /**
     * @type {Array<{ q?: string, a?: string, aHtml?: string }>} The questions.
     * `aHtml` (pre-sanitised) takes precedence over the plain `a` text.
     */
    items = [],
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();
</script>

<section class="faq {className}" {...rest}>
  {#if heading}
    <svelte:element this={`h${headingLevel}`} class="faq-heading"
      >{heading}</svelte:element
    >
  {/if}
  <div class="faq-list">
    {#each items as item (item.q)}
      <details class="faq-item">
        <summary class="faq-question">
          <span class="faq-question-text">{item.q}</span>
          <svg
            class="faq-caret"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 5L7 10L11 5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </summary>
        <div class="faq-answer">
          {#if item.aHtml !== undefined}
            <!-- eslint-disable-next-line svelte/no-at-html-tags — caller-sanitised -->
            {@html item.aHtml}
          {:else if item.a}
            <p>{item.a}</p>
          {/if}
        </div>
      </details>
    {/each}
  </div>
</section>

<style>
  .faq {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .faq-heading {
    margin: 0;
    font-family: var(--type-heading-font);
    font-size: var(--type-heading-size);
    line-height: var(--type-heading-leading);
    color: var(--color-text);
  }

  .faq-item {
    border-bottom: 1px solid var(--color-border);
  }

  .faq-question {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    cursor: pointer;
    padding: var(--space-md) 0;
    list-style: none;
    font-family: var(--type-heading-sm-font);
    font-size: var(--type-heading-sm-size);
    line-height: var(--type-heading-sm-leading);
    color: var(--color-text);
  }

  .faq-question::-webkit-details-marker {
    display: none;
  }
  .faq-question::marker {
    content: "";
  }

  .faq-question:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .faq-caret {
    flex-shrink: 0;
    color: var(--color-text-secondary);
    transition: transform var(--duration-fast) var(--easing-default);
  }

  .faq-item[open] .faq-caret {
    transform: rotate(180deg);
  }

  .faq-answer {
    padding: 0 0 var(--space-md);
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    line-height: var(--type-body-leading);
    color: var(--color-text-secondary);
  }

  .faq-answer :global(p) {
    margin: 0 0 var(--space-sm);
  }
  .faq-answer :global(p:last-child) {
    margin-bottom: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .faq-caret {
      transition: none;
    }
  }
</style>
