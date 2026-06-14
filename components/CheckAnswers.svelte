<!--
  @component CheckAnswers

  The "review your answers before submitting" summary — a grouped description
  list of every answer the citizen gave, each with a "Change" link back to the
  step that captured it. Vertical-agnostic: it renders whatever label/value
  pairs the consumer collected (from the action's parameter labels), grouped by
  the flow's sections. Pure presentation — no state, no network.

  Accessibility (WCAG 3.3.4, Error Prevention): every answer is reviewable and
  editable before the irreversible submit. Each "Change" control carries an
  accessible name that includes WHAT it changes (the visible "Change" plus a
  visually-hidden field label), so a screen-reader user never meets a row of
  identical "Change" links. Answers are a `<dl>` (the semantic structure for
  term/description pairs); section headings are `<h3>` under the widget's `h2`.

  @example
  <CheckAnswers
    label="Check your answers"
    groups={[
      { label: "About you", items: [
        { key: "name", label: "Full name", value: "Ana Silva", onChange: () => goTo(0) },
      ]},
      { label: "Your idea", items: [
        { key: "title", label: "Title", value: "Bike lanes", onChange: () => goTo(1) },
      ]},
    ]}
  />
-->
<script module>
  /**
   * @typedef {{ key: string, label: string, value: string, onChange?: () => void }} AnswerItem
   * @typedef {{ label?: string, items: AnswerItem[] }} AnswerGroup
   */
</script>

<script>
  let {
    /** @type {AnswerGroup[]} The collected answers, grouped by section. */
    groups = [],
    /** @type {string} Accessible name for the review region (localize it). */
    label = "Check your answers",
    /** @type {string} Visible text on each change control (localize it). */
    changeLabel = "Change",
    /** @type {string} Shown when there are no answers yet (localize it). */
    emptyText = "There are no answers to review yet.",
    /** @type {string} Placeholder for an answer the citizen left blank (localize it). */
    blankText = "Not provided",

    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();

  const hasAnswers = $derived(groups.some((g) => g.items.length > 0));
</script>

<section class="check-answers {className}" aria-label={label} {...rest}>
  {#if hasAnswers}
    {#each groups as group (group.label ?? group.items[0]?.key)}
      {#if group.items.length > 0}
        <div class="check-answers-group">
          {#if group.label}
            <h3 class="check-answers-group-heading">{group.label}</h3>
          {/if}
          <dl class="check-answers-list">
            {#each group.items as item (item.key)}
              <div class="check-answers-row">
                <dt class="check-answers-term">{item.label}</dt>
                <dd class="check-answers-value">
                  {item.value || blankText}
                </dd>
                <dd class="check-answers-action">
                  {#if item.onChange}
                    <button
                      type="button"
                      class="check-answers-change"
                      onclick={() => item.onChange?.()}
                    >
                      {changeLabel}<span class="check-answers-sr"
                        >&nbsp;{item.label}</span
                      >
                    </button>
                  {/if}
                </dd>
              </div>
            {/each}
          </dl>
        </div>
      {/if}
    {/each}
  {:else}
    <p class="check-answers-empty">{emptyText}</p>
  {/if}
</section>

<style>
  .check-answers {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .check-answers-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .check-answers-group-heading {
    font-family: var(--type-heading-sm-font);
    font-size: var(--type-heading-sm-size);
    color: var(--color-text);
    margin: 0;
  }

  .check-answers-list {
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  .check-answers-row {
    display: grid;
    grid-template-columns: minmax(8rem, 1fr) 2fr auto;
    gap: var(--space-sm);
    align-items: start;
    padding: var(--space-sm) 0;
    border-bottom: 1px solid var(--color-border);
  }

  .check-answers-term {
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    color: var(--color-text-muted);
    margin: 0;
  }

  .check-answers-value {
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    color: var(--color-text);
    margin: 0;
    overflow-wrap: anywhere;
  }

  .check-answers-action {
    margin: 0;
    justify-self: end;
  }

  .check-answers-change {
    appearance: none;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    color: var(--color-accent);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .check-answers-change:hover {
    color: var(--color-accent-hover);
  }

  .check-answers-empty {
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    color: var(--color-text-muted);
    margin: 0;
  }

  /* Visually-hidden text that screen readers still announce (WCAG 3.3.4). */
  .check-answers-sr {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 30rem) {
    .check-answers-row {
      grid-template-columns: 1fr auto;
    }
    .check-answers-term {
      grid-column: 1 / -1;
    }
  }
</style>
