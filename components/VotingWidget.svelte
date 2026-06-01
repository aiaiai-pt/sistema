<!--
  @component VotingWidget

  Participation vote panel — the Valongo V10 participation-grid primitive
  (participatory budget, consultations, local polls). One question, a radio
  group of options, a submit path, and a pseudonymised receipt after voting.
  Presentational: it emits `onsubmit(optionId)`; the portal wires that to the
  BFF public submit surface (`POST /{app}/public/submit`, voting placement —
  #70 M4), and renders the bot-protection challenge into the `captcha` slot.

  States (mutually exclusive vote-ability):
   - open        — radio group + submit (the default)
   - submitted   — confirmation + the `receipt` slot, voting locked
   - closed      — voting period over; results only
   - disabled    — not eligible (e.g. anonymous where login is required);
                   options shown read-only with an announced `disabledReason`
  Pass `showResults` to render the tally as labelled bars (typically once
  `closed` or `submitted`).

  Accessibility:
   - `<fieldset>` + `<legend>` (the question) groups the options as a native
     radio group — arrow-key navigation and "n of m" come for free.
   - Submit is disabled until an option is chosen; the confirmation + receipt
     land in an `aria-live="polite"` region so a screen reader announces them.
   - Result bars are `aria-hidden`; each option's percentage is in its visible
     text, so the meaning isn't colour/width-only.
   - Radios keep a visible focus ring; reduced-motion disables the bar fill.

  @example
  <VotingWidget
    question="Which project should Valongo fund first?"
    name="pb-2026"
    options={[{ id: "a", label: "Riverside path" }, { id: "b", label: "School playground" }]}
    bind:selected
    onsubmit={(id) => postVote(id)}
  >
    {#snippet captcha()}<TurnstileWidget /> {/snippet}
  </VotingWidget>
-->
<script>
  /**
   * @typedef {{ id: string, label: string, votes?: number }} VoteOption
   */

  let {
    /** @type {string} The question (rendered as the fieldset legend). */
    question = "",
    /** @type {VoteOption[]} */
    options = [],
    /** @type {string | undefined} Bindable selected option id. */
    selected = $bindable(undefined),
    /** @type {string} Radio-group name — unique per widget on the page. */
    name = "vote",
    /** @type {boolean} Voting period is over. */
    closed = false,
    /** @type {boolean} This citizen has already voted. */
    submitted = false,
    /** @type {boolean} Voting unavailable (e.g. not eligible / login required). */
    disabled = false,
    /** @type {boolean} Render the tally as labelled bars. */
    showResults = false,
    /** @type {string} Submit button text (localize it). */
    submitLabel = "Submit vote",
    /** @type {string} Heading shown in the submitted state (localize it). */
    submittedLabel = "Your vote has been recorded.",
    /** @type {string} Notice shown in the closed state (localize it). */
    closedLabel = "Voting has closed.",
    /** @type {string} Reason voting is unavailable, announced (localize it). */
    disabledReason = "",
    /** @type {((optionId: string) => void) | undefined} */
    onsubmit = undefined,
    /** @type {string} */
    class: className = "",
    /** @type {import('svelte').Snippet | undefined} Bot-protection challenge (Turnstile). */
    captcha = undefined,
    /** @type {import('svelte').Snippet | undefined} Pseudonymised receipt, shown after voting. */
    receipt = undefined,
    ...rest
  } = $props();

  const canVote = $derived(!closed && !submitted && !disabled);
  const total = $derived(
    options.reduce((sum, o) => sum + (o.votes ?? 0), 0),
  );

  /** @param {number | undefined} votes */
  const pct = (votes) => (total > 0 ? Math.round(((votes ?? 0) / total) * 100) : 0);

  /** @param {SubmitEvent} e */
  function handleSubmit(e) {
    e.preventDefault();
    if (canVote && selected) onsubmit?.(selected);
  }
</script>

<section class="voting-widget {className}" {...rest}>
  <form class="voting-form" onsubmit={handleSubmit} novalidate>
    <fieldset class="voting-fieldset" disabled={!canVote}>
      <legend class="voting-legend">{question}</legend>

      {#if disabled && disabledReason}
        <p class="voting-reason" role="note">{disabledReason}</p>
      {/if}

      <ul class="voting-options">
        {#each options as option (option.id)}
          <li class="voting-option">
            <label class="voting-label">
              <input
                type="radio"
                class="voting-radio"
                {name}
                value={option.id}
                bind:group={selected}
                disabled={!canVote}
              />
              <span class="voting-option-text">{option.label}</span>
              {#if showResults}
                <span class="voting-pct">{pct(option.votes)}%</span>
              {/if}
            </label>
            {#if showResults}
              <div class="voting-bar" aria-hidden="true">
                <div class="voting-bar-fill" style:width={`${pct(option.votes)}%`}></div>
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    </fieldset>

    {#if canVote}
      {#if captcha}<div class="voting-captcha">{@render captcha()}</div>{/if}
      <button type="submit" class="voting-submit" disabled={!selected}>
        {submitLabel}
      </button>
    {/if}
  </form>

  <!-- Status region: confirmation / closed notice land here so AT announces them. -->
  <div class="voting-status" role="status" aria-live="polite">
    {#if submitted}
      <p class="voting-confirm">{submittedLabel}</p>
      {#if receipt}<div class="voting-receipt">{@render receipt()}</div>{/if}
    {:else if closed}
      <p class="voting-closed">{closedLabel}</p>
    {/if}
  </div>
</section>

<style>
  .voting-widget {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .voting-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .voting-fieldset {
    margin: 0;
    padding: 0;
    border: 0;
    min-width: 0;
  }

  .voting-legend {
    padding: 0;
    margin-bottom: var(--space-md);
    font-family: var(--type-heading-sm-font);
    font-size: var(--type-heading-sm-size);
    color: var(--color-text);
  }

  .voting-reason {
    margin: 0 0 var(--space-md);
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    color: var(--color-text-muted);
  }

  .voting-options {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .voting-label {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    cursor: pointer;
  }
  /* Selected row reads as chosen without relying on the native dot alone. */
  .voting-label:has(.voting-radio:checked) {
    border-color: var(--color-accent);
    background: var(--color-accent-subtle);
  }
  .voting-label:has(.voting-radio:focus-visible) {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
  .voting-fieldset:disabled .voting-label {
    cursor: default;
    opacity: 0.7;
  }

  .voting-radio {
    flex-shrink: 0;
    accent-color: var(--color-accent);
  }

  .voting-option-text {
    flex: 1;
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    color: var(--color-text);
  }

  .voting-pct {
    font-family: var(--type-data-font);
    font-size: var(--type-data-size);
    color: var(--color-text-secondary);
  }

  .voting-bar {
    height: var(--space-2xs);
    margin-top: var(--space-2xs);
    border-radius: var(--radius-pill);
    background: var(--color-surface-tertiary);
    overflow: hidden;
  }
  .voting-bar-fill {
    height: 100%;
    background: var(--color-accent);
    transition: width var(--duration-normal) var(--easing-default);
  }
  @media (prefers-reduced-motion: reduce) {
    .voting-bar-fill {
      transition: none;
    }
  }

  .voting-submit {
    align-self: flex-start;
    padding: var(--space-sm) var(--space-lg);
    border: 0;
    border-radius: var(--radius-md);
    background: var(--color-accent);
    color: var(--color-text-on-accent);
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    cursor: pointer;
  }
  .voting-submit:hover:not(:disabled) {
    background: var(--color-accent-hover);
  }
  .voting-submit:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
  .voting-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .voting-confirm,
  .voting-closed {
    margin: 0;
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    color: var(--color-text);
  }
  .voting-confirm {
    color: var(--color-success);
  }

  .voting-receipt {
    margin-top: var(--space-sm);
  }
</style>
