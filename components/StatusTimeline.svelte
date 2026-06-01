<!--
  @component StatusTimeline

  Ordered, accessibility-first progress timeline for the citizen portal — the
  `tracker` page template's spine (a submission moving submitted → triaged →
  in-progress → resolved). Renders an `<ol>` so the sequence and position are
  conveyed structurally, with the active step carrying `aria-current="step"`.

  Each step's state (complete / current / upcoming) is announced to assistive
  tech via a visually-hidden label — pass `stateLabels` to localise it (the
  portal feeds Wuchale strings here). Purely structural: no motion, so it is
  reduced-motion-safe by construction.

  @example
  <StatusTimeline
    label="Report progress"
    steps={[
      { label: "Submitted", status: "complete", timestamp: "12 May" },
      { label: "Under review", status: "complete", timestamp: "13 May" },
      { label: "In progress", status: "current", description: "Crew assigned" },
      { label: "Resolved", status: "upcoming" },
    ]}
  />

  @example Localised state labels (portal i18n)
  <StatusTimeline steps={steps} stateLabels={{ complete: "Concluído", current: "Atual", upcoming: "Pendente" }} />
-->
<script>
  /**
   * @typedef {'complete' | 'current' | 'upcoming'} StepStatus
   * @typedef {{ label: string, status?: StepStatus, description?: string, timestamp?: string }} Step
   */

  let {
    /** @type {Step[]} Ordered steps, earliest first. */
    steps = [],
    /** @type {string} Accessible name for the timeline list (localize it). */
    label = "Progress",
    /**
     * @type {Record<StepStatus, string>}
     * Visually-hidden state text announced per step (localize it).
     */
    stateLabels = {
      complete: "Completed",
      current: "Current step",
      upcoming: "Upcoming",
    },
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();

  /** @param {Step} step @returns {StepStatus} */
  const statusOf = (step) => step.status ?? "upcoming";
</script>

{#if steps.length > 0}
  <ol class="status-timeline {className}" aria-label={label} {...rest}>
    {#each steps as step, i (i)}
      {@const status = statusOf(step)}
      <li
        class="status-timeline-item status-timeline-item-{status}"
        aria-current={status === "current" ? "step" : undefined}
      >
        <span class="status-timeline-marker" aria-hidden="true">
          <span class="status-timeline-node"></span>
        </span>
        <div class="status-timeline-body">
          <span class="status-timeline-label">
            <span class="status-timeline-state">{stateLabels[status]}: </span>
            {step.label}
          </span>
          {#if step.timestamp}
            <span class="status-timeline-time">{step.timestamp}</span>
          {/if}
          {#if step.description}
            <p class="status-timeline-desc">{step.description}</p>
          {/if}
        </div>
      </li>
    {/each}
  </ol>
{/if}

<style>
  .status-timeline {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .status-timeline-item {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-md);
    padding-bottom: var(--space-lg);
  }
  .status-timeline-item:last-child {
    padding-bottom: 0;
  }

  /* Connector line down the marker column, drawn behind the nodes. It stops at
     the last node so the line never dangles past the final step. */
  .status-timeline-marker {
    position: relative;
    display: flex;
    justify-content: center;
    width: var(--space-md);
  }
  .status-timeline-item:not(:last-child) .status-timeline-marker::before {
    content: "";
    position: absolute;
    top: var(--space-md);
    bottom: calc(-1 * var(--space-lg));
    inset-inline-start: 50%;
    transform: translateX(-50%);
    width: var(--border-width-thick);
    background: var(--color-border);
  }
  /* A completed step's connector is filled to show progress reaching the next. */
  .status-timeline-item-complete:not(:last-child) .status-timeline-marker::before {
    background: var(--color-accent);
  }

  .status-timeline-node {
    position: relative;
    z-index: 1;
    width: var(--space-md);
    height: var(--space-md);
    border-radius: var(--radius-circle);
    background: var(--color-surface);
    box-shadow: inset 0 0 0 var(--border-width-thick) var(--color-border);
  }
  .status-timeline-item-complete .status-timeline-node {
    background: var(--color-accent);
    box-shadow: inset 0 0 0 var(--border-width-thick) var(--color-accent);
  }
  .status-timeline-item-current .status-timeline-node {
    background: var(--color-surface);
    box-shadow:
      inset 0 0 0 var(--border-width-thick) var(--color-accent),
      0 0 0 var(--border-width-thick) var(--color-accent-subtle);
  }

  .status-timeline-body {
    padding-top: calc((var(--space-md) - 1em) / 2);
    min-width: 0;
  }

  .status-timeline-label {
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    color: var(--color-text-secondary);
  }
  .status-timeline-item-current .status-timeline-label,
  .status-timeline-item-complete .status-timeline-label {
    color: var(--color-text);
  }
  .status-timeline-item-current .status-timeline-label {
    font-weight: var(--raw-font-weight-semibold);
  }

  /* State text is for assistive tech only — the visual node carries it sighted. */
  .status-timeline-state {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .status-timeline-time {
    display: block;
    margin-top: var(--space-2xs);
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    color: var(--color-text-muted);
  }

  .status-timeline-desc {
    margin: var(--space-2xs) 0 0;
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    color: var(--color-text-secondary);
  }
</style>
