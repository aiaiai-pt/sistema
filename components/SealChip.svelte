<!--
  @component SealChip

  The one seal renderer for every value surface — KPI registers, map badges,
  paths-strip columns, record lines, citations, saved projections, briefs.
  No surface renders a seal any other way.

  TWO ORTHOGONAL AXES, never merged into one phrase:
    evidence     measured | inferred | projected   (always present)
    probability  probable | uncertain              (only when a source fills it)
  Evidence alone is valid; probability alone is not.

  The seal is a property of the datum, not chart styling — so it is adjacent
  DOM text: sweepable, copy-paste-able, and surviving quotation. Value and seal
  read to a screen reader as ONE stitched phrase:
  «{value} — {evidence}[, {probability}][, stale]».

  A «why» is always one click away: the chip becomes a real button with
  aria-expanded that opens the provenance one-liner.

  H1 Slice 2 — westeuropeco/atelier-urban-workspace#57.
  Build contract: workspace-design/03-evidence.md §1.1, §2.

  @example Measured reading
  <SealChip value="+14 cm/h" evidence="measured" />

  @example Projected, with the why one click away
  <SealChip
    value="−18 cm"
    evidence="projected"
    why="derived from the 14:00–16:00 tide model run"
  />

  @example Both axes populated, horizon passed
  <SealChip value="2,1 m" evidence="inferred" probability="uncertain" stale />
