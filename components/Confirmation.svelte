<!--
  @component Confirmation

  The receipt panel shown after a successful submission: a success banner with
  the citizen's reference number front-and-centre, a "what happens next" body,
  and an optional link to track the submission. Vertical-agnostic — it knows
  nothing about proposals or occurrences, only "here is your reference and what
  to expect". Pure presentation; the consumer fetched the reference.

  Accessibility: a `<section>` region named by `label`; the success heading is
  an `<h2>` (the page `<h1>` is the consumer's, same split as the other account
  widgets) carrying a decorative check. The reference is emphasised text inside
  a labelled block, not colour alone. Semantic tokens throughout, so the
  success styling survives dark / high-contrast schemes (#244).

  @example
  <Confirmation
    label="Submission received"
    title="Your proposal has been submitted"
    reference="PRP-2026-0042"
    referenceLabel="Your reference number"
    body="We've sent a confirmation. The committee will review your proposal."
    trackHref="/participacao/acompanhar/PRP-2026-0042"
    trackLabel="Track this proposal"
  />
-->
<script>
  import Button from "./Button.svelte";

  let {
    /** @type {string} Accessible name for the confirmation region (localize it). */
    label = "Confirmation",
    /** @type {string} The success headline (localize it). */
    title = "Submission received",
    /** @type {string} The reference / tracking number to surface. */
    reference = "",
    /** @type {string} Label above the reference number (localize it). */
    referenceLabel = "Your reference number",
    /** @type {string} The "what happens next" copy (localize it). */
    body = "",
    /** @type {string | undefined} Link to track the submission. */
    trackHref = undefined,
    /** @type {string} Label for the track link (localize it). */
    trackLabel = "Track your submission",

    /** @type {import('svelte').Snippet | undefined} Extra content (e.g. a next-steps list). */
    children = undefined,

    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();
</script>

<section class="confirmation {className}" aria-label={label} {...rest}>
  <div class="confirmation-banner">
    <span class="confirmation-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12.5l4.5 4.5L19 7.5"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <h2 class="confirmation-title">{title}</h2>
  </div>

  {#if reference}
    <div class="confirmation-reference">
      <span class="confirmation-reference-label">{referenceLabel}</span>
      <strong class="confirmation-reference-value">{reference}</strong>
    </div>
  {/if}

  {#if body}
    <p class="confirmation-body">{body}</p>
  {/if}

  {#if children}
    <div class="confirmation-extra">{@render children()}</div>
  {/if}

  {#if trackHref}
    <div class="confirmation-actions">
      <Button variant="secondary" href={trackHref}>{trackLabel}</Button>
    </div>
  {/if}
</section>

<style>
  .confirmation {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: var(--space-xl);
    border: 1px solid var(--color-success);
    border-radius: var(--radius-lg);
    background: var(--color-success-subtle);
  }

  .confirmation-banner {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .confirmation-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-circle);
    background: var(--color-success);
    color: var(--color-surface);
  }

  .confirmation-icon svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  .confirmation-title {
    font-family: var(--type-heading-font);
    font-size: var(--type-heading-size);
    color: var(--color-text);
    margin: 0;
  }

  .confirmation-reference {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
  }

  .confirmation-reference-label {
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    color: var(--color-text-muted);
  }

  .confirmation-reference-value {
    font-family: var(--type-data-font);
    font-size: var(--type-heading-sm-size);
    letter-spacing: var(--type-data-tracking);
    color: var(--color-text);
  }

  .confirmation-body {
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    line-height: var(--type-body-leading);
    color: var(--color-text);
    margin: 0;
  }

  .confirmation-extra {
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    color: var(--color-text);
  }

  .confirmation-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }
</style>
