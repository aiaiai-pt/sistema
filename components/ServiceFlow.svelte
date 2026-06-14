<!--
  @component ServiceFlow

  The chrome for a multi-step submit journey (a "service flow"): a step
  indicator, a progress bar, an error-summary region, the active step's body,
  and the prev / next / submit navigation. Vertical-agnostic — it renders
  whatever the consumer puts in the `children` snippet for the active step and
  never knows what an "eligibility check" or "proposal" is. The consumer owns
  the wizard STATE (which step, the collected answers) and the network; this
  shell owns the layout, the accessible step semantics, and focus management.

  Controlled: pass `current` (0-based active step) and the `steps` labels;
  drive it with `onPrev` / `onNext` (advance) and `onSubmit` (the final step's
  primary action). `canProceed=false` disables the primary button (e.g. an
  eligibility gate failed or the step is invalid); `busy=true` shows it loading
  and locks the nav (a dry-run or the submit is in flight).

  Accessibility (WCAG): a `<section>` region named by `label`; a polite live
  region announces "Step X of Y"; on every step change focus moves to the step
  body (or, if the consumer surfaces `errors`, to the error summary — an
  `role="alert"` list the citizen lands on so the reason is read first). The
  error summary, the step nav buttons, and the progress bar all ride semantic
  tokens, so dark / high-contrast schemes (#244) work unchanged.

  @example
  <ServiceFlow
    label="Submit a proposal"
    steps={[{ label: "Eligibility" }, { label: "Your idea" }, { label: "Review" }]}
    current={step}
    canProceed={eligible}
    busy={checking}
    errors={violations}
    onPrev={() => step--}
    onNext={() => step++}
    onSubmit={() => submit()}
  >
    {@render activeStepBody()}
  </ServiceFlow>
-->
<script module>
  /**
   * @typedef {{ label: string }} FlowStep
   */
</script>

<script>
  import Stepper from "./Stepper.svelte";
  import Progress from "./Progress.svelte";
  import Button from "./Button.svelte";

  let {
    /** @type {FlowStep[]} Ordered step labels for the indicator. */
    steps = [],
    /** @type {number} The active step, 0-based. */
    current = 0,
    /** @type {string} Accessible name for the flow region (localize it). */
    label = "Step-by-step form",
    /** @type {boolean} Whether the primary (next/submit) button is enabled. */
    canProceed = true,
    /** @type {boolean} A step action is in flight — locks nav, loads the button. */
    busy = false,
    /** @type {string[]} Blocking messages for the error summary (localize them). */
    errors = [],

    /** @type {string} Label for the error-summary heading (localize it). */
    errorSummaryLabel = "There is a problem",
    /** @type {string} Back-button label (localize it). */
    prevLabel = "Back",
    /** @type {string} Advance-button label (localize it). */
    nextLabel = "Continue",
    /** @type {string} Final-step primary label (localize it). */
    submitLabel = "Submit",
    /**
     * @type {(stepNumber: number, total: number) => string}
     * Builds the "Step X of Y" announcement (localize it).
     */
    progressLabel = (n, total) => `Step ${n} of ${total}`,

    /** @type {(() => void) | undefined} Go to the previous step. */
    onPrev = undefined,
    /** @type {(() => void) | undefined} Advance to the next step. */
    onNext = undefined,
    /** @type {(() => void) | undefined} Run the final step's primary action. */
    onSubmit = undefined,

    /** @type {import('svelte').Snippet | undefined} The active step's body. */
    children = undefined,

    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();

  const total = $derived(steps.length || 1);
  const isFirst = $derived(current <= 0);
  const isLast = $derived(current >= total - 1);
  const hasErrors = $derived(errors.length > 0);

  /** Map the flat step labels to the Stepper's status model. */
  const indicatorSteps = $derived(
    steps.map((s, i) => ({
      label: s.label,
      status:
        i < current ? "complete" : i === current ? "active" : "upcoming",
    })),
  );

  /** @type {HTMLElement | undefined} */
  let bodyRef = $state(undefined);
  /** @type {HTMLElement | undefined} */
  let errorRef = $state(undefined);

  // Focus management: after the first render, every step change (or a newly
  // surfaced error) moves focus so a keyboard / screen-reader user is taken to
  // the right place — the error summary when blocked, otherwise the step body.
  // The initial mount is skipped so the page doesn't steal focus on load.
  let mounted = false;
  $effect(() => {
    // Re-run when the step or the error state changes.
    void current;
    void hasErrors;
    if (!mounted) {
      mounted = true;
      return;
    }
    const target = hasErrors ? errorRef : bodyRef;
    target?.focus();
  });
</script>

<section class="service-flow {className}" aria-label={label} {...rest}>
  {#if steps.length > 1}
    <Stepper steps={indicatorSteps} class="service-flow-stepper" />
  {/if}

  <Progress
    value={current + 1}
    max={total}
    class="service-flow-progress"
    aria-label={progressLabel(current + 1, total)}
  />
  <p class="service-flow-progress-text" aria-live="polite">
    {progressLabel(current + 1, total)}
  </p>

  {#if hasErrors}
    <div
      class="service-flow-errors"
      role="alert"
      tabindex="-1"
      bind:this={errorRef}
    >
      <h2 class="service-flow-errors-heading">{errorSummaryLabel}</h2>
      <ul class="service-flow-errors-list">
        {#each errors as message}
          <li>{message}</li>
        {/each}
      </ul>
    </div>
  {/if}

  <div class="service-flow-body" tabindex="-1" bind:this={bodyRef}>
    {@render children?.()}
  </div>

  <div class="service-flow-nav">
    {#if !isFirst}
      <Button variant="ghost" disabled={busy} onclick={() => onPrev?.()}>
        {prevLabel}
      </Button>
    {/if}
    {#if isLast}
      <Button
        variant="primary"
        loading={busy}
        disabled={!canProceed || busy}
        onclick={() => onSubmit?.()}
      >
        {submitLabel}
      </Button>
    {:else}
      <Button
        variant="primary"
        loading={busy}
        disabled={!canProceed || busy}
        onclick={() => onNext?.()}
      >
        {nextLabel}
      </Button>
    {/if}
  </div>
</section>

<style>
  .service-flow {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .service-flow-progress-text {
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    color: var(--color-text-muted);
    margin: calc(-1 * var(--space-sm)) 0 0;
  }

  .service-flow-errors {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-md);
    border: 1px solid var(--color-destructive);
    border-radius: var(--radius-md);
    background: var(--color-destructive-subtle);
  }

  /* The alert region is programmatically focusable but shows no focus ring. */
  .service-flow-errors:focus {
    outline: none;
  }

  .service-flow-errors-heading {
    font-family: var(--type-heading-sm-font);
    font-size: var(--type-heading-sm-size);
    color: var(--color-text);
    margin: 0;
  }

  .service-flow-errors-list {
    margin: 0;
    padding-left: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    color: var(--color-text);
  }

  .service-flow-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .service-flow-body:focus {
    outline: none;
  }

  .service-flow-nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--space-sm);
    padding-top: var(--space-md);
    border-top: 1px solid var(--color-border);
  }

  /* When only the primary button shows (first step), keep it right-aligned. */
  .service-flow-nav:has(> :only-child) {
    justify-content: flex-end;
  }
</style>