-->
<script>
  /**
   * @typedef {'measured' | 'inferred' | 'projected'} EvidenceState
   * @typedef {'probable' | 'uncertain'} Probability
   */

  let {
    /** @type {string} — the formatted display value */
    value,
    /** @type {EvidenceState} — evidence state (from assignSeal) */
    evidence,
    /**
     * @type {Probability | undefined}
     * The second axis. Orthogonal to evidence and rendered as its own adjacent
     * chip — the two never merge into one phrase. No H1 data source populates
     * it; the slot exists so that a source can, without an API change.
     */
    probability = undefined,
    /** @type {boolean} — true when the validity window has passed */
    stale = false,
    /**
     * @type {string | undefined}
     * The provenance one-liner behind the seal. When supplied, the chip is a
     * real button that discloses this text — the «why», one click away.
     */
    why = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const EVIDENCE_LABELS = /** @type {Record<EvidenceState, string>} */ ({
    measured: 'measured',
    inferred: 'inferred',
    projected: 'projected',
  });

  const PROBABILITY_LABELS = /** @type {Record<Probability, string>} */ ({
    probable: 'probable',
    uncertain: 'uncertain',
  });

  /** The closed vocabularies. Nothing outside them may render as a seal. */
  const EVIDENCE_STATES = Object.keys(EVIDENCE_LABELS);
  const PROBABILITY_STATES = Object.keys(PROBABILITY_LABELS);

  /**
   * BOUNDARY GUARD — "a seal never appears without evidence chips."
   *
   * Without this, an absent `evidence` renders an empty badge and an empty
   * sr-text: a value dressed as a sealed datum that carries no evidence and
   * announces nothing to a screen reader. An out-of-vocabulary word would
   * render verbatim as the seal label. Both are silent failures of the law,
   * so the chip refuses to mount instead — the same policy KpiRegister
   * applies to an unsealed projection.
   */
  const assertSeal = (
    /** @type {unknown} */ state,
    /** @type {unknown} */ likelihood,
  ) => {
    if (typeof state !== 'string' || !EVIDENCE_STATES.includes(state)) {
      throw new Error(
        '[SealChip] A sealed value must carry an evidence state — one of ' +
          `${EVIDENCE_STATES.join(' | ')}. Received ${JSON.stringify(state)}. ` +
          'A seal never appears without its evidence chip; take the state from assignSeal().',
      );
    }
    if (
      likelihood !== undefined &&
      (typeof likelihood !== 'string' || !PROBABILITY_STATES.includes(likelihood))
    ) {
      throw new Error(
        '[SealChip] The probability axis is a closed vocabulary — one of ' +
          `${PROBABILITY_STATES.join(' | ')}. Received ${JSON.stringify(likelihood)}.`,
      );
    }
  };

  assertSeal(evidence, probability);
  $effect(() => assertSeal(evidence, probability));

  const evidenceLabel = $derived(EVIDENCE_LABELS[evidence] ?? evidence);
  const probabilityLabel = $derived(
    probability === undefined ? undefined : PROBABILITY_LABELS[probability],
  );

  /**
   * The stitched phrase AT reads and a citation carries:
   * «{value} — {evidence}[, {probability}][, stale]».
   */
  const srPhrase = $derived(
    [
      `${value} — ${evidenceLabel}`,
      probabilityLabel,
      stale ? 'stale' : undefined,
    ]
      .filter(Boolean)
      .join(', '),
  );

  /** Disclosure state lives here, never in a DOM attribute. */
  let open = $state(false);
  /** @type {HTMLButtonElement | undefined} */
  let trigger = $state();

  const panelId = $props.id();

  const closeWhy = () => {
    open = false;
    trigger?.focus();
  };

  /** Esc anywhere inside the open disclosure closes it (cascade slot 2). */
  const onDocumentKeydown = (/** @type {KeyboardEvent} */ event) => {
    if (event.key === 'Escape' && open) closeWhy();
  };
</script>

<svelte:document onkeydown={onDocumentKeydown} />

{#snippet chips()}
  <span class="seal-chip-badge" aria-hidden="true"
    >{evidenceLabel}{stale ? ' (stale)' : ''}</span
  >{#if probabilityLabel}<span class="seal-chip-probability" aria-hidden="true"
      >{probabilityLabel}</span
    >{/if}
{/snippet}

<!--
  One inline phrase. The visible value and chips are aria-hidden so the
  stitched sr-text is the single thing announced — nothing reads twice.
  The sr-text follows the value in DOM order, so a sweep or a copy captures
  «value seal» in that order.
-->
<span
  class="seal-chip seal-chip-{evidence} {stale
    ? 'seal-chip-stale'
    : ''} {className}"
  {...rest}
>
  <span class="seal-chip-value" aria-hidden="true">{value}</span><!--
  -->{#if why}<button
      type="button"
      class="seal-chip-why-trigger"
      aria-expanded={open}
      aria-controls={panelId}
      aria-label="why — {evidenceLabel}"
      bind:this={trigger}
      onclick={() => (open = !open)}>{@render chips()}</button
    >{:else}{@render chips()}{/if}<!--
  --><span class="seal-chip-sr-text">&thinsp;{srPhrase}</span>

  {#if why && open}
    <span id={panelId} class="seal-chip-why-panel">
      <span class="seal-chip-why-text">{why}</span>
      <button
        type="button"
        class="seal-chip-why-close"
        aria-label="Close why"
        onclick={closeWhy}>×</button
      >
    </span>
  {/if}
</span>

<style>
  .seal-chip {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-xs);
    position: relative;
  }

  /* Value text carries no override — it reads as its surrounding type. */

  /* Visual evidence badge — seen by sighted users; hidden from AT */
  .seal-chip-badge {
    display: inline-flex;
    align-items: center;
    font-family: var(--badge-font);
    font-size: var(--badge-size);
    letter-spacing: var(--badge-tracking);
    border-radius: var(--badge-radius);
    padding: var(--badge-padding-y) var(--badge-padding-x);
    white-space: nowrap;
    line-height: 1;
  }

  /*
   * Probability chip — the second axis, always its own element beside the
   * evidence chip so the two never merge into one phrase.
   *
   * Deliberately NEUTRAL badge tokens rather than per-word --seal-probable-*
   * / --seal-uncertain-* semantic tokens: minting those would deepen the
   * DS-owns-the-vocabulary commitment while Fork B is still the operator's
   * open call. Neutral tokens keep both outcomes of that fork cheap.
   */
  .seal-chip-probability {
    display: inline-flex;
    align-items: center;
    font-family: var(--badge-font);
    font-size: var(--badge-size);
    letter-spacing: var(--badge-tracking);
    border-radius: var(--badge-radius);
    padding: var(--badge-padding-y) var(--badge-padding-x);
    margin-left: var(--space-2xs);
    white-space: nowrap;
    line-height: 1;
    background: var(--badge-neutral-bg);
    color: var(--badge-neutral-text);
  }

  /* Evidence-state colours via --seal-* component tokens */
  .seal-chip-measured .seal-chip-badge {
    color: var(--seal-measured-text);
    background: var(--seal-measured-bg);
  }

  .seal-chip-inferred .seal-chip-badge {
    color: var(--seal-inferred-text);
    background: var(--seal-inferred-bg);
  }

  .seal-chip-projected .seal-chip-badge {
    color: var(--seal-projected-text);
    background: var(--seal-projected-bg);
  }

  /* Stale modifier: muted on all evidence states */
  .seal-chip-stale .seal-chip-badge {
    color: var(--seal-stale-text);
    background: var(--seal-stale-bg);
  }

  /*
   * The why trigger is a real button wrapping the chips — the whole seal is
   * the affordance, so the «why» is one click away from the seal itself.
   * It carries no chrome of its own; the chips inside are the visible surface.
   */
  .seal-chip-why-trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2xs);
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
    cursor: pointer;
  }

  .seal-chip-why-trigger:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    border-radius: var(--radius-sm);
  }

  /* The provenance one-liner. Plain text plus a visible close (Esc/X parity). */
  .seal-chip-why-panel {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1;
    display: inline-flex;
    align-items: flex-start;
    gap: var(--space-xs);
    margin-top: var(--space-2xs);
    padding: var(--space-xs) var(--space-sm);
    max-width: 32ch;
    border: var(--elevation-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-secondary);
    color: var(--color-text-secondary);
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    font-weight: var(--type-caption-weight);
    line-height: var(--type-caption-leading);
    letter-spacing: var(--type-caption-tracking);
    text-align: left;
  }

  .seal-chip-why-close {
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    line-height: 1;
    color: inherit;
    cursor: pointer;
  }

  .seal-chip-why-close:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    border-radius: var(--radius-sm);
  }

  /*
   * sr-only — visually hidden but present in the DOM so the text travels
   * with the value when content is copied or cited (prd.md §5.1 #5).
   * clip-path: inset(50%) is the modern replacement for deprecated clip: rect().
   */
  .seal-chip-sr-text {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>
