<!--
  @component Steps

  A numbered "how it works" explainer — an ordered list of steps, each a number
  badge, a heading and a short description. Distinct from `ServiceFlow`/`Stepper`
  (which drive a live multi-step form): this is presentational marketing content
  that explains a process. The numbers come from the list order (decorative
  badges, `aria-hidden`) so screen readers get the native `<ol>` sequence.

  @example
  <Steps
    heading="Como funciona"
    steps={[
      { title: "Proponha", text: "Submeta a sua ideia até 31 de março." },
      { title: "Análise", text: "A comissão verifica a elegibilidade." },
      { title: "Votação", text: "Os cidadãos votam nas finalistas." },
      { title: "Execução", text: "As propostas vencedoras são executadas." },
    ]}
  />
-->
<script>
  let {
    /** @type {string} Optional band heading. */
    heading = "",
    /** @type {2 | 3} Heading level for `heading`. */
    headingLevel = 2,
    /**
     * @type {Array<{ title?: string, text?: string }>} The ordered steps.
     */
    steps = [],
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();
</script>

<section class="steps {className}" {...rest}>
  {#if heading}
    <svelte:element this={`h${headingLevel}`} class="steps-heading"
      >{heading}</svelte:element
    >
  {/if}
  <ol class="steps-list">
    {#each steps as step, i (step.title)}
      <li class="steps-item">
        <span class="steps-number" aria-hidden="true">{i + 1}</span>
        <div class="steps-body">
          {#if step.title}
            <svelte:element
              this={`h${Math.min(headingLevel + 1, 4)}`}
              class="steps-title">{step.title}</svelte:element
            >
          {/if}
          {#if step.text}<p class="steps-text">{step.text}</p>{/if}
        </div>
      </li>
    {/each}
  </ol>
</section>

<style>
  .steps {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }

  .steps-heading {
    margin: 0;
    font-family: var(--type-heading-font);
    font-size: var(--type-heading-size);
    line-height: var(--type-heading-leading);
    color: var(--color-text);
  }

  .steps-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    counter-reset: step;
  }

  @media (min-width: 768px) {
    .steps-list {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .steps-item {
    display: flex;
    gap: var(--space-md);
    align-items: flex-start;
  }

  .steps-number {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    background: var(--color-accent);
    color: var(--color-text-on-accent);
    font-family: var(--type-data-font);
    font-size: var(--type-data-size);
    font-weight: 600;
  }

  .steps-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
  }

  .steps-title {
    margin: 0;
    font-family: var(--type-heading-sm-font);
    font-size: var(--type-heading-sm-size);
    line-height: var(--type-heading-sm-leading);
    color: var(--color-text);
  }

  .steps-text {
    margin: 0;
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    line-height: var(--type-body-leading);
    color: var(--color-text-secondary);
  }
</style>
