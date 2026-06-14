<!--
  @component PhaseTimeline

  Scheduled-phase timeline for the citizen portal — the spine of a phase-driven
  process (participatory budgeting: submission → analysis → voting → execution;
  but equally an SLA cycle, a maintenance plan, or an energy-tariff window).

  Distinct from StatusTimeline: StatusTimeline tracks a single item's PROGRESS
  (submitted → resolved). PhaseTimeline shows a SCHEDULE — each phase carries a
  date window and a derived state (closed / open / upcoming), and one phase is
  marked the authoritative current phase. The state is computed by the caller
  from the window dates against the request clock so the widget itself is
  clock-free (SSR-stable, reduced-motion-safe — no animation).

  Renders an `<ol>` so order and position are structural; the current phase
  carries `aria-current="step"`, and each phase's state is announced via a
  visually-hidden label (pass `stateLabels` to localise — the portal feeds
  Wuchale strings here).

  @example
  <PhaseTimeline
    label="Participatory budgeting calendar"
    phases={[
      { label: "Proposals", status: "closed", window: "1–31 Mar" },
      { label: "Analysis", status: "closed", window: "1–15 Apr" },
      { label: "Voting", status: "open", current: true, window: "16–30 Apr", description: "Vote now" },
      { label: "Execution", status: "upcoming", window: "from 1 Jun" },
    ]}
  />

  @example Localised state labels (portal i18n)
  <PhaseTimeline phases={phases} stateLabels={{ closed: "Encerrada", open: "A decorrer", upcoming: "Brevemente" }} openBadge="A decorrer" />
-->
<script>
  /**
   * @typedef {'closed' | 'open' | 'upcoming'} PhaseStatus
   * @typedef {{ label: string, status?: PhaseStatus, window?: string, current?: boolean, description?: string }} Phase
   */

  let {
    /** @type {Phase[]} Ordered phases, earliest first. */
    phases = [],
    /** @type {string} Accessible name for the timeline list (localize it). */
    label = "Phases",
    /**
     * @type {Record<PhaseStatus, string>}
     * Visually-hidden state text announced per phase (localize it).
     */
    stateLabels = {
      closed: "Closed",
      open: "Open now",
      upcoming: "Upcoming",
    },
    /** @type {string} Visible badge text on the open phase (localize it). */
    openBadge = "Open now",
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();

  /** @param {Phase} phase @returns {PhaseStatus} */
  const statusOf = (phase) => phase.status ?? "upcoming";
</script>

{#if phases.length > 0}
  <ol class="phase-timeline {className}" aria-label={label} {...rest}>
    {#each phases as phase, i (i)}
      {@const status = statusOf(phase)}
      <li
        class="phase-timeline-item phase-timeline-item-{status}"
        class:phase-timeline-item-current={phase.current}
        aria-current={phase.current ? "step" : undefined}
      >
        <span class="phase-timeline-marker" aria-hidden="true">
          <span class="phase-timeline-node"></span>
        </span>
        <div class="phase-timeline-body">
          <span class="phase-timeline-label">
            <span class="phase-timeline-state">{stateLabels[status]}: </span>
            {phase.label}
            {#if status === "open"}
              <span class="phase-timeline-badge">{openBadge}</span>
            {/if}
          </span>
          {#if phase.window}
            <span class="phase-timeline-window">{phase.window}</span>
          {/if}
          {#if phase.description}
            <p class="phase-timeline-desc">{phase.description}</p>
          {/if}
        </div>
      </li>
    {/each}
  </ol>
{/if}

<style>
  .phase-timeline {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .phase-timeline-item {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-md);
    padding-bottom: var(--space-lg);
  }
  .phase-timeline-item:last-child {
    padding-bottom: 0;
  }

  /* Connector line down the marker column, behind the nodes; stops at the last
     node so it never dangles past the final phase. */
  .phase-timeline-marker {
    position: relative;
    display: flex;
    justify-content: center;
    width: var(--space-md);
  }
  .phase-timeline-item:not(:last-child) .phase-timeline-marker::before {
    content: "";
    position: absolute;
    top: var(--space-md);
    bottom: calc(-1 * var(--space-lg));
    inset-inline-start: 50%;
    transform: translateX(-50%);
    width: var(--border-width-thick);
    background: var(--color-border);
  }
  /* A closed (past) phase's connector is filled — the schedule has advanced. */
  .phase-timeline-item-closed:not(:last-child) .phase-timeline-marker::before {
    background: var(--color-accent);
  }

  .phase-timeline-node {
    position: relative;
    z-index: 1;
    width: var(--space-md);
    height: var(--space-md);
    border-radius: var(--radius-circle);
    background: var(--color-surface);
    box-shadow: inset 0 0 0 var(--border-width-thick) var(--color-border);
  }
  .phase-timeline-item-closed .phase-timeline-node {
    background: var(--color-accent);
    box-shadow: inset 0 0 0 var(--border-width-thick) var(--color-accent);
  }
  .phase-timeline-item-open .phase-timeline-node {
    background: var(--color-surface);
    box-shadow:
      inset 0 0 0 var(--border-width-thick) var(--color-accent),
      0 0 0 var(--border-width-thick) var(--color-accent-subtle);
  }

  .phase-timeline-body {
    padding-top: calc((var(--space-md) - 1em) / 2);
    min-width: 0;
  }

  .phase-timeline-label {
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    color: var(--color-text-secondary);
  }
  .phase-timeline-item-open .phase-timeline-label,
  .phase-timeline-item-closed .phase-timeline-label {
    color: var(--color-text);
  }
  .phase-timeline-item-current .phase-timeline-label {
    font-weight: var(--raw-font-weight-semibold);
    color: var(--color-text);
  }

  /* Sighted affordance that the open phase is actionable now. */
  .phase-timeline-badge {
    display: inline-block;
    margin-inline-start: var(--space-2xs);
    padding: var(--space-3xs, 0.125rem) var(--space-2xs);
    border-radius: var(--radius-sm);
    background: var(--color-accent-subtle);
    color: var(--color-accent);
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    font-weight: var(--raw-font-weight-semibold);
    vertical-align: middle;
  }

  /* State text is for assistive tech only — the node + badge carry it sighted. */
  .phase-timeline-state {
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

  .phase-timeline-window {
    display: block;
    margin-top: var(--space-2xs);
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    color: var(--color-text-muted);
  }

  .phase-timeline-desc {
    margin: var(--space-2xs) 0 0;
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    color: var(--color-text-secondary);
  }
</style>
