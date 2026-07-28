<!--
  @component SealChip

  Renders a value paired with its evidence seal as ONE phrase.

  The seal must survive quotation: an sr-only span adjacent to the value
  carries the evidence state word so copying or citing the value also
  carries the seal (prd.md §5.1 #5: "a citation carries the seal of the
  value it cites").

  DS-owned evidence vocabulary: measured | inferred | projected.
  Built over --badge-* + --seal-* component tokens.

  H1 Slice 2 — westeuropeco/atelier-urban-workspace#57.

  @example Measured reading
  <SealChip value="2.3 MW" evidence="measured" />

  @example Projected (future window)
  <SealChip value="4.1 MW" evidence="projected" />

  @example Stale seal (horizon has passed)
  <SealChip value="1.9 MW" evidence="projected" stale />
-->
<script>
  /**
   * @typedef {'measured' | 'inferred' | 'projected'} EvidenceState
   */

  let {
    /** @type {string} — the formatted display value */
    value,
    /** @type {EvidenceState} — evidence state (from assignSeal) */
    evidence,
    /** @type {boolean} — true when the validity window has passed */
    stale = false,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const EVIDENCE_LABELS = /** @type {Record<EvidenceState, string>} */ ({
    measured: 'measured',
    inferred: 'inferred',
    projected: 'projected',
  });

  const evidenceLabel = $derived(EVIDENCE_LABELS[evidence] ?? evidence);

  /** Label as spoken by AT and included in citations. */
  const srLabel = $derived(stale ? `${evidenceLabel} (stale)` : evidenceLabel);
</script>

<!--
  The chip is one inline phrase. Structure:
    [value text]
    [visual badge — aria-hidden, not read by AT]
    [sr-only span — read by AT; position:absolute but in DOM so text
     travels with the value when the surrounding content is copied]
-->
<span
  class="seal-chip seal-chip-{evidence} {stale ? 'seal-chip-stale' : ''} {className}"
  {...rest}
>
  <span class="seal-chip-value">{value}</span><!--
  --><span class="seal-chip-badge" aria-hidden="true">{evidenceLabel}{stale ? ' (stale)' : ''}</span><!--
  --><span class="seal-chip-sr-text">&thinsp;{srLabel}</span>
</span>

<style>
  .seal-chip {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-xs);
    position: relative;
  }

  /* Value text: no override — reads as its context's surrounding type */
  .seal-chip-value {
    /* intentionally empty */
  }

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
